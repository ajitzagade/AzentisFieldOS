import { describe, expect, it, vi } from 'vitest';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  it('forwards the q query param to SearchService.search', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search('cement');

    expect(search).toHaveBeenCalledWith('cement');
  });

  it('forwards an undefined q as an empty string', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search(undefined);

    expect(search).toHaveBeenCalledWith('');
  });

  it('uses only the first value when a duplicate ?q= produces an array, instead of passing the array through', async () => {
    const search = vi.fn().mockResolvedValue({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
    const controller = new SearchController({
      search,
    } as unknown as SearchService);

    await controller.search(['cement', 'steel']);

    expect(search).toHaveBeenCalledWith('cement');
  });
});
