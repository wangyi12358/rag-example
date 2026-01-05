import { hc } from "hono/client";
import type { app } from "@/server";

export const honoRpc = hc<typeof app>("/");
