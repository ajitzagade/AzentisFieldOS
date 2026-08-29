import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SitesController } from '../sites/sites.controller';
import { SitesService } from '../sites/sites.service';
import { MaterialsController } from '../materials/materials.controller';
import { MaterialsService } from '../materials/materials.service';
import { MaterialCategoriesController } from '../materials/material-categories.controller';
import { MaterialCategoriesService } from '../materials/material-categories.service';
import { RolesGuard } from '../auth/roles.guard';
import { MovementsController } from '../inventory/movements.controller';
import { MovementsService } from '../inventory/movements.service';
import { TeamMembersController } from '../team/team-members.controller';
import { TeamMembersService } from '../team/team-members.service';
import { MachineryController } from '../assets/machinery.controller';
import { MachineryService } from '../assets/machinery.service';
import { VehicleController } from '../assets/vehicle.controller';
import { VehicleService } from '../assets/vehicle.service';
import { VendorsController } from '../vendors/vendors.controller';
import { VendorsService } from '../vendors/vendors.service';

// Regression coverage for a real bug: NestJS's method-scoped @UsePipes()
// runs against every handler argument, not just @Body(). A handler with
// both @Param('id') and a method-scoped Zod object-schema pipe fails
// validation on the plain id string and always 400s over real HTTP — even
// though every existing *.controller.spec.ts stays green, because those
// tests call `controller.method(id, body)` directly and never go through
// Nest's actual pipe execution pipeline. Each case below builds a real
// INestApplication and drives it over HTTP via supertest specifically to
// close that gap.
describe('PATCH handlers with @Param + @Body must not validate the param', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('SitesController PATCH /sites/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [{ provide: SitesService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer()).patch('/sites/1').send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('MaterialsController PATCH /materials/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [{ provide: MaterialsService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/materials/1')
      .send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('MaterialsController POST /materials/:materialId/sizes', async () => {
    const service = { createSize: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [{ provide: MaterialsService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/materials/1/sizes')
      .send({ label: 'Small' });
    expect(res.status).toBe(201);
    expect(service.createSize).toHaveBeenCalledWith('1', { label: 'Small' });
  });

  it('MaterialCategoriesController PATCH /material-categories/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    // FR-49 added @Roles('OWNER_ADMIN') to this route's RolesGuard — this
    // test is about the @Param + @Body pipe-validation quirk, not
    // authorization, so the guard is stubbed open rather than faked with a
    // request.user this test has no other reason to construct.
    const moduleRef = await Test.createTestingModule({
      controllers: [MaterialCategoriesController],
      providers: [{ provide: MaterialCategoriesService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/material-categories/1')
      .send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('MovementsController PATCH /movements/:id/confirm-receipt', async () => {
    const service = { confirmReceipt: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [MovementsController],
      providers: [{ provide: MovementsService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/movements/1/confirm-receipt')
      .send({ receivedQuantity: 5 });
    expect(res.status).toBe(200);
    expect(service.confirmReceipt).toHaveBeenCalledWith('1', {
      receivedQuantity: 5,
    });
  });

  it('TeamMembersController PATCH /team-members/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [TeamMembersController],
      providers: [{ provide: TeamMembersService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/team-members/1')
      .send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('MachineryController PATCH /machinery/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [MachineryController],
      providers: [{ provide: MachineryService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/machinery/1')
      .send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('VehicleController PATCH /vehicles/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .patch('/vehicles/1')
      .send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('VendorsController PATCH /vendors/:id', async () => {
    const service = { update: vi.fn().mockResolvedValue({ id: '1' }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [{ provide: VendorsService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer()).patch('/vendors/1').send({});
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });
});
