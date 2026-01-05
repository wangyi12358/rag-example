import { zValidator } from "@hono/zod-validator";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { OpenRouter } from "@openrouter/sdk";
import { generateText, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { factory } from "@/server/factory";

const openRouter = new OpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const openRouterProvider = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY || "",
});

export const chatRoute = factory.createApp().post(
	"/",
	zValidator(
		"json",
		z.object({
			messages: z.array(z.custom<UIMessage>()),
		}),
	),
	async (c) => {
		const { messages } = c.req.valid("json");
		const question = messages[messages.length - 1].parts
			.map((part) => (part.type === "text" ? part.text : part.type))
			.join("");
		const db = c.get("db");
		const topK = 3;

		console.log("question==", question);

		// 生成问题的嵌入向量
		const response = await openRouter.embeddings.generate({
			model: "qwen/qwen3-embedding-8b",
			input: question,
		});

		// OpenRouter 返回的格式可能是 { data: [...] } 或直接是数组
		const embeddingData = Array.isArray(response)
			? response[0]
			: (response as { data?: Array<{ embedding?: number[] }> })?.data?.[0];

		const questionEmbedding = embeddingData?.embedding;
		if (!questionEmbedding || !Array.isArray(questionEmbedding)) {
			return c.json({ error: "Failed to generate embedding" }, 500);
		}

		// 将向量数组转换为 PostgreSQL vector 格式
		const vectorString = `[${questionEmbedding.join(",")}]`;

		// 使用余弦相似度搜索最相似的文档
		// 使用 1 - (embedding <=> $1::vector) 来计算余弦相似度
		// <=> 是余弦距离，值越小越相似
		const similarChunks = await db.$queryRawUnsafe<
			Array<{
				id: bigint;
				content: string;
				similarity: number;
				metadata: unknown;
			}>
		>(
			`SELECT 
          id,
          content,
          metadata,
          1 - (embedding <=> $1::vector) as similarity
         FROM knowledge_chunks
         ORDER BY embedding <=> $1::vector
				 LIMIT $2
				 `,
			vectorString,
			topK,
		);

		if (similarChunks.length === 0) {
			return c.json({
				answer: "抱歉，我没有找到相关的信息来回答您的问题。",
				context: [],
			});
		}

		// 构建上下文
		const context = similarChunks
			.map((chunk: { content: string }) => chunk.content)
			.join("\n\n");

		console.log("context start");
		console.log(context);
		console.log("context end");

		// 使用 LLM 生成回答
		const res = await streamText({
			model: openRouterProvider("openai/gpt-4o-mini"),
			messages: [
				{
					role: "system",
					content:
						"你是一个有用的助手。请根据提供的上下文信息回答用户的问题。如果上下文中没有相关信息，请诚实地说不知道。",
				},
				{
					role: "user",
					content: `上下文信息：\n${context}\n\n问题：${question}\n\n请根据上下文信息回答问题：`,
				},
			],
			temperature: 0.7,
		});

		return res.toUIMessageStreamResponse();
	},
);
