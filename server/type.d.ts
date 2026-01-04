import type { Member, PrismaClient } from '~/generated/prisma';
import type { auth } from '~/lib/auth';

export interface Env {
  Variables: {
    db: PrismaClient
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    member: Member | null
    jwtPayload: Member | null
  }
}
