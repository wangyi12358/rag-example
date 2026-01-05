import { prisma } from '@/server/lib/prisma';
import { factory } from '../factory';

export const prismaMiddleware = factory.createMiddleware(async (c, next) => {
  c.set('db', prisma);
  await next();
});
