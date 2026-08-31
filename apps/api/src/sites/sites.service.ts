import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSiteInput, UpdateSiteInput } from '@azentisfieldos/shared';
import type { PaginatedResult } from '@azentisfieldos/shared';
import { Prisma, type Site, type SiteStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';
import { getSiteActivityFeed } from './site-activity-feed';
import { getSitePhotoGallery } from './site-photo-gallery';

const SITE_SORT_FIELDS = ['name', 'location', 'status', 'createdAt'] as const;
type SiteSortField = (typeof SITE_SORT_FIELDS)[number];

function isSiteSortField(value: string | undefined): value is SiteSortField {
  return (
    Boolean(value) &&
    (SITE_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

const SITE_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED'] as const;

// `status`/`order` are typed as narrow unions at the TS level, but both
// arrive as raw, unvalidated strings off an HTTP query param (plain
// `@Query()`, no Zod pipe) — an unrecognized value must be dropped here,
// not forwarded to Prisma, which would otherwise throw an unhandled 500
// instead of a clean fallback (the same class of gap `isSiteSortField`
// above already guards against for `sort`).
function isSiteStatus(value: string | undefined): value is SiteStatus {
  return (
    Boolean(value) &&
    (SITE_STATUSES as readonly string[]).includes(value as string)
  );
}

export interface SitesListQuery {
  // Raw, unvalidated query-string values (matches `sort` below) — an
  // invalid value is dropped by `isSiteStatus`/`isSortOrder`, never
  // forwarded to Prisma. Claiming a narrow type here when nothing at the
  // HTTP boundary actually enforces it would be misleading.
  status?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-1: Owner/Admin creates and maintains Sites.
@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  create(input: CreateSiteInput) {
    return this.prisma.site.create({
      data: {
        name: input.name,
        location: input.location,
        status: input.status,
        contractReference: input.contractReference,
        description: input.description,
      },
    });
  }

  // FR-3: consolidated cross-Site rollup — a new Site is included with no
  // separate config step, so this is just "all Sites," ordered newest first.
  // The optional `status` filter lets Story 12.2's Dashboard rollup ask for
  // just ACTIVE Sites through this same query rather than re-querying `Site`
  // from DashboardService (each domain owns its own queries).
  //
  // Dozens of pickers across apps/web call this with no query params at all
  // and expect a plain array back — that contract is preserved exactly:
  // only requesting a page/pageSize switches the return shape to a
  // PaginatedResult envelope. No existing caller passes those params today.
  list(query: SitesListQuery = {}): Promise<Site[] | PaginatedResult<Site>> {
    const { status, q, page, pageSize, sort, order } = query;

    // Soft-deleted Sites are hidden from every list/picker (their rows and
    // history stay in the database).
    const where: Prisma.SiteWhereInput = {
      deletedAt: null,
      ...(isSiteStatus(status) ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { location: { contains: q, mode: 'insensitive' as const } },
              {
                contractReference: {
                  contains: q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.SiteOrderByWithRelationInput = isSiteSortField(sort)
      ? { [sort]: isSortOrder(order) ? order : 'asc' }
      : { createdAt: 'desc' };

    const pagination = paginationParams(page, pageSize);
    if (!pagination.paginated) {
      return this.prisma.site.findMany({ where, orderBy });
    }

    return Promise.all([
      this.prisma.site.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.site.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  // Story 16.2's global search: an unranked candidate set (ranking happens
  // once, in SearchService, shared across every searchable entity) matching
  // the same soft-delete + name/location/contractReference shape as list()'s
  // `q` filter. Capped at 200 candidates as a safety valve — realistic
  // search terms narrow well below that; `total` comes from an uncapped
  // count() so "N results" stays accurate even if the cap is hit.
  async searchCandidates(
    q: string,
  ): Promise<{ candidates: Site[]; total: number }> {
    const where: Prisma.SiteWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { location: { contains: q, mode: 'insensitive' as const } },
        { contractReference: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.site.findMany({ where, orderBy: { name: 'asc' }, take: 200 }),
      this.prisma.site.count({ where }),
    ]);
    return { candidates, total };
  }

  // Site master data uses a normal in-place update — it is not one of
  // AD-9's append-only transaction-history tables. Prisma's @updatedAt on
  // `updatedAt` timestamps this write automatically; no manual code needed.
  async update(id: string, input: UpdateSiteInput) {
    // A soft-deleted Site is inert: not readable, not editable (the 404
    // contract applies to writes too, or PATCH becomes a read/edit bypass).
    const existing = await this.prisma.site.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    try {
      return await this.prisma.site.update({ where: { id }, data: input });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Site ${id} not found`);
      }
      throw error;
    }
  }

  // Degrades gracefully as later epics ship — this reads from whatever
  // record types already exist for this Site, never requiring every
  // producer epic to be built first (every relation queried here already
  // exists in the schema today).
  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }

    const feed = await getSiteActivityFeed(this.prisma, id);
    return { ...site, feed };
  }

  // FR-31: every photo from every DSR at this Site, newest-first.
  async getPhotos(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return getSitePhotoGallery(this.prisma, this.storage, id);
  }

  // Soft delete: stamps deletedAt so the Site vanishes from lists/pickers,
  // while the row — and every transaction pointing at it — stays in the
  // database. Never a hard DELETE (the ledger's foreign keys depend on it).
  // Idempotence: deleting an already-deleted Site 404s like any other read.
  async softDelete(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return this.prisma.site.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
