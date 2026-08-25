import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// PLACEHOLDER — no request-level auth is wired into apps/api yet (Epic 1
// story 1.5 scoped Clerk integration to apps/web only; apps/api session
// validation is future work). Every write that needs an authenticated
// user id (DSR submission, photo upload, ...) finds-or-creates this one,
// clearly-named system User rather than inventing a fake auth shim.
// Replace every call site with the real authenticated user id once
// apps/api validates a Clerk session per-request (AD-10) — do not mistake
// this for a real implementation.
export async function getPlaceholderUserId(
  prisma: PrismaService,
): Promise<string> {
  const email = 'system-placeholder@internal.local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  try {
    const created = await prisma.user.create({
      data: {
        // `name` renders as-is in Submitted By/Uploaded By columns end
        // users actually see — keep it presentable. The placeholder
        // nature is already unambiguous from `clerkId`/`email` below,
        // which are never rendered in the UI, and from this whole
        // function's purpose (see module comment).
        clerkId: 'system-placeholder',
        name: 'Field Team',
        email,
        role: 'OWNER_ADMIN',
      },
    });
    return created.id;
  } catch (error) {
    // Two concurrent callers can both see `existing` as null before either
    // commits (this function has no transaction/lock of its own — it's
    // called from call sites that aren't always already inside one). The
    // loser's create() throws P2002 on the unique email; re-fetch the
    // winner's row instead of letting that surface as an unhandled 500.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const winner = await prisma.user.findUniqueOrThrow({ where: { email } });
      return winner.id;
    }
    throw error;
  }
}
