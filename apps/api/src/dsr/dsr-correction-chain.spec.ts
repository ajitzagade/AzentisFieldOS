import { describe, expect, it, vi } from 'vitest';
import {
  getSubmissionChain,
  getSubmissionChainFromAnyVersion,
  type ChainRow,
} from './dsr-correction-chain';

// spec-daily-reports-list-and-edit: I/O matrix rows 1-3 ("Never edited",
// "Edited once", "Edited twice") exercised directly against the shared
// chain-walk, independent of listAllSubmitted/findOne's own plumbing.
function makePrisma(ancestorsById: Record<string, ChainRow>) {
  const findUnique = vi.fn(({ where }: { where: { id: string } }) =>
    Promise.resolve(ancestorsById[where.id] ?? null),
  );
  return { prisma: { dailySiteReport: { findUnique } }, findUnique };
}

describe('getSubmissionChain', () => {
  it("never edited: a single version, submittedAt equals the row's own createdAt", async () => {
    const { prisma } = makePrisma({});
    const original: ChainRow = {
      id: 'O',
      createdAt: new Date('2026-09-01T08:00:00.000Z'),
      correctsId: null,
      reason: null,
      submittedBy: { name: 'Asha' },
    };

    const result = await getSubmissionChain(prisma as never, original);

    expect(result.submittedAt).toEqual(original.createdAt);
    expect(result.versions).toEqual([
      {
        id: 'O',
        createdAt: original.createdAt,
        submittedByName: 'Asha',
        reason: null,
      },
    ]);
  });

  it('edited once: walks back one hop to the root, oldest -> newest', async () => {
    const oCreatedAt = new Date('2026-09-01T08:00:00.000Z');
    const c1CreatedAt = new Date('2026-09-02T09:00:00.000Z');
    const { prisma, findUnique } = makePrisma({
      O: {
        id: 'O',
        createdAt: oCreatedAt,
        correctsId: null,
        reason: null,
        submittedBy: { name: 'Asha' },
      },
    });
    const current: ChainRow = {
      id: 'C1',
      createdAt: c1CreatedAt,
      correctsId: 'O',
      reason: 'Fixed crew count',
      submittedBy: { name: 'Ravi' },
    };

    const result = await getSubmissionChain(prisma as never, current);

    expect(result.submittedAt).toEqual(oCreatedAt);
    expect(result.versions.map((v) => v.id)).toEqual(['O', 'C1']);
    expect(result.versions[1]).toEqual({
      id: 'C1',
      createdAt: c1CreatedAt,
      submittedByName: 'Ravi',
      reason: 'Fixed crew count',
    });
    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it('edited twice: a 2-hop walk still resolves the true root', async () => {
    const oCreatedAt = new Date('2026-09-01T08:00:00.000Z');
    const c1CreatedAt = new Date('2026-09-02T08:00:00.000Z');
    const c2CreatedAt = new Date('2026-09-03T08:00:00.000Z');
    const { prisma, findUnique } = makePrisma({
      O: {
        id: 'O',
        createdAt: oCreatedAt,
        correctsId: null,
        reason: null,
        submittedBy: { name: 'Asha' },
      },
      C1: {
        id: 'C1',
        createdAt: c1CreatedAt,
        correctsId: 'O',
        reason: 'Fixed crew count',
        submittedBy: { name: 'Ravi' },
      },
    });
    const current: ChainRow = {
      id: 'C2',
      createdAt: c2CreatedAt,
      correctsId: 'C1',
      reason: 'Fixed materials',
      submittedBy: { name: 'Priya' },
    };

    const result = await getSubmissionChain(prisma as never, current);

    expect(result.submittedAt).toEqual(oCreatedAt);
    expect(result.versions.map((v) => v.id)).toEqual(['O', 'C1', 'C2']);
    expect(findUnique).toHaveBeenCalledTimes(2);
  });

  it('stops gracefully (never throws) if an ancestor id has vanished', async () => {
    const { prisma } = makePrisma({});
    const current: ChainRow = {
      id: 'C1',
      createdAt: new Date('2026-09-02T00:00:00.000Z'),
      correctsId: 'missing-root',
      reason: 'x',
      submittedBy: { name: 'Ravi' },
    };

    const result = await getSubmissionChain(prisma as never, current);

    expect(result.versions.map((v) => v.id)).toEqual(['C1']);
  });
});

// Review fix: findOne(id) can be asked for ANY version in a chain, not just
// the tip. getSubmissionChain alone (backward-only) would silently omit
// every version newer than the one loaded — this walks forward to the tip
// first, then delegates to the same backward walk.
describe('getSubmissionChainFromAnyVersion', () => {
  function makeChainRow(
    overrides: Partial<ChainRow> & { id: string },
  ): ChainRow {
    return {
      createdAt: new Date('2026-09-01T00:00:00.000Z'),
      correctsId: null,
      reason: null,
      submittedBy: { name: 'Someone' },
      ...overrides,
    };
  }

  // Both findUnique (backward walk, by id) and findFirst (forward walk, by
  // correctsId) are needed for this function, unlike getSubmissionChain's
  // findUnique-only mock above.
  function makeChainPrisma(rowsById: Record<string, ChainRow>) {
    const findUnique = vi.fn(({ where }: { where: { id: string } }) =>
      Promise.resolve(rowsById[where.id] ?? null),
    );
    const findFirst = vi.fn(({ where }: { where: { correctsId: string } }) =>
      Promise.resolve(
        Object.values(rowsById).find(
          (r) => r.correctsId === where.correctsId,
        ) ?? null,
      ),
    );
    return {
      prisma: { dailySiteReport: { findUnique, findFirst } },
      findUnique,
      findFirst,
    };
  }

  it('resolves the full chain [O, C1, C2] when called with the MIDDLE version (C1), not just its ancestors', async () => {
    const O = makeChainRow({
      id: 'O',
      createdAt: new Date('2026-09-01T08:00:00.000Z'),
    });
    const C1 = makeChainRow({
      id: 'C1',
      createdAt: new Date('2026-09-02T08:00:00.000Z'),
      correctsId: 'O',
      reason: 'Fixed crew count',
      submittedBy: { name: 'Ravi' },
    });
    const C2 = makeChainRow({
      id: 'C2',
      createdAt: new Date('2026-09-03T08:00:00.000Z'),
      correctsId: 'C1',
      reason: 'Fixed materials',
      submittedBy: { name: 'Priya' },
    });
    const { prisma } = makeChainPrisma({ O, C1, C2 });

    // Called with C1 — a middle version, not the tip.
    const result = await getSubmissionChainFromAnyVersion(prisma as never, C1);

    expect(result.versions.map((v) => v.id)).toEqual(['O', 'C1', 'C2']);
    expect(result.submittedAt).toEqual(O.createdAt);
  });

  it('is a no-op forward walk when already called with the tip (matches getSubmissionChain)', async () => {
    const O = makeChainRow({
      id: 'O',
      createdAt: new Date('2026-09-01T08:00:00.000Z'),
    });
    const C1 = makeChainRow({
      id: 'C1',
      createdAt: new Date('2026-09-02T08:00:00.000Z'),
      correctsId: 'O',
      reason: 'Fixed crew count',
      submittedBy: { name: 'Ravi' },
    });
    const { prisma, findFirst } = makeChainPrisma({ O, C1 });

    const result = await getSubmissionChainFromAnyVersion(prisma as never, C1);

    expect(result.versions.map((v) => v.id)).toEqual(['O', 'C1']);
    // One findFirst call confirms there's nothing newer than C1, then stops.
    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it('never edited: behaves exactly like getSubmissionChain for a single-version report', async () => {
    const O = makeChainRow({ id: 'O' });
    const { prisma } = makeChainPrisma({ O });

    const result = await getSubmissionChainFromAnyVersion(prisma as never, O);

    expect(result.versions.map((v) => v.id)).toEqual(['O']);
  });
});
