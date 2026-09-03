import { Module } from '@nestjs/common';
import { SubcontractorsController } from './subcontractors.controller';
import { SubcontractorsService } from './subcontractors.service';
import { SiteContractsController } from './site-contracts.controller';
import { SiteContractsService } from './site-contracts.service';
import { WorkEntriesController } from './work-entries.controller';
import { WorkEntriesService } from './work-entries.service';
import { SubcontractorPaymentsController } from './subcontractor-payments.controller';
import { SubcontractorPaymentsService } from './subcontractor-payments.service';

// Hosts every Subcontractor-Management controller/service (Epic 18) as
// siblings — mirrors apps/api/src/team/ (TeamMembers + Advances + Payments
// + WorkRecords) rather than apps/api/src/vendors/'s single-resource
// shape.
@Module({
  controllers: [
    SubcontractorsController,
    SiteContractsController,
    WorkEntriesController,
    SubcontractorPaymentsController,
  ],
  providers: [
    SubcontractorsService,
    SiteContractsService,
    WorkEntriesService,
    SubcontractorPaymentsService,
  ],
  // Story 19.2/16.6: SearchModule fans out to each service's
  // searchCandidates().
  exports: [
    SubcontractorsService,
    SiteContractsService,
    WorkEntriesService,
    SubcontractorPaymentsService,
  ],
})
export class SubcontractorsModule {}
