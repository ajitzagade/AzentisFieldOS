import { describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../auth/current-user.decorator';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const OWNER: AuthUser = { id: 'u1', role: 'OWNER_ADMIN' };

describe('SearchController', () => {
  it('forwards the q query param and the caller role to SearchService.search', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search(OWNER, 'cement');

    expect(search).toHaveBeenCalledWith('cement', 'OWNER_ADMIN');
  });

  it('forwards an undefined q as an empty string', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search(OWNER, undefined);

    expect(search).toHaveBeenCalledWith('', 'OWNER_ADMIN');
  });

  it('uses only the first value when a duplicate ?q= produces an array, instead of passing the array through', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search(OWNER, ['cement', 'steel']);

    expect(search).toHaveBeenCalledWith('cement', 'OWNER_ADMIN');
  });

  it('forwards a SITE_SUPERVISOR role as-is, letting SearchService decide what to gate', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);
    const supervisor: AuthUser = { id: 'u2', role: 'SITE_SUPERVISOR' };

    await controller.search(supervisor, 'cement');

    expect(search).toHaveBeenCalledWith('cement', 'SITE_SUPERVISOR');
  });
});
