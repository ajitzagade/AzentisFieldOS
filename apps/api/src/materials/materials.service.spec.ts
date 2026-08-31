import { describe, expect, it, vi } from 'vitest';
import { MaterialsService } from './materials.service';

function makeService(
  findMany: ReturnType<typeof vi.fn>,
  count?: ReturnType<typeof vi.fn>,
) {
  const prisma = { material: { findMany, count: count ?? vi.fn() } };
  return new MaterialsService(
    prisma as unknown as ConstructorParameters<typeof MaterialsService>[0],
  );
}

describe('MaterialsService.searchCandidates', () => {
  it('searches active Materials by name and includes Category for disambiguation, capped at 200', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'm1', name: 'Cement' }]);
    const count = vi.fn().mockResolvedValue(1);
    const service = makeService(findMany, count);

    const result = await service.searchCandidates('cement');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        name: { contains: 'cement', mode: 'insensitive' },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: 200,
    });
    expect(count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        name: { contains: 'cement', mode: 'insensitive' },
      },
    });
    expect(result).toEqual({
      candidates: [{ id: 'm1', name: 'Cement' }],
      total: 1,
    });
  });
});
