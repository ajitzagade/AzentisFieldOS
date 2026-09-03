import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// The sole PrismaClient instance in the whole codebase (architecture spine
// AD-3) — apps/web must never import the generated client directly; it
// talks to apps/api over HTTP instead.
//
// Uses @prisma/adapter-pg (the plain `pg` driver) rather than
// @prisma/adapter-neon: `pg` works identically against local/CI Postgres and
// production Neon, since Neon speaks the standard Postgres wire protocol
// either way, with no need for @prisma/adapter-neon's WebSocket-based
// serverless-specific transport.
//
// apps/api IS deployed as a Vercel Function (apps/api/vercel.json), not a
// long-lived process — each concurrent/cold-started Function instance
// creates its own PrismaService, and therefore its own `pg.Pool` here.
// `pg`'s own default (`max: 10`) is sized for one long-lived server owning
// the DB's whole connection budget, not N short-lived instances each
// opening their own pool concurrently — left at the default, a burst of
// concurrent invocations can exhaust Postgres's connection limit well
// before any single instance's traffic alone would justify it. A small,
// explicit, env-overridable cap keeps each instance's footprint
// predictable regardless of how many instances Vercel runs at once.
const DEFAULT_POOL_MAX = 5;

// Unlike a plain `Number(...) || fallback`, this rejects a misconfigured
// negative/fractional value instead of silently passing it to pg.Pool, and
// treats an explicit `0` the same as any other invalid value rather than
// `||`'s accidental (0 is falsy) but unintentional fallback-to-default.
function poolMax(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_POOL_MAX;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: poolMax(process.env.DATABASE_POOL_MAX),
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
