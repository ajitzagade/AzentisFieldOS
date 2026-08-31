import { Injectable } from '@nestjs/common';
import type { SearchResponse } from '@azentisfieldos/shared';
import { SitesService } from '../sites/sites.service';
import { MaterialsService } from '../materials/materials.service';
import { rankByQuery } from './rank-by-query';

// How many results per group are shown inline — beyond this, the client
// shows a "See all N results" action instead of growing the popup
// (AC #4/#5: search never becomes a second, unbounded list).
const INLINE_LIMIT = 5;

// Story 16.2: one endpoint searching across every globally-searchable
// entity (today: Sites, active Materials). A blank query never hits the
// database (AC #6 — the empty search box shows nothing, never a spinner
// with nothing to load).
@Injectable()
export class SearchService {
  constructor(
    private readonly sites: SitesService,
    private readonly materials: MaterialsService,
  ) {}

  async search(q: string): Promise<SearchResponse> {
    const query = q?.trim() ?? '';
    if (!query) {
      return {
        sites: { results: [], total: 0 },
        materials: { results: [], total: 0 },
      };
    }

    // One group's failure (e.g. a slow/erroring Materials query) must not
    // blank out a group that succeeded — Promise.allSettled isolates each
    // entity's search, falling back to an empty group rather than failing
    // the whole response.
    const emptyGroup = { candidates: [], total: 0 };
    const [siteSettled, materialSettled] = await Promise.allSettled([
      this.sites.searchCandidates(query),
      this.materials.searchCandidates(query),
    ]);
    const siteResult =
      siteSettled.status === 'fulfilled' ? siteSettled.value : emptyGroup;
    const materialResult =
      materialSettled.status === 'fulfilled'
        ? materialSettled.value
        : emptyGroup;

    const rankedSites = rankByQuery(siteResult.candidates, query, (site) => [
      site.name,
      site.location,
      site.contractReference ?? '',
    ]).slice(0, INLINE_LIMIT);
    const rankedMaterials = rankByQuery(
      materialResult.candidates,
      query,
      (material) => material.name,
    ).slice(0, INLINE_LIMIT);

    return {
      sites: {
        results: rankedSites.map((site) => ({
          id: site.id,
          name: site.name,
          location: site.location,
          contractReference: site.contractReference,
        })),
        total: siteResult.total,
      },
      materials: {
        results: rankedMaterials.map((material) => ({
          id: material.id,
          name: material.name,
          category: { id: material.category.id, name: material.category.name },
        })),
        total: materialResult.total,
      },
    };
  }
}
