import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { OpenRouter } from "@openrouter/sdk";
import { streamText } from "ai";
import { prisma } from "@/server/lib/prisma";

const openRouter = new OpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const openRouterProvider = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
	try {
		const { messages } = await req.json();

		// 获取最后一条用户消息
		const lastMessage = messages[messages.length - 1];
		if (!lastMessage || lastMessage.role !== "user") {
			return new Response("Invalid request", { status: 400 });
		}

		const question = lastMessage.content;

		// 生成问题的嵌入向量
		const response = await openRouter.embeddings.generate({
			model: "openai/text-embedding-3-small",
			input: question,
		});

		// OpenRouter 返回的格式可能是 { data: [...] } 或直接是数组
		const embeddingData = Array.isArray(response)
			? response[0]
			: (response as { data?: Array<{ embedding?: number[] }> })?.data?.[0];

		const questionEmbedding = embeddingData?.embedding;
		if (!questionEmbedding || !Array.isArray(questionEmbedding)) {
			return new Response("Failed to generate embedding", { status: 500 });
		}

		// 将向量数组转换为 PostgreSQL vector 格式
		const vectorString = `[${questionEmbedding.join(",")}]`;

		// 使用余弦相似度搜索最相似的文档
		const similarChunks = await prisma.$queryRawUnsafe<
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
       LIMIT 3`,
			vectorString,
		);

		// 构建上下文
		const context =
			similarChunks.length > 0
				? similarChunks
						.map((chunk: { content: string }) => chunk.content)
						.join("\n\n")
				: "没有找到相关的上下文信息。";

		// 构建系统提示词，包含上下文信息
		const systemMessage = `你是一个有用的助手。请根据提供的上下文信息回答用户的问题。如果上下文中没有相关信息，请诚实地说不知道。

上下文信息：
${context}

请根据上下文信息回答问题。`;

		// 准备上下文数据
		const contextData = similarChunks.map((chunk) => ({
			id: chunk.id.toString(),
			content: chunk.content,
			similarity: chunk.similarity,
			metadata: chunk.metadata,
		}));

		// 使用 AI SDK 的 streamText 进行流式响应
		const result = await streamText({
			model: openRouterProvider("openai/gpt-4o-mini"),
			messages: [
				{
					role: "system",
					content: systemMessage,
				},
				...messages.slice(-5), // 只保留最近5条消息作为上下文
			],
			temperature: 0.7,
		});

		// 返回流式响应
		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Chat API error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
