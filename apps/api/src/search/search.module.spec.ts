import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchController } from './search.controller';
import { SearchModule } from './search.module';
import { SearchService } from './search.service';

// Story 16.6 wired 13 new entity modules into SearchModule's fan-out
// (WasteDisposalModule, AssetsModule, DsrModule, AuditModule, plus new
// exports from TeamModule/InventoryModule/SubcontractorsModule). Unit tests
// mock every dependency, so a real constructor-injection mistake — a
// service not exported by its owning module, a missing module import —
// would only surface at actual app boot, not in `search.service.spec.ts`.
// This compiles the real Nest DI graph (no DB connection required —
// `.compile()` resolves providers but never runs onModuleInit) to catch
// that class of error here instead.
describe('SearchModule (DI wiring)', () => {
  it('resolves every dependency SearchService/SearchController need', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, SearchModule],
    }).compile();

    expect(moduleRef.get(SearchService)).toBeInstanceOf(SearchService);
    expect(moduleRef.get(SearchController)).toBeInstanceOf(SearchController);
  });
});
