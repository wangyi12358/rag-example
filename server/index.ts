import type { Env } from "hono";
import { Hono } from "hono";
import { prismaMiddleware } from "./middlewares/prisma";
import { chatRoute } from "./routers/chat/route";
import { knowledgeChunkRoute } from "./routers/knowledge-chunk/route";

export const app = new Hono<Env>()
	.use(prismaMiddleware)
	.route("/api/knowledge-chunk", knowledgeChunkRoute)
	.route("/api/chat", chatRoute);
