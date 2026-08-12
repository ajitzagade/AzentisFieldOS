import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// The sole PrismaClient instance in the whole codebase (architecture spine
// AD-3) — apps/web must never import the generated client directly; it
// talks to apps/api over HTTP instead.
//
// Uses @prisma/adapter-pg (the plain `pg` driver) rather than
// @prisma/adapter-neon: apps/api runs as a normal long-lived Node process,
// not an edge/serverless function, so Neon's serverless-specific adapter
// buys nothing here — and `pg` works identically against local/CI Postgres
// and production Neon, since Neon speaks the standard Postgres wire
// protocol either way.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

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
