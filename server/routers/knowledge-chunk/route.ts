import { zValidator } from "@hono/zod-validator";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import { factory } from "@/server/factory";

const openRouter = new OpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export const knowledgeChunkRoute = factory.createApp().post(
	"/",
	zValidator(
		"json",
		z.object({
			text: z.string(),
			metadata: z.record(z.string(), z.unknown()).optional(),
		}),
	),
	async (c) => {
		const { text, metadata } = c.req.valid("json");
		const db = c.get("db");
		// 生成嵌入向量
		const response = await openRouter.embeddings.generate({
			model: "qwen/qwen3-embedding-8b",
			input: text,
		});

		console.log(response);

		// OpenRouter 返回的格式可能是 { data: [...] } 或直接是数组
		const embeddingData = Array.isArray(response)
			? response[0]
			: (response as { data?: Array<{ embedding?: number[] }> })?.data?.[0];

		const embedding = embeddingData?.embedding;
		if (!embedding || !Array.isArray(embedding)) {
			return c.json({ error: "Failed to generate embedding" }, 500);
		}

		// 将向量数组转换为 PostgreSQL vector 格式: [0.1,0.2,0.3]
		const vectorString = `[${embedding.join(",")}]`;

		// 存储到数据库
		// 注意：Prisma 不支持直接操作 vector 类型，需要使用原始 SQL
		await db.$executeRawUnsafe(
			`INSERT INTO knowledge_chunks (content, embedding, metadata, "createdAt")
         VALUES ($1, $2::vector, $3::jsonb, NOW())`,
			text,
			vectorString,
			metadata ? JSON.stringify(metadata) : null,
		);

		return c.json({
			success: true,
			message: "Data stored successfully",
			embedding: embedding.slice(0, 5), // 只返回前5个维度作为示例
		});
	},
);
