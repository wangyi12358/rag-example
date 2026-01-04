import type { Env } from 'hono';
import { Hono } from 'hono';

export const app = new Hono<Env>()