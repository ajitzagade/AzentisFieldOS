import { describe, expect, it, vi } from 'vitest';
import { BrandingConfigService } from './branding-config.service';
import { ReportCompilerService } from './report-compiler.service';

// A tiny in-memory BrandingConfig store shared by both services, so the "no
// caching/staleness" assertion below exercises the real read path: the compiler
// reads whatever the store currently holds, with nothing in between.
function makeStore(initial: Record<string, unknown> | null) {
  let row = initial;
  return {
    brandingConfig: {
      findFirst: vi.fn(async () => row),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        row = { id: 'bc1', ...data };
        return row;
      }),
      update: vi.fn(
        async ({
          data,
        }: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => {
          row = { ...(row ?? { id: 'bc1' }), ...data };
          return row;
        },
      ),
    },
    get row() {
      return row;
    },
  };
}

describe('BrandingConfigService.getConfig', () => {
  it('returns the single seeded row when one exists', async () => {
    const prisma = makeStore({ id: 'bc1', tenantName: 'Sandeep Enterprises' });
    const service = new BrandingConfigService(
      prisma as unknown as ConstructorParameters<
        typeof BrandingConfigService
      >[0],
    );

    const config = await service.getConfig();

    expect(config).toMatchObject({
      id: 'bc1',
      tenantName: 'Sandeep Enterprises',
    });
    expect(prisma.brandingConfig.create).not.toHaveBeenCalled();
  });

  it('creates exactly one default row if the singleton was never seeded', async () => {
    const prisma = makeStore(null);
    const service = new BrandingConfigService(
      prisma as unknown as ConstructorParameters<
        typeof BrandingConfigService
      >[0],
    );

    const config = await service.getConfig();

    expect(config).toMatchObject({ tenantName: 'Your Company' });
    expect(prisma.brandingConfig.create).toHaveBeenCalledTimes(1);
  });
});

describe('BrandingConfigService.update', () => {
  it('persists the extended fields in place on the one existing row', async () => {
    const prisma = makeStore({
      id: 'bc1',
      tenantName: 'Old Name',
      primaryColor: '#0F5257',
      secondaryColor: '#16273E',
      accentColor: '#C7912B',
      gstin: null,
    });
    const service = new BrandingConfigService(
      prisma as unknown as ConstructorParameters<
        typeof BrandingConfigService
      >[0],
    );

    const updated = await service.update({
      tenantName: 'Azentis Construction Pvt. Ltd.',
      accentColor: '#AA8800',
      gstin: '27AABCA1234M1Z5',
    });

    expect(prisma.brandingConfig.update).toHaveBeenCalledWith({
      where: { id: 'bc1' },
      data: {
        tenantName: 'Azentis Construction Pvt. Ltd.',
        accentColor: '#AA8800',
        gstin: '27AABCA1234M1Z5',
      },
    });
    expect(updated).toMatchObject({
      tenantName: 'Azentis Construction Pvt. Ltd.',
      accentColor: '#AA8800',
      gstin: '27AABCA1234M1Z5',
    });
  });
});

// AC #1 / FR-47: the change reflects in the NEXT generated report with no
// publish step. ReportCompilerService reads BrandingConfig fresh on every
// compile (getBrandingSnapshot → brandingConfig.findFirst), so an update made
// through BrandingConfigService is visible to the very next snapshot read with
// no caching or staleness anywhere in between.
describe('a branding update flows into the next compile with no staleness', () => {
  it('ReportCompilerService reads the updated primaryColor/tenantName immediately', async () => {
    const prisma = makeStore({
      id: 'bc1',
      tenantName: 'Old Name',
      logoUrl: null,
      primaryColor: '#0F5257',
    });
    const branding = new BrandingConfigService(
      prisma as unknown as ConstructorParameters<
        typeof BrandingConfigService
      >[0],
    );
    const compiler = new ReportCompilerService(
      prisma as unknown as ConstructorParameters<
        typeof ReportCompilerService
      >[0],
    );

    // Snapshot before the edit.
    const before = await compiler.getBrandingSnapshot();
    expect(before).toMatchObject({
      tenantName: 'Old Name',
      primaryColor: '#0F5257',
    });

    // Admin saves a change (no publish step).
    await branding.update({ tenantName: 'New Co', primaryColor: '#123456' });

    // The very next compile's snapshot reflects it — no cache to invalidate.
    const after = await compiler.getBrandingSnapshot();
    expect(after).toMatchObject({
      tenantName: 'New Co',
      primaryColor: '#123456',
    });
  });
});
