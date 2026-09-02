"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/src/app.service.js
var require_app_service = __commonJS({
  "dist/src/app.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppService = void 0;
    var common_1 = require("@nestjs/common");
    var AppService = class AppService {
      getHealth() {
        return { status: "ok" };
      }
    };
    exports2.AppService = AppService;
    exports2.AppService = AppService = __decorate([
      (0, common_1.Injectable)()
    ], AppService);
  }
});

// dist/src/auth/public.decorator.js
var require_public_decorator = __commonJS({
  "dist/src/auth/public.decorator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Public = exports2.IS_PUBLIC_KEY = void 0;
    var common_1 = require("@nestjs/common");
    exports2.IS_PUBLIC_KEY = "isPublic";
    var Public = () => (0, common_1.SetMetadata)(exports2.IS_PUBLIC_KEY, true);
    exports2.Public = Public;
  }
});

// dist/src/app.controller.js
var require_app_controller = __commonJS({
  "dist/src/app.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppController = void 0;
    var common_1 = require("@nestjs/common");
    var app_service_1 = require_app_service();
    var public_decorator_1 = require_public_decorator();
    var AppController = class AppController {
      appService;
      constructor(appService) {
        this.appService = appService;
      }
      getHealth() {
        return this.appService.getHealth();
      }
    };
    exports2.AppController = AppController;
    __decorate([
      (0, public_decorator_1.Public)(),
      (0, common_1.Get)("health"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Object)
    ], AppController.prototype, "getHealth", null);
    exports2.AppController = AppController = __decorate([
      (0, common_1.Controller)(),
      __metadata("design:paramtypes", [app_service_1.AppService])
    ], AppController);
  }
});

// ../../packages/shared/src/roles.ts
var ROLES;
var init_roles = __esm({
  "../../packages/shared/src/roles.ts"() {
    "use strict";
    ROLES = ["OWNER_ADMIN", "SITE_SUPERVISOR"];
  }
});

// ../../packages/shared/src/schemas/auth.ts
var import_zod, loginSchema;
var init_auth = __esm({
  "../../packages/shared/src/schemas/auth.ts"() {
    "use strict";
    import_zod = require("zod");
    loginSchema = import_zod.z.object({
      email: import_zod.z.email().max(200),
      password: import_zod.z.string().min(1).max(200)
    });
  }
});

// ../../packages/shared/src/schemas/user.ts
var import_zod2, createUserSchema, updateUserRoleSchema;
var init_user = __esm({
  "../../packages/shared/src/schemas/user.ts"() {
    "use strict";
    import_zod2 = require("zod");
    init_roles();
    createUserSchema = import_zod2.z.object({
      name: import_zod2.z.string().min(1).max(200),
      email: import_zod2.z.email().max(200),
      role: import_zod2.z.enum(ROLES),
      password: import_zod2.z.string().min(8).max(200)
    });
    updateUserRoleSchema = import_zod2.z.object({
      role: import_zod2.z.enum(ROLES)
    });
  }
});

// ../../packages/shared/src/schemas/site.ts
var import_zod3, siteStatusSchema, createSiteSchema, updateSiteSchema;
var init_site = __esm({
  "../../packages/shared/src/schemas/site.ts"() {
    "use strict";
    import_zod3 = require("zod");
    siteStatusSchema = import_zod3.z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]);
    createSiteSchema = import_zod3.z.object({
      name: import_zod3.z.string().min(1).max(200),
      location: import_zod3.z.string().min(1).max(500),
      status: siteStatusSchema.default("ACTIVE"),
      contractReference: import_zod3.z.string().max(200).optional(),
      description: import_zod3.z.string().max(2e3).optional()
    });
    updateSiteSchema = import_zod3.z.object({ ...createSiteSchema.shape, status: siteStatusSchema }).partial();
  }
});

// ../../packages/shared/src/schemas/daily-site-report.ts
var import_zod4, dsrWorkRecordSchema, dsrConsumptionSchema, dsrRmcEntrySchema, dsrExpenseSchema, dsrEquipmentUsedSchema, createDsrSchema, correctDsrSchema;
var init_daily_site_report = __esm({
  "../../packages/shared/src/schemas/daily-site-report.ts"() {
    "use strict";
    import_zod4 = require("zod");
    dsrWorkRecordSchema = import_zod4.z.object({
      teamMemberId: import_zod4.z.string(),
      attended: import_zod4.z.boolean().default(true),
      hours: import_zod4.z.number().positive().optional(),
      overtimeHours: import_zod4.z.number().positive().optional()
    });
    dsrConsumptionSchema = import_zod4.z.object({
      materialSizeId: import_zod4.z.string(),
      quantity: import_zod4.z.number().positive(),
      activityReference: import_zod4.z.string().optional(),
      clientGeneratedId: import_zod4.z.string().optional()
    });
    dsrRmcEntrySchema = import_zod4.z.object({
      vendorId: import_zod4.z.string(),
      quantityM3: import_zod4.z.number().positive(),
      grade: import_zod4.z.string().min(1),
      ratePerM3: import_zod4.z.number().positive(),
      // totalAmount is server-computed (quantityM3 * ratePerM3) — never
      // accepted from the client.
      clientGeneratedId: import_zod4.z.string().optional()
    });
    dsrExpenseSchema = import_zod4.z.object({
      categoryId: import_zod4.z.string(),
      amount: import_zod4.z.number().positive(),
      description: import_zod4.z.string().optional(),
      paymentMethod: import_zod4.z.string().optional(),
      personOrVendor: import_zod4.z.string().optional(),
      clientGeneratedId: import_zod4.z.string().optional()
    });
    dsrEquipmentUsedSchema = import_zod4.z.object({
      type: import_zod4.z.enum(["MACHINERY", "VEHICLE"]),
      id: import_zod4.z.string(),
      name: import_zod4.z.string()
    });
    createDsrSchema = import_zod4.z.object({
      siteId: import_zod4.z.string(),
      reportDate: import_zod4.z.iso.date(),
      // YYYY-MM-DD
      workCompleted: import_zod4.z.string().optional(),
      workInProgress: import_zod4.z.string().optional(),
      plannedWork: import_zod4.z.string().optional(),
      issuesBlockers: import_zod4.z.string().optional(),
      safetyObservations: import_zod4.z.string().optional(),
      notes: import_zod4.z.string().optional(),
      workRecords: import_zod4.z.array(dsrWorkRecordSchema).default([]),
      consumptions: import_zod4.z.array(dsrConsumptionSchema).default([]),
      rmcEntries: import_zod4.z.array(dsrRmcEntrySchema).default([]),
      expenses: import_zod4.z.array(dsrExpenseSchema).default([]),
      equipmentUsed: import_zod4.z.array(dsrEquipmentUsedSchema).default([])
    });
    correctDsrSchema = createDsrSchema.extend({
      reason: import_zod4.z.string().min(1)
    });
  }
});

// ../../packages/shared/src/schemas/photo.ts
var import_zod5, presignPhotoUploadSchema, confirmPhotoUploadSchema;
var init_photo = __esm({
  "../../packages/shared/src/schemas/photo.ts"() {
    "use strict";
    import_zod5 = require("zod");
    presignPhotoUploadSchema = import_zod5.z.object({
      dailySiteReportId: import_zod5.z.string()
    });
    confirmPhotoUploadSchema = import_zod5.z.object({
      dailySiteReportId: import_zod5.z.string(),
      storageKey: import_zod5.z.string().min(1)
    });
  }
});

// ../../packages/shared/src/schemas/material-category.ts
var import_zod6, createMaterialCategorySchema, updateMaterialCategorySchema;
var init_material_category = __esm({
  "../../packages/shared/src/schemas/material-category.ts"() {
    "use strict";
    import_zod6 = require("zod");
    createMaterialCategorySchema = import_zod6.z.object({
      name: import_zod6.z.string().min(1).max(200)
    });
    updateMaterialCategorySchema = import_zod6.z.object({ ...createMaterialCategorySchema.shape, isActive: import_zod6.z.boolean() }).partial();
  }
});

// ../../packages/shared/src/schemas/unit.ts
var import_zod7, createUnitSchema, updateUnitSchema;
var init_unit = __esm({
  "../../packages/shared/src/schemas/unit.ts"() {
    "use strict";
    import_zod7 = require("zod");
    createUnitSchema = import_zod7.z.object({
      name: import_zod7.z.string().min(1).max(50)
    });
    updateUnitSchema = import_zod7.z.object({
      name: import_zod7.z.string().min(1).max(50).optional(),
      isActive: import_zod7.z.boolean().optional()
    });
  }
});

// ../../packages/shared/src/schemas/material.ts
var import_zod8, createMaterialSchema, customFieldTypeSchema, customFieldDefinitionSchema, customFieldsSchema, updateMaterialSchema, createMaterialSizeSchema;
var init_material = __esm({
  "../../packages/shared/src/schemas/material.ts"() {
    "use strict";
    import_zod8 = require("zod");
    createMaterialSchema = import_zod8.z.object({
      name: import_zod8.z.string().min(1).max(200),
      categoryId: import_zod8.z.uuid(),
      unitId: import_zod8.z.uuid()
    });
    customFieldTypeSchema = import_zod8.z.enum(["TEXT", "NUMBER", "DATE"]);
    customFieldDefinitionSchema = import_zod8.z.object({
      label: import_zod8.z.string().min(1).max(100),
      type: customFieldTypeSchema
    });
    customFieldsSchema = import_zod8.z.array(customFieldDefinitionSchema).max(20);
    updateMaterialSchema = import_zod8.z.object({
      ...createMaterialSchema.shape,
      isActive: import_zod8.z.boolean(),
      customFields: customFieldsSchema,
      lowStockThreshold: import_zod8.z.number().positive().nullable()
    }).partial();
    createMaterialSizeSchema = import_zod8.z.object({
      label: import_zod8.z.string().min(1).max(50)
    });
  }
});

// ../../packages/shared/src/schemas/purchase.ts
var import_zod9, purchaseDestinationSchema, paymentStatusSchema, createPurchaseSchema, completePurchasePricingSchema;
var init_purchase = __esm({
  "../../packages/shared/src/schemas/purchase.ts"() {
    "use strict";
    import_zod9 = require("zod");
    purchaseDestinationSchema = import_zod9.z.enum(["GODOWN", "SITE"]);
    paymentStatusSchema = import_zod9.z.enum(["PAID", "PARTIAL", "UNPAID"]);
    createPurchaseSchema = import_zod9.z.object({
      vendorId: import_zod9.z.uuid(),
      materialSizeId: import_zod9.z.uuid(),
      destination: purchaseDestinationSchema,
      siteId: import_zod9.z.uuid().optional(),
      quantity: import_zod9.z.number(),
      // Pricing is optional as a GROUP (decision D7, 2026-09-01): a Site
      // Supervisor's inward entry carries no money fields at all — the
      // Owner/Admin completes them later via completePurchasePricingSchema.
      // Either all three arrive together or none do (enforced below).
      rate: import_zod9.z.number().positive().optional(),
      totalAmount: import_zod9.z.number().positive().optional(),
      invoiceOrChallanNo: import_zod9.z.string().min(1).optional(),
      challanPhotoUrl: import_zod9.z.url().optional(),
      paymentStatus: paymentStatusSchema.optional(),
      deliveryLocation: import_zod9.z.string().min(1).optional(),
      vehicleDetails: import_zod9.z.string().min(1).optional(),
      receiverName: import_zod9.z.string().min(1).optional(),
      notes: import_zod9.z.string().min(1).optional(),
      purchasedAt: import_zod9.z.iso.date(),
      correctsId: import_zod9.z.uuid().optional(),
      reason: import_zod9.z.string().min(1).optional()
    }).superRefine((data, ctx) => {
      if (data.destination === "SITE" && !data.siteId) {
        ctx.addIssue({
          code: "custom",
          path: ["siteId"],
          message: "Site is required when destination is Site"
        });
      }
      if (data.destination === "GODOWN" && data.siteId) {
        ctx.addIssue({
          code: "custom",
          path: ["siteId"],
          message: "Site must not be set when destination is Godown"
        });
      }
      const pricingFields = [
        ["rate", data.rate],
        ["totalAmount", data.totalAmount],
        ["paymentStatus", data.paymentStatus]
      ];
      const provided = pricingFields.filter(([, value]) => value !== void 0);
      if (provided.length > 0 && provided.length < pricingFields.length) {
        for (const [field, value] of pricingFields) {
          if (value === void 0) {
            ctx.addIssue({
              code: "custom",
              path: [field],
              message: "Rate, Total Amount and Payment Status go together \u2014 fill all three, or leave pricing to be added later"
            });
          }
        }
      }
      if (data.correctsId) {
        if (data.quantity === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["quantity"],
            message: "A correction's quantity delta must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.quantity <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Quantity must be positive"
        });
      }
    });
    completePurchasePricingSchema = import_zod9.z.object({
      rate: import_zod9.z.number().positive(),
      totalAmount: import_zod9.z.number().positive(),
      paymentStatus: paymentStatusSchema
    });
  }
});

// ../../packages/shared/src/schemas/movement.ts
var import_zod10, movementKindSchema, createMovementSchema, confirmMovementReceiptSchema;
var init_movement = __esm({
  "../../packages/shared/src/schemas/movement.ts"() {
    "use strict";
    import_zod10 = require("zod");
    movementKindSchema = import_zod10.z.enum(["GODOWN_TO_SITE", "SITE_TO_SITE"]);
    createMovementSchema = import_zod10.z.object({
      kind: movementKindSchema,
      materialSizeId: import_zod10.z.uuid(),
      sourceSiteId: import_zod10.z.uuid().optional(),
      destinationSiteId: import_zod10.z.uuid(),
      sentQuantity: import_zod10.z.number(),
      vehicleDetails: import_zod10.z.string().min(1).optional(),
      personResponsible: import_zod10.z.string().min(1).optional(),
      notes: import_zod10.z.string().min(1).optional(),
      movedAt: import_zod10.z.iso.date(),
      correctsId: import_zod10.z.uuid().optional(),
      reason: import_zod10.z.string().min(1).optional()
    }).superRefine((data, ctx) => {
      if (data.kind === "GODOWN_TO_SITE" && data.sourceSiteId) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceSiteId"],
          message: "Source Site must not be set for a Godown-to-Site Movement"
        });
      }
      if (data.kind === "SITE_TO_SITE" && !data.sourceSiteId) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceSiteId"],
          message: "Source Site is required for a Site-to-Site Movement"
        });
      }
      if (data.kind === "SITE_TO_SITE" && data.sourceSiteId && data.sourceSiteId === data.destinationSiteId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationSiteId"],
          message: "Source and destination Site must be different"
        });
      }
      if (data.correctsId) {
        if (data.sentQuantity === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["sentQuantity"],
            message: "A correction's quantity delta must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.sentQuantity <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["sentQuantity"],
          message: "Sent quantity must be positive"
        });
      }
    });
    confirmMovementReceiptSchema = import_zod10.z.object({
      receivedQuantity: import_zod10.z.number().nonnegative()
    });
  }
});

// ../../packages/shared/src/schemas/consumption.ts
var import_zod11, createConsumptionSchema;
var init_consumption = __esm({
  "../../packages/shared/src/schemas/consumption.ts"() {
    "use strict";
    import_zod11 = require("zod");
    createConsumptionSchema = import_zod11.z.object({
      siteId: import_zod11.z.uuid(),
      materialSizeId: import_zod11.z.uuid(),
      quantity: import_zod11.z.number(),
      activityReference: import_zod11.z.string().min(1).optional(),
      notes: import_zod11.z.string().min(1).optional(),
      consumedAt: import_zod11.z.iso.date(),
      correctsId: import_zod11.z.uuid().optional(),
      reason: import_zod11.z.string().min(1).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.quantity === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["quantity"],
            message: "A correction's quantity delta must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.quantity <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Quantity must be positive"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/return-wastage.ts
var import_zod12, returnWastageKindSchema, createReturnWastageSchema;
var init_return_wastage = __esm({
  "../../packages/shared/src/schemas/return-wastage.ts"() {
    "use strict";
    import_zod12 = require("zod");
    returnWastageKindSchema = import_zod12.z.enum(["RETURN", "WASTAGE"]);
    createReturnWastageSchema = import_zod12.z.object({
      siteId: import_zod12.z.uuid(),
      materialSizeId: import_zod12.z.uuid(),
      kind: returnWastageKindSchema,
      quantity: import_zod12.z.number(),
      notes: import_zod12.z.string().min(1).optional(),
      recordedAt: import_zod12.z.iso.date(),
      correctsId: import_zod12.z.uuid().optional(),
      reason: import_zod12.z.string().min(1).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.quantity === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["quantity"],
            message: "A correction's quantity delta must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.quantity <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Quantity must be positive"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/employment-type.ts
var import_zod13, createEmploymentTypeSchema, updateEmploymentTypeSchema;
var init_employment_type = __esm({
  "../../packages/shared/src/schemas/employment-type.ts"() {
    "use strict";
    import_zod13 = require("zod");
    createEmploymentTypeSchema = import_zod13.z.object({
      name: import_zod13.z.string().min(1).max(100)
    });
    updateEmploymentTypeSchema = import_zod13.z.object({
      name: import_zod13.z.string().min(1).max(100).optional(),
      isActive: import_zod13.z.boolean().optional()
    });
  }
});

// ../../packages/shared/src/schemas/team-member.ts
var import_zod14, createTeamMemberSchema, updateTeamMemberSchema;
var init_team_member = __esm({
  "../../packages/shared/src/schemas/team-member.ts"() {
    "use strict";
    import_zod14 = require("zod");
    createTeamMemberSchema = import_zod14.z.object({
      name: import_zod14.z.string().min(1).max(200),
      designation: import_zod14.z.string().max(200).optional(),
      contact: import_zod14.z.string().max(100).optional(),
      employmentTypeId: import_zod14.z.uuid()
    });
    updateTeamMemberSchema = import_zod14.z.object({
      ...createTeamMemberSchema.shape,
      designation: import_zod14.z.string().max(200).nullable(),
      contact: import_zod14.z.string().max(100).nullable(),
      isActive: import_zod14.z.boolean()
    }).partial();
  }
});

// ../../packages/shared/src/schemas/work-record.ts
var import_zod15, createWorkRecordSchema, createWorkRecordBatchSchema;
var init_work_record = __esm({
  "../../packages/shared/src/schemas/work-record.ts"() {
    "use strict";
    import_zod15 = require("zod");
    createWorkRecordSchema = import_zod15.z.object({
      teamMemberId: import_zod15.z.uuid(),
      siteId: import_zod15.z.uuid(),
      workDate: import_zod15.z.iso.date(),
      attended: import_zod15.z.boolean().default(true),
      hours: import_zod15.z.number().nonnegative().optional(),
      overtimeHours: import_zod15.z.number().nonnegative().optional()
    });
    createWorkRecordBatchSchema = import_zod15.z.array(createWorkRecordSchema).min(1).superRefine((records, ctx) => {
      const [first] = records;
      if (!first) return;
      records.forEach((record, index) => {
        if (record.siteId !== first.siteId) {
          ctx.addIssue({
            code: "custom",
            path: [index, "siteId"],
            message: "Every Work Record in a batch must be for the same Site"
          });
        }
        if (record.workDate !== first.workDate) {
          ctx.addIssue({
            code: "custom",
            path: [index, "workDate"],
            message: "Every Work Record in a batch must be for the same date"
          });
        }
      });
    });
  }
});

// ../../packages/shared/src/schemas/advance.ts
var import_zod16, createAdvanceSchema;
var init_advance = __esm({
  "../../packages/shared/src/schemas/advance.ts"() {
    "use strict";
    import_zod16 = require("zod");
    createAdvanceSchema = import_zod16.z.object({
      teamMemberId: import_zod16.z.uuid(),
      amount: import_zod16.z.number(),
      reason: import_zod16.z.string().max(500).optional(),
      paymentMethod: import_zod16.z.string().max(100).optional(),
      givenAt: import_zod16.z.coerce.date(),
      correctsId: import_zod16.z.uuid().optional(),
      correctionReason: import_zod16.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.amount === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "A correction's amount delta must not be zero"
          });
        }
        if (!data.correctionReason) {
          ctx.addIssue({
            code: "custom",
            path: ["correctionReason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.amount <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount must be positive"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/advance-adjustment.ts
var import_zod17, createAdvanceAdjustmentSchema;
var init_advance_adjustment = __esm({
  "../../packages/shared/src/schemas/advance-adjustment.ts"() {
    "use strict";
    import_zod17 = require("zod");
    createAdvanceAdjustmentSchema = import_zod17.z.object({
      advanceId: import_zod17.z.uuid(),
      paymentId: import_zod17.z.uuid().optional(),
      amount: import_zod17.z.number(),
      note: import_zod17.z.string().max(500).optional(),
      adjustedAt: import_zod17.z.coerce.date(),
      correctsId: import_zod17.z.uuid().optional(),
      correctionReason: import_zod17.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.amount === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "A correction's amount delta must not be zero"
          });
        }
        if (!data.correctionReason) {
          ctx.addIssue({
            code: "custom",
            path: ["correctionReason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.amount <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount must be positive"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/payment.ts
var import_zod18, createPaymentSchema, markPaymentPaidSchema;
var init_payment = __esm({
  "../../packages/shared/src/schemas/payment.ts"() {
    "use strict";
    import_zod18 = require("zod");
    createPaymentSchema = import_zod18.z.object({
      teamMemberId: import_zod18.z.uuid(),
      basePay: import_zod18.z.number().nonnegative(),
      additionalAmount: import_zod18.z.number().nonnegative().default(0),
      deductions: import_zod18.z.number().nonnegative().default(0),
      payPeriod: import_zod18.z.string().max(100).optional(),
      // FR-24: optional linked Adjustment — omitting it is valid, no warning.
      advanceAdjustment: import_zod18.z.object({
        advanceId: import_zod18.z.uuid(),
        amount: import_zod18.z.number().positive(),
        note: import_zod18.z.string().max(500).optional()
      }).optional(),
      correctsId: import_zod18.z.uuid().optional(),
      reason: import_zod18.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId && !data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction"
        });
      }
    });
    markPaymentPaidSchema = import_zod18.z.object({});
  }
});

// ../../packages/shared/src/schemas/machinery-type.ts
var import_zod19, createMachineryTypeSchema, updateMachineryTypeSchema;
var init_machinery_type = __esm({
  "../../packages/shared/src/schemas/machinery-type.ts"() {
    "use strict";
    import_zod19 = require("zod");
    createMachineryTypeSchema = import_zod19.z.object({
      name: import_zod19.z.string().min(1).max(100)
    });
    updateMachineryTypeSchema = import_zod19.z.object({
      name: import_zod19.z.string().min(1).max(100).optional(),
      isActive: import_zod19.z.boolean().optional()
    });
  }
});

// ../../packages/shared/src/schemas/vehicle-type.ts
var import_zod20, createVehicleTypeSchema, updateVehicleTypeSchema;
var init_vehicle_type = __esm({
  "../../packages/shared/src/schemas/vehicle-type.ts"() {
    "use strict";
    import_zod20 = require("zod");
    createVehicleTypeSchema = import_zod20.z.object({
      name: import_zod20.z.string().min(1).max(100)
    });
    updateVehicleTypeSchema = import_zod20.z.object({
      name: import_zod20.z.string().min(1).max(100).optional(),
      isActive: import_zod20.z.boolean().optional()
    });
  }
});

// ../../packages/shared/src/schemas/machinery.ts
var import_zod21, createMachinerySchema, updateMachinerySchema;
var init_machinery = __esm({
  "../../packages/shared/src/schemas/machinery.ts"() {
    "use strict";
    import_zod21 = require("zod");
    createMachinerySchema = import_zod21.z.object({
      name: import_zod21.z.string().min(1).max(200),
      typeId: import_zod21.z.uuid(),
      assetNumber: import_zod21.z.string().min(1).max(100),
      model: import_zod21.z.string().max(200).optional(),
      ownership: import_zod21.z.string().max(200).optional(),
      operator: import_zod21.z.string().max(200).optional()
    });
    updateMachinerySchema = import_zod21.z.object({
      ...createMachinerySchema.shape,
      model: import_zod21.z.string().max(200).nullable(),
      ownership: import_zod21.z.string().max(200).nullable(),
      operator: import_zod21.z.string().max(200).nullable()
    }).partial();
  }
});

// ../../packages/shared/src/schemas/vehicle.ts
var import_zod22, createVehicleSchema, updateVehicleSchema;
var init_vehicle = __esm({
  "../../packages/shared/src/schemas/vehicle.ts"() {
    "use strict";
    import_zod22 = require("zod");
    createVehicleSchema = import_zod22.z.object({
      number: import_zod22.z.string().min(1).max(100),
      typeId: import_zod22.z.uuid(),
      ownership: import_zod22.z.string().max(200).optional(),
      driver: import_zod22.z.string().max(200).optional()
    });
    updateVehicleSchema = import_zod22.z.object({
      ...createVehicleSchema.shape,
      ownership: import_zod22.z.string().max(200).nullable(),
      driver: import_zod22.z.string().max(200).nullable()
    }).partial();
  }
});

// ../../packages/shared/src/schemas/asset-movement.ts
var import_zod23, assetTypeSchema, assetLocationStatusSchema, createAssetMovementSchema;
var init_asset_movement = __esm({
  "../../packages/shared/src/schemas/asset-movement.ts"() {
    "use strict";
    import_zod23 = require("zod");
    assetTypeSchema = import_zod23.z.enum(["MACHINERY", "VEHICLE"]);
    assetLocationStatusSchema = import_zod23.z.enum(["AVAILABLE", "AT_SITE", "MAINTENANCE"]);
    createAssetMovementSchema = import_zod23.z.object({
      assetType: assetTypeSchema,
      assetId: import_zod23.z.uuid(),
      toStatus: assetLocationStatusSchema,
      siteId: import_zod23.z.uuid().optional(),
      movedAt: import_zod23.z.coerce.date(),
      correctsId: import_zod23.z.uuid().optional(),
      reason: import_zod23.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.toStatus === "AT_SITE" && !data.siteId) {
        ctx.addIssue({
          code: "custom",
          path: ["siteId"],
          message: "Site is required when moving to a Site"
        });
      }
      if (data.toStatus !== "AT_SITE" && data.siteId) {
        ctx.addIssue({
          code: "custom",
          path: ["siteId"],
          message: "Site must not be set unless moving to a Site"
        });
      }
      if (data.correctsId && !data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/asset-service-log.ts
var import_zod24, serviceLogKindSchema, createAssetServiceLogSchema, updateAssetServiceLogSchema;
var init_asset_service_log = __esm({
  "../../packages/shared/src/schemas/asset-service-log.ts"() {
    "use strict";
    import_zod24 = require("zod");
    init_asset_movement();
    serviceLogKindSchema = import_zod24.z.enum(["FUEL", "MAINTENANCE", "REPAIR"]);
    createAssetServiceLogSchema = import_zod24.z.object({
      assetType: assetTypeSchema,
      assetId: import_zod24.z.uuid(),
      kind: serviceLogKindSchema,
      notes: import_zod24.z.string().max(1e3).optional(),
      cost: import_zod24.z.number().nonnegative().optional(),
      serviceDate: import_zod24.z.coerce.date()
    });
    updateAssetServiceLogSchema = import_zod24.z.object({
      kind: serviceLogKindSchema,
      notes: import_zod24.z.string().max(1e3).nullable(),
      cost: import_zod24.z.number().nonnegative().nullable(),
      serviceDate: import_zod24.z.coerce.date()
    }).partial();
  }
});

// ../../packages/shared/src/schemas/vendor.ts
var import_zod25, createVendorSchema, updateVendorSchema;
var init_vendor = __esm({
  "../../packages/shared/src/schemas/vendor.ts"() {
    "use strict";
    import_zod25 = require("zod");
    createVendorSchema = import_zod25.z.object({
      name: import_zod25.z.string().min(1).max(200),
      contactPerson: import_zod25.z.string().max(200).optional(),
      phone: import_zod25.z.string().max(50).optional(),
      email: import_zod25.z.email().max(200).optional(),
      address: import_zod25.z.string().max(500).optional(),
      materialsSupplied: import_zod25.z.array(import_zod25.z.string().min(1).max(100)).default([])
    });
    updateVendorSchema = import_zod25.z.object({
      ...createVendorSchema.shape,
      contactPerson: import_zod25.z.string().max(200).nullable(),
      phone: import_zod25.z.string().max(50).nullable(),
      email: import_zod25.z.email().max(200).nullable(),
      address: import_zod25.z.string().max(500).nullable(),
      materialsSupplied: import_zod25.z.array(import_zod25.z.string().min(1).max(100))
    }).partial();
  }
});

// ../../packages/shared/src/schemas/expense-category.ts
var import_zod26, createExpenseCategorySchema, updateExpenseCategorySchema;
var init_expense_category = __esm({
  "../../packages/shared/src/schemas/expense-category.ts"() {
    "use strict";
    import_zod26 = require("zod");
    createExpenseCategorySchema = import_zod26.z.object({
      name: import_zod26.z.string().min(1).max(100)
    });
    updateExpenseCategorySchema = import_zod26.z.object({
      name: import_zod26.z.string().min(1).max(100).optional(),
      isActive: import_zod26.z.boolean().optional()
    });
  }
});

// ../../packages/shared/src/schemas/expense.ts
var import_zod27, createExpenseSchema;
var init_expense = __esm({
  "../../packages/shared/src/schemas/expense.ts"() {
    "use strict";
    import_zod27 = require("zod");
    createExpenseSchema = import_zod27.z.object({
      siteId: import_zod27.z.uuid(),
      categoryId: import_zod27.z.uuid(),
      amount: import_zod27.z.number(),
      description: import_zod27.z.string().max(1e3).optional(),
      paymentMethod: import_zod27.z.string().max(100).optional(),
      personOrVendor: import_zod27.z.string().max(200).optional(),
      incurredAt: import_zod27.z.coerce.date(),
      correctsId: import_zod27.z.uuid().optional(),
      reason: import_zod27.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.amount === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "A correction's amount delta must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.amount <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount must be positive"
        });
      }
    });
  }
});

// ../../packages/shared/src/schemas/rmc-entry.ts
var import_zod28, createRmcEntrySchema;
var init_rmc_entry = __esm({
  "../../packages/shared/src/schemas/rmc-entry.ts"() {
    "use strict";
    import_zod28 = require("zod");
    createRmcEntrySchema = import_zod28.z.object({
      siteId: import_zod28.z.uuid(),
      vendorId: import_zod28.z.uuid(),
      quantityM3: import_zod28.z.number(),
      grade: import_zod28.z.string().min(1).max(50),
      ratePerM3: import_zod28.z.number().positive(),
      // Signed on corrections (the correct form submits corrected-total minus
      // original, and reports SUM totalAmount across rows so deltas net
      // correctly); must be positive on a new delivery — enforced below.
      totalAmount: import_zod28.z.number(),
      invoiceOrChallanNo: import_zod28.z.string().max(200).optional(),
      challanPhotoUrl: import_zod28.z.url().optional(),
      deliveredAt: import_zod28.z.coerce.date(),
      correctsId: import_zod28.z.uuid().optional(),
      reason: import_zod28.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.quantityM3 === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["quantityM3"],
            message: "A correction's quantity delta must not be zero"
          });
        }
        if (data.totalAmount === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["totalAmount"],
            message: "A correction's total-amount change must not be zero"
          });
        }
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else {
        if (data.quantityM3 <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["quantityM3"],
            message: "Quantity must be positive"
          });
        }
        if (data.totalAmount <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["totalAmount"],
            message: "Total amount must be positive"
          });
        }
      }
    });
  }
});

// ../../packages/shared/src/schemas/waste-disposal.ts
var import_zod29, WASTE_DISPOSAL_OWNERSHIP, WASTE_DISPOSAL_PAYMENT_STATUSES, createWasteDisposalSchema;
var init_waste_disposal = __esm({
  "../../packages/shared/src/schemas/waste-disposal.ts"() {
    "use strict";
    import_zod29 = require("zod");
    WASTE_DISPOSAL_OWNERSHIP = ["OWN", "HIRED"];
    WASTE_DISPOSAL_PAYMENT_STATUSES = ["PAID", "PARTIAL", "UNPAID"];
    createWasteDisposalSchema = import_zod29.z.object({
      siteId: import_zod29.z.uuid(),
      wasteType: import_zod29.z.string().min(1).max(200),
      quantityDetails: import_zod29.z.string().max(200).optional(),
      ownership: import_zod29.z.enum(WASTE_DISPOSAL_OWNERSHIP),
      vendorId: import_zod29.z.uuid().optional(),
      machineryId: import_zod29.z.uuid().optional(),
      vehicleId: import_zod29.z.uuid().optional(),
      vehicleDetails: import_zod29.z.string().max(200).optional(),
      tripCount: import_zod29.z.number().int(),
      ratePerTrip: import_zod29.z.number().nonnegative(),
      otherCharges: import_zod29.z.number().optional(),
      disposalLocation: import_zod29.z.string().max(300).optional(),
      paymentStatus: import_zod29.z.enum(WASTE_DISPOSAL_PAYMENT_STATUSES).optional(),
      notes: import_zod29.z.string().max(1e3).optional(),
      disposedAt: import_zod29.z.coerce.date(),
      correctsId: import_zod29.z.uuid().optional(),
      reason: import_zod29.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.machineryId && data.vehicleId) {
        ctx.addIssue({
          code: "custom",
          path: ["vehicleId"],
          message: "Pick either a Machinery or a Vehicle, not both"
        });
      }
      if (data.ownership === "HIRED") {
        if (!data.vendorId) {
          ctx.addIssue({
            code: "custom",
            path: ["vendorId"],
            message: "A hired disposal must name the Vendor/party being paid"
          });
        }
        if (!data.correctsId && !data.paymentStatus) {
          ctx.addIssue({
            code: "custom",
            path: ["paymentStatus"],
            message: "Payment status is required for a hired disposal"
          });
        }
      } else {
        if (data.vendorId) {
          ctx.addIssue({
            code: "custom",
            path: ["vendorId"],
            message: "An own-vehicle disposal has no Vendor to pay"
          });
        }
        if (data.paymentStatus) {
          ctx.addIssue({
            code: "custom",
            path: ["paymentStatus"],
            message: "Payment status applies only to hired disposals"
          });
        }
      }
      if (data.correctsId) {
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
        if (data.tripCount === 0 && (data.otherCharges ?? 0) === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["tripCount"],
            message: "A correction must adjust trips and/or other charges"
          });
        }
      } else {
        if (data.tripCount <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["tripCount"],
            message: "Number of trips must be at least 1"
          });
        }
        if ((data.otherCharges ?? 0) < 0) {
          ctx.addIssue({
            code: "custom",
            path: ["otherCharges"],
            message: "Other charges cannot be negative on a fresh entry"
          });
        }
      }
    });
  }
});

// ../../packages/shared/src/schemas/branding-config.ts
var import_zod30, hexColor, updateBrandingConfigSchema;
var init_branding_config = __esm({
  "../../packages/shared/src/schemas/branding-config.ts"() {
    "use strict";
    import_zod30 = require("zod");
    hexColor = import_zod30.z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color, e.g. #0F5257");
    updateBrandingConfigSchema = import_zod30.z.object({
      tenantName: import_zod30.z.string().min(1).max(200).optional(),
      logoUrl: import_zod30.z.url().nullable().optional(),
      // Primary/Secondary/Accent — the three swatches the mockup shows. All three
      // share primaryColor's 6-digit-hex validation.
      primaryColor: hexColor.optional(),
      secondaryColor: hexColor.optional(),
      accentColor: hexColor.optional(),
      // GSTIN is validated for length only — this product does not need to enforce
      // India's GST checksum rules to satisfy FR-47 (a valid-looking 15-char GSTIN
      // is enough; a stricter check would reject legitimate edge cases nobody asked
      // us to police).
      registeredAddress: import_zod30.z.string().max(500).nullable().optional(),
      contactPhone: import_zod30.z.string().max(50).nullable().optional(),
      gstin: import_zod30.z.string().max(50).nullable().optional()
    });
  }
});

// ../../packages/shared/src/schemas/notification-channel-setting.ts
var import_zod31, updateNotificationChannelSettingSchema;
var init_notification_channel_setting = __esm({
  "../../packages/shared/src/schemas/notification-channel-setting.ts"() {
    "use strict";
    import_zod31 = require("zod");
    updateNotificationChannelSettingSchema = import_zod31.z.object({
      enabled: import_zod31.z.boolean(),
      recipientUserIds: import_zod31.z.array(import_zod31.z.uuid())
    });
  }
});

// ../../packages/shared/src/schemas/report-schedule.ts
var import_zod32, REPORT_SCHEDULE_TYPES, REPORT_SCHEDULE_FREQUENCIES, reportScheduleTypeSchema, reportScheduleFrequencySchema, createReportScheduleSchema, updateReportScheduleSchema;
var init_report_schedule = __esm({
  "../../packages/shared/src/schemas/report-schedule.ts"() {
    "use strict";
    import_zod32 = require("zod");
    REPORT_SCHEDULE_TYPES = [
      "SITE",
      "INVENTORY",
      "LABOUR",
      "MACHINERY_VEHICLE",
      "FINANCIAL"
    ];
    REPORT_SCHEDULE_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"];
    reportScheduleTypeSchema = import_zod32.z.enum(REPORT_SCHEDULE_TYPES);
    reportScheduleFrequencySchema = import_zod32.z.enum(REPORT_SCHEDULE_FREQUENCIES);
    createReportScheduleSchema = import_zod32.z.object({
      reportType: reportScheduleTypeSchema,
      frequency: reportScheduleFrequencySchema,
      recipientUserIds: import_zod32.z.array(import_zod32.z.uuid()).default([]),
      siteId: import_zod32.z.uuid().optional(),
      enabled: import_zod32.z.boolean().default(true)
    });
    updateReportScheduleSchema = import_zod32.z.object({
      reportType: reportScheduleTypeSchema,
      frequency: reportScheduleFrequencySchema,
      recipientUserIds: import_zod32.z.array(import_zod32.z.uuid()),
      siteId: import_zod32.z.uuid().nullable(),
      enabled: import_zod32.z.boolean()
    }).partial();
  }
});

// ../../packages/shared/src/schemas/subcontractor.ts
var import_zod33, createSubcontractorSchema, updateSubcontractorSchema;
var init_subcontractor = __esm({
  "../../packages/shared/src/schemas/subcontractor.ts"() {
    "use strict";
    import_zod33 = require("zod");
    createSubcontractorSchema = import_zod33.z.object({
      name: import_zod33.z.string().min(1).max(200),
      contactPerson: import_zod33.z.string().max(200).optional(),
      phone: import_zod33.z.string().max(50).optional(),
      email: import_zod33.z.email().max(200).optional(),
      address: import_zod33.z.string().max(500).optional(),
      workCategories: import_zod33.z.array(import_zod33.z.string().min(1).max(100)).default([])
    });
    updateSubcontractorSchema = import_zod33.z.object({
      ...createSubcontractorSchema.shape,
      contactPerson: import_zod33.z.string().max(200).nullable(),
      phone: import_zod33.z.string().max(50).nullable(),
      email: import_zod33.z.email().max(200).nullable(),
      address: import_zod33.z.string().max(500).nullable(),
      workCategories: import_zod33.z.array(import_zod33.z.string().min(1).max(100))
    }).partial();
  }
});

// ../../packages/shared/src/schemas/site-contract.ts
function collectRateTypeIssues(data) {
  if (!data.rateType) return [];
  const issues = [];
  if (data.rateType === "FIXED_COST") {
    if (data.fixedAmount === void 0 || data.fixedAmount === null) {
      issues.push({ path: "fixedAmount", message: "Fixed Cost requires a total contract amount" });
    }
    if (data.rate !== void 0 && data.rate !== null) {
      issues.push({ path: "rate", message: "Fixed Cost does not use a per-unit rate" });
    }
    if (data.rateUnitLabel) {
      issues.push({ path: "rateUnitLabel", message: "Fixed Cost does not use a unit label" });
    }
    return issues;
  }
  if (data.rate === void 0 || data.rate === null) {
    issues.push({ path: "rate", message: `${data.rateType} requires a rate` });
  }
  if (data.fixedAmount !== void 0 && data.fixedAmount !== null) {
    issues.push({ path: "fixedAmount", message: `${data.rateType} does not use a fixed amount` });
  }
  if ((data.rateType === "PER_UNIT" || data.rateType === "CUSTOM") && !data.rateUnitLabel) {
    issues.push({ path: "rateUnitLabel", message: `${data.rateType} requires a unit label` });
  }
  return issues;
}
function checkRateTypeFields(data, ctx) {
  for (const issue of collectRateTypeIssues(data)) {
    ctx.addIssue({ code: "custom", path: [issue.path], message: issue.message });
  }
}
function collectActiveRequiredIssues(data) {
  if (data.status !== "ACTIVE") return [];
  const issues = [];
  if (!data.workCategory) {
    issues.push({ path: "workCategory", message: "Work category is required to activate a contract" });
  }
  if (!data.rateType) {
    issues.push({ path: "rateType", message: "Rate type is required to activate a contract" });
  } else if (data.rateType === "FIXED_COST") {
    if (data.fixedAmount === void 0 || data.fixedAmount === null) {
      issues.push({ path: "fixedAmount", message: "Fixed amount is required to activate a Fixed Cost contract" });
    }
  } else if (data.rate === void 0 || data.rate === null) {
    issues.push({ path: "rate", message: "Rate is required to activate this contract" });
  }
  if (!data.startDate) {
    issues.push({ path: "startDate", message: "Start date is required to activate a contract" });
  }
  return issues;
}
var import_zod34, rateTypeSchema, contractStatusSchema, createSiteContractSchema, updateSiteContractSchema;
var init_site_contract = __esm({
  "../../packages/shared/src/schemas/site-contract.ts"() {
    "use strict";
    import_zod34 = require("zod");
    rateTypeSchema = import_zod34.z.enum([
      "FIXED_COST",
      "PER_TRIP",
      "PER_PIPE",
      "PER_UNIT",
      "CUSTOM"
    ]);
    contractStatusSchema = import_zod34.z.enum([
      "DRAFT",
      "ACTIVE",
      "COMPLETED",
      "CANCELLED"
    ]);
    createSiteContractSchema = import_zod34.z.object({
      siteId: import_zod34.z.uuid(),
      subcontractorId: import_zod34.z.uuid(),
      workCategory: import_zod34.z.string().min(1).max(200).optional(),
      description: import_zod34.z.string().max(1e3).optional(),
      rateType: rateTypeSchema.optional(),
      rateUnitLabel: import_zod34.z.string().max(100).optional(),
      rate: import_zod34.z.number().positive().finite().optional(),
      fixedAmount: import_zod34.z.number().positive().finite().optional(),
      estimatedQuantity: import_zod34.z.number().positive().optional(),
      status: contractStatusSchema.default("DRAFT"),
      startDate: import_zod34.z.coerce.date().optional(),
      endDate: import_zod34.z.coerce.date().optional()
    }).superRefine((data, ctx) => {
      checkRateTypeFields(data, ctx);
      for (const issue of collectActiveRequiredIssues(data)) {
        ctx.addIssue({ code: "custom", path: [issue.path], message: issue.message });
      }
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date" });
      }
    });
    updateSiteContractSchema = import_zod34.z.object({
      workCategory: import_zod34.z.string().min(1).max(200).nullable(),
      description: import_zod34.z.string().max(1e3).nullable(),
      rateType: rateTypeSchema.nullable(),
      rateUnitLabel: import_zod34.z.string().max(100).nullable(),
      rate: import_zod34.z.number().positive().finite().nullable(),
      fixedAmount: import_zod34.z.number().positive().finite().nullable(),
      estimatedQuantity: import_zod34.z.number().positive().nullable(),
      status: contractStatusSchema,
      startDate: import_zod34.z.coerce.date().nullable(),
      endDate: import_zod34.z.coerce.date().nullable()
    }).partial().superRefine((data, ctx) => {
      checkRateTypeFields(data, ctx);
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date" });
      }
    });
  }
});

// ../../packages/shared/src/schemas/subcontractor-work-entry.ts
var import_zod35, createSubcontractorWorkEntrySchema;
var init_subcontractor_work_entry = __esm({
  "../../packages/shared/src/schemas/subcontractor-work-entry.ts"() {
    "use strict";
    import_zod35 = require("zod");
    createSubcontractorWorkEntrySchema = import_zod35.z.object({
      siteContractId: import_zod35.z.uuid(),
      quantity: import_zod35.z.number().finite(),
      workDate: import_zod35.z.coerce.date(),
      note: import_zod35.z.string().max(500).optional(),
      correctsId: import_zod35.z.uuid().optional(),
      reason: import_zod35.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.quantity === 0) {
          ctx.addIssue({ code: "custom", path: ["quantity"], message: "A correction's quantity delta must not be zero" });
        }
        if (!data.reason) {
          ctx.addIssue({ code: "custom", path: ["reason"], message: "A reason is required when filing a correction" });
        }
      } else if (data.quantity <= 0) {
        ctx.addIssue({ code: "custom", path: ["quantity"], message: "Quantity must be positive" });
      }
    });
  }
});

// ../../packages/shared/src/schemas/subcontractor-payment.ts
var import_zod36, subcontractorPaymentTypeSchema, createSubcontractorPaymentSchema;
var init_subcontractor_payment = __esm({
  "../../packages/shared/src/schemas/subcontractor-payment.ts"() {
    "use strict";
    import_zod36 = require("zod");
    subcontractorPaymentTypeSchema = import_zod36.z.enum(["ADVANCE", "PAYMENT"]);
    createSubcontractorPaymentSchema = import_zod36.z.object({
      siteContractId: import_zod36.z.uuid(),
      type: subcontractorPaymentTypeSchema,
      amount: import_zod36.z.number().finite(),
      paymentMethod: import_zod36.z.string().max(100).optional(),
      paidAt: import_zod36.z.coerce.date(),
      note: import_zod36.z.string().max(500).optional(),
      correctsId: import_zod36.z.uuid().optional(),
      reason: import_zod36.z.string().min(1).max(500).optional()
    }).superRefine((data, ctx) => {
      if (data.correctsId) {
        if (data.amount === 0) {
          ctx.addIssue({ code: "custom", path: ["amount"], message: "A correction's amount delta must not be zero" });
        }
        if (!data.reason) {
          ctx.addIssue({ code: "custom", path: ["reason"], message: "A reason is required when filing a correction" });
        }
      } else if (data.amount <= 0) {
        ctx.addIssue({ code: "custom", path: ["amount"], message: "Amount must be positive" });
      }
    });
  }
});

// ../../packages/shared/src/types/activity-feed.ts
var init_activity_feed = __esm({
  "../../packages/shared/src/types/activity-feed.ts"() {
    "use strict";
  }
});

// ../../packages/shared/src/types/photo-gallery.ts
var init_photo_gallery = __esm({
  "../../packages/shared/src/types/photo-gallery.ts"() {
    "use strict";
  }
});

// ../../packages/shared/src/types/report-filters.ts
var init_report_filters = __esm({
  "../../packages/shared/src/types/report-filters.ts"() {
    "use strict";
  }
});

// ../../packages/shared/src/types/list-query.ts
var init_list_query = __esm({
  "../../packages/shared/src/types/list-query.ts"() {
    "use strict";
  }
});

// ../../packages/shared/src/types/search-result.ts
var init_search_result = __esm({
  "../../packages/shared/src/types/search-result.ts"() {
    "use strict";
  }
});

// ../../packages/shared/src/content/help-content.ts
var HELP_CONTENT;
var init_help_content = __esm({
  "../../packages/shared/src/content/help-content.ts"() {
    "use strict";
    HELP_CONTENT = {
      product: {
        name: "AzentisFieldOS",
        tagline: "One Simple System to Manage Multiple Construction Sites",
        intro: "Manage sites, materials, labour, expenses and daily updates from one place."
      },
      problemToday: {
        flow: ["Supervisor", "WhatsApp", "Photos", "Paper", "Phone Calls", "Owner"],
        problems: [
          "Information gets lost",
          "Stock is difficult to track",
          "Bills don't match easily",
          "Labour advances are forgotten",
          "Owner has to call supervisors",
          "Reports take time to prepare"
        ]
      },
      solutionFlow: [
        "Site Activity",
        "Supervisor records it",
        "System updates the information",
        "Owner sees it immediately",
        "Reports are ready"
      ],
      systemFlow: ["Owner", "Sites", "Work", "Materials", "Labour", "Expenses", "Daily Report", "Reports", "Owner Visibility"],
      roles: {
        OWNER_ADMIN: {
          label: "Owner / Admin",
          summary: "Uses the system to manage sites, monitor work, check stock, track expenses, track labour, track vendors, review reports, and take decisions."
        },
        SITE_SUPERVISOR: {
          label: "Site Supervisor",
          summary: "Uses the system mainly from a phone to record daily work, record labour, record material usage, record expenses, upload photos, and report problems."
        }
      },
      // ---- Module-by-module content (grounded in the real, shipped app) ----
      modules: [
        {
          id: "dashboard",
          name: "Dashboard",
          whatIsIt: "The Dashboard is the first thing the Owner sees \u2014 a quick picture of every site, today.",
          whyUseIt: "So the Owner knows what happened today without calling every supervisor.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open the app \u2014 the Dashboard is the home screen.",
            "Look at Today: how many sites reported, how much labour worked, how much material moved, today's expenses.",
            "Look at Money: this month's expenses, what's owed to vendors, and how much cash is tied up.",
            "If a site has not sent today's report, it shows as a clear message you can click."
          ],
          afterSaving: "Nothing to save here \u2014 the Dashboard just shows the latest numbers from everything recorded across all sites.",
          example: "5 active sites. 4 have sent today's report. 1 site, Riverside Bridge, has not \u2014 the Dashboard says so, by name, so the Owner knows exactly who to check on.",
          href: "/"
        },
        {
          id: "sites",
          name: "Sites",
          whatIsIt: "Sites is the list of every construction project the company is running.",
          whyUseIt: "A contractor runs several sites at once \u2014 this keeps them all in one place instead of scattered across notebooks.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Sites from the menu.",
            "Click Add Site.",
            "Enter the site's name, location, and (if there is one) the contract reference.",
            "Save."
          ],
          afterSaving: "The new site appears in the list immediately and is ready to use everywhere else in the app \u2014 the Daily Report form, Inventory, Reports.",
          example: "NH-48 Widening \u2014 Package 3, in Nashik. Once added, a supervisor can start sending daily reports for it the same day.",
          href: "/sites"
        },
        {
          id: "site-detail",
          name: "Site Details",
          whatIsIt: "Opening one site shows everything that happened there \u2014 stock on hand, today's status, recent reports, recent photos, and the full history.",
          whyUseIt: "So the Owner can understand one site fully without digging through separate screens.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Sites.",
            "Click on a site's name.",
            "See its stock, today's report status, and recent activity in one place."
          ],
          afterSaving: "Nothing to save \u2014 this page is read-only. It updates automatically as new reports, purchases, and expenses are recorded for that site.",
          example: "Open NH-48 and see: 80 bags of cement in stock, today's report submitted, and photos from this morning.",
          href: "/sites"
        },
        {
          id: "materials",
          name: "Materials",
          whatIsIt: "Materials is the list of everything the company buys and uses \u2014 cement, steel, sand, and so on.",
          whyUseIt: "So every purchase and every bit of stock talks about the same thing, in the same unit, every time.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Materials.",
            "Click Add Material.",
            "Give it a name, a category, and a unit (Bags, MT, m\xB3...).",
            "Save."
          ],
          afterSaving: 'The material is ready to appear in every Purchase, Movement, and Consumption form from now on \u2014 always with the same unit, so nobody has to guess what "50" means.',
          example: 'OPC 53 Cement, unit: Bags. Every screen that shows this material shows it as "Bags" so nobody confuses bags with tons.',
          href: "/materials"
        },
        {
          id: "inventory",
          name: "Inventory",
          whatIsIt: "Inventory tells you how much material is available at each site, and at the central store.",
          whyUseIt: "So the Owner always knows how much material is on hand, without calling a supervisor to check.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Inventory.",
            "See stock at the Godown (central store) and at each site.",
            "If something is running low, it's shown with a warning and a Transfer Stock button."
          ],
          afterSaving: "Nothing to save \u2014 Inventory is a live picture. It changes automatically every time material is purchased, moved, or used.",
          example: "Cement drops below 200 bags at the Godown \u2192 Inventory shows a warning naming exactly that material and how far below the limit it is.",
          href: "/inventory"
        },
        {
          id: "purchases",
          name: "Purchases",
          whatIsIt: "When material is bought from a vendor, it's recorded here.",
          whyUseIt: "So every rupee spent on material, and every bag that comes in, is on record \u2014 no lost challans.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Movements \u2192 Record Purchase.",
            "Pick the Vendor and the Material.",
            "Choose whether it goes to the central store (Godown) or straight to a Site.",
            "Enter the quantity and the rate \u2014 the total is worked out automatically.",
            "Optionally attach a photo of the challan.",
            "Save."
          ],
          afterSaving: "Stock goes up immediately, at whichever place the material was sent to. The purchase also shows up on the Vendor's history and in Reports.",
          example: "100 bags of cement bought from Shree Balaji Traders, sent straight to Site A \u2192 Site A's stock becomes 100 bags.",
          href: "/movements/purchases/new"
        },
        {
          id: "movements",
          name: "Material Movement",
          whatIsIt: "When material moves from the central store to a site, or from one site to another, it's recorded here.",
          whyUseIt: "So the Owner can always see where material actually is, not just how much was bought.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Movements \u2192 Record Movement (or Transfer for site-to-site).",
            "Pick the material and how much is being sent.",
            "Pick where it's going.",
            "Save. The receiving side later confirms how much actually arrived."
          ],
          afterSaving: "Stock decreases at the sending location right away. It increases at the receiving location once someone confirms the material has actually arrived \u2014 so a shortage in transit is never hidden.",
          example: "20 bags moved from Site A to Site B \u2192 Site A drops to 30 bags, Site B rises to 20 bags once confirmed received.",
          href: "/movements"
        },
        {
          id: "consumption",
          name: "Material Consumption",
          whatIsIt: "When material is actually used at a site, it's recorded here.",
          whyUseIt: "So the stock number always matches what's really left, not just what was delivered.",
          usedBy: ["SITE_SUPERVISOR"],
          howToUse: [
            "Open Movements \u2192 Record Consumption (or record it inside today's Daily Report).",
            "Pick the Site and the Material.",
            "Enter how much was used.",
            "Save."
          ],
          afterSaving: "The site's stock goes down automatically by that amount. If someone tries to use more than what's on hand, the system stops them and explains why, instead of silently accepting a wrong number.",
          example: "50 bags of the 100 bags at Site A are used \u2192 remaining stock becomes 50 bags, instantly, everywhere the stock is shown.",
          href: "/movements/consumption/new"
        },
        {
          id: "vendors",
          name: "Vendors",
          whatIsIt: "Vendors is the list of every supplier the company buys material or services from.",
          whyUseIt: "So every purchase is tied to who supplied it, and the Owner can see how much business each vendor does.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Vendors.",
            "Click Add Vendor.",
            "Enter their name and contact details.",
            "Save."
          ],
          afterSaving: "The vendor is ready to pick from every Purchase and RMC form. Their page automatically fills up with a history of everything ever bought from them.",
          example: "Shree Balaji Traders supplies cement and steel. Their page shows every delivery, the total bought this year, and what's still marked unpaid.",
          href: "/vendors"
        },
        {
          id: "team",
          name: "Team & Labour",
          whatIsIt: "Team & Labour is the list of every worker, and where they've been working.",
          whyUseIt: "So the Owner knows who worked where, and workers are never tied to just one site.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Team & Labour.",
            "Click Add Team Member for a new worker.",
            "Attendance is recorded through the daily report \u2014 pick who was present today."
          ],
          afterSaving: "The worker's attendance history builds up automatically, day by day, visible on their own profile page.",
          example: "Suresh Kumar, a mason, worked at Site A yesterday and Site B today \u2014 both show up on his history, correctly.",
          href: "/team"
        },
        {
          id: "advances",
          name: "Advances",
          whatIsIt: "An advance is money given to a worker before their final payment.",
          whyUseIt: "So the company never forgets who was already given money, and how much is still owed against it.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open a worker's profile.",
            "Click Give Advance.",
            "Enter the amount and a short reason.",
            "Save."
          ],
          afterSaving: "The worker's Outstanding Balance goes up immediately \u2014 visible right on their profile, so it's never just remembered in someone's head.",
          example: "Ramesh receives a \u20B92,000 advance \u2192 his Outstanding Balance becomes \u20B92,000, and stays visible until it's paid back.",
          href: "/team"
        },
        {
          id: "payments",
          name: "Payments",
          whatIsIt: "Payments is where a worker's wages are recorded and their advance is settled.",
          whyUseIt: "So a worker's final pay always correctly subtracts what they already took as an advance \u2014 no manual subtraction, no arguments.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Payments \u2192 Record Payment.",
            "Pick the worker and enter their wage for the period.",
            "If they have an outstanding advance, choose how much of it to deduct.",
            "Save."
          ],
          afterSaving: "The system works out the final amount automatically: wage plus any extra, minus deductions, minus the advance taken. The worker's Outstanding Balance goes down by exactly the amount deducted.",
          example: "Wage = \u20B910,000. Advance already given = \u20B92,000. Amount actually paid = \u20B98,000 \u2014 and his Outstanding Balance drops to \u20B90.",
          href: "/payments"
        },
        {
          id: "machinery-vehicles",
          name: "Machinery & Vehicles",
          whatIsIt: "Machinery & Vehicles is the list of the company's own equipment \u2014 excavators, mixers, trucks \u2014 and where each one currently is.",
          whyUseIt: "So the Owner knows what equipment exists, where it is, and when it was last serviced.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Machinery & Vehicles.",
            "Add a machine or vehicle with its type and number.",
            "Record a movement whenever it goes to a different site.",
            "Log fuel, maintenance, or repair whenever it happens."
          ],
          afterSaving: "The asset's current site and status update immediately, and the movement or service is added to its permanent history.",
          example: "An excavator moves from Site A to Site B \u2192 its page now shows Site B as its current location, with the move logged.",
          href: "/machinery-vehicles"
        },
        {
          id: "rmc",
          name: "RMC (Ready-Mix Concrete)",
          whatIsIt: "RMC records every concrete delivery to a site.",
          whyUseIt: "So concrete deliveries \u2014 a major cost \u2014 are tracked just as carefully as bagged materials.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open RMC \u2192 Record Delivery (or add it inside today's Daily Report).",
            "Pick the Site and the Vendor.",
            "Enter the quantity (in m\xB3), the grade, and the rate.",
            "Save."
          ],
          afterSaving: "The total cost is worked out automatically (quantity \xD7 rate) and added to that site's cost in Reports.",
          example: "12 m\xB3 of M25-grade concrete delivered to Site A \u2192 recorded instantly, with its cost rolled into that site's total spend.",
          href: "/rmc"
        },
        {
          id: "expenses",
          name: "Expenses",
          whatIsIt: "Expenses records money spent at a site that isn't a material purchase \u2014 fuel, food, small repairs, and so on.",
          whyUseIt: "So every rupee spent on site is on record, not just the big purchases.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Expenses \u2192 Record Expense (or add it inside today's Daily Report).",
            "Pick the Site and a category (fuel, labour welfare, and so on).",
            "Enter the amount.",
            "Save."
          ],
          afterSaving: "The amount is added instantly to that site's total spend, and to the month's overall expense total on the Dashboard.",
          example: "\u20B92,000 spent on diesel at Site A today \u2192 shows up immediately in today's expenses and this month's total.",
          href: "/expenses"
        },
        {
          id: "waste-disposal",
          name: "Waste & Disposal",
          whatIsIt: "Waste & Disposal records what it costs to remove debris or waste material from a site \u2014 by the truckload.",
          whyUseIt: "So the real cost of clearing a site is tracked, whether it's paid to an outside truck or done with the company's own vehicle.",
          usedBy: ["OWNER_ADMIN", "SITE_SUPERVISOR"],
          howToUse: [
            "Open Waste & Disposal \u2192 Record Disposal.",
            "Say what kind of waste it is, and whether it's an outside party (hired) or the company's own vehicle (own).",
            "If hired, pick who was paid.",
            "Enter the number of trips and the rate per trip.",
            "Save."
          ],
          afterSaving: "The total cost is worked out automatically (trips \xD7 rate, plus any extra charges) and added to that site's total cost.",
          example: "6 truckloads of debris removed by a hired party at \u20B9450 a trip, plus \u20B9300 loading charge \u2192 total cost \u20B93,000, added to the site's cost automatically.",
          href: "/waste-disposal"
        },
        {
          id: "dsr",
          name: "Daily Report (DSR)",
          whatIsIt: "The Daily Report (you may also hear it called the DSR) is the site's daily update \u2014 one entry that covers everything that happened today.",
          whyUseIt: "So the supervisor tells the system what happened once, instead of typing the same information into five different screens.",
          usedBy: ["SITE_SUPERVISOR"],
          howToUse: [
            "Open today's report on your phone.",
            "Pick the site (today's date is already filled in).",
            "Tick who was present.",
            "Add the materials used today.",
            "Add any concrete (RMC) delivered.",
            "Add today's expenses.",
            "Add photos.",
            "Write down any problems.",
            "Submit."
          ],
          afterSaving: "One submission automatically updates attendance, reduces material stock, adds today's expenses, and becomes part of that site's history and reports \u2014 all from one form.",
          example: "Submitting today's Daily Report at Site A instantly shows up on the Owner's Dashboard, updates the stock for the cement used, and logs the \u20B92,000 spent on fuel.",
          href: "/dsr/new"
        },
        {
          id: "reports",
          name: "Reports",
          whatIsIt: "Reports is where the Owner can see a summary of any site, or the whole company, over any date range.",
          whyUseIt: 'So the Owner can answer questions like "how much did we spend this month" without doing the maths by hand.',
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Reports.",
            "Pick a tab \u2014 Site, Inventory, Labour, Machinery, or Financial.",
            "Optionally pick a site and a date range.",
            "The numbers update to match."
          ],
          afterSaving: "Nothing to save \u2014 Reports are always live, built from everything already recorded elsewhere. A branded daily report is also compiled automatically for each site, ready to review.",
          example: "Pick Financial \u2192 All Sites \u2192 this month, and see the total spent on material, labour, RMC, machinery, expenses, and waste disposal, site by site.",
          href: "/reports"
        },
        {
          id: "settings",
          name: "Settings",
          whatIsIt: "Settings is where the Owner controls the company's branding, user accounts, and the dropdown lists used across the app.",
          whyUseIt: "So the app looks like the company's own product, and only the right people can use it.",
          usedBy: ["OWNER_ADMIN"],
          howToUse: [
            "Open Settings.",
            "Update the company name, logo, and colours under Branding.",
            "Add or manage user accounts under Users & Roles.",
            "Manage dropdown lists (material categories, expense types, and so on) under Categories."
          ],
          afterSaving: "Branding changes appear on the next report generated. A new user can sign in immediately with the password they were given.",
          example: "The Owner uploads their own logo \u2192 every report generated from then on carries that logo, not a placeholder.",
          href: "/settings"
        }
      ],
      // ---- The three visual stories the brief calls out for special treatment ----
      inventoryStory: {
        purchase: { steps: ["Vendor", "100 bags Cement", "Site A", "Stock = 100"] },
        consumption: { steps: ["50 bags used", "Stock automatically becomes 50"] },
        movement: { steps: ["20 bags moved to Site B", "Site A = 30", "Site B = 20"] }
      },
      labourStory: {
        steps: [
          "Worker joins",
          "Works at Site A",
          "Daily work recorded",
          "Advance given",
          "Wages calculated",
          "Advance deducted",
          "Payment recorded"
        ],
        example: { wage: 1e4, advance: 2e3, paid: 8e3, workerName: "Ramesh" }
      },
      dsrStory: {
        steps: [
          "Supervisor opens app",
          "Selects site",
          "Records today's labour",
          "Records material used",
          "Records machinery",
          "Records expenses",
          "Adds photos",
          "Reports issues",
          "Submits"
        ],
        contributesTo: ["Attendance", "Inventory", "Expenses", "Site History", "Reports"]
      },
      ownerMorning: {
        lines: [
          "5 Active Sites",
          "4 Sites Updated Today",
          "1 Site Needs Attention",
          "Cement Low at Site B",
          "\u20B945,000 Vendor Payments Pending"
        ]
      },
      dayInTheLife: [
        { time: "Morning", title: "Supervisor reaches Site A", detail: "The day begins." },
        { time: "Material arrives", title: "100 bags cement received", detail: "Recorded as a Purchase \u2014 stock rises to 100." },
        { time: "Labour starts work", title: "20 workers present", detail: "Marked present for today." },
        { time: "Work happens", title: "50 bags cement consumed", detail: "Recorded as Consumption \u2014 stock drops to 50." },
        { time: "Expense occurs", title: "\u20B92,000 site expense recorded", detail: "Fuel for the day, logged on the spot." },
        { time: "Supervisor takes photos", title: "Photos attached to today's report", detail: "No separate upload screen \u2014 same form." },
        { time: "Daily Report submitted", title: "One tap, everything above included", detail: "Attendance, stock, expenses, photos \u2014 all in one entry." },
        { time: "Owner sees update", title: "Owner can now see the site's latest information", detail: "No phone call needed." }
      ],
      beforeAfter: {
        before: ["WhatsApp", "Paper", "Excel", "Phone calls", "Lost challans", "Manual calculations", "Delayed reports"],
        after: ["One system", "Connected records", "Connected inventory", "Tracked advances", "Reports ready instantly"]
      },
      clientValue: {
        owner: [
          "See all sites in one place",
          "Know what is happening",
          "Control material",
          "Control expenses",
          "Track labour",
          "Track vendors",
          "Reduce manual work",
          "Get reports quickly"
        ],
        supervisor: [
          "Easy mobile updates",
          "Less paperwork",
          "No repeated data entry",
          "Easy photo capture",
          "Simple daily reporting"
        ]
      },
      endToEndDemo: [
        "Create Site",
        "Add Materials",
        "Add Vendors",
        "Add Team",
        "Purchase Material",
        "Move Material",
        "Use Material",
        "Record Labour",
        "Record Expenses",
        "Submit Daily Report",
        "Owner Reviews",
        "Generate Report"
      ],
      // ---- Visual step-by-step guides (Help & Guides + "Try it yourself") ----
      guides: [
        {
          id: "record-consumption",
          moduleId: "consumption",
          title: "How to record material consumption",
          steps: [
            { title: "Open Movements", detail: "From the sidebar, open Movements, or add it directly inside today's report." },
            { title: "Select Site", detail: "Pick the site where the material was used." },
            { title: "Select Material", detail: "Pick the material and its size from the list." },
            { title: "Enter Quantity", detail: "Type how much was used." },
            { title: "Save", detail: "Tap Record Consumption." }
          ],
          result: "The site's stock automatically decreases.",
          tryItHref: "/movements/consumption/new"
        },
        {
          id: "create-site",
          moduleId: "sites",
          title: "How to create a site",
          steps: [
            { title: "Open Sites", detail: "From the sidebar, open Sites." },
            { title: "Add Site", detail: "Tap Add Site." },
            { title: "Enter details", detail: "Name, location, and contract reference if you have one." },
            { title: "Save", detail: "Tap Save." }
          ],
          result: "The site is ready to use everywhere in the app.",
          tryItHref: "/sites/new"
        },
        {
          id: "record-purchase",
          moduleId: "purchases",
          title: "How to record a material purchase",
          steps: [
            { title: "Open Movements", detail: "From the sidebar, open Movements." },
            { title: "Record Purchase", detail: "Tap Record Purchase." },
            { title: "Pick Vendor and Material", detail: "Choose who supplied it and what was bought." },
            { title: "Enter quantity and rate", detail: "The total is calculated for you." },
            { title: "Save", detail: "Tap Record Purchase." }
          ],
          result: "Stock goes up at the Godown or Site immediately.",
          tryItHref: "/movements/purchases/new"
        },
        {
          id: "give-advance",
          moduleId: "advances",
          title: "How to give a worker an advance",
          steps: [
            { title: "Open Team & Labour", detail: "From the sidebar, open Team & Labour." },
            { title: "Open the worker", detail: "Tap the worker's name." },
            { title: "Give Advance", detail: "Tap Give Advance." },
            { title: "Enter amount and reason", detail: "A short reason is required." },
            { title: "Save", detail: "Tap Save." }
          ],
          result: "The worker's Outstanding Balance goes up immediately.",
          tryItHref: "/team"
        },
        {
          id: "submit-dsr",
          moduleId: "dsr",
          title: "How to submit today's report",
          steps: [
            { title: "Open today's report", detail: "From your phone, open the Daily Report." },
            { title: "Select site", detail: "Today's date is already filled in." },
            { title: "Add labour", detail: "Tick who was present." },
            { title: "Add material", detail: "Add what was used today." },
            { title: "Add expenses", detail: "Add anything spent today." },
            { title: "Add photos", detail: "Tap the camera icon." },
            { title: "Submit", detail: "Tap Submit Daily Report." }
          ],
          result: "Attendance, stock, expenses and photos are all updated together.",
          tryItHref: "/dsr/new"
        }
      ],
      // ---- Contextual help ("ⓘ") pop-up text ----
      contextualHelp: [
        { key: "material-consumption", explanation: "When you record material used at the site, the available stock is automatically reduced." },
        { key: "advance", explanation: "An advance is money given to a worker before their final payment. It's subtracted automatically when the payment is recorded." },
        { key: "outstanding-balance", explanation: "This is how much advance money a worker has taken that hasn't been paid back yet." },
        { key: "godown", explanation: "The Godown is the company's central store \u2014 material can sit here before it's sent to a specific site." },
        { key: "correct", explanation: "Correct fixes a mistake by adding a new, linked entry explaining what changed \u2014 the original record is never deleted, so there's always a full history." },
        { key: "site-stock", explanation: "This is how much material is physically available right now at this site." },
        { key: "payment-status", explanation: "Shows whether a vendor bill has been paid, partly paid, or not paid yet." },
        { key: "net-payable", explanation: "The actual amount a worker is paid: wage plus any extra, minus deductions, minus any advance being settled." }
      ],
      // ---- Honest scope boundaries — never presented as available today ----
      comingSoon: [
        { title: "Automatic WhatsApp report delivery", detail: "Daily reports are compiled automatically today; sending them over WhatsApp is not switched on yet." },
        { title: "Marking a vendor bill as paid later", detail: "A purchase records its payment status when it's created; changing it afterwards isn't available yet." },
        { title: "One search box for the whole app", detail: "Searching everything \u2014 sites, materials, workers, vendors \u2014 from one box is being built." }
      ],
      futureImprovements: [
        { title: "Automatic alerts", detail: "Sending a message the moment stock runs low or a site misses a report, instead of the Owner having to open the Dashboard to see it." },
        { title: "Downloadable PDF reports", detail: "A one-click PDF version of any report to forward to a client or bank." },
        { title: "Restoring a deleted site or vendor", detail: "Today, deleting hides it everywhere but records are never lost \u2014 bringing it back currently needs support to step in." }
      ]
    };
  }
});

// ../../packages/shared/src/index.ts
var src_exports = {};
__export(src_exports, {
  HELP_CONTENT: () => HELP_CONTENT,
  REPORT_SCHEDULE_FREQUENCIES: () => REPORT_SCHEDULE_FREQUENCIES,
  REPORT_SCHEDULE_TYPES: () => REPORT_SCHEDULE_TYPES,
  ROLES: () => ROLES,
  WASTE_DISPOSAL_OWNERSHIP: () => WASTE_DISPOSAL_OWNERSHIP,
  WASTE_DISPOSAL_PAYMENT_STATUSES: () => WASTE_DISPOSAL_PAYMENT_STATUSES,
  assetLocationStatusSchema: () => assetLocationStatusSchema,
  assetTypeSchema: () => assetTypeSchema,
  collectActiveRequiredIssues: () => collectActiveRequiredIssues,
  collectRateTypeIssues: () => collectRateTypeIssues,
  completePurchasePricingSchema: () => completePurchasePricingSchema,
  confirmMovementReceiptSchema: () => confirmMovementReceiptSchema,
  confirmPhotoUploadSchema: () => confirmPhotoUploadSchema,
  contractStatusSchema: () => contractStatusSchema,
  correctDsrSchema: () => correctDsrSchema,
  createAdvanceAdjustmentSchema: () => createAdvanceAdjustmentSchema,
  createAdvanceSchema: () => createAdvanceSchema,
  createAssetMovementSchema: () => createAssetMovementSchema,
  createAssetServiceLogSchema: () => createAssetServiceLogSchema,
  createConsumptionSchema: () => createConsumptionSchema,
  createDsrSchema: () => createDsrSchema,
  createEmploymentTypeSchema: () => createEmploymentTypeSchema,
  createExpenseCategorySchema: () => createExpenseCategorySchema,
  createExpenseSchema: () => createExpenseSchema,
  createMachinerySchema: () => createMachinerySchema,
  createMachineryTypeSchema: () => createMachineryTypeSchema,
  createMaterialCategorySchema: () => createMaterialCategorySchema,
  createMaterialSchema: () => createMaterialSchema,
  createMaterialSizeSchema: () => createMaterialSizeSchema,
  createMovementSchema: () => createMovementSchema,
  createPaymentSchema: () => createPaymentSchema,
  createPurchaseSchema: () => createPurchaseSchema,
  createReportScheduleSchema: () => createReportScheduleSchema,
  createReturnWastageSchema: () => createReturnWastageSchema,
  createRmcEntrySchema: () => createRmcEntrySchema,
  createSiteContractSchema: () => createSiteContractSchema,
  createSiteSchema: () => createSiteSchema,
  createSubcontractorPaymentSchema: () => createSubcontractorPaymentSchema,
  createSubcontractorSchema: () => createSubcontractorSchema,
  createSubcontractorWorkEntrySchema: () => createSubcontractorWorkEntrySchema,
  createTeamMemberSchema: () => createTeamMemberSchema,
  createUnitSchema: () => createUnitSchema,
  createUserSchema: () => createUserSchema,
  createVehicleSchema: () => createVehicleSchema,
  createVehicleTypeSchema: () => createVehicleTypeSchema,
  createVendorSchema: () => createVendorSchema,
  createWasteDisposalSchema: () => createWasteDisposalSchema,
  createWorkRecordBatchSchema: () => createWorkRecordBatchSchema,
  createWorkRecordSchema: () => createWorkRecordSchema,
  customFieldDefinitionSchema: () => customFieldDefinitionSchema,
  customFieldTypeSchema: () => customFieldTypeSchema,
  customFieldsSchema: () => customFieldsSchema,
  dsrConsumptionSchema: () => dsrConsumptionSchema,
  dsrEquipmentUsedSchema: () => dsrEquipmentUsedSchema,
  dsrExpenseSchema: () => dsrExpenseSchema,
  dsrRmcEntrySchema: () => dsrRmcEntrySchema,
  dsrWorkRecordSchema: () => dsrWorkRecordSchema,
  loginSchema: () => loginSchema,
  markPaymentPaidSchema: () => markPaymentPaidSchema,
  movementKindSchema: () => movementKindSchema,
  paymentStatusSchema: () => paymentStatusSchema,
  presignPhotoUploadSchema: () => presignPhotoUploadSchema,
  purchaseDestinationSchema: () => purchaseDestinationSchema,
  rateTypeSchema: () => rateTypeSchema,
  reportScheduleFrequencySchema: () => reportScheduleFrequencySchema,
  reportScheduleTypeSchema: () => reportScheduleTypeSchema,
  returnWastageKindSchema: () => returnWastageKindSchema,
  serviceLogKindSchema: () => serviceLogKindSchema,
  siteStatusSchema: () => siteStatusSchema,
  subcontractorPaymentTypeSchema: () => subcontractorPaymentTypeSchema,
  updateAssetServiceLogSchema: () => updateAssetServiceLogSchema,
  updateBrandingConfigSchema: () => updateBrandingConfigSchema,
  updateEmploymentTypeSchema: () => updateEmploymentTypeSchema,
  updateExpenseCategorySchema: () => updateExpenseCategorySchema,
  updateMachinerySchema: () => updateMachinerySchema,
  updateMachineryTypeSchema: () => updateMachineryTypeSchema,
  updateMaterialCategorySchema: () => updateMaterialCategorySchema,
  updateMaterialSchema: () => updateMaterialSchema,
  updateNotificationChannelSettingSchema: () => updateNotificationChannelSettingSchema,
  updateReportScheduleSchema: () => updateReportScheduleSchema,
  updateSiteContractSchema: () => updateSiteContractSchema,
  updateSiteSchema: () => updateSiteSchema,
  updateSubcontractorSchema: () => updateSubcontractorSchema,
  updateTeamMemberSchema: () => updateTeamMemberSchema,
  updateUnitSchema: () => updateUnitSchema,
  updateUserRoleSchema: () => updateUserRoleSchema,
  updateVehicleSchema: () => updateVehicleSchema,
  updateVehicleTypeSchema: () => updateVehicleTypeSchema,
  updateVendorSchema: () => updateVendorSchema
});
var init_src = __esm({
  "../../packages/shared/src/index.ts"() {
    "use strict";
    init_roles();
    init_auth();
    init_user();
    init_site();
    init_daily_site_report();
    init_photo();
    init_material_category();
    init_unit();
    init_material();
    init_purchase();
    init_movement();
    init_consumption();
    init_return_wastage();
    init_employment_type();
    init_team_member();
    init_work_record();
    init_advance();
    init_advance_adjustment();
    init_payment();
    init_machinery_type();
    init_vehicle_type();
    init_machinery();
    init_vehicle();
    init_asset_movement();
    init_asset_service_log();
    init_vendor();
    init_expense_category();
    init_expense();
    init_rmc_entry();
    init_waste_disposal();
    init_branding_config();
    init_notification_channel_setting();
    init_report_schedule();
    init_subcontractor();
    init_site_contract();
    init_subcontractor_work_entry();
    init_subcontractor_payment();
    init_activity_feed();
    init_photo_gallery();
    init_report_filters();
    init_list_query();
    init_search_result();
    init_help_content();
  }
});

// dist/src/common/zod-validation.pipe.js
var require_zod_validation_pipe = __commonJS({
  "dist/src/common/zod-validation.pipe.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZodValidationPipe = void 0;
    var common_1 = require("@nestjs/common");
    var ZodValidationPipe = class {
      schema;
      constructor(schema) {
        this.schema = schema;
      }
      transform(value, metadata = { type: "body" }) {
        if (metadata.type !== "body") {
          return value;
        }
        const result = this.schema.safeParse(value);
        if (!result.success) {
          throw new common_1.BadRequestException({
            error: {
              code: "VALIDATION_FAILED",
              message: "Request body failed validation.",
              details: result.error.flatten()
            }
          });
        }
        return result.data;
      }
    };
    exports2.ZodValidationPipe = ZodValidationPipe;
  }
});

// dist/src/generated/prisma/internal/class.js
var require_class = __commonJS({
  "dist/src/generated/prisma/internal/class.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getPrismaClientClass = getPrismaClientClass;
    var runtime = __importStar(require("@prisma/client/runtime/client"));
    var config = {
      "previewFeatures": [],
      "clientVersion": "7.9.1",
      "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
      "activeProvider": "postgresql",
      "inlineSchema": '// Single schema, run identically against every tenant\'s separate database\n// (architecture spine AD-2, AD-12). No tenant_id anywhere \u2014 AD-1 forbids it;\n// a deployment\'s database belongs to exactly one Tenant.\n//\n// Tables listed under "Append-only (AD-9)" below are never UPDATEd or\n// DELETEd by application code \u2014 enforced by revoking those grants from the\n// API\'s Postgres role in the deployment migration, not by Prisma itself.\n// A correction is a new row with `correctsId` pointing at the row it fixes\n// and a required `reason`.\n\ngenerator client {\n  provider     = "prisma-client"\n  output       = "../../apps/api/src/generated/prisma"\n  moduleFormat = "cjs" // apps/api is a CommonJS NestJS build, not ESM\n}\n\n// Connection URL lives in prisma.config.ts (Prisma 7), not here.\ndatasource db {\n  provider = "postgresql"\n}\n\n// ---------- Identity ----------\n\nenum Role {\n  OWNER_ADMIN\n  SITE_SUPERVISOR\n}\n\n// This table owns both authentication (bcrypt passwordHash, verified by\n// apps/api\'s own /auth/login) and authorization (AD-10, AD-11 \u2014 Role here is\n// the only in-app role set, never "Platform Operator").\nmodel User {\n  id           String   @id @default(uuid(7))\n  name         String\n  email        String   @unique\n  passwordHash String\n  role         Role\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  dailySiteReports DailySiteReport[]\n  photos           Photo[]\n  auditLogs        AuditLog[]\n}\n\n// Audit trail (write-once, never updated or deleted): one row per\n// successful mutating API request, written automatically by the global\n// AuditLogInterceptor \u2014 a new write endpoint is audited by construction,\n// with no per-service code. Who (userId), what (action/entityType/\n// entityId), where (siteId when the write named one), when (occurredAt).\nmodel AuditLog {\n  id         String   @id @default(uuid(7))\n  occurredAt DateTime @default(now())\n  userId     String\n  user       User     @relation(fields: [userId], references: [id])\n  method     String // POST | PATCH | DELETE\n  path       String // the request path, e.g. /waste-disposals\n  action     String // human summary, e.g. "Created Waste Disposal"\n  entityType String?\n  entityId   String?\n  siteId     String?\n\n  // The read path is "latest 200, optionally filtered by site/user/date"\n  // over a table that grows forever \u2014 index the sort key and both filters.\n  @@index([occurredAt])\n  @@index([siteId])\n  @@index([userId])\n}\n\n// ---------- Sites ----------\n\nenum SiteStatus {\n  ACTIVE\n  COMPLETED\n  ON_HOLD\n}\n\nmodel Site {\n  id                String     @id @default(uuid(7))\n  name              String\n  location          String\n  status            SiteStatus @default(ACTIVE)\n  contractReference String?\n  description       String?\n  // Soft delete: a deleted Site disappears from every list/picker but its\n  // row \u2014 and every transaction row pointing at it \u2014 stays in the database\n  // (the ledger\'s history is never destroyed). Master-data-only concept;\n  // AD-9 transaction tables are corrected, never deleted.\n  deletedAt         DateTime?\n  createdAt         DateTime   @default(now())\n  updatedAt         DateTime   @updatedAt\n\n  siteStock              SiteStock[]\n  purchases              Purchase[]\n  movementsFrom          Movement[]             @relation("MovementSourceSite")\n  movementsTo            Movement[]             @relation("MovementDestinationSite")\n  consumptions           Consumption[]\n  returnWastages         ReturnWastage[]\n  machineryMovements     MachineryMovementLog[]\n  vehicleMovements       VehicleMovementLog[]\n  workRecords            WorkRecord[]\n  rmcEntries             RmcEntry[]\n  dailySiteReports       DailySiteReport[]\n  expenses               Expense[]\n  machineryCurrentlyHere Machinery[]\n  vehiclesCurrentlyHere  Vehicle[]\n  dailyReports           DailyReport[]\n  wasteDisposals         WasteDisposal[]\n  siteContracts          SiteContract[]\n}\n\n// ---------- Material catalog (FR-4..FR-7) ----------\n\nmodel MaterialCategory {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  isActive  Boolean    @default(true)\n  materials Material[]\n}\n\nmodel Unit {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  // FR-49, NFR-4: brings Unit in line with every other admin-configurable\n  // lookup type\'s rename/disable lifecycle (MachineryType, VehicleType,\n  // EmploymentType, ExpenseCategory) \u2014 disabling hides it from new-Material\n  // entry forms without touching Materials already using it.\n  isActive  Boolean    @default(true)\n  materials Material[]\n}\n\nmodel Material {\n  id                String           @id @default(uuid(7))\n  categoryId        String\n  category          MaterialCategory @relation(fields: [categoryId], references: [id])\n  unitId            String\n  unit              Unit             @relation(fields: [unitId], references: [id])\n  name              String\n  isActive          Boolean          @default(true)\n  customFields      Json             @default("{}") // FR-7 \u2014 admin custom fields, no migration needed\n  lowStockThreshold Decimal? // FR-36 \u2014 nullable: no threshold set means never flagged, never a default nobody chose\n\n  sizes MaterialSize[]\n\n  @@unique([categoryId, name])\n}\n\nmodel MaterialSize {\n  id         String   @id @default(uuid(7))\n  materialId String\n  material   Material @relation(fields: [materialId], references: [id])\n  label      String // e.g. "300mm"\n\n  godownStock    GodownStock[]\n  siteStock      SiteStock[]\n  purchases      Purchase[]\n  movements      Movement[]\n  consumptions   Consumption[]\n  returnWastages ReturnWastage[]\n\n  @@unique([materialId, label])\n}\n\n// ---------- Inventory lifecycle (FR-8..FR-14) ----------\n// GodownStock/SiteStock are materialized, write-path-only balances\n// (AD-9): the only writer is the same transaction that inserts the\n// causing Purchase/Movement/Consumption/ReturnWastage row.\n\nmodel GodownStock {\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([materialSizeId])\n}\n\nmodel SiteStock {\n  siteId         String\n  site           Site         @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([siteId, materialSizeId])\n}\n\nenum PurchaseDestination {\n  GODOWN\n  SITE\n}\n\n// Append-only (AD-9).\nmodel Purchase {\n  id                 String              @id @default(uuid(7))\n  vendorId           String\n  vendor             Vendor              @relation(fields: [vendorId], references: [id])\n  materialSizeId     String\n  materialSize       MaterialSize        @relation(fields: [materialSizeId], references: [id])\n  destination        PurchaseDestination\n  siteId             String? // required when destination = SITE (FR-8, FR-10)\n  site               Site?               @relation(fields: [siteId], references: [id])\n  quantity           Decimal\n  // Pricing is nullable (decision D7, 2026-09-01): a Site Supervisor records\n  // the physical facts at the gate (vendor/material/quantity/challan) and the\n  // Owner/Admin completes rate/totalAmount/paymentStatus later via\n  // PATCH /purchases/:id/pricing. `totalAmount IS NULL` \u21D4 "Pricing pending".\n  // That PATCH is a one-time fill of these to-be-priced fields only \u2014 never\n  // a change to an already-priced row (AD-9\'s append-only rule still governs\n  // every recorded value; priced corrections go through the Correct flow).\n  rate               Decimal?\n  totalAmount        Decimal?\n  invoiceOrChallanNo String?\n  challanPhotoUrl    String?\n  paymentStatus      String?\n  deliveryLocation   String?\n  vehicleDetails     String?\n  receiverName       String? // FR-10 direct Vendor->Site\n  notes              String?\n  purchasedAt        DateTime\n  createdAt          DateTime            @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  expenses Expense[]\n}\n\nenum MovementKind {\n  GODOWN_TO_SITE // FR-9\n  SITE_TO_SITE // FR-11\n}\n\n// Append-only (AD-9).\nmodel Movement {\n  id                String       @id @default(uuid(7))\n  kind              MovementKind\n  materialSizeId    String\n  materialSize      MaterialSize @relation(fields: [materialSizeId], references: [id])\n  sourceSiteId      String? // null when kind = GODOWN_TO_SITE (source is the Godown)\n  sourceSite        Site?        @relation("MovementSourceSite", fields: [sourceSiteId], references: [id])\n  destinationSiteId String\n  destinationSite   Site         @relation("MovementDestinationSite", fields: [destinationSiteId], references: [id])\n  sentQuantity      Decimal\n  receivedQuantity  Decimal? // shortage/damage gap = sentQuantity - receivedQuantity\n  vehicleDetails    String?\n  personResponsible String?\n  notes             String?\n  movedAt           DateTime\n  createdAt         DateTime     @default(now())\n  correctsId        String?\n  reason            String?\n\n  @@index([materialSizeId])\n}\n\n// Append-only (AD-9).\nmodel Consumption {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  materialSizeId    String\n  materialSize      MaterialSize     @relation(fields: [materialSizeId], references: [id])\n  quantity          Decimal\n  activityReference String?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  recordedByUserId  String\n  notes             String?\n  consumedAt        DateTime\n  createdAt         DateTime         @default(now())\n  correctsId        String?\n  reason            String?\n  // Story 3.2: set by the offline queue at queue-write time so a retried\n  // sync upserts the same row instead of creating a duplicate \u2014 this\n  // model has no other natural key (a Site can legitimately have two\n  // separate Consumption entries for the same Material on the same day).\n  clientGeneratedId String?          @unique\n}\n\nenum ReturnWastageKind {\n  RETURN\n  WASTAGE\n}\n\n// Append-only (AD-9).\nmodel ReturnWastage {\n  id             String            @id @default(uuid(7))\n  siteId         String\n  site           Site              @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize      @relation(fields: [materialSizeId], references: [id])\n  kind           ReturnWastageKind\n  quantity       Decimal\n  notes          String?\n  recordedAt     DateTime\n  createdAt      DateTime          @default(now())\n  correctsId     String?\n  reason         String?\n}\n\n// ---------- Machinery & Vehicles (FR-15..FR-18) ----------\n\nenum AssetLocationStatus {\n  AVAILABLE\n  AT_SITE\n  MAINTENANCE\n}\n\n// FR-15, NFR-4: admin-configurable data, not a hardcoded enum or free\n// string \u2014 same minimal create+list-now, full admin lifecycle later\n// (Epic 14) split Epic 4 Story 4.1 used for Unit (no isActive field\n// either, same precedent).\nmodel MachineryType {\n  id        String      @id @default(uuid(7))\n  name      String      @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 8.1 deferred to\n  // Epic 14. Disabling hides the type from new-asset entry forms without\n  // touching Machinery already assigned to it \u2014 master data, an in-place edit,\n  // never one of AD-9\'s append-only tables.\n  isActive  Boolean     @default(true)\n  machinery Machinery[]\n}\n\n// FR-16, NFR-4: same split as MachineryType above \u2014 a separate table, not\n// shared with it, since Machinery and Vehicle types aren\'t the same\n// domain concept.\nmodel VehicleType {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): same admin-lifecycle addition as MachineryType.\n  isActive Boolean   @default(true)\n  vehicles Vehicle[]\n}\n\nmodel Machinery {\n  id            String              @id @default(uuid(7))\n  name          String\n  typeId        String\n  type          MachineryType       @relation(fields: [typeId], references: [id])\n  assetNumber   String              @unique\n  model         String?\n  ownership     String?\n  operator      String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs   MachineryMovementLog[]\n  serviceLogs    MachineryServiceLog[]\n  wasteDisposals WasteDisposal[]\n}\n\n// Append-only (AD-9) \u2014 full movement history, not just current state.\n// Story 8.2: a correction is a new row with correctsId set, whose\n// toStatus/siteId is a full restatement of the corrected value (not a\n// delta, unlike Purchase/Movement/Consumption\'s numeric quantities) \u2014 same\n// plain correctsId/reason pattern as elsewhere in this schema, no\n// enforced self-relation.\nmodel MachineryMovementLog {\n  id          String              @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery           @relation(fields: [machineryId], references: [id])\n  toStatus    AssetLocationStatus\n  siteId      String?\n  site        Site?               @relation(fields: [siteId], references: [id])\n  movedAt     DateTime\n  createdAt   DateTime            @default(now())\n  correctsId  String?\n  reason      String? // required when correctsId is set\n}\n\nmodel MachineryServiceLog {\n  id          String    @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery @relation(fields: [machineryId], references: [id])\n  kind        String // fuel | maintenance | repair\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime  @default(now())\n}\n\nmodel Vehicle {\n  id            String              @id @default(uuid(7))\n  number        String              @unique\n  typeId        String\n  type          VehicleType         @relation(fields: [typeId], references: [id])\n  ownership     String?\n  driver        String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs   VehicleMovementLog[]\n  serviceLogs    VehicleServiceLog[]\n  wasteDisposals WasteDisposal[]\n}\n\n// Append-only (AD-9). Same correction shape as MachineryMovementLog above.\nmodel VehicleMovementLog {\n  id         String              @id @default(uuid(7))\n  vehicleId  String\n  vehicle    Vehicle             @relation(fields: [vehicleId], references: [id])\n  toStatus   AssetLocationStatus\n  siteId     String?\n  site       Site?               @relation(fields: [siteId], references: [id])\n  movedAt    DateTime\n  createdAt  DateTime            @default(now())\n  correctsId String?\n  reason     String? // required when correctsId is set\n}\n\nmodel VehicleServiceLog {\n  id          String   @id @default(uuid(7))\n  vehicleId   String\n  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])\n  kind        String\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime @default(now())\n}\n\n// ---------- Labour (FR-19..FR-25) ----------\n\n// FR-19, NFR-4: admin-configurable data, not a hardcoded enum \u2014 same\n// minimal create+list-now, full admin lifecycle later (Epic 14) split\n// Epic 4 Story 4.1 used for Unit.\nmodel EmploymentType {\n  id       String  @id @default(uuid(7))\n  name     String  @unique\n  isActive Boolean @default(true)\n\n  teamMembers TeamMember[]\n}\n\nmodel TeamMember {\n  id               String         @id @default(uuid(7))\n  name             String\n  designation      String?\n  contact          String?\n  employmentTypeId String\n  employmentType   EmploymentType @relation(fields: [employmentTypeId], references: [id])\n  isActive         Boolean        @default(true)\n\n  // AD-9\'s materialized, write-path-only balance (Story 7.1) \u2014 same class\n  // of column as GodownStock/SiteStock.quantity, never a value summed from\n  // Advance/AdvanceAdjustment rows on every read.\n  outstandingAdvanceBalance Decimal @default(0)\n\n  workRecords WorkRecord[]\n  advances    Advance[]\n  payments    Payment[]\n}\n\n// One row per Team Member per Site per date (FR-20) \u2014 enforced at the\n// application level (apps/api/src/dsr/dsr.service.ts), not by a DB unique\n// constraint. Story 3.5: a correction that changes an existing crew\n// member\'s attendance for an already-reported date needs to insert its own\n// fresh WorkRecord row (AD-9 \u2014 the original\'s rows are never touched), which\n// a hard unique constraint on (teamMemberId, workDate) would make\n// impossible (a correction and the row it corrects can legitimately share\n// the same team member + date). The "never two Sites, same date"\n// double-booking rule this constraint used to enforce as a DB backstop\n// moved to an explicit application-level check instead (same as\n// DailySiteReport\'s own siteId+reportDate constraint, relaxed for the same\n// reason).\nmodel WorkRecord {\n  id                String           @id @default(uuid(7))\n  teamMemberId      String\n  teamMember        TeamMember       @relation(fields: [teamMemberId], references: [id])\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  workDate          DateTime         @db.Date\n  attended          Boolean          @default(true)\n  hours             Decimal?\n  overtimeHours     Decimal?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  createdAt         DateTime         @default(now())\n\n  @@index([teamMemberId, workDate])\n}\n\n// Append-only (AD-9). `reason` is the business reason the Advance was\n// given (e.g. "medical emergency") \u2014 a different question from why a\n// correcting entry exists, so the correction pair below is a distinct,\n// separately-named field (Story 7.1), same disambiguation DailySiteReport\n// needed for its own pre-existing `notes` field.\nmodel Advance {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  amount           Decimal\n  reason           String?\n  paymentMethod    String?\n  givenAt          DateTime\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n\n  adjustments AdvanceAdjustment[]\n}\n\n// Append-only (AD-9). FR-23: amount must never exceed the Advance\'s\n// current outstanding balance \u2014 enforced in the service layer at the same\n// transaction boundary that writes this row, not just at the UI. `note` is\n// the free-form business note for the adjustment itself \u2014 same\n// disambiguation as Advance.reason vs. correctionReason above.\nmodel AdvanceAdjustment {\n  id               String   @id @default(uuid(7))\n  advanceId        String\n  advance          Advance  @relation(fields: [advanceId], references: [id])\n  paymentId        String?\n  payment          Payment? @relation(fields: [paymentId], references: [id])\n  amount           Decimal\n  note             String?\n  adjustedAt       DateTime\n  createdAt        DateTime @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n}\n\n// Append-only (AD-9). No pre-existing reason/note field to collide with,\n// so this uses the plain correctsId/reason pair (Purchase/Movement/\n// Consumption\'s convention), not the disambiguated correctionReason name\n// Advance/AdvanceAdjustment need above.\nmodel Payment {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  basePay          Decimal\n  additionalAmount Decimal    @default(0)\n  deductions       Decimal    @default(0)\n  netPayable       Decimal\n  // Free text, e.g. "1-15 Aug 2026" \u2014 not a structured date range; no FR\n  // requires a calendar-computed period (Story 7.3).\n  payPeriod        String?\n  status           String // pending | paid\n  paidAt           DateTime?\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  reason           String? // required when correctsId is set\n\n  advanceAdjustments AdvanceAdjustment[]\n}\n\n// ---------- RMC (FR-26..FR-27) ----------\n\nmodel RmcEntry {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  vendorId           String\n  vendor             Vendor   @relation(fields: [vendorId], references: [id])\n  quantityM3         Decimal\n  grade              String\n  ratePerM3          Decimal\n  totalAmount        Decimal\n  invoiceOrChallanNo String?\n  challanPhotoUrl    String?\n  deliveredAt        DateTime\n  createdAt          DateTime @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// ---------- Daily Site Report (FR-28..FR-31) ----------\n\nmodel DailySiteReport {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  reportDate         DateTime @db.Date\n  submittedByUserId  String\n  submittedBy        User     @relation(fields: [submittedByUserId], references: [id])\n  workCompleted      String?\n  workInProgress     String?\n  plannedWork        String?\n  issuesBlockers     String?\n  safetyObservations String?\n  notes              String?\n  createdAt          DateTime @default(now())\n\n  workRecords  WorkRecord[]\n  consumptions Consumption[]\n  photos       Photo[]\n  expenses     Expense[]\n  rmcEntries   RmcEntry[]\n  dailyReports DailyReport[]\n\n  // Informational tagging only \u2014 "JCB 3DX was in use today" is not a\n  // location/status change (that\'s Epic 8\'s MachineryMovementLog /\n  // VehicleMovementLog concern), so this is deliberately not a relation.\n  // Denormalized (stores the name at entry time) so this DSR\'s feed entry\n  // still reads correctly even if the asset is later renamed/deleted.\n  equipmentUsed Json @default("[]")\n\n  // Story 3.5 (AD-9, FR-54): a correction is a new row, never an edit \u2014\n  // same plain correctsId/reason pattern as Purchase/Movement/Consumption\n  // elsewhere in this schema, no enforced self-relation.\n  correctsId String?\n  reason     String? // required when correctsId is set\n\n  @@index([siteId, reportDate])\n}\n\nmodel Photo {\n  id                String          @id @default(uuid(7))\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  storageKey        String // Cloudflare R2 object key\n  uploadedByUserId  String\n  uploadedBy        User            @relation(fields: [uploadedByUserId], references: [id])\n  createdAt         DateTime        @default(now())\n}\n\n// ---------- Vendors & Expenses (FR-39..FR-41) ----------\n\nmodel Vendor {\n  id                String    @id @default(uuid(7))\n  name              String\n  contactPerson     String?\n  phone             String?\n  email             String?\n  address           String?\n  materialsSupplied String[]  @default([])\n  // Soft delete \u2014 same rule as Site.deletedAt.\n  deletedAt         DateTime?\n\n  purchases      Purchase[]\n  rmcEntries     RmcEntry[]\n  wasteDisposals WasteDisposal[]\n}\n\nmodel ExpenseCategory {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 11.1 deferred to\n  // Epic 14. Disabling hides the category from the Expense entry form without\n  // touching Expenses already recorded against it.\n  isActive Boolean   @default(true)\n  expenses Expense[]\n}\n\nmodel Expense {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  categoryId        String\n  category          ExpenseCategory  @relation(fields: [categoryId], references: [id])\n  amount            Decimal\n  description       String?\n  paymentMethod     String?\n  personOrVendor    String?\n  purchaseId        String? // links an Expense that IS a Purchase\'s cost entry\n  purchase          Purchase?        @relation(fields: [purchaseId], references: [id])\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  incurredAt        DateTime\n  createdAt         DateTime         @default(now())\n  // Story 11.1 (AD-9, FR-41): a correction is a new, reason-carrying row\n  // linked to the one it corrects \u2014 never an edit/delete. Plain\n  // correctsId/reason pair (no pre-existing reason/note field on Expense to\n  // collide with), same convention as Purchase/Movement/RmcEntry. A\n  // correcting row\'s `amount` is a signed delta (Epic 5\'s Story 5.1 rule),\n  // not a restated total.\n  correctsId        String?\n  reason            String? // required when correctsId is set\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// Waste & Disposal (debris/excavated-material removal from a Site). A\n// per-trip COST record: the contractor pays to move waste out \u2014 either a\n// hired third party (vendorId + paymentStatus) or an own register asset\n// (machineryId/vehicleId, no vendor). Append-only (AD-9): a correction is\n// a new row with correctsId + reason whose tripCount/otherCharges are\n// SIGNED deltas (Epic 5\'s Story 5.1 rule); ratePerTrip must match the\n// original\'s, and totalAmount is always server-computed\n// (tripCount \xD7 ratePerTrip + otherCharges \u2014 signed on corrections), never\n// client-supplied.\nmodel WasteDisposal {\n  id               String     @id @default(uuid(7))\n  siteId           String\n  site             Site       @relation(fields: [siteId], references: [id])\n  // Free text ("Debris", "Excavated earth / murum") \u2014 waste is not catalog\n  // Material and gets no stock effect; a lookup table would be premature.\n  wasteType        String\n  // Informational only ("approx 40 MT") \u2014 cost is trips \xD7 rate, never this.\n  quantityDetails  String?\n  ownership        String // OWN | HIRED (Zod-enforced vocabulary)\n  vendorId         String?\n  vendor           Vendor?    @relation(fields: [vendorId], references: [id])\n  machineryId      String?\n  machinery        Machinery? @relation(fields: [machineryId], references: [id])\n  vehicleId        String?\n  vehicle          Vehicle?   @relation(fields: [vehicleId], references: [id])\n  // Free text for hired dumpers/trucks that aren\'t in the own registers.\n  vehicleDetails   String?\n  tripCount        Int\n  ratePerTrip      Decimal\n  otherCharges     Decimal    @default(0) // loading/JCB/toll etc.\n  totalAmount      Decimal // server-computed, see model comment\n  disposalLocation String?\n  // PAID | PARTIAL | UNPAID \u2014 HIRED rows only (same vocabulary as\n  // Purchase.paymentStatus); null for OWN rows, never a fabricated PAID.\n  paymentStatus    String?\n  notes            String?\n  disposedAt       DateTime\n  recordedByUserId String\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  reason           String? // required when correctsId is set\n}\n\n// ---------- Branding & Automated Report Delivery (FR-32, FR-33) ----------\n\n// Story 13.1: single-row app-configuration record for this deployment\'s own\n// branding. This is NOT a `Tenant` table in AD-1\'s forbidden sense \u2014 no\n// tenant_id, no cross-tenant selector; it is the same category of thing as\n// infra/tenants/*.json\'s committed per-deployment config, just runtime-\n// editable (a build-time/env-var config couldn\'t satisfy FR-47\'s "no publish\n// step"). Seeded with exactly one row at deploy time (infra/prisma/seed.ts);\n// Epic 14 later adds the admin UI that edits it. `primaryColor` defaults to\n// this product\'s own accent-teal-700 token as a neutral placeholder.\n//\n// Story 14.1 (FR-47) extends 13.1\'s minimum three fields with the rest of the\n// mockup\'s Branding section: two more brand-colour swatches (Secondary/Accent,\n// defaulting to the accent-navy-800 / gold-500 token values), plus the\n// registered address, contact phone and GSTIN. These do NOT recreate the model\n// \u2014 13.1\'s row is edited in place \u2014 so every generated report carries the full\n// business identity, not just a name + one colour.\nmodel BrandingConfig {\n  id                String   @id @default(uuid(7))\n  tenantName        String\n  logoUrl           String?\n  primaryColor      String   @default("#0F5257")\n  secondaryColor    String   @default("#16273E")\n  accentColor       String   @default("#C7912B")\n  registeredAddress String?\n  contactPhone      String?\n  gstin             String?\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n}\n\n// Story 13.1 (FR-32): the compiled, auto-generated per-Site daily report.\n// `content` is the fully-rendered payload \u2014 site name, date, a branding\n// snapshot, and the work/labour/material/RMC/expense summary plus the DSR\'s\n// free-text `equipmentUsed` tags (informational tags entered on the DSR, not\n// machinery-at-site location data) drawn from the linked DSR\'s own relations \u2014\n// deliberately DENORMALIZED and stored\n// at generation time: if BrandingConfig or the underlying DSR data changes\n// afterwards, a historical report must still read exactly as it was\n// delivered, never silently re-render with today\'s branding.\n// `dailySiteReportId` is required \u2014 no DailyReport row exists for a Site/day\n// with no DSR at all (AC #4), so this is not a nullable "maybe compiled"\n// field.\nmodel DailyReport {\n  id                String          @id @default(uuid(7))\n  siteId            String\n  site              Site            @relation(fields: [siteId], references: [id])\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  reportDate        DateTime        @db.Date\n  content           Json\n  generatedAt       DateTime        @default(now())\n\n  deliveries ReportDelivery[]\n\n  @@unique([siteId, reportDate])\n}\n\n// Story 13.1 (FR-33): one row per (DailyReport, channel). `status`/\n// `attempts`/`lastError`/`deliveredAt` are narrowly mutable via retry \u2014 this\n// is lifecycle completion of an in-progress delivery event, NOT an AD-9\n// correction (the same reasoning Epic 5 Story 5.2\'s `confirmReceipt` and\n// Epic 7 Story 7.3\'s `markPaid` already established: completing an\n// in-progress event is not a transaction-history correction), so there is\n// deliberately no correctsId/reason pair here. `@@unique([dailyReportId,\n// channel])` makes delivery idempotent at the DB level: a re-run of the\n// compile Cron (or a `?date=` backfill of an already-processed day) can never\n// create a second row for the same channel, so no double-send is possible even\n// under a check-then-act race \u2014 the create\'s P2002 is caught and treated as\n// "already exists / skip send".\nmodel ReportDelivery {\n  id            String      @id @default(uuid(7))\n  dailyReportId String\n  dailyReport   DailyReport @relation(fields: [dailyReportId], references: [id])\n  channel       String\n  status        String      @default("PENDING")\n  attempts      Int         @default(0)\n  lastError     String?\n  deliveredAt   DateTime?\n  createdAt     DateTime    @default(now())\n\n  @@unique([dailyReportId, channel])\n}\n\n// Story 14.4 (FR-50): which channels receive automated reports, and to whom.\n// This replaces Story 13.1\'s hardcoded enabled-channels set + Owner/Admin\n// recipient default with real, admin-editable configuration. Same\n// configuration-record category as BrandingConfig (Story 13.1) \u2014 NOT an AD-9\n// transaction-history table (no correctsId/reason), edited in place. Seeded\n// (infra/prisma/seed.ts) with exactly the three rows Story 13.1\'s defaults\n// implied, so switching ReportDeliveryService to read from this table does not\n// change day-one delivery behaviour. `channel` is @unique \u2014 it is the natural\n// key the PATCH /notification-settings/:channel route targets. `recipientUserIds`\n// holds User.id values (resolved to emails at send time); IN_APP ignores it\n// (in-app "delivery" has no per-user targeting).\nmodel NotificationChannelSetting {\n  id               String   @id @default(uuid(7))\n  channel          String   @unique\n  enabled          Boolean  @default(false)\n  recipientUserIds String[] @default([])\n}\n\n// Story 14.5 (FR-51): scheduled, multi-cadence delivery of Epic 13\'s report set\n// (Site/Inventory/Labour/Machinery-Vehicle/Financial) \u2014 configured and run\n// entirely INDEPENDENTLY of the daily-DSR delivery (FR-50 / Story 13.1). A\n// separate model + a separate Cron job (POST /cron/run-report-schedules), never\n// a shared "reports" scheduler with a mode flag: independence is structural, not\n// conventional. Configuration record, edited in place (no correctsId/reason) \u2014\n// same category as NotificationChannelSetting / BrandingConfig, NOT an AD-9\n// transaction-history table. `reportType`: SITE | INVENTORY | LABOUR |\n// MACHINERY_VEHICLE | FINANCIAL. `frequency`: DAILY | WEEKLY | MONTHLY. `siteId`\n// optional \u2014 a schedule can be Site-scoped or cover all Sites (null), matching\n// Epic 13\'s own filter shape (plain scalar, not an FK relation \u2014 it is a query\n// param the report endpoints accept, not a structural link). `lastRunAt` drives\n// due-detection: a schedule is due when frequency-worth of time has elapsed\n// since it, or immediately if null.\nmodel ReportSchedule {\n  id               String    @id @default(uuid(7))\n  reportType       String\n  frequency        String\n  recipientUserIds String[]  @default([])\n  enabled          Boolean   @default(false)\n  siteId           String?\n  lastRunAt        DateTime?\n  createdAt        DateTime  @default(now())\n  updatedAt        DateTime  @updatedAt\n}\n\n// ---------- Subcontractor Management (CAP-17, FR-55..FR-63, Epic 18) ----------\n//\n// "Subcontractor" is deliberately NOT called "Contractor" \u2014 that word is\n// already reserved (see Contractor/Company in the glossary) for the tenant\n// itself. A Subcontractor is an external party engaged for a defined scope\n// of Site work, distinct from a Vendor (supplies Material/RMC/services, not\n// labour/work) and from a Team Member (internal labour pool, no commercial\n// contract).\n\n// Master data \u2014 mirrors Vendor field-for-field (external party, soft\n// delete, no createdAt/updatedAt, edited in place via normal PATCH, never\n// AD-9 append-only).\nmodel Subcontractor {\n  id             String    @id @default(uuid(7))\n  name           String\n  contactPerson  String?\n  phone          String?\n  email          String?\n  address        String?\n  workCategories String[]  @default([])\n  deletedAt      DateTime?\n\n  siteContracts SiteContract[]\n}\n\nenum ContractStatus {\n  DRAFT\n  ACTIVE\n  COMPLETED\n  CANCELLED\n}\n\n// A Subcontractor\'s engagement on one Site for one scope of work. Master/\n// agreement data (like Site) edited in place via normal PATCH \u2014 NOT an AD-9\n// append-only table; its own history isn\'t ledgered, only the work/payments\n// recorded against it are (SubcontractorWorkEntry, SubcontractorPayment\n// below). `rateType` is a plain String, Zod-enforced vocabulary (same\n// pattern as Purchase.paymentStatus) \u2014 FIXED_COST | PER_TRIP | PER_PIPE |\n// PER_UNIT | CUSTOM \u2014 not a Prisma enum, since CUSTOM\'s free-text\n// `rateUnitLabel` needs schema-level flexibility a hard enum doesn\'t help\n// with. `rate`/`fixedAmount`/`rateUnitLabel`/`workCategory`/`startDate` may\n// all be null while status is DRAFT (terms still being negotiated); the\n// service layer requires them all present before allowing a transition to\n// ACTIVE (see SiteContractsService) \u2014 deliberately NOT the D7 atomic\n// one-time-fill mechanism from Purchase, since this table isn\'t append-only\n// and a normal in-place edit already does the job with less machinery.\n// `quantityCompleted`/`amountPaid` are materialized, write-path-only\n// figures (AD-9 discipline) updated only in the same transaction as the\n// causing WorkEntry/Payment row \u2014 never summed on read.\nmodel SiteContract {\n  id                String         @id @default(uuid(7))\n  subcontractorId   String\n  subcontractor     Subcontractor  @relation(fields: [subcontractorId], references: [id])\n  siteId            String\n  site              Site           @relation(fields: [siteId], references: [id])\n  workCategory      String?\n  description       String?\n  rateType          String?\n  rateUnitLabel     String?\n  rate              Decimal?\n  fixedAmount       Decimal?\n  estimatedQuantity Decimal?\n  status            ContractStatus @default(DRAFT)\n  startDate         DateTime?\n  endDate           DateTime?\n  quantityCompleted Decimal        @default(0)\n  amountPaid        Decimal        @default(0)\n  createdAt         DateTime       @default(now())\n  updatedAt         DateTime       @updatedAt\n\n  workEntries SubcontractorWorkEntry[]\n  payments    SubcontractorPayment[]\n}\n\n// Append-only (AD-9): a recorded quantity of work done against an Active,\n// non-FIXED_COST Site Contract (trips run, pipes laid, units installed).\n// Site Supervisor or Owner/Admin may write here \u2014 the one Supervisor-facing\n// write surface in this whole feature area. Materializes\n// SiteContract.quantityCompleted via a floor-checked increment (never below\n// zero on a reducing correction).\nmodel SubcontractorWorkEntry {\n  id               String       @id @default(uuid(7))\n  siteContractId   String\n  siteContract     SiteContract @relation(fields: [siteContractId], references: [id])\n  quantity         Decimal\n  workDate         DateTime\n  note             String?\n  recordedByUserId String\n  createdAt        DateTime     @default(now())\n  correctsId       String?\n  reason           String?\n}\n\n// Append-only (AD-9): a Payment or Advance made to a Subcontractor against\n// a Site Contract. Owner/Admin only (money movement). `type` (ADVANCE |\n// PAYMENT, Zod-enforced) is a display/reporting label only \u2014 both\n// contribute identically to SiteContract.amountPaid; there is no separate\n// Adjustment step netting one against the other (unlike TeamMember\'s\n// Advance/AdvanceAdjustment/Payment triad \u2014 a Subcontractor advance has no\n// recoverable-balance concept in this product\'s scope). No payable cap: an\n// advance may legitimately exceed the amount currently payable.\nmodel SubcontractorPayment {\n  id               String       @id @default(uuid(7))\n  siteContractId   String\n  siteContract     SiteContract @relation(fields: [siteContractId], references: [id])\n  type             String\n  amount           Decimal\n  paymentMethod    String?\n  paidAt           DateTime\n  note             String?\n  recordedByUserId String\n  createdAt        DateTime     @default(now())\n  correctsId       String?\n  reason           String?\n}\n',
      "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
      },
      "parameterizationSchema": {
        "strings": [],
        "graph": ""
      }
    };
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToUser"},{"name":"photos","kind":"object","type":"Photo","relationName":"PhotoToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"}],"dbName":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"occurredAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AuditLogToUser"},{"name":"method","kind":"scalar","type":"String"},{"name":"path","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"entityType","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"}],"dbName":null},"Site":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SiteStatus"},{"name":"contractReference","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"SiteToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToSite"},{"name":"movementsFrom","kind":"object","type":"Movement","relationName":"MovementSourceSite"},{"name":"movementsTo","kind":"object","type":"Movement","relationName":"MovementDestinationSite"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToSite"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"ReturnWastageToSite"},{"name":"machineryMovements","kind":"object","type":"MachineryMovementLog","relationName":"MachineryMovementLogToSite"},{"name":"vehicleMovements","kind":"object","type":"VehicleMovementLog","relationName":"SiteToVehicleMovementLog"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"SiteToWorkRecord"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToSite"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToSite"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToSite"},{"name":"machineryCurrentlyHere","kind":"object","type":"Machinery","relationName":"MachineryToSite"},{"name":"vehiclesCurrentlyHere","kind":"object","type":"Vehicle","relationName":"SiteToVehicle"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToSite"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"SiteToWasteDisposal"},{"name":"siteContracts","kind":"object","type":"SiteContract","relationName":"SiteToSiteContract"}],"dbName":null},"MaterialCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToMaterialCategory"}],"dbName":null},"Unit":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToUnit"}],"dbName":null},"Material":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"MaterialCategory","relationName":"MaterialToMaterialCategory"},{"name":"unitId","kind":"scalar","type":"String"},{"name":"unit","kind":"object","type":"Unit","relationName":"MaterialToUnit"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"lowStockThreshold","kind":"scalar","type":"Decimal"},{"name":"sizes","kind":"object","type":"MaterialSize","relationName":"MaterialToMaterialSize"}],"dbName":null},"MaterialSize":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"materialId","kind":"scalar","type":"String"},{"name":"material","kind":"object","type":"Material","relationName":"MaterialToMaterialSize"},{"name":"label","kind":"scalar","type":"String"},{"name":"godownStock","kind":"object","type":"GodownStock","relationName":"GodownStockToMaterialSize"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"MaterialSizeToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"MaterialSizeToPurchase"},{"name":"movements","kind":"object","type":"Movement","relationName":"MaterialSizeToMovement"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToMaterialSize"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"MaterialSizeToReturnWastage"}],"dbName":null},"GodownStock":{"fields":[{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"GodownStockToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"SiteStock":{"fields":[{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToSiteStock"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToSiteStock"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"PurchaseToVendor"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToPurchase"},{"name":"destination","kind":"enum","type":"PurchaseDestination"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"PurchaseToSite"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"rate","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"challanPhotoUrl","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"deliveryLocation","kind":"scalar","type":"String"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"receiverName","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"purchasedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToPurchase"}],"dbName":null},"Movement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"kind","kind":"enum","type":"MovementKind"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToMovement"},{"name":"sourceSiteId","kind":"scalar","type":"String"},{"name":"sourceSite","kind":"object","type":"Site","relationName":"MovementSourceSite"},{"name":"destinationSiteId","kind":"scalar","type":"String"},{"name":"destinationSite","kind":"object","type":"Site","relationName":"MovementDestinationSite"},{"name":"sentQuantity","kind":"scalar","type":"Decimal"},{"name":"receivedQuantity","kind":"scalar","type":"Decimal"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"personResponsible","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Consumption":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ConsumptionToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"ConsumptionToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"activityReference","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"ConsumptionToDailySiteReport"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"consumedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"ReturnWastage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ReturnWastageToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToReturnWastage"},{"name":"kind","kind":"enum","type":"ReturnWastageKind"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"notes","kind":"scalar","type":"String"},{"name":"recordedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryType"}],"dbName":null},"VehicleType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"vehicles","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleType"}],"dbName":null},"Machinery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"MachineryType","relationName":"MachineryToMachineryType"},{"name":"assetNumber","kind":"scalar","type":"String"},{"name":"model","kind":"scalar","type":"String"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"operator","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"MachineryToSite"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"MachineryMovementLog","relationName":"MachineryToMachineryMovementLog"},{"name":"serviceLogs","kind":"object","type":"MachineryServiceLog","relationName":"MachineryToMachineryServiceLog"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"MachineryToWasteDisposal"}],"dbName":null},"MachineryMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"MachineryMovementLogToSite"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vehicle":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"number","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"VehicleType","relationName":"VehicleToVehicleType"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"driver","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"SiteToVehicle"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"VehicleMovementLog","relationName":"VehicleToVehicleMovementLog"},{"name":"serviceLogs","kind":"object","type":"VehicleServiceLog","relationName":"VehicleToVehicleServiceLog"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"VehicleToWasteDisposal"}],"dbName":null},"VehicleMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToVehicleMovementLog"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"VehicleServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"EmploymentType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"teamMembers","kind":"object","type":"TeamMember","relationName":"EmploymentTypeToTeamMember"}],"dbName":null},"TeamMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contact","kind":"scalar","type":"String"},{"name":"employmentTypeId","kind":"scalar","type":"String"},{"name":"employmentType","kind":"object","type":"EmploymentType","relationName":"EmploymentTypeToTeamMember"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"outstandingAdvanceBalance","kind":"scalar","type":"Decimal"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"TeamMemberToWorkRecord"},{"name":"advances","kind":"object","type":"Advance","relationName":"AdvanceToTeamMember"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToTeamMember"}],"dbName":null},"WorkRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"TeamMemberToWorkRecord"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToWorkRecord"},{"name":"workDate","kind":"scalar","type":"DateTime"},{"name":"attended","kind":"scalar","type":"Boolean"},{"name":"hours","kind":"scalar","type":"Decimal"},{"name":"overtimeHours","kind":"scalar","type":"Decimal"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToWorkRecord"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Advance":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"AdvanceToTeamMember"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"reason","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"givenAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"},{"name":"adjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceToAdvanceAdjustment"}],"dbName":null},"AdvanceAdjustment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"advanceId","kind":"scalar","type":"String"},{"name":"advance","kind":"object","type":"Advance","relationName":"AdvanceToAdvanceAdjustment"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"AdvanceAdjustmentToPayment"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"note","kind":"scalar","type":"String"},{"name":"adjustedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"PaymentToTeamMember"},{"name":"basePay","kind":"scalar","type":"Decimal"},{"name":"additionalAmount","kind":"scalar","type":"Decimal"},{"name":"deductions","kind":"scalar","type":"Decimal"},{"name":"netPayable","kind":"scalar","type":"Decimal"},{"name":"payPeriod","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"advanceAdjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceAdjustmentToPayment"}],"dbName":null},"RmcEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"RmcEntryToSite"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"RmcEntryToVendor"},{"name":"quantityM3","kind":"scalar","type":"Decimal"},{"name":"grade","kind":"scalar","type":"String"},{"name":"ratePerM3","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"challanPhotoUrl","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToRmcEntry"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"DailySiteReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailySiteReportToSite"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"submittedByUserId","kind":"scalar","type":"String"},{"name":"submittedBy","kind":"object","type":"User","relationName":"DailySiteReportToUser"},{"name":"workCompleted","kind":"scalar","type":"String"},{"name":"workInProgress","kind":"scalar","type":"String"},{"name":"plannedWork","kind":"scalar","type":"String"},{"name":"issuesBlockers","kind":"scalar","type":"String"},{"name":"safetyObservations","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"DailySiteReportToWorkRecord"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToDailySiteReport"},{"name":"photos","kind":"object","type":"Photo","relationName":"DailySiteReportToPhoto"},{"name":"expenses","kind":"object","type":"Expense","relationName":"DailySiteReportToExpense"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"DailySiteReportToRmcEntry"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToDailySiteReport"},{"name":"equipmentUsed","kind":"scalar","type":"Json"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Photo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToPhoto"},{"name":"storageKey","kind":"scalar","type":"String"},{"name":"uploadedByUserId","kind":"scalar","type":"String"},{"name":"uploadedBy","kind":"object","type":"User","relationName":"PhotoToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vendor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"contactPerson","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"materialsSupplied","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToVendor"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToVendor"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"VendorToWasteDisposal"}],"dbName":null},"ExpenseCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToExpenseCategory"}],"dbName":null},"Expense":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ExpenseToSite"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"ExpenseCategory","relationName":"ExpenseToExpenseCategory"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"description","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"personOrVendor","kind":"scalar","type":"String"},{"name":"purchaseId","kind":"scalar","type":"String"},{"name":"purchase","kind":"object","type":"Purchase","relationName":"ExpenseToPurchase"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToExpense"},{"name":"incurredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"WasteDisposal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToWasteDisposal"},{"name":"wasteType","kind":"scalar","type":"String"},{"name":"quantityDetails","kind":"scalar","type":"String"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"VendorToWasteDisposal"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToWasteDisposal"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToWasteDisposal"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"tripCount","kind":"scalar","type":"Int"},{"name":"ratePerTrip","kind":"scalar","type":"Decimal"},{"name":"otherCharges","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"disposalLocation","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"disposedAt","kind":"scalar","type":"DateTime"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"BrandingConfig":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantName","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"primaryColor","kind":"scalar","type":"String"},{"name":"secondaryColor","kind":"scalar","type":"String"},{"name":"accentColor","kind":"scalar","type":"String"},{"name":"registeredAddress","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"gstin","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"DailyReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailyReportToSite"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailyReportToDailySiteReport"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"content","kind":"scalar","type":"Json"},{"name":"generatedAt","kind":"scalar","type":"DateTime"},{"name":"deliveries","kind":"object","type":"ReportDelivery","relationName":"DailyReportToReportDelivery"}],"dbName":null},"ReportDelivery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailyReportId","kind":"scalar","type":"String"},{"name":"dailyReport","kind":"object","type":"DailyReport","relationName":"DailyReportToReportDelivery"},{"name":"channel","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"lastError","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"NotificationChannelSetting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"channel","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"recipientUserIds","kind":"scalar","type":"String"}],"dbName":null},"ReportSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"reportType","kind":"scalar","type":"String"},{"name":"frequency","kind":"scalar","type":"String"},{"name":"recipientUserIds","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"lastRunAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Subcontractor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"contactPerson","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"workCategories","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"siteContracts","kind":"object","type":"SiteContract","relationName":"SiteContractToSubcontractor"}],"dbName":null},"SiteContract":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"subcontractorId","kind":"scalar","type":"String"},{"name":"subcontractor","kind":"object","type":"Subcontractor","relationName":"SiteContractToSubcontractor"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToSiteContract"},{"name":"workCategory","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"rateType","kind":"scalar","type":"String"},{"name":"rateUnitLabel","kind":"scalar","type":"String"},{"name":"rate","kind":"scalar","type":"Decimal"},{"name":"fixedAmount","kind":"scalar","type":"Decimal"},{"name":"estimatedQuantity","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"ContractStatus"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"quantityCompleted","kind":"scalar","type":"Decimal"},{"name":"amountPaid","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"workEntries","kind":"object","type":"SubcontractorWorkEntry","relationName":"SiteContractToSubcontractorWorkEntry"},{"name":"payments","kind":"object","type":"SubcontractorPayment","relationName":"SiteContractToSubcontractorPayment"}],"dbName":null},"SubcontractorWorkEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteContractId","kind":"scalar","type":"String"},{"name":"siteContract","kind":"object","type":"SiteContract","relationName":"SiteContractToSubcontractorWorkEntry"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"workDate","kind":"scalar","type":"DateTime"},{"name":"note","kind":"scalar","type":"String"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"SubcontractorPayment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteContractId","kind":"scalar","type":"String"},{"name":"siteContract","kind":"object","type":"SiteContract","relationName":"SiteContractToSubcontractorPayment"},{"name":"type","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"note","kind":"scalar","type":"String"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null}},"enums":{},"types":{}}');
    config.parameterizationSchema = {
      strings: JSON.parse('["where","orderBy","cursor","site","materials","_count","category","unit","sizes","material","materialSize","godownStock","siteStock","purchases","vendor","dailySiteReport","rmcEntries","machinery","type","currentSite","movementLogs","serviceLogs","wasteDisposals","vehicles","vehicle","expenses","purchase","sourceSite","destinationSite","movements","consumptions","returnWastages","movementsFrom","movementsTo","machineryMovements","vehicleMovements","teamMembers","employmentType","workRecords","teamMember","advance","advanceAdjustments","payment","adjustments","advances","payments","dailySiteReports","machineryCurrentlyHere","vehiclesCurrentlyHere","dailyReport","deliveries","dailyReports","siteContracts","subcontractor","siteContract","workEntries","submittedBy","uploadedBy","photos","user","auditLogs","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","Site.findUnique","Site.findUniqueOrThrow","Site.findFirst","Site.findFirstOrThrow","Site.findMany","Site.createOne","Site.createMany","Site.createManyAndReturn","Site.updateOne","Site.updateMany","Site.updateManyAndReturn","Site.upsertOne","Site.deleteOne","Site.deleteMany","Site.groupBy","Site.aggregate","MaterialCategory.findUnique","MaterialCategory.findUniqueOrThrow","MaterialCategory.findFirst","MaterialCategory.findFirstOrThrow","MaterialCategory.findMany","MaterialCategory.createOne","MaterialCategory.createMany","MaterialCategory.createManyAndReturn","MaterialCategory.updateOne","MaterialCategory.updateMany","MaterialCategory.updateManyAndReturn","MaterialCategory.upsertOne","MaterialCategory.deleteOne","MaterialCategory.deleteMany","MaterialCategory.groupBy","MaterialCategory.aggregate","Unit.findUnique","Unit.findUniqueOrThrow","Unit.findFirst","Unit.findFirstOrThrow","Unit.findMany","Unit.createOne","Unit.createMany","Unit.createManyAndReturn","Unit.updateOne","Unit.updateMany","Unit.updateManyAndReturn","Unit.upsertOne","Unit.deleteOne","Unit.deleteMany","Unit.groupBy","Unit.aggregate","Material.findUnique","Material.findUniqueOrThrow","Material.findFirst","Material.findFirstOrThrow","Material.findMany","Material.createOne","Material.createMany","Material.createManyAndReturn","Material.updateOne","Material.updateMany","Material.updateManyAndReturn","Material.upsertOne","Material.deleteOne","Material.deleteMany","_avg","_sum","Material.groupBy","Material.aggregate","MaterialSize.findUnique","MaterialSize.findUniqueOrThrow","MaterialSize.findFirst","MaterialSize.findFirstOrThrow","MaterialSize.findMany","MaterialSize.createOne","MaterialSize.createMany","MaterialSize.createManyAndReturn","MaterialSize.updateOne","MaterialSize.updateMany","MaterialSize.updateManyAndReturn","MaterialSize.upsertOne","MaterialSize.deleteOne","MaterialSize.deleteMany","MaterialSize.groupBy","MaterialSize.aggregate","GodownStock.findUnique","GodownStock.findUniqueOrThrow","GodownStock.findFirst","GodownStock.findFirstOrThrow","GodownStock.findMany","GodownStock.createOne","GodownStock.createMany","GodownStock.createManyAndReturn","GodownStock.updateOne","GodownStock.updateMany","GodownStock.updateManyAndReturn","GodownStock.upsertOne","GodownStock.deleteOne","GodownStock.deleteMany","GodownStock.groupBy","GodownStock.aggregate","SiteStock.findUnique","SiteStock.findUniqueOrThrow","SiteStock.findFirst","SiteStock.findFirstOrThrow","SiteStock.findMany","SiteStock.createOne","SiteStock.createMany","SiteStock.createManyAndReturn","SiteStock.updateOne","SiteStock.updateMany","SiteStock.updateManyAndReturn","SiteStock.upsertOne","SiteStock.deleteOne","SiteStock.deleteMany","SiteStock.groupBy","SiteStock.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Movement.findUnique","Movement.findUniqueOrThrow","Movement.findFirst","Movement.findFirstOrThrow","Movement.findMany","Movement.createOne","Movement.createMany","Movement.createManyAndReturn","Movement.updateOne","Movement.updateMany","Movement.updateManyAndReturn","Movement.upsertOne","Movement.deleteOne","Movement.deleteMany","Movement.groupBy","Movement.aggregate","Consumption.findUnique","Consumption.findUniqueOrThrow","Consumption.findFirst","Consumption.findFirstOrThrow","Consumption.findMany","Consumption.createOne","Consumption.createMany","Consumption.createManyAndReturn","Consumption.updateOne","Consumption.updateMany","Consumption.updateManyAndReturn","Consumption.upsertOne","Consumption.deleteOne","Consumption.deleteMany","Consumption.groupBy","Consumption.aggregate","ReturnWastage.findUnique","ReturnWastage.findUniqueOrThrow","ReturnWastage.findFirst","ReturnWastage.findFirstOrThrow","ReturnWastage.findMany","ReturnWastage.createOne","ReturnWastage.createMany","ReturnWastage.createManyAndReturn","ReturnWastage.updateOne","ReturnWastage.updateMany","ReturnWastage.updateManyAndReturn","ReturnWastage.upsertOne","ReturnWastage.deleteOne","ReturnWastage.deleteMany","ReturnWastage.groupBy","ReturnWastage.aggregate","MachineryType.findUnique","MachineryType.findUniqueOrThrow","MachineryType.findFirst","MachineryType.findFirstOrThrow","MachineryType.findMany","MachineryType.createOne","MachineryType.createMany","MachineryType.createManyAndReturn","MachineryType.updateOne","MachineryType.updateMany","MachineryType.updateManyAndReturn","MachineryType.upsertOne","MachineryType.deleteOne","MachineryType.deleteMany","MachineryType.groupBy","MachineryType.aggregate","VehicleType.findUnique","VehicleType.findUniqueOrThrow","VehicleType.findFirst","VehicleType.findFirstOrThrow","VehicleType.findMany","VehicleType.createOne","VehicleType.createMany","VehicleType.createManyAndReturn","VehicleType.updateOne","VehicleType.updateMany","VehicleType.updateManyAndReturn","VehicleType.upsertOne","VehicleType.deleteOne","VehicleType.deleteMany","VehicleType.groupBy","VehicleType.aggregate","Machinery.findUnique","Machinery.findUniqueOrThrow","Machinery.findFirst","Machinery.findFirstOrThrow","Machinery.findMany","Machinery.createOne","Machinery.createMany","Machinery.createManyAndReturn","Machinery.updateOne","Machinery.updateMany","Machinery.updateManyAndReturn","Machinery.upsertOne","Machinery.deleteOne","Machinery.deleteMany","Machinery.groupBy","Machinery.aggregate","MachineryMovementLog.findUnique","MachineryMovementLog.findUniqueOrThrow","MachineryMovementLog.findFirst","MachineryMovementLog.findFirstOrThrow","MachineryMovementLog.findMany","MachineryMovementLog.createOne","MachineryMovementLog.createMany","MachineryMovementLog.createManyAndReturn","MachineryMovementLog.updateOne","MachineryMovementLog.updateMany","MachineryMovementLog.updateManyAndReturn","MachineryMovementLog.upsertOne","MachineryMovementLog.deleteOne","MachineryMovementLog.deleteMany","MachineryMovementLog.groupBy","MachineryMovementLog.aggregate","MachineryServiceLog.findUnique","MachineryServiceLog.findUniqueOrThrow","MachineryServiceLog.findFirst","MachineryServiceLog.findFirstOrThrow","MachineryServiceLog.findMany","MachineryServiceLog.createOne","MachineryServiceLog.createMany","MachineryServiceLog.createManyAndReturn","MachineryServiceLog.updateOne","MachineryServiceLog.updateMany","MachineryServiceLog.updateManyAndReturn","MachineryServiceLog.upsertOne","MachineryServiceLog.deleteOne","MachineryServiceLog.deleteMany","MachineryServiceLog.groupBy","MachineryServiceLog.aggregate","Vehicle.findUnique","Vehicle.findUniqueOrThrow","Vehicle.findFirst","Vehicle.findFirstOrThrow","Vehicle.findMany","Vehicle.createOne","Vehicle.createMany","Vehicle.createManyAndReturn","Vehicle.updateOne","Vehicle.updateMany","Vehicle.updateManyAndReturn","Vehicle.upsertOne","Vehicle.deleteOne","Vehicle.deleteMany","Vehicle.groupBy","Vehicle.aggregate","VehicleMovementLog.findUnique","VehicleMovementLog.findUniqueOrThrow","VehicleMovementLog.findFirst","VehicleMovementLog.findFirstOrThrow","VehicleMovementLog.findMany","VehicleMovementLog.createOne","VehicleMovementLog.createMany","VehicleMovementLog.createManyAndReturn","VehicleMovementLog.updateOne","VehicleMovementLog.updateMany","VehicleMovementLog.updateManyAndReturn","VehicleMovementLog.upsertOne","VehicleMovementLog.deleteOne","VehicleMovementLog.deleteMany","VehicleMovementLog.groupBy","VehicleMovementLog.aggregate","VehicleServiceLog.findUnique","VehicleServiceLog.findUniqueOrThrow","VehicleServiceLog.findFirst","VehicleServiceLog.findFirstOrThrow","VehicleServiceLog.findMany","VehicleServiceLog.createOne","VehicleServiceLog.createMany","VehicleServiceLog.createManyAndReturn","VehicleServiceLog.updateOne","VehicleServiceLog.updateMany","VehicleServiceLog.updateManyAndReturn","VehicleServiceLog.upsertOne","VehicleServiceLog.deleteOne","VehicleServiceLog.deleteMany","VehicleServiceLog.groupBy","VehicleServiceLog.aggregate","EmploymentType.findUnique","EmploymentType.findUniqueOrThrow","EmploymentType.findFirst","EmploymentType.findFirstOrThrow","EmploymentType.findMany","EmploymentType.createOne","EmploymentType.createMany","EmploymentType.createManyAndReturn","EmploymentType.updateOne","EmploymentType.updateMany","EmploymentType.updateManyAndReturn","EmploymentType.upsertOne","EmploymentType.deleteOne","EmploymentType.deleteMany","EmploymentType.groupBy","EmploymentType.aggregate","TeamMember.findUnique","TeamMember.findUniqueOrThrow","TeamMember.findFirst","TeamMember.findFirstOrThrow","TeamMember.findMany","TeamMember.createOne","TeamMember.createMany","TeamMember.createManyAndReturn","TeamMember.updateOne","TeamMember.updateMany","TeamMember.updateManyAndReturn","TeamMember.upsertOne","TeamMember.deleteOne","TeamMember.deleteMany","TeamMember.groupBy","TeamMember.aggregate","WorkRecord.findUnique","WorkRecord.findUniqueOrThrow","WorkRecord.findFirst","WorkRecord.findFirstOrThrow","WorkRecord.findMany","WorkRecord.createOne","WorkRecord.createMany","WorkRecord.createManyAndReturn","WorkRecord.updateOne","WorkRecord.updateMany","WorkRecord.updateManyAndReturn","WorkRecord.upsertOne","WorkRecord.deleteOne","WorkRecord.deleteMany","WorkRecord.groupBy","WorkRecord.aggregate","Advance.findUnique","Advance.findUniqueOrThrow","Advance.findFirst","Advance.findFirstOrThrow","Advance.findMany","Advance.createOne","Advance.createMany","Advance.createManyAndReturn","Advance.updateOne","Advance.updateMany","Advance.updateManyAndReturn","Advance.upsertOne","Advance.deleteOne","Advance.deleteMany","Advance.groupBy","Advance.aggregate","AdvanceAdjustment.findUnique","AdvanceAdjustment.findUniqueOrThrow","AdvanceAdjustment.findFirst","AdvanceAdjustment.findFirstOrThrow","AdvanceAdjustment.findMany","AdvanceAdjustment.createOne","AdvanceAdjustment.createMany","AdvanceAdjustment.createManyAndReturn","AdvanceAdjustment.updateOne","AdvanceAdjustment.updateMany","AdvanceAdjustment.updateManyAndReturn","AdvanceAdjustment.upsertOne","AdvanceAdjustment.deleteOne","AdvanceAdjustment.deleteMany","AdvanceAdjustment.groupBy","AdvanceAdjustment.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","RmcEntry.findUnique","RmcEntry.findUniqueOrThrow","RmcEntry.findFirst","RmcEntry.findFirstOrThrow","RmcEntry.findMany","RmcEntry.createOne","RmcEntry.createMany","RmcEntry.createManyAndReturn","RmcEntry.updateOne","RmcEntry.updateMany","RmcEntry.updateManyAndReturn","RmcEntry.upsertOne","RmcEntry.deleteOne","RmcEntry.deleteMany","RmcEntry.groupBy","RmcEntry.aggregate","DailySiteReport.findUnique","DailySiteReport.findUniqueOrThrow","DailySiteReport.findFirst","DailySiteReport.findFirstOrThrow","DailySiteReport.findMany","DailySiteReport.createOne","DailySiteReport.createMany","DailySiteReport.createManyAndReturn","DailySiteReport.updateOne","DailySiteReport.updateMany","DailySiteReport.updateManyAndReturn","DailySiteReport.upsertOne","DailySiteReport.deleteOne","DailySiteReport.deleteMany","DailySiteReport.groupBy","DailySiteReport.aggregate","Photo.findUnique","Photo.findUniqueOrThrow","Photo.findFirst","Photo.findFirstOrThrow","Photo.findMany","Photo.createOne","Photo.createMany","Photo.createManyAndReturn","Photo.updateOne","Photo.updateMany","Photo.updateManyAndReturn","Photo.upsertOne","Photo.deleteOne","Photo.deleteMany","Photo.groupBy","Photo.aggregate","Vendor.findUnique","Vendor.findUniqueOrThrow","Vendor.findFirst","Vendor.findFirstOrThrow","Vendor.findMany","Vendor.createOne","Vendor.createMany","Vendor.createManyAndReturn","Vendor.updateOne","Vendor.updateMany","Vendor.updateManyAndReturn","Vendor.upsertOne","Vendor.deleteOne","Vendor.deleteMany","Vendor.groupBy","Vendor.aggregate","ExpenseCategory.findUnique","ExpenseCategory.findUniqueOrThrow","ExpenseCategory.findFirst","ExpenseCategory.findFirstOrThrow","ExpenseCategory.findMany","ExpenseCategory.createOne","ExpenseCategory.createMany","ExpenseCategory.createManyAndReturn","ExpenseCategory.updateOne","ExpenseCategory.updateMany","ExpenseCategory.updateManyAndReturn","ExpenseCategory.upsertOne","ExpenseCategory.deleteOne","ExpenseCategory.deleteMany","ExpenseCategory.groupBy","ExpenseCategory.aggregate","Expense.findUnique","Expense.findUniqueOrThrow","Expense.findFirst","Expense.findFirstOrThrow","Expense.findMany","Expense.createOne","Expense.createMany","Expense.createManyAndReturn","Expense.updateOne","Expense.updateMany","Expense.updateManyAndReturn","Expense.upsertOne","Expense.deleteOne","Expense.deleteMany","Expense.groupBy","Expense.aggregate","WasteDisposal.findUnique","WasteDisposal.findUniqueOrThrow","WasteDisposal.findFirst","WasteDisposal.findFirstOrThrow","WasteDisposal.findMany","WasteDisposal.createOne","WasteDisposal.createMany","WasteDisposal.createManyAndReturn","WasteDisposal.updateOne","WasteDisposal.updateMany","WasteDisposal.updateManyAndReturn","WasteDisposal.upsertOne","WasteDisposal.deleteOne","WasteDisposal.deleteMany","WasteDisposal.groupBy","WasteDisposal.aggregate","BrandingConfig.findUnique","BrandingConfig.findUniqueOrThrow","BrandingConfig.findFirst","BrandingConfig.findFirstOrThrow","BrandingConfig.findMany","BrandingConfig.createOne","BrandingConfig.createMany","BrandingConfig.createManyAndReturn","BrandingConfig.updateOne","BrandingConfig.updateMany","BrandingConfig.updateManyAndReturn","BrandingConfig.upsertOne","BrandingConfig.deleteOne","BrandingConfig.deleteMany","BrandingConfig.groupBy","BrandingConfig.aggregate","DailyReport.findUnique","DailyReport.findUniqueOrThrow","DailyReport.findFirst","DailyReport.findFirstOrThrow","DailyReport.findMany","DailyReport.createOne","DailyReport.createMany","DailyReport.createManyAndReturn","DailyReport.updateOne","DailyReport.updateMany","DailyReport.updateManyAndReturn","DailyReport.upsertOne","DailyReport.deleteOne","DailyReport.deleteMany","DailyReport.groupBy","DailyReport.aggregate","ReportDelivery.findUnique","ReportDelivery.findUniqueOrThrow","ReportDelivery.findFirst","ReportDelivery.findFirstOrThrow","ReportDelivery.findMany","ReportDelivery.createOne","ReportDelivery.createMany","ReportDelivery.createManyAndReturn","ReportDelivery.updateOne","ReportDelivery.updateMany","ReportDelivery.updateManyAndReturn","ReportDelivery.upsertOne","ReportDelivery.deleteOne","ReportDelivery.deleteMany","ReportDelivery.groupBy","ReportDelivery.aggregate","NotificationChannelSetting.findUnique","NotificationChannelSetting.findUniqueOrThrow","NotificationChannelSetting.findFirst","NotificationChannelSetting.findFirstOrThrow","NotificationChannelSetting.findMany","NotificationChannelSetting.createOne","NotificationChannelSetting.createMany","NotificationChannelSetting.createManyAndReturn","NotificationChannelSetting.updateOne","NotificationChannelSetting.updateMany","NotificationChannelSetting.updateManyAndReturn","NotificationChannelSetting.upsertOne","NotificationChannelSetting.deleteOne","NotificationChannelSetting.deleteMany","NotificationChannelSetting.groupBy","NotificationChannelSetting.aggregate","ReportSchedule.findUnique","ReportSchedule.findUniqueOrThrow","ReportSchedule.findFirst","ReportSchedule.findFirstOrThrow","ReportSchedule.findMany","ReportSchedule.createOne","ReportSchedule.createMany","ReportSchedule.createManyAndReturn","ReportSchedule.updateOne","ReportSchedule.updateMany","ReportSchedule.updateManyAndReturn","ReportSchedule.upsertOne","ReportSchedule.deleteOne","ReportSchedule.deleteMany","ReportSchedule.groupBy","ReportSchedule.aggregate","Subcontractor.findUnique","Subcontractor.findUniqueOrThrow","Subcontractor.findFirst","Subcontractor.findFirstOrThrow","Subcontractor.findMany","Subcontractor.createOne","Subcontractor.createMany","Subcontractor.createManyAndReturn","Subcontractor.updateOne","Subcontractor.updateMany","Subcontractor.updateManyAndReturn","Subcontractor.upsertOne","Subcontractor.deleteOne","Subcontractor.deleteMany","Subcontractor.groupBy","Subcontractor.aggregate","SiteContract.findUnique","SiteContract.findUniqueOrThrow","SiteContract.findFirst","SiteContract.findFirstOrThrow","SiteContract.findMany","SiteContract.createOne","SiteContract.createMany","SiteContract.createManyAndReturn","SiteContract.updateOne","SiteContract.updateMany","SiteContract.updateManyAndReturn","SiteContract.upsertOne","SiteContract.deleteOne","SiteContract.deleteMany","SiteContract.groupBy","SiteContract.aggregate","SubcontractorWorkEntry.findUnique","SubcontractorWorkEntry.findUniqueOrThrow","SubcontractorWorkEntry.findFirst","SubcontractorWorkEntry.findFirstOrThrow","SubcontractorWorkEntry.findMany","SubcontractorWorkEntry.createOne","SubcontractorWorkEntry.createMany","SubcontractorWorkEntry.createManyAndReturn","SubcontractorWorkEntry.updateOne","SubcontractorWorkEntry.updateMany","SubcontractorWorkEntry.updateManyAndReturn","SubcontractorWorkEntry.upsertOne","SubcontractorWorkEntry.deleteOne","SubcontractorWorkEntry.deleteMany","SubcontractorWorkEntry.groupBy","SubcontractorWorkEntry.aggregate","SubcontractorPayment.findUnique","SubcontractorPayment.findUniqueOrThrow","SubcontractorPayment.findFirst","SubcontractorPayment.findFirstOrThrow","SubcontractorPayment.findMany","SubcontractorPayment.createOne","SubcontractorPayment.createMany","SubcontractorPayment.createManyAndReturn","SubcontractorPayment.updateOne","SubcontractorPayment.updateMany","SubcontractorPayment.updateManyAndReturn","SubcontractorPayment.upsertOne","SubcontractorPayment.deleteOne","SubcontractorPayment.deleteMany","SubcontractorPayment.groupBy","SubcontractorPayment.aggregate","AND","OR","NOT","id","siteContractId","amount","paymentMethod","paidAt","note","recordedByUserId","createdAt","correctsId","reason","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","quantity","workDate","subcontractorId","siteId","workCategory","description","rateType","rateUnitLabel","rate","fixedAmount","estimatedQuantity","ContractStatus","status","startDate","endDate","quantityCompleted","amountPaid","updatedAt","name","contactPerson","phone","email","address","workCategories","deletedAt","has","hasEvery","hasSome","every","some","none","reportType","frequency","recipientUserIds","enabled","lastRunAt","channel","dailyReportId","attempts","lastError","deliveredAt","dailySiteReportId","reportDate","content","generatedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","tenantName","logoUrl","primaryColor","secondaryColor","accentColor","registeredAddress","contactPhone","gstin","wasteType","quantityDetails","ownership","vendorId","machineryId","vehicleId","vehicleDetails","tripCount","ratePerTrip","otherCharges","totalAmount","disposalLocation","paymentStatus","notes","disposedAt","categoryId","personOrVendor","purchaseId","incurredAt","clientGeneratedId","isActive","materialsSupplied","storageKey","uploadedByUserId","submittedByUserId","workCompleted","workInProgress","plannedWork","issuesBlockers","safetyObservations","equipmentUsed","quantityM3","grade","ratePerM3","invoiceOrChallanNo","challanPhotoUrl","teamMemberId","basePay","additionalAmount","deductions","netPayable","payPeriod","advanceId","paymentId","adjustedAt","correctionReason","givenAt","attended","hours","overtimeHours","designation","contact","employmentTypeId","outstandingAdvanceBalance","kind","cost","serviceDate","AssetLocationStatus","toStatus","movedAt","number","typeId","driver","currentStatus","currentSiteId","customFields","assetNumber","model","operator","materialSizeId","ReturnWastageKind","recordedAt","activityReference","consumedAt","MovementKind","sourceSiteId","destinationSiteId","sentQuantity","receivedQuantity","personResponsible","PurchaseDestination","destination","deliveryLocation","receiverName","purchasedAt","materialId","label","unitId","lowStockThreshold","location","SiteStatus","contractReference","occurredAt","userId","method","path","action","entityType","entityId","passwordHash","Role","role","dailyReportId_channel","siteId_reportDate","materialId_label","categoryId_name","siteId_materialSizeId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
      graph: "xxaYA7AFDS4AAM8KACA6AADYCgAgPAAA2QoAIPUFAADWCgAw9gUAAOMBABD3BQAA1goAMPgFAQAAAAH_BUAA_AkAIZ4GQAD8CQAhnwYBAPIJACGiBgEAAAABqwcBAPIJACGtBwAA1wqtByIBAAAAAQAgGQMAAOYKACAQAACQCgAgGQAAjAoAIB4AAMoKACAmAADOCgAgMwAA0AoAIDgAANsKACA6AADYCgAg9QUAAKkLADD2BQAAAwAQ9wUAAKkLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgEAMAANETACAQAACUDQAgGQAAzwwAIB4AAJcTACAmAACbEwAgMwAAnRMAIDgAAM0TACA6AADLEwAggAYAAKoLACCBBgAAqgsAINUGAACqCwAg4QYAAKoLACDiBgAAqgsAIOMGAACqCwAg5AYAAKoLACDlBgAAqgsAIBkDAADmCgAgEAAAkAoAIBkAAIwKACAeAADKCgAgJgAAzgoAIDMAANAKACA4AADbCgAgOgAA2AoAIPUFAACpCwAw9gUAAAMAEPcFAACpCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAADmCgAgCgAAgAsAIPUFAACoCwAw9gUAAAcAEPcFAACoCwAwjQYQAN8KACGQBgEA8gkAIZ4GQAD8CQAhjQcBAPIJACECAwAA0RMAIAoAAN0TACAKAwAA5goAIAoAAIALACD1BQAAqAsAMPYFAAAHABD3BQAAqAsAMI0GEADfCgAhkAYBAPIJACGeBkAA_AkAIY0HAQDyCQAhsgcAAKcLACADAAAABwAgAQAACAAwAgAACQAgDQYAAKQLACAHAAClCwAgCAAApgsAIPUFAACjCwAw9gUAAAsAEPcFAACjCwAw-AUBAPIJACGfBgEA8gkAIdcGAQDyCQAh3AYgAPsJACGJBwAA7woAIJ8HAQDyCQAhoAcQAOMKACEEBgAA6RMAIAcAAOoTACAIAADrEwAgoAcAAKoLACAOBgAApAsAIAcAAKULACAIAACmCwAg9QUAAKMLADD2BQAACwAQ9wUAAKMLADD4BQEAAAABnwYBAPIJACHXBgEA8gkAIdwGIAD7CQAhiQcAAO8KACCfBwEA8gkAIaAHEADjCgAhsQcAAKILACADAAAACwAgAQAADAAwAgAADQAgAQAAAAsAIAMAAAALACABAAAMADACAAANACABAAAACwAgDQkAAKALACALAAChCwAgDAAAyAoAIA0AAI8KACAdAADJCgAgHgAAygoAIB8AAMsKACD1BQAAnwsAMPYFAAASABD3BQAAnwsAMPgFAQDyCQAhnQcBAPIJACGeBwEA8gkAIQcJAADnEwAgCwAA6BMAIAwAAJUTACANAACTDQAgHQAAlhMAIB4AAJcTACAfAACYEwAgDgkAAKALACALAAChCwAgDAAAyAoAIA0AAI8KACAdAADJCgAgHgAAygoAIB8AAMsKACD1BQAAnwsAMPYFAAASABD3BQAAnwsAMPgFAQAAAAGdBwEA8gkAIZ4HAQDyCQAhsAcAAJ4LACADAAAAEgAgAQAAEwAwAgAAFAAgAQAAABIAIAcKAACACwAg9QUAAJ0LADD2BQAAFwAQ9wUAAJ0LADCNBhAA3woAIZ4GQAD8CQAhjQcBAPIJACEBCgAA3RMAIAcKAACACwAg9QUAAJ0LADD2BQAAFwAQ9wUAAJ0LADCNBhAA3woAIZ4GQAD8CQAhjQcBAAAAAQMAAAAXACABAAAYADACAAAZACADAAAABwAgAQAACAAwAgAACQAgGgMAAIQLACAKAACACwAgDgAAmgsAIBkAAIwKACD1BQAAmwsAMPYFAAAcABD3BQAAmwsAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8wkAIZUGEADjCgAhywYBAPIJACHOBgEA8wkAIdIGEADjCgAh1AYBAPMJACHVBgEA8wkAIeoGAQDzCQAh6wYBAPMJACGNBwEA8gkAIZkHAACcC5kHIpoHAQDzCQAhmwcBAPMJACGcB0AA_AkAIRADAADREwAgCgAA3RMAIA4AAOYTACAZAADPDAAggAYAAKoLACCBBgAAqgsAIJAGAACqCwAglQYAAKoLACDOBgAAqgsAINIGAACqCwAg1AYAAKoLACDVBgAAqgsAIOoGAACqCwAg6wYAAKoLACCaBwAAqgsAIJsHAACqCwAgGgMAAIQLACAKAACACwAgDgAAmgsAIBkAAIwKACD1BQAAmwsAMPYFAAAcABD3BQAAmwsAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDzCQAhlQYQAOMKACHLBgEA8gkAIc4GAQDzCQAh0gYQAOMKACHUBgEA8wkAIdUGAQDzCQAh6gYBAPMJACHrBgEA8wkAIY0HAQDyCQAhmQcAAJwLmQcimgcBAPMJACGbBwEA8wkAIZwHQAD8CQAhAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAcACABAAAdADACAAAeACAVAwAA5goAIA4AAJoLACAPAAD9CgAg9QUAAJkLADD2BQAAIQAQ9wUAAJkLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtQZAAPwJACG2BgEA8wkAIcsGAQDyCQAh0gYQAN8KACHbBgEA8wkAIecGEADfCgAh6AYBAPIJACHpBhAA3woAIeoGAQDzCQAh6wYBAPMJACEJAwAA0RMAIA4AAOYTACAPAADOEwAggAYAAKoLACCBBgAAqgsAILYGAACqCwAg2wYAAKoLACDqBgAAqgsAIOsGAACqCwAgFQMAAOYKACAOAACaCwAgDwAA_QoAIPUFAACZCwAw9gUAACEAEPcFAACZCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtQZAAPwJACG2BgEA8wkAIcsGAQDyCQAh0gYQAN8KACHbBgEAAAAB5wYQAN8KACHoBgEA8gkAIekGEADfCgAh6gYBAPMJACHrBgEA8wkAIQMAAAAhACABAAAiADACAAAjACABAAAAAwAgHAMAAOYKACAOAACWCwAgEQAAlwsAIBgAAJgLACD1BQAAlQsAMPYFAAAmABD3BQAAlQsAMPgFAQDyCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIcgGAQDyCQAhyQYBAPMJACHKBgEA8gkAIcsGAQDzCQAhzAYBAPMJACHNBgEA8wkAIc4GAQDzCQAhzwYCAOsKACHQBhAA3woAIdEGEADfCgAh0gYQAN8KACHTBgEA8wkAIdQGAQDzCQAh1QYBAPMJACHWBkAA_AkAIQ4DAADREwAgDgAA5hMAIBEAAOMTACAYAADgEwAggAYAAKoLACCBBgAAqgsAIMkGAACqCwAgywYAAKoLACDMBgAAqgsAIM0GAACqCwAgzgYAAKoLACDTBgAAqgsAINQGAACqCwAg1QYAAKoLACAcAwAA5goAIA4AAJYLACARAACXCwAgGAAAmAsAIPUFAACVCwAw9gUAACYAEPcFAACVCwAw-AUBAAAAAf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPIJACHIBgEA8gkAIckGAQDzCQAhygYBAPIJACHLBgEA8wkAIcwGAQDzCQAhzQYBAPMJACHOBgEA8wkAIc8GAgDrCgAh0AYQAN8KACHRBhAA3woAIdIGEADfCgAh0wYBAPMJACHUBgEA8wkAIdUGAQDzCQAh1gZAAPwJACEDAAAAJgAgAQAAJwAwAgAAKAAgDg0AAI8KACAQAACQCgAgFgAAkQoAIPUFAACOCgAw9gUAACoAEPcFAACOCgAw-AUBAPIJACGfBgEA8gkAIaAGAQDzCQAhoQYBAPMJACGiBgEA8wkAIaMGAQDzCQAhpQZAAPQJACHdBgAA8AkAIAEAAAAqACASEgAAkwsAIBMAAIQLACAUAADMCgAgFQAAlAsAIBYAAJEKACD1BQAAkgsAMPYFAAAsABD3BQAAkgsAMPgFAQDyCQAhnwYBAPIJACHKBgEA8wkAIYUHAQDyCQAhhwcAAIsLggciiAcBAPMJACGJBwAA7woAIIoHAQDyCQAhiwcBAPMJACGMBwEA8wkAIQEAAAAsACAJEgAA5BMAIBMAANETACAUAACZEwAgFQAA5RMAIBYAAJUNACDKBgAAqgsAIIgHAACqCwAgiwcAAKoLACCMBwAAqgsAIBISAACTCwAgEwAAhAsAIBQAAMwKACAVAACUCwAgFgAAkQoAIPUFAACSCwAw9gUAACwAEPcFAACSCwAw-AUBAAAAAZ8GAQDyCQAhygYBAPMJACGFBwEA8gkAIYcHAACLC4IHIogHAQDzCQAhiQcAAO8KACCKBwEAAAABiwcBAPMJACGMBwEA8wkAIQMAAAAsACABAAAuADACAAAvACABAAAALAAgHQwAAMgKACANAACPCgAgEAAAkAoAIBYAAJEKACAZAACMCgAgHgAAygoAIB8AAMsKACAgAADJCgAgIQAAyQoAICIAAMwKACAjAADNCgAgJgAAzgoAIC4AAM8KACAvAACrCgAgMAAAqAoAIDMAANAKACA0AAD1CQAg9QUAAMYKADD2BQAAMgAQ9wUAAMYKADD4BQEA8gkAIf8FQAD8CQAhkgYBAPMJACGZBgAAxwqjByKeBkAA_AkAIZ8GAQDyCQAhpQZAAPQJACGhBwEA8gkAIaMHAQDzCQAhAQAAADIAIA0DAACECwAgEQAAkAsAIPUFAACRCwAw9gUAADQAEPcFAACRCwAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8wkAIcwGAQDyCQAhggcAAIsLggcigwdAAPwJACEFAwAA0RMAIBEAAOMTACCABgAAqgsAIIEGAACqCwAgkAYAAKoLACANAwAAhAsAIBEAAJALACD1BQAAkQsAMPYFAAA0ABD3BQAAkQsAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8wkAIcwGAQDyCQAhggcAAIsLggcigwdAAPwJACEDAAAANAAgAQAANQAwAgAANgAgAQAAADIAIAsRAACQCwAg9QUAAI8LADD2BQAAOQAQ9wUAAI8LADD4BQEA8gkAIf8FQAD8CQAhzAYBAPIJACHVBgEA8wkAIf4GAQDyCQAh_wYQAOMKACGAB0AA_AkAIQMRAADjEwAg1QYAAKoLACD_BgAAqgsAIAsRAACQCwAg9QUAAI8LADD2BQAAOQAQ9wUAAI8LADD4BQEAAAAB_wVAAPwJACHMBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhAwAAADkAIAEAADoAMAIAADsAIAMAAAAmACABAAAnADACAAAoACABAAAANAAgAQAAADkAIAEAAAAmACAQEgAAjQsAIBMAAIQLACAUAADNCgAgFQAAjgsAIBYAAJEKACD1BQAAjAsAMPYFAABBABD3BQAAjAsAMPgFAQDyCQAhygYBAPMJACGEBwEA8gkAIYUHAQDyCQAhhgcBAPMJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgAQAAAEEAIAgSAADhEwAgEwAA0RMAIBQAAJoTACAVAADiEwAgFgAAlQ0AIMoGAACqCwAghgcAAKoLACCIBwAAqgsAIBASAACNCwAgEwAAhAsAIBQAAM0KACAVAACOCwAgFgAAkQoAIPUFAACMCwAw9gUAAEEAEPcFAACMCwAw-AUBAAAAAcoGAQDzCQAhhAcBAAAAAYUHAQDyCQAhhgcBAPMJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgAwAAAEEAIAEAAEMAMAIAAEQAIAEAAABBACABAAAAMgAgDQMAAIQLACAYAACJCwAg9QUAAIoLADD2BQAASAAQ9wUAAIoLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzQYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQUDAADREwAgGAAA4BMAIIAGAACqCwAggQYAAKoLACCQBgAAqgsAIA0DAACECwAgGAAAiQsAIPUFAACKCwAw9gUAAEgAEPcFAACKCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzQYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQMAAABIACABAABJADACAABKACABAAAAMgAgCxgAAIkLACD1BQAAiAsAMPYFAABNABD3BQAAiAsAMPgFAQDyCQAh_wVAAPwJACHNBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhAxgAAOATACDVBgAAqgsAIP8GAACqCwAgCxgAAIkLACD1BQAAiAsAMPYFAABNABD3BQAAiAsAMPgFAQAAAAH_BUAA_AkAIc0GAQDyCQAh1QYBAPMJACH-BgEA8gkAIf8GEADjCgAhgAdAAPwJACEDAAAATQAgAQAATgAwAgAATwAgAwAAACYAIAEAACcAMAIAACgAIAEAAABIACABAAAATQAgAQAAACYAIAEAAAAcACABAAAAIQAgAQAAACYAIAEAAAAyACAVAwAA5goAIAYAAIYLACAPAAD9CgAgGgAAhwsAIPUFAACFCwAw9gUAAFkAEPcFAACFCwAw-AUBAPIJACH6BRAA3woAIfsFAQDzCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPIJACGSBgEA8wkAIbYGAQDzCQAh1wYBAPIJACHYBgEA8wkAIdkGAQDzCQAh2gZAAPwJACHbBgEA8wkAIQwDAADREwAgBgAA3hMAIA8AAM4TACAaAADfEwAg-wUAAKoLACCABgAAqgsAIIEGAACqCwAgkgYAAKoLACC2BgAAqgsAINgGAACqCwAg2QYAAKoLACDbBgAAqgsAIBUDAADmCgAgBgAAhgsAIA8AAP0KACAaAACHCwAg9QUAAIULADD2BQAAWQAQ9wUAAIULADD4BQEAAAAB-gUQAN8KACH7BQEA8wkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhkgYBAPMJACG2BgEA8wkAIdcGAQDyCQAh2AYBAPMJACHZBgEA8wkAIdoGQAD8CQAh2wYBAAAAAQMAAABZACABAABaADACAABbACADAAAAWQAgAQAAWgAwAgAAWwAgAQAAAFkAIAEAAAAcACABAAAAAwAgAQAAAFkAIBQKAACACwAgGwAAhAsAIBwAAOYKACD1BQAAggsAMPYFAABiABD3BQAAggsAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhzgYBAPMJACHVBgEA8wkAIf4GAACDC5MHIoMHQAD8CQAhjQcBAPIJACGTBwEA8wkAIZQHAQDyCQAhlQcQAN8KACGWBxAA4woAIZcHAQDzCQAhCgoAAN0TACAbAADREwAgHAAA0RMAIIAGAACqCwAggQYAAKoLACDOBgAAqgsAINUGAACqCwAgkwcAAKoLACCWBwAAqgsAIJcHAACqCwAgFAoAAIALACAbAACECwAgHAAA5goAIPUFAACCCwAw9gUAAGIAEPcFAACCCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIc4GAQDzCQAh1QYBAPMJACH-BgAAgwuTByKDB0AA_AkAIY0HAQDyCQAhkwcBAPMJACGUBwEA8gkAIZUHEADfCgAhlgcQAOMKACGXBwEA8wkAIQMAAABiACABAABjADACAABkACABAAAAMgAgEwMAAOYKACAKAACACwAgDwAA_QoAIPUFAACBCwAw9gUAAGcAEPcFAACBCwAw-AUBAPIJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPIJACG2BgEA8wkAIdUGAQDzCQAh2wYBAPMJACGNBwEA8gkAIZAHAQDzCQAhkQdAAPwJACEJAwAA0RMAIAoAAN0TACAPAADOEwAggAYAAKoLACCBBgAAqgsAILYGAACqCwAg1QYAAKoLACDbBgAAqgsAIJAHAACqCwAgEwMAAOYKACAKAACACwAgDwAA_QoAIPUFAACBCwAw9gUAAGcAEPcFAACBCwAw-AUBAAAAAf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8gkAIbYGAQDzCQAh1QYBAPMJACHbBgEAAAABjQcBAPIJACGQBwEA8wkAIZEHQAD8CQAhAwAAAGcAIAEAAGgAMAIAAGkAIAEAAAADACAPAwAA5goAIAoAAIALACD1BQAA_goAMPYFAABsABD3BQAA_goAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8gkAIdUGAQDzCQAh_gYAAP8KjwcijQcBAPIJACGPB0AA_AkAIQUDAADREwAgCgAA3RMAIIAGAACqCwAggQYAAKoLACDVBgAAqgsAIA8DAADmCgAgCgAAgAsAIPUFAAD-CgAw9gUAAGwAEPcFAAD-CgAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPIJACHVBgEA8wkAIf4GAAD_Co8HIo0HAQDyCQAhjwdAAPwJACEDAAAAbAAgAQAAbQAwAgAAbgAgAQAAABcAIAEAAAAHACABAAAAHAAgAQAAAGIAIAEAAABnACABAAAAbAAgAwAAABwAIAEAAB0AMAIAAB4AIAMAAABiACABAABjADACAABkACADAAAAYgAgAQAAYwAwAgAAZAAgAwAAAGcAIAEAAGgAMAIAAGkAIAMAAABsACABAABtADACAABuACADAAAANAAgAQAANQAwAgAANgAgAwAAAEgAIAEAAEkAMAIAAEoAIA8DAADmCgAgDwAA_QoAICcAAPIKACD1BQAA_AoAMPYFAAB9ABD3BQAA_AoAMPgFAQDyCQAh_wVAAPwJACGOBkAA_AkAIZAGAQDyCQAhtgYBAPMJACHsBgEA8gkAIfcGIAD7CQAh-AYQAOMKACH5BhAA4woAIQYDAADREwAgDwAAzhMAICcAANYTACC2BgAAqgsAIPgGAACqCwAg-QYAAKoLACAPAwAA5goAIA8AAP0KACAnAADyCgAg9QUAAPwKADD2BQAAfQAQ9wUAAPwKADD4BQEAAAAB_wVAAPwJACGOBkAA_AkAIZAGAQDyCQAhtgYBAPMJACHsBgEA8gkAIfcGIAD7CQAh-AYQAOMKACH5BhAA4woAIQMAAAB9ACABAAB-ADACAAB_ACAOJQAA-QoAICYAAM4KACAsAAD6CgAgLQAA-woAIPUFAAD4CgAw9gUAAIEBABD3BQAA-AoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhBiUAANoTACAmAACbEwAgLAAA2xMAIC0AANwTACD6BgAAqgsAIPsGAACqCwAgDiUAAPkKACAmAADOCgAgLAAA-goAIC0AAPsKACD1BQAA-AoAMPYFAACBAQAQ9wUAAPgKADD4BQEAAAABnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhAwAAAIEBACABAACCAQAwAgAAgwEAIAEAAACBAQAgAwAAAH0AIAEAAH4AMAIAAH8AIA4nAADyCgAgKwAA8woAIPUFAAD3CgAw9gUAAIcBABD3BQAA9woAMPgFAQDyCQAh-gUQAN8KACH7BQEA8wkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIewGAQDyCQAh9QYBAPMJACH2BkAA_AkAIQYnAADWEwAgKwAA1xMAIPsFAACqCwAggAYAAKoLACCBBgAAqgsAIPUGAACqCwAgDicAAPIKACArAADzCgAg9QUAAPcKADD2BQAAhwEAEPcFAAD3CgAw-AUBAAAAAfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACHsBgEA8gkAIfUGAQDzCQAh9gZAAPwJACEDAAAAhwEAIAEAAIgBADACAACJAQAgDigAAPUKACAqAAD2CgAg9QUAAPQKADD2BQAAiwEAEPcFAAD0CgAw-AUBAPIJACH6BRAA3woAIf0FAQDzCQAh_wVAAPwJACGABgEA8wkAIfIGAQDyCQAh8wYBAPMJACH0BkAA_AkAIfUGAQDzCQAhBigAANgTACAqAADZEwAg_QUAAKoLACCABgAAqgsAIPMGAACqCwAg9QYAAKoLACAOKAAA9QoAICoAAPYKACD1BQAA9AoAMPYFAACLAQAQ9wUAAPQKADD4BQEAAAAB-gUQAN8KACH9BQEA8wkAIf8FQAD8CQAhgAYBAPMJACHyBgEA8gkAIfMGAQDzCQAh9AZAAPwJACH1BgEA8wkAIQMAAACLAQAgAQAAjAEAMAIAAI0BACARJwAA8goAICkAAPMKACD1BQAA8QoAMPYFAACPAQAQ9wUAAPEKADD4BQEA8gkAIfwFQAD0CQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhmQYBAPIJACHsBgEA8gkAIe0GEADfCgAh7gYQAN8KACHvBhAA3woAIfAGEADfCgAh8QYBAPMJACEBAAAAjwEAIAMAAACLAQAgAQAAjAEAMAIAAI0BACABAAAAiwEAIAEAAACLAQAgBicAANYTACApAADXEwAg_AUAAKoLACCABgAAqgsAIIEGAACqCwAg8QYAAKoLACARJwAA8goAICkAAPMKACD1BQAA8QoAMPYFAACPAQAQ9wUAAPEKADD4BQEAAAAB_AVAAPQJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGZBgEA8gkAIewGAQDyCQAh7QYQAN8KACHuBhAA3woAIe8GEADfCgAh8AYQAN8KACHxBgEA8wkAIQMAAACPAQAgAQAAlAEAMAIAAJUBACABAAAAfQAgAQAAAIcBACABAAAAjwEAIAEAAAADACADAAAAIQAgAQAAIgAwAgAAIwAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAABZACABAABaADACAABbACADAAAALAAgAQAALgAwAgAALwAgAwAAAEEAIAEAAEMAMAIAAEQAIAwDAADmCgAgDwAA3QoAIDIAAPAKACD1BQAA7goAMPYFAACgAQAQ9wUAAO4KADD4BQEA8gkAIZAGAQDyCQAhtgYBAPIJACG3BkAA_AkAIbgGAADvCgAguQZAAPwJACEDAwAA0RMAIA8AAM4TACAyAADVEwAgDQMAAOYKACAPAADdCgAgMgAA8AoAIPUFAADuCgAw9gUAAKABABD3BQAA7goAMPgFAQAAAAGQBgEA8gkAIbYGAQDyCQAhtwZAAPwJACG4BgAA7woAILkGQAD8CQAhrwcAAO0KACADAAAAoAEAIAEAAKEBADACAACiAQAgDDEAAOwKACD1BQAA6goAMPYFAACkAQAQ9wUAAOoKADD4BQEA8gkAIf8FQAD8CQAhmQYBAPIJACGxBgEA8gkAIbIGAQDyCQAhswYCAOsKACG0BgEA8wkAIbUGQAD0CQAhAzEAANQTACC0BgAAqgsAILUGAACqCwAgDTEAAOwKACD1BQAA6goAMPYFAACkAQAQ9wUAAOoKADD4BQEAAAAB_wVAAPwJACGZBgEA8gkAIbEGAQDyCQAhsgYBAPIJACGzBgIA6woAIbQGAQDzCQAhtQZAAPQJACGuBwAA6QoAIAMAAACkAQAgAQAApQEAMAIAAKYBACABAAAApAEAIAMAAAAmACABAAAnADACAAAoACAYAwAA5goAIC0AAOgKACA1AADlCgAgNwAA5woAIPUFAADiCgAw9gUAAKoBABD3BQAA4goAMPgFAQDyCQAh_wVAAPwJACGPBgEA8gkAIZAGAQDyCQAhkQYBAPMJACGSBgEA8wkAIZMGAQDzCQAhlAYBAPMJACGVBhAA4woAIZYGEADjCgAhlwYQAOMKACGZBgAA5AqZBiKaBkAA9AkAIZsGQAD0CQAhnAYQAN8KACGdBhAA3woAIZ4GQAD8CQAhDQMAANETACAtAADTEwAgNQAA0BMAIDcAANITACCRBgAAqgsAIJIGAACqCwAgkwYAAKoLACCUBgAAqgsAIJUGAACqCwAglgYAAKoLACCXBgAAqgsAIJoGAACqCwAgmwYAAKoLACAYAwAA5goAIC0AAOgKACA1AADlCgAgNwAA5woAIPUFAADiCgAw9gUAAKoBABD3BQAA4goAMPgFAQAAAAH_BUAA_AkAIY8GAQDyCQAhkAYBAPIJACGRBgEA8wkAIZIGAQDzCQAhkwYBAPMJACGUBgEA8wkAIZUGEADjCgAhlgYQAOMKACGXBhAA4woAIZkGAADkCpkGIpoGQAD0CQAhmwZAAPQJACGcBhAA3woAIZ0GEADfCgAhngZAAPwJACEDAAAAqgEAIAEAAKsBADACAACsAQAgAwAAAKoBACABAACrAQAwAgAArAEAIAEAAACqAQAgDTYAAOAKACD1BQAA4QoAMPYFAACwAQAQ9wUAAOEKADD4BQEA8gkAIfkFAQDyCQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhjgZAAPwJACEENgAAzxMAIP0FAACqCwAggAYAAKoLACCBBgAAqgsAIA02AADgCgAg9QUAAOEKADD2BQAAsAEAEPcFAADhCgAw-AUBAAAAAfkFAQDyCQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhjgZAAPwJACEDAAAAsAEAIAEAALEBADACAACyAQAgDxIBAPIJACE2AADgCgAg9QUAAN4KADD2BQAAtAEAEPcFAADeCgAw-AUBAPIJACH5BQEA8gkAIfoFEADfCgAh-wUBAPMJACH8BUAA_AkAIf0FAQDzCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACEFNgAAzxMAIPsFAACqCwAg_QUAAKoLACCABgAAqgsAIIEGAACqCwAgDxIBAPIJACE2AADgCgAg9QUAAN4KADD2BQAAtAEAEPcFAADeCgAw-AUBAAAAAfkFAQDyCQAh-gUQAN8KACH7BQEA8wkAIfwFQAD8CQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIQMAAAC0AQAgAQAAtQEAMAIAALYBACABAAAAsAEAIAEAAAC0AQAgAQAAAAcAIAEAAAAcACABAAAAYgAgAQAAAGIAIAEAAABnACABAAAAbAAgAQAAADQAIAEAAABIACABAAAAfQAgAQAAACEAIAEAAAADACABAAAAWQAgAQAAACwAIAEAAABBACABAAAAoAEAIAEAAAAmACABAAAAqgEAIAMAAAB9ACABAAB-ADACAAB_ACADAAAAZwAgAQAAaAAwAgAAaQAgCg8AAN0KACA5AADbCgAg9QUAANwKADD2BQAAzQEAEPcFAADcCgAw-AUBAPIJACH_BUAA_AkAIbYGAQDyCQAh3gYBAPIJACHfBgEA8gkAIQIPAADOEwAgOQAAzRMAIAoPAADdCgAgOQAA2woAIPUFAADcCgAw9gUAAM0BABD3BQAA3AoAMPgFAQAAAAH_BUAA_AkAIbYGAQDyCQAh3gYBAPIJACHfBgEA8gkAIQMAAADNAQAgAQAAzgEAMAIAAM8BACADAAAAWQAgAQAAWgAwAgAAWwAgAwAAACEAIAEAACIAMAIAACMAIAMAAACgAQAgAQAAoQEAMAIAAKIBACABAAAAfQAgAQAAAGcAIAEAAADNAQAgAQAAAFkAIAEAAAAhACABAAAAoAEAIAMAAADNAQAgAQAAzgEAMAIAAM8BACANOwAA2woAIPUFAADaCgAw9gUAANsBABD3BQAA2goAMPgFAQDyCQAhkAYBAPMJACGkB0AA_AkAIaUHAQDyCQAhpgcBAPIJACGnBwEA8gkAIagHAQDyCQAhqQcBAPMJACGqBwEA8wkAIQQ7AADNEwAgkAYAAKoLACCpBwAAqgsAIKoHAACqCwAgDTsAANsKACD1BQAA2goAMPYFAADbAQAQ9wUAANoKADD4BQEAAAABkAYBAPMJACGkB0AA_AkAIaUHAQDyCQAhpgcBAPIJACGnBwEA8gkAIagHAQDyCQAhqQcBAPMJACGqBwEA8wkAIQMAAADbAQAgAQAA3AEAMAIAAN0BACABAAAAAwAgAQAAAM0BACABAAAA2wEAIAEAAAABACANLgAAzwoAIDoAANgKACA8AADZCgAg9QUAANYKADD2BQAA4wEAEPcFAADWCgAw-AUBAPIJACH_BUAA_AkAIZ4GQAD8CQAhnwYBAPIJACGiBgEA8gkAIasHAQDyCQAhrQcAANcKrQciAy4AAJwTACA6AADLEwAgPAAAzBMAIAMAAADjAQAgAQAA5AEAMAIAAAEAIAMAAADjAQAgAQAA5AEAMAIAAAEAIAMAAADjAQAgAQAA5AEAMAIAAAEAIAouAADIEwAgOgAAyRMAIDwAAMoTACD4BQEAAAAB_wVAAAAAAZ4GQAAAAAGfBgEAAAABogYBAAAAAasHAQAAAAGtBwAAAK0HAgFCAADoAQAgB_gFAQAAAAH_BUAAAAABngZAAAAAAZ8GAQAAAAGiBgEAAAABqwcBAAAAAa0HAAAArQcCAUIAAOoBADABQgAA6gEAMAouAACnEwAgOgAAqBMAIDwAAKkTACD4BQEAsAsAIf8FQACzCwAhngZAALMLACGfBgEAsAsAIaIGAQCwCwAhqwcBALALACGtBwAAphOtByICAAAAAQAgQgAA7QEAIAf4BQEAsAsAIf8FQACzCwAhngZAALMLACGfBgEAsAsAIaIGAQCwCwAhqwcBALALACGtBwAAphOtByICAAAA4wEAIEIAAO8BACACAAAA4wEAIEIAAO8BACADAAAAAQAgSQAA6AEAIEoAAO0BACABAAAAAQAgAQAAAOMBACADBQAAoxMAIE8AAKUTACBQAACkEwAgCvUFAADSCgAw9gUAAPYBABD3BQAA0goAMPgFAQDWCQAh_wVAANkJACGeBkAA2QkAIZ8GAQDWCQAhogYBANYJACGrBwEA1gkAIa0HAADTCq0HIgMAAADjAQAgAQAA9QEAME4AAPYBACADAAAA4wEAIAEAAOQBADACAAABACABAAAA3QEAIAEAAADdAQAgAwAAANsBACABAADcAQAwAgAA3QEAIAMAAADbAQAgAQAA3AEAMAIAAN0BACADAAAA2wEAIAEAANwBADACAADdAQAgCjsAAKITACD4BQEAAAABkAYBAAAAAaQHQAAAAAGlBwEAAAABpgcBAAAAAacHAQAAAAGoBwEAAAABqQcBAAAAAaoHAQAAAAEBQgAA_gEAIAn4BQEAAAABkAYBAAAAAaQHQAAAAAGlBwEAAAABpgcBAAAAAacHAQAAAAGoBwEAAAABqQcBAAAAAaoHAQAAAAEBQgAAgAIAMAFCAACAAgAwCjsAAKETACD4BQEAsAsAIZAGAQCyCwAhpAdAALMLACGlBwEAsAsAIaYHAQCwCwAhpwcBALALACGoBwEAsAsAIakHAQCyCwAhqgcBALILACECAAAA3QEAIEIAAIMCACAJ-AUBALALACGQBgEAsgsAIaQHQACzCwAhpQcBALALACGmBwEAsAsAIacHAQCwCwAhqAcBALALACGpBwEAsgsAIaoHAQCyCwAhAgAAANsBACBCAACFAgAgAgAAANsBACBCAACFAgAgAwAAAN0BACBJAAD-AQAgSgAAgwIAIAEAAADdAQAgAQAAANsBACAGBQAAnhMAIE8AAKATACBQAACfEwAgkAYAAKoLACCpBwAAqgsAIKoHAACqCwAgDPUFAADRCgAw9gUAAIwCABD3BQAA0QoAMPgFAQDWCQAhkAYBANgJACGkB0AA2QkAIaUHAQDWCQAhpgcBANYJACGnBwEA1gkAIagHAQDWCQAhqQcBANgJACGqBwEA2AkAIQMAAADbAQAgAQAAiwIAME4AAIwCACADAAAA2wEAIAEAANwBADACAADdAQAgHQwAAMgKACANAACPCgAgEAAAkAoAIBYAAJEKACAZAACMCgAgHgAAygoAIB8AAMsKACAgAADJCgAgIQAAyQoAICIAAMwKACAjAADNCgAgJgAAzgoAIC4AAM8KACAvAACrCgAgMAAAqAoAIDMAANAKACA0AAD1CQAg9QUAAMYKADD2BQAAMgAQ9wUAAMYKADD4BQEAAAAB_wVAAPwJACGSBgEA8wkAIZkGAADHCqMHIp4GQAD8CQAhnwYBAPIJACGlBkAA9AkAIaEHAQDyCQAhowcBAPMJACEBAAAAjwIAIAEAAACPAgAgFAwAAJUTACANAACTDQAgEAAAlA0AIBYAAJUNACAZAADPDAAgHgAAlxMAIB8AAJgTACAgAACWEwAgIQAAlhMAICIAAJkTACAjAACaEwAgJgAAmxMAIC4AAJwTACAvAACUEAAgMAAAghAAIDMAAJ0TACA0AAD4CwAgkgYAAKoLACClBgAAqgsAIKMHAACqCwAgAwAAADIAIAEAAJICADACAACPAgAgAwAAADIAIAEAAJICADACAACPAgAgAwAAADIAIAEAAJICADACAACPAgAgGgwAAIQTACANAACFEwAgEAAAjRMAIBYAAJMTACAZAACPEwAgHgAAiBMAIB8AAIkTACAgAACGEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQFCAACWAgAgCfgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAEBQgAAmAIAMAFCAACYAgAwGgwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAg-AUBALALACH_BUAAswsAIZIGAQCyCwAhmQYAANYRowcingZAALMLACGfBgEAsAsAIaUGQADECwAhoQcBALALACGjBwEAsgsAIQIAAACPAgAgQgAAmwIAIAn4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhAgAAADIAIEIAAJ0CACACAAAAMgAgQgAAnQIAIAMAAACPAgAgSQAAlgIAIEoAAJsCACABAAAAjwIAIAEAAAAyACAGBQAA0xEAIE8AANURACBQAADUEQAgkgYAAKoLACClBgAAqgsAIKMHAACqCwAgDPUFAADCCgAw9gUAAKQCABD3BQAAwgoAMPgFAQDWCQAh_wVAANkJACGSBgEA2AkAIZkGAADDCqMHIp4GQADZCQAhnwYBANYJACGlBkAA6AkAIaEHAQDWCQAhowcBANgJACEDAAAAMgAgAQAAowIAME4AAKQCACADAAAAMgAgAQAAkgIAMAIAAI8CACAHBAAAvwoAIPUFAADBCgAw9gUAAKoCABD3BQAAwQoAMPgFAQAAAAGfBgEAAAAB3AYgAPsJACEBAAAApwIAIAEAAACnAgAgBwQAAL8KACD1BQAAwQoAMPYFAACqAgAQ9wUAAMEKADD4BQEA8gkAIZ8GAQDyCQAh3AYgAPsJACEBBAAAxBEAIAMAAACqAgAgAQAAqwIAMAIAAKcCACADAAAAqgIAIAEAAKsCADACAACnAgAgAwAAAKoCACABAACrAgAwAgAApwIAIAQEAADSEQAg-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAAK8CACAD-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAALECADABQgAAsQIAMAQEAADIEQAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhAgAAAKcCACBCAAC0AgAgA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIQIAAACqAgAgQgAAtgIAIAIAAACqAgAgQgAAtgIAIAMAAACnAgAgSQAArwIAIEoAALQCACABAAAApwIAIAEAAACqAgAgAwUAAMURACBPAADHEQAgUAAAxhEAIAb1BQAAwAoAMPYFAAC9AgAQ9wUAAMAKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEDAAAAqgIAIAEAALwCADBOAAC9AgAgAwAAAKoCACABAACrAgAwAgAApwIAIAcEAAC_CgAg9QUAAL4KADD2BQAAwwIAEPcFAAC-CgAw-AUBAAAAAZ8GAQAAAAHcBiAA-wkAIQEAAADAAgAgAQAAAMACACAHBAAAvwoAIPUFAAC-CgAw9gUAAMMCABD3BQAAvgoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIQEEAADEEQAgAwAAAMMCACABAADEAgAwAgAAwAIAIAMAAADDAgAgAQAAxAIAMAIAAMACACADAAAAwwIAIAEAAMQCADACAADAAgAgBAQAAMMRACD4BQEAAAABnwYBAAAAAdwGIAAAAAEBQgAAyAIAIAP4BQEAAAABnwYBAAAAAdwGIAAAAAEBQgAAygIAMAFCAADKAgAwBAQAALYRACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACECAAAAwAIAIEIAAM0CACAD-AUBALALACGfBgEAsAsAIdwGIAD9CwAhAgAAAMMCACBCAADPAgAgAgAAAMMCACBCAADPAgAgAwAAAMACACBJAADIAgAgSgAAzQIAIAEAAADAAgAgAQAAAMMCACADBQAAsxEAIE8AALURACBQAAC0EQAgBvUFAAC9CgAw9gUAANYCABD3BQAAvQoAMPgFAQDWCQAhnwYBANYJACHcBiAA9wkAIQMAAADDAgAgAQAA1QIAME4AANYCACADAAAAwwIAIAEAAMQCADACAADAAgAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAKBgAAsBEAIAcAALERACAIAACyEQAg-AUBAAAAAZ8GAQAAAAHXBgEAAAAB3AYgAAAAAYkHgAAAAAGfBwEAAAABoAcQAAAAAQFCAADeAgAgB_gFAQAAAAGfBgEAAAAB1wYBAAAAAdwGIAAAAAGJB4AAAAABnwcBAAAAAaAHEAAAAAEBQgAA4AIAMAFCAADgAgAwCgYAAKERACAHAACiEQAgCAAAoxEAIPgFAQCwCwAhnwYBALALACHXBgEAsAsAIdwGIAD9CwAhiQeAAAAAAZ8HAQCwCwAhoAcQAMILACECAAAADQAgQgAA4wIAIAf4BQEAsAsAIZ8GAQCwCwAh1wYBALALACHcBiAA_QsAIYkHgAAAAAGfBwEAsAsAIaAHEADCCwAhAgAAAAsAIEIAAOUCACACAAAACwAgQgAA5QIAIAMAAAANACBJAADeAgAgSgAA4wIAIAEAAAANACABAAAACwAgBgUAAJwRACBPAACfEQAgUAAAnhEAIKEBAACdEQAgogEAAKARACCgBwAAqgsAIAr1BQAAvAoAMPYFAADsAgAQ9wUAALwKADD4BQEA1gkAIZ8GAQDWCQAh1wYBANYJACHcBiAA9wkAIYkHAACECgAgnwcBANYJACGgBxAA5gkAIQMAAAALACABAADrAgAwTgAA7AIAIAMAAAALACABAAAMADACAAANACABAAAAFAAgAQAAABQAIAMAAAASACABAAATADACAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAABIAIAEAABMAMAIAABQAIAoJAACVEQAgCwAAlhEAIAwAAJcRACANAACYEQAgHQAAmREAIB4AAJoRACAfAACbEQAg-AUBAAAAAZ0HAQAAAAGeBwEAAAABAUIAAPQCACAD-AUBAAAAAZ0HAQAAAAGeBwEAAAABAUIAAPYCADABQgAA9gIAMAoJAADMEAAgCwAAzRAAIAwAAM4QACANAADPEAAgHQAA0BAAIB4AANEQACAfAADSEAAg-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhAgAAABQAIEIAAPkCACAD-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhAgAAABIAIEIAAPsCACACAAAAEgAgQgAA-wIAIAMAAAAUACBJAAD0AgAgSgAA-QIAIAEAAAAUACABAAAAEgAgAwUAAMkQACBPAADLEAAgUAAAyhAAIAb1BQAAuwoAMPYFAACCAwAQ9wUAALsKADD4BQEA1gkAIZ0HAQDWCQAhngcBANYJACEDAAAAEgAgAQAAgQMAME4AAIIDACADAAAAEgAgAQAAEwAwAgAAFAAgAQAAABkAIAEAAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACAECgAAyBAAII0GEAAAAAGeBkAAAAABjQcBAAAAAQFCAACKAwAgA40GEAAAAAGeBkAAAAABjQcBAAAAAQFCAACMAwAwAUIAAIwDADAECgAAxxAAII0GEACxCwAhngZAALMLACGNBwEAsAsAIQIAAAAZACBCAACPAwAgA40GEACxCwAhngZAALMLACGNBwEAsAsAIQIAAAAXACBCAACRAwAgAgAAABcAIEIAAJEDACADAAAAGQAgSQAAigMAIEoAAI8DACABAAAAGQAgAQAAABcAIAUFAADCEAAgTwAAxRAAIFAAAMQQACChAQAAwxAAIKIBAADGEAAgBvUFAAC6CgAw9gUAAJgDABD3BQAAugoAMI0GEADXCQAhngZAANkJACGNBwEA1gkAIQMAAAAXACABAACXAwAwTgAAmAMAIAMAAAAXACABAAAYADACAAAZACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAYDAADAEAAgCgAAwRAAII0GEAAAAAGQBgEAAAABngZAAAAAAY0HAQAAAAEBQgAAoAMAIASNBhAAAAABkAYBAAAAAZ4GQAAAAAGNBwEAAAABAUIAAKIDADABQgAAogMAMAYDAAC-EAAgCgAAvxAAII0GEACxCwAhkAYBALALACGeBkAAswsAIY0HAQCwCwAhAgAAAAkAIEIAAKUDACAEjQYQALELACGQBgEAsAsAIZ4GQACzCwAhjQcBALALACECAAAABwAgQgAApwMAIAIAAAAHACBCAACnAwAgAwAAAAkAIEkAAKADACBKAAClAwAgAQAAAAkAIAEAAAAHACAFBQAAuRAAIE8AALwQACBQAAC7EAAgoQEAALoQACCiAQAAvRAAIAf1BQAAuQoAMPYFAACuAwAQ9wUAALkKADCNBhAA1wkAIZAGAQDWCQAhngZAANkJACGNBwEA1gkAIQMAAAAHACABAACtAwAwTgAArgMAIAMAAAAHACABAAAIADACAAAJACABAAAAHgAgAQAAAB4AIAMAAAAcACABAAAdADACAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIBcDAACNDQAgCgAAjA0AIA4AALgQACAZAACODQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGQBgEAAAABlQYQAAAAAcsGAQAAAAHOBgEAAAAB0gYQAAAAAdQGAQAAAAHVBgEAAAAB6gYBAAAAAesGAQAAAAGNBwEAAAABmQcAAACZBwKaBwEAAAABmwcBAAAAAZwHQAAAAAEBQgAAtgMAIBP4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAY0HAQAAAAGZBwAAAJkHApoHAQAAAAGbBwEAAAABnAdAAAAAAQFCAAC4AwAwAUIAALgDADABAAAAMgAgFwMAAIANACAKAAD_DAAgDgAAtxAAIBkAAIENACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALILACGVBhAAwgsAIcsGAQCwCwAhzgYBALILACHSBhAAwgsAIdQGAQCyCwAh1QYBALILACHqBgEAsgsAIesGAQCyCwAhjQcBALALACGZBwAA_QyZByKaBwEAsgsAIZsHAQCyCwAhnAdAALMLACECAAAAHgAgQgAAvAMAIBP4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALILACGVBhAAwgsAIcsGAQCwCwAhzgYBALILACHSBhAAwgsAIdQGAQCyCwAh1QYBALILACHqBgEAsgsAIesGAQCyCwAhjQcBALALACGZBwAA_QyZByKaBwEAsgsAIZsHAQCyCwAhnAdAALMLACECAAAAHAAgQgAAvgMAIAIAAAAcACBCAAC-AwAgAQAAADIAIAMAAAAeACBJAAC2AwAgSgAAvAMAIAEAAAAeACABAAAAHAAgEQUAALIQACBPAAC1EAAgUAAAtBAAIKEBAACzEAAgogEAALYQACCABgAAqgsAIIEGAACqCwAgkAYAAKoLACCVBgAAqgsAIM4GAACqCwAg0gYAAKoLACDUBgAAqgsAINUGAACqCwAg6gYAAKoLACDrBgAAqgsAIJoHAACqCwAgmwcAAKoLACAW9QUAALUKADD2BQAAxgMAEPcFAAC1CgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGNBhAA1wkAIZAGAQDYCQAhlQYQAOYJACHLBgEA1gkAIc4GAQDYCQAh0gYQAOYJACHUBgEA2AkAIdUGAQDYCQAh6gYBANgJACHrBgEA2AkAIY0HAQDWCQAhmQcAALYKmQcimgcBANgJACGbBwEA2AkAIZwHQADZCQAhAwAAABwAIAEAAMUDADBOAADGAwAgAwAAABwAIAEAAB0AMAIAAB4AIAEAAABkACABAAAAZAAgAwAAAGIAIAEAAGMAMAIAAGQAIAMAAABiACABAABjADACAABkACADAAAAYgAgAQAAYwAwAgAAZAAgEQoAAK8QACAbAACwEAAgHAAAsRAAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAY0HAQAAAAGTBwEAAAABlAcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQFCAADOAwAgDvgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAY0HAQAAAAGTBwEAAAABlAcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQFCAADQAwAwAUIAANADADABAAAAMgAgEQoAAKwQACAbAACtEAAgHAAArhAAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhzgYBALILACHVBgEAsgsAIf4GAACrEJMHIoMHQACzCwAhjQcBALALACGTBwEAsgsAIZQHAQCwCwAhlQcQALELACGWBxAAwgsAIZcHAQCyCwAhAgAAAGQAIEIAANQDACAO-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACHOBgEAsgsAIdUGAQCyCwAh_gYAAKsQkwcigwdAALMLACGNBwEAsAsAIZMHAQCyCwAhlAcBALALACGVBxAAsQsAIZYHEADCCwAhlwcBALILACECAAAAYgAgQgAA1gMAIAIAAABiACBCAADWAwAgAQAAADIAIAMAAABkACBJAADOAwAgSgAA1AMAIAEAAABkACABAAAAYgAgDAUAAKYQACBPAACpEAAgUAAAqBAAIKEBAACnEAAgogEAAKoQACCABgAAqgsAIIEGAACqCwAgzgYAAKoLACDVBgAAqgsAIJMHAACqCwAglgcAAKoLACCXBwAAqgsAIBH1BQAAsQoAMPYFAADeAwAQ9wUAALEKADD4BQEA1gkAIf8FQADZCQAhgAYBANgJACGBBgEA2AkAIc4GAQDYCQAh1QYBANgJACH-BgAAsgqTByKDB0AA2QkAIY0HAQDWCQAhkwcBANgJACGUBwEA1gkAIZUHEADXCQAhlgcQAOYJACGXBwEA2AkAIQMAAABiACABAADdAwAwTgAA3gMAIAMAAABiACABAABjADACAABkACABAAAAaQAgAQAAAGkAIAMAAABnACABAABoADACAABpACADAAAAZwAgAQAAaAAwAgAAaQAgAwAAAGcAIAEAAGgAMAIAAGkAIBADAADiDQAgCgAA4w0AIA8AAKUQACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGQBgEAAAABtgYBAAAAAdUGAQAAAAHbBgEAAAABjQcBAAAAAZAHAQAAAAGRB0AAAAABAUIAAOYDACAN-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABkAYBAAAAAbYGAQAAAAHVBgEAAAAB2wYBAAAAAY0HAQAAAAGQBwEAAAABkQdAAAAAAQFCAADoAwAwAUIAAOgDADABAAAAAwAgEAMAAN8NACAKAADgDQAgDwAApBAAIPgFAQCwCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCwCwAhtgYBALILACHVBgEAsgsAIdsGAQCyCwAhjQcBALALACGQBwEAsgsAIZEHQACzCwAhAgAAAGkAIEIAAOwDACAN-AUBALALACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALALACG2BgEAsgsAIdUGAQCyCwAh2wYBALILACGNBwEAsAsAIZAHAQCyCwAhkQdAALMLACECAAAAZwAgQgAA7gMAIAIAAABnACBCAADuAwAgAQAAAAMAIAMAAABpACBJAADmAwAgSgAA7AMAIAEAAABpACABAAAAZwAgCwUAAJ8QACBPAACiEAAgUAAAoRAAIKEBAACgEAAgogEAAKMQACCABgAAqgsAIIEGAACqCwAgtgYAAKoLACDVBgAAqgsAINsGAACqCwAgkAcAAKoLACAQ9QUAALAKADD2BQAA9gMAEPcFAACwCgAw-AUBANYJACH-BQEA1gkAIf8FQADZCQAhgAYBANgJACGBBgEA2AkAIY0GEADXCQAhkAYBANYJACG2BgEA2AkAIdUGAQDYCQAh2wYBANgJACGNBwEA1gkAIZAHAQDYCQAhkQdAANkJACEDAAAAZwAgAQAA9QMAME4AAPYDACADAAAAZwAgAQAAaAAwAgAAaQAgAQAAAG4AIAEAAABuACADAAAAbAAgAQAAbQAwAgAAbgAgAwAAAGwAIAEAAG0AMAIAAG4AIAMAAABsACABAABtADACAABuACAMAwAAnRAAIAoAAJ4QACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB_gYAAACPBwKNBwEAAAABjwdAAAAAAQFCAAD-AwAgCvgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABkAYBAAAAAdUGAQAAAAH-BgAAAI8HAo0HAQAAAAGPB0AAAAABAUIAAIAEADABQgAAgAQAMAwDAACbEAAgCgAAnBAAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsAsAIdUGAQCyCwAh_gYAAJoQjwcijQcBALALACGPB0AAswsAIQIAAABuACBCAACDBAAgCvgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsAsAIdUGAQCyCwAh_gYAAJoQjwcijQcBALALACGPB0AAswsAIQIAAABsACBCAACFBAAgAgAAAGwAIEIAAIUEACADAAAAbgAgSQAA_gMAIEoAAIMEACABAAAAbgAgAQAAAGwAIAgFAACVEAAgTwAAmBAAIFAAAJcQACChAQAAlhAAIKIBAACZEAAggAYAAKoLACCBBgAAqgsAINUGAACqCwAgDfUFAACsCgAw9gUAAIwEABD3BQAArAoAMPgFAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhjQYQANcJACGQBgEA1gkAIdUGAQDYCQAh_gYAAK0KjwcijQcBANYJACGPB0AA2QkAIQMAAABsACABAACLBAAwTgAAjAQAIAMAAABsACABAABtADACAABuACAHEQAAqwoAIPUFAACqCgAw9gUAAJIEABD3BQAAqgoAMPgFAQAAAAGfBgEAAAAB3AYgAPsJACEBAAAAjwQAIAEAAACPBAAgBxEAAKsKACD1BQAAqgoAMPYFAACSBAAQ9wUAAKoKADD4BQEA8gkAIZ8GAQDyCQAh3AYgAPsJACEBEQAAlBAAIAMAAACSBAAgAQAAkwQAMAIAAI8EACADAAAAkgQAIAEAAJMEADACAACPBAAgAwAAAJIEACABAACTBAAwAgAAjwQAIAQRAACTEAAg-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAAJcEACAD-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAAJkEADABQgAAmQQAMAQRAACGEAAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhAgAAAI8EACBCAACcBAAgA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIQIAAACSBAAgQgAAngQAIAIAAACSBAAgQgAAngQAIAMAAACPBAAgSQAAlwQAIEoAAJwEACABAAAAjwQAIAEAAACSBAAgAwUAAIMQACBPAACFEAAgUAAAhBAAIAb1BQAAqQoAMPYFAAClBAAQ9wUAAKkKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEDAAAAkgQAIAEAAKQEADBOAAClBAAgAwAAAJIEACABAACTBAAwAgAAjwQAIAcXAACoCgAg9QUAAKcKADD2BQAAqwQAEPcFAACnCgAw-AUBAAAAAZ8GAQAAAAHcBiAA-wkAIQEAAACoBAAgAQAAAKgEACAHFwAAqAoAIPUFAACnCgAw9gUAAKsEABD3BQAApwoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIQEXAACCEAAgAwAAAKsEACABAACsBAAwAgAAqAQAIAMAAACrBAAgAQAArAQAMAIAAKgEACADAAAAqwQAIAEAAKwEADACAACoBAAgBBcAAIEQACD4BQEAAAABnwYBAAAAAdwGIAAAAAEBQgAAsAQAIAP4BQEAAAABnwYBAAAAAdwGIAAAAAEBQgAAsgQAMAFCAACyBAAwBBcAAPQPACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACECAAAAqAQAIEIAALUEACAD-AUBALALACGfBgEAsAsAIdwGIAD9CwAhAgAAAKsEACBCAAC3BAAgAgAAAKsEACBCAAC3BAAgAwAAAKgEACBJAACwBAAgSgAAtQQAIAEAAACoBAAgAQAAAKsEACADBQAA8Q8AIE8AAPMPACBQAADyDwAgBvUFAACmCgAw9gUAAL4EABD3BQAApgoAMPgFAQDWCQAhnwYBANYJACHcBiAA9wkAIQMAAACrBAAgAQAAvQQAME4AAL4EACADAAAAqwQAIAEAAKwEADACAACoBAAgAQAAAC8AIAEAAAAvACADAAAALAAgAQAALgAwAgAALwAgAwAAACwAIAEAAC4AMAIAAC8AIAMAAAAsACABAAAuADACAAAvACAPEgAA7A8AIBMAAO0PACAUAADuDwAgFQAA7w8AIBYAAPAPACD4BQEAAAABnwYBAAAAAcoGAQAAAAGFBwEAAAABhwcAAACCBwKIBwEAAAABiQeAAAAAAYoHAQAAAAGLBwEAAAABjAcBAAAAAQFCAADGBAAgCvgFAQAAAAGfBgEAAAABygYBAAAAAYUHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABigcBAAAAAYsHAQAAAAGMBwEAAAABAUIAAMgEADABQgAAyAQAMAEAAAAyACAPEgAAxg8AIBMAAMcPACAUAADIDwAgFQAAyQ8AIBYAAMoPACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGFBwEAsAsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAYoHAQCwCwAhiwcBALILACGMBwEAsgsAIQIAAAAvACBCAADMBAAgCvgFAQCwCwAhnwYBALALACHKBgEAsgsAIYUHAQCwCwAhhwcAAIIPggciiAcBALILACGJB4AAAAABigcBALALACGLBwEAsgsAIYwHAQCyCwAhAgAAACwAIEIAAM4EACACAAAALAAgQgAAzgQAIAEAAAAyACADAAAALwAgSQAAxgQAIEoAAMwEACABAAAALwAgAQAAACwAIAcFAADDDwAgTwAAxQ8AIFAAAMQPACDKBgAAqgsAIIgHAACqCwAgiwcAAKoLACCMBwAAqgsAIA31BQAApQoAMPYFAADWBAAQ9wUAAKUKADD4BQEA1gkAIZ8GAQDWCQAhygYBANgJACGFBwEA1gkAIYcHAACfCoIHIogHAQDYCQAhiQcAAIQKACCKBwEA1gkAIYsHAQDYCQAhjAcBANgJACEDAAAALAAgAQAA1QQAME4AANYEACADAAAALAAgAQAALgAwAgAALwAgAQAAADYAIAEAAAA2ACADAAAANAAgAQAANQAwAgAANgAgAwAAADQAIAEAADUAMAIAADYAIAMAAAA0ACABAAA1ADACAAA2ACAKAwAAwg8AIBEAAMEPACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAcwGAQAAAAGCBwAAAIIHAoMHQAAAAAEBQgAA3gQAIAj4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAcwGAQAAAAGCBwAAAIIHAoMHQAAAAAEBQgAA4AQAMAFCAADgBAAwAQAAADIAIAoDAADADwAgEQAAvw8AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALILACHMBgEAsAsAIYIHAACCD4IHIoMHQACzCwAhAgAAADYAIEIAAOQEACAI-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsgsAIcwGAQCwCwAhggcAAIIPggcigwdAALMLACECAAAANAAgQgAA5gQAIAIAAAA0ACBCAADmBAAgAQAAADIAIAMAAAA2ACBJAADeBAAgSgAA5AQAIAEAAAA2ACABAAAANAAgBgUAALwPACBPAAC-DwAgUAAAvQ8AIIAGAACqCwAggQYAAKoLACCQBgAAqgsAIAv1BQAApAoAMPYFAADuBAAQ9wUAAKQKADD4BQEA1gkAIf8FQADZCQAhgAYBANgJACGBBgEA2AkAIZAGAQDYCQAhzAYBANYJACGCBwAAnwqCByKDB0AA2QkAIQMAAAA0ACABAADtBAAwTgAA7gQAIAMAAAA0ACABAAA1ADACAAA2ACABAAAAOwAgAQAAADsAIAMAAAA5ACABAAA6ADACAAA7ACADAAAAOQAgAQAAOgAwAgAAOwAgAwAAADkAIAEAADoAMAIAADsAIAgRAAC7DwAg-AUBAAAAAf8FQAAAAAHMBgEAAAAB1QYBAAAAAf4GAQAAAAH_BhAAAAABgAdAAAAAAQFCAAD2BAAgB_gFAQAAAAH_BUAAAAABzAYBAAAAAdUGAQAAAAH-BgEAAAAB_wYQAAAAAYAHQAAAAAEBQgAA-AQAMAFCAAD4BAAwCBEAALoPACD4BQEAsAsAIf8FQACzCwAhzAYBALALACHVBgEAsgsAIf4GAQCwCwAh_wYQAMILACGAB0AAswsAIQIAAAA7ACBCAAD7BAAgB_gFAQCwCwAh_wVAALMLACHMBgEAsAsAIdUGAQCyCwAh_gYBALALACH_BhAAwgsAIYAHQACzCwAhAgAAADkAIEIAAP0EACACAAAAOQAgQgAA_QQAIAMAAAA7ACBJAAD2BAAgSgAA-wQAIAEAAAA7ACABAAAAOQAgBwUAALUPACBPAAC4DwAgUAAAtw8AIKEBAAC2DwAgogEAALkPACDVBgAAqgsAIP8GAACqCwAgCvUFAACjCgAw9gUAAIQFABD3BQAAowoAMPgFAQDWCQAh_wVAANkJACHMBgEA1gkAIdUGAQDYCQAh_gYBANYJACH_BhAA5gkAIYAHQADZCQAhAwAAADkAIAEAAIMFADBOAACEBQAgAwAAADkAIAEAADoAMAIAADsAIAEAAABEACABAAAARAAgAwAAAEEAIAEAAEMAMAIAAEQAIAMAAABBACABAABDADACAABEACADAAAAQQAgAQAAQwAwAgAARAAgDRIAALAPACATAACxDwAgFAAAsg8AIBUAALMPACAWAAC0DwAg-AUBAAAAAcoGAQAAAAGEBwEAAAABhQcBAAAAAYYHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABAUIAAIwFACAI-AUBAAAAAcoGAQAAAAGEBwEAAAABhQcBAAAAAYYHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABAUIAAI4FADABQgAAjgUAMAEAAAAyACANEgAAig8AIBMAAIsPACAUAACMDwAgFQAAjQ8AIBYAAI4PACD4BQEAsAsAIcoGAQCyCwAhhAcBALALACGFBwEAsAsAIYYHAQCyCwAhhwcAAIIPggciiAcBALILACGJB4AAAAABAgAAAEQAIEIAAJIFACAI-AUBALALACHKBgEAsgsAIYQHAQCwCwAhhQcBALALACGGBwEAsgsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAQIAAABBACBCAACUBQAgAgAAAEEAIEIAAJQFACABAAAAMgAgAwAAAEQAIEkAAIwFACBKAACSBQAgAQAAAEQAIAEAAABBACAGBQAAhw8AIE8AAIkPACBQAACIDwAgygYAAKoLACCGBwAAqgsAIIgHAACqCwAgC_UFAACiCgAw9gUAAJwFABD3BQAAogoAMPgFAQDWCQAhygYBANgJACGEBwEA1gkAIYUHAQDWCQAhhgcBANgJACGHBwAAnwqCByKIBwEA2AkAIYkHAACECgAgAwAAAEEAIAEAAJsFADBOAACcBQAgAwAAAEEAIAEAAEMAMAIAAEQAIAEAAABKACABAAAASgAgAwAAAEgAIAEAAEkAMAIAAEoAIAMAAABIACABAABJADACAABKACADAAAASAAgAQAASQAwAgAASgAgCgMAAIYPACAYAACFDwAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHNBgEAAAABggcAAACCBwKDB0AAAAABAUIAAKQFACAI-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHNBgEAAAABggcAAACCBwKDB0AAAAABAUIAAKYFADABQgAApgUAMAEAAAAyACAKAwAAhA8AIBgAAIMPACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCyCwAhzQYBALALACGCBwAAgg-CByKDB0AAswsAIQIAAABKACBCAACqBQAgCPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALILACHNBgEAsAsAIYIHAACCD4IHIoMHQACzCwAhAgAAAEgAIEIAAKwFACACAAAASAAgQgAArAUAIAEAAAAyACADAAAASgAgSQAApAUAIEoAAKoFACABAAAASgAgAQAAAEgAIAYFAAD_DgAgTwAAgQ8AIFAAAIAPACCABgAAqgsAIIEGAACqCwAgkAYAAKoLACAL9QUAAJ4KADD2BQAAtAUAEPcFAACeCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA2AkAIc0GAQDWCQAhggcAAJ8KggcigwdAANkJACEDAAAASAAgAQAAswUAME4AALQFACADAAAASAAgAQAASQAwAgAASgAgAQAAAE8AIAEAAABPACADAAAATQAgAQAATgAwAgAATwAgAwAAAE0AIAEAAE4AMAIAAE8AIAMAAABNACABAABOADACAABPACAIGAAA_g4AIPgFAQAAAAH_BUAAAAABzQYBAAAAAdUGAQAAAAH-BgEAAAAB_wYQAAAAAYAHQAAAAAEBQgAAvAUAIAf4BQEAAAAB_wVAAAAAAc0GAQAAAAHVBgEAAAAB_gYBAAAAAf8GEAAAAAGAB0AAAAABAUIAAL4FADABQgAAvgUAMAgYAAD9DgAg-AUBALALACH_BUAAswsAIc0GAQCwCwAh1QYBALILACH-BgEAsAsAIf8GEADCCwAhgAdAALMLACECAAAATwAgQgAAwQUAIAf4BQEAsAsAIf8FQACzCwAhzQYBALALACHVBgEAsgsAIf4GAQCwCwAh_wYQAMILACGAB0AAswsAIQIAAABNACBCAADDBQAgAgAAAE0AIEIAAMMFACADAAAATwAgSQAAvAUAIEoAAMEFACABAAAATwAgAQAAAE0AIAcFAAD4DgAgTwAA-w4AIFAAAPoOACChAQAA-Q4AIKIBAAD8DgAg1QYAAKoLACD_BgAAqgsAIAr1BQAAnQoAMPYFAADKBQAQ9wUAAJ0KADD4BQEA1gkAIf8FQADZCQAhzQYBANYJACHVBgEA2AkAIf4GAQDWCQAh_wYQAOYJACGAB0AA2QkAIQMAAABNACABAADJBQAwTgAAygUAIAMAAABNACABAABOADACAABPACAHJAAAnAoAIPUFAACbCgAw9gUAANAFABD3BQAAmwoAMPgFAQAAAAGfBgEAAAAB3AYgAPsJACEBAAAAzQUAIAEAAADNBQAgByQAAJwKACD1BQAAmwoAMPYFAADQBQAQ9wUAAJsKADD4BQEA8gkAIZ8GAQDyCQAh3AYgAPsJACEBJAAA9w4AIAMAAADQBQAgAQAA0QUAMAIAAM0FACADAAAA0AUAIAEAANEFADACAADNBQAgAwAAANAFACABAADRBQAwAgAAzQUAIAQkAAD2DgAg-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAANUFACAD-AUBAAAAAZ8GAQAAAAHcBiAAAAABAUIAANcFADABQgAA1wUAMAQkAADpDgAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhAgAAAM0FACBCAADaBQAgA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIQIAAADQBQAgQgAA3AUAIAIAAADQBQAgQgAA3AUAIAMAAADNBQAgSQAA1QUAIEoAANoFACABAAAAzQUAIAEAAADQBQAgAwUAAOYOACBPAADoDgAgUAAA5w4AIAb1BQAAmgoAMPYFAADjBQAQ9wUAAJoKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEDAAAA0AUAIAEAAOIFADBOAADjBQAgAwAAANAFACABAADRBQAwAgAAzQUAIAEAAACDAQAgAQAAAIMBACADAAAAgQEAIAEAAIIBADACAACDAQAgAwAAAIEBACABAACCAQAwAgAAgwEAIAMAAACBAQAgAQAAggEAMAIAAIMBACALJQAA4g4AICYAAOMOACAsAADkDgAgLQAA5Q4AIPgFAQAAAAGfBgEAAAAB3AYgAAAAAfoGAQAAAAH7BgEAAAAB_AYBAAAAAf0GEAAAAAEBQgAA6wUAIAf4BQEAAAABnwYBAAAAAdwGIAAAAAH6BgEAAAAB-wYBAAAAAfwGAQAAAAH9BhAAAAABAUIAAO0FADABQgAA7QUAMAslAAC9DgAgJgAAvg4AICwAAL8OACAtAADADgAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACECAAAAgwEAIEIAAPAFACAH-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACECAAAAgQEAIEIAAPIFACACAAAAgQEAIEIAAPIFACADAAAAgwEAIEkAAOsFACBKAADwBQAgAQAAAIMBACABAAAAgQEAIAcFAAC4DgAgTwAAuw4AIFAAALoOACChAQAAuQ4AIKIBAAC8DgAg-gYAAKoLACD7BgAAqgsAIAr1BQAAmQoAMPYFAAD5BQAQ9wUAAJkKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACH6BgEA2AkAIfsGAQDYCQAh_AYBANYJACH9BhAA1wkAIQMAAACBAQAgAQAA-AUAME4AAPkFACADAAAAgQEAIAEAAIIBADACAACDAQAgAQAAAH8AIAEAAAB_ACADAAAAfQAgAQAAfgAwAgAAfwAgAwAAAH0AIAEAAH4AMAIAAH8AIAMAAAB9ACABAAB-ADACAAB_ACAMAwAA8w0AIA8AALcOACAnAADyDQAg-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAbYGAQAAAAHsBgEAAAAB9wYgAAAAAfgGEAAAAAH5BhAAAAABAUIAAIEGACAJ-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAbYGAQAAAAHsBgEAAAAB9wYgAAAAAfgGEAAAAAH5BhAAAAABAUIAAIMGADABQgAAgwYAMAEAAAADACAMAwAA8A0AIA8AALYOACAnAADvDQAg-AUBALALACH_BUAAswsAIY4GQACzCwAhkAYBALALACG2BgEAsgsAIewGAQCwCwAh9wYgAP0LACH4BhAAwgsAIfkGEADCCwAhAgAAAH8AIEIAAIcGACAJ-AUBALALACH_BUAAswsAIY4GQACzCwAhkAYBALALACG2BgEAsgsAIewGAQCwCwAh9wYgAP0LACH4BhAAwgsAIfkGEADCCwAhAgAAAH0AIEIAAIkGACACAAAAfQAgQgAAiQYAIAEAAAADACADAAAAfwAgSQAAgQYAIEoAAIcGACABAAAAfwAgAQAAAH0AIAgFAACxDgAgTwAAtA4AIFAAALMOACChAQAAsg4AIKIBAAC1DgAgtgYAAKoLACD4BgAAqgsAIPkGAACqCwAgDPUFAACYCgAw9gUAAJEGABD3BQAAmAoAMPgFAQDWCQAh_wVAANkJACGOBkAA2QkAIZAGAQDWCQAhtgYBANgJACHsBgEA1gkAIfcGIAD3CQAh-AYQAOYJACH5BhAA5gkAIQMAAAB9ACABAACQBgAwTgAAkQYAIAMAAAB9ACABAAB-ADACAAB_ACABAAAAiQEAIAEAAACJAQAgAwAAAIcBACABAACIAQAwAgAAiQEAIAMAAACHAQAgAQAAiAEAMAIAAIkBACADAAAAhwEAIAEAAIgBADACAACJAQAgCycAAK8OACArAACwDgAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAAB7AYBAAAAAfUGAQAAAAH2BkAAAAABAUIAAJkGACAJ-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAAB7AYBAAAAAfUGAQAAAAH2BkAAAAABAUIAAJsGADABQgAAmwYAMAsnAACkDgAgKwAApQ4AIPgFAQCwCwAh-gUQALELACH7BQEAsgsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIewGAQCwCwAh9QYBALILACH2BkAAswsAIQIAAACJAQAgQgAAngYAIAn4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACHsBgEAsAsAIfUGAQCyCwAh9gZAALMLACECAAAAhwEAIEIAAKAGACACAAAAhwEAIEIAAKAGACADAAAAiQEAIEkAAJkGACBKAACeBgAgAQAAAIkBACABAAAAhwEAIAkFAACfDgAgTwAAog4AIFAAAKEOACChAQAAoA4AIKIBAACjDgAg-wUAAKoLACCABgAAqgsAIIEGAACqCwAg9QYAAKoLACAM9QUAAJcKADD2BQAApwYAEPcFAACXCgAw-AUBANYJACH6BRAA1wkAIfsFAQDYCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAh7AYBANYJACH1BgEA2AkAIfYGQADZCQAhAwAAAIcBACABAACmBgAwTgAApwYAIAMAAACHAQAgAQAAiAEAMAIAAIkBACABAAAAjQEAIAEAAACNAQAgAwAAAIsBACABAACMAQAwAgAAjQEAIAMAAACLAQAgAQAAjAEAMAIAAI0BACADAAAAiwEAIAEAAIwBADACAACNAQAgCygAAJUOACAqAACeDgAg-AUBAAAAAfoFEAAAAAH9BQEAAAAB_wVAAAAAAYAGAQAAAAHyBgEAAAAB8wYBAAAAAfQGQAAAAAH1BgEAAAABAUIAAK8GACAJ-AUBAAAAAfoFEAAAAAH9BQEAAAAB_wVAAAAAAYAGAQAAAAHyBgEAAAAB8wYBAAAAAfQGQAAAAAH1BgEAAAABAUIAALEGADABQgAAsQYAMAEAAACPAQAgCygAAJMOACAqAACdDgAg-AUBALALACH6BRAAsQsAIf0FAQCyCwAh_wVAALMLACGABgEAsgsAIfIGAQCwCwAh8wYBALILACH0BkAAswsAIfUGAQCyCwAhAgAAAI0BACBCAAC1BgAgCfgFAQCwCwAh-gUQALELACH9BQEAsgsAIf8FQACzCwAhgAYBALILACHyBgEAsAsAIfMGAQCyCwAh9AZAALMLACH1BgEAsgsAIQIAAACLAQAgQgAAtwYAIAIAAACLAQAgQgAAtwYAIAEAAACPAQAgAwAAAI0BACBJAACvBgAgSgAAtQYAIAEAAACNAQAgAQAAAIsBACAJBQAAmA4AIE8AAJsOACBQAACaDgAgoQEAAJkOACCiAQAAnA4AIP0FAACqCwAggAYAAKoLACDzBgAAqgsAIPUGAACqCwAgDPUFAACWCgAw9gUAAL8GABD3BQAAlgoAMPgFAQDWCQAh-gUQANcJACH9BQEA2AkAIf8FQADZCQAhgAYBANgJACHyBgEA1gkAIfMGAQDYCQAh9AZAANkJACH1BgEA2AkAIQMAAACLAQAgAQAAvgYAME4AAL8GACADAAAAiwEAIAEAAIwBADACAACNAQAgAQAAAJUBACABAAAAlQEAIAMAAACPAQAgAQAAlAEAMAIAAJUBACADAAAAjwEAIAEAAJQBADACAACVAQAgAwAAAI8BACABAACUAQAwAgAAlQEAIA4nAACWDgAgKQAAlw4AIPgFAQAAAAH8BUAAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABmQYBAAAAAewGAQAAAAHtBhAAAAAB7gYQAAAAAe8GEAAAAAHwBhAAAAAB8QYBAAAAAQFCAADHBgAgDPgFAQAAAAH8BUAAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABmQYBAAAAAewGAQAAAAHtBhAAAAAB7gYQAAAAAe8GEAAAAAHwBhAAAAAB8QYBAAAAAQFCAADJBgAwAUIAAMkGADAOJwAAhg4AICkAAIcOACD4BQEAsAsAIfwFQADECwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhmQYBALALACHsBgEAsAsAIe0GEACxCwAh7gYQALELACHvBhAAsQsAIfAGEACxCwAh8QYBALILACECAAAAlQEAIEIAAMwGACAM-AUBALALACH8BUAAxAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZkGAQCwCwAh7AYBALALACHtBhAAsQsAIe4GEACxCwAh7wYQALELACHwBhAAsQsAIfEGAQCyCwAhAgAAAI8BACBCAADOBgAgAgAAAI8BACBCAADOBgAgAwAAAJUBACBJAADHBgAgSgAAzAYAIAEAAACVAQAgAQAAAI8BACAJBQAAgQ4AIE8AAIQOACBQAACDDgAgoQEAAIIOACCiAQAAhQ4AIPwFAACqCwAggAYAAKoLACCBBgAAqgsAIPEGAACqCwAgD_UFAACVCgAw9gUAANUGABD3BQAAlQoAMPgFAQDWCQAh_AVAAOgJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGZBgEA1gkAIewGAQDWCQAh7QYQANcJACHuBhAA1wkAIe8GEADXCQAh8AYQANcJACHxBgEA2AkAIQMAAACPAQAgAQAA1AYAME4AANUGACADAAAAjwEAIAEAAJQBADACAACVAQAgAQAAACMAIAEAAAAjACADAAAAIQAgAQAAIgAwAgAAIwAgAwAAACEAIAEAACIAMAIAACMAIAMAAAAhACABAAAiADACAAAjACASAwAA8QwAIA4AAL4NACAPAADyDAAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG1BkAAAAABtgYBAAAAAcsGAQAAAAHSBhAAAAAB2wYBAAAAAecGEAAAAAHoBgEAAAAB6QYQAAAAAeoGAQAAAAHrBgEAAAABAUIAAN0GACAP-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG1BkAAAAABtgYBAAAAAcsGAQAAAAHSBhAAAAAB2wYBAAAAAecGEAAAAAHoBgEAAAAB6QYQAAAAAeoGAQAAAAHrBgEAAAABAUIAAN8GADABQgAA3wYAMAEAAAADACASAwAA7gwAIA4AALwNACAPAADvDAAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbUGQACzCwAhtgYBALILACHLBgEAsAsAIdIGEACxCwAh2wYBALILACHnBhAAsQsAIegGAQCwCwAh6QYQALELACHqBgEAsgsAIesGAQCyCwAhAgAAACMAIEIAAOMGACAP-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbUGQACzCwAhtgYBALILACHLBgEAsAsAIdIGEACxCwAh2wYBALILACHnBhAAsQsAIegGAQCwCwAh6QYQALELACHqBgEAsgsAIesGAQCyCwAhAgAAACEAIEIAAOUGACACAAAAIQAgQgAA5QYAIAEAAAADACADAAAAIwAgSQAA3QYAIEoAAOMGACABAAAAIwAgAQAAACEAIAsFAAD8DQAgTwAA_w0AIFAAAP4NACChAQAA_Q0AIKIBAACADgAggAYAAKoLACCBBgAAqgsAILYGAACqCwAg2wYAAKoLACDqBgAAqgsAIOsGAACqCwAgEvUFAACUCgAw9gUAAO0GABD3BQAAlAoAMPgFAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhkAYBANYJACG1BkAA2QkAIbYGAQDYCQAhywYBANYJACHSBhAA1wkAIdsGAQDYCQAh5wYQANcJACHoBgEA1gkAIekGEADXCQAh6gYBANgJACHrBgEA2AkAIQMAAAAhACABAADsBgAwTgAA7QYAIAMAAAAhACABAAAiADACAAAjACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIBYDAAD0DQAgEAAA-g0AIBkAAPkNACAeAAD3DQAgJgAA9g0AIDMAAPsNACA4AAD1DQAgOgAA-A0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABtwZAAAAAAdUGAQAAAAHgBgEAAAAB4QYBAAAAAeIGAQAAAAHjBgEAAAAB5AYBAAAAAeUGAQAAAAHmBoAAAAABAUIAAPUGACAO-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeAGAQAAAAHhBgEAAAAB4gYBAAAAAeMGAQAAAAHkBgEAAAAB5QYBAAAAAeYGgAAAAAEBQgAA9wYAMAFCAAD3BgAwFgMAAKANACAQAACmDQAgGQAApQ0AIB4AAKMNACAmAACiDQAgMwAApw0AIDgAAKENACA6AACkDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABAgAAAAUAIEIAAPoGACAO-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABAgAAAAMAIEIAAPwGACACAAAAAwAgQgAA_AYAIAMAAAAFACBJAAD1BgAgSgAA-gYAIAEAAAAFACABAAAAAwAgCwUAAJ0NACBPAACfDQAgUAAAng0AIIAGAACqCwAggQYAAKoLACDVBgAAqgsAIOEGAACqCwAg4gYAAKoLACDjBgAAqgsAIOQGAACqCwAg5QYAAKoLACAR9QUAAJMKADD2BQAAgwcAEPcFAACTCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIbcGQADZCQAh1QYBANgJACHgBgEA1gkAIeEGAQDYCQAh4gYBANgJACHjBgEA2AkAIeQGAQDYCQAh5QYBANgJACHmBgAAhAoAIAMAAAADACABAACCBwAwTgAAgwcAIAMAAAADACABAAAEADACAAAFACABAAAAzwEAIAEAAADPAQAgAwAAAM0BACABAADOAQAwAgAAzwEAIAMAAADNAQAgAQAAzgEAMAIAAM8BACADAAAAzQEAIAEAAM4BADACAADPAQAgBw8AAJsNACA5AACcDQAg-AUBAAAAAf8FQAAAAAG2BgEAAAAB3gYBAAAAAd8GAQAAAAEBQgAAiwcAIAX4BQEAAAAB_wVAAAAAAbYGAQAAAAHeBgEAAAAB3wYBAAAAAQFCAACNBwAwAUIAAI0HADAHDwAAmQ0AIDkAAJoNACD4BQEAsAsAIf8FQACzCwAhtgYBALALACHeBgEAsAsAId8GAQCwCwAhAgAAAM8BACBCAACQBwAgBfgFAQCwCwAh_wVAALMLACG2BgEAsAsAId4GAQCwCwAh3wYBALALACECAAAAzQEAIEIAAJIHACACAAAAzQEAIEIAAJIHACADAAAAzwEAIEkAAIsHACBKAACQBwAgAQAAAM8BACABAAAAzQEAIAMFAACWDQAgTwAAmA0AIFAAAJcNACAI9QUAAJIKADD2BQAAmQcAEPcFAACSCgAw-AUBANYJACH_BUAA2QkAIbYGAQDWCQAh3gYBANYJACHfBgEA1gkAIQMAAADNAQAgAQAAmAcAME4AAJkHACADAAAAzQEAIAEAAM4BADACAADPAQAgDg0AAI8KACAQAACQCgAgFgAAkQoAIPUFAACOCgAw9gUAACoAEPcFAACOCgAw-AUBAAAAAZ8GAQDyCQAhoAYBAPMJACGhBgEA8wkAIaIGAQDzCQAhowYBAPMJACGlBkAA9AkAId0GAADwCQAgAQAAAJwHACABAAAAnAcAIAgNAACTDQAgEAAAlA0AIBYAAJUNACCgBgAAqgsAIKEGAACqCwAgogYAAKoLACCjBgAAqgsAIKUGAACqCwAgAwAAACoAIAEAAJ8HADACAACcBwAgAwAAACoAIAEAAJ8HADACAACcBwAgAwAAACoAIAEAAJ8HADACAACcBwAgCw0AAJANACAQAACRDQAgFgAAkg0AIPgFAQAAAAGfBgEAAAABoAYBAAAAAaEGAQAAAAGiBgEAAAABowYBAAAAAaUGQAAAAAHdBgAAjw0AIAFCAACjBwAgCPgFAQAAAAGfBgEAAAABoAYBAAAAAaEGAQAAAAGiBgEAAAABowYBAAAAAaUGQAAAAAHdBgAAjw0AIAFCAAClBwAwAUIAAKUHADALDQAA1AwAIBAAANUMACAWAADWDAAg-AUBALALACGfBgEAsAsAIaAGAQCyCwAhoQYBALILACGiBgEAsgsAIaMGAQCyCwAhpQZAAMQLACHdBgAA0wwAIAIAAACcBwAgQgAAqAcAIAj4BQEAsAsAIZ8GAQCwCwAhoAYBALILACGhBgEAsgsAIaIGAQCyCwAhowYBALILACGlBkAAxAsAId0GAADTDAAgAgAAACoAIEIAAKoHACACAAAAKgAgQgAAqgcAIAMAAACcBwAgSQAAowcAIEoAAKgHACABAAAAnAcAIAEAAAAqACAIBQAA0AwAIE8AANIMACBQAADRDAAgoAYAAKoLACChBgAAqgsAIKIGAACqCwAgowYAAKoLACClBgAAqgsAIAv1BQAAjQoAMPYFAACxBwAQ9wUAAI0KADD4BQEA1gkAIZ8GAQDWCQAhoAYBANgJACGhBgEA2AkAIaIGAQDYCQAhowYBANgJACGlBkAA6AkAId0GAADwCQAgAwAAACoAIAEAALAHADBOAACxBwAgAwAAACoAIAEAAJ8HADACAACcBwAgBxkAAIwKACD1BQAAiwoAMPYFAAC3BwAQ9wUAAIsKADD4BQEAAAABnwYBAAAAAdwGIAD7CQAhAQAAALQHACABAAAAtAcAIAcZAACMCgAg9QUAAIsKADD2BQAAtwcAEPcFAACLCgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhARkAAM8MACADAAAAtwcAIAEAALgHADACAAC0BwAgAwAAALcHACABAAC4BwAwAgAAtAcAIAMAAAC3BwAgAQAAuAcAMAIAALQHACAEGQAAzgwAIPgFAQAAAAGfBgEAAAAB3AYgAAAAAQFCAAC8BwAgA_gFAQAAAAGfBgEAAAAB3AYgAAAAAQFCAAC-BwAwAUIAAL4HADAEGQAAwQwAIPgFAQCwCwAhnwYBALALACHcBiAA_QsAIQIAAAC0BwAgQgAAwQcAIAP4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACECAAAAtwcAIEIAAMMHACACAAAAtwcAIEIAAMMHACADAAAAtAcAIEkAALwHACBKAADBBwAgAQAAALQHACABAAAAtwcAIAMFAAC-DAAgTwAAwAwAIFAAAL8MACAG9QUAAIoKADD2BQAAygcAEPcFAACKCgAw-AUBANYJACGfBgEA1gkAIdwGIAD3CQAhAwAAALcHACABAADJBwAwTgAAygcAIAMAAAC3BwAgAQAAuAcAMAIAALQHACABAAAAWwAgAQAAAFsAIAMAAABZACABAABaADACAABbACADAAAAWQAgAQAAWgAwAgAAWwAgAwAAAFkAIAEAAFoAMAIAAFsAIBIDAAC6DAAgBgAAuwwAIA8AAL0MACAaAAC8DAAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAZIGAQAAAAG2BgEAAAAB1wYBAAAAAdgGAQAAAAHZBgEAAAAB2gZAAAAAAdsGAQAAAAEBQgAA0gcAIA74BQEAAAAB-gUQAAAAAfsFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABkgYBAAAAAbYGAQAAAAHXBgEAAAAB2AYBAAAAAdkGAQAAAAHaBkAAAAAB2wYBAAAAAQFCAADUBwAwAUIAANQHADABAAAAHAAgAQAAAAMAIBIDAAC2DAAgBgAAtwwAIA8AALkMACAaAAC4DAAg-AUBALALACH6BRAAsQsAIfsFAQCyCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACGSBgEAsgsAIbYGAQCyCwAh1wYBALALACHYBgEAsgsAIdkGAQCyCwAh2gZAALMLACHbBgEAsgsAIQIAAABbACBCAADZBwAgDvgFAQCwCwAh-gUQALELACH7BQEAsgsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhkgYBALILACG2BgEAsgsAIdcGAQCwCwAh2AYBALILACHZBgEAsgsAIdoGQACzCwAh2wYBALILACECAAAAWQAgQgAA2wcAIAIAAABZACBCAADbBwAgAQAAABwAIAEAAAADACADAAAAWwAgSQAA0gcAIEoAANkHACABAAAAWwAgAQAAAFkAIA0FAACxDAAgTwAAtAwAIFAAALMMACChAQAAsgwAIKIBAAC1DAAg-wUAAKoLACCABgAAqgsAIIEGAACqCwAgkgYAAKoLACC2BgAAqgsAINgGAACqCwAg2QYAAKoLACDbBgAAqgsAIBH1BQAAiQoAMPYFAADkBwAQ9wUAAIkKADD4BQEA1gkAIfoFEADXCQAh-wUBANgJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIZIGAQDYCQAhtgYBANgJACHXBgEA1gkAIdgGAQDYCQAh2QYBANgJACHaBkAA2QkAIdsGAQDYCQAhAwAAAFkAIAEAAOMHADBOAADkBwAgAwAAAFkAIAEAAFoAMAIAAFsAIAEAAAAoACABAAAAKAAgAwAAACYAIAEAACcAMAIAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgGQMAAK0MACAOAACuDAAgEQAArwwAIBgAALAMACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzAYBAAAAAc0GAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAEBQgAA7AcAIBX4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzAYBAAAAAc0GAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAEBQgAA7gcAMAFCAADuBwAwAQAAACoAIAEAAAAsACABAAAAQQAgGQMAAKkMACAOAACqDAAgEQAAqwwAIBgAAKwMACD4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACHIBgEAsAsAIckGAQCyCwAhygYBALALACHLBgEAsgsAIcwGAQCyCwAhzQYBALILACHOBgEAsgsAIc8GAgCJDAAh0AYQALELACHRBhAAsQsAIdIGEACxCwAh0wYBALILACHUBgEAsgsAIdUGAQCyCwAh1gZAALMLACECAAAAKAAgQgAA9AcAIBX4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACHIBgEAsAsAIckGAQCyCwAhygYBALALACHLBgEAsgsAIcwGAQCyCwAhzQYBALILACHOBgEAsgsAIc8GAgCJDAAh0AYQALELACHRBhAAsQsAIdIGEACxCwAh0wYBALILACHUBgEAsgsAIdUGAQCyCwAh1gZAALMLACECAAAAJgAgQgAA9gcAIAIAAAAmACBCAAD2BwAgAQAAACoAIAEAAAAsACABAAAAQQAgAwAAACgAIEkAAOwHACBKAAD0BwAgAQAAACgAIAEAAAAmACAPBQAApAwAIE8AAKcMACBQAACmDAAgoQEAAKUMACCiAQAAqAwAIIAGAACqCwAggQYAAKoLACDJBgAAqgsAIMsGAACqCwAgzAYAAKoLACDNBgAAqgsAIM4GAACqCwAg0wYAAKoLACDUBgAAqgsAINUGAACqCwAgGPUFAACICgAw9gUAAIAIABD3BQAAiAoAMPgFAQDWCQAh_gUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIcgGAQDWCQAhyQYBANgJACHKBgEA1gkAIcsGAQDYCQAhzAYBANgJACHNBgEA2AkAIc4GAQDYCQAhzwYCAIAKACHQBhAA1wkAIdEGEADXCQAh0gYQANcJACHTBgEA2AkAIdQGAQDYCQAh1QYBANgJACHWBkAA2QkAIQMAAAAmACABAAD_BwAwTgAAgAgAIAMAAAAmACABAAAnADACAAAoACAO9QUAAIcKADD2BQAAhggAEPcFAACHCgAw-AUBAAAAAf8FQAD8CQAhngZAAPwJACHABgEA8gkAIcEGAQDzCQAhwgYBAPIJACHDBgEA8gkAIcQGAQDyCQAhxQYBAPMJACHGBgEA8wkAIccGAQDzCQAhAQAAAIMIACABAAAAgwgAIA71BQAAhwoAMPYFAACGCAAQ9wUAAIcKADD4BQEA8gkAIf8FQAD8CQAhngZAAPwJACHABgEA8gkAIcEGAQDzCQAhwgYBAPIJACHDBgEA8gkAIcQGAQDyCQAhxQYBAPMJACHGBgEA8wkAIccGAQDzCQAhBMEGAACqCwAgxQYAAKoLACDGBgAAqgsAIMcGAACqCwAgAwAAAIYIACABAACHCAAwAgAAgwgAIAMAAACGCAAgAQAAhwgAMAIAAIMIACADAAAAhggAIAEAAIcIADACAACDCAAgC_gFAQAAAAH_BUAAAAABngZAAAAAAcAGAQAAAAHBBgEAAAABwgYBAAAAAcMGAQAAAAHEBgEAAAABxQYBAAAAAcYGAQAAAAHHBgEAAAABAUIAAIsIACAL-AUBAAAAAf8FQAAAAAGeBkAAAAABwAYBAAAAAcEGAQAAAAHCBgEAAAABwwYBAAAAAcQGAQAAAAHFBgEAAAABxgYBAAAAAccGAQAAAAEBQgAAjQgAMAFCAACNCAAwC_gFAQCwCwAh_wVAALMLACGeBkAAswsAIcAGAQCwCwAhwQYBALILACHCBgEAsAsAIcMGAQCwCwAhxAYBALALACHFBgEAsgsAIcYGAQCyCwAhxwYBALILACECAAAAgwgAIEIAAJAIACAL-AUBALALACH_BUAAswsAIZ4GQACzCwAhwAYBALALACHBBgEAsgsAIcIGAQCwCwAhwwYBALALACHEBgEAsAsAIcUGAQCyCwAhxgYBALILACHHBgEAsgsAIQIAAACGCAAgQgAAkggAIAIAAACGCAAgQgAAkggAIAMAAACDCAAgSQAAiwgAIEoAAJAIACABAAAAgwgAIAEAAACGCAAgBwUAAKEMACBPAACjDAAgUAAAogwAIMEGAACqCwAgxQYAAKoLACDGBgAAqgsAIMcGAACqCwAgDvUFAACGCgAw9gUAAJkIABD3BQAAhgoAMPgFAQDWCQAh_wVAANkJACGeBkAA2QkAIcAGAQDWCQAhwQYBANgJACHCBgEA1gkAIcMGAQDWCQAhxAYBANYJACHFBgEA2AkAIcYGAQDYCQAhxwYBANgJACEDAAAAhggAIAEAAJgIADBOAACZCAAgAwAAAIYIACABAACHCAAwAgAAgwgAIAEAAACiAQAgAQAAAKIBACADAAAAoAEAIAEAAKEBADACAACiAQAgAwAAAKABACABAAChAQAwAgAAogEAIAMAAACgAQAgAQAAoQEAMAIAAKIBACAJAwAAngwAIA8AAJ8MACAyAACgDAAg-AUBAAAAAZAGAQAAAAG2BgEAAAABtwZAAAAAAbgGgAAAAAG5BkAAAAABAUIAAKEIACAG-AUBAAAAAZAGAQAAAAG2BgEAAAABtwZAAAAAAbgGgAAAAAG5BkAAAAABAUIAAKMIADABQgAAowgAMAkDAACPDAAgDwAAkAwAIDIAAJEMACD4BQEAsAsAIZAGAQCwCwAhtgYBALALACG3BkAAswsAIbgGgAAAAAG5BkAAswsAIQIAAACiAQAgQgAApggAIAb4BQEAsAsAIZAGAQCwCwAhtgYBALALACG3BkAAswsAIbgGgAAAAAG5BkAAswsAIQIAAACgAQAgQgAAqAgAIAIAAACgAQAgQgAAqAgAIAMAAACiAQAgSQAAoQgAIEoAAKYIACABAAAAogEAIAEAAACgAQAgAwUAAIwMACBPAACODAAgUAAAjQwAIAn1BQAAgwoAMPYFAACvCAAQ9wUAAIMKADD4BQEA1gkAIZAGAQDWCQAhtgYBANYJACG3BkAA2QkAIbgGAACECgAguQZAANkJACEDAAAAoAEAIAEAAK4IADBOAACvCAAgAwAAAKABACABAAChAQAwAgAAogEAIAEAAACmAQAgAQAAAKYBACADAAAApAEAIAEAAKUBADACAACmAQAgAwAAAKQBACABAAClAQAwAgAApgEAIAMAAACkAQAgAQAApQEAMAIAAKYBACAJMQAAiwwAIPgFAQAAAAH_BUAAAAABmQYBAAAAAbEGAQAAAAGyBgEAAAABswYCAAAAAbQGAQAAAAG1BkAAAAABAUIAALcIACAI-AUBAAAAAf8FQAAAAAGZBgEAAAABsQYBAAAAAbIGAQAAAAGzBgIAAAABtAYBAAAAAbUGQAAAAAEBQgAAuQgAMAFCAAC5CAAwCTEAAIoMACD4BQEAsAsAIf8FQACzCwAhmQYBALALACGxBgEAsAsAIbIGAQCwCwAhswYCAIkMACG0BgEAsgsAIbUGQADECwAhAgAAAKYBACBCAAC8CAAgCPgFAQCwCwAh_wVAALMLACGZBgEAsAsAIbEGAQCwCwAhsgYBALALACGzBgIAiQwAIbQGAQCyCwAhtQZAAMQLACECAAAApAEAIEIAAL4IACACAAAApAEAIEIAAL4IACADAAAApgEAIEkAALcIACBKAAC8CAAgAQAAAKYBACABAAAApAEAIAcFAACEDAAgTwAAhwwAIFAAAIYMACChAQAAhQwAIKIBAACIDAAgtAYAAKoLACC1BgAAqgsAIAv1BQAA_wkAMPYFAADFCAAQ9wUAAP8JADD4BQEA1gkAIf8FQADZCQAhmQYBANYJACGxBgEA1gkAIbIGAQDWCQAhswYCAIAKACG0BgEA2AkAIbUGQADoCQAhAwAAAKQBACABAADECAAwTgAAxQgAIAMAAACkAQAgAQAApQEAMAIAAKYBACAH9QUAAP4JADD2BQAAywgAEPcFAAD-CQAw-AUBAAAAAa4GAADwCQAgrwYgAPsJACGxBgEAAAABAQAAAMgIACABAAAAyAgAIAf1BQAA_gkAMPYFAADLCAAQ9wUAAP4JADD4BQEA8gkAIa4GAADwCQAgrwYgAPsJACGxBgEA8gkAIQADAAAAywgAIAEAAMwIADACAADICAAgAwAAAMsIACABAADMCAAwAgAAyAgAIAMAAADLCAAgAQAAzAgAMAIAAMgIACAE-AUBAAAAAa4GAACDDAAgrwYgAAAAAbEGAQAAAAEBQgAA0AgAIAT4BQEAAAABrgYAAIMMACCvBiAAAAABsQYBAAAAAQFCAADSCAAwAUIAANIIADAE-AUBALALACGuBgAAggwAIK8GIAD9CwAhsQYBALALACECAAAAyAgAIEIAANUIACAE-AUBALALACGuBgAAggwAIK8GIAD9CwAhsQYBALALACECAAAAywgAIEIAANcIACACAAAAywgAIEIAANcIACADAAAAyAgAIEkAANAIACBKAADVCAAgAQAAAMgIACABAAAAywgAIAMFAAD_CwAgTwAAgQwAIFAAAIAMACAH9QUAAP0JADD2BQAA3ggAEPcFAAD9CQAw-AUBANYJACGuBgAA8AkAIK8GIAD3CQAhsQYBANYJACEDAAAAywgAIAEAAN0IADBOAADeCAAgAwAAAMsIACABAADMCAAwAgAAyAgAIAz1BQAA-gkAMPYFAADkCAAQ9wUAAPoJADD4BQEAAAAB_wVAAPwJACGQBgEA8wkAIZ4GQAD8CQAhrAYBAPIJACGtBgEA8gkAIa4GAADwCQAgrwYgAPsJACGwBkAA9AkAIQEAAADhCAAgAQAAAOEIACAM9QUAAPoJADD2BQAA5AgAEPcFAAD6CQAw-AUBAPIJACH_BUAA_AkAIZAGAQDzCQAhngZAAPwJACGsBgEA8gkAIa0GAQDyCQAhrgYAAPAJACCvBiAA-wkAIbAGQAD0CQAhApAGAACqCwAgsAYAAKoLACADAAAA5AgAIAEAAOUIADACAADhCAAgAwAAAOQIACABAADlCAAwAgAA4QgAIAMAAADkCAAgAQAA5QgAMAIAAOEIACAJ-AUBAAAAAf8FQAAAAAGQBgEAAAABngZAAAAAAawGAQAAAAGtBgEAAAABrgYAAP4LACCvBiAAAAABsAZAAAAAAQFCAADpCAAgCfgFAQAAAAH_BUAAAAABkAYBAAAAAZ4GQAAAAAGsBgEAAAABrQYBAAAAAa4GAAD-CwAgrwYgAAAAAbAGQAAAAAEBQgAA6wgAMAFCAADrCAAwCfgFAQCwCwAh_wVAALMLACGQBgEAsgsAIZ4GQACzCwAhrAYBALALACGtBgEAsAsAIa4GAAD8CwAgrwYgAP0LACGwBkAAxAsAIQIAAADhCAAgQgAA7ggAIAn4BQEAsAsAIf8FQACzCwAhkAYBALILACGeBkAAswsAIawGAQCwCwAhrQYBALALACGuBgAA_AsAIK8GIAD9CwAhsAZAAMQLACECAAAA5AgAIEIAAPAIACACAAAA5AgAIEIAAPAIACADAAAA4QgAIEkAAOkIACBKAADuCAAgAQAAAOEIACABAAAA5AgAIAUFAAD5CwAgTwAA-wsAIFAAAPoLACCQBgAAqgsAILAGAACqCwAgDPUFAAD2CQAw9gUAAPcIABD3BQAA9gkAMPgFAQDWCQAh_wVAANkJACGQBgEA2AkAIZ4GQADZCQAhrAYBANYJACGtBgEA1gkAIa4GAADwCQAgrwYgAPcJACGwBkAA6AkAIQMAAADkCAAgAQAA9ggAME4AAPcIACADAAAA5AgAIAEAAOUIADACAADhCAAgDDQAAPUJACD1BQAA8QkAMPYFAAD9CAAQ9wUAAPEJADD4BQEAAAABnwYBAPIJACGgBgEA8wkAIaEGAQDzCQAhogYBAPMJACGjBgEA8wkAIaQGAADwCQAgpQZAAPQJACEBAAAA-ggAIAEAAAD6CAAgDDQAAPUJACD1BQAA8QkAMPYFAAD9CAAQ9wUAAPEJADD4BQEA8gkAIZ8GAQDyCQAhoAYBAPMJACGhBgEA8wkAIaIGAQDzCQAhowYBAPMJACGkBgAA8AkAIKUGQAD0CQAhBjQAAPgLACCgBgAAqgsAIKEGAACqCwAgogYAAKoLACCjBgAAqgsAIKUGAACqCwAgAwAAAP0IACABAAD-CAAwAgAA-ggAIAMAAAD9CAAgAQAA_ggAMAIAAPoIACADAAAA_QgAIAEAAP4IADACAAD6CAAgCTQAAPcLACD4BQEAAAABnwYBAAAAAaAGAQAAAAGhBgEAAAABogYBAAAAAaMGAQAAAAGkBgAA9gsAIKUGQAAAAAEBQgAAggkAIAj4BQEAAAABnwYBAAAAAaAGAQAAAAGhBgEAAAABogYBAAAAAaMGAQAAAAGkBgAA9gsAIKUGQAAAAAEBQgAAhAkAMAFCAACECQAwCTQAAOkLACD4BQEAsAsAIZ8GAQCwCwAhoAYBALILACGhBgEAsgsAIaIGAQCyCwAhowYBALILACGkBgAA6AsAIKUGQADECwAhAgAAAPoIACBCAACHCQAgCPgFAQCwCwAhnwYBALALACGgBgEAsgsAIaEGAQCyCwAhogYBALILACGjBgEAsgsAIaQGAADoCwAgpQZAAMQLACECAAAA_QgAIEIAAIkJACACAAAA_QgAIEIAAIkJACADAAAA-ggAIEkAAIIJACBKAACHCQAgAQAAAPoIACABAAAA_QgAIAgFAADlCwAgTwAA5wsAIFAAAOYLACCgBgAAqgsAIKEGAACqCwAgogYAAKoLACCjBgAAqgsAIKUGAACqCwAgC_UFAADvCQAw9gUAAJAJABD3BQAA7wkAMPgFAQDWCQAhnwYBANYJACGgBgEA2AkAIaEGAQDYCQAhogYBANgJACGjBgEA2AkAIaQGAADwCQAgpQZAAOgJACEDAAAA_QgAIAEAAI8JADBOAACQCQAgAwAAAP0IACABAAD-CAAwAgAA-ggAIAEAAACsAQAgAQAAAKwBACADAAAAqgEAIAEAAKsBADACAACsAQAgAwAAAKoBACABAACrAQAwAgAArAEAIAMAAACqAQAgAQAAqwEAMAIAAKwBACAVAwAA4gsAIC0AAOQLACA1AADhCwAgNwAA4wsAIPgFAQAAAAH_BUAAAAABjwYBAAAAAZAGAQAAAAGRBgEAAAABkgYBAAAAAZMGAQAAAAGUBgEAAAABlQYQAAAAAZYGEAAAAAGXBhAAAAABmQYAAACZBgKaBkAAAAABmwZAAAAAAZwGEAAAAAGdBhAAAAABngZAAAAAAQFCAACYCQAgEfgFAQAAAAH_BUAAAAABjwYBAAAAAZAGAQAAAAGRBgEAAAABkgYBAAAAAZMGAQAAAAGUBgEAAAABlQYQAAAAAZYGEAAAAAGXBhAAAAABmQYAAACZBgKaBkAAAAABmwZAAAAAAZwGEAAAAAGdBhAAAAABngZAAAAAAQFCAACaCQAwAUIAAJoJADAVAwAAxgsAIC0AAMgLACA1AADFCwAgNwAAxwsAIPgFAQCwCwAh_wVAALMLACGPBgEAsAsAIZAGAQCwCwAhkQYBALILACGSBgEAsgsAIZMGAQCyCwAhlAYBALILACGVBhAAwgsAIZYGEADCCwAhlwYQAMILACGZBgAAwwuZBiKaBkAAxAsAIZsGQADECwAhnAYQALELACGdBhAAsQsAIZ4GQACzCwAhAgAAAKwBACBCAACdCQAgEfgFAQCwCwAh_wVAALMLACGPBgEAsAsAIZAGAQCwCwAhkQYBALILACGSBgEAsgsAIZMGAQCyCwAhlAYBALILACGVBhAAwgsAIZYGEADCCwAhlwYQAMILACGZBgAAwwuZBiKaBkAAxAsAIZsGQADECwAhnAYQALELACGdBhAAsQsAIZ4GQACzCwAhAgAAAKoBACBCAACfCQAgAgAAAKoBACBCAACfCQAgAwAAAKwBACBJAACYCQAgSgAAnQkAIAEAAACsAQAgAQAAAKoBACAOBQAAvQsAIE8AAMALACBQAAC_CwAgoQEAAL4LACCiAQAAwQsAIJEGAACqCwAgkgYAAKoLACCTBgAAqgsAIJQGAACqCwAglQYAAKoLACCWBgAAqgsAIJcGAACqCwAgmgYAAKoLACCbBgAAqgsAIBT1BQAA5QkAMPYFAACmCQAQ9wUAAOUJADD4BQEA1gkAIf8FQADZCQAhjwYBANYJACGQBgEA1gkAIZEGAQDYCQAhkgYBANgJACGTBgEA2AkAIZQGAQDYCQAhlQYQAOYJACGWBhAA5gkAIZcGEADmCQAhmQYAAOcJmQYimgZAAOgJACGbBkAA6AkAIZwGEADXCQAhnQYQANcJACGeBkAA2QkAIQMAAACqAQAgAQAApQkAME4AAKYJACADAAAAqgEAIAEAAKsBADACAACsAQAgAQAAALIBACABAAAAsgEAIAMAAACwAQAgAQAAsQEAMAIAALIBACADAAAAsAEAIAEAALEBADACAACyAQAgAwAAALABACABAACxAQAwAgAAsgEAIAo2AAC8CwAg-AUBAAAAAfkFAQAAAAH9BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGOBkAAAAABAUIAAK4JACAJ-AUBAAAAAfkFAQAAAAH9BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGOBkAAAAABAUIAALAJADABQgAAsAkAMAo2AAC7CwAg-AUBALALACH5BQEAsAsAIf0FAQCyCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIY4GQACzCwAhAgAAALIBACBCAACzCQAgCfgFAQCwCwAh-QUBALALACH9BQEAsgsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGOBkAAswsAIQIAAACwAQAgQgAAtQkAIAIAAACwAQAgQgAAtQkAIAMAAACyAQAgSQAArgkAIEoAALMJACABAAAAsgEAIAEAAACwAQAgCAUAALYLACBPAAC5CwAgUAAAuAsAIKEBAAC3CwAgogEAALoLACD9BQAAqgsAIIAGAACqCwAggQYAAKoLACAM9QUAAOQJADD2BQAAvAkAEPcFAADkCQAw-AUBANYJACH5BQEA1gkAIf0FAQDYCQAh_gUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGNBhAA1wkAIY4GQADZCQAhAwAAALABACABAAC7CQAwTgAAvAkAIAMAAACwAQAgAQAAsQEAMAIAALIBACABAAAAtgEAIAEAAAC2AQAgAwAAALQBACABAAC1AQAwAgAAtgEAIAMAAAC0AQAgAQAAtQEAMAIAALYBACADAAAAtAEAIAEAALUBADACAAC2AQAgDBIBAAAAATYAALULACD4BQEAAAAB-QUBAAAAAfoFEAAAAAH7BQEAAAAB_AVAAAAAAf0FAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABAUIAAMQJACALEgEAAAAB-AUBAAAAAfkFAQAAAAH6BRAAAAAB-wUBAAAAAfwFQAAAAAH9BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAQFCAADGCQAwAUIAAMYJADAMEgEAsAsAITYAALQLACD4BQEAsAsAIfkFAQCwCwAh-gUQALELACH7BQEAsgsAIfwFQACzCwAh_QUBALILACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIQIAAAC2AQAgQgAAyQkAIAsSAQCwCwAh-AUBALALACH5BQEAsAsAIfoFEACxCwAh-wUBALILACH8BUAAswsAIf0FAQCyCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACECAAAAtAEAIEIAAMsJACACAAAAtAEAIEIAAMsJACADAAAAtgEAIEkAAMQJACBKAADJCQAgAQAAALYBACABAAAAtAEAIAkFAACrCwAgTwAArgsAIFAAAK0LACChAQAArAsAIKIBAACvCwAg-wUAAKoLACD9BQAAqgsAIIAGAACqCwAggQYAAKoLACAOEgEA1gkAIfUFAADVCQAw9gUAANIJABD3BQAA1QkAMPgFAQDWCQAh-QUBANYJACH6BRAA1wkAIfsFAQDYCQAh_AVAANkJACH9BQEA2AkAIf4FAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhAwAAALQBACABAADRCQAwTgAA0gkAIAMAAAC0AQAgAQAAtQEAMAIAALYBACAOEgEA1gkAIfUFAADVCQAw9gUAANIJABD3BQAA1QkAMPgFAQDWCQAh-QUBANYJACH6BRAA1wkAIfsFAQDYCQAh_AVAANkJACH9BQEA2AkAIf4FAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhDgUAANsJACBPAADjCQAgUAAA4wkAIIIGAQAAAAGDBgEAAAAEhAYBAAAABIUGAQAAAAGGBgEAAAABhwYBAAAAAYgGAQAAAAGJBgEA4gkAIYoGAQAAAAGLBgEAAAABjAYBAAAAAQ0FAADbCQAgTwAA4QkAIFAAAOEJACChAQAA4QkAIKIBAADhCQAgggYQAAAAAYMGEAAAAASEBhAAAAAEhQYQAAAAAYYGEAAAAAGHBhAAAAABiAYQAAAAAYkGEADgCQAhDgUAAN4JACBPAADfCQAgUAAA3wkAIIIGAQAAAAGDBgEAAAAFhAYBAAAABYUGAQAAAAGGBgEAAAABhwYBAAAAAYgGAQAAAAGJBgEA3QkAIYoGAQAAAAGLBgEAAAABjAYBAAAAAQsFAADbCQAgTwAA3AkAIFAAANwJACCCBkAAAAABgwZAAAAABIQGQAAAAASFBkAAAAABhgZAAAAAAYcGQAAAAAGIBkAAAAABiQZAANoJACELBQAA2wkAIE8AANwJACBQAADcCQAgggZAAAAAAYMGQAAAAASEBkAAAAAEhQZAAAAAAYYGQAAAAAGHBkAAAAABiAZAAAAAAYkGQADaCQAhCIIGAgAAAAGDBgIAAAAEhAYCAAAABIUGAgAAAAGGBgIAAAABhwYCAAAAAYgGAgAAAAGJBgIA2wkAIQiCBkAAAAABgwZAAAAABIQGQAAAAASFBkAAAAABhgZAAAAAAYcGQAAAAAGIBkAAAAABiQZAANwJACEOBQAA3gkAIE8AAN8JACBQAADfCQAgggYBAAAAAYMGAQAAAAWEBgEAAAAFhQYBAAAAAYYGAQAAAAGHBgEAAAABiAYBAAAAAYkGAQDdCQAhigYBAAAAAYsGAQAAAAGMBgEAAAABCIIGAgAAAAGDBgIAAAAFhAYCAAAABYUGAgAAAAGGBgIAAAABhwYCAAAAAYgGAgAAAAGJBgIA3gkAIQuCBgEAAAABgwYBAAAABYQGAQAAAAWFBgEAAAABhgYBAAAAAYcGAQAAAAGIBgEAAAABiQYBAN8JACGKBgEAAAABiwYBAAAAAYwGAQAAAAENBQAA2wkAIE8AAOEJACBQAADhCQAgoQEAAOEJACCiAQAA4QkAIIIGEAAAAAGDBhAAAAAEhAYQAAAABIUGEAAAAAGGBhAAAAABhwYQAAAAAYgGEAAAAAGJBhAA4AkAIQiCBhAAAAABgwYQAAAABIQGEAAAAASFBhAAAAABhgYQAAAAAYcGEAAAAAGIBhAAAAABiQYQAOEJACEOBQAA2wkAIE8AAOMJACBQAADjCQAgggYBAAAAAYMGAQAAAASEBgEAAAAEhQYBAAAAAYYGAQAAAAGHBgEAAAABiAYBAAAAAYkGAQDiCQAhigYBAAAAAYsGAQAAAAGMBgEAAAABC4IGAQAAAAGDBgEAAAAEhAYBAAAABIUGAQAAAAGGBgEAAAABhwYBAAAAAYgGAQAAAAGJBgEA4wkAIYoGAQAAAAGLBgEAAAABjAYBAAAAAQz1BQAA5AkAMPYFAAC8CQAQ9wUAAOQJADD4BQEA1gkAIfkFAQDWCQAh_QUBANgJACH-BQEA1gkAIf8FQADZCQAhgAYBANgJACGBBgEA2AkAIY0GEADXCQAhjgZAANkJACEU9QUAAOUJADD2BQAApgkAEPcFAADlCQAw-AUBANYJACH_BUAA2QkAIY8GAQDWCQAhkAYBANYJACGRBgEA2AkAIZIGAQDYCQAhkwYBANgJACGUBgEA2AkAIZUGEADmCQAhlgYQAOYJACGXBhAA5gkAIZkGAADnCZkGIpoGQADoCQAhmwZAAOgJACGcBhAA1wkAIZ0GEADXCQAhngZAANkJACENBQAA3gkAIE8AAO4JACBQAADuCQAgoQEAAO4JACCiAQAA7gkAIIIGEAAAAAGDBhAAAAAFhAYQAAAABYUGEAAAAAGGBhAAAAABhwYQAAAAAYgGEAAAAAGJBhAA7QkAIQcFAADbCQAgTwAA7AkAIFAAAOwJACCCBgAAAJkGAoMGAAAAmQYIhAYAAACZBgiJBgAA6wmZBiILBQAA3gkAIE8AAOoJACBQAADqCQAgggZAAAAAAYMGQAAAAAWEBkAAAAAFhQZAAAAAAYYGQAAAAAGHBkAAAAABiAZAAAAAAYkGQADpCQAhCwUAAN4JACBPAADqCQAgUAAA6gkAIIIGQAAAAAGDBkAAAAAFhAZAAAAABYUGQAAAAAGGBkAAAAABhwZAAAAAAYgGQAAAAAGJBkAA6QkAIQiCBkAAAAABgwZAAAAABYQGQAAAAAWFBkAAAAABhgZAAAAAAYcGQAAAAAGIBkAAAAABiQZAAOoJACEHBQAA2wkAIE8AAOwJACBQAADsCQAgggYAAACZBgKDBgAAAJkGCIQGAAAAmQYIiQYAAOsJmQYiBIIGAAAAmQYCgwYAAACZBgiEBgAAAJkGCIkGAADsCZkGIg0FAADeCQAgTwAA7gkAIFAAAO4JACChAQAA7gkAIKIBAADuCQAgggYQAAAAAYMGEAAAAAWEBhAAAAAFhQYQAAAAAYYGEAAAAAGHBhAAAAABiAYQAAAAAYkGEADtCQAhCIIGEAAAAAGDBhAAAAAFhAYQAAAABYUGEAAAAAGGBhAAAAABhwYQAAAAAYgGEAAAAAGJBhAA7gkAIQv1BQAA7wkAMPYFAACQCQAQ9wUAAO8JADD4BQEA1gkAIZ8GAQDWCQAhoAYBANgJACGhBgEA2AkAIaIGAQDYCQAhowYBANgJACGkBgAA8AkAIKUGQADoCQAhBIIGAQAAAAWmBgEAAAABpwYBAAAABKgGAQAAAAQMNAAA9QkAIPUFAADxCQAw9gUAAP0IABD3BQAA8QkAMPgFAQDyCQAhnwYBAPIJACGgBgEA8wkAIaEGAQDzCQAhogYBAPMJACGjBgEA8wkAIaQGAADwCQAgpQZAAPQJACELggYBAAAAAYMGAQAAAASEBgEAAAAEhQYBAAAAAYYGAQAAAAGHBgEAAAABiAYBAAAAAYkGAQDjCQAhigYBAAAAAYsGAQAAAAGMBgEAAAABC4IGAQAAAAGDBgEAAAAFhAYBAAAABYUGAQAAAAGGBgEAAAABhwYBAAAAAYgGAQAAAAGJBgEA3wkAIYoGAQAAAAGLBgEAAAABjAYBAAAAAQiCBkAAAAABgwZAAAAABYQGQAAAAAWFBkAAAAABhgZAAAAAAYcGQAAAAAGIBkAAAAABiQZAAOoJACEDqQYAAKoBACCqBgAAqgEAIKsGAACqAQAgDPUFAAD2CQAw9gUAAPcIABD3BQAA9gkAMPgFAQDWCQAh_wVAANkJACGQBgEA2AkAIZ4GQADZCQAhrAYBANYJACGtBgEA1gkAIa4GAADwCQAgrwYgAPcJACGwBkAA6AkAIQUFAADbCQAgTwAA-QkAIFAAAPkJACCCBiAAAAABiQYgAPgJACEFBQAA2wkAIE8AAPkJACBQAAD5CQAgggYgAAAAAYkGIAD4CQAhAoIGIAAAAAGJBiAA-QkAIQz1BQAA-gkAMPYFAADkCAAQ9wUAAPoJADD4BQEA8gkAIf8FQAD8CQAhkAYBAPMJACGeBkAA_AkAIawGAQDyCQAhrQYBAPIJACGuBgAA8AkAIK8GIAD7CQAhsAZAAPQJACECggYgAAAAAYkGIAD5CQAhCIIGQAAAAAGDBkAAAAAEhAZAAAAABIUGQAAAAAGGBkAAAAABhwZAAAAAAYgGQAAAAAGJBkAA3AkAIQf1BQAA_QkAMPYFAADeCAAQ9wUAAP0JADD4BQEA1gkAIa4GAADwCQAgrwYgAPcJACGxBgEA1gkAIQf1BQAA_gkAMPYFAADLCAAQ9wUAAP4JADD4BQEA8gkAIa4GAADwCQAgrwYgAPsJACGxBgEA8gkAIQv1BQAA_wkAMPYFAADFCAAQ9wUAAP8JADD4BQEA1gkAIf8FQADZCQAhmQYBANYJACGxBgEA1gkAIbIGAQDWCQAhswYCAIAKACG0BgEA2AkAIbUGQADoCQAhDQUAANsJACBPAADbCQAgUAAA2wkAIKEBAACCCgAgogEAANsJACCCBgIAAAABgwYCAAAABIQGAgAAAASFBgIAAAABhgYCAAAAAYcGAgAAAAGIBgIAAAABiQYCAIEKACENBQAA2wkAIE8AANsJACBQAADbCQAgoQEAAIIKACCiAQAA2wkAIIIGAgAAAAGDBgIAAAAEhAYCAAAABIUGAgAAAAGGBgIAAAABhwYCAAAAAYgGAgAAAAGJBgIAgQoAIQiCBggAAAABgwYIAAAABIQGCAAAAASFBggAAAABhgYIAAAAAYcGCAAAAAGIBggAAAABiQYIAIIKACEJ9QUAAIMKADD2BQAArwgAEPcFAACDCgAw-AUBANYJACGQBgEA1gkAIbYGAQDWCQAhtwZAANkJACG4BgAAhAoAILkGQADZCQAhDwUAANsJACBPAACFCgAgUAAAhQoAIIIGgAAAAAGFBoAAAAABhgaAAAAAAYcGgAAAAAGIBoAAAAABiQaAAAAAAboGAQAAAAG7BgEAAAABvAYBAAAAAb0GgAAAAAG-BoAAAAABvwaAAAAAAQyCBoAAAAABhQaAAAAAAYYGgAAAAAGHBoAAAAABiAaAAAAAAYkGgAAAAAG6BgEAAAABuwYBAAAAAbwGAQAAAAG9BoAAAAABvgaAAAAAAb8GgAAAAAEO9QUAAIYKADD2BQAAmQgAEPcFAACGCgAw-AUBANYJACH_BUAA2QkAIZ4GQADZCQAhwAYBANYJACHBBgEA2AkAIcIGAQDWCQAhwwYBANYJACHEBgEA1gkAIcUGAQDYCQAhxgYBANgJACHHBgEA2AkAIQ71BQAAhwoAMPYFAACGCAAQ9wUAAIcKADD4BQEA8gkAIf8FQAD8CQAhngZAAPwJACHABgEA8gkAIcEGAQDzCQAhwgYBAPIJACHDBgEA8gkAIcQGAQDyCQAhxQYBAPMJACHGBgEA8wkAIccGAQDzCQAhGPUFAACICgAw9gUAAIAIABD3BQAAiAoAMPgFAQDWCQAh_gUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIcgGAQDWCQAhyQYBANgJACHKBgEA1gkAIcsGAQDYCQAhzAYBANgJACHNBgEA2AkAIc4GAQDYCQAhzwYCAIAKACHQBhAA1wkAIdEGEADXCQAh0gYQANcJACHTBgEA2AkAIdQGAQDYCQAh1QYBANgJACHWBkAA2QkAIRH1BQAAiQoAMPYFAADkBwAQ9wUAAIkKADD4BQEA1gkAIfoFEADXCQAh-wUBANgJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIZIGAQDYCQAhtgYBANgJACHXBgEA1gkAIdgGAQDYCQAh2QYBANgJACHaBkAA2QkAIdsGAQDYCQAhBvUFAACKCgAw9gUAAMoHABD3BQAAigoAMPgFAQDWCQAhnwYBANYJACHcBiAA9wkAIQcZAACMCgAg9QUAAIsKADD2BQAAtwcAEPcFAACLCgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhA6kGAABZACCqBgAAWQAgqwYAAFkAIAv1BQAAjQoAMPYFAACxBwAQ9wUAAI0KADD4BQEA1gkAIZ8GAQDWCQAhoAYBANgJACGhBgEA2AkAIaIGAQDYCQAhowYBANgJACGlBkAA6AkAId0GAADwCQAgDg0AAI8KACAQAACQCgAgFgAAkQoAIPUFAACOCgAw9gUAACoAEPcFAACOCgAw-AUBAPIJACGfBgEA8gkAIaAGAQDzCQAhoQYBAPMJACGiBgEA8wkAIaMGAQDzCQAhpQZAAPQJACHdBgAA8AkAIAOpBgAAHAAgqgYAABwAIKsGAAAcACADqQYAACEAIKoGAAAhACCrBgAAIQAgA6kGAAAmACCqBgAAJgAgqwYAACYAIAj1BQAAkgoAMPYFAACZBwAQ9wUAAJIKADD4BQEA1gkAIf8FQADZCQAhtgYBANYJACHeBgEA1gkAId8GAQDWCQAhEfUFAACTCgAw9gUAAIMHABD3BQAAkwoAMPgFAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhkAYBANYJACG3BkAA2QkAIdUGAQDYCQAh4AYBANYJACHhBgEA2AkAIeIGAQDYCQAh4wYBANgJACHkBgEA2AkAIeUGAQDYCQAh5gYAAIQKACAS9QUAAJQKADD2BQAA7QYAEPcFAACUCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA1gkAIbUGQADZCQAhtgYBANgJACHLBgEA1gkAIdIGEADXCQAh2wYBANgJACHnBhAA1wkAIegGAQDWCQAh6QYQANcJACHqBgEA2AkAIesGAQDYCQAhD_UFAACVCgAw9gUAANUGABD3BQAAlQoAMPgFAQDWCQAh_AVAAOgJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGZBgEA1gkAIewGAQDWCQAh7QYQANcJACHuBhAA1wkAIe8GEADXCQAh8AYQANcJACHxBgEA2AkAIQz1BQAAlgoAMPYFAAC_BgAQ9wUAAJYKADD4BQEA1gkAIfoFEADXCQAh_QUBANgJACH_BUAA2QkAIYAGAQDYCQAh8gYBANYJACHzBgEA2AkAIfQGQADZCQAh9QYBANgJACEM9QUAAJcKADD2BQAApwYAEPcFAACXCgAw-AUBANYJACH6BRAA1wkAIfsFAQDYCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAh7AYBANYJACH1BgEA2AkAIfYGQADZCQAhDPUFAACYCgAw9gUAAJEGABD3BQAAmAoAMPgFAQDWCQAh_wVAANkJACGOBkAA2QkAIZAGAQDWCQAhtgYBANgJACHsBgEA1gkAIfcGIAD3CQAh-AYQAOYJACH5BhAA5gkAIQr1BQAAmQoAMPYFAAD5BQAQ9wUAAJkKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACH6BgEA2AkAIfsGAQDYCQAh_AYBANYJACH9BhAA1wkAIQb1BQAAmgoAMPYFAADjBQAQ9wUAAJoKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEHJAAAnAoAIPUFAACbCgAw9gUAANAFABD3BQAAmwoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIQOpBgAAgQEAIKoGAACBAQAgqwYAAIEBACAK9QUAAJ0KADD2BQAAygUAEPcFAACdCgAw-AUBANYJACH_BUAA2QkAIc0GAQDWCQAh1QYBANgJACH-BgEA1gkAIf8GEADmCQAhgAdAANkJACEL9QUAAJ4KADD2BQAAtAUAEPcFAACeCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA2AkAIc0GAQDWCQAhggcAAJ8KggcigwdAANkJACEHBQAA2wkAIE8AAKEKACBQAAChCgAgggYAAACCBwKDBgAAAIIHCIQGAAAAggcIiQYAAKAKggciBwUAANsJACBPAAChCgAgUAAAoQoAIIIGAAAAggcCgwYAAACCBwiEBgAAAIIHCIkGAACgCoIHIgSCBgAAAIIHAoMGAAAAggcIhAYAAACCBwiJBgAAoQqCByIL9QUAAKIKADD2BQAAnAUAEPcFAACiCgAw-AUBANYJACHKBgEA2AkAIYQHAQDWCQAhhQcBANYJACGGBwEA2AkAIYcHAACfCoIHIogHAQDYCQAhiQcAAIQKACAK9QUAAKMKADD2BQAAhAUAEPcFAACjCgAw-AUBANYJACH_BUAA2QkAIcwGAQDWCQAh1QYBANgJACH-BgEA1gkAIf8GEADmCQAhgAdAANkJACEL9QUAAKQKADD2BQAA7gQAEPcFAACkCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGQBgEA2AkAIcwGAQDWCQAhggcAAJ8KggcigwdAANkJACEN9QUAAKUKADD2BQAA1gQAEPcFAAClCgAw-AUBANYJACGfBgEA1gkAIcoGAQDYCQAhhQcBANYJACGHBwAAnwqCByKIBwEA2AkAIYkHAACECgAgigcBANYJACGLBwEA2AkAIYwHAQDYCQAhBvUFAACmCgAw9gUAAL4EABD3BQAApgoAMPgFAQDWCQAhnwYBANYJACHcBiAA9wkAIQcXAACoCgAg9QUAAKcKADD2BQAAqwQAEPcFAACnCgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhA6kGAABBACCqBgAAQQAgqwYAAEEAIAb1BQAAqQoAMPYFAAClBAAQ9wUAAKkKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEHEQAAqwoAIPUFAACqCgAw9gUAAJIEABD3BQAAqgoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIQOpBgAALAAgqgYAACwAIKsGAAAsACAN9QUAAKwKADD2BQAAjAQAEPcFAACsCgAw-AUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGNBhAA1wkAIZAGAQDWCQAh1QYBANgJACH-BgAArQqPByKNBwEA1gkAIY8HQADZCQAhBwUAANsJACBPAACvCgAgUAAArwoAIIIGAAAAjwcCgwYAAACPBwiEBgAAAI8HCIkGAACuCo8HIgcFAADbCQAgTwAArwoAIFAAAK8KACCCBgAAAI8HAoMGAAAAjwcIhAYAAACPBwiJBgAArgqPByIEggYAAACPBwKDBgAAAI8HCIQGAAAAjwcIiQYAAK8KjwciEPUFAACwCgAw9gUAAPYDABD3BQAAsAoAMPgFAQDWCQAh_gUBANYJACH_BUAA2QkAIYAGAQDYCQAhgQYBANgJACGNBhAA1wkAIZAGAQDWCQAhtgYBANgJACHVBgEA2AkAIdsGAQDYCQAhjQcBANYJACGQBwEA2AkAIZEHQADZCQAhEfUFAACxCgAw9gUAAN4DABD3BQAAsQoAMPgFAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhzgYBANgJACHVBgEA2AkAIf4GAACyCpMHIoMHQADZCQAhjQcBANYJACGTBwEA2AkAIZQHAQDWCQAhlQcQANcJACGWBxAA5gkAIZcHAQDYCQAhBwUAANsJACBPAAC0CgAgUAAAtAoAIIIGAAAAkwcCgwYAAACTBwiEBgAAAJMHCIkGAACzCpMHIgcFAADbCQAgTwAAtAoAIFAAALQKACCCBgAAAJMHAoMGAAAAkwcIhAYAAACTBwiJBgAAswqTByIEggYAAACTBwKDBgAAAJMHCIQGAAAAkwcIiQYAALQKkwciFvUFAAC1CgAw9gUAAMYDABD3BQAAtQoAMPgFAQDWCQAh_wVAANkJACGABgEA2AkAIYEGAQDYCQAhjQYQANcJACGQBgEA2AkAIZUGEADmCQAhywYBANYJACHOBgEA2AkAIdIGEADmCQAh1AYBANgJACHVBgEA2AkAIeoGAQDYCQAh6wYBANgJACGNBwEA1gkAIZkHAAC2CpkHIpoHAQDYCQAhmwcBANgJACGcB0AA2QkAIQcFAADbCQAgTwAAuAoAIFAAALgKACCCBgAAAJkHAoMGAAAAmQcIhAYAAACZBwiJBgAAtwqZByIHBQAA2wkAIE8AALgKACBQAAC4CgAgggYAAACZBwKDBgAAAJkHCIQGAAAAmQcIiQYAALcKmQciBIIGAAAAmQcCgwYAAACZBwiEBgAAAJkHCIkGAAC4CpkHIgf1BQAAuQoAMPYFAACuAwAQ9wUAALkKADCNBhAA1wkAIZAGAQDWCQAhngZAANkJACGNBwEA1gkAIQb1BQAAugoAMPYFAACYAwAQ9wUAALoKADCNBhAA1wkAIZ4GQADZCQAhjQcBANYJACEG9QUAALsKADD2BQAAggMAEPcFAAC7CgAw-AUBANYJACGdBwEA1gkAIZ4HAQDWCQAhCvUFAAC8CgAw9gUAAOwCABD3BQAAvAoAMPgFAQDWCQAhnwYBANYJACHXBgEA1gkAIdwGIAD3CQAhiQcAAIQKACCfBwEA1gkAIaAHEADmCQAhBvUFAAC9CgAw9gUAANYCABD3BQAAvQoAMPgFAQDWCQAhnwYBANYJACHcBiAA9wkAIQcEAAC_CgAg9QUAAL4KADD2BQAAwwIAEPcFAAC-CgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhA6kGAAALACCqBgAACwAgqwYAAAsAIAb1BQAAwAoAMPYFAAC9AgAQ9wUAAMAKADD4BQEA1gkAIZ8GAQDWCQAh3AYgAPcJACEHBAAAvwoAIPUFAADBCgAw9gUAAKoCABD3BQAAwQoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIQz1BQAAwgoAMPYFAACkAgAQ9wUAAMIKADD4BQEA1gkAIf8FQADZCQAhkgYBANgJACGZBgAAwwqjByKeBkAA2QkAIZ8GAQDWCQAhpQZAAOgJACGhBwEA1gkAIaMHAQDYCQAhBwUAANsJACBPAADFCgAgUAAAxQoAIIIGAAAAowcCgwYAAACjBwiEBgAAAKMHCIkGAADECqMHIgcFAADbCQAgTwAAxQoAIFAAAMUKACCCBgAAAKMHAoMGAAAAowcIhAYAAACjBwiJBgAAxAqjByIEggYAAACjBwKDBgAAAKMHCIQGAAAAowcIiQYAAMUKowciHQwAAMgKACANAACPCgAgEAAAkAoAIBYAAJEKACAZAACMCgAgHgAAygoAIB8AAMsKACAgAADJCgAgIQAAyQoAICIAAMwKACAjAADNCgAgJgAAzgoAIC4AAM8KACAvAACrCgAgMAAAqAoAIDMAANAKACA0AAD1CQAg9QUAAMYKADD2BQAAMgAQ9wUAAMYKADD4BQEA8gkAIf8FQAD8CQAhkgYBAPMJACGZBgAAxwqjByKeBkAA_AkAIZ8GAQDyCQAhpQZAAPQJACGhBwEA8gkAIaMHAQDzCQAhBIIGAAAAowcCgwYAAACjBwiEBgAAAKMHCIkGAADFCqMHIgOpBgAABwAgqgYAAAcAIKsGAAAHACADqQYAAGIAIKoGAABiACCrBgAAYgAgA6kGAABnACCqBgAAZwAgqwYAAGcAIAOpBgAAbAAgqgYAAGwAIKsGAABsACADqQYAADQAIKoGAAA0ACCrBgAANAAgA6kGAABIACCqBgAASAAgqwYAAEgAIAOpBgAAfQAgqgYAAH0AIKsGAAB9ACADqQYAAAMAIKoGAAADACCrBgAAAwAgA6kGAACgAQAgqgYAAKABACCrBgAAoAEAIAz1BQAA0QoAMPYFAACMAgAQ9wUAANEKADD4BQEA1gkAIZAGAQDYCQAhpAdAANkJACGlBwEA1gkAIaYHAQDWCQAhpwcBANYJACGoBwEA1gkAIakHAQDYCQAhqgcBANgJACEK9QUAANIKADD2BQAA9gEAEPcFAADSCgAw-AUBANYJACH_BUAA2QkAIZ4GQADZCQAhnwYBANYJACGiBgEA1gkAIasHAQDWCQAhrQcAANMKrQciBwUAANsJACBPAADVCgAgUAAA1QoAIIIGAAAArQcCgwYAAACtBwiEBgAAAK0HCIkGAADUCq0HIgcFAADbCQAgTwAA1QoAIFAAANUKACCCBgAAAK0HAoMGAAAArQcIhAYAAACtBwiJBgAA1AqtByIEggYAAACtBwKDBgAAAK0HCIQGAAAArQcIiQYAANUKrQciDS4AAM8KACA6AADYCgAgPAAA2QoAIPUFAADWCgAw9gUAAOMBABD3BQAA1goAMPgFAQDyCQAh_wVAAPwJACGeBkAA_AkAIZ8GAQDyCQAhogYBAPIJACGrBwEA8gkAIa0HAADXCq0HIgSCBgAAAK0HAoMGAAAArQcIhAYAAACtBwiJBgAA1QqtByIDqQYAAM0BACCqBgAAzQEAIKsGAADNAQAgA6kGAADbAQAgqgYAANsBACCrBgAA2wEAIA07AADbCgAg9QUAANoKADD2BQAA2wEAEPcFAADaCgAw-AUBAPIJACGQBgEA8wkAIaQHQAD8CQAhpQcBAPIJACGmBwEA8gkAIacHAQDyCQAhqAcBAPIJACGpBwEA8wkAIaoHAQDzCQAhDy4AAM8KACA6AADYCgAgPAAA2QoAIPUFAADWCgAw9gUAAOMBABD3BQAA1goAMPgFAQDyCQAh_wVAAPwJACGeBkAA_AkAIZ8GAQDyCQAhogYBAPIJACGrBwEA8gkAIa0HAADXCq0HIrMHAADjAQAgtAcAAOMBACAKDwAA3QoAIDkAANsKACD1BQAA3AoAMPYFAADNAQAQ9wUAANwKADD4BQEA8gkAIf8FQAD8CQAhtgYBAPIJACHeBgEA8gkAId8GAQDyCQAhGwMAAOYKACAQAACQCgAgGQAAjAoAIB4AAMoKACAmAADOCgAgMwAA0AoAIDgAANsKACA6AADYCgAg9QUAAKkLADD2BQAAAwAQ9wUAAKkLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgswcAAAMAILQHAAADACAPEgEA8gkAITYAAOAKACD1BQAA3goAMPYFAAC0AQAQ9wUAAN4KADD4BQEA8gkAIfkFAQDyCQAh-gUQAN8KACH7BQEA8wkAIfwFQAD8CQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIQiCBhAAAAABgwYQAAAABIQGEAAAAASFBhAAAAABhgYQAAAAAYcGEAAAAAGIBhAAAAABiQYQAOEJACEaAwAA5goAIC0AAOgKACA1AADlCgAgNwAA5woAIPUFAADiCgAw9gUAAKoBABD3BQAA4goAMPgFAQDyCQAh_wVAAPwJACGPBgEA8gkAIZAGAQDyCQAhkQYBAPMJACGSBgEA8wkAIZMGAQDzCQAhlAYBAPMJACGVBhAA4woAIZYGEADjCgAhlwYQAOMKACGZBgAA5AqZBiKaBkAA9AkAIZsGQAD0CQAhnAYQAN8KACGdBhAA3woAIZ4GQAD8CQAhswcAAKoBACC0BwAAqgEAIA02AADgCgAg9QUAAOEKADD2BQAAsAEAEPcFAADhCgAw-AUBAPIJACH5BQEA8gkAIf0FAQDzCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIY4GQAD8CQAhGAMAAOYKACAtAADoCgAgNQAA5QoAIDcAAOcKACD1BQAA4goAMPYFAACqAQAQ9wUAAOIKADD4BQEA8gkAIf8FQAD8CQAhjwYBAPIJACGQBgEA8gkAIZEGAQDzCQAhkgYBAPMJACGTBgEA8wkAIZQGAQDzCQAhlQYQAOMKACGWBhAA4woAIZcGEADjCgAhmQYAAOQKmQYimgZAAPQJACGbBkAA9AkAIZwGEADfCgAhnQYQAN8KACGeBkAA_AkAIQiCBhAAAAABgwYQAAAABYQGEAAAAAWFBhAAAAABhgYQAAAAAYcGEAAAAAGIBhAAAAABiQYQAO4JACEEggYAAACZBgKDBgAAAJkGCIQGAAAAmQYIiQYAAOwJmQYiDjQAAPUJACD1BQAA8QkAMPYFAAD9CAAQ9wUAAPEJADD4BQEA8gkAIZ8GAQDyCQAhoAYBAPMJACGhBgEA8wkAIaIGAQDzCQAhowYBAPMJACGkBgAA8AkAIKUGQAD0CQAhswcAAP0IACC0BwAA_QgAIB8MAADICgAgDQAAjwoAIBAAAJAKACAWAACRCgAgGQAAjAoAIB4AAMoKACAfAADLCgAgIAAAyQoAICEAAMkKACAiAADMCgAgIwAAzQoAICYAAM4KACAuAADPCgAgLwAAqwoAIDAAAKgKACAzAADQCgAgNAAA9QkAIPUFAADGCgAw9gUAADIAEPcFAADGCgAw-AUBAPIJACH_BUAA_AkAIZIGAQDzCQAhmQYAAMcKowcingZAAPwJACGfBgEA8gkAIaUGQAD0CQAhoQcBAPIJACGjBwEA8wkAIbMHAAAyACC0BwAAMgAgA6kGAACwAQAgqgYAALABACCrBgAAsAEAIAOpBgAAtAEAIKoGAAC0AQAgqwYAALQBACACsQYBAAAAAbIGAQAAAAEMMQAA7AoAIPUFAADqCgAw9gUAAKQBABD3BQAA6goAMPgFAQDyCQAh_wVAAPwJACGZBgEA8gkAIbEGAQDyCQAhsgYBAPIJACGzBgIA6woAIbQGAQDzCQAhtQZAAPQJACEIggYCAAAAAYMGAgAAAASEBgIAAAAEhQYCAAAAAYYGAgAAAAGHBgIAAAABiAYCAAAAAYkGAgDbCQAhDgMAAOYKACAPAADdCgAgMgAA8AoAIPUFAADuCgAw9gUAAKABABD3BQAA7goAMPgFAQDyCQAhkAYBAPIJACG2BgEA8gkAIbcGQAD8CQAhuAYAAO8KACC5BkAA_AkAIbMHAACgAQAgtAcAAKABACACkAYBAAAAAbcGQAAAAAEMAwAA5goAIA8AAN0KACAyAADwCgAg9QUAAO4KADD2BQAAoAEAEPcFAADuCgAw-AUBAPIJACGQBgEA8gkAIbYGAQDyCQAhtwZAAPwJACG4BgAA7woAILkGQAD8CQAhDIIGgAAAAAGFBoAAAAABhgaAAAAAAYcGgAAAAAGIBoAAAAABiQaAAAAAAboGAQAAAAG7BgEAAAABvAYBAAAAAb0GgAAAAAG-BoAAAAABvwaAAAAAAQOpBgAApAEAIKoGAACkAQAgqwYAAKQBACARJwAA8goAICkAAPMKACD1BQAA8QoAMPYFAACPAQAQ9wUAAPEKADD4BQEA8gkAIfwFQAD0CQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhmQYBAPIJACHsBgEA8gkAIe0GEADfCgAh7gYQAN8KACHvBhAA3woAIfAGEADfCgAh8QYBAPMJACEQJQAA-QoAICYAAM4KACAsAAD6CgAgLQAA-woAIPUFAAD4CgAw9gUAAIEBABD3BQAA-AoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhswcAAIEBACC0BwAAgQEAIAOpBgAAiwEAIKoGAACLAQAgqwYAAIsBACAOKAAA9QoAICoAAPYKACD1BQAA9AoAMPYFAACLAQAQ9wUAAPQKADD4BQEA8gkAIfoFEADfCgAh_QUBAPMJACH_BUAA_AkAIYAGAQDzCQAh8gYBAPIJACHzBgEA8wkAIfQGQAD8CQAh9QYBAPMJACEQJwAA8goAICsAAPMKACD1BQAA9woAMPYFAACHAQAQ9wUAAPcKADD4BQEA8gkAIfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACHsBgEA8gkAIfUGAQDzCQAh9gZAAPwJACGzBwAAhwEAILQHAACHAQAgEycAAPIKACApAADzCgAg9QUAAPEKADD2BQAAjwEAEPcFAADxCgAw-AUBAPIJACH8BUAA9AkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZkGAQDyCQAh7AYBAPIJACHtBhAA3woAIe4GEADfCgAh7wYQAN8KACHwBhAA3woAIfEGAQDzCQAhswcAAI8BACC0BwAAjwEAIA4nAADyCgAgKwAA8woAIPUFAAD3CgAw9gUAAIcBABD3BQAA9woAMPgFAQDyCQAh-gUQAN8KACH7BQEA8wkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIewGAQDyCQAh9QYBAPMJACH2BkAA_AkAIQ4lAAD5CgAgJgAAzgoAICwAAPoKACAtAAD7CgAg9QUAAPgKADD2BQAAgQEAEPcFAAD4CgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAh-gYBAPMJACH7BgEA8wkAIfwGAQDyCQAh_QYQAN8KACEJJAAAnAoAIPUFAACbCgAw9gUAANAFABD3BQAAmwoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIbMHAADQBQAgtAcAANAFACADqQYAAIcBACCqBgAAhwEAIKsGAACHAQAgA6kGAACPAQAgqgYAAI8BACCrBgAAjwEAIA8DAADmCgAgDwAA_QoAICcAAPIKACD1BQAA_AoAMPYFAAB9ABD3BQAA_AoAMPgFAQDyCQAh_wVAAPwJACGOBkAA_AkAIZAGAQDyCQAhtgYBAPMJACHsBgEA8gkAIfcGIAD7CQAh-AYQAOMKACH5BhAA4woAIRsDAADmCgAgEAAAkAoAIBkAAIwKACAeAADKCgAgJgAAzgoAIDMAANAKACA4AADbCgAgOgAA2AoAIPUFAACpCwAw9gUAAAMAEPcFAACpCwAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIbcGQAD8CQAh1QYBAPMJACHgBgEA8gkAIeEGAQDzCQAh4gYBAPMJACHjBgEA8wkAIeQGAQDzCQAh5QYBAPMJACHmBgAA7woAILMHAAADACC0BwAAAwAgDwMAAOYKACAKAACACwAg9QUAAP4KADD2BQAAbAAQ9wUAAP4KADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPIJACHVBgEA8wkAIf4GAAD_Co8HIo0HAQDyCQAhjwdAAPwJACEEggYAAACPBwKDBgAAAI8HCIQGAAAAjwcIiQYAAK8KjwciDwkAAKALACALAAChCwAgDAAAyAoAIA0AAI8KACAdAADJCgAgHgAAygoAIB8AAMsKACD1BQAAnwsAMPYFAAASABD3BQAAnwsAMPgFAQDyCQAhnQcBAPIJACGeBwEA8gkAIbMHAAASACC0BwAAEgAgEwMAAOYKACAKAACACwAgDwAA_QoAIPUFAACBCwAw9gUAAGcAEPcFAACBCwAw-AUBAPIJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPIJACG2BgEA8wkAIdUGAQDzCQAh2wYBAPMJACGNBwEA8gkAIZAHAQDzCQAhkQdAAPwJACEUCgAAgAsAIBsAAIQLACAcAADmCgAg9QUAAIILADD2BQAAYgAQ9wUAAIILADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIc4GAQDzCQAh1QYBAPMJACH-BgAAgwuTByKDB0AA_AkAIY0HAQDyCQAhkwcBAPMJACGUBwEA8gkAIZUHEADfCgAhlgcQAOMKACGXBwEA8wkAIQSCBgAAAJMHAoMGAAAAkwcIhAYAAACTBwiJBgAAtAqTByIfDAAAyAoAIA0AAI8KACAQAACQCgAgFgAAkQoAIBkAAIwKACAeAADKCgAgHwAAywoAICAAAMkKACAhAADJCgAgIgAAzAoAICMAAM0KACAmAADOCgAgLgAAzwoAIC8AAKsKACAwAACoCgAgMwAA0AoAIDQAAPUJACD1BQAAxgoAMPYFAAAyABD3BQAAxgoAMPgFAQDyCQAh_wVAAPwJACGSBgEA8wkAIZkGAADHCqMHIp4GQAD8CQAhnwYBAPIJACGlBkAA9AkAIaEHAQDyCQAhowcBAPMJACGzBwAAMgAgtAcAADIAIBUDAADmCgAgBgAAhgsAIA8AAP0KACAaAACHCwAg9QUAAIULADD2BQAAWQAQ9wUAAIULADD4BQEA8gkAIfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIZIGAQDzCQAhtgYBAPMJACHXBgEA8gkAIdgGAQDzCQAh2QYBAPMJACHaBkAA_AkAIdsGAQDzCQAhCRkAAIwKACD1BQAAiwoAMPYFAAC3BwAQ9wUAAIsKADD4BQEA8gkAIZ8GAQDyCQAh3AYgAPsJACGzBwAAtwcAILQHAAC3BwAgHAMAAIQLACAKAACACwAgDgAAmgsAIBkAAIwKACD1BQAAmwsAMPYFAAAcABD3BQAAmwsAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8wkAIZUGEADjCgAhywYBAPIJACHOBgEA8wkAIdIGEADjCgAh1AYBAPMJACHVBgEA8wkAIeoGAQDzCQAh6wYBAPMJACGNBwEA8gkAIZkHAACcC5kHIpoHAQDzCQAhmwcBAPMJACGcB0AA_AkAIbMHAAAcACC0BwAAHAAgCxgAAIkLACD1BQAAiAsAMPYFAABNABD3BQAAiAsAMPgFAQDyCQAh_wVAAPwJACHNBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhEhIAAI0LACATAACECwAgFAAAzQoAIBUAAI4LACAWAACRCgAg9QUAAIwLADD2BQAAQQAQ9wUAAIwLADD4BQEA8gkAIcoGAQDzCQAhhAcBAPIJACGFBwEA8gkAIYYHAQDzCQAhhwcAAIsLggciiAcBAPMJACGJBwAA7woAILMHAABBACC0BwAAQQAgDQMAAIQLACAYAACJCwAg9QUAAIoLADD2BQAASAAQ9wUAAIoLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzQYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQSCBgAAAIIHAoMGAAAAggcIhAYAAACCBwiJBgAAoQqCByIQEgAAjQsAIBMAAIQLACAUAADNCgAgFQAAjgsAIBYAAJEKACD1BQAAjAsAMPYFAABBABD3BQAAjAsAMPgFAQDyCQAhygYBAPMJACGEBwEA8gkAIYUHAQDyCQAhhgcBAPMJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgCRcAAKgKACD1BQAApwoAMPYFAACrBAAQ9wUAAKcKADD4BQEA8gkAIZ8GAQDyCQAh3AYgAPsJACGzBwAAqwQAILQHAACrBAAgA6kGAABNACCqBgAATQAgqwYAAE0AIAsRAACQCwAg9QUAAI8LADD2BQAAOQAQ9wUAAI8LADD4BQEA8gkAIf8FQAD8CQAhzAYBAPIJACHVBgEA8wkAIf4GAQDyCQAh_wYQAOMKACGAB0AA_AkAIRQSAACTCwAgEwAAhAsAIBQAAMwKACAVAACUCwAgFgAAkQoAIPUFAACSCwAw9gUAACwAEPcFAACSCwAw-AUBAPIJACGfBgEA8gkAIcoGAQDzCQAhhQcBAPIJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgigcBAPIJACGLBwEA8wkAIYwHAQDzCQAhswcAACwAILQHAAAsACANAwAAhAsAIBEAAJALACD1BQAAkQsAMPYFAAA0ABD3BQAAkQsAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPMJACHMBgEA8gkAIYIHAACLC4IHIoMHQAD8CQAhEhIAAJMLACATAACECwAgFAAAzAoAIBUAAJQLACAWAACRCgAg9QUAAJILADD2BQAALAAQ9wUAAJILADD4BQEA8gkAIZ8GAQDyCQAhygYBAPMJACGFBwEA8gkAIYcHAACLC4IHIogHAQDzCQAhiQcAAO8KACCKBwEA8gkAIYsHAQDzCQAhjAcBAPMJACEJEQAAqwoAIPUFAACqCgAw9gUAAJIEABD3BQAAqgoAMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIbMHAACSBAAgtAcAAJIEACADqQYAADkAIKoGAAA5ACCrBgAAOQAgHAMAAOYKACAOAACWCwAgEQAAlwsAIBgAAJgLACD1BQAAlQsAMPYFAAAmABD3BQAAlQsAMPgFAQDyCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIcgGAQDyCQAhyQYBAPMJACHKBgEA8gkAIcsGAQDzCQAhzAYBAPMJACHNBgEA8wkAIc4GAQDzCQAhzwYCAOsKACHQBhAA3woAIdEGEADfCgAh0gYQAN8KACHTBgEA8wkAIdQGAQDzCQAh1QYBAPMJACHWBkAA_AkAIRANAACPCgAgEAAAkAoAIBYAAJEKACD1BQAAjgoAMPYFAAAqABD3BQAAjgoAMPgFAQDyCQAhnwYBAPIJACGgBgEA8wkAIaEGAQDzCQAhogYBAPMJACGjBgEA8wkAIaUGQAD0CQAh3QYAAPAJACCzBwAAKgAgtAcAACoAIBQSAACTCwAgEwAAhAsAIBQAAMwKACAVAACUCwAgFgAAkQoAIPUFAACSCwAw9gUAACwAEPcFAACSCwAw-AUBAPIJACGfBgEA8gkAIcoGAQDzCQAhhQcBAPIJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgigcBAPIJACGLBwEA8wkAIYwHAQDzCQAhswcAACwAILQHAAAsACASEgAAjQsAIBMAAIQLACAUAADNCgAgFQAAjgsAIBYAAJEKACD1BQAAjAsAMPYFAABBABD3BQAAjAsAMPgFAQDyCQAhygYBAPMJACGEBwEA8gkAIYUHAQDyCQAhhgcBAPMJACGHBwAAiwuCByKIBwEA8wkAIYkHAADvCgAgswcAAEEAILQHAABBACAVAwAA5goAIA4AAJoLACAPAAD9CgAg9QUAAJkLADD2BQAAIQAQ9wUAAJkLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtQZAAPwJACG2BgEA8wkAIcsGAQDyCQAh0gYQAN8KACHbBgEA8wkAIecGEADfCgAh6AYBAPIJACHpBhAA3woAIeoGAQDzCQAh6wYBAPMJACEQDQAAjwoAIBAAAJAKACAWAACRCgAg9QUAAI4KADD2BQAAKgAQ9wUAAI4KADD4BQEA8gkAIZ8GAQDyCQAhoAYBAPMJACGhBgEA8wkAIaIGAQDzCQAhowYBAPMJACGlBkAA9AkAId0GAADwCQAgswcAACoAILQHAAAqACAaAwAAhAsAIAoAAIALACAOAACaCwAgGQAAjAoAIPUFAACbCwAw9gUAABwAEPcFAACbCwAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDzCQAhlQYQAOMKACHLBgEA8gkAIc4GAQDzCQAh0gYQAOMKACHUBgEA8wkAIdUGAQDzCQAh6gYBAPMJACHrBgEA8wkAIY0HAQDyCQAhmQcAAJwLmQcimgcBAPMJACGbBwEA8wkAIZwHQAD8CQAhBIIGAAAAmQcCgwYAAACZBwiEBgAAAJkHCIkGAAC4CpkHIgcKAACACwAg9QUAAJ0LADD2BQAAFwAQ9wUAAJ0LADCNBhAA3woAIZ4GQAD8CQAhjQcBAPIJACECnQcBAAAAAZ4HAQAAAAENCQAAoAsAIAsAAKELACAMAADICgAgDQAAjwoAIB0AAMkKACAeAADKCgAgHwAAywoAIPUFAACfCwAw9gUAABIAEPcFAACfCwAw-AUBAPIJACGdBwEA8gkAIZ4HAQDyCQAhDwYAAKQLACAHAAClCwAgCAAApgsAIPUFAACjCwAw9gUAAAsAEPcFAACjCwAw-AUBAPIJACGfBgEA8gkAIdcGAQDyCQAh3AYgAPsJACGJBwAA7woAIJ8HAQDyCQAhoAcQAOMKACGzBwAACwAgtAcAAAsAIAOpBgAAFwAgqgYAABcAIKsGAAAXACACnwYBAAAAAdcGAQAAAAENBgAApAsAIAcAAKULACAIAACmCwAg9QUAAKMLADD2BQAACwAQ9wUAAKMLADD4BQEA8gkAIZ8GAQDyCQAh1wYBAPIJACHcBiAA-wkAIYkHAADvCgAgnwcBAPIJACGgBxAA4woAIQkEAAC_CgAg9QUAAMEKADD2BQAAqgIAEPcFAADBCgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhswcAAKoCACC0BwAAqgIAIAkEAAC_CgAg9QUAAL4KADD2BQAAwwIAEPcFAAC-CgAw-AUBAPIJACGfBgEA8gkAIdwGIAD7CQAhswcAAMMCACC0BwAAwwIAIAOpBgAAEgAgqgYAABIAIKsGAAASACACkAYBAAAAAY0HAQAAAAEJAwAA5goAIAoAAIALACD1BQAAqAsAMPYFAAAHABD3BQAAqAsAMI0GEADfCgAhkAYBAPIJACGeBkAA_AkAIY0HAQDyCQAhGQMAAOYKACAQAACQCgAgGQAAjAoAIB4AAMoKACAmAADOCgAgMwAA0AoAIDgAANsKACA6AADYCgAg9QUAAKkLADD2BQAAAwAQ9wUAAKkLADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgAAAAAAAAAbgHAQAAAAEFuAcQAAAAAb8HEAAAAAHABxAAAAABwQcQAAAAAcIHEAAAAAEBuAcBAAAAAQG4B0AAAAABBUkAAMMWACBKAADGFgAgtQcAAMQWACC2BwAAxRYAILsHAACsAQAgA0kAAMMWACC1BwAAxBYAILsHAACsAQAgAAAAAAAFSQAAvhYAIEoAAMEWACC1BwAAvxYAILYHAADAFgAguwcAAKwBACADSQAAvhYAILUHAAC_FgAguwcAAKwBACAAAAAAAAW4BxAAAAABvwcQAAAAAcAHEAAAAAHBBxAAAAABwgcQAAAAAQG4BwAAAJkGAgG4B0AAAAABBUkAALQWACBKAAC8FgAgtQcAALUWACC2BwAAuxYAILsHAAD6CAAgBUkAALIWACBKAAC5FgAgtQcAALMWACC2BwAAuBYAILsHAACPAgAgC0kAANULADBKAADaCwAwtQcAANYLADC2BwAA1wsAMLcHAADYCwAguAcAANkLADC5BwAA2QsAMLoHAADZCwAwuwcAANkLADC8BwAA2wsAML0HAADcCwAwC0kAAMkLADBKAADOCwAwtQcAAMoLADC2BwAAywsAMLcHAADMCwAguAcAAM0LADC5BwAAzQsAMLoHAADNCwAwuwcAAM0LADC8BwAAzwsAML0HAADQCwAwChIBAAAAAfgFAQAAAAH6BRAAAAAB-wUBAAAAAfwFQAAAAAH9BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAQIAAAC2AQAgSQAA1AsAIAMAAAC2AQAgSQAA1AsAIEoAANMLACABQgAAtxYAMA8SAQDyCQAhNgAA4AoAIPUFAADeCgAw9gUAALQBABD3BQAA3goAMPgFAQAAAAH5BQEA8gkAIfoFEADfCgAh-wUBAPMJACH8BUAA_AkAIf0FAQDzCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACECAAAAtgEAIEIAANMLACACAAAA0QsAIEIAANILACAOEgEA8gkAIfUFAADQCwAw9gUAANELABD3BQAA0AsAMPgFAQDyCQAh-QUBAPIJACH6BRAA3woAIfsFAQDzCQAh_AVAAPwJACH9BQEA8wkAIf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhDhIBAPIJACH1BQAA0AsAMPYFAADRCwAQ9wUAANALADD4BQEA8gkAIfkFAQDyCQAh-gUQAN8KACH7BQEA8wkAIfwFQAD8CQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIQoSAQCwCwAh-AUBALALACH6BRAAsQsAIfsFAQCyCwAh_AVAALMLACH9BQEAsgsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhChIBALALACH4BQEAsAsAIfoFEACxCwAh-wUBALILACH8BUAAswsAIf0FAQCyCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACEKEgEAAAAB-AUBAAAAAfoFEAAAAAH7BQEAAAAB_AVAAAAAAf0FAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABCPgFAQAAAAH9BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGOBkAAAAABAgAAALIBACBJAADgCwAgAwAAALIBACBJAADgCwAgSgAA3wsAIAFCAAC2FgAwDTYAAOAKACD1BQAA4QoAMPYFAACwAQAQ9wUAAOEKADD4BQEAAAAB-QUBAPIJACH9BQEA8wkAIf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGOBkAA_AkAIQIAAACyAQAgQgAA3wsAIAIAAADdCwAgQgAA3gsAIAz1BQAA3AsAMPYFAADdCwAQ9wUAANwLADD4BQEA8gkAIfkFAQDyCQAh_QUBAPMJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhjgZAAPwJACEM9QUAANwLADD2BQAA3QsAEPcFAADcCwAw-AUBAPIJACH5BQEA8gkAIf0FAQDzCQAh_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIY4GQAD8CQAhCPgFAQCwCwAh_QUBALILACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhjgZAALMLACEI-AUBALALACH9BQEAsgsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGOBkAAswsAIQj4BQEAAAAB_QUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABjgZAAAAAAQNJAAC0FgAgtQcAALUWACC7BwAA-ggAIANJAACyFgAgtQcAALMWACC7BwAAjwIAIARJAADVCwAwtQcAANYLADC3BwAA2AsAILsHAADZCwAwBEkAAMkLADC1BwAAygsAMLcHAADMCwAguwcAAM0LADAAAAACuAcBAAAABL4HAQAAAAULSQAA6gsAMEoAAO8LADC1BwAA6wsAMLYHAADsCwAwtwcAAO0LACC4BwAA7gsAMLkHAADuCwAwugcAAO4LADC7BwAA7gsAMLwHAADwCwAwvQcAAPELADATAwAA4gsAIC0AAOQLACA3AADjCwAg-AUBAAAAAf8FQAAAAAGQBgEAAAABkQYBAAAAAZIGAQAAAAGTBgEAAAABlAYBAAAAAZUGEAAAAAGWBhAAAAABlwYQAAAAAZkGAAAAmQYCmgZAAAAAAZsGQAAAAAGcBhAAAAABnQYQAAAAAZ4GQAAAAAECAAAArAEAIEkAAPULACADAAAArAEAIEkAAPULACBKAAD0CwAgAUIAALEWADAYAwAA5goAIC0AAOgKACA1AADlCgAgNwAA5woAIPUFAADiCgAw9gUAAKoBABD3BQAA4goAMPgFAQAAAAH_BUAA_AkAIY8GAQDyCQAhkAYBAPIJACGRBgEA8wkAIZIGAQDzCQAhkwYBAPMJACGUBgEA8wkAIZUGEADjCgAhlgYQAOMKACGXBhAA4woAIZkGAADkCpkGIpoGQAD0CQAhmwZAAPQJACGcBhAA3woAIZ0GEADfCgAhngZAAPwJACECAAAArAEAIEIAAPQLACACAAAA8gsAIEIAAPMLACAU9QUAAPELADD2BQAA8gsAEPcFAADxCwAw-AUBAPIJACH_BUAA_AkAIY8GAQDyCQAhkAYBAPIJACGRBgEA8wkAIZIGAQDzCQAhkwYBAPMJACGUBgEA8wkAIZUGEADjCgAhlgYQAOMKACGXBhAA4woAIZkGAADkCpkGIpoGQAD0CQAhmwZAAPQJACGcBhAA3woAIZ0GEADfCgAhngZAAPwJACEU9QUAAPELADD2BQAA8gsAEPcFAADxCwAw-AUBAPIJACH_BUAA_AkAIY8GAQDyCQAhkAYBAPIJACGRBgEA8wkAIZIGAQDzCQAhkwYBAPMJACGUBgEA8wkAIZUGEADjCgAhlgYQAOMKACGXBhAA4woAIZkGAADkCpkGIpoGQAD0CQAhmwZAAPQJACGcBhAA3woAIZ0GEADfCgAhngZAAPwJACEQ-AUBALALACH_BUAAswsAIZAGAQCwCwAhkQYBALILACGSBgEAsgsAIZMGAQCyCwAhlAYBALILACGVBhAAwgsAIZYGEADCCwAhlwYQAMILACGZBgAAwwuZBiKaBkAAxAsAIZsGQADECwAhnAYQALELACGdBhAAsQsAIZ4GQACzCwAhEwMAAMYLACAtAADICwAgNwAAxwsAIPgFAQCwCwAh_wVAALMLACGQBgEAsAsAIZEGAQCyCwAhkgYBALILACGTBgEAsgsAIZQGAQCyCwAhlQYQAMILACGWBhAAwgsAIZcGEADCCwAhmQYAAMMLmQYimgZAAMQLACGbBkAAxAsAIZwGEACxCwAhnQYQALELACGeBkAAswsAIRMDAADiCwAgLQAA5AsAIDcAAOMLACD4BQEAAAAB_wVAAAAAAZAGAQAAAAGRBgEAAAABkgYBAAAAAZMGAQAAAAGUBgEAAAABlQYQAAAAAZYGEAAAAAGXBhAAAAABmQYAAACZBgKaBkAAAAABmwZAAAAAAZwGEAAAAAGdBhAAAAABngZAAAAAAQG4BwEAAAAEBEkAAOoLADC1BwAA6wsAMLcHAADtCwAguwcAAO4LADAAAAAAArgHAQAAAAS-BwEAAAAFAbgHIAAAAAEBuAcBAAAABAAAAAK4BwEAAAAEvgcBAAAABQG4BwEAAAAEAAAAAAAFuAcCAAAAAb8HAgAAAAHABwIAAAABwQcCAAAAAcIHAgAAAAEFSQAArBYAIEoAAK8WACC1BwAArRYAILYHAACuFgAguwcAAKIBACADSQAArBYAILUHAACtFgAguwcAAKIBACAAAAAFSQAAoxYAIEoAAKoWACC1BwAApBYAILYHAACpFgAguwcAAI8CACAFSQAAoRYAIEoAAKcWACC1BwAAohYAILYHAACmFgAguwcAAAUAIAtJAACSDAAwSgAAlwwAMLUHAACTDAAwtgcAAJQMADC3BwAAlQwAILgHAACWDAAwuQcAAJYMADC6BwAAlgwAMLsHAACWDAAwvAcAAJgMADC9BwAAmQwAMAf4BQEAAAAB_wVAAAAAAZkGAQAAAAGxBgEAAAABswYCAAAAAbQGAQAAAAG1BkAAAAABAgAAAKYBACBJAACdDAAgAwAAAKYBACBJAACdDAAgSgAAnAwAIAFCAAClFgAwDTEAAOwKACD1BQAA6goAMPYFAACkAQAQ9wUAAOoKADD4BQEAAAAB_wVAAPwJACGZBgEA8gkAIbEGAQDyCQAhsgYBAPIJACGzBgIA6woAIbQGAQDzCQAhtQZAAPQJACGuBwAA6QoAIAIAAACmAQAgQgAAnAwAIAIAAACaDAAgQgAAmwwAIAv1BQAAmQwAMPYFAACaDAAQ9wUAAJkMADD4BQEA8gkAIf8FQAD8CQAhmQYBAPIJACGxBgEA8gkAIbIGAQDyCQAhswYCAOsKACG0BgEA8wkAIbUGQAD0CQAhC_UFAACZDAAw9gUAAJoMABD3BQAAmQwAMPgFAQDyCQAh_wVAAPwJACGZBgEA8gkAIbEGAQDyCQAhsgYBAPIJACGzBgIA6woAIbQGAQDzCQAhtQZAAPQJACEH-AUBALALACH_BUAAswsAIZkGAQCwCwAhsQYBALALACGzBgIAiQwAIbQGAQCyCwAhtQZAAMQLACEH-AUBALALACH_BUAAswsAIZkGAQCwCwAhsQYBALALACGzBgIAiQwAIbQGAQCyCwAhtQZAAMQLACEH-AUBAAAAAf8FQAAAAAGZBgEAAAABsQYBAAAAAbMGAgAAAAG0BgEAAAABtQZAAAAAAQNJAACjFgAgtQcAAKQWACC7BwAAjwIAIANJAAChFgAgtQcAAKIWACC7BwAABQAgBEkAAJIMADC1BwAAkwwAMLcHAACVDAAguwcAAJYMADAAAAAAAAAAAAVJAACTFgAgSgAAnxYAILUHAACUFgAgtgcAAJ4WACC7BwAAjwIAIAdJAACRFgAgSgAAnBYAILUHAACSFgAgtgcAAJsWACC5BwAAKgAgugcAACoAILsHAACcBwAgB0kAAI8WACBKAACZFgAgtQcAAJAWACC2BwAAmBYAILkHAAAsACC6BwAALAAguwcAAC8AIAdJAACNFgAgSgAAlhYAILUHAACOFgAgtgcAAJUWACC5BwAAQQAgugcAAEEAILsHAABEACADSQAAkxYAILUHAACUFgAguwcAAI8CACADSQAAkRYAILUHAACSFgAguwcAAJwHACADSQAAjxYAILUHAACQFgAguwcAAC8AIANJAACNFgAgtQcAAI4WACC7BwAARAAgAAAAAAAFSQAA_xUAIEoAAIsWACC1BwAAgBYAILYHAACKFgAguwcAAI8CACAFSQAA_RUAIEoAAIgWACC1BwAA_hUAILYHAACHFgAguwcAALQHACAHSQAA-xUAIEoAAIUWACC1BwAA_BUAILYHAACEFgAguQcAABwAILoHAAAcACC7BwAAHgAgB0kAAPkVACBKAACCFgAgtQcAAPoVACC2BwAAgRYAILkHAAADACC6BwAAAwAguwcAAAUAIANJAAD_FQAgtQcAAIAWACC7BwAAjwIAIANJAAD9FQAgtQcAAP4VACC7BwAAtAcAIANJAAD7FQAgtQcAAPwVACC7BwAAHgAgA0kAAPkVACC1BwAA-hUAILsHAAAFACAAAAALSQAAwgwAMEoAAMcMADC1BwAAwwwAMLYHAADEDAAwtwcAAMUMACC4BwAAxgwAMLkHAADGDAAwugcAAMYMADC7BwAAxgwAMLwHAADIDAAwvQcAAMkMADAQAwAAugwAIA8AAL0MACAaAAC8DAAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAZIGAQAAAAG2BgEAAAAB2AYBAAAAAdkGAQAAAAHaBkAAAAAB2wYBAAAAAQIAAABbACBJAADNDAAgAwAAAFsAIEkAAM0MACBKAADMDAAgAUIAAPgVADAVAwAA5goAIAYAAIYLACAPAAD9CgAgGgAAhwsAIPUFAACFCwAw9gUAAFkAEPcFAACFCwAw-AUBAAAAAfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIZIGAQDzCQAhtgYBAPMJACHXBgEA8gkAIdgGAQDzCQAh2QYBAPMJACHaBkAA_AkAIdsGAQAAAAECAAAAWwAgQgAAzAwAIAIAAADKDAAgQgAAywwAIBH1BQAAyQwAMPYFAADKDAAQ9wUAAMkMADD4BQEA8gkAIfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIZIGAQDzCQAhtgYBAPMJACHXBgEA8gkAIdgGAQDzCQAh2QYBAPMJACHaBkAA_AkAIdsGAQDzCQAhEfUFAADJDAAw9gUAAMoMABD3BQAAyQwAMPgFAQDyCQAh-gUQAN8KACH7BQEA8wkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhkgYBAPMJACG2BgEA8wkAIdcGAQDyCQAh2AYBAPMJACHZBgEA8wkAIdoGQAD8CQAh2wYBAPMJACEN-AUBALALACH6BRAAsQsAIfsFAQCyCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACGSBgEAsgsAIbYGAQCyCwAh2AYBALILACHZBgEAsgsAIdoGQACzCwAh2wYBALILACEQAwAAtgwAIA8AALkMACAaAAC4DAAg-AUBALALACH6BRAAsQsAIfsFAQCyCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACGSBgEAsgsAIbYGAQCyCwAh2AYBALILACHZBgEAsgsAIdoGQACzCwAh2wYBALILACEQAwAAugwAIA8AAL0MACAaAAC8DAAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAZIGAQAAAAG2BgEAAAAB2AYBAAAAAdkGAQAAAAHaBkAAAAAB2wYBAAAAAQRJAADCDAAwtQcAAMMMADC3BwAAxQwAILsHAADGDAAwAAAAAAK4BwEAAAAEvgcBAAAABQtJAADzDAAwSgAA-AwAMLUHAAD0DAAwtgcAAPUMADC3BwAA9gwAILgHAAD3DAAwuQcAAPcMADC6BwAA9wwAMLsHAAD3DAAwvAcAAPkMADC9BwAA-gwAMAtJAADjDAAwSgAA6AwAMLUHAADkDAAwtgcAAOUMADC3BwAA5gwAILgHAADnDAAwuQcAAOcMADC6BwAA5wwAMLsHAADnDAAwvAcAAOkMADC9BwAA6gwAMAtJAADXDAAwSgAA3AwAMLUHAADYDAAwtgcAANkMADC3BwAA2gwAILgHAADbDAAwuQcAANsMADC6BwAA2wwAMLsHAADbDAAwvAcAAN0MADC9BwAA3gwAMBcDAACtDAAgEQAArwwAIBgAALAMACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHMBgEAAAABzQYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAAQIAAAAoACBJAADiDAAgAwAAACgAIEkAAOIMACBKAADhDAAgAUIAAPcVADAcAwAA5goAIA4AAJYLACARAACXCwAgGAAAmAsAIPUFAACVCwAw9gUAACYAEPcFAACVCwAw-AUBAAAAAf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPIJACHIBgEA8gkAIckGAQDzCQAhygYBAPIJACHLBgEA8wkAIcwGAQDzCQAhzQYBAPMJACHOBgEA8wkAIc8GAgDrCgAh0AYQAN8KACHRBhAA3woAIdIGEADfCgAh0wYBAPMJACHUBgEA8wkAIdUGAQDzCQAh1gZAAPwJACECAAAAKAAgQgAA4QwAIAIAAADfDAAgQgAA4AwAIBj1BQAA3gwAMPYFAADfDAAQ9wUAAN4MADD4BQEA8gkAIf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPIJACHIBgEA8gkAIckGAQDzCQAhygYBAPIJACHLBgEA8wkAIcwGAQDzCQAhzQYBAPMJACHOBgEA8wkAIc8GAgDrCgAh0AYQAN8KACHRBhAA3woAIdIGEADfCgAh0wYBAPMJACHUBgEA8wkAIdUGAQDzCQAh1gZAAPwJACEY9QUAAN4MADD2BQAA3wwAEPcFAADeDAAw-AUBAPIJACH-BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhyAYBAPIJACHJBgEA8wkAIcoGAQDyCQAhywYBAPMJACHMBgEA8wkAIc0GAQDzCQAhzgYBAPMJACHPBgIA6woAIdAGEADfCgAh0QYQAN8KACHSBhAA3woAIdMGAQDzCQAh1AYBAPMJACHVBgEA8wkAIdYGQAD8CQAhFPgFAQCwCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIcgGAQCwCwAhyQYBALILACHKBgEAsAsAIcwGAQCyCwAhzQYBALILACHOBgEAsgsAIc8GAgCJDAAh0AYQALELACHRBhAAsQsAIdIGEACxCwAh0wYBALILACHUBgEAsgsAIdUGAQCyCwAh1gZAALMLACEXAwAAqQwAIBEAAKsMACAYAACsDAAg-AUBALALACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhyAYBALALACHJBgEAsgsAIcoGAQCwCwAhzAYBALILACHNBgEAsgsAIc4GAQCyCwAhzwYCAIkMACHQBhAAsQsAIdEGEACxCwAh0gYQALELACHTBgEAsgsAIdQGAQCyCwAh1QYBALILACHWBkAAswsAIRcDAACtDAAgEQAArwwAIBgAALAMACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHMBgEAAAABzQYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAARADAADxDAAgDwAA8gwAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABtQZAAAAAAbYGAQAAAAHSBhAAAAAB2wYBAAAAAecGEAAAAAHoBgEAAAAB6QYQAAAAAeoGAQAAAAHrBgEAAAABAgAAACMAIEkAAPAMACADAAAAIwAgSQAA8AwAIEoAAO0MACABQgAA9hUAMBUDAADmCgAgDgAAmgsAIA8AAP0KACD1BQAAmQsAMPYFAAAhABD3BQAAmQsAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIbUGQAD8CQAhtgYBAPMJACHLBgEA8gkAIdIGEADfCgAh2wYBAAAAAecGEADfCgAh6AYBAPIJACHpBhAA3woAIeoGAQDzCQAh6wYBAPMJACECAAAAIwAgQgAA7QwAIAIAAADrDAAgQgAA7AwAIBL1BQAA6gwAMPYFAADrDAAQ9wUAAOoMADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtQZAAPwJACG2BgEA8wkAIcsGAQDyCQAh0gYQAN8KACHbBgEA8wkAIecGEADfCgAh6AYBAPIJACHpBhAA3woAIeoGAQDzCQAh6wYBAPMJACES9QUAAOoMADD2BQAA6wwAEPcFAADqDAAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIbUGQAD8CQAhtgYBAPMJACHLBgEA8gkAIdIGEADfCgAh2wYBAPMJACHnBhAA3woAIegGAQDyCQAh6QYQAN8KACHqBgEA8wkAIesGAQDzCQAhDvgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG1BkAAswsAIbYGAQCyCwAh0gYQALELACHbBgEAsgsAIecGEACxCwAh6AYBALALACHpBhAAsQsAIeoGAQCyCwAh6wYBALILACEQAwAA7gwAIA8AAO8MACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtQZAALMLACG2BgEAsgsAIdIGEACxCwAh2wYBALILACHnBhAAsQsAIegGAQCwCwAh6QYQALELACHqBgEAsgsAIesGAQCyCwAhBUkAAO4VACBKAAD0FQAgtQcAAO8VACC2BwAA8xUAILsHAACPAgAgB0kAAOwVACBKAADxFQAgtQcAAO0VACC2BwAA8BUAILkHAAADACC6BwAAAwAguwcAAAUAIBADAADxDAAgDwAA8gwAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABtQZAAAAAAbYGAQAAAAHSBhAAAAAB2wYBAAAAAecGEAAAAAHoBgEAAAAB6QYQAAAAAeoGAQAAAAHrBgEAAAABA0kAAO4VACC1BwAA7xUAILsHAACPAgAgA0kAAOwVACC1BwAA7RUAILsHAAAFACAVAwAAjQ0AIAoAAIwNACAZAACODQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGQBgEAAAABlQYQAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAY0HAQAAAAGZBwAAAJkHApoHAQAAAAGbBwEAAAABnAdAAAAAAQIAAAAeACBJAACLDQAgAwAAAB4AIEkAAIsNACBKAAD-DAAgAUIAAOsVADAaAwAAhAsAIAoAAIALACAOAACaCwAgGQAAjAoAIPUFAACbCwAw9gUAABwAEPcFAACbCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPMJACGVBhAA4woAIcsGAQDyCQAhzgYBAPMJACHSBhAA4woAIdQGAQDzCQAh1QYBAPMJACHqBgEA8wkAIesGAQDzCQAhjQcBAPIJACGZBwAAnAuZByKaBwEA8wkAIZsHAQDzCQAhnAdAAPwJACECAAAAHgAgQgAA_gwAIAIAAAD7DAAgQgAA_AwAIBb1BQAA-gwAMPYFAAD7DAAQ9wUAAPoMADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIY0GEADfCgAhkAYBAPMJACGVBhAA4woAIcsGAQDyCQAhzgYBAPMJACHSBhAA4woAIdQGAQDzCQAh1QYBAPMJACHqBgEA8wkAIesGAQDzCQAhjQcBAPIJACGZBwAAnAuZByKaBwEA8wkAIZsHAQDzCQAhnAdAAPwJACEW9QUAAPoMADD2BQAA-wwAEPcFAAD6DAAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDzCQAhlQYQAOMKACHLBgEA8gkAIc4GAQDzCQAh0gYQAOMKACHUBgEA8wkAIdUGAQDzCQAh6gYBAPMJACHrBgEA8wkAIY0HAQDyCQAhmQcAAJwLmQcimgcBAPMJACGbBwEA8wkAIZwHQAD8CQAhEvgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsgsAIZUGEADCCwAhzgYBALILACHSBhAAwgsAIdQGAQCyCwAh1QYBALILACHqBgEAsgsAIesGAQCyCwAhjQcBALALACGZBwAA_QyZByKaBwEAsgsAIZsHAQCyCwAhnAdAALMLACEBuAcAAACZBwIVAwAAgA0AIAoAAP8MACAZAACBDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCyCwAhlQYQAMILACHOBgEAsgsAIdIGEADCCwAh1AYBALILACHVBgEAsgsAIeoGAQCyCwAh6wYBALILACGNBwEAsAsAIZkHAAD9DJkHIpoHAQCyCwAhmwcBALILACGcB0AAswsAIQVJAADiFQAgSgAA6RUAILUHAADjFQAgtgcAAOgVACC7BwAAFAAgB0kAAOAVACBKAADmFQAgtQcAAOEVACC2BwAA5RUAILkHAAAyACC6BwAAMgAguwcAAI8CACALSQAAgg0AMEoAAIYNADC1BwAAgw0AMLYHAACEDQAwtwcAAIUNACC4BwAAxgwAMLkHAADGDAAwugcAAMYMADC7BwAAxgwAMLwHAACHDQAwvQcAAMkMADAQAwAAugwAIAYAALsMACAPAAC9DAAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAZIGAQAAAAG2BgEAAAAB1wYBAAAAAdgGAQAAAAHaBkAAAAAB2wYBAAAAAQIAAABbACBJAACKDQAgAwAAAFsAIEkAAIoNACBKAACJDQAgAUIAAOQVADACAAAAWwAgQgAAiQ0AIAIAAADKDAAgQgAAiA0AIA34BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIZIGAQCyCwAhtgYBALILACHXBgEAsAsAIdgGAQCyCwAh2gZAALMLACHbBgEAsgsAIRADAAC2DAAgBgAAtwwAIA8AALkMACD4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIZIGAQCyCwAhtgYBALILACHXBgEAsAsAIdgGAQCyCwAh2gZAALMLACHbBgEAsgsAIRADAAC6DAAgBgAAuwwAIA8AAL0MACD4BQEAAAAB-gUQAAAAAfsFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABkgYBAAAAAbYGAQAAAAHXBgEAAAAB2AYBAAAAAdoGQAAAAAHbBgEAAAABFQMAAI0NACAKAACMDQAgGQAAjg0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABkAYBAAAAAZUGEAAAAAHOBgEAAAAB0gYQAAAAAdQGAQAAAAHVBgEAAAAB6gYBAAAAAesGAQAAAAGNBwEAAAABmQcAAACZBwKaBwEAAAABmwcBAAAAAZwHQAAAAAEDSQAA4hUAILUHAADjFQAguwcAABQAIANJAADgFQAgtQcAAOEVACC7BwAAjwIAIARJAACCDQAwtQcAAIMNADC3BwAAhQ0AILsHAADGDAAwAbgHAQAAAAQESQAA8wwAMLUHAAD0DAAwtwcAAPYMACC7BwAA9wwAMARJAADjDAAwtQcAAOQMADC3BwAA5gwAILsHAADnDAAwBEkAANcMADC1BwAA2AwAMLcHAADaDAAguwcAANsMADAAAAAAAAAFSQAA2BUAIEoAAN4VACC1BwAA2RUAILYHAADdFQAguwcAAAUAIAVJAADWFQAgSgAA2xUAILUHAADXFQAgtgcAANoVACC7BwAAAQAgA0kAANgVACC1BwAA2RUAILsHAAAFACADSQAA1hUAILUHAADXFQAguwcAAAEAIAAAAAVJAACvFQAgSgAA1BUAILUHAACwFQAgtgcAANMVACC7BwAAjwIAIAVJAACtFQAgSgAA0RUAILUHAACuFQAgtgcAANAVACC7BwAAAQAgC0kAAOQNADBKAADpDQAwtQcAAOUNADC2BwAA5g0AMLcHAADnDQAguAcAAOgNADC5BwAA6A0AMLoHAADoDQAwuwcAAOgNADC8BwAA6g0AML0HAADrDQAwC0kAANQNADBKAADZDQAwtQcAANUNADC2BwAA1g0AMLcHAADXDQAguAcAANgNADC5BwAA2A0AMLoHAADYDQAwuwcAANgNADC8BwAA2g0AML0HAADbDQAwC0kAAMgNADBKAADNDQAwtQcAAMkNADC2BwAAyg0AMLcHAADLDQAguAcAAMwNADC5BwAAzA0AMLoHAADMDQAwuwcAAMwNADC8BwAAzg0AML0HAADPDQAwC0kAAL8NADBKAADDDQAwtQcAAMANADC2BwAAwQ0AMLcHAADCDQAguAcAAMYMADC5BwAAxgwAMLoHAADGDAAwuwcAAMYMADC8BwAAxA0AML0HAADJDAAwC0kAALQNADBKAAC4DQAwtQcAALUNADC2BwAAtg0AMLcHAAC3DQAguAcAAOcMADC5BwAA5wwAMLoHAADnDAAwuwcAAOcMADC8BwAAuQ0AML0HAADqDAAwC0kAAKgNADBKAACtDQAwtQcAAKkNADC2BwAAqg0AMLcHAACrDQAguAcAAKwNADC5BwAArA0AMLoHAACsDQAwuwcAAKwNADC8BwAArg0AML0HAACvDQAwBwMAAJ4MACAyAACgDAAg-AUBAAAAAZAGAQAAAAG3BkAAAAABuAaAAAAAAbkGQAAAAAECAAAAogEAIEkAALMNACADAAAAogEAIEkAALMNACBKAACyDQAgAUIAAM8VADANAwAA5goAIA8AAN0KACAyAADwCgAg9QUAAO4KADD2BQAAoAEAEPcFAADuCgAw-AUBAAAAAZAGAQDyCQAhtgYBAPIJACG3BkAA_AkAIbgGAADvCgAguQZAAPwJACGvBwAA7QoAIAIAAACiAQAgQgAAsg0AIAIAAACwDQAgQgAAsQ0AIAn1BQAArw0AMPYFAACwDQAQ9wUAAK8NADD4BQEA8gkAIZAGAQDyCQAhtgYBAPIJACG3BkAA_AkAIbgGAADvCgAguQZAAPwJACEJ9QUAAK8NADD2BQAAsA0AEPcFAACvDQAw-AUBAPIJACGQBgEA8gkAIbYGAQDyCQAhtwZAAPwJACG4BgAA7woAILkGQAD8CQAhBfgFAQCwCwAhkAYBALALACG3BkAAswsAIbgGgAAAAAG5BkAAswsAIQcDAACPDAAgMgAAkQwAIPgFAQCwCwAhkAYBALALACG3BkAAswsAIbgGgAAAAAG5BkAAswsAIQcDAACeDAAgMgAAoAwAIPgFAQAAAAGQBgEAAAABtwZAAAAAAbgGgAAAAAG5BkAAAAABEAMAAPEMACAOAAC-DQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG1BkAAAAABywYBAAAAAdIGEAAAAAHbBgEAAAAB5wYQAAAAAegGAQAAAAHpBhAAAAAB6gYBAAAAAesGAQAAAAECAAAAIwAgSQAAvQ0AIAMAAAAjACBJAAC9DQAgSgAAuw0AIAFCAADOFQAwAgAAACMAIEIAALsNACACAAAA6wwAIEIAALoNACAO-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbUGQACzCwAhywYBALALACHSBhAAsQsAIdsGAQCyCwAh5wYQALELACHoBgEAsAsAIekGEACxCwAh6gYBALILACHrBgEAsgsAIRADAADuDAAgDgAAvA0AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG1BkAAswsAIcsGAQCwCwAh0gYQALELACHbBgEAsgsAIecGEACxCwAh6AYBALALACHpBhAAsQsAIeoGAQCyCwAh6wYBALILACEFSQAAyRUAIEoAAMwVACC1BwAAyhUAILYHAADLFQAguwcAAJwHACAQAwAA8QwAIA4AAL4NACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAbUGQAAAAAHLBgEAAAAB0gYQAAAAAdsGAQAAAAHnBhAAAAAB6AYBAAAAAekGEAAAAAHqBgEAAAAB6wYBAAAAAQNJAADJFQAgtQcAAMoVACC7BwAAnAcAIBADAAC6DAAgBgAAuwwAIBoAALwMACD4BQEAAAAB-gUQAAAAAfsFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABkgYBAAAAAdcGAQAAAAHYBgEAAAAB2QYBAAAAAdoGQAAAAAHbBgEAAAABAgAAAFsAIEkAAMcNACADAAAAWwAgSQAAxw0AIEoAAMYNACABQgAAyBUAMAIAAABbACBCAADGDQAgAgAAAMoMACBCAADFDQAgDfgFAQCwCwAh-gUQALELACH7BQEAsgsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhkgYBALILACHXBgEAsAsAIdgGAQCyCwAh2QYBALILACHaBkAAswsAIdsGAQCyCwAhEAMAALYMACAGAAC3DAAgGgAAuAwAIPgFAQCwCwAh-gUQALELACH7BQEAsgsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhkgYBALILACHXBgEAsAsAIdgGAQCyCwAh2QYBALILACHaBkAAswsAIdsGAQCyCwAhEAMAALoMACAGAAC7DAAgGgAAvAwAIPgFAQAAAAH6BRAAAAAB-wUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAGSBgEAAAAB1wYBAAAAAdgGAQAAAAHZBgEAAAAB2gZAAAAAAdsGAQAAAAEFOQAAnA0AIPgFAQAAAAH_BUAAAAAB3gYBAAAAAd8GAQAAAAECAAAAzwEAIEkAANMNACADAAAAzwEAIEkAANMNACBKAADSDQAgAUIAAMcVADAKDwAA3QoAIDkAANsKACD1BQAA3AoAMPYFAADNAQAQ9wUAANwKADD4BQEAAAAB_wVAAPwJACG2BgEA8gkAId4GAQDyCQAh3wYBAPIJACECAAAAzwEAIEIAANINACACAAAA0A0AIEIAANENACAI9QUAAM8NADD2BQAA0A0AEPcFAADPDQAw-AUBAPIJACH_BUAA_AkAIbYGAQDyCQAh3gYBAPIJACHfBgEA8gkAIQj1BQAAzw0AMPYFAADQDQAQ9wUAAM8NADD4BQEA8gkAIf8FQAD8CQAhtgYBAPIJACHeBgEA8gkAId8GAQDyCQAhBPgFAQCwCwAh_wVAALMLACHeBgEAsAsAId8GAQCwCwAhBTkAAJoNACD4BQEAsAsAIf8FQACzCwAh3gYBALALACHfBgEAsAsAIQU5AACcDQAg-AUBAAAAAf8FQAAAAAHeBgEAAAAB3wYBAAAAAQ4DAADiDQAgCgAA4w0AIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB2wYBAAAAAY0HAQAAAAGQBwEAAAABkQdAAAAAAQIAAABpACBJAADhDQAgAwAAAGkAIEkAAOENACBKAADeDQAgAUIAAMYVADATAwAA5goAIAoAAIALACAPAAD9CgAg9QUAAIELADD2BQAAZwAQ9wUAAIELADD4BQEAAAAB_gUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDyCQAhtgYBAPMJACHVBgEA8wkAIdsGAQAAAAGNBwEA8gkAIZAHAQDzCQAhkQdAAPwJACECAAAAaQAgQgAA3g0AIAIAAADcDQAgQgAA3Q0AIBD1BQAA2w0AMPYFAADcDQAQ9wUAANsNADD4BQEA8gkAIf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8gkAIbYGAQDzCQAh1QYBAPMJACHbBgEA8wkAIY0HAQDyCQAhkAcBAPMJACGRB0AA_AkAIRD1BQAA2w0AMPYFAADcDQAQ9wUAANsNADD4BQEA8gkAIf4FAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8gkAIbYGAQDzCQAh1QYBAPMJACHbBgEA8wkAIY0HAQDyCQAhkAcBAPMJACGRB0AA_AkAIQz4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsAsAIdUGAQCyCwAh2wYBALILACGNBwEAsAsAIZAHAQCyCwAhkQdAALMLACEOAwAA3w0AIAoAAOANACD4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsAsAIdUGAQCyCwAh2wYBALILACGNBwEAsAsAIZAHAQCyCwAhkQdAALMLACEFSQAAvhUAIEoAAMQVACC1BwAAvxUAILYHAADDFQAguwcAAI8CACAFSQAAvBUAIEoAAMEVACC1BwAAvRUAILYHAADAFQAguwcAABQAIA4DAADiDQAgCgAA4w0AIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB2wYBAAAAAY0HAQAAAAGQBwEAAAABkQdAAAAAAQNJAAC-FQAgtQcAAL8VACC7BwAAjwIAIANJAAC8FQAgtQcAAL0VACC7BwAAFAAgCgMAAPMNACAnAADyDQAg-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAewGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAECAAAAfwAgSQAA8Q0AIAMAAAB_ACBJAADxDQAgSgAA7g0AIAFCAAC7FQAwDwMAAOYKACAPAAD9CgAgJwAA8goAIPUFAAD8CgAw9gUAAH0AEPcFAAD8CgAw-AUBAAAAAf8FQAD8CQAhjgZAAPwJACGQBgEA8gkAIbYGAQDzCQAh7AYBAPIJACH3BiAA-wkAIfgGEADjCgAh-QYQAOMKACECAAAAfwAgQgAA7g0AIAIAAADsDQAgQgAA7Q0AIAz1BQAA6w0AMPYFAADsDQAQ9wUAAOsNADD4BQEA8gkAIf8FQAD8CQAhjgZAAPwJACGQBgEA8gkAIbYGAQDzCQAh7AYBAPIJACH3BiAA-wkAIfgGEADjCgAh-QYQAOMKACEM9QUAAOsNADD2BQAA7A0AEPcFAADrDQAw-AUBAPIJACH_BUAA_AkAIY4GQAD8CQAhkAYBAPIJACG2BgEA8wkAIewGAQDyCQAh9wYgAPsJACH4BhAA4woAIfkGEADjCgAhCPgFAQCwCwAh_wVAALMLACGOBkAAswsAIZAGAQCwCwAh7AYBALALACH3BiAA_QsAIfgGEADCCwAh-QYQAMILACEKAwAA8A0AICcAAO8NACD4BQEAsAsAIf8FQACzCwAhjgZAALMLACGQBgEAsAsAIewGAQCwCwAh9wYgAP0LACH4BhAAwgsAIfkGEADCCwAhBUkAALMVACBKAAC5FQAgtQcAALQVACC2BwAAuBUAILsHAACDAQAgBUkAALEVACBKAAC2FQAgtQcAALIVACC2BwAAtRUAILsHAACPAgAgCgMAAPMNACAnAADyDQAg-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAewGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAEDSQAAsxUAILUHAAC0FQAguwcAAIMBACADSQAAsRUAILUHAACyFQAguwcAAI8CACADSQAArxUAILUHAACwFQAguwcAAI8CACADSQAArRUAILUHAACuFQAguwcAAAEAIARJAADkDQAwtQcAAOUNADC3BwAA5w0AILsHAADoDQAwBEkAANQNADC1BwAA1Q0AMLcHAADXDQAguwcAANgNADAESQAAyA0AMLUHAADJDQAwtwcAAMsNACC7BwAAzA0AMARJAAC_DQAwtQcAAMANADC3BwAAwg0AILsHAADGDAAwBEkAALQNADC1BwAAtQ0AMLcHAAC3DQAguwcAAOcMADAESQAAqA0AMLUHAACpDQAwtwcAAKsNACC7BwAArA0AMAAAAAAAAAAAAAAFSQAAohUAIEoAAKsVACC1BwAAoxUAILYHAACqFQAguwcAAIMBACALSQAAiA4AMEoAAI0OADC1BwAAiQ4AMLYHAACKDgAwtwcAAIsOACC4BwAAjA4AMLkHAACMDgAwugcAAIwOADC7BwAAjA4AMLwHAACODgAwvQcAAI8OADAJKAAAlQ4AIPgFAQAAAAH6BRAAAAAB_QUBAAAAAf8FQAAAAAGABgEAAAAB8gYBAAAAAfQGQAAAAAH1BgEAAAABAgAAAI0BACBJAACUDgAgAwAAAI0BACBJAACUDgAgSgAAkg4AIAFCAACpFQAwDigAAPUKACAqAAD2CgAg9QUAAPQKADD2BQAAiwEAEPcFAAD0CgAw-AUBAAAAAfoFEADfCgAh_QUBAPMJACH_BUAA_AkAIYAGAQDzCQAh8gYBAPIJACHzBgEA8wkAIfQGQAD8CQAh9QYBAPMJACECAAAAjQEAIEIAAJIOACACAAAAkA4AIEIAAJEOACAM9QUAAI8OADD2BQAAkA4AEPcFAACPDgAw-AUBAPIJACH6BRAA3woAIf0FAQDzCQAh_wVAAPwJACGABgEA8wkAIfIGAQDyCQAh8wYBAPMJACH0BkAA_AkAIfUGAQDzCQAhDPUFAACPDgAw9gUAAJAOABD3BQAAjw4AMPgFAQDyCQAh-gUQAN8KACH9BQEA8wkAIf8FQAD8CQAhgAYBAPMJACHyBgEA8gkAIfMGAQDzCQAh9AZAAPwJACH1BgEA8wkAIQj4BQEAsAsAIfoFEACxCwAh_QUBALILACH_BUAAswsAIYAGAQCyCwAh8gYBALALACH0BkAAswsAIfUGAQCyCwAhCSgAAJMOACD4BQEAsAsAIfoFEACxCwAh_QUBALILACH_BUAAswsAIYAGAQCyCwAh8gYBALALACH0BkAAswsAIfUGAQCyCwAhBUkAAKQVACBKAACnFQAgtQcAAKUVACC2BwAAphUAILsHAACJAQAgCSgAAJUOACD4BQEAAAAB-gUQAAAAAf0FAQAAAAH_BUAAAAABgAYBAAAAAfIGAQAAAAH0BkAAAAAB9QYBAAAAAQNJAACkFQAgtQcAAKUVACC7BwAAiQEAIANJAACiFQAgtQcAAKMVACC7BwAAgwEAIARJAACIDgAwtQcAAIkOADC3BwAAiw4AILsHAACMDgAwAAAAAAAHSQAAnRUAIEoAAKAVACC1BwAAnhUAILYHAACfFQAguQcAAI8BACC6BwAAjwEAILsHAACVAQAgA0kAAJ0VACC1BwAAnhUAILsHAACVAQAgAAAAAAAFSQAAlxUAIEoAAJsVACC1BwAAmBUAILYHAACaFQAguwcAAIMBACALSQAApg4AMEoAAKoOADC1BwAApw4AMLYHAACoDgAwtwcAAKkOACC4BwAAjA4AMLkHAACMDgAwugcAAIwOADC7BwAAjA4AMLwHAACrDgAwvQcAAI8OADAJKgAAng4AIPgFAQAAAAH6BRAAAAAB_QUBAAAAAf8FQAAAAAGABgEAAAAB8wYBAAAAAfQGQAAAAAH1BgEAAAABAgAAAI0BACBJAACuDgAgAwAAAI0BACBJAACuDgAgSgAArQ4AIAFCAACZFQAwAgAAAI0BACBCAACtDgAgAgAAAJAOACBCAACsDgAgCPgFAQCwCwAh-gUQALELACH9BQEAsgsAIf8FQACzCwAhgAYBALILACHzBgEAsgsAIfQGQACzCwAh9QYBALILACEJKgAAnQ4AIPgFAQCwCwAh-gUQALELACH9BQEAsgsAIf8FQACzCwAhgAYBALILACHzBgEAsgsAIfQGQACzCwAh9QYBALILACEJKgAAng4AIPgFAQAAAAH6BRAAAAAB_QUBAAAAAf8FQAAAAAGABgEAAAAB8wYBAAAAAfQGQAAAAAH1BgEAAAABA0kAAJcVACC1BwAAmBUAILsHAACDAQAgBEkAAKYOADC1BwAApw4AMLcHAACpDgAguwcAAIwOADAAAAAAAAdJAACSFQAgSgAAlRUAILUHAACTFQAgtgcAAJQVACC5BwAAAwAgugcAAAMAILsHAAAFACADSQAAkhUAILUHAACTFQAguwcAAAUAIAAAAAAABUkAAIoVACBKAACQFQAgtQcAAIsVACC2BwAAjxUAILsHAADNBQAgC0kAANkOADBKAADdDgAwtQcAANoOADC2BwAA2w4AMLcHAADcDgAguAcAAOgNADC5BwAA6A0AMLoHAADoDQAwuwcAAOgNADC8BwAA3g4AML0HAADrDQAwC0kAAM0OADBKAADSDgAwtQcAAM4OADC2BwAAzw4AMLcHAADQDgAguAcAANEOADC5BwAA0Q4AMLoHAADRDgAwuwcAANEOADC8BwAA0w4AML0HAADUDgAwC0kAAMEOADBKAADGDgAwtQcAAMIOADC2BwAAww4AMLcHAADEDgAguAcAAMUOADC5BwAAxQ4AMLoHAADFDgAwuwcAAMUOADC8BwAAxw4AML0HAADIDgAwDCkAAJcOACD4BQEAAAAB_AVAAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZkGAQAAAAHtBhAAAAAB7gYQAAAAAe8GEAAAAAHwBhAAAAAB8QYBAAAAAQIAAACVAQAgSQAAzA4AIAMAAACVAQAgSQAAzA4AIEoAAMsOACABQgAAjhUAMBEnAADyCgAgKQAA8woAIPUFAADxCgAw9gUAAI8BABD3BQAA8QoAMPgFAQAAAAH8BUAA9AkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZkGAQDyCQAh7AYBAPIJACHtBhAA3woAIe4GEADfCgAh7wYQAN8KACHwBhAA3woAIfEGAQDzCQAhAgAAAJUBACBCAADLDgAgAgAAAMkOACBCAADKDgAgD_UFAADIDgAw9gUAAMkOABD3BQAAyA4AMPgFAQDyCQAh_AVAAPQJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGZBgEA8gkAIewGAQDyCQAh7QYQAN8KACHuBhAA3woAIe8GEADfCgAh8AYQAN8KACHxBgEA8wkAIQ_1BQAAyA4AMPYFAADJDgAQ9wUAAMgOADD4BQEA8gkAIfwFQAD0CQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhmQYBAPIJACHsBgEA8gkAIe0GEADfCgAh7gYQAN8KACHvBhAA3woAIfAGEADfCgAh8QYBAPMJACEL-AUBALALACH8BUAAxAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZkGAQCwCwAh7QYQALELACHuBhAAsQsAIe8GEACxCwAh8AYQALELACHxBgEAsgsAIQwpAACHDgAg-AUBALALACH8BUAAxAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZkGAQCwCwAh7QYQALELACHuBhAAsQsAIe8GEACxCwAh8AYQALELACHxBgEAsgsAIQwpAACXDgAg-AUBAAAAAfwFQAAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGZBgEAAAAB7QYQAAAAAe4GEAAAAAHvBhAAAAAB8AYQAAAAAfEGAQAAAAEJKwAAsA4AIPgFAQAAAAH6BRAAAAAB-wUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAfUGAQAAAAH2BkAAAAABAgAAAIkBACBJAADYDgAgAwAAAIkBACBJAADYDgAgSgAA1w4AIAFCAACNFQAwDicAAPIKACArAADzCgAg9QUAAPcKADD2BQAAhwEAEPcFAAD3CgAw-AUBAAAAAfoFEADfCgAh-wUBAPMJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACHsBgEA8gkAIfUGAQDzCQAh9gZAAPwJACECAAAAiQEAIEIAANcOACACAAAA1Q4AIEIAANYOACAM9QUAANQOADD2BQAA1Q4AEPcFAADUDgAw-AUBAPIJACH6BRAA3woAIfsFAQDzCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAh7AYBAPIJACH1BgEA8wkAIfYGQAD8CQAhDPUFAADUDgAw9gUAANUOABD3BQAA1A4AMPgFAQDyCQAh-gUQAN8KACH7BQEA8wkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIewGAQDyCQAh9QYBAPMJACH2BkAA_AkAIQj4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACH1BgEAsgsAIfYGQACzCwAhCSsAAKUOACD4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACH1BgEAsgsAIfYGQACzCwAhCSsAALAOACD4BQEAAAAB-gUQAAAAAfsFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAH1BgEAAAAB9gZAAAAAAQoDAADzDQAgDwAAtw4AIPgFAQAAAAH_BUAAAAABjgZAAAAAAZAGAQAAAAG2BgEAAAAB9wYgAAAAAfgGEAAAAAH5BhAAAAABAgAAAH8AIEkAAOEOACADAAAAfwAgSQAA4Q4AIEoAAOAOACABQgAAjBUAMAIAAAB_ACBCAADgDgAgAgAAAOwNACBCAADfDgAgCPgFAQCwCwAh_wVAALMLACGOBkAAswsAIZAGAQCwCwAhtgYBALILACH3BiAA_QsAIfgGEADCCwAh-QYQAMILACEKAwAA8A0AIA8AALYOACD4BQEAsAsAIf8FQACzCwAhjgZAALMLACGQBgEAsAsAIbYGAQCyCwAh9wYgAP0LACH4BhAAwgsAIfkGEADCCwAhCgMAAPMNACAPAAC3DgAg-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAbYGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAEDSQAAihUAILUHAACLFQAguwcAAM0FACAESQAA2Q4AMLUHAADaDgAwtwcAANwOACC7BwAA6A0AMARJAADNDgAwtQcAAM4OADC3BwAA0A4AILsHAADRDgAwBEkAAMEOADC1BwAAwg4AMLcHAADEDgAguwcAAMUOADAAAAALSQAA6g4AMEoAAO8OADC1BwAA6w4AMLYHAADsDgAwtwcAAO0OACC4BwAA7g4AMLkHAADuDgAwugcAAO4OADC7BwAA7g4AMLwHAADwDgAwvQcAAPEOADAJJgAA4w4AICwAAOQOACAtAADlDgAg-AUBAAAAAZ8GAQAAAAHcBiAAAAAB-gYBAAAAAfsGAQAAAAH9BhAAAAABAgAAAIMBACBJAAD1DgAgAwAAAIMBACBJAAD1DgAgSgAA9A4AIAFCAACJFQAwDiUAAPkKACAmAADOCgAgLAAA-goAIC0AAPsKACD1BQAA-AoAMPYFAACBAQAQ9wUAAPgKADD4BQEAAAABnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhAgAAAIMBACBCAAD0DgAgAgAAAPIOACBCAADzDgAgCvUFAADxDgAw9gUAAPIOABD3BQAA8Q4AMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhCvUFAADxDgAw9gUAAPIOABD3BQAA8Q4AMPgFAQDyCQAhnwYBAPIJACHcBiAA-wkAIfoGAQDzCQAh-wYBAPMJACH8BgEA8gkAIf0GEADfCgAhBvgFAQCwCwAhnwYBALALACHcBiAA_QsAIfoGAQCyCwAh-wYBALILACH9BhAAsQsAIQkmAAC-DgAgLAAAvw4AIC0AAMAOACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACH6BgEAsgsAIfsGAQCyCwAh_QYQALELACEJJgAA4w4AICwAAOQOACAtAADlDgAg-AUBAAAAAZ8GAQAAAAHcBiAAAAAB-gYBAAAAAfsGAQAAAAH9BhAAAAABBEkAAOoOADC1BwAA6w4AMLcHAADtDgAguwcAAO4OADAAAAAAAAAFSQAAhBUAIEoAAIcVACC1BwAAhRUAILYHAACGFQAguwcAAEQAIANJAACEFQAgtQcAAIUVACC7BwAARAAgAAAAAbgHAAAAggcCBUkAAPwUACBKAACCFQAgtQcAAP0UACC2BwAAgRUAILsHAABEACAHSQAA-hQAIEoAAP8UACC1BwAA-xQAILYHAAD-FAAguQcAADIAILoHAAAyACC7BwAAjwIAIANJAAD8FAAgtQcAAP0UACC7BwAARAAgA0kAAPoUACC1BwAA-xQAILsHAACPAgAgAAAABUkAAO8UACBKAAD4FAAgtQcAAPAUACC2BwAA9xQAILsHAACoBAAgB0kAAO0UACBKAAD1FAAgtQcAAO4UACC2BwAA9BQAILkHAAAyACC6BwAAMgAguwcAAI8CACALSQAApA8AMEoAAKkPADC1BwAApQ8AMLYHAACmDwAwtwcAAKcPACC4BwAAqA8AMLkHAACoDwAwugcAAKgPADC7BwAAqA8AMLwHAACqDwAwvQcAAKsPADALSQAAmA8AMEoAAJ0PADC1BwAAmQ8AMLYHAACaDwAwtwcAAJsPACC4BwAAnA8AMLkHAACcDwAwugcAAJwPADC7BwAAnA8AMLwHAACeDwAwvQcAAJ8PADALSQAAjw8AMEoAAJMPADC1BwAAkA8AMLYHAACRDwAwtwcAAJIPACC4BwAA2wwAMLkHAADbDAAwugcAANsMADC7BwAA2wwAMLwHAACUDwAwvQcAAN4MADAXAwAArQwAIA4AAK4MACARAACvDAAg-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAAByAYBAAAAAckGAQAAAAHKBgEAAAABywYBAAAAAcwGAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAECAAAAKAAgSQAAlw8AIAMAAAAoACBJAACXDwAgSgAAlg8AIAFCAADzFAAwAgAAACgAIEIAAJYPACACAAAA3wwAIEIAAJUPACAU-AUBALALACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhyAYBALALACHJBgEAsgsAIcoGAQCwCwAhywYBALILACHMBgEAsgsAIc4GAQCyCwAhzwYCAIkMACHQBhAAsQsAIdEGEACxCwAh0gYQALELACHTBgEAsgsAIdQGAQCyCwAh1QYBALILACHWBkAAswsAIRcDAACpDAAgDgAAqgwAIBEAAKsMACD4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACHIBgEAsAsAIckGAQCyCwAhygYBALALACHLBgEAsgsAIcwGAQCyCwAhzgYBALILACHPBgIAiQwAIdAGEACxCwAh0QYQALELACHSBhAAsQsAIdMGAQCyCwAh1AYBALILACHVBgEAsgsAIdYGQACzCwAhFwMAAK0MACAOAACuDAAgEQAArwwAIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAcgGAQAAAAHJBgEAAAABygYBAAAAAcsGAQAAAAHMBgEAAAABzgYBAAAAAc8GAgAAAAHQBhAAAAAB0QYQAAAAAdIGEAAAAAHTBgEAAAAB1AYBAAAAAdUGAQAAAAHWBkAAAAABBvgFAQAAAAH_BUAAAAAB1QYBAAAAAf4GAQAAAAH_BhAAAAABgAdAAAAAAQIAAABPACBJAACjDwAgAwAAAE8AIEkAAKMPACBKAACiDwAgAUIAAPIUADALGAAAiQsAIPUFAACICwAw9gUAAE0AEPcFAACICwAw-AUBAAAAAf8FQAD8CQAhzQYBAPIJACHVBgEA8wkAIf4GAQDyCQAh_wYQAOMKACGAB0AA_AkAIQIAAABPACBCAACiDwAgAgAAAKAPACBCAAChDwAgCvUFAACfDwAw9gUAAKAPABD3BQAAnw8AMPgFAQDyCQAh_wVAAPwJACHNBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhCvUFAACfDwAw9gUAAKAPABD3BQAAnw8AMPgFAQDyCQAh_wVAAPwJACHNBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhBvgFAQCwCwAh_wVAALMLACHVBgEAsgsAIf4GAQCwCwAh_wYQAMILACGAB0AAswsAIQb4BQEAsAsAIf8FQACzCwAh1QYBALILACH-BgEAsAsAIf8GEADCCwAhgAdAALMLACEG-AUBAAAAAf8FQAAAAAHVBgEAAAAB_gYBAAAAAf8GEAAAAAGAB0AAAAABCAMAAIYPACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAYIHAAAAggcCgwdAAAAAAQIAAABKACBJAACvDwAgAwAAAEoAIEkAAK8PACBKAACuDwAgAUIAAPEUADANAwAAhAsAIBgAAIkLACD1BQAAigsAMPYFAABIABD3BQAAigsAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8wkAIc0GAQDyCQAhggcAAIsLggcigwdAAPwJACECAAAASgAgQgAArg8AIAIAAACsDwAgQgAArQ8AIAv1BQAAqw8AMPYFAACsDwAQ9wUAAKsPADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzQYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQv1BQAAqw8AMPYFAACsDwAQ9wUAAKsPADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzQYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQf4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCyCwAhggcAAIIPggcigwdAALMLACEIAwAAhA8AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALILACGCBwAAgg-CByKDB0AAswsAIQgDAACGDwAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAGCBwAAAIIHAoMHQAAAAAEDSQAA7xQAILUHAADwFAAguwcAAKgEACADSQAA7RQAILUHAADuFAAguwcAAI8CACAESQAApA8AMLUHAAClDwAwtwcAAKcPACC7BwAAqA8AMARJAACYDwAwtQcAAJkPADC3BwAAmw8AILsHAACcDwAwBEkAAI8PADC1BwAAkA8AMLcHAACSDwAguwcAANsMADAAAAAAAAVJAADoFAAgSgAA6xQAILUHAADpFAAgtgcAAOoUACC7BwAALwAgA0kAAOgUACC1BwAA6RQAILsHAAAvACAAAAAFSQAA4BQAIEoAAOYUACC1BwAA4RQAILYHAADlFAAguwcAAC8AIAdJAADeFAAgSgAA4xQAILUHAADfFAAgtgcAAOIUACC5BwAAMgAgugcAADIAILsHAACPAgAgA0kAAOAUACC1BwAA4RQAILsHAAAvACADSQAA3hQAILUHAADfFAAguwcAAI8CACAAAAAFSQAA0xQAIEoAANwUACC1BwAA1BQAILYHAADbFAAguwcAAI8EACAHSQAA0RQAIEoAANkUACC1BwAA0hQAILYHAADYFAAguQcAADIAILoHAAAyACC7BwAAjwIAIAtJAADgDwAwSgAA5Q8AMLUHAADhDwAwtgcAAOIPADC3BwAA4w8AILgHAADkDwAwuQcAAOQPADC6BwAA5A8AMLsHAADkDwAwvAcAAOYPADC9BwAA5w8AMAtJAADUDwAwSgAA2Q8AMLUHAADVDwAwtgcAANYPADC3BwAA1w8AILgHAADYDwAwuQcAANgPADC6BwAA2A8AMLsHAADYDwAwvAcAANoPADC9BwAA2w8AMAtJAADLDwAwSgAAzw8AMLUHAADMDwAwtgcAAM0PADC3BwAAzg8AILgHAADbDAAwuQcAANsMADC6BwAA2wwAMLsHAADbDAAwvAcAANAPADC9BwAA3gwAMBcDAACtDAAgDgAArgwAIBgAALAMACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzQYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAAQIAAAAoACBJAADTDwAgAwAAACgAIEkAANMPACBKAADSDwAgAUIAANcUADACAAAAKAAgQgAA0g8AIAIAAADfDAAgQgAA0Q8AIBT4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACHIBgEAsAsAIckGAQCyCwAhygYBALALACHLBgEAsgsAIc0GAQCyCwAhzgYBALILACHPBgIAiQwAIdAGEACxCwAh0QYQALELACHSBhAAsQsAIdMGAQCyCwAh1AYBALILACHVBgEAsgsAIdYGQACzCwAhFwMAAKkMACAOAACqDAAgGAAArAwAIPgFAQCwCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIcgGAQCwCwAhyQYBALILACHKBgEAsAsAIcsGAQCyCwAhzQYBALILACHOBgEAsgsAIc8GAgCJDAAh0AYQALELACHRBhAAsQsAIdIGEACxCwAh0wYBALILACHUBgEAsgsAIdUGAQCyCwAh1gZAALMLACEXAwAArQwAIA4AAK4MACAYAACwDAAg-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAAByAYBAAAAAckGAQAAAAHKBgEAAAABywYBAAAAAc0GAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAEG-AUBAAAAAf8FQAAAAAHVBgEAAAAB_gYBAAAAAf8GEAAAAAGAB0AAAAABAgAAADsAIEkAAN8PACADAAAAOwAgSQAA3w8AIEoAAN4PACABQgAA1hQAMAsRAACQCwAg9QUAAI8LADD2BQAAOQAQ9wUAAI8LADD4BQEAAAAB_wVAAPwJACHMBgEA8gkAIdUGAQDzCQAh_gYBAPIJACH_BhAA4woAIYAHQAD8CQAhAgAAADsAIEIAAN4PACACAAAA3A8AIEIAAN0PACAK9QUAANsPADD2BQAA3A8AEPcFAADbDwAw-AUBAPIJACH_BUAA_AkAIcwGAQDyCQAh1QYBAPMJACH-BgEA8gkAIf8GEADjCgAhgAdAAPwJACEK9QUAANsPADD2BQAA3A8AEPcFAADbDwAw-AUBAPIJACH_BUAA_AkAIcwGAQDyCQAh1QYBAPMJACH-BgEA8gkAIf8GEADjCgAhgAdAAPwJACEG-AUBALALACH_BUAAswsAIdUGAQCyCwAh_gYBALALACH_BhAAwgsAIYAHQACzCwAhBvgFAQCwCwAh_wVAALMLACHVBgEAsgsAIf4GAQCwCwAh_wYQAMILACGAB0AAswsAIQb4BQEAAAAB_wVAAAAAAdUGAQAAAAH-BgEAAAAB_wYQAAAAAYAHQAAAAAEIAwAAwg8AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABggcAAACCBwKDB0AAAAABAgAAADYAIEkAAOsPACADAAAANgAgSQAA6w8AIEoAAOoPACABQgAA1RQAMA0DAACECwAgEQAAkAsAIPUFAACRCwAw9gUAADQAEPcFAACRCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDzCQAhzAYBAPIJACGCBwAAiwuCByKDB0AA_AkAIQIAAAA2ACBCAADqDwAgAgAAAOgPACBCAADpDwAgC_UFAADnDwAw9gUAAOgPABD3BQAA5w8AMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPMJACHMBgEA8gkAIYIHAACLC4IHIoMHQAD8CQAhC_UFAADnDwAw9gUAAOgPABD3BQAA5w8AMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhkAYBAPMJACHMBgEA8gkAIYIHAACLC4IHIoMHQAD8CQAhB_gFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALILACGCBwAAgg-CByKDB0AAswsAIQgDAADADwAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsgsAIYIHAACCD4IHIoMHQACzCwAhCAMAAMIPACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAYIHAAAAggcCgwdAAAAAAQNJAADTFAAgtQcAANQUACC7BwAAjwQAIANJAADRFAAgtQcAANIUACC7BwAAjwIAIARJAADgDwAwtQcAAOEPADC3BwAA4w8AILsHAADkDwAwBEkAANQPADC1BwAA1Q8AMLcHAADXDwAguwcAANgPADAESQAAyw8AMLUHAADMDwAwtwcAAM4PACC7BwAA2wwAMAAAAAtJAAD1DwAwSgAA-g8AMLUHAAD2DwAwtgcAAPcPADC3BwAA-A8AILgHAAD5DwAwuQcAAPkPADC6BwAA-Q8AMLsHAAD5DwAwvAcAAPsPADC9BwAA_A8AMAsTAACxDwAgFAAAsg8AIBUAALMPACAWAAC0DwAg-AUBAAAAAcoGAQAAAAGEBwEAAAABhgcBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAECAAAARAAgSQAAgBAAIAMAAABEACBJAACAEAAgSgAA_w8AIAFCAADQFAAwEBIAAI0LACATAACECwAgFAAAzQoAIBUAAI4LACAWAACRCgAg9QUAAIwLADD2BQAAQQAQ9wUAAIwLADD4BQEAAAABygYBAPMJACGEBwEAAAABhQcBAPIJACGGBwEA8wkAIYcHAACLC4IHIogHAQDzCQAhiQcAAO8KACACAAAARAAgQgAA_w8AIAIAAAD9DwAgQgAA_g8AIAv1BQAA_A8AMPYFAAD9DwAQ9wUAAPwPADD4BQEA8gkAIcoGAQDzCQAhhAcBAPIJACGFBwEA8gkAIYYHAQDzCQAhhwcAAIsLggciiAcBAPMJACGJBwAA7woAIAv1BQAA_A8AMPYFAAD9DwAQ9wUAAPwPADD4BQEA8gkAIcoGAQDzCQAhhAcBAPIJACGFBwEA8gkAIYYHAQDzCQAhhwcAAIsLggciiAcBAPMJACGJBwAA7woAIAf4BQEAsAsAIcoGAQCyCwAhhAcBALALACGGBwEAsgsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAQsTAACLDwAgFAAAjA8AIBUAAI0PACAWAACODwAg-AUBALALACHKBgEAsgsAIYQHAQCwCwAhhgcBALILACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAELEwAAsQ8AIBQAALIPACAVAACzDwAgFgAAtA8AIPgFAQAAAAHKBgEAAAABhAcBAAAAAYYHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABBEkAAPUPADC1BwAA9g8AMLcHAAD4DwAguwcAAPkPADAAAAAAC0kAAIcQADBKAACMEAAwtQcAAIgQADC2BwAAiRAAMLcHAACKEAAguAcAAIsQADC5BwAAixAAMLoHAACLEAAwuwcAAIsQADC8BwAAjRAAML0HAACOEAAwDRMAAO0PACAUAADuDwAgFQAA7w8AIBYAAPAPACD4BQEAAAABnwYBAAAAAcoGAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABigcBAAAAAYsHAQAAAAGMBwEAAAABAgAAAC8AIEkAAJIQACADAAAALwAgSQAAkhAAIEoAAJEQACABQgAAzxQAMBISAACTCwAgEwAAhAsAIBQAAMwKACAVAACUCwAgFgAAkQoAIPUFAACSCwAw9gUAACwAEPcFAACSCwAw-AUBAAAAAZ8GAQDyCQAhygYBAPMJACGFBwEA8gkAIYcHAACLC4IHIogHAQDzCQAhiQcAAO8KACCKBwEAAAABiwcBAPMJACGMBwEA8wkAIQIAAAAvACBCAACREAAgAgAAAI8QACBCAACQEAAgDfUFAACOEAAw9gUAAI8QABD3BQAAjhAAMPgFAQDyCQAhnwYBAPIJACHKBgEA8wkAIYUHAQDyCQAhhwcAAIsLggciiAcBAPMJACGJBwAA7woAIIoHAQDyCQAhiwcBAPMJACGMBwEA8wkAIQ31BQAAjhAAMPYFAACPEAAQ9wUAAI4QADD4BQEA8gkAIZ8GAQDyCQAhygYBAPMJACGFBwEA8gkAIYcHAACLC4IHIogHAQDzCQAhiQcAAO8KACCKBwEA8gkAIYsHAQDzCQAhjAcBAPMJACEJ-AUBALALACGfBgEAsAsAIcoGAQCyCwAhhwcAAIIPggciiAcBALILACGJB4AAAAABigcBALALACGLBwEAsgsAIYwHAQCyCwAhDRMAAMcPACAUAADIDwAgFQAAyQ8AIBYAAMoPACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAGKBwEAsAsAIYsHAQCyCwAhjAcBALILACENEwAA7Q8AIBQAAO4PACAVAADvDwAgFgAA8A8AIPgFAQAAAAGfBgEAAAABygYBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAEESQAAhxAAMLUHAACIEAAwtwcAAIoQACC7BwAAixAAMAAAAAAAAAG4BwAAAI8HAgVJAADHFAAgSgAAzRQAILUHAADIFAAgtgcAAMwUACC7BwAAjwIAIAVJAADFFAAgSgAAyhQAILUHAADGFAAgtgcAAMkUACC7BwAAFAAgA0kAAMcUACC1BwAAyBQAILsHAACPAgAgA0kAAMUUACC1BwAAxhQAILsHAAAUACAAAAAAAAdJAADAFAAgSgAAwxQAILUHAADBFAAgtgcAAMIUACC5BwAAAwAgugcAAAMAILsHAAAFACADSQAAwBQAILUHAADBFAAguwcAAAUAIAAAAAAAAbgHAAAAkwcCBUkAALUUACBKAAC-FAAgtQcAALYUACC2BwAAvRQAILsHAAAUACAHSQAAsxQAIEoAALsUACC1BwAAtBQAILYHAAC6FAAguQcAADIAILoHAAAyACC7BwAAjwIAIAVJAACxFAAgSgAAuBQAILUHAACyFAAgtgcAALcUACC7BwAAjwIAIANJAAC1FAAgtQcAALYUACC7BwAAFAAgA0kAALMUACC1BwAAtBQAILsHAACPAgAgA0kAALEUACC1BwAAshQAILsHAACPAgAgAAAAAAAFSQAArBQAIEoAAK8UACC1BwAArRQAILYHAACuFAAguwcAAJwHACADSQAArBQAILUHAACtFAAguwcAAJwHACAAAAAAAAVJAACkFAAgSgAAqhQAILUHAAClFAAgtgcAAKkUACC7BwAAjwIAIAVJAACiFAAgSgAApxQAILUHAACjFAAgtgcAAKYUACC7BwAAFAAgA0kAAKQUACC1BwAApRQAILsHAACPAgAgA0kAAKIUACC1BwAAoxQAILsHAAAUACAAAAAAAAVJAACdFAAgSgAAoBQAILUHAACeFAAgtgcAAJ8UACC7BwAAFAAgA0kAAJ0UACC1BwAAnhQAILsHAAAUACAAAAAFSQAAkhQAIEoAAJsUACC1BwAAkxQAILYHAACaFAAguwcAAA0AIAtJAACJEQAwSgAAjhEAMLUHAACKEQAwtgcAAIsRADC3BwAAjBEAILgHAACNEQAwuQcAAI0RADC6BwAAjREAMLsHAACNEQAwvAcAAI8RADC9BwAAkBEAMAtJAAD9EAAwSgAAghEAMLUHAAD-EAAwtgcAAP8QADC3BwAAgBEAILgHAACBEQAwuQcAAIERADC6BwAAgREAMLsHAACBEQAwvAcAAIMRADC9BwAAhBEAMAtJAAD0EAAwSgAA-BAAMLUHAAD1EAAwtgcAAPYQADC3BwAA9xAAILgHAAD3DAAwuQcAAPcMADC6BwAA9wwAMLsHAAD3DAAwvAcAAPkQADC9BwAA-gwAMAtJAADoEAAwSgAA7RAAMLUHAADpEAAwtgcAAOoQADC3BwAA6xAAILgHAADsEAAwuQcAAOwQADC6BwAA7BAAMLsHAADsEAAwvAcAAO4QADC9BwAA7xAAMAtJAADfEAAwSgAA4xAAMLUHAADgEAAwtgcAAOEQADC3BwAA4hAAILgHAADYDQAwuQcAANgNADC6BwAA2A0AMLsHAADYDQAwvAcAAOQQADC9BwAA2w0AMAtJAADTEAAwSgAA2BAAMLUHAADUEAAwtgcAANUQADC3BwAA1hAAILgHAADXEAAwuQcAANcQADC6BwAA1xAAMLsHAADXEAAwvAcAANkQADC9BwAA2hAAMAoDAACdEAAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGQBgEAAAAB1QYBAAAAAf4GAAAAjwcCjwdAAAAAAQIAAABuACBJAADeEAAgAwAAAG4AIEkAAN4QACBKAADdEAAgAUIAAJkUADAPAwAA5goAIAoAAIALACD1BQAA_goAMPYFAABsABD3BQAA_goAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDyCQAh1QYBAPMJACH-BgAA_wqPByKNBwEA8gkAIY8HQAD8CQAhAgAAAG4AIEIAAN0QACACAAAA2xAAIEIAANwQACAN9QUAANoQADD2BQAA2xAAEPcFAADaEAAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGNBhAA3woAIZAGAQDyCQAh1QYBAPMJACH-BgAA_wqPByKNBwEA8gkAIY8HQAD8CQAhDfUFAADaEAAw9gUAANsQABD3BQAA2hAAMPgFAQDyCQAh_wVAAPwJACGABgEA8wkAIYEGAQDzCQAhjQYQAN8KACGQBgEA8gkAIdUGAQDzCQAh_gYAAP8KjwcijQcBAPIJACGPB0AA_AkAIQn4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALALACHVBgEAsgsAIf4GAACaEI8HIo8HQACzCwAhCgMAAJsQACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALALACHVBgEAsgsAIf4GAACaEI8HIo8HQACzCwAhCgMAAJ0QACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB_gYAAACPBwKPB0AAAAABDgMAAOINACAPAAClEAAg-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABkAYBAAAAAbYGAQAAAAHVBgEAAAAB2wYBAAAAAZAHAQAAAAGRB0AAAAABAgAAAGkAIEkAAOcQACADAAAAaQAgSQAA5xAAIEoAAOYQACABQgAAmBQAMAIAAABpACBCAADmEAAgAgAAANwNACBCAADlEAAgDPgFAQCwCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCwCwAhtgYBALILACHVBgEAsgsAIdsGAQCyCwAhkAcBALILACGRB0AAswsAIQ4DAADfDQAgDwAApBAAIPgFAQCwCwAh_gUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCwCwAhtgYBALILACHVBgEAsgsAIdsGAQCyCwAhkAcBALILACGRB0AAswsAIQ4DAADiDQAgDwAApRAAIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAG2BgEAAAAB1QYBAAAAAdsGAQAAAAGQBwEAAAABkQdAAAAAAQ8bAACwEAAgHAAAsRAAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAZMHAQAAAAGUBwEAAAABlQcQAAAAAZYHEAAAAAGXBwEAAAABAgAAAGQAIEkAAPMQACADAAAAZAAgSQAA8xAAIEoAAPIQACABQgAAlxQAMBQKAACACwAgGwAAhAsAIBwAAOYKACD1BQAAggsAMPYFAABiABD3BQAAggsAMPgFAQAAAAH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACHOBgEA8wkAIdUGAQDzCQAh_gYAAIMLkwcigwdAAPwJACGNBwEA8gkAIZMHAQDzCQAhlAcBAPIJACGVBxAA3woAIZYHEADjCgAhlwcBAPMJACECAAAAZAAgQgAA8hAAIAIAAADwEAAgQgAA8RAAIBH1BQAA7xAAMPYFAADwEAAQ9wUAAO8QADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIc4GAQDzCQAh1QYBAPMJACH-BgAAgwuTByKDB0AA_AkAIY0HAQDyCQAhkwcBAPMJACGUBwEA8gkAIZUHEADfCgAhlgcQAOMKACGXBwEA8wkAIRH1BQAA7xAAMPYFAADwEAAQ9wUAAO8QADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIc4GAQDzCQAh1QYBAPMJACH-BgAAgwuTByKDB0AA_AkAIY0HAQDyCQAhkwcBAPMJACGUBwEA8gkAIZUHEADfCgAhlgcQAOMKACGXBwEA8wkAIQ34BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIc4GAQCyCwAh1QYBALILACH-BgAAqxCTByKDB0AAswsAIZMHAQCyCwAhlAcBALALACGVBxAAsQsAIZYHEADCCwAhlwcBALILACEPGwAArRAAIBwAAK4QACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIc4GAQCyCwAh1QYBALILACH-BgAAqxCTByKDB0AAswsAIZMHAQCyCwAhlAcBALALACGVBxAAsQsAIZYHEADCCwAhlwcBALILACEPGwAAsBAAIBwAALEQACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzgYBAAAAAdUGAQAAAAH-BgAAAJMHAoMHQAAAAAGTBwEAAAABlAcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAARUDAACNDQAgDgAAuBAAIBkAAI4NACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAZkHAAAAmQcCmgcBAAAAAZsHAQAAAAGcB0AAAAABAgAAAB4AIEkAAPwQACADAAAAHgAgSQAA_BAAIEoAAPsQACABQgAAlhQAMAIAAAAeACBCAAD7EAAgAgAAAPsMACBCAAD6EAAgEvgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACGQBgEAsgsAIZUGEADCCwAhywYBALALACHOBgEAsgsAIdIGEADCCwAh1AYBALILACHVBgEAsgsAIeoGAQCyCwAh6wYBALILACGZBwAA_QyZByKaBwEAsgsAIZsHAQCyCwAhnAdAALMLACEVAwAAgA0AIA4AALcQACAZAACBDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCyCwAhlQYQAMILACHLBgEAsAsAIc4GAQCyCwAh0gYQAMILACHUBgEAsgsAIdUGAQCyCwAh6gYBALILACHrBgEAsgsAIZkHAAD9DJkHIpoHAQCyCwAhmwcBALILACGcB0AAswsAIRUDAACNDQAgDgAAuBAAIBkAAI4NACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAZkHAAAAmQcCmgcBAAAAAZsHAQAAAAGcB0AAAAABBAMAAMAQACCNBhAAAAABkAYBAAAAAZ4GQAAAAAECAAAACQAgSQAAiBEAIAMAAAAJACBJAACIEQAgSgAAhxEAIAFCAACVFAAwCgMAAOYKACAKAACACwAg9QUAAKgLADD2BQAABwAQ9wUAAKgLADCNBhAA3woAIZAGAQDyCQAhngZAAPwJACGNBwEA8gkAIbIHAACnCwAgAgAAAAkAIEIAAIcRACACAAAAhREAIEIAAIYRACAH9QUAAIQRADD2BQAAhREAEPcFAACEEQAwjQYQAN8KACGQBgEA8gkAIZ4GQAD8CQAhjQcBAPIJACEH9QUAAIQRADD2BQAAhREAEPcFAACEEQAwjQYQAN8KACGQBgEA8gkAIZ4GQAD8CQAhjQcBAPIJACEDjQYQALELACGQBgEAsAsAIZ4GQACzCwAhBAMAAL4QACCNBhAAsQsAIZAGAQCwCwAhngZAALMLACEEAwAAwBAAII0GEAAAAAGQBgEAAAABngZAAAAAAQKNBhAAAAABngZAAAAAAQIAAAAZACBJAACUEQAgAwAAABkAIEkAAJQRACBKAACTEQAgAUIAAJQUADAHCgAAgAsAIPUFAACdCwAw9gUAABcAEPcFAACdCwAwjQYQAN8KACGeBkAA_AkAIY0HAQAAAAECAAAAGQAgQgAAkxEAIAIAAACREQAgQgAAkhEAIAb1BQAAkBEAMPYFAACREQAQ9wUAAJARADCNBhAA3woAIZ4GQAD8CQAhjQcBAPIJACEG9QUAAJARADD2BQAAkREAEPcFAACQEQAwjQYQAN8KACGeBkAA_AkAIY0HAQDyCQAhAo0GEACxCwAhngZAALMLACECjQYQALELACGeBkAAswsAIQKNBhAAAAABngZAAAAAAQNJAACSFAAgtQcAAJMUACC7BwAADQAgBEkAAIkRADC1BwAAihEAMLcHAACMEQAguwcAAI0RADAESQAA_RAAMLUHAAD-EAAwtwcAAIARACC7BwAAgREAMARJAAD0EAAwtQcAAPUQADC3BwAA9xAAILsHAAD3DAAwBEkAAOgQADC1BwAA6RAAMLcHAADrEAAguwcAAOwQADAESQAA3xAAMLUHAADgEAAwtwcAAOIQACC7BwAA2A0AMARJAADTEAAwtQcAANQQADC3BwAA1hAAILsHAADXEAAwAAAAAAAFSQAAiRQAIEoAAJAUACC1BwAAihQAILYHAACPFAAguwcAAKcCACAFSQAAhxQAIEoAAI0UACC1BwAAiBQAILYHAACMFAAguwcAAMACACALSQAApBEAMEoAAKkRADC1BwAApREAMLYHAACmEQAwtwcAAKcRACC4BwAAqBEAMLkHAACoEQAwugcAAKgRADC7BwAAqBEAMLwHAACqEQAwvQcAAKsRADAICwAAlhEAIAwAAJcRACANAACYEQAgHQAAmREAIB4AAJoRACAfAACbEQAg-AUBAAAAAZ4HAQAAAAECAAAAFAAgSQAArxEAIAMAAAAUACBJAACvEQAgSgAArhEAIAFCAACLFAAwDgkAAKALACALAAChCwAgDAAAyAoAIA0AAI8KACAdAADJCgAgHgAAygoAIB8AAMsKACD1BQAAnwsAMPYFAAASABD3BQAAnwsAMPgFAQAAAAGdBwEA8gkAIZ4HAQDyCQAhsAcAAJ4LACACAAAAFAAgQgAArhEAIAIAAACsEQAgQgAArREAIAb1BQAAqxEAMPYFAACsEQAQ9wUAAKsRADD4BQEA8gkAIZ0HAQDyCQAhngcBAPIJACEG9QUAAKsRADD2BQAArBEAEPcFAACrEQAw-AUBAPIJACGdBwEA8gkAIZ4HAQDyCQAhAvgFAQCwCwAhngcBALALACEICwAAzRAAIAwAAM4QACANAADPEAAgHQAA0BAAIB4AANEQACAfAADSEAAg-AUBALALACGeBwEAsAsAIQgLAACWEQAgDAAAlxEAIA0AAJgRACAdAACZEQAgHgAAmhEAIB8AAJsRACD4BQEAAAABngcBAAAAAQNJAACJFAAgtQcAAIoUACC7BwAApwIAIANJAACHFAAgtQcAAIgUACC7BwAAwAIAIARJAACkEQAwtQcAAKURADC3BwAApxEAILsHAACoEQAwAAAAC0kAALcRADBKAAC8EQAwtQcAALgRADC2BwAAuREAMLcHAAC6EQAguAcAALsRADC5BwAAuxEAMLoHAAC7EQAwuwcAALsRADC8BwAAvREAML0HAAC-EQAwCAYAALARACAIAACyEQAg-AUBAAAAAZ8GAQAAAAHXBgEAAAAB3AYgAAAAAYkHgAAAAAGgBxAAAAABAgAAAA0AIEkAAMIRACADAAAADQAgSQAAwhEAIEoAAMERACABQgAAhhQAMA4GAACkCwAgBwAApQsAIAgAAKYLACD1BQAAowsAMPYFAAALABD3BQAAowsAMPgFAQAAAAGfBgEA8gkAIdcGAQDyCQAh3AYgAPsJACGJBwAA7woAIJ8HAQDyCQAhoAcQAOMKACGxBwAAogsAIAIAAAANACBCAADBEQAgAgAAAL8RACBCAADAEQAgCvUFAAC-EQAw9gUAAL8RABD3BQAAvhEAMPgFAQDyCQAhnwYBAPIJACHXBgEA8gkAIdwGIAD7CQAhiQcAAO8KACCfBwEA8gkAIaAHEADjCgAhCvUFAAC-EQAw9gUAAL8RABD3BQAAvhEAMPgFAQDyCQAhnwYBAPIJACHXBgEA8gkAIdwGIAD7CQAhiQcAAO8KACCfBwEA8gkAIaAHEADjCgAhBvgFAQCwCwAhnwYBALALACHXBgEAsAsAIdwGIAD9CwAhiQeAAAAAAaAHEADCCwAhCAYAAKERACAIAACjEQAg-AUBALALACGfBgEAsAsAIdcGAQCwCwAh3AYgAP0LACGJB4AAAAABoAcQAMILACEIBgAAsBEAIAgAALIRACD4BQEAAAABnwYBAAAAAdcGAQAAAAHcBiAAAAABiQeAAAAAAaAHEAAAAAEESQAAtxEAMLUHAAC4EQAwtwcAALoRACC7BwAAuxEAMAAAAAALSQAAyREAMEoAAM0RADC1BwAAyhEAMLYHAADLEQAwtwcAAMwRACC4BwAAuxEAMLkHAAC7EQAwugcAALsRADC7BwAAuxEAMLwHAADOEQAwvQcAAL4RADAIBwAAsREAIAgAALIRACD4BQEAAAABnwYBAAAAAdwGIAAAAAGJB4AAAAABnwcBAAAAAaAHEAAAAAECAAAADQAgSQAA0REAIAMAAAANACBJAADREQAgSgAA0BEAIAFCAACFFAAwAgAAAA0AIEIAANARACACAAAAvxEAIEIAAM8RACAG-AUBALALACGfBgEAsAsAIdwGIAD9CwAhiQeAAAAAAZ8HAQCwCwAhoAcQAMILACEIBwAAohEAIAgAAKMRACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACGJB4AAAAABnwcBALALACGgBxAAwgsAIQgHAACxEQAgCAAAshEAIPgFAQAAAAGfBgEAAAAB3AYgAAAAAYkHgAAAAAGfBwEAAAABoAcQAAAAAQRJAADJEQAwtQcAAMoRADC3BwAAzBEAILsHAAC7EQAwAAAAAbgHAAAAowcCC0kAAPsSADBKAAD_EgAwtQcAAPwSADC2BwAA_RIAMLcHAAD-EgAguAcAAIERADC5BwAAgREAMLoHAACBEQAwuwcAAIERADC8BwAAgBMAML0HAACEEQAwC0kAAPISADBKAAD2EgAwtQcAAPMSADC2BwAA9BIAMLcHAAD1EgAguAcAAPcMADC5BwAA9wwAMLoHAAD3DAAwuwcAAPcMADC8BwAA9xIAML0HAAD6DAAwC0kAAOkSADBKAADtEgAwtQcAAOoSADC2BwAA6xIAMLcHAADsEgAguAcAAOwQADC5BwAA7BAAMLoHAADsEAAwuwcAAOwQADC8BwAA7hIAML0HAADvEAAwC0kAAOASADBKAADkEgAwtQcAAOESADC2BwAA4hIAMLcHAADjEgAguAcAAOwQADC5BwAA7BAAMLoHAADsEAAwuwcAAOwQADC8BwAA5RIAML0HAADvEAAwC0kAANcSADBKAADbEgAwtQcAANgSADC2BwAA2RIAMLcHAADaEgAguAcAANgNADC5BwAA2A0AMLoHAADYDQAwuwcAANgNADC8BwAA3BIAML0HAADbDQAwC0kAAM4SADBKAADSEgAwtQcAAM8SADC2BwAA0BIAMLcHAADREgAguAcAANcQADC5BwAA1xAAMLoHAADXEAAwuwcAANcQADC8BwAA0xIAML0HAADaEAAwC0kAAMUSADBKAADJEgAwtQcAAMYSADC2BwAAxxIAMLcHAADIEgAguAcAAOQPADC5BwAA5A8AMLoHAADkDwAwuwcAAOQPADC8BwAAyhIAML0HAADnDwAwC0kAALwSADBKAADAEgAwtQcAAL0SADC2BwAAvhIAMLcHAAC_EgAguAcAAKgPADC5BwAAqA8AMLoHAACoDwAwuwcAAKgPADC8BwAAwRIAML0HAACrDwAwC0kAALMSADBKAAC3EgAwtQcAALQSADC2BwAAtRIAMLcHAAC2EgAguAcAAOgNADC5BwAA6A0AMLoHAADoDQAwuwcAAOgNADC8BwAAuBIAML0HAADrDQAwC0kAAKoSADBKAACuEgAwtQcAAKsSADC2BwAArBIAMLcHAACtEgAguAcAAOcMADC5BwAA5wwAMLoHAADnDAAwuwcAAOcMADC8BwAArxIAML0HAADqDAAwC0kAAJ4SADBKAACjEgAwtQcAAJ8SADC2BwAAoBIAMLcHAAChEgAguAcAAKISADC5BwAAohIAMLoHAACiEgAwuwcAAKISADC8BwAApBIAML0HAAClEgAwC0kAAJUSADBKAACZEgAwtQcAAJYSADC2BwAAlxIAMLcHAACYEgAguAcAAMYMADC5BwAAxgwAMLoHAADGDAAwuwcAAMYMADC8BwAAmhIAML0HAADJDAAwC0kAAIwSADBKAACQEgAwtQcAAI0SADC2BwAAjhIAMLcHAACPEgAguAcAAIsQADC5BwAAixAAMLoHAACLEAAwuwcAAIsQADC8BwAAkRIAML0HAACOEAAwC0kAAIMSADBKAACHEgAwtQcAAIQSADC2BwAAhRIAMLcHAACGEgAguAcAAPkPADC5BwAA-Q8AMLoHAAD5DwAwuwcAAPkPADC8BwAAiBIAML0HAAD8DwAwC0kAAPoRADBKAAD-EQAwtQcAAPsRADC2BwAA_BEAMLcHAAD9EQAguAcAAKwNADC5BwAArA0AMLoHAACsDQAwuwcAAKwNADC8BwAA_xEAML0HAACvDQAwC0kAAPERADBKAAD1EQAwtQcAAPIRADC2BwAA8xEAMLcHAAD0EQAguAcAANsMADC5BwAA2wwAMLoHAADbDAAwuwcAANsMADC8BwAA9hEAML0HAADeDAAwC0kAAOgRADBKAADsEQAwtQcAAOkRADC2BwAA6hEAMLcHAADrEQAguAcAAO4LADC5BwAA7gsAMLoHAADuCwAwuwcAAO4LADC8BwAA7REAML0HAADxCwAwEy0AAOQLACA1AADhCwAgNwAA4wsAIPgFAQAAAAH_BUAAAAABjwYBAAAAAZEGAQAAAAGSBgEAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGEAAAAAGZBgAAAJkGApoGQAAAAAGbBkAAAAABnAYQAAAAAZ0GEAAAAAGeBkAAAAABAgAAAKwBACBJAADwEQAgAwAAAKwBACBJAADwEQAgSgAA7xEAIAFCAACEFAAwAgAAAKwBACBCAADvEQAgAgAAAPILACBCAADuEQAgEPgFAQCwCwAh_wVAALMLACGPBgEAsAsAIZEGAQCyCwAhkgYBALILACGTBgEAsgsAIZQGAQCyCwAhlQYQAMILACGWBhAAwgsAIZcGEADCCwAhmQYAAMMLmQYimgZAAMQLACGbBkAAxAsAIZwGEACxCwAhnQYQALELACGeBkAAswsAIRMtAADICwAgNQAAxQsAIDcAAMcLACD4BQEAsAsAIf8FQACzCwAhjwYBALALACGRBgEAsgsAIZIGAQCyCwAhkwYBALILACGUBgEAsgsAIZUGEADCCwAhlgYQAMILACGXBhAAwgsAIZkGAADDC5kGIpoGQADECwAhmwZAAMQLACGcBhAAsQsAIZ0GEACxCwAhngZAALMLACETLQAA5AsAIDUAAOELACA3AADjCwAg-AUBAAAAAf8FQAAAAAGPBgEAAAABkQYBAAAAAZIGAQAAAAGTBgEAAAABlAYBAAAAAZUGEAAAAAGWBhAAAAABlwYQAAAAAZkGAAAAmQYCmgZAAAAAAZsGQAAAAAGcBhAAAAABnQYQAAAAAZ4GQAAAAAEXDgAArgwAIBEAAK8MACAYAACwDAAg-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzAYBAAAAAc0GAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAECAAAAKAAgSQAA-REAIAMAAAAoACBJAAD5EQAgSgAA-BEAIAFCAACDFAAwAgAAACgAIEIAAPgRACACAAAA3wwAIEIAAPcRACAU-AUBALALACH-BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIcgGAQCwCwAhyQYBALILACHKBgEAsAsAIcsGAQCyCwAhzAYBALILACHNBgEAsgsAIc4GAQCyCwAhzwYCAIkMACHQBhAAsQsAIdEGEACxCwAh0gYQALELACHTBgEAsgsAIdQGAQCyCwAh1QYBALILACHWBkAAswsAIRcOAACqDAAgEQAAqwwAIBgAAKwMACD4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhyAYBALALACHJBgEAsgsAIcoGAQCwCwAhywYBALILACHMBgEAsgsAIc0GAQCyCwAhzgYBALILACHPBgIAiQwAIdAGEACxCwAh0QYQALELACHSBhAAsQsAIdMGAQCyCwAh1AYBALILACHVBgEAsgsAIdYGQACzCwAhFw4AAK4MACARAACvDAAgGAAAsAwAIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAAByAYBAAAAAckGAQAAAAHKBgEAAAABywYBAAAAAcwGAQAAAAHNBgEAAAABzgYBAAAAAc8GAgAAAAHQBhAAAAAB0QYQAAAAAdIGEAAAAAHTBgEAAAAB1AYBAAAAAdUGAQAAAAHWBkAAAAABBw8AAJ8MACAyAACgDAAg-AUBAAAAAbYGAQAAAAG3BkAAAAABuAaAAAAAAbkGQAAAAAECAAAAogEAIEkAAIISACADAAAAogEAIEkAAIISACBKAACBEgAgAUIAAIIUADACAAAAogEAIEIAAIESACACAAAAsA0AIEIAAIASACAF-AUBALALACG2BgEAsAsAIbcGQACzCwAhuAaAAAAAAbkGQACzCwAhBw8AAJAMACAyAACRDAAg-AUBALALACG2BgEAsAsAIbcGQACzCwAhuAaAAAAAAbkGQACzCwAhBw8AAJ8MACAyAACgDAAg-AUBAAAAAbYGAQAAAAG3BkAAAAABuAaAAAAAAbkGQAAAAAELEgAAsA8AIBQAALIPACAVAACzDwAgFgAAtA8AIPgFAQAAAAHKBgEAAAABhAcBAAAAAYUHAQAAAAGGBwEAAAABhwcAAACCBwKJB4AAAAABAgAAAEQAIEkAAIsSACADAAAARAAgSQAAixIAIEoAAIoSACABQgAAgRQAMAIAAABEACBCAACKEgAgAgAAAP0PACBCAACJEgAgB_gFAQCwCwAhygYBALILACGEBwEAsAsAIYUHAQCwCwAhhgcBALILACGHBwAAgg-CByKJB4AAAAABCxIAAIoPACAUAACMDwAgFQAAjQ8AIBYAAI4PACD4BQEAsAsAIcoGAQCyCwAhhAcBALALACGFBwEAsAsAIYYHAQCyCwAhhwcAAIIPggciiQeAAAAAAQsSAACwDwAgFAAAsg8AIBUAALMPACAWAAC0DwAg-AUBAAAAAcoGAQAAAAGEBwEAAAABhQcBAAAAAYYHAQAAAAGHBwAAAIIHAokHgAAAAAENEgAA7A8AIBQAAO4PACAVAADvDwAgFgAA8A8AIPgFAQAAAAGfBgEAAAABygYBAAAAAYUHAQAAAAGHBwAAAIIHAokHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAECAAAALwAgSQAAlBIAIAMAAAAvACBJAACUEgAgSgAAkxIAIAFCAACAFAAwAgAAAC8AIEIAAJMSACACAAAAjxAAIEIAAJISACAJ-AUBALALACGfBgEAsAsAIcoGAQCyCwAhhQcBALALACGHBwAAgg-CByKJB4AAAAABigcBALALACGLBwEAsgsAIYwHAQCyCwAhDRIAAMYPACAUAADIDwAgFQAAyQ8AIBYAAMoPACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGFBwEAsAsAIYcHAACCD4IHIokHgAAAAAGKBwEAsAsAIYsHAQCyCwAhjAcBALILACENEgAA7A8AIBQAAO4PACAVAADvDwAgFgAA8A8AIPgFAQAAAAGfBgEAAAABygYBAAAAAYUHAQAAAAGHBwAAAIIHAokHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAEQBgAAuwwAIA8AAL0MACAaAAC8DAAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkgYBAAAAAbYGAQAAAAHXBgEAAAAB2AYBAAAAAdkGAQAAAAHaBkAAAAAB2wYBAAAAAQIAAABbACBJAACdEgAgAwAAAFsAIEkAAJ0SACBKAACcEgAgAUIAAP8TADACAAAAWwAgQgAAnBIAIAIAAADKDAAgQgAAmxIAIA34BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGSBgEAsgsAIbYGAQCyCwAh1wYBALALACHYBgEAsgsAIdkGAQCyCwAh2gZAALMLACHbBgEAsgsAIRAGAAC3DAAgDwAAuQwAIBoAALgMACD4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGSBgEAsgsAIbYGAQCyCwAh1wYBALALACHYBgEAsgsAIdkGAQCyCwAh2gZAALMLACHbBgEAsgsAIRAGAAC7DAAgDwAAvQwAIBoAALwMACD4BQEAAAAB-gUQAAAAAfsFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGSBgEAAAABtgYBAAAAAdcGAQAAAAHYBgEAAAAB2QYBAAAAAdoGQAAAAAHbBgEAAAABFBAAAPoNACAZAAD5DQAgHgAA9w0AICYAAPYNACAzAAD7DQAgOAAA9Q0AIDoAAPgNACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABtwZAAAAAAdUGAQAAAAHgBgEAAAAB4QYBAAAAAeIGAQAAAAHjBgEAAAAB5AYBAAAAAeUGAQAAAAHmBoAAAAABAgAAAAUAIEkAAKkSACADAAAABQAgSQAAqRIAIEoAAKgSACABQgAA_hMAMBkDAADmCgAgEAAAkAoAIBkAAIwKACAeAADKCgAgJgAAzgoAIDMAANAKACA4AADbCgAgOgAA2AoAIPUFAACpCwAw9gUAAAMAEPcFAACpCwAw-AUBAAAAAf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgAgAAAAUAIEIAAKgSACACAAAAphIAIEIAAKcSACAR9QUAAKUSADD2BQAAphIAEPcFAAClEgAw-AUBAPIJACH_BUAA_AkAIYAGAQDzCQAhgQYBAPMJACGQBgEA8gkAIbcGQAD8CQAh1QYBAPMJACHgBgEA8gkAIeEGAQDzCQAh4gYBAPMJACHjBgEA8wkAIeQGAQDzCQAh5QYBAPMJACHmBgAA7woAIBH1BQAApRIAMPYFAACmEgAQ9wUAAKUSADD4BQEA8gkAIf8FQAD8CQAhgAYBAPMJACGBBgEA8wkAIZAGAQDyCQAhtwZAAPwJACHVBgEA8wkAIeAGAQDyCQAh4QYBAPMJACHiBgEA8wkAIeMGAQDzCQAh5AYBAPMJACHlBgEA8wkAIeYGAADvCgAgDfgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhtwZAALMLACHVBgEAsgsAIeAGAQCwCwAh4QYBALILACHiBgEAsgsAIeMGAQCyCwAh5AYBALILACHlBgEAsgsAIeYGgAAAAAEUEAAApg0AIBkAAKUNACAeAACjDQAgJgAAog0AIDMAAKcNACA4AAChDQAgOgAApA0AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhtwZAALMLACHVBgEAsgsAIeAGAQCwCwAh4QYBALILACHiBgEAsgsAIeMGAQCyCwAh5AYBALILACHlBgEAsgsAIeYGgAAAAAEUEAAA-g0AIBkAAPkNACAeAAD3DQAgJgAA9g0AIDMAAPsNACA4AAD1DQAgOgAA-A0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAG3BkAAAAAB1QYBAAAAAeAGAQAAAAHhBgEAAAAB4gYBAAAAAeMGAQAAAAHkBgEAAAAB5QYBAAAAAeYGgAAAAAEQDgAAvg0AIA8AAPIMACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABtQZAAAAAAbYGAQAAAAHLBgEAAAAB0gYQAAAAAdsGAQAAAAHnBhAAAAAB6AYBAAAAAekGEAAAAAHqBgEAAAAB6wYBAAAAAQIAAAAjACBJAACyEgAgAwAAACMAIEkAALISACBKAACxEgAgAUIAAP0TADACAAAAIwAgQgAAsRIAIAIAAADrDAAgQgAAsBIAIA74BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIbUGQACzCwAhtgYBALILACHLBgEAsAsAIdIGEACxCwAh2wYBALILACHnBhAAsQsAIegGAQCwCwAh6QYQALELACHqBgEAsgsAIesGAQCyCwAhEA4AALwNACAPAADvDAAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACG1BkAAswsAIbYGAQCyCwAhywYBALALACHSBhAAsQsAIdsGAQCyCwAh5wYQALELACHoBgEAsAsAIekGEACxCwAh6gYBALILACHrBgEAsgsAIRAOAAC-DQAgDwAA8gwAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAG1BkAAAAABtgYBAAAAAcsGAQAAAAHSBhAAAAAB2wYBAAAAAecGEAAAAAHoBgEAAAAB6QYQAAAAAeoGAQAAAAHrBgEAAAABCg8AALcOACAnAADyDQAg-AUBAAAAAf8FQAAAAAGOBkAAAAABtgYBAAAAAewGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAECAAAAfwAgSQAAuxIAIAMAAAB_ACBJAAC7EgAgSgAAuhIAIAFCAAD8EwAwAgAAAH8AIEIAALoSACACAAAA7A0AIEIAALkSACAI-AUBALALACH_BUAAswsAIY4GQACzCwAhtgYBALILACHsBgEAsAsAIfcGIAD9CwAh-AYQAMILACH5BhAAwgsAIQoPAAC2DgAgJwAA7w0AIPgFAQCwCwAh_wVAALMLACGOBkAAswsAIbYGAQCyCwAh7AYBALALACH3BiAA_QsAIfgGEADCCwAh-QYQAMILACEKDwAAtw4AICcAAPINACD4BQEAAAAB_wVAAAAAAY4GQAAAAAG2BgEAAAAB7AYBAAAAAfcGIAAAAAH4BhAAAAAB-QYQAAAAAQgYAACFDwAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAc0GAQAAAAGCBwAAAIIHAoMHQAAAAAECAAAASgAgSQAAxBIAIAMAAABKACBJAADEEgAgSgAAwxIAIAFCAAD7EwAwAgAAAEoAIEIAAMMSACACAAAArA8AIEIAAMISACAH-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACHNBgEAsAsAIYIHAACCD4IHIoMHQACzCwAhCBgAAIMPACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIc0GAQCwCwAhggcAAIIPggcigwdAALMLACEIGAAAhQ8AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHNBgEAAAABggcAAACCBwKDB0AAAAABCBEAAMEPACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzAYBAAAAAYIHAAAAggcCgwdAAAAAAQIAAAA2ACBJAADNEgAgAwAAADYAIEkAAM0SACBKAADMEgAgAUIAAPoTADACAAAANgAgQgAAzBIAIAIAAADoDwAgQgAAyxIAIAf4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIcwGAQCwCwAhggcAAIIPggcigwdAALMLACEIEQAAvw8AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhzAYBALALACGCBwAAgg-CByKDB0AAswsAIQgRAADBDwAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAcwGAQAAAAGCBwAAAIIHAoMHQAAAAAEKCgAAnhAAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAAB1QYBAAAAAf4GAAAAjwcCjQcBAAAAAY8HQAAAAAECAAAAbgAgSQAA1hIAIAMAAABuACBJAADWEgAgSgAA1RIAIAFCAAD5EwAwAgAAAG4AIEIAANUSACACAAAA2xAAIEIAANQSACAJ-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIdUGAQCyCwAh_gYAAJoQjwcijQcBALALACGPB0AAswsAIQoKAACcEAAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIdUGAQCyCwAh_gYAAJoQjwcijQcBALALACGPB0AAswsAIQoKAACeEAAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAHVBgEAAAAB_gYAAACPBwKNBwEAAAABjwdAAAAAAQ4KAADjDQAgDwAApRAAIPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAbYGAQAAAAHVBgEAAAAB2wYBAAAAAY0HAQAAAAGQBwEAAAABkQdAAAAAAQIAAABpACBJAADfEgAgAwAAAGkAIEkAAN8SACBKAADeEgAgAUIAAPgTADACAAAAaQAgQgAA3hIAIAIAAADcDQAgQgAA3RIAIAz4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACG2BgEAsgsAIdUGAQCyCwAh2wYBALILACGNBwEAsAsAIZAHAQCyCwAhkQdAALMLACEOCgAA4A0AIA8AAKQQACD4BQEAsAsAIf4FAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhjQYQALELACG2BgEAsgsAIdUGAQCyCwAh2wYBALILACGNBwEAsAsAIZAHAQCyCwAhkQdAALMLACEOCgAA4w0AIA8AAKUQACD4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAG2BgEAAAAB1QYBAAAAAdsGAQAAAAGNBwEAAAABkAcBAAAAAZEHQAAAAAEPCgAArxAAIBsAALAQACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzgYBAAAAAdUGAQAAAAH-BgAAAJMHAoMHQAAAAAGNBwEAAAABkwcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQIAAABkACBJAADoEgAgAwAAAGQAIEkAAOgSACBKAADnEgAgAUIAAPcTADACAAAAZAAgQgAA5xIAIAIAAADwEAAgQgAA5hIAIA34BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIc4GAQCyCwAh1QYBALILACH-BgAAqxCTByKDB0AAswsAIY0HAQCwCwAhkwcBALILACGVBxAAsQsAIZYHEADCCwAhlwcBALILACEPCgAArBAAIBsAAK0QACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIc4GAQCyCwAh1QYBALILACH-BgAAqxCTByKDB0AAswsAIY0HAQCwCwAhkwcBALILACGVBxAAsQsAIZYHEADCCwAhlwcBALILACEPCgAArxAAIBsAALAQACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzgYBAAAAAdUGAQAAAAH-BgAAAJMHAoMHQAAAAAGNBwEAAAABkwcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQ8KAACvEAAgHAAAsRAAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAY0HAQAAAAGUBwEAAAABlQcQAAAAAZYHEAAAAAGXBwEAAAABAgAAAGQAIEkAAPESACADAAAAZAAgSQAA8RIAIEoAAPASACABQgAA9hMAMAIAAABkACBCAADwEgAgAgAAAPAQACBCAADvEgAgDfgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhzgYBALILACHVBgEAsgsAIf4GAACrEJMHIoMHQACzCwAhjQcBALALACGUBwEAsAsAIZUHEACxCwAhlgcQAMILACGXBwEAsgsAIQ8KAACsEAAgHAAArhAAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhzgYBALILACHVBgEAsgsAIf4GAACrEJMHIoMHQACzCwAhjQcBALALACGUBwEAsAsAIZUHEACxCwAhlgcQAMILACGXBwEAsgsAIQ8KAACvEAAgHAAAsRAAIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAY0HAQAAAAGUBwEAAAABlQcQAAAAAZYHEAAAAAGXBwEAAAABFQoAAIwNACAOAAC4EAAgGQAAjg0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABlQYQAAAAAcsGAQAAAAHOBgEAAAAB0gYQAAAAAdQGAQAAAAHVBgEAAAAB6gYBAAAAAesGAQAAAAGNBwEAAAABmQcAAACZBwKaBwEAAAABmwcBAAAAAZwHQAAAAAECAAAAHgAgSQAA-hIAIAMAAAAeACBJAAD6EgAgSgAA-RIAIAFCAAD1EwAwAgAAAB4AIEIAAPkSACACAAAA-wwAIEIAAPgSACAS-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZUGEADCCwAhywYBALALACHOBgEAsgsAIdIGEADCCwAh1AYBALILACHVBgEAsgsAIeoGAQCyCwAh6wYBALILACGNBwEAsAsAIZkHAAD9DJkHIpoHAQCyCwAhmwcBALILACGcB0AAswsAIRUKAAD_DAAgDgAAtxAAIBkAAIENACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhlQYQAMILACHLBgEAsAsAIc4GAQCyCwAh0gYQAMILACHUBgEAsgsAIdUGAQCyCwAh6gYBALILACHrBgEAsgsAIY0HAQCwCwAhmQcAAP0MmQcimgcBALILACGbBwEAsgsAIZwHQACzCwAhFQoAAIwNACAOAAC4EAAgGQAAjg0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABlQYQAAAAAcsGAQAAAAHOBgEAAAAB0gYQAAAAAdQGAQAAAAHVBgEAAAAB6gYBAAAAAesGAQAAAAGNBwEAAAABmQcAAACZBwKaBwEAAAABmwcBAAAAAZwHQAAAAAEECgAAwRAAII0GEAAAAAGeBkAAAAABjQcBAAAAAQIAAAAJACBJAACDEwAgAwAAAAkAIEkAAIMTACBKAACCEwAgAUIAAPQTADACAAAACQAgQgAAghMAIAIAAACFEQAgQgAAgRMAIAONBhAAsQsAIZ4GQACzCwAhjQcBALALACEECgAAvxAAII0GEACxCwAhngZAALMLACGNBwEAsAsAIQQKAADBEAAgjQYQAAAAAZ4GQAAAAAGNBwEAAAABBEkAAPsSADC1BwAA_BIAMLcHAAD-EgAguwcAAIERADAESQAA8hIAMLUHAADzEgAwtwcAAPUSACC7BwAA9wwAMARJAADpEgAwtQcAAOoSADC3BwAA7BIAILsHAADsEAAwBEkAAOASADC1BwAA4RIAMLcHAADjEgAguwcAAOwQADAESQAA1xIAMLUHAADYEgAwtwcAANoSACC7BwAA2A0AMARJAADOEgAwtQcAAM8SADC3BwAA0RIAILsHAADXEAAwBEkAAMUSADC1BwAAxhIAMLcHAADIEgAguwcAAOQPADAESQAAvBIAMLUHAAC9EgAwtwcAAL8SACC7BwAAqA8AMARJAACzEgAwtQcAALQSADC3BwAAthIAILsHAADoDQAwBEkAAKoSADC1BwAAqxIAMLcHAACtEgAguwcAAOcMADAESQAAnhIAMLUHAACfEgAwtwcAAKESACC7BwAAohIAMARJAACVEgAwtQcAAJYSADC3BwAAmBIAILsHAADGDAAwBEkAAIwSADC1BwAAjRIAMLcHAACPEgAguwcAAIsQADAESQAAgxIAMLUHAACEEgAwtwcAAIYSACC7BwAA-Q8AMARJAAD6EQAwtQcAAPsRADC3BwAA_REAILsHAACsDQAwBEkAAPERADC1BwAA8hEAMLcHAAD0EQAguwcAANsMADAESQAA6BEAMLUHAADpEQAwtwcAAOsRACC7BwAA7gsAMAAAAAAAAAAAAAAAAAVJAADvEwAgSgAA8hMAILUHAADwEwAgtgcAAPETACC7BwAAAQAgA0kAAO8TACC1BwAA8BMAILsHAAABACAAAAABuAcAAACtBwILSQAAvxMAMEoAAMMTADC1BwAAwBMAMLYHAADBEwAwtwcAAMITACC4BwAAohIAMLkHAACiEgAwugcAAKISADC7BwAAohIAMLwHAADEEwAwvQcAAKUSADALSQAAthMAMEoAALoTADC1BwAAtxMAMLYHAAC4EwAwtwcAALkTACC4BwAAzA0AMLkHAADMDQAwugcAAMwNADC7BwAAzA0AMLwHAAC7EwAwvQcAAM8NADALSQAAqhMAMEoAAK8TADC1BwAAqxMAMLYHAACsEwAwtwcAAK0TACC4BwAArhMAMLkHAACuEwAwugcAAK4TADC7BwAArhMAMLwHAACwEwAwvQcAALETADAI-AUBAAAAAZAGAQAAAAGkB0AAAAABpgcBAAAAAacHAQAAAAGoBwEAAAABqQcBAAAAAaoHAQAAAAECAAAA3QEAIEkAALUTACADAAAA3QEAIEkAALUTACBKAAC0EwAgAUIAAO4TADANOwAA2woAIPUFAADaCgAw9gUAANsBABD3BQAA2goAMPgFAQAAAAGQBgEA8wkAIaQHQAD8CQAhpQcBAPIJACGmBwEA8gkAIacHAQDyCQAhqAcBAPIJACGpBwEA8wkAIaoHAQDzCQAhAgAAAN0BACBCAAC0EwAgAgAAALITACBCAACzEwAgDPUFAACxEwAw9gUAALITABD3BQAAsRMAMPgFAQDyCQAhkAYBAPMJACGkB0AA_AkAIaUHAQDyCQAhpgcBAPIJACGnBwEA8gkAIagHAQDyCQAhqQcBAPMJACGqBwEA8wkAIQz1BQAAsRMAMPYFAACyEwAQ9wUAALETADD4BQEA8gkAIZAGAQDzCQAhpAdAAPwJACGlBwEA8gkAIaYHAQDyCQAhpwcBAPIJACGoBwEA8gkAIakHAQDzCQAhqgcBAPMJACEI-AUBALALACGQBgEAsgsAIaQHQACzCwAhpgcBALALACGnBwEAsAsAIagHAQCwCwAhqQcBALILACGqBwEAsgsAIQj4BQEAsAsAIZAGAQCyCwAhpAdAALMLACGmBwEAsAsAIacHAQCwCwAhqAcBALALACGpBwEAsgsAIaoHAQCyCwAhCPgFAQAAAAGQBgEAAAABpAdAAAAAAaYHAQAAAAGnBwEAAAABqAcBAAAAAakHAQAAAAGqBwEAAAABBQ8AAJsNACD4BQEAAAAB_wVAAAAAAbYGAQAAAAHeBgEAAAABAgAAAM8BACBJAAC-EwAgAwAAAM8BACBJAAC-EwAgSgAAvRMAIAFCAADtEwAwAgAAAM8BACBCAAC9EwAgAgAAANANACBCAAC8EwAgBPgFAQCwCwAh_wVAALMLACG2BgEAsAsAId4GAQCwCwAhBQ8AAJkNACD4BQEAsAsAIf8FQACzCwAhtgYBALALACHeBgEAsAsAIQUPAACbDQAg-AUBAAAAAf8FQAAAAAG2BgEAAAAB3gYBAAAAARQDAAD0DQAgEAAA-g0AIBkAAPkNACAeAAD3DQAgJgAA9g0AIDMAAPsNACA6AAD4DQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeEGAQAAAAHiBgEAAAAB4wYBAAAAAeQGAQAAAAHlBgEAAAAB5gaAAAAAAQIAAAAFACBJAADHEwAgAwAAAAUAIEkAAMcTACBKAADGEwAgAUIAAOwTADACAAAABQAgQgAAxhMAIAIAAACmEgAgQgAAxRMAIA34BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtwZAALMLACHVBgEAsgsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABFAMAAKANACAQAACmDQAgGQAApQ0AIB4AAKMNACAmAACiDQAgMwAApw0AIDoAAKQNACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtwZAALMLACHVBgEAsgsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABFAMAAPQNACAQAAD6DQAgGQAA-Q0AIB4AAPcNACAmAAD2DQAgMwAA-w0AIDoAAPgNACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAbcGQAAAAAHVBgEAAAAB4QYBAAAAAeIGAQAAAAHjBgEAAAAB5AYBAAAAAeUGAQAAAAHmBoAAAAABBEkAAL8TADC1BwAAwBMAMLcHAADCEwAguwcAAKISADAESQAAthMAMLUHAAC3EwAwtwcAALkTACC7BwAAzA0AMARJAACqEwAwtQcAAKsTADC3BwAArRMAILsHAACuEwAwAAADLgAAnBMAIDoAAMsTACA8AADMEwAgEAMAANETACAQAACUDQAgGQAAzwwAIB4AAJcTACAmAACbEwAgMwAAnRMAIDgAAM0TACA6AADLEwAggAYAAKoLACCBBgAAqgsAINUGAACqCwAg4QYAAKoLACDiBgAAqgsAIOMGAACqCwAg5AYAAKoLACDlBgAAqgsAIA0DAADREwAgLQAA0xMAIDUAANATACA3AADSEwAgkQYAAKoLACCSBgAAqgsAIJMGAACqCwAglAYAAKoLACCVBgAAqgsAIJYGAACqCwAglwYAAKoLACCaBgAAqgsAIJsGAACqCwAgBjQAAPgLACCgBgAAqgsAIKEGAACqCwAgogYAAKoLACCjBgAAqgsAIKUGAACqCwAgFAwAAJUTACANAACTDQAgEAAAlA0AIBYAAJUNACAZAADPDAAgHgAAlxMAIB8AAJgTACAgAACWEwAgIQAAlhMAICIAAJkTACAjAACaEwAgJgAAmxMAIC4AAJwTACAvAACUEAAgMAAAghAAIDMAAJ0TACA0AAD4CwAgkgYAAKoLACClBgAAqgsAIKMHAACqCwAgAAADAwAA0RMAIA8AAM4TACAyAADVEwAgAAYlAADaEwAgJgAAmxMAICwAANsTACAtAADcEwAg-gYAAKoLACD7BgAAqgsAIAAGJwAA1hMAICsAANcTACD7BQAAqgsAIIAGAACqCwAggQYAAKoLACD1BgAAqgsAIAYnAADWEwAgKQAA1xMAIPwFAACqCwAggAYAAKoLACCBBgAAqgsAIPEGAACqCwAgASQAAPcOACAAAAcJAADnEwAgCwAA6BMAIAwAAJUTACANAACTDQAgHQAAlhMAIB4AAJcTACAfAACYEwAgARkAAM8MACAQAwAA0RMAIAoAAN0TACAOAADmEwAgGQAAzwwAIIAGAACqCwAggQYAAKoLACCQBgAAqgsAIJUGAACqCwAgzgYAAKoLACDSBgAAqgsAINQGAACqCwAg1QYAAKoLACDqBgAAqgsAIOsGAACqCwAgmgcAAKoLACCbBwAAqgsAIAgSAADhEwAgEwAA0RMAIBQAAJoTACAVAADiEwAgFgAAlQ0AIMoGAACqCwAghgcAAKoLACCIBwAAqgsAIAEXAACCEAAgAAkSAADkEwAgEwAA0RMAIBQAAJkTACAVAADlEwAgFgAAlQ0AIMoGAACqCwAgiAcAAKoLACCLBwAAqgsAIIwHAACqCwAgAREAAJQQACAACA0AAJMNACAQAACUDQAgFgAAlQ0AIKAGAACqCwAgoQYAAKoLACCiBgAAqgsAIKMGAACqCwAgpQYAAKoLACAEBgAA6RMAIAcAAOoTACAIAADrEwAgoAcAAKoLACAAAQQAAMQRACABBAAAxBEAIAAN-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeEGAQAAAAHiBgEAAAAB4wYBAAAAAeQGAQAAAAHlBgEAAAAB5gaAAAAAAQT4BQEAAAAB_wVAAAAAAbYGAQAAAAHeBgEAAAABCPgFAQAAAAGQBgEAAAABpAdAAAAAAaYHAQAAAAGnBwEAAAABqAcBAAAAAakHAQAAAAGqBwEAAAABCS4AAMgTACA6AADJEwAg-AUBAAAAAf8FQAAAAAGeBkAAAAABnwYBAAAAAaIGAQAAAAGrBwEAAAABrQcAAACtBwICAAAAAQAgSQAA7xMAIAMAAADjAQAgSQAA7xMAIEoAAPMTACALAAAA4wEAIC4AAKcTACA6AACoEwAgQgAA8xMAIPgFAQCwCwAh_wVAALMLACGeBkAAswsAIZ8GAQCwCwAhogYBALALACGrBwEAsAsAIa0HAACmE60HIgkuAACnEwAgOgAAqBMAIPgFAQCwCwAh_wVAALMLACGeBkAAswsAIZ8GAQCwCwAhogYBALALACGrBwEAsAsAIa0HAACmE60HIgONBhAAAAABngZAAAAAAY0HAQAAAAES-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAY0HAQAAAAGZBwAAAJkHApoHAQAAAAGbBwEAAAABnAdAAAAAAQ34BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzgYBAAAAAdUGAQAAAAH-BgAAAJMHAoMHQAAAAAGNBwEAAAABlAcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQ34BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzgYBAAAAAdUGAQAAAAH-BgAAAJMHAoMHQAAAAAGNBwEAAAABkwcBAAAAAZUHEAAAAAGWBxAAAAABlwcBAAAAAQz4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAG2BgEAAAAB1QYBAAAAAdsGAQAAAAGNBwEAAAABkAcBAAAAAZEHQAAAAAEJ-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAY0GEAAAAAHVBgEAAAAB_gYAAACPBwKNBwEAAAABjwdAAAAAAQf4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzAYBAAAAAYIHAAAAggcCgwdAAAAAAQf4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABzQYBAAAAAYIHAAAAggcCgwdAAAAAAQj4BQEAAAAB_wVAAAAAAY4GQAAAAAG2BgEAAAAB7AYBAAAAAfcGIAAAAAH4BhAAAAAB-QYQAAAAAQ74BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABtQZAAAAAAbYGAQAAAAHLBgEAAAAB0gYQAAAAAdsGAQAAAAHnBhAAAAAB6AYBAAAAAekGEAAAAAHqBgEAAAAB6wYBAAAAAQ34BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABtwZAAAAAAdUGAQAAAAHgBgEAAAAB4QYBAAAAAeIGAQAAAAHjBgEAAAAB5AYBAAAAAeUGAQAAAAHmBoAAAAABDfgFAQAAAAH6BRAAAAAB-wUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZIGAQAAAAG2BgEAAAAB1wYBAAAAAdgGAQAAAAHZBgEAAAAB2gZAAAAAAdsGAQAAAAEJ-AUBAAAAAZ8GAQAAAAHKBgEAAAABhQcBAAAAAYcHAAAAggcCiQeAAAAAAYoHAQAAAAGLBwEAAAABjAcBAAAAAQf4BQEAAAABygYBAAAAAYQHAQAAAAGFBwEAAAABhgcBAAAAAYcHAAAAggcCiQeAAAAAAQX4BQEAAAABtgYBAAAAAbcGQAAAAAG4BoAAAAABuQZAAAAAART4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAcgGAQAAAAHJBgEAAAABygYBAAAAAcsGAQAAAAHMBgEAAAABzQYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAARD4BQEAAAAB_wVAAAAAAY8GAQAAAAGRBgEAAAABkgYBAAAAAZMGAQAAAAGUBgEAAAABlQYQAAAAAZYGEAAAAAGXBhAAAAABmQYAAACZBgKaBkAAAAABmwZAAAAAAZwGEAAAAAGdBhAAAAABngZAAAAAAQb4BQEAAAABnwYBAAAAAdwGIAAAAAGJB4AAAAABnwcBAAAAAaAHEAAAAAEG-AUBAAAAAZ8GAQAAAAHXBgEAAAAB3AYgAAAAAYkHgAAAAAGgBxAAAAABA_gFAQAAAAGfBgEAAAAB3AYgAAAAAQIAAADAAgAgSQAAhxQAIAP4BQEAAAABnwYBAAAAAdwGIAAAAAECAAAApwIAIEkAAIkUACAC-AUBAAAAAZ4HAQAAAAEDAAAAwwIAIEkAAIcUACBKAACOFAAgBQAAAMMCACBCAACOFAAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIQMAAACqAgAgSQAAiRQAIEoAAJEUACAFAAAAqgIAIEIAAJEUACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACED-AUBALALACGfBgEAsAsAIdwGIAD9CwAhCQYAALARACAHAACxEQAg-AUBAAAAAZ8GAQAAAAHXBgEAAAAB3AYgAAAAAYkHgAAAAAGfBwEAAAABoAcQAAAAAQIAAAANACBJAACSFAAgAo0GEAAAAAGeBkAAAAABA40GEAAAAAGQBgEAAAABngZAAAAAARL4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAZkHAAAAmQcCmgcBAAAAAZsHAQAAAAGcB0AAAAABDfgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAHOBgEAAAAB1QYBAAAAAf4GAAAAkwcCgwdAAAAAAZMHAQAAAAGUBwEAAAABlQcQAAAAAZYHEAAAAAGXBwEAAAABDPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAG2BgEAAAAB1QYBAAAAAdsGAQAAAAGQBwEAAAABkQdAAAAAAQn4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB_gYAAACPBwKPB0AAAAABAwAAAAsAIEkAAJIUACBKAACcFAAgCwAAAAsAIAYAAKERACAHAACiEQAgQgAAnBQAIPgFAQCwCwAhnwYBALALACHXBgEAsAsAIdwGIAD9CwAhiQeAAAAAAZ8HAQCwCwAhoAcQAMILACEJBgAAoREAIAcAAKIRACD4BQEAsAsAIZ8GAQCwCwAh1wYBALALACHcBiAA_QsAIYkHgAAAAAGfBwEAsAsAIaAHEADCCwAhCQkAAJURACAMAACXEQAgDQAAmBEAIB0AAJkRACAeAACaEQAgHwAAmxEAIPgFAQAAAAGdBwEAAAABngcBAAAAAQIAAAAUACBJAACdFAAgAwAAABIAIEkAAJ0UACBKAAChFAAgCwAAABIAIAkAAMwQACAMAADOEAAgDQAAzxAAIB0AANAQACAeAADREAAgHwAA0hAAIEIAAKEUACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEJCQAAzBAAIAwAAM4QACANAADPEAAgHQAA0BAAIB4AANEQACAfAADSEAAg-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhCQkAAJURACALAACWEQAgDQAAmBEAIB0AAJkRACAeAACaEQAgHwAAmxEAIPgFAQAAAAGdBwEAAAABngcBAAAAAQIAAAAUACBJAACiFAAgGQ0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAmAACMEwAgLgAAjhMAIC8AAJATACAwAACREwAgMwAAkhMAIDQAAJQTACD4BQEAAAAB_wVAAAAAAZIGAQAAAAGZBgAAAKMHAp4GQAAAAAGfBgEAAAABpQZAAAAAAaEHAQAAAAGjBwEAAAABAgAAAI8CACBJAACkFAAgAwAAABIAIEkAAKIUACBKAACoFAAgCwAAABIAIAkAAMwQACALAADNEAAgDQAAzxAAIB0AANAQACAeAADREAAgHwAA0hAAIEIAAKgUACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEJCQAAzBAAIAsAAM0QACANAADPEAAgHQAA0BAAIB4AANEQACAfAADSEAAg-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhAwAAADIAIEkAAKQUACBKAACrFAAgGwAAADIAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACBCAACrFAAg-AUBALALACH_BUAAswsAIZIGAQCyCwAhmQYAANYRowcingZAALMLACGfBgEAsAsAIaUGQADECwAhoQcBALALACGjBwEAsgsAIRkNAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAg-AUBALALACH_BUAAswsAIZIGAQCyCwAhmQYAANYRowcingZAALMLACGfBgEAsAsAIaUGQADECwAhoQcBALALACGjBwEAsgsAIQoQAACRDQAgFgAAkg0AIPgFAQAAAAGfBgEAAAABoAYBAAAAAaEGAQAAAAGiBgEAAAABowYBAAAAAaUGQAAAAAHdBgAAjw0AIAIAAACcBwAgSQAArBQAIAMAAAAqACBJAACsFAAgSgAAsBQAIAwAAAAqACAQAADVDAAgFgAA1gwAIEIAALAUACD4BQEAsAsAIZ8GAQCwCwAhoAYBALILACGhBgEAsgsAIaIGAQCyCwAhowYBALILACGlBkAAxAsAId0GAADTDAAgChAAANUMACAWAADWDAAg-AUBALALACGfBgEAsAsAIaAGAQCyCwAhoQYBALILACGiBgEAsgsAIaMGAQCyCwAhpQZAAMQLACHdBgAA0wwAIBkMAACEEwAgDQAAhRMAIBAAAI0TACAWAACTEwAgGQAAjxMAIB4AAIgTACAfAACJEwAgIAAAhhMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAAsRQAIBkMAACEEwAgDQAAhRMAIBAAAI0TACAWAACTEwAgGQAAjxMAIB4AAIgTACAfAACJEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAAsxQAIAkJAACVEQAgCwAAlhEAIAwAAJcRACANAACYEQAgHgAAmhEAIB8AAJsRACD4BQEAAAABnQcBAAAAAZ4HAQAAAAECAAAAFAAgSQAAtRQAIAMAAAAyACBJAACxFAAgSgAAuRQAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICIAAN0RACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAgQgAAuRQAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEDAAAAMgAgSQAAsxQAIEoAALwUACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAALwUACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhAwAAABIAIEkAALUUACBKAAC_FAAgCwAAABIAIAkAAMwQACALAADNEAAgDAAAzhAAIA0AAM8QACAeAADREAAgHwAA0hAAIEIAAL8UACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEJCQAAzBAAIAsAAM0QACAMAADOEAAgDQAAzxAAIB4AANEQACAfAADSEAAg-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhFQMAAPQNACAQAAD6DQAgGQAA-Q0AICYAAPYNACAzAAD7DQAgOAAA9Q0AIDoAAPgNACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAbcGQAAAAAHVBgEAAAAB4AYBAAAAAeEGAQAAAAHiBgEAAAAB4wYBAAAAAeQGAQAAAAHlBgEAAAAB5gaAAAAAAQIAAAAFACBJAADAFAAgAwAAAAMAIEkAAMAUACBKAADEFAAgFwAAAAMAIAMAAKANACAQAACmDQAgGQAApQ0AICYAAKINACAzAACnDQAgOAAAoQ0AIDoAAKQNACBCAADEFAAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABFQMAAKANACAQAACmDQAgGQAApQ0AICYAAKINACAzAACnDQAgOAAAoQ0AIDoAAKQNACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtwZAALMLACHVBgEAsgsAIeAGAQCwCwAh4QYBALILACHiBgEAsgsAIeMGAQCyCwAh5AYBALILACHlBgEAsgsAIeYGgAAAAAEJCQAAlREAIAsAAJYRACAMAACXEQAgDQAAmBEAIB0AAJkRACAeAACaEQAg-AUBAAAAAZ0HAQAAAAGeBwEAAAABAgAAABQAIEkAAMUUACAZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgIAAAhhMAICEAAIcTACAiAACKEwAgIwAAixMAICYAAIwTACAuAACOEwAgLwAAkBMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAAMcUACADAAAAEgAgSQAAxRQAIEoAAMsUACALAAAAEgAgCQAAzBAAIAsAAM0QACAMAADOEAAgDQAAzxAAIB0AANAQACAeAADREAAgQgAAyxQAIPgFAQCwCwAhnQcBALALACGeBwEAsAsAIQkJAADMEAAgCwAAzRAAIAwAAM4QACANAADPEAAgHQAA0BAAIB4AANEQACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEDAAAAMgAgSQAAxxQAIEoAAM4UACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAM4UACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhCfgFAQAAAAGfBgEAAAABygYBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAEH-AUBAAAAAcoGAQAAAAGEBwEAAAABhgcBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAEZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAmAACMEwAgLgAAjhMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAANEUACAD-AUBAAAAAZ8GAQAAAAHcBiAAAAABAgAAAI8EACBJAADTFAAgB_gFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABggcAAACCBwKDB0AAAAABBvgFAQAAAAH_BUAAAAAB1QYBAAAAAf4GAQAAAAH_BhAAAAABgAdAAAAAART4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzQYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAAQMAAAAyACBJAADRFAAgSgAA2hQAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgMAAA5BEAIDMAAOURACA0AADnEQAgQgAA2hQAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIDAAAOQRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEDAAAAkgQAIEkAANMUACBKAADdFAAgBQAAAJIEACBCAADdFAAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIRkMAACEEwAgDQAAhRMAIBAAAI0TACAWAACTEwAgGQAAjxMAIB4AAIgTACAfAACJEwAgIAAAhhMAICEAAIcTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAA3hQAIA4SAADsDwAgEwAA7Q8AIBUAAO8PACAWAADwDwAg-AUBAAAAAZ8GAQAAAAHKBgEAAAABhQcBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAECAAAALwAgSQAA4BQAIAMAAAAyACBJAADeFAAgSgAA5BQAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAgQgAA5BQAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEDAAAALAAgSQAA4BQAIEoAAOcUACAQAAAALAAgEgAAxg8AIBMAAMcPACAVAADJDwAgFgAAyg8AIEIAAOcUACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGFBwEAsAsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAYoHAQCwCwAhiwcBALILACGMBwEAsgsAIQ4SAADGDwAgEwAAxw8AIBUAAMkPACAWAADKDwAg-AUBALALACGfBgEAsAsAIcoGAQCyCwAhhQcBALALACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAGKBwEAsAsAIYsHAQCyCwAhjAcBALILACEOEgAA7A8AIBMAAO0PACAUAADuDwAgFgAA8A8AIPgFAQAAAAGfBgEAAAABygYBAAAAAYUHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABigcBAAAAAYsHAQAAAAGMBwEAAAABAgAAAC8AIEkAAOgUACADAAAALAAgSQAA6BQAIEoAAOwUACAQAAAALAAgEgAAxg8AIBMAAMcPACAUAADIDwAgFgAAyg8AIEIAAOwUACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGFBwEAsAsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAYoHAQCwCwAhiwcBALILACGMBwEAsgsAIQ4SAADGDwAgEwAAxw8AIBQAAMgPACAWAADKDwAg-AUBALALACGfBgEAsAsAIcoGAQCyCwAhhQcBALALACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAGKBwEAsAsAIYsHAQCyCwAhjAcBALILACEZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAmAACMEwAgLgAAjhMAIC8AAJATACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAAO0UACAD-AUBAAAAAZ8GAQAAAAHcBiAAAAABAgAAAKgEACBJAADvFAAgB_gFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABggcAAACCBwKDB0AAAAABBvgFAQAAAAH_BUAAAAAB1QYBAAAAAf4GAQAAAAH_BhAAAAABgAdAAAAAART4BQEAAAAB_gUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAHIBgEAAAAByQYBAAAAAcoGAQAAAAHLBgEAAAABzAYBAAAAAc4GAQAAAAHPBgIAAAAB0AYQAAAAAdEGEAAAAAHSBhAAAAAB0wYBAAAAAdQGAQAAAAHVBgEAAAAB1gZAAAAAAQMAAAAyACBJAADtFAAgSgAA9hQAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDMAAOURACA0AADnEQAgQgAA9hQAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEDAAAAqwQAIEkAAO8UACBKAAD5FAAgBQAAAKsEACBCAAD5FAAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIRkMAACEEwAgDQAAhRMAIBAAAI0TACAWAACTEwAgGQAAjxMAIB4AAIgTACAfAACJEwAgIAAAhhMAICEAAIcTACAiAACKEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAA-hQAIAwSAACwDwAgEwAAsQ8AIBUAALMPACAWAAC0DwAg-AUBAAAAAcoGAQAAAAGEBwEAAAABhQcBAAAAAYYHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABAgAAAEQAIEkAAPwUACADAAAAMgAgSQAA-hQAIEoAAIAVACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAIAVACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhAwAAAEEAIEkAAPwUACBKAACDFQAgDgAAAEEAIBIAAIoPACATAACLDwAgFQAAjQ8AIBYAAI4PACBCAACDFQAg-AUBALALACHKBgEAsgsAIYQHAQCwCwAhhQcBALALACGGBwEAsgsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAQwSAACKDwAgEwAAiw8AIBUAAI0PACAWAACODwAg-AUBALALACHKBgEAsgsAIYQHAQCwCwAhhQcBALALACGGBwEAsgsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAQwSAACwDwAgEwAAsQ8AIBQAALIPACAWAAC0DwAg-AUBAAAAAcoGAQAAAAGEBwEAAAABhQcBAAAAAYYHAQAAAAGHBwAAAIIHAogHAQAAAAGJB4AAAAABAgAAAEQAIEkAAIQVACADAAAAQQAgSQAAhBUAIEoAAIgVACAOAAAAQQAgEgAAig8AIBMAAIsPACAUAACMDwAgFgAAjg8AIEIAAIgVACD4BQEAsAsAIcoGAQCyCwAhhAcBALALACGFBwEAsAsAIYYHAQCyCwAhhwcAAIIPggciiAcBALILACGJB4AAAAABDBIAAIoPACATAACLDwAgFAAAjA8AIBYAAI4PACD4BQEAsAsAIcoGAQCyCwAhhAcBALALACGFBwEAsAsAIYYHAQCyCwAhhwcAAIIPggciiAcBALILACGJB4AAAAABBvgFAQAAAAGfBgEAAAAB3AYgAAAAAfoGAQAAAAH7BgEAAAAB_QYQAAAAAQP4BQEAAAABnwYBAAAAAdwGIAAAAAECAAAAzQUAIEkAAIoVACAI-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAbYGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAEI-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAAB9QYBAAAAAfYGQAAAAAEL-AUBAAAAAfwFQAAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGZBgEAAAAB7QYQAAAAAe4GEAAAAAHvBhAAAAAB8AYQAAAAAfEGAQAAAAEDAAAA0AUAIEkAAIoVACBKAACRFQAgBQAAANAFACBCAACRFQAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAhA_gFAQCwCwAhnwYBALALACHcBiAA_QsAIRUDAAD0DQAgEAAA-g0AIBkAAPkNACAeAAD3DQAgMwAA-w0AIDgAAPUNACA6AAD4DQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeAGAQAAAAHhBgEAAAAB4gYBAAAAAeMGAQAAAAHkBgEAAAAB5QYBAAAAAeYGgAAAAAECAAAABQAgSQAAkhUAIAMAAAADACBJAACSFQAgSgAAlhUAIBcAAAADACADAACgDQAgEAAApg0AIBkAAKUNACAeAACjDQAgMwAApw0AIDgAAKENACA6AACkDQAgQgAAlhUAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG3BkAAswsAIdUGAQCyCwAh4AYBALALACHhBgEAsgsAIeIGAQCyCwAh4wYBALILACHkBgEAsgsAIeUGAQCyCwAh5gaAAAAAARUDAACgDQAgEAAApg0AIBkAAKUNACAeAACjDQAgMwAApw0AIDgAAKENACA6AACkDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABCiUAAOIOACAmAADjDgAgLQAA5Q4AIPgFAQAAAAGfBgEAAAAB3AYgAAAAAfoGAQAAAAH7BgEAAAAB_AYBAAAAAf0GEAAAAAECAAAAgwEAIEkAAJcVACAI-AUBAAAAAfoFEAAAAAH9BQEAAAAB_wVAAAAAAYAGAQAAAAHzBgEAAAAB9AZAAAAAAfUGAQAAAAEDAAAAgQEAIEkAAJcVACBKAACcFQAgDAAAAIEBACAlAAC9DgAgJgAAvg4AIC0AAMAOACBCAACcFQAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACEKJQAAvQ4AICYAAL4OACAtAADADgAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACENJwAAlg4AIPgFAQAAAAH8BUAAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABmQYBAAAAAewGAQAAAAHtBhAAAAAB7gYQAAAAAe8GEAAAAAHwBhAAAAAB8QYBAAAAAQIAAACVAQAgSQAAnRUAIAMAAACPAQAgSQAAnRUAIEoAAKEVACAPAAAAjwEAICcAAIYOACBCAAChFQAg-AUBALALACH8BUAAxAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZkGAQCwCwAh7AYBALALACHtBhAAsQsAIe4GEACxCwAh7wYQALELACHwBhAAsQsAIfEGAQCyCwAhDScAAIYOACD4BQEAsAsAIfwFQADECwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhmQYBALALACHsBgEAsAsAIe0GEACxCwAh7gYQALELACHvBhAAsQsAIfAGEACxCwAh8QYBALILACEKJQAA4g4AICYAAOMOACAsAADkDgAg-AUBAAAAAZ8GAQAAAAHcBiAAAAAB-gYBAAAAAfsGAQAAAAH8BgEAAAAB_QYQAAAAAQIAAACDAQAgSQAAohUAIAonAACvDgAg-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAAB7AYBAAAAAfUGAQAAAAH2BkAAAAABAgAAAIkBACBJAACkFQAgAwAAAIcBACBJAACkFQAgSgAAqBUAIAwAAACHAQAgJwAApA4AIEIAAKgVACD4BQEAsAsAIfoFEACxCwAh-wUBALILACH_BUAAswsAIYAGAQCyCwAhgQYBALILACHsBgEAsAsAIfUGAQCyCwAh9gZAALMLACEKJwAApA4AIPgFAQCwCwAh-gUQALELACH7BQEAsgsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIewGAQCwCwAh9QYBALILACH2BkAAswsAIQj4BQEAAAAB-gUQAAAAAf0FAQAAAAH_BUAAAAABgAYBAAAAAfIGAQAAAAH0BkAAAAAB9QYBAAAAAQMAAACBAQAgSQAAohUAIEoAAKwVACAMAAAAgQEAICUAAL0OACAmAAC-DgAgLAAAvw4AIEIAAKwVACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACH6BgEAsgsAIfsGAQCyCwAh_AYBALALACH9BhAAsQsAIQolAAC9DgAgJgAAvg4AICwAAL8OACD4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACH6BgEAsgsAIfsGAQCyCwAh_AYBALALACH9BhAAsQsAIQk6AADJEwAgPAAAyhMAIPgFAQAAAAH_BUAAAAABngZAAAAAAZ8GAQAAAAGiBgEAAAABqwcBAAAAAa0HAAAArQcCAgAAAAEAIEkAAK0VACAZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAmAACMEwAgLwAAkBMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAAK8VACAZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAuAACOEwAgLwAAkBMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAALEVACAKJQAA4g4AICwAAOQOACAtAADlDgAg-AUBAAAAAZ8GAQAAAAHcBiAAAAAB-gYBAAAAAfsGAQAAAAH8BgEAAAAB_QYQAAAAAQIAAACDAQAgSQAAsxUAIAMAAAAyACBJAACxFQAgSgAAtxUAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAgQgAAtxUAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEDAAAAgQEAIEkAALMVACBKAAC6FQAgDAAAAIEBACAlAAC9DgAgLAAAvw4AIC0AAMAOACBCAAC6FQAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACEKJQAAvQ4AICwAAL8OACAtAADADgAg-AUBALALACGfBgEAsAsAIdwGIAD9CwAh-gYBALILACH7BgEAsgsAIfwGAQCwCwAh_QYQALELACEI-AUBAAAAAf8FQAAAAAGOBkAAAAABkAYBAAAAAewGAQAAAAH3BiAAAAAB-AYQAAAAAfkGEAAAAAEJCQAAlREAIAsAAJYRACAMAACXEQAgDQAAmBEAIB0AAJkRACAfAACbEQAg-AUBAAAAAZ0HAQAAAAGeBwEAAAABAgAAABQAIEkAALwVACAZDAAAhBMAIA0AAIUTACAQAACNEwAgFgAAkxMAIBkAAI8TACAfAACJEwAgIAAAhhMAICEAAIcTACAiAACKEwAgIwAAixMAICYAAIwTACAuAACOEwAgLwAAkBMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAAL4VACADAAAAEgAgSQAAvBUAIEoAAMIVACALAAAAEgAgCQAAzBAAIAsAAM0QACAMAADOEAAgDQAAzxAAIB0AANAQACAfAADSEAAgQgAAwhUAIPgFAQCwCwAhnQcBALALACGeBwEAsAsAIQkJAADMEAAgCwAAzRAAIAwAAM4QACANAADPEAAgHQAA0BAAIB8AANIQACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEDAAAAMgAgSQAAvhUAIEoAAMUVACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAMUVACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhDPgFAQAAAAH-BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAHVBgEAAAAB2wYBAAAAAY0HAQAAAAGQBwEAAAABkQdAAAAAAQT4BQEAAAAB_wVAAAAAAd4GAQAAAAHfBgEAAAABDfgFAQAAAAH6BRAAAAAB-wUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAGSBgEAAAAB1wYBAAAAAdgGAQAAAAHZBgEAAAAB2gZAAAAAAdsGAQAAAAEKDQAAkA0AIBYAAJINACD4BQEAAAABnwYBAAAAAaAGAQAAAAGhBgEAAAABogYBAAAAAaMGAQAAAAGlBkAAAAAB3QYAAI8NACACAAAAnAcAIEkAAMkVACADAAAAKgAgSQAAyRUAIEoAAM0VACAMAAAAKgAgDQAA1AwAIBYAANYMACBCAADNFQAg-AUBALALACGfBgEAsAsAIaAGAQCyCwAhoQYBALILACGiBgEAsgsAIaMGAQCyCwAhpQZAAMQLACHdBgAA0wwAIAoNAADUDAAgFgAA1gwAIPgFAQCwCwAhnwYBALALACGgBgEAsgsAIaEGAQCyCwAhogYBALILACGjBgEAsgsAIaUGQADECwAh3QYAANMMACAO-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG1BkAAAAABywYBAAAAAdIGEAAAAAHbBgEAAAAB5wYQAAAAAegGAQAAAAHpBhAAAAAB6gYBAAAAAesGAQAAAAEF-AUBAAAAAZAGAQAAAAG3BkAAAAABuAaAAAAAAbkGQAAAAAEDAAAA4wEAIEkAAK0VACBKAADSFQAgCwAAAOMBACA6AACoEwAgPAAAqRMAIEIAANIVACD4BQEAsAsAIf8FQACzCwAhngZAALMLACGfBgEAsAsAIaIGAQCwCwAhqwcBALALACGtBwAAphOtByIJOgAAqBMAIDwAAKkTACD4BQEAsAsAIf8FQACzCwAhngZAALMLACGfBgEAsAsAIaIGAQCwCwAhqwcBALALACGtBwAAphOtByIDAAAAMgAgSQAArxUAIEoAANUVACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAANUVACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAjAADeEQAgJgAA3xEAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhCS4AAMgTACA8AADKEwAg-AUBAAAAAf8FQAAAAAGeBkAAAAABnwYBAAAAAaIGAQAAAAGrBwEAAAABrQcAAACtBwICAAAAAQAgSQAA1hUAIBUDAAD0DQAgEAAA-g0AIBkAAPkNACAeAAD3DQAgJgAA9g0AIDMAAPsNACA4AAD1DQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeAGAQAAAAHhBgEAAAAB4gYBAAAAAeMGAQAAAAHkBgEAAAAB5QYBAAAAAeYGgAAAAAECAAAABQAgSQAA2BUAIAMAAADjAQAgSQAA1hUAIEoAANwVACALAAAA4wEAIC4AAKcTACA8AACpEwAgQgAA3BUAIPgFAQCwCwAh_wVAALMLACGeBkAAswsAIZ8GAQCwCwAhogYBALALACGrBwEAsAsAIa0HAACmE60HIgkuAACnEwAgPAAAqRMAIPgFAQCwCwAh_wVAALMLACGeBkAAswsAIZ8GAQCwCwAhogYBALALACGrBwEAsAsAIa0HAACmE60HIgMAAAADACBJAADYFQAgSgAA3xUAIBcAAAADACADAACgDQAgEAAApg0AIBkAAKUNACAeAACjDQAgJgAAog0AIDMAAKcNACA4AAChDQAgQgAA3xUAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG3BkAAswsAIdUGAQCyCwAh4AYBALALACHhBgEAsgsAIeIGAQCyCwAh4wYBALILACHkBgEAsgsAIeUGAQCyCwAh5gaAAAAAARUDAACgDQAgEAAApg0AIBkAAKUNACAeAACjDQAgJgAAog0AIDMAAKcNACA4AAChDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABGQwAAIQTACAQAACNEwAgFgAAkxMAIBkAAI8TACAeAACIEwAgHwAAiRMAICAAAIYTACAhAACHEwAgIgAAihMAICMAAIsTACAmAACMEwAgLgAAjhMAIC8AAJATACAwAACREwAgMwAAkhMAIDQAAJQTACD4BQEAAAAB_wVAAAAAAZIGAQAAAAGZBgAAAKMHAp4GQAAAAAGfBgEAAAABpQZAAAAAAaEHAQAAAAGjBwEAAAABAgAAAI8CACBJAADgFQAgCQkAAJURACALAACWEQAgDAAAlxEAIB0AAJkRACAeAACaEQAgHwAAmxEAIPgFAQAAAAGdBwEAAAABngcBAAAAAQIAAAAUACBJAADiFQAgDfgFAQAAAAH6BRAAAAAB-wUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAGSBgEAAAABtgYBAAAAAdcGAQAAAAHYBgEAAAAB2gZAAAAAAdsGAQAAAAEDAAAAMgAgSQAA4BUAIEoAAOcVACAbAAAAMgAgDAAA1xEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAOcVACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhAwAAABIAIEkAAOIVACBKAADqFQAgCwAAABIAIAkAAMwQACALAADNEAAgDAAAzhAAIB0AANAQACAeAADREAAgHwAA0hAAIEIAAOoVACD4BQEAsAsAIZ0HAQCwCwAhngcBALALACEJCQAAzBAAIAsAAM0QACAMAADOEAAgHQAA0BAAIB4AANEQACAfAADSEAAg-AUBALALACGdBwEAsAsAIZ4HAQCwCwAhEvgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABkAYBAAAAAZUGEAAAAAHOBgEAAAAB0gYQAAAAAdQGAQAAAAHVBgEAAAAB6gYBAAAAAesGAQAAAAGNBwEAAAABmQcAAACZBwKaBwEAAAABmwcBAAAAAZwHQAAAAAEVAwAA9A0AIBkAAPkNACAeAAD3DQAgJgAA9g0AIDMAAPsNACA4AAD1DQAgOgAA-A0AIPgFAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAABtwZAAAAAAdUGAQAAAAHgBgEAAAAB4QYBAAAAAeIGAQAAAAHjBgEAAAAB5AYBAAAAAeUGAQAAAAHmBoAAAAABAgAAAAUAIEkAAOwVACAZDAAAhBMAIA0AAIUTACAWAACTEwAgGQAAjxMAIB4AAIgTACAfAACJEwAgIAAAhhMAICEAAIcTACAiAACKEwAgIwAAixMAICYAAIwTACAuAACOEwAgLwAAkBMAIDAAAJETACAzAACSEwAgNAAAlBMAIPgFAQAAAAH_BUAAAAABkgYBAAAAAZkGAAAAowcCngZAAAAAAZ8GAQAAAAGlBkAAAAABoQcBAAAAAaMHAQAAAAECAAAAjwIAIEkAAO4VACADAAAAAwAgSQAA7BUAIEoAAPIVACAXAAAAAwAgAwAAoA0AIBkAAKUNACAeAACjDQAgJgAAog0AIDMAAKcNACA4AAChDQAgOgAApA0AIEIAAPIVACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtwZAALMLACHVBgEAsgsAIeAGAQCwCwAh4QYBALILACHiBgEAsgsAIeMGAQCyCwAh5AYBALILACHlBgEAsgsAIeYGgAAAAAEVAwAAoA0AIBkAAKUNACAeAACjDQAgJgAAog0AIDMAAKcNACA4AAChDQAgOgAApA0AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG3BkAAswsAIdUGAQCyCwAh4AYBALALACHhBgEAsgsAIeIGAQCyCwAh4wYBALILACHkBgEAsgsAIeUGAQCyCwAh5gaAAAAAAQMAAAAyACBJAADuFQAgSgAA9RUAIBsAAAAyACAMAADXEQAgDQAA2BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACA0AADnEQAgQgAA9RUAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEO-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG1BkAAAAABtgYBAAAAAdIGEAAAAAHbBgEAAAAB5wYQAAAAAegGAQAAAAHpBhAAAAAB6gYBAAAAAesGAQAAAAEU-AUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGQBgEAAAAByAYBAAAAAckGAQAAAAHKBgEAAAABzAYBAAAAAc0GAQAAAAHOBgEAAAABzwYCAAAAAdAGEAAAAAHRBhAAAAAB0gYQAAAAAdMGAQAAAAHUBgEAAAAB1QYBAAAAAdYGQAAAAAEN-AUBAAAAAfoFEAAAAAH7BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAZIGAQAAAAG2BgEAAAAB2AYBAAAAAdkGAQAAAAHaBkAAAAAB2wYBAAAAARUDAAD0DQAgEAAA-g0AIB4AAPcNACAmAAD2DQAgMwAA-w0AIDgAAPUNACA6AAD4DQAg-AUBAAAAAf8FQAAAAAGABgEAAAABgQYBAAAAAZAGAQAAAAG3BkAAAAAB1QYBAAAAAeAGAQAAAAHhBgEAAAAB4gYBAAAAAeMGAQAAAAHkBgEAAAAB5QYBAAAAAeYGgAAAAAECAAAABQAgSQAA-RUAIBYDAACNDQAgCgAAjA0AIA4AALgQACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABjQYQAAAAAZAGAQAAAAGVBhAAAAABywYBAAAAAc4GAQAAAAHSBhAAAAAB1AYBAAAAAdUGAQAAAAHqBgEAAAAB6wYBAAAAAY0HAQAAAAGZBwAAAJkHApoHAQAAAAGbBwEAAAABnAdAAAAAAQIAAAAeACBJAAD7FQAgA_gFAQAAAAGfBgEAAAAB3AYgAAAAAQIAAAC0BwAgSQAA_RUAIBkMAACEEwAgDQAAhRMAIBAAAI0TACAWAACTEwAgHgAAiBMAIB8AAIkTACAgAACGEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAA_xUAIAMAAAADACBJAAD5FQAgSgAAgxYAIBcAAAADACADAACgDQAgEAAApg0AIB4AAKMNACAmAACiDQAgMwAApw0AIDgAAKENACA6AACkDQAgQgAAgxYAIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG3BkAAswsAIdUGAQCyCwAh4AYBALALACHhBgEAsgsAIeIGAQCyCwAh4wYBALILACHkBgEAsgsAIeUGAQCyCwAh5gaAAAAAARUDAACgDQAgEAAApg0AIB4AAKMNACAmAACiDQAgMwAApw0AIDgAAKENACA6AACkDQAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGQBgEAsAsAIbcGQACzCwAh1QYBALILACHgBgEAsAsAIeEGAQCyCwAh4gYBALILACHjBgEAsgsAIeQGAQCyCwAh5QYBALILACHmBoAAAAABAwAAABwAIEkAAPsVACBKAACGFgAgGAAAABwAIAMAAIANACAKAAD_DAAgDgAAtxAAIEIAAIYWACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIY0GEACxCwAhkAYBALILACGVBhAAwgsAIcsGAQCwCwAhzgYBALILACHSBhAAwgsAIdQGAQCyCwAh1QYBALILACHqBgEAsgsAIesGAQCyCwAhjQcBALALACGZBwAA_QyZByKaBwEAsgsAIZsHAQCyCwAhnAdAALMLACEWAwAAgA0AIAoAAP8MACAOAAC3EAAg-AUBALALACH_BUAAswsAIYAGAQCyCwAhgQYBALILACGNBhAAsQsAIZAGAQCyCwAhlQYQAMILACHLBgEAsAsAIc4GAQCyCwAh0gYQAMILACHUBgEAsgsAIdUGAQCyCwAh6gYBALILACHrBgEAsgsAIY0HAQCwCwAhmQcAAP0MmQcimgcBALILACGbBwEAsgsAIZwHQACzCwAhAwAAALcHACBJAAD9FQAgSgAAiRYAIAUAAAC3BwAgQgAAiRYAIPgFAQCwCwAhnwYBALALACHcBiAA_QsAIQP4BQEAsAsAIZ8GAQCwCwAh3AYgAP0LACEDAAAAMgAgSQAA_xUAIEoAAIwWACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAIwWACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhDBIAALAPACATAACxDwAgFAAAsg8AIBUAALMPACD4BQEAAAABygYBAAAAAYQHAQAAAAGFBwEAAAABhgcBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAECAAAARAAgSQAAjRYAIA4SAADsDwAgEwAA7Q8AIBQAAO4PACAVAADvDwAg-AUBAAAAAZ8GAQAAAAHKBgEAAAABhQcBAAAAAYcHAAAAggcCiAcBAAAAAYkHgAAAAAGKBwEAAAABiwcBAAAAAYwHAQAAAAECAAAALwAgSQAAjxYAIAoNAACQDQAgEAAAkQ0AIPgFAQAAAAGfBgEAAAABoAYBAAAAAaEGAQAAAAGiBgEAAAABowYBAAAAAaUGQAAAAAHdBgAAjw0AIAIAAACcBwAgSQAAkRYAIBkMAACEEwAgDQAAhRMAIBAAAI0TACAZAACPEwAgHgAAiBMAIB8AAIkTACAgAACGEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACA0AACUEwAg-AUBAAAAAf8FQAAAAAGSBgEAAAABmQYAAACjBwKeBkAAAAABnwYBAAAAAaUGQAAAAAGhBwEAAAABowcBAAAAAQIAAACPAgAgSQAAkxYAIAMAAABBACBJAACNFgAgSgAAlxYAIA4AAABBACASAACKDwAgEwAAiw8AIBQAAIwPACAVAACNDwAgQgAAlxYAIPgFAQCwCwAhygYBALILACGEBwEAsAsAIYUHAQCwCwAhhgcBALILACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAEMEgAAig8AIBMAAIsPACAUAACMDwAgFQAAjQ8AIPgFAQCwCwAhygYBALILACGEBwEAsAsAIYUHAQCwCwAhhgcBALILACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAEDAAAALAAgSQAAjxYAIEoAAJoWACAQAAAALAAgEgAAxg8AIBMAAMcPACAUAADIDwAgFQAAyQ8AIEIAAJoWACD4BQEAsAsAIZ8GAQCwCwAhygYBALILACGFBwEAsAsAIYcHAACCD4IHIogHAQCyCwAhiQeAAAAAAYoHAQCwCwAhiwcBALILACGMBwEAsgsAIQ4SAADGDwAgEwAAxw8AIBQAAMgPACAVAADJDwAg-AUBALALACGfBgEAsAsAIcoGAQCyCwAhhQcBALALACGHBwAAgg-CByKIBwEAsgsAIYkHgAAAAAGKBwEAsAsAIYsHAQCyCwAhjAcBALILACEDAAAAKgAgSQAAkRYAIEoAAJ0WACAMAAAAKgAgDQAA1AwAIBAAANUMACBCAACdFgAg-AUBALALACGfBgEAsAsAIaAGAQCyCwAhoQYBALILACGiBgEAsgsAIaMGAQCyCwAhpQZAAMQLACHdBgAA0wwAIAoNAADUDAAgEAAA1QwAIPgFAQCwCwAhnwYBALALACGgBgEAsgsAIaEGAQCyCwAhogYBALILACGjBgEAsgsAIaUGQADECwAh3QYAANMMACADAAAAMgAgSQAAkxYAIEoAAKAWACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACAzAADlEQAgNAAA5xEAIEIAAKAWACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIDQAAOcRACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhFQMAAPQNACAQAAD6DQAgGQAA-Q0AIB4AAPcNACAmAAD2DQAgOAAA9Q0AIDoAAPgNACD4BQEAAAAB_wVAAAAAAYAGAQAAAAGBBgEAAAABkAYBAAAAAbcGQAAAAAHVBgEAAAAB4AYBAAAAAeEGAQAAAAHiBgEAAAAB4wYBAAAAAeQGAQAAAAHlBgEAAAAB5gaAAAAAAQIAAAAFACBJAAChFgAgGQwAAIQTACANAACFEwAgEAAAjRMAIBYAAJMTACAZAACPEwAgHgAAiBMAIB8AAIkTACAgAACGEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDQAAJQTACD4BQEAAAAB_wVAAAAAAZIGAQAAAAGZBgAAAKMHAp4GQAAAAAGfBgEAAAABpQZAAAAAAaEHAQAAAAGjBwEAAAABAgAAAI8CACBJAACjFgAgB_gFAQAAAAH_BUAAAAABmQYBAAAAAbEGAQAAAAGzBgIAAAABtAYBAAAAAbUGQAAAAAEDAAAAAwAgSQAAoRYAIEoAAKgWACAXAAAAAwAgAwAAoA0AIBAAAKYNACAZAAClDQAgHgAAow0AICYAAKINACA4AAChDQAgOgAApA0AIEIAAKgWACD4BQEAsAsAIf8FQACzCwAhgAYBALILACGBBgEAsgsAIZAGAQCwCwAhtwZAALMLACHVBgEAsgsAIeAGAQCwCwAh4QYBALILACHiBgEAsgsAIeMGAQCyCwAh5AYBALILACHlBgEAsgsAIeYGgAAAAAEVAwAAoA0AIBAAAKYNACAZAAClDQAgHgAAow0AICYAAKINACA4AAChDQAgOgAApA0AIPgFAQCwCwAh_wVAALMLACGABgEAsgsAIYEGAQCyCwAhkAYBALALACG3BkAAswsAIdUGAQCyCwAh4AYBALALACHhBgEAsgsAIeIGAQCyCwAh4wYBALILACHkBgEAsgsAIeUGAQCyCwAh5gaAAAAAAQMAAAAyACBJAACjFgAgSgAAqxYAIBsAAAAyACAMAADXEQAgDQAA2BEAIBAAAOARACAWAADmEQAgGQAA4hEAIB4AANsRACAfAADcEQAgIAAA2REAICEAANoRACAiAADdEQAgIwAA3hEAICYAAN8RACAuAADhEQAgLwAA4xEAIDAAAOQRACA0AADnEQAgQgAAqxYAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEZDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgNAAA5xEAIPgFAQCwCwAh_wVAALMLACGSBgEAsgsAIZkGAADWEaMHIp4GQACzCwAhnwYBALALACGlBkAAxAsAIaEHAQCwCwAhowcBALILACEIAwAAngwAIA8AAJ8MACD4BQEAAAABkAYBAAAAAbYGAQAAAAG3BkAAAAABuAaAAAAAAbkGQAAAAAECAAAAogEAIEkAAKwWACADAAAAoAEAIEkAAKwWACBKAACwFgAgCgAAAKABACADAACPDAAgDwAAkAwAIEIAALAWACD4BQEAsAsAIZAGAQCwCwAhtgYBALALACG3BkAAswsAIbgGgAAAAAG5BkAAswsAIQgDAACPDAAgDwAAkAwAIPgFAQCwCwAhkAYBALALACG2BgEAsAsAIbcGQACzCwAhuAaAAAAAAbkGQACzCwAhEPgFAQAAAAH_BUAAAAABkAYBAAAAAZEGAQAAAAGSBgEAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGEAAAAAGZBgAAAJkGApoGQAAAAAGbBkAAAAABnAYQAAAAAZ0GEAAAAAGeBkAAAAABGQwAAIQTACANAACFEwAgEAAAjRMAIBYAAJMTACAZAACPEwAgHgAAiBMAIB8AAIkTACAgAACGEwAgIQAAhxMAICIAAIoTACAjAACLEwAgJgAAjBMAIC4AAI4TACAvAACQEwAgMAAAkRMAIDMAAJITACD4BQEAAAAB_wVAAAAAAZIGAQAAAAGZBgAAAKMHAp4GQAAAAAGfBgEAAAABpQZAAAAAAaEHAQAAAAGjBwEAAAABAgAAAI8CACBJAACyFgAgCPgFAQAAAAGfBgEAAAABoAYBAAAAAaEGAQAAAAGiBgEAAAABowYBAAAAAaQGAAD2CwAgpQZAAAAAAQIAAAD6CAAgSQAAtBYAIAj4BQEAAAAB_QUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAGNBhAAAAABjgZAAAAAAQoSAQAAAAH4BQEAAAAB-gUQAAAAAfsFAQAAAAH8BUAAAAAB_QUBAAAAAf4FAQAAAAH_BUAAAAABgAYBAAAAAYEGAQAAAAEDAAAAMgAgSQAAshYAIEoAALoWACAbAAAAMgAgDAAA1xEAIA0AANgRACAQAADgEQAgFgAA5hEAIBkAAOIRACAeAADbEQAgHwAA3BEAICAAANkRACAhAADaEQAgIgAA3REAICMAAN4RACAmAADfEQAgLgAA4REAIC8AAOMRACAwAADkEQAgMwAA5REAIEIAALoWACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhGQwAANcRACANAADYEQAgEAAA4BEAIBYAAOYRACAZAADiEQAgHgAA2xEAIB8AANwRACAgAADZEQAgIQAA2hEAICIAAN0RACAjAADeEQAgJgAA3xEAIC4AAOERACAvAADjEQAgMAAA5BEAIDMAAOURACD4BQEAsAsAIf8FQACzCwAhkgYBALILACGZBgAA1hGjByKeBkAAswsAIZ8GAQCwCwAhpQZAAMQLACGhBwEAsAsAIaMHAQCyCwAhAwAAAP0IACBJAAC0FgAgSgAAvRYAIAoAAAD9CAAgQgAAvRYAIPgFAQCwCwAhnwYBALALACGgBgEAsgsAIaEGAQCyCwAhogYBALILACGjBgEAsgsAIaQGAADoCwAgpQZAAMQLACEI-AUBALALACGfBgEAsAsAIaAGAQCyCwAhoQYBALILACGiBgEAsgsAIaMGAQCyCwAhpAYAAOgLACClBkAAxAsAIRQDAADiCwAgLQAA5AsAIDUAAOELACD4BQEAAAAB_wVAAAAAAY8GAQAAAAGQBgEAAAABkQYBAAAAAZIGAQAAAAGTBgEAAAABlAYBAAAAAZUGEAAAAAGWBhAAAAABlwYQAAAAAZkGAAAAmQYCmgZAAAAAAZsGQAAAAAGcBhAAAAABnQYQAAAAAZ4GQAAAAAECAAAArAEAIEkAAL4WACADAAAAqgEAIEkAAL4WACBKAADCFgAgFgAAAKoBACADAADGCwAgLQAAyAsAIDUAAMULACBCAADCFgAg-AUBALALACH_BUAAswsAIY8GAQCwCwAhkAYBALALACGRBgEAsgsAIZIGAQCyCwAhkwYBALILACGUBgEAsgsAIZUGEADCCwAhlgYQAMILACGXBhAAwgsAIZkGAADDC5kGIpoGQADECwAhmwZAAMQLACGcBhAAsQsAIZ0GEACxCwAhngZAALMLACEUAwAAxgsAIC0AAMgLACA1AADFCwAg-AUBALALACH_BUAAswsAIY8GAQCwCwAhkAYBALALACGRBgEAsgsAIZIGAQCyCwAhkwYBALILACGUBgEAsgsAIZUGEADCCwAhlgYQAMILACGXBhAAwgsAIZkGAADDC5kGIpoGQADECwAhmwZAAMQLACGcBhAAsQsAIZ0GEACxCwAhngZAALMLACEUAwAA4gsAIDUAAOELACA3AADjCwAg-AUBAAAAAf8FQAAAAAGPBgEAAAABkAYBAAAAAZEGAQAAAAGSBgEAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGEAAAAAGZBgAAAJkGApoGQAAAAAGbBkAAAAABnAYQAAAAAZ0GEAAAAAGeBkAAAAABAgAAAKwBACBJAADDFgAgAwAAAKoBACBJAADDFgAgSgAAxxYAIBYAAACqAQAgAwAAxgsAIDUAAMULACA3AADHCwAgQgAAxxYAIPgFAQCwCwAh_wVAALMLACGPBgEAsAsAIZAGAQCwCwAhkQYBALILACGSBgEAsgsAIZMGAQCyCwAhlAYBALILACGVBhAAwgsAIZYGEADCCwAhlwYQAMILACGZBgAAwwuZBiKaBkAAxAsAIZsGQADECwAhnAYQALELACGdBhAAsQsAIZ4GQACzCwAhFAMAAMYLACA1AADFCwAgNwAAxwsAIPgFAQCwCwAh_wVAALMLACGPBgEAsAsAIZAGAQCwCwAhkQYBALILACGSBgEAsgsAIZMGAQCyCwAhlAYBALILACGVBhAAwgsAIZYGEADCCwAhlwYQAMILACGZBgAAwwuZBiKaBkAAxAsAIZsGQADECwAhnAYQALELACGdBhAAsQsAIZ4GQACzCwAhBAUAPS4GAjraATo83gE8CQMAAwUAOxDSAQ8Z0QEeHswBIybLASYz0wEwOAABOtABOhIFADkMCgQNdg0QmwEPFqkBEBmdAR4eeSMfeiQgdyIheCIiexQjfBomgAEmLpwBAi-eAREwnwEXM6MBMDStATMCAwADCgAFCAUAJQkABgsaDAwbBA0fDR1lIh5qIx9vJAQFAAsGAAcHAAkIFQUCBA4GBQAIAQQPAAIEEAYFAAoBBBEAAQgWAAEKAAUFA1gDBQAhCgAFDgAOGVweBAUAHQ0gDRAkDxYpEAMDAAMOAA4PJQIEAwADDisOES0RGEIXBgUAFhIAEhMzAxQ3FBU8FRY9EAIFABMRMBEBETEAAgM4AxEAEQERABEDFD4AFT8AFkAABgUAHBIAGBNHAxRLGhVQGxZREAIFABkXRRcBF0YAAgNMAxgAFwEYABcDFFIAFVMAFlQAAw1VABBWABZXAAQDAAMGAB8PYAIaXw0CBQAgGV0eARleAAEZYQADCgAFG2YDHAADAwMAAwoABQ9rAgIDAAMKAAUGC3AADHEADXIAHXMAHnQAH3UAAwMAAw-aAQInACcFBQAvJQAoJoYBJiyKASotlgEsAgUAKSSEAScBJIUBAAMFAC4nACcrjgErAigAKiqQASwDBQAtJwAnKZEBKwEpkgEAASuTAQADJpcBACyYAQAtmQEABAMAAwUAMg8AAjKnATEBMQAwATKoAQAFAwADBQA4LbcBNzUANDezATYCBQA1NK4BMwE0rwEAATYAMwE2ADMCLbkBADe4AQARDLoBAA27AQAQwwEAFskBABnFAQAevgEAH78BACC8AQAhvQEAIsABACPBAQAmwgEALsQBAC_GAQAwxwEAM8gBADTKAQACDwACOQABBhDYAQAZ1wEAHtUBACbUAQAz2QEAOtYBAAE7AAEDLt8BADrgAQA84QEAAAAAAwUAQk8AQ1AARAAAAAMFAEJPAENQAEQBOwABATsAAQMFAElPAEpQAEsAAAADBQBJTwBKUABLAAADBQBQTwBRUABSAAAAAwUAUE8AUVAAUgAAAwUAV08AWFAAWQAAAAMFAFdPAFhQAFkAAAMFAF5PAF9QAGAAAAADBQBeTwBfUABgAgYABwcACQIGAAcHAAkFBQBlTwBoUABpoQEAZqIBAGcAAAAAAAUFAGVPAGhQAGmhAQBmogEAZwEJAAYBCQAGAwUAbk8Ab1AAcAAAAAMFAG5PAG9QAHABCgAFAQoABQUFAHVPAHhQAHmhAQB2ogEAdwAAAAAABQUAdU8AeFAAeaEBAHaiAQB3AgMAAwoABQIDAAMKAAUFBQB-TwCBAVAAggGhAQB_ogEAgAEAAAAAAAUFAH5PAIEBUACCAaEBAH-iAQCAAQMDuwMDCgAFDgAOAwPBAwMKAAUOAA4FBQCHAU8AigFQAIsBoQEAiAGiAQCJAQAAAAAABQUAhwFPAIoBUACLAaEBAIgBogEAiQEDCgAFG9MDAxwAAwMKAAUb2QMDHAADBQUAkAFPAJMBUACUAaEBAJEBogEAkgEAAAAAAAUFAJABTwCTAVAAlAGhAQCRAaIBAJIBAwMAAwoABQ_rAwIDAwADCgAFD_EDAgUFAJkBTwCcAVAAnQGhAQCaAaIBAJsBAAAAAAAFBQCZAU8AnAFQAJ0BoQEAmgGiAQCbAQIDAAMKAAUCAwADCgAFBQUAogFPAKUBUACmAaEBAKMBogEApAEAAAAAAAUFAKIBTwClAVAApgGhAQCjAaIBAKQBAAADBQCrAU8ArAFQAK0BAAAAAwUAqwFPAKwBUACtAQAAAwUAsgFPALMBUAC0AQAAAAMFALIBTwCzAVAAtAECEgASE8sEAwISABIT0QQDAwUAuQFPALoBUAC7AQAAAAMFALkBTwC6AVAAuwECA-MEAxEAEQID6QQDEQARAwUAwAFPAMEBUADCAQAAAAMFAMABTwDBAVAAwgEBEQARAREAEQUFAMcBTwDKAVAAywGhAQDIAaIBAMkBAAAAAAAFBQDHAU8AygFQAMsBoQEAyAGiAQDJAQISABgTkQUDAhIAGBOXBQMDBQDQAU8A0QFQANIBAAAAAwUA0AFPANEBUADSAQIDqQUDGAAXAgOvBQMYABcDBQDXAU8A2AFQANkBAAAAAwUA1wFPANgBUADZAQEYABcBGAAXBQUA3gFPAOEBUADiAaEBAN8BogEA4AEAAAAAAAUFAN4BTwDhAVAA4gGhAQDfAaIBAOABAAADBQDnAU8A6AFQAOkBAAAAAwUA5wFPAOgBUADpAQElACgBJQAoBQUA7gFPAPEBUADyAaEBAO8BogEA8AEAAAAAAAUFAO4BTwDxAVAA8gGhAQDvAaIBAPABAwMAAw-GBgInACcDAwADD4wGAicAJwUFAPcBTwD6AVAA-wGhAQD4AaIBAPkBAAAAAAAFBQD3AU8A-gFQAPsBoQEA-AGiAQD5AQEnACcBJwAnBQUAgAJPAIMCUACEAqEBAIECogEAggIAAAAAAAUFAIACTwCDAlAAhAKhAQCBAqIBAIICAigAKiq0BiwCKAAqKroGLAUFAIkCTwCMAlAAjQKhAQCKAqIBAIsCAAAAAAAFBQCJAk8AjAJQAI0CoQEAigKiAQCLAgEnACcBJwAnBQUAkgJPAJUCUACWAqEBAJMCogEAlAIAAAAAAAUFAJICTwCVAlAAlgKhAQCTAqIBAJQCAwMAAw4ADg_iBgIDAwADDgAOD-gGAgUFAJsCTwCeAlAAnwKhAQCcAqIBAJ0CAAAAAAAFBQCbAk8AngJQAJ8CoQEAnAKiAQCdAgIDAAM4AAECAwADOAABAwUApAJPAKUCUACmAgAAAAMFAKQCTwClAlAApgICDwACOQABAg8AAjkAAQMFAKsCTwCsAlAArQIAAAADBQCrAk8ArAJQAK0CAAADBQCyAk8AswJQALQCAAAAAwUAsgJPALMCUAC0AgAAAwUAuQJPALoCUAC7AgAAAAMFALkCTwC6AlAAuwIEAwADBgAfD9gHAhrXBw0EAwADBgAfD98HAhreBw0FBQDAAk8AwwJQAMQCoQEAwQKiAQDCAgAAAAAABQUAwAJPAMMCUADEAqEBAMECogEAwgIEAwADDvEHDhHyBxEY8wcXBAMAAw75Bw4R-gcRGPsHFwUFAMkCTwDMAlAAzQKhAQDKAqIBAMsCAAAAAAAFBQDJAk8AzAJQAM0CoQEAygKiAQDLAgAAAAMFANMCTwDUAlAA1QIAAAADBQDTAk8A1AJQANUCAgMAAw8AAgIDAAMPAAIDBQDaAk8A2wJQANwCAAAAAwUA2gJPANsCUADcAgExADABMQAwBQUA4QJPAOQCUADlAqEBAOICogEA4wIAAAAAAAUFAOECTwDkAlAA5QKhAQDiAqIBAOMCAAAAAwUA6wJPAOwCUADtAgAAAAMFAOsCTwDsAlAA7QIAAAADBQDzAk8A9AJQAPUCAAAAAwUA8wJPAPQCUAD1AgAAAwUA-gJPAPsCUAD8AgAAAAMFAPoCTwD7AlAA_AICAwADNQA0AgMAAzUANAUFAIEDTwCEA1AAhQOhAQCCA6IBAIMDAAAAAAAFBQCBA08AhANQAIUDoQEAggOiAQCDAwE2ADMBNgAzBQUAigNPAI0DUACOA6EBAIsDogEAjAMAAAAAAAUFAIoDTwCNA1AAjgOhAQCLA6IBAIwDATYAMwE2ADMFBQCTA08AlgNQAJcDoQEAlAOiAQCVAwAAAAAABQUAkwNPAJYDUACXA6EBAJQDogEAlQM9AgE-4gEBP-UBAUDmAQFB5wEBQ-kBAUTrAT5F7AE_Ru4BAUfwAT5I8QFAS_IBAUzzAQFN9AE-UfcBQVL4AUVT-QE8VPoBPFX7ATxW_AE8V_0BPFj_ATxZgQI-WoICRluEAjxchgI-XYcCR16IAjxfiQI8YIoCPmGNAkhijgJMY5ACA2SRAgNlkwIDZpQCA2eVAgNolwIDaZkCPmqaAk1rnAIDbJ4CPm2fAk5uoAIDb6ECA3CiAj5xpQJPcqYCU3OoAgd0qQIHdawCB3atAgd3rgIHeLACB3myAj56swJUe7UCB3y3Aj59uAJVfrkCB3-6AgeAAbsCPoEBvgJWggG_AlqDAcECCYQBwgIJhQHFAgmGAcYCCYcBxwIJiAHJAgmJAcsCPooBzAJbiwHOAgmMAdACPo0B0QJcjgHSAgmPAdMCCZAB1AI-kQHXAl2SAdgCYZMB2QIGlAHaAgaVAdsCBpYB3AIGlwHdAgaYAd8CBpkB4QI-mgHiAmKbAeQCBpwB5gI-nQHnAmOeAegCBp8B6QIGoAHqAj6jAe0CZKQB7gJqpQHvAgWmAfACBacB8QIFqAHyAgWpAfMCBaoB9QIFqwH3Aj6sAfgCa60B-gIFrgH8Aj6vAf0CbLAB_gIFsQH_AgWyAYADPrMBgwNttAGEA3G1AYUDDLYBhgMMtwGHAwy4AYgDDLkBiQMMugGLAwy7AY0DPrwBjgNyvQGQAwy-AZIDPr8BkwNzwAGUAwzBAZUDDMIBlgM-wwGZA3TEAZoDesUBmwMExgGcAwTHAZ0DBMgBngMEyQGfAwTKAaEDBMsBowM-zAGkA3vNAaYDBM4BqAM-zwGpA3zQAaoDBNEBqwME0gGsAz7TAa8DfdQBsAODAdUBsQMN1gGyAw3XAbMDDdgBtAMN2QG1Aw3aAbcDDdsBuQM-3AG6A4QB3QG9Aw3eAb8DPt8BwAOFAeABwgMN4QHDAw3iAcQDPuMBxwOGAeQByAOMAeUByQMi5gHKAyLnAcsDIugBzAMi6QHNAyLqAc8DIusB0QM-7AHSA40B7QHVAyLuAdcDPu8B2AOOAfAB2gMi8QHbAyLyAdwDPvMB3wOPAfQB4AOVAfUB4QMj9gHiAyP3AeMDI_gB5AMj-QHlAyP6AecDI_sB6QM-_AHqA5YB_QHtAyP-Ae8DPv8B8AOXAYAC8gMjgQLzAyOCAvQDPoMC9wOYAYQC-AOeAYUC-QMkhgL6AySHAvsDJIgC_AMkiQL9AySKAv8DJIsCgQQ-jAKCBJ8BjQKEBCSOAoYEPo8ChwSgAZACiAQkkQKJBCSSAooEPpMCjQShAZQCjgSnAZUCkAQSlgKRBBKXApQEEpgClQQSmQKWBBKaApgEEpsCmgQ-nAKbBKgBnQKdBBKeAp8EPp8CoASpAaACoQQSoQKiBBKiAqMEPqMCpgSqAaQCpwSuAaUCqQQYpgKqBBinAq0EGKgCrgQYqQKvBBiqArEEGKsCswQ-rAK0BK8BrQK2BBiuArgEPq8CuQSwAbACugQYsQK7BBiyArwEPrMCvwSxAbQCwAS1AbUCwQQRtgLCBBG3AsMEEbgCxAQRuQLFBBG6AscEEbsCyQQ-vALKBLYBvQLNBBG-As8EPr8C0AS3AcAC0gQRwQLTBBHCAtQEPsMC1wS4AcQC2AS8AcUC2QQUxgLaBBTHAtsEFMgC3AQUyQLdBBTKAt8EFMsC4QQ-zALiBL0BzQLlBBTOAucEPs8C6AS-AdAC6gQU0QLrBBTSAuwEPtMC7wS_AdQC8ATDAdUC8QQV1gLyBBXXAvMEFdgC9AQV2QL1BBXaAvcEFdsC-QQ-3AL6BMQB3QL8BBXeAv4EPt8C_wTFAeACgAUV4QKBBRXiAoIFPuMChQXGAeQChgXMAeUChwUX5gKIBRfnAokFF-gCigUX6QKLBRfqAo0FF-sCjwU-7AKQBc0B7QKTBRfuApUFPu8ClgXOAfACmAUX8QKZBRfyApoFPvMCnQXPAfQCngXTAfUCnwUa9gKgBRr3AqEFGvgCogUa-QKjBRr6AqUFGvsCpwU-_AKoBdQB_QKrBRr-Aq0FPv8CrgXVAYADsAUagQOxBRqCA7IFPoMDtQXWAYQDtgXaAYUDtwUbhgO4BRuHA7kFG4gDugUbiQO7BRuKA70FG4sDvwU-jAPABdsBjQPCBRuOA8QFPo8DxQXcAZADxgUbkQPHBRuSA8gFPpMDywXdAZQDzAXjAZUDzgUolgPPBSiXA9IFKJgD0wUomQPUBSiaA9YFKJsD2AU-nAPZBeQBnQPbBSieA90FPp8D3gXlAaAD3wUooQPgBSiiA-EFPqMD5AXmAaQD5QXqAaUD5gUnpgPnBSenA-gFJ6gD6QUnqQPqBSeqA-wFJ6sD7gU-rAPvBesBrQPxBSeuA_MFPq8D9AXsAbAD9QUnsQP2BSeyA_cFPrMD-gXtAbQD-wXzAbUD_AUmtgP9BSa3A_4FJrgD_wUmuQOABia6A4IGJrsDhAY-vAOFBvQBvQOIBia-A4oGPr8Diwb1AcADjQYmwQOOBibCA48GPsMDkgb2AcQDkwb8AcUDlAYqxgOVBirHA5YGKsgDlwYqyQOYBirKA5oGKssDnAY-zAOdBv0BzQOfBirOA6EGPs8Dogb-AdADowYq0QOkBirSA6UGPtMDqAb_AdQDqQaFAtUDqgYr1gOrBivXA6wGK9gDrQYr2QOuBivaA7AGK9sDsgY-3AOzBoYC3QO2BiveA7gGPt8DuQaHAuADuwYr4QO8BiviA70GPuMDwAaIAuQDwQaOAuUDwgYs5gPDBiznA8QGLOgDxQYs6QPGBizqA8gGLOsDygY-7APLBo8C7QPNBizuA88GPu8D0AaQAvAD0QYs8QPSBizyA9MGPvMD1gaRAvQD1waXAvUD2AYP9gPZBg_3A9oGD_gD2wYP-QPcBg_6A94GD_sD4AY-_APhBpgC_QPkBg_-A-YGPv8D5waZAoAE6QYPgQTqBg-CBOsGPoME7gaaAoQE7wagAoUE8AYChgTxBgKHBPIGAogE8wYCiQT0BgKKBPYGAosE-AY-jAT5BqECjQT7BgKOBP0GPo8E_gaiApAE_wYCkQSABwKSBIEHPpMEhAejApQEhQenApUEhgc6lgSHBzqXBIgHOpgEiQc6mQSKBzqaBIwHOpsEjgc-nASPB6gCnQSRBzqeBJMHPp8ElAepAqAElQc6oQSWBzqiBJcHPqMEmgeqAqQEmweuAqUEnQcOpgSeBw6nBKAHDqgEoQcOqQSiBw6qBKQHDqsEpgc-rASnB68CrQSpBw6uBKsHPq8ErAewArAErQcOsQSuBw6yBK8HPrMEsgexArQEswe1ArUEtQcftgS2Bx-3BLkHH7gEugcfuQS7Bx-6BL0HH7sEvwc-vATAB7YCvQTCBx--BMQHPr8ExQe3AsAExgcfwQTHBx_CBMgHPsMEywe4AsQEzAe8AsUEzQcexgTOBx7HBM8HHsgE0AceyQTRBx7KBNMHHssE1Qc-zATWB70CzQTaBx7OBNwHPs8E3Qe-AtAE4Ace0QThBx7SBOIHPtME5Qe_AtQE5gfFAtUE5wcQ1gToBxDXBOkHENgE6gcQ2QTrBxDaBO0HENsE7wc-3ATwB8YC3QT1BxDeBPcHPt8E-AfHAuAE_AcQ4QT9BxDiBP4HPuMEgQjIAuQEggjOAuUEhAjPAuYEhQjPAucEiAjPAugEiQjPAukEigjPAuoEjAjPAusEjgg-7ASPCNAC7QSRCM8C7gSTCD7vBJQI0QLwBJUIzwLxBJYIzwLyBJcIPvMEmgjSAvQEmwjWAvUEnAgw9gSdCDD3BJ4IMPgEnwgw-QSgCDD6BKIIMPsEpAg-_ASlCNcC_QSnCDD-BKkIPv8EqgjYAoAFqwgwgQWsCDCCBa0IPoMFsAjZAoQFsQjdAoUFsggxhgWzCDGHBbQIMYgFtQgxiQW2CDGKBbgIMYsFugg-jAW7CN4CjQW9CDGOBb8IPo8FwAjfApAFwQgxkQXCCDGSBcMIPpMFxgjgApQFxwjmApUFyQjnApYFygjnApcFzQjnApgFzgjnApkFzwjnApoF0QjnApsF0wg-nAXUCOgCnQXWCOcCngXYCD6fBdkI6QKgBdoI5wKhBdsI5wKiBdwIPqMF3wjqAqQF4AjuAqUF4gjvAqYF4wjvAqcF5gjvAqgF5wjvAqkF6AjvAqoF6gjvAqsF7Ag-rAXtCPACrQXvCO8CrgXxCD6vBfII8QKwBfMI7wKxBfQI7wKyBfUIPrMF-AjyArQF-Qj2ArUF-wg0tgX8CDS3Bf8INLgFgAk0uQWBCTS6BYMJNLsFhQk-vAWGCfcCvQWICTS-BYoJPr8Fiwn4AsAFjAk0wQWNCTTCBY4JPsMFkQn5AsQFkgn9AsUFkwkzxgWUCTPHBZUJM8gFlgkzyQWXCTPKBZkJM8sFmwk-zAWcCf4CzQWeCTPOBaAJPs8FoQn_AtAFogkz0QWjCTPSBaQJPtMFpwmAA9QFqAmGA9UFqQk21gWqCTbXBasJNtgFrAk22QWtCTbaBa8JNtsFsQk-3AWyCYcD3QW0CTbeBbYJPt8FtwmIA-AFuAk24QW5CTbiBboJPuMFvQmJA-QFvgmPA-UFvwk35gXACTfnBcEJN-gFwgk36QXDCTfqBcUJN-sFxwk-7AXICZAD7QXKCTfuBcwJPu8FzQmRA_AFzgk38QXPCTfyBdAJPvMF0wmSA_QF1AmYAw"
    };
    async function decodeBase64AsWasm(wasmBase64) {
      const { Buffer: Buffer2 } = await import("node:buffer");
      const wasmArray = Buffer2.from(wasmBase64, "base64");
      return new WebAssembly.Module(wasmArray);
    }
    config.compilerWasm = {
      getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
      getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
      },
      importName: "./query_compiler_fast_bg.js"
    };
    function getPrismaClientClass() {
      return runtime.getPrismaClient(config);
    }
  }
});

// dist/src/generated/prisma/internal/prismaNamespace.js
var require_prismaNamespace = __commonJS({
  "dist/src/generated/prisma/internal/prismaNamespace.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VendorScalarFieldEnum = exports2.PhotoScalarFieldEnum = exports2.DailySiteReportScalarFieldEnum = exports2.RmcEntryScalarFieldEnum = exports2.PaymentScalarFieldEnum = exports2.AdvanceAdjustmentScalarFieldEnum = exports2.AdvanceScalarFieldEnum = exports2.WorkRecordScalarFieldEnum = exports2.TeamMemberScalarFieldEnum = exports2.EmploymentTypeScalarFieldEnum = exports2.VehicleServiceLogScalarFieldEnum = exports2.VehicleMovementLogScalarFieldEnum = exports2.VehicleScalarFieldEnum = exports2.MachineryServiceLogScalarFieldEnum = exports2.MachineryMovementLogScalarFieldEnum = exports2.MachineryScalarFieldEnum = exports2.VehicleTypeScalarFieldEnum = exports2.MachineryTypeScalarFieldEnum = exports2.ReturnWastageScalarFieldEnum = exports2.ConsumptionScalarFieldEnum = exports2.MovementScalarFieldEnum = exports2.PurchaseScalarFieldEnum = exports2.SiteStockScalarFieldEnum = exports2.GodownStockScalarFieldEnum = exports2.MaterialSizeScalarFieldEnum = exports2.MaterialScalarFieldEnum = exports2.UnitScalarFieldEnum = exports2.MaterialCategoryScalarFieldEnum = exports2.SiteScalarFieldEnum = exports2.AuditLogScalarFieldEnum = exports2.UserScalarFieldEnum = exports2.TransactionIsolationLevel = exports2.ModelName = exports2.AnyNull = exports2.JsonNull = exports2.DbNull = exports2.NullTypes = exports2.prismaVersion = exports2.getExtensionContext = exports2.Decimal = exports2.Sql = exports2.raw = exports2.join = exports2.empty = exports2.sql = exports2.PrismaClientValidationError = exports2.PrismaClientInitializationError = exports2.PrismaClientRustPanicError = exports2.PrismaClientUnknownRequestError = exports2.PrismaClientKnownRequestError = void 0;
    exports2.defineExtension = exports2.JsonNullValueFilter = exports2.NullsOrder = exports2.QueryMode = exports2.JsonNullValueInput = exports2.SortOrder = exports2.SubcontractorPaymentScalarFieldEnum = exports2.SubcontractorWorkEntryScalarFieldEnum = exports2.SiteContractScalarFieldEnum = exports2.SubcontractorScalarFieldEnum = exports2.ReportScheduleScalarFieldEnum = exports2.NotificationChannelSettingScalarFieldEnum = exports2.ReportDeliveryScalarFieldEnum = exports2.DailyReportScalarFieldEnum = exports2.BrandingConfigScalarFieldEnum = exports2.WasteDisposalScalarFieldEnum = exports2.ExpenseScalarFieldEnum = exports2.ExpenseCategoryScalarFieldEnum = void 0;
    var runtime = __importStar(require("@prisma/client/runtime/client"));
    exports2.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
    exports2.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
    exports2.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
    exports2.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
    exports2.PrismaClientValidationError = runtime.PrismaClientValidationError;
    exports2.sql = runtime.sqltag;
    exports2.empty = runtime.empty;
    exports2.join = runtime.join;
    exports2.raw = runtime.raw;
    exports2.Sql = runtime.Sql;
    exports2.Decimal = runtime.Decimal;
    exports2.getExtensionContext = runtime.Extensions.getExtensionContext;
    exports2.prismaVersion = {
      client: "7.9.1",
      engine: "e922089b7d7502aff4249d5da3420f6fa55fc6ad"
    };
    exports2.NullTypes = {
      DbNull: runtime.NullTypes.DbNull,
      JsonNull: runtime.NullTypes.JsonNull,
      AnyNull: runtime.NullTypes.AnyNull
    };
    exports2.DbNull = runtime.DbNull;
    exports2.JsonNull = runtime.JsonNull;
    exports2.AnyNull = runtime.AnyNull;
    exports2.ModelName = {
      User: "User",
      AuditLog: "AuditLog",
      Site: "Site",
      MaterialCategory: "MaterialCategory",
      Unit: "Unit",
      Material: "Material",
      MaterialSize: "MaterialSize",
      GodownStock: "GodownStock",
      SiteStock: "SiteStock",
      Purchase: "Purchase",
      Movement: "Movement",
      Consumption: "Consumption",
      ReturnWastage: "ReturnWastage",
      MachineryType: "MachineryType",
      VehicleType: "VehicleType",
      Machinery: "Machinery",
      MachineryMovementLog: "MachineryMovementLog",
      MachineryServiceLog: "MachineryServiceLog",
      Vehicle: "Vehicle",
      VehicleMovementLog: "VehicleMovementLog",
      VehicleServiceLog: "VehicleServiceLog",
      EmploymentType: "EmploymentType",
      TeamMember: "TeamMember",
      WorkRecord: "WorkRecord",
      Advance: "Advance",
      AdvanceAdjustment: "AdvanceAdjustment",
      Payment: "Payment",
      RmcEntry: "RmcEntry",
      DailySiteReport: "DailySiteReport",
      Photo: "Photo",
      Vendor: "Vendor",
      ExpenseCategory: "ExpenseCategory",
      Expense: "Expense",
      WasteDisposal: "WasteDisposal",
      BrandingConfig: "BrandingConfig",
      DailyReport: "DailyReport",
      ReportDelivery: "ReportDelivery",
      NotificationChannelSetting: "NotificationChannelSetting",
      ReportSchedule: "ReportSchedule",
      Subcontractor: "Subcontractor",
      SiteContract: "SiteContract",
      SubcontractorWorkEntry: "SubcontractorWorkEntry",
      SubcontractorPayment: "SubcontractorPayment"
    };
    exports2.TransactionIsolationLevel = runtime.makeStrictEnum({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports2.UserScalarFieldEnum = {
      id: "id",
      name: "name",
      email: "email",
      passwordHash: "passwordHash",
      role: "role",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.AuditLogScalarFieldEnum = {
      id: "id",
      occurredAt: "occurredAt",
      userId: "userId",
      method: "method",
      path: "path",
      action: "action",
      entityType: "entityType",
      entityId: "entityId",
      siteId: "siteId"
    };
    exports2.SiteScalarFieldEnum = {
      id: "id",
      name: "name",
      location: "location",
      status: "status",
      contractReference: "contractReference",
      description: "description",
      deletedAt: "deletedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.MaterialCategoryScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.UnitScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.MaterialScalarFieldEnum = {
      id: "id",
      categoryId: "categoryId",
      unitId: "unitId",
      name: "name",
      isActive: "isActive",
      customFields: "customFields",
      lowStockThreshold: "lowStockThreshold"
    };
    exports2.MaterialSizeScalarFieldEnum = {
      id: "id",
      materialId: "materialId",
      label: "label"
    };
    exports2.GodownStockScalarFieldEnum = {
      materialSizeId: "materialSizeId",
      quantity: "quantity",
      updatedAt: "updatedAt"
    };
    exports2.SiteStockScalarFieldEnum = {
      siteId: "siteId",
      materialSizeId: "materialSizeId",
      quantity: "quantity",
      updatedAt: "updatedAt"
    };
    exports2.PurchaseScalarFieldEnum = {
      id: "id",
      vendorId: "vendorId",
      materialSizeId: "materialSizeId",
      destination: "destination",
      siteId: "siteId",
      quantity: "quantity",
      rate: "rate",
      totalAmount: "totalAmount",
      invoiceOrChallanNo: "invoiceOrChallanNo",
      challanPhotoUrl: "challanPhotoUrl",
      paymentStatus: "paymentStatus",
      deliveryLocation: "deliveryLocation",
      vehicleDetails: "vehicleDetails",
      receiverName: "receiverName",
      notes: "notes",
      purchasedAt: "purchasedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.MovementScalarFieldEnum = {
      id: "id",
      kind: "kind",
      materialSizeId: "materialSizeId",
      sourceSiteId: "sourceSiteId",
      destinationSiteId: "destinationSiteId",
      sentQuantity: "sentQuantity",
      receivedQuantity: "receivedQuantity",
      vehicleDetails: "vehicleDetails",
      personResponsible: "personResponsible",
      notes: "notes",
      movedAt: "movedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.ConsumptionScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      materialSizeId: "materialSizeId",
      quantity: "quantity",
      activityReference: "activityReference",
      dailySiteReportId: "dailySiteReportId",
      recordedByUserId: "recordedByUserId",
      notes: "notes",
      consumedAt: "consumedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason",
      clientGeneratedId: "clientGeneratedId"
    };
    exports2.ReturnWastageScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      materialSizeId: "materialSizeId",
      kind: "kind",
      quantity: "quantity",
      notes: "notes",
      recordedAt: "recordedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.MachineryTypeScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.VehicleTypeScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.MachineryScalarFieldEnum = {
      id: "id",
      name: "name",
      typeId: "typeId",
      assetNumber: "assetNumber",
      model: "model",
      ownership: "ownership",
      operator: "operator",
      currentStatus: "currentStatus",
      currentSiteId: "currentSiteId",
      customFields: "customFields"
    };
    exports2.MachineryMovementLogScalarFieldEnum = {
      id: "id",
      machineryId: "machineryId",
      toStatus: "toStatus",
      siteId: "siteId",
      movedAt: "movedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.MachineryServiceLogScalarFieldEnum = {
      id: "id",
      machineryId: "machineryId",
      kind: "kind",
      notes: "notes",
      cost: "cost",
      serviceDate: "serviceDate",
      createdAt: "createdAt"
    };
    exports2.VehicleScalarFieldEnum = {
      id: "id",
      number: "number",
      typeId: "typeId",
      ownership: "ownership",
      driver: "driver",
      currentStatus: "currentStatus",
      currentSiteId: "currentSiteId",
      customFields: "customFields"
    };
    exports2.VehicleMovementLogScalarFieldEnum = {
      id: "id",
      vehicleId: "vehicleId",
      toStatus: "toStatus",
      siteId: "siteId",
      movedAt: "movedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.VehicleServiceLogScalarFieldEnum = {
      id: "id",
      vehicleId: "vehicleId",
      kind: "kind",
      notes: "notes",
      cost: "cost",
      serviceDate: "serviceDate",
      createdAt: "createdAt"
    };
    exports2.EmploymentTypeScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.TeamMemberScalarFieldEnum = {
      id: "id",
      name: "name",
      designation: "designation",
      contact: "contact",
      employmentTypeId: "employmentTypeId",
      isActive: "isActive",
      outstandingAdvanceBalance: "outstandingAdvanceBalance"
    };
    exports2.WorkRecordScalarFieldEnum = {
      id: "id",
      teamMemberId: "teamMemberId",
      siteId: "siteId",
      workDate: "workDate",
      attended: "attended",
      hours: "hours",
      overtimeHours: "overtimeHours",
      dailySiteReportId: "dailySiteReportId",
      createdAt: "createdAt"
    };
    exports2.AdvanceScalarFieldEnum = {
      id: "id",
      teamMemberId: "teamMemberId",
      amount: "amount",
      reason: "reason",
      paymentMethod: "paymentMethod",
      givenAt: "givenAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      correctionReason: "correctionReason"
    };
    exports2.AdvanceAdjustmentScalarFieldEnum = {
      id: "id",
      advanceId: "advanceId",
      paymentId: "paymentId",
      amount: "amount",
      note: "note",
      adjustedAt: "adjustedAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      correctionReason: "correctionReason"
    };
    exports2.PaymentScalarFieldEnum = {
      id: "id",
      teamMemberId: "teamMemberId",
      basePay: "basePay",
      additionalAmount: "additionalAmount",
      deductions: "deductions",
      netPayable: "netPayable",
      payPeriod: "payPeriod",
      status: "status",
      paidAt: "paidAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.RmcEntryScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      vendorId: "vendorId",
      quantityM3: "quantityM3",
      grade: "grade",
      ratePerM3: "ratePerM3",
      totalAmount: "totalAmount",
      invoiceOrChallanNo: "invoiceOrChallanNo",
      challanPhotoUrl: "challanPhotoUrl",
      deliveredAt: "deliveredAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason",
      dailySiteReportId: "dailySiteReportId",
      clientGeneratedId: "clientGeneratedId"
    };
    exports2.DailySiteReportScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      reportDate: "reportDate",
      submittedByUserId: "submittedByUserId",
      workCompleted: "workCompleted",
      workInProgress: "workInProgress",
      plannedWork: "plannedWork",
      issuesBlockers: "issuesBlockers",
      safetyObservations: "safetyObservations",
      notes: "notes",
      createdAt: "createdAt",
      equipmentUsed: "equipmentUsed",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.PhotoScalarFieldEnum = {
      id: "id",
      dailySiteReportId: "dailySiteReportId",
      storageKey: "storageKey",
      uploadedByUserId: "uploadedByUserId",
      createdAt: "createdAt"
    };
    exports2.VendorScalarFieldEnum = {
      id: "id",
      name: "name",
      contactPerson: "contactPerson",
      phone: "phone",
      email: "email",
      address: "address",
      materialsSupplied: "materialsSupplied",
      deletedAt: "deletedAt"
    };
    exports2.ExpenseCategoryScalarFieldEnum = {
      id: "id",
      name: "name",
      isActive: "isActive"
    };
    exports2.ExpenseScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      categoryId: "categoryId",
      amount: "amount",
      description: "description",
      paymentMethod: "paymentMethod",
      personOrVendor: "personOrVendor",
      purchaseId: "purchaseId",
      dailySiteReportId: "dailySiteReportId",
      incurredAt: "incurredAt",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason",
      clientGeneratedId: "clientGeneratedId"
    };
    exports2.WasteDisposalScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      wasteType: "wasteType",
      quantityDetails: "quantityDetails",
      ownership: "ownership",
      vendorId: "vendorId",
      machineryId: "machineryId",
      vehicleId: "vehicleId",
      vehicleDetails: "vehicleDetails",
      tripCount: "tripCount",
      ratePerTrip: "ratePerTrip",
      otherCharges: "otherCharges",
      totalAmount: "totalAmount",
      disposalLocation: "disposalLocation",
      paymentStatus: "paymentStatus",
      notes: "notes",
      disposedAt: "disposedAt",
      recordedByUserId: "recordedByUserId",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.BrandingConfigScalarFieldEnum = {
      id: "id",
      tenantName: "tenantName",
      logoUrl: "logoUrl",
      primaryColor: "primaryColor",
      secondaryColor: "secondaryColor",
      accentColor: "accentColor",
      registeredAddress: "registeredAddress",
      contactPhone: "contactPhone",
      gstin: "gstin",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.DailyReportScalarFieldEnum = {
      id: "id",
      siteId: "siteId",
      dailySiteReportId: "dailySiteReportId",
      reportDate: "reportDate",
      content: "content",
      generatedAt: "generatedAt"
    };
    exports2.ReportDeliveryScalarFieldEnum = {
      id: "id",
      dailyReportId: "dailyReportId",
      channel: "channel",
      status: "status",
      attempts: "attempts",
      lastError: "lastError",
      deliveredAt: "deliveredAt",
      createdAt: "createdAt"
    };
    exports2.NotificationChannelSettingScalarFieldEnum = {
      id: "id",
      channel: "channel",
      enabled: "enabled",
      recipientUserIds: "recipientUserIds"
    };
    exports2.ReportScheduleScalarFieldEnum = {
      id: "id",
      reportType: "reportType",
      frequency: "frequency",
      recipientUserIds: "recipientUserIds",
      enabled: "enabled",
      siteId: "siteId",
      lastRunAt: "lastRunAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.SubcontractorScalarFieldEnum = {
      id: "id",
      name: "name",
      contactPerson: "contactPerson",
      phone: "phone",
      email: "email",
      address: "address",
      workCategories: "workCategories",
      deletedAt: "deletedAt"
    };
    exports2.SiteContractScalarFieldEnum = {
      id: "id",
      subcontractorId: "subcontractorId",
      siteId: "siteId",
      workCategory: "workCategory",
      description: "description",
      rateType: "rateType",
      rateUnitLabel: "rateUnitLabel",
      rate: "rate",
      fixedAmount: "fixedAmount",
      estimatedQuantity: "estimatedQuantity",
      status: "status",
      startDate: "startDate",
      endDate: "endDate",
      quantityCompleted: "quantityCompleted",
      amountPaid: "amountPaid",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.SubcontractorWorkEntryScalarFieldEnum = {
      id: "id",
      siteContractId: "siteContractId",
      quantity: "quantity",
      workDate: "workDate",
      note: "note",
      recordedByUserId: "recordedByUserId",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.SubcontractorPaymentScalarFieldEnum = {
      id: "id",
      siteContractId: "siteContractId",
      type: "type",
      amount: "amount",
      paymentMethod: "paymentMethod",
      paidAt: "paidAt",
      note: "note",
      recordedByUserId: "recordedByUserId",
      createdAt: "createdAt",
      correctsId: "correctsId",
      reason: "reason"
    };
    exports2.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports2.JsonNullValueInput = {
      JsonNull: exports2.JsonNull
    };
    exports2.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports2.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports2.JsonNullValueFilter = {
      DbNull: exports2.DbNull,
      JsonNull: exports2.JsonNull,
      AnyNull: exports2.AnyNull
    };
    exports2.defineExtension = runtime.Extensions.defineExtension;
  }
});

// dist/src/generated/prisma/enums.js
var require_enums = __commonJS({
  "dist/src/generated/prisma/enums.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ContractStatus = exports2.AssetLocationStatus = exports2.ReturnWastageKind = exports2.MovementKind = exports2.PurchaseDestination = exports2.SiteStatus = exports2.Role = void 0;
    exports2.Role = {
      OWNER_ADMIN: "OWNER_ADMIN",
      SITE_SUPERVISOR: "SITE_SUPERVISOR"
    };
    exports2.SiteStatus = {
      ACTIVE: "ACTIVE",
      COMPLETED: "COMPLETED",
      ON_HOLD: "ON_HOLD"
    };
    exports2.PurchaseDestination = {
      GODOWN: "GODOWN",
      SITE: "SITE"
    };
    exports2.MovementKind = {
      GODOWN_TO_SITE: "GODOWN_TO_SITE",
      SITE_TO_SITE: "SITE_TO_SITE"
    };
    exports2.ReturnWastageKind = {
      RETURN: "RETURN",
      WASTAGE: "WASTAGE"
    };
    exports2.AssetLocationStatus = {
      AVAILABLE: "AVAILABLE",
      AT_SITE: "AT_SITE",
      MAINTENANCE: "MAINTENANCE"
    };
    exports2.ContractStatus = {
      DRAFT: "DRAFT",
      ACTIVE: "ACTIVE",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED"
    };
  }
});

// dist/src/generated/prisma/client.js
var require_client = __commonJS({
  "dist/src/generated/prisma/client.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Prisma = exports2.PrismaClient = exports2.$Enums = void 0;
    var $Class = __importStar(require_class());
    var Prisma = __importStar(require_prismaNamespace());
    exports2.Prisma = Prisma;
    exports2.$Enums = __importStar(require_enums());
    __exportStar(require_enums(), exports2);
    exports2.PrismaClient = $Class.getPrismaClientClass();
  }
});

// dist/src/prisma/prisma.service.js
var require_prisma_service = __commonJS({
  "dist/src/prisma/prisma.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PrismaService = void 0;
    var common_1 = require("@nestjs/common");
    var adapter_pg_1 = require("@prisma/adapter-pg");
    var client_1 = require_client();
    var adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
    var PrismaService = class PrismaService extends client_1.PrismaClient {
      constructor() {
        super({ adapter });
      }
      async onModuleInit() {
        await this.$connect();
      }
      async onModuleDestroy() {
        await this.$disconnect();
      }
    };
    exports2.PrismaService = PrismaService;
    exports2.PrismaService = PrismaService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [])
    ], PrismaService);
  }
});

// dist/src/auth/auth.service.js
var require_auth_service = __commonJS({
  "dist/src/auth/auth.service.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuthService = void 0;
    var common_1 = require("@nestjs/common");
    var jwt_1 = require("@nestjs/jwt");
    var bcrypt = __importStar(require("bcryptjs"));
    var prisma_service_1 = require_prisma_service();
    var AuthService = class AuthService {
      prisma;
      jwtService;
      constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
      }
      async login({ email, password }) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new common_1.UnauthorizedException("Invalid email or password.");
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          throw new common_1.UnauthorizedException("Invalid email or password.");
        }
        const payload = { sub: user.id, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        return { token };
      }
    };
    exports2.AuthService = AuthService;
    exports2.AuthService = AuthService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        jwt_1.JwtService
      ])
    ], AuthService);
  }
});

// dist/src/auth/auth.controller.js
var require_auth_controller = __commonJS({
  "dist/src/auth/auth.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuthController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var public_decorator_1 = require_public_decorator();
    var auth_service_1 = require_auth_service();
    var AuthController = class AuthController {
      authService;
      constructor(authService) {
        this.authService = authService;
      }
      login(body) {
        return this.authService.login(body);
      }
    };
    exports2.AuthController = AuthController;
    __decorate([
      (0, public_decorator_1.Public)(),
      (0, common_1.Post)("login"),
      __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.loginSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], AuthController.prototype, "login", null);
    exports2.AuthController = AuthController = __decorate([
      (0, common_1.Controller)("auth"),
      __metadata("design:paramtypes", [auth_service_1.AuthService])
    ], AuthController);
  }
});

// dist/src/auth/auth.module.js
var require_auth_module = __commonJS({
  "dist/src/auth/auth.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuthModule = void 0;
    var common_1 = require("@nestjs/common");
    var jwt_1 = require("@nestjs/jwt");
    var auth_controller_1 = require_auth_controller();
    var auth_service_1 = require_auth_service();
    var AuthModule = class AuthModule {
    };
    exports2.AuthModule = AuthModule;
    exports2.AuthModule = AuthModule = __decorate([
      (0, common_1.Module)({
        imports: [
          jwt_1.JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "30d" }
          })
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService]
      })
    ], AuthModule);
  }
});

// dist/src/auth/custom-auth.guard.js
var require_custom_auth_guard = __commonJS({
  "dist/src/auth/custom-auth.guard.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CustomAuthGuard = void 0;
    var common_1 = require("@nestjs/common");
    var core_12 = require("@nestjs/core");
    var jwt_1 = require("@nestjs/jwt");
    var prisma_service_1 = require_prisma_service();
    var public_decorator_1 = require_public_decorator();
    var CustomAuthGuard = class CustomAuthGuard {
      reflector;
      jwtService;
      prisma;
      constructor(reflector, jwtService, prisma) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.prisma = prisma;
      }
      async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass()
        ]);
        if (isPublic)
          return true;
        const request = context.switchToHttp().getRequest();
        const header = request.headers?.authorization;
        const authorization = Array.isArray(header) ? header[0] : header;
        if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
          throw new common_1.UnauthorizedException();
        }
        const token = authorization.slice("Bearer ".length).trim();
        if (!token) {
          throw new common_1.UnauthorizedException();
        }
        let payload;
        try {
          payload = await this.jwtService.verifyAsync(token);
        } catch {
          throw new common_1.UnauthorizedException();
        }
        if (typeof payload.sub !== "string" || payload.sub.length === 0) {
          throw new common_1.UnauthorizedException();
        }
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub }
        });
        if (!user) {
          throw new common_1.UnauthorizedException();
        }
        request.user = { id: user.id, role: user.role };
        return true;
      }
    };
    exports2.CustomAuthGuard = CustomAuthGuard;
    exports2.CustomAuthGuard = CustomAuthGuard = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        core_12.Reflector,
        jwt_1.JwtService,
        prisma_service_1.PrismaService
      ])
    ], CustomAuthGuard);
  }
});

// dist/src/prisma/prisma.module.js
var require_prisma_module = __commonJS({
  "dist/src/prisma/prisma.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PrismaModule = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var PrismaModule = class PrismaModule {
    };
    exports2.PrismaModule = PrismaModule;
    exports2.PrismaModule = PrismaModule = __decorate([
      (0, common_1.Global)(),
      (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService]
      })
    ], PrismaModule);
  }
});

// dist/src/auth/current-user.decorator.js
var require_current_user_decorator = __commonJS({
  "dist/src/auth/current-user.decorator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CurrentUser = void 0;
    var common_1 = require("@nestjs/common");
    exports2.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    });
  }
});

// dist/src/storage/cloudinary-client.js
var require_cloudinary_client = __commonJS({
  "dist/src/storage/cloudinary-client.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cloudinary = void 0;
    exports2.cloudinaryUrl = cloudinaryUrl;
    var cloudinary_1 = require("cloudinary");
    Object.defineProperty(exports2, "cloudinary", { enumerable: true, get: function() {
      return cloudinary_1.v2;
    } });
    var config = { secure: true };
    if (process.env.CLOUDINARY_CLOUD_NAME)
      config.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    if (process.env.CLOUDINARY_API_KEY)
      config.api_key = process.env.CLOUDINARY_API_KEY;
    if (process.env.CLOUDINARY_API_SECRET)
      config.api_secret = process.env.CLOUDINARY_API_SECRET;
    cloudinary_1.v2.config(config);
    function cloudinaryUrl(publicId) {
      const cloudName = cloudinary_1.v2.config().cloud_name ?? process.env.CLOUDINARY_CLOUD_NAME ?? "cloud";
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
    }
  }
});

// dist/src/storage/storage.service.js
var require_storage_service = __commonJS({
  "dist/src/storage/storage.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StorageService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var cloudinary_client_1 = require_cloudinary_client();
    var StorageService = class StorageService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      signUpload(publicId) {
        const timestamp = Math.floor(Date.now() / 1e3);
        const { cloud_name, api_key, api_secret } = cloudinary_client_1.cloudinary.config();
        const signature = cloudinary_client_1.cloudinary.utils.api_sign_request({ public_id: publicId, timestamp }, api_secret ?? "");
        return {
          uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name ?? ""}/image/upload`,
          apiKey: api_key ?? "",
          timestamp,
          signature,
          publicId,
          storageKey: publicId
        };
      }
      async presignUpload(input) {
        const dsr = await this.prisma.dailySiteReport.findUnique({
          where: { id: input.dailySiteReportId }
        });
        if (!dsr) {
          throw new common_1.NotFoundException(`Daily Site Report ${input.dailySiteReportId} not found`);
        }
        const publicId = `dsr/${input.dailySiteReportId}/${crypto.randomUUID()}`;
        return this.signUpload(publicId);
      }
      presignBrandingLogoUpload() {
        const publicId = `branding/logo/${crypto.randomUUID()}`;
        return {
          ...this.signUpload(publicId),
          logoUrl: (0, cloudinary_client_1.cloudinaryUrl)(publicId)
        };
      }
      presignChallanUpload() {
        const publicId = `challan/${crypto.randomUUID()}`;
        return {
          ...this.signUpload(publicId),
          challanPhotoUrl: (0, cloudinary_client_1.cloudinaryUrl)(publicId)
        };
      }
      async confirmUpload(input, uploadedByUserId) {
        const dsr = await this.prisma.dailySiteReport.findUnique({
          where: { id: input.dailySiteReportId }
        });
        if (!dsr) {
          throw new common_1.NotFoundException(`Daily Site Report ${input.dailySiteReportId} not found`);
        }
        return this.prisma.photo.create({
          data: {
            dailySiteReportId: input.dailySiteReportId,
            storageKey: input.storageKey,
            uploadedByUserId
          }
        });
      }
      async getReadUrl(storageKey) {
        return (0, cloudinary_client_1.cloudinaryUrl)(storageKey);
      }
    };
    exports2.StorageService = StorageService;
    exports2.StorageService = StorageService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], StorageService);
  }
});

// dist/src/storage/storage.controller.js
var require_storage_controller = __commonJS({
  "dist/src/storage/storage.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StorageController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var storage_service_1 = require_storage_service();
    var StorageController = class StorageController {
      storageService;
      constructor(storageService) {
        this.storageService = storageService;
      }
      presign(body) {
        return this.storageService.presignUpload(body);
      }
      presignChallan() {
        return this.storageService.presignChallanUpload();
      }
      confirm(user, body) {
        return this.storageService.confirmUpload(body, user.id);
      }
    };
    exports2.StorageController = StorageController;
    __decorate([
      (0, common_1.Post)("presign"),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.presignPhotoUploadSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], StorageController.prototype, "presign", null);
    __decorate([
      (0, common_1.Post)("challan/presign"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], StorageController.prototype, "presignChallan", null);
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.confirmPhotoUploadSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], StorageController.prototype, "confirm", null);
    exports2.StorageController = StorageController = __decorate([
      (0, common_1.Controller)("photos"),
      __metadata("design:paramtypes", [storage_service_1.StorageService])
    ], StorageController);
  }
});

// dist/src/storage/storage.module.js
var require_storage_module = __commonJS({
  "dist/src/storage/storage.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StorageModule = void 0;
    var common_1 = require("@nestjs/common");
    var storage_controller_1 = require_storage_controller();
    var storage_service_1 = require_storage_service();
    var StorageModule = class StorageModule {
    };
    exports2.StorageModule = StorageModule;
    exports2.StorageModule = StorageModule = __decorate([
      (0, common_1.Module)({
        controllers: [storage_controller_1.StorageController],
        providers: [storage_service_1.StorageService],
        exports: [storage_service_1.StorageService]
      })
    ], StorageModule);
  }
});

// dist/src/auth/roles.decorator.js
var require_roles_decorator = __commonJS({
  "dist/src/auth/roles.decorator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Roles = exports2.ROLES_KEY = void 0;
    var common_1 = require("@nestjs/common");
    exports2.ROLES_KEY = "roles";
    var Roles = (...roles) => (0, common_1.SetMetadata)(exports2.ROLES_KEY, roles);
    exports2.Roles = Roles;
  }
});

// dist/src/auth/roles.guard.js
var require_roles_guard = __commonJS({
  "dist/src/auth/roles.guard.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RolesGuard = void 0;
    var common_1 = require("@nestjs/common");
    var core_12 = require("@nestjs/core");
    var roles_decorator_1 = require_roles_decorator();
    var RolesGuard = class RolesGuard {
      reflector;
      constructor(reflector) {
        this.reflector = reflector;
      }
      canActivate(context) {
        const required = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!required || required.length === 0)
          return true;
        const request = context.switchToHttp().getRequest();
        const role = request.user?.role;
        if (!role || !required.includes(role)) {
          throw new common_1.ForbiddenException();
        }
        return true;
      }
    };
    exports2.RolesGuard = RolesGuard;
    exports2.RolesGuard = RolesGuard = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [core_12.Reflector])
    ], RolesGuard);
  }
});

// dist/src/common/pagination.js
var require_pagination = __commonJS({
  "dist/src/common/pagination.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.paginationParams = paginationParams;
    var DEFAULT_PAGE_SIZE = 25;
    var MAX_PAGE_SIZE = 100;
    var MAX_PAGE = 1e4;
    function positiveInteger(value, fallback, max) {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
      }
      return max ? Math.min(parsed, max) : parsed;
    }
    function paginationParams(page, pageSize) {
      if (page === void 0 && pageSize === void 0) {
        return { paginated: false };
      }
      const safePage = positiveInteger(page, 1, MAX_PAGE);
      const safePageSize = positiveInteger(pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      return {
        paginated: true,
        page: safePage,
        pageSize: safePageSize,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
      };
    }
  }
});

// dist/src/common/sort-order.js
var require_sort_order = __commonJS({
  "dist/src/common/sort-order.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isSortOrder = isSortOrder;
    function isSortOrder(value) {
      return value === "asc" || value === "desc";
    }
  }
});

// dist/src/common/date-range.js
var require_date_range = __commonJS({
  "dist/src/common/date-range.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.dateRangeBounds = dateRangeBounds;
    function dateRangeBounds(from, to) {
      const bounds = {};
      if (from) {
        bounds.gte = new Date(from);
      }
      if (to) {
        const end = new Date(to);
        end.setUTCDate(end.getUTCDate() + 1);
        bounds.lt = end;
      }
      return bounds.gte || bounds.lt ? bounds : void 0;
    }
  }
});

// dist/src/common/superseded-dsrs.js
var require_superseded_dsrs = __commonJS({
  "dist/src/common/superseded-dsrs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.supersededDsrIds = supersededDsrIds;
    exports2.currentDsrRowsWhere = currentDsrRowsWhere;
    async function supersededDsrIds(db) {
      const corrections = await db.dailySiteReport.findMany({
        where: { correctsId: { not: null } },
        select: { correctsId: true }
      });
      return corrections.map((row) => row.correctsId).filter((id) => id !== null);
    }
    function currentDsrRowsWhere(superseded) {
      return {
        OR: [
          { dailySiteReportId: null },
          { dailySiteReportId: { notIn: superseded } }
        ]
      };
    }
  }
});

// dist/src/sites/site-activity-feed.js
var require_site_activity_feed = __commonJS({
  "dist/src/sites/site-activity-feed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getSiteActivityFeed = getSiteActivityFeed;
    var date_range_1 = require_date_range();
    var superseded_dsrs_1 = require_superseded_dsrs();
    function workEntryUnitLabel(contract) {
      if (contract.rateType === "PER_TRIP")
        return "trips";
      if (contract.rateType === "PER_PIPE")
        return "pipes";
      return contract.rateUnitLabel ?? "units";
    }
    async function getSiteActivityFeed(prisma, siteId, range = {}) {
      const bounds = (0, date_range_1.dateRangeBounds)(range.from, range.to);
      const currentRows = (0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(prisma));
      const [purchases, movements, consumptions, returnWastages, workRecords, expenses, rmcEntries, dsrs, machineryMoves, vehicleMoves, wasteDisposals, siteContracts, subcontractorWorkEntries, subcontractorPayments] = await Promise.all([
        prisma.purchase.findMany({
          where: { siteId, purchasedAt: bounds },
          include: { materialSize: { include: { material: true } }, vendor: true }
        }),
        prisma.movement.findMany({
          where: {
            OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }],
            movedAt: bounds
          },
          include: {
            materialSize: { include: { material: true } },
            sourceSite: true,
            destinationSite: true
          }
        }),
        prisma.consumption.findMany({
          where: { siteId, consumedAt: bounds, ...currentRows },
          include: { materialSize: { include: { material: true } } }
        }),
        prisma.returnWastage.findMany({
          where: { siteId, recordedAt: bounds },
          include: { materialSize: { include: { material: true } } }
        }),
        prisma.workRecord.findMany({
          where: { siteId, workDate: bounds, ...currentRows },
          include: { teamMember: true }
        }),
        prisma.expense.findMany({
          where: { siteId, incurredAt: bounds, ...currentRows },
          include: { category: true }
        }),
        prisma.rmcEntry.findMany({
          where: { siteId, deliveredAt: bounds, ...currentRows },
          include: { vendor: true }
        }),
        prisma.dailySiteReport.findMany({
          where: { siteId, reportDate: bounds },
          include: { submittedBy: true, photos: true }
        }),
        prisma.machineryMovementLog.findMany({
          where: { siteId, movedAt: bounds },
          include: { machinery: true }
        }),
        prisma.vehicleMovementLog.findMany({
          where: { siteId, movedAt: bounds },
          include: { vehicle: { include: { type: true } } }
        }),
        prisma.wasteDisposal.findMany({
          where: { siteId, disposedAt: bounds },
          include: { vendor: true }
        }),
        prisma.siteContract.findMany({
          where: {
            siteId,
            OR: [{ createdAt: bounds }, { updatedAt: bounds }]
          },
          include: { subcontractor: true }
        }),
        prisma.subcontractorWorkEntry.findMany({
          where: { siteContract: { siteId }, workDate: bounds },
          include: { siteContract: { include: { subcontractor: true } } }
        }),
        prisma.subcontractorPayment.findMany({
          where: { siteContract: { siteId }, paidAt: bounds },
          include: { siteContract: { include: { subcontractor: true } } }
        })
      ]);
      const items = [
        ...purchases.map((p) => ({
          id: p.id,
          type: "PURCHASE",
          occurredAt: p.purchasedAt.toISOString(),
          summary: `${p.materialSize.material.name} (${p.materialSize.label}), ${p.quantity.toString()} \u2014 from ${p.vendor.name}`,
          amount: p.totalAmount?.toNumber() ?? null
        })),
        ...movements.map((m) => ({
          id: m.id,
          type: "MOVEMENT",
          occurredAt: m.movedAt.toISOString(),
          summary: `${m.materialSize.material.name} (${m.materialSize.label}), ${m.sentQuantity.toString()} \u2014 ${m.sourceSite?.name ?? "Godown"} \u2192 ${m.destinationSite.name}`,
          amount: null
        })),
        ...consumptions.map((c) => ({
          id: c.id,
          type: "CONSUMPTION",
          occurredAt: c.consumedAt.toISOString(),
          summary: `${c.materialSize.material.name} (${c.materialSize.label}), ${c.quantity.toString()} consumed on site`,
          amount: null
        })),
        ...returnWastages.map((r) => ({
          id: r.id,
          type: "RETURN_WASTAGE",
          occurredAt: r.recordedAt.toISOString(),
          summary: `${r.kind === "WASTAGE" ? "Wastage" : "Return"}: ${r.materialSize.material.name} (${r.materialSize.label}), ${r.quantity.toString()}`,
          amount: null
        })),
        ...workRecords.map((w) => ({
          id: w.id,
          type: "WORK_RECORD",
          occurredAt: w.workDate.toISOString(),
          summary: `${w.teamMember.name} \u2014 ${w.attended ? "present" : "absent"}${w.hours ? `, ${w.hours.toString()} hrs` : ""}`,
          amount: null
        })),
        ...expenses.map((e) => ({
          id: e.id,
          type: "EXPENSE",
          occurredAt: e.incurredAt.toISOString(),
          summary: e.description ?? `${e.category.name} expense`,
          amount: e.amount.toNumber()
        })),
        ...rmcEntries.map((r) => ({
          id: r.id,
          type: "RMC",
          occurredAt: r.deliveredAt.toISOString(),
          summary: `RMC delivery, ${r.quantityM3.toString()} m\xB3 (${r.grade}) \u2014 ${r.vendor.name}`,
          amount: r.totalAmount.toNumber()
        })),
        ...dsrs.map((d) => ({
          id: d.id,
          type: "DSR",
          occurredAt: d.reportDate.toISOString(),
          summary: (d.workCompleted ? `Daily Site Report \u2014 ${d.workCompleted}` : "Daily Site Report submitted") + ` (${d.submittedBy.name})` + (d.photos.length > 0 ? ` \xB7 ${d.photos.length} photo${d.photos.length === 1 ? "" : "s"}` : ""),
          amount: null
        })),
        ...machineryMoves.map((m) => ({
          id: m.id,
          type: "MACHINERY_MOVEMENT",
          occurredAt: m.movedAt.toISOString(),
          summary: `${m.machinery.name} (${m.machinery.assetNumber}) \u2014 ${m.toStatus.replace("_", " ").toLowerCase()}`,
          amount: null
        })),
        ...vehicleMoves.map((v) => ({
          id: v.id,
          type: "VEHICLE_MOVEMENT",
          occurredAt: v.movedAt.toISOString(),
          summary: `${v.vehicle.type.name} ${v.vehicle.number} \u2014 ${v.toStatus.replace("_", " ").toLowerCase()}`,
          amount: null
        })),
        ...wasteDisposals.map((w) => ({
          id: w.id,
          type: "WASTE_DISPOSAL",
          occurredAt: w.disposedAt.toISOString(),
          summary: `${w.wasteType} disposal \u2014 ${w.tripCount} trip${Math.abs(w.tripCount) === 1 ? "" : "s"}${w.vendor ? ` by ${w.vendor.name}` : " (own vehicle)"}${w.disposalLocation ? ` to ${w.disposalLocation}` : ""}`,
          amount: w.totalAmount.toNumber()
        })),
        ...siteContracts.map((c) => ({
          id: c.id,
          type: "SITE_CONTRACT",
          occurredAt: c.updatedAt.toISOString(),
          summary: `${c.subcontractor.name} engaged${c.workCategory ? ` \u2014 ${c.workCategory}` : ""} (${c.status.replace("_", " ").toLowerCase()})`,
          amount: null
        })),
        ...subcontractorWorkEntries.map((e) => ({
          id: e.id,
          type: "WORK_ENTRY",
          occurredAt: e.workDate.toISOString(),
          summary: `${e.siteContract.subcontractor.name} \u2014 ${e.quantity.toString()} ${workEntryUnitLabel(e.siteContract)}${e.siteContract.workCategory ? ` (${e.siteContract.workCategory})` : ""} logged`,
          amount: null
        })),
        ...subcontractorPayments.map((p) => ({
          id: p.id,
          type: "SUBCONTRACTOR_PAYMENT",
          occurredAt: p.paidAt.toISOString(),
          summary: `${p.type === "ADVANCE" ? "Advance" : "Payment"} to ${p.siteContract.subcontractor.name}${p.siteContract.workCategory ? ` \u2014 ${p.siteContract.workCategory}` : ""}`,
          amount: p.amount.toNumber()
        }))
      ];
      return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    }
  }
});

// dist/src/sites/site-photo-gallery.js
var require_site_photo_gallery = __commonJS({
  "dist/src/sites/site-photo-gallery.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getSitePhotoGallery = getSitePhotoGallery;
    var date_range_1 = require_date_range();
    async function getSitePhotoGallery(prisma, storage, siteId, range = {}) {
      const bounds = (0, date_range_1.dateRangeBounds)(range.from, range.to);
      const photos = await prisma.photo.findMany({
        where: { dailySiteReport: { siteId, reportDate: bounds } },
        include: { dailySiteReport: true, uploadedBy: true },
        orderBy: [
          { dailySiteReport: { reportDate: "desc" } },
          { createdAt: "desc" }
        ]
      });
      return Promise.all(photos.map(async (photo) => ({
        id: photo.id,
        url: await storage.getReadUrl(photo.storageKey),
        reportDate: photo.dailySiteReport.reportDate.toISOString().slice(0, 10),
        dailySiteReportId: photo.dailySiteReportId,
        uploaderName: photo.uploadedBy.name,
        createdAt: photo.createdAt.toISOString()
      })));
    }
  }
});

// dist/src/sites/sites.service.js
var require_sites_service = __commonJS({
  "dist/src/sites/sites.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SitesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var storage_service_1 = require_storage_service();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var site_activity_feed_1 = require_site_activity_feed();
    var site_photo_gallery_1 = require_site_photo_gallery();
    var SITE_SORT_FIELDS = ["name", "location", "status", "createdAt"];
    function isSiteSortField(value) {
      return Boolean(value) && SITE_SORT_FIELDS.includes(value);
    }
    var SITE_STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED"];
    function isSiteStatus(value) {
      return Boolean(value) && SITE_STATUSES.includes(value);
    }
    var SitesService = class SitesService {
      prisma;
      storage;
      constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
      }
      create(input) {
        return this.prisma.site.create({
          data: {
            name: input.name,
            location: input.location,
            status: input.status,
            contractReference: input.contractReference,
            description: input.description
          }
        });
      }
      list(query = {}) {
        const { status, q, page, pageSize, sort, order } = query;
        const where = {
          deletedAt: null,
          ...isSiteStatus(status) ? { status } : {},
          ...q ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              {
                contractReference: {
                  contains: q,
                  mode: "insensitive"
                }
              }
            ]
          } : {}
        };
        const orderBy = isSiteSortField(sort) ? { [sort]: (0, sort_order_1.isSortOrder)(order) ? order : "asc" } : { createdAt: "desc" };
        const pagination = (0, pagination_1.paginationParams)(page, pageSize);
        if (!pagination.paginated) {
          return this.prisma.site.findMany({ where, orderBy });
        }
        return Promise.all([
          this.prisma.site.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.site.count({ where })
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      async searchCandidates(q) {
        const where = {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { contractReference: { contains: q, mode: "insensitive" } }
          ]
        };
        const [candidates, total] = await Promise.all([
          this.prisma.site.findMany({ where, orderBy: { name: "asc" }, take: 200 }),
          this.prisma.site.count({ where })
        ]);
        return { candidates, total };
      }
      async update(id, input) {
        const existing = await this.prisma.site.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        try {
          return await this.prisma.site.update({ where: { id }, data: input });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Site ${id} not found`);
          }
          throw error;
        }
      }
      async findOne(id) {
        const site = await this.prisma.site.findUnique({ where: { id } });
        if (!site || site.deletedAt) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        const feed = await (0, site_activity_feed_1.getSiteActivityFeed)(this.prisma, id);
        return { ...site, feed };
      }
      async getPhotos(id) {
        const site = await this.prisma.site.findUnique({ where: { id } });
        if (!site || site.deletedAt) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        return (0, site_photo_gallery_1.getSitePhotoGallery)(this.prisma, this.storage, id);
      }
      async softDelete(id) {
        const site = await this.prisma.site.findUnique({ where: { id } });
        if (!site || site.deletedAt) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        return this.prisma.site.update({
          where: { id },
          data: { deletedAt: /* @__PURE__ */ new Date() }
        });
      }
    };
    exports2.SitesService = SitesService;
    exports2.SitesService = SitesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        storage_service_1.StorageService
      ])
    ], SitesService);
  }
});

// dist/src/sites/sites.controller.js
var require_sites_controller = __commonJS({
  "dist/src/sites/sites.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SitesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var sites_service_1 = require_sites_service();
    var SitesController = class SitesController {
      sitesService;
      constructor(sitesService) {
        this.sitesService = sitesService;
      }
      create(body) {
        return this.sitesService.create(body);
      }
      list(status, q, page, pageSize, sort, order) {
        return this.sitesService.list({ status, q, page, pageSize, sort, order });
      }
      update(id, body) {
        return this.sitesService.update(id, body);
      }
      findOne(id) {
        return this.sitesService.findOne(id);
      }
      getPhotos(id) {
        return this.sitesService.getPhotos(id);
      }
      remove(id) {
        return this.sitesService.softDelete(id);
      }
    };
    exports2.SitesController = SitesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createSiteSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("status")),
      __param(1, (0, common_1.Query)("q")),
      __param(2, (0, common_1.Query)("page")),
      __param(3, (0, common_1.Query)("pageSize")),
      __param(4, (0, common_1.Query)("sort")),
      __param(5, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateSiteSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "update", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Get)(":id/photos"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "getPhotos", null);
    __decorate([
      (0, common_1.Delete)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SitesController.prototype, "remove", null);
    exports2.SitesController = SitesController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, common_1.Controller)("sites"),
      __metadata("design:paramtypes", [sites_service_1.SitesService])
    ], SitesController);
  }
});

// dist/src/sites/sites.module.js
var require_sites_module = __commonJS({
  "dist/src/sites/sites.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SitesModule = void 0;
    var common_1 = require("@nestjs/common");
    var storage_module_1 = require_storage_module();
    var sites_controller_1 = require_sites_controller();
    var sites_service_1 = require_sites_service();
    var SitesModule = class SitesModule {
    };
    exports2.SitesModule = SitesModule;
    exports2.SitesModule = SitesModule = __decorate([
      (0, common_1.Module)({
        imports: [storage_module_1.StorageModule],
        controllers: [sites_controller_1.SitesController],
        providers: [sites_service_1.SitesService],
        exports: [sites_service_1.SitesService]
      })
    ], SitesModule);
  }
});

// dist/src/common/advisory-lock.js
var require_advisory_lock = __commonJS({
  "dist/src/common/advisory-lock.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.lockOnKey = lockOnKey;
    async function lockOnKey(tx, key) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
    }
  }
});

// dist/src/inventory/stock-delta.js
var require_stock_delta = __commonJS({
  "dist/src/inventory/stock-delta.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decrementStockWithFloorCheck = decrementStockWithFloorCheck;
    exports2.applySiteStockDelta = applySiteStockDelta;
    var common_1 = require("@nestjs/common");
    async function decrementStockWithFloorCheck(tx, target, quantity, insufficientMessage) {
      const result = target.model === "godownStock" ? await tx.godownStock.updateMany({
        where: {
          materialSizeId: target.materialSizeId,
          quantity: { gte: quantity }
        },
        data: { quantity: { decrement: quantity } }
      }) : await tx.siteStock.updateMany({
        where: {
          siteId: target.siteId,
          materialSizeId: target.materialSizeId,
          quantity: { gte: quantity }
        },
        data: { quantity: { decrement: quantity } }
      });
      if (result.count === 0) {
        throw new common_1.BadRequestException({
          error: { code: "INSUFFICIENT_STOCK", message: insufficientMessage }
        });
      }
    }
    async function applySiteStockDelta(tx, siteId, materialSizeId, delta, insufficientMessage) {
      if (delta === 0) {
        return;
      }
      if (delta > 0) {
        await decrementStockWithFloorCheck(tx, { model: "siteStock", siteId, materialSizeId }, delta, insufficientMessage);
        return;
      }
      await tx.siteStock.upsert({
        where: { siteId_materialSizeId: { siteId, materialSizeId } },
        update: { quantity: { increment: -delta } },
        create: { siteId, materialSizeId, quantity: -delta }
      });
    }
  }
});

// dist/src/dsr/dsr.service.js
var require_dsr_service = __commonJS({
  "dist/src/dsr/dsr.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DsrService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var advisory_lock_1 = require_advisory_lock();
    var date_range_1 = require_date_range();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var stock_delta_1 = require_stock_delta();
    var storage_service_1 = require_storage_service();
    var DsrService = class DsrService {
      prisma;
      storage;
      constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
      }
      async assertNoDoubleBooking(tx, teamMemberId, workDate, siteId) {
        await (0, advisory_lock_1.lockOnKey)(tx, `workrecord:${teamMemberId}:${workDate.toISOString()}`);
        const existing = await tx.workRecord.findFirst({
          where: { teamMemberId, workDate }
        });
        if (existing && existing.siteId !== siteId) {
          throw new common_1.ConflictException("A crew member is already recorded at another Site on this date");
        }
      }
      sortedWorkRecords(input) {
        return [...input.workRecords].sort((a, b) => a.teamMemberId.localeCompare(b.teamMemberId));
      }
      async create(input, submittedByUserId) {
        const reportDate = new Date(input.reportDate);
        try {
          return await this.prisma.$transaction(async (tx) => {
            await (0, advisory_lock_1.lockOnKey)(tx, `dsr:${input.siteId}:${input.reportDate}`);
            const existingOriginal = await tx.dailySiteReport.findFirst({
              where: { siteId: input.siteId, reportDate, correctsId: null }
            });
            const dsrData = {
              workCompleted: input.workCompleted,
              workInProgress: input.workInProgress,
              plannedWork: input.plannedWork,
              issuesBlockers: input.issuesBlockers,
              safetyObservations: input.safetyObservations,
              notes: input.notes,
              equipmentUsed: input.equipmentUsed
            };
            const dsr = existingOriginal ? await tx.dailySiteReport.update({
              where: { id: existingOriginal.id },
              data: dsrData
            }) : await tx.dailySiteReport.create({
              data: {
                siteId: input.siteId,
                reportDate,
                submittedByUserId,
                ...dsrData
              }
            });
            for (const workRecord of this.sortedWorkRecords(input)) {
              await this.assertNoDoubleBooking(tx, workRecord.teamMemberId, reportDate, input.siteId);
              const existingWorkRecord = await tx.workRecord.findFirst({
                where: {
                  teamMemberId: workRecord.teamMemberId,
                  workDate: reportDate,
                  siteId: input.siteId
                }
              });
              const workRecordData = {
                attended: workRecord.attended,
                hours: workRecord.hours,
                overtimeHours: workRecord.overtimeHours,
                dailySiteReportId: dsr.id
              };
              if (existingWorkRecord) {
                await tx.workRecord.update({
                  where: { id: existingWorkRecord.id },
                  data: workRecordData
                });
              } else {
                await tx.workRecord.create({
                  data: {
                    teamMemberId: workRecord.teamMemberId,
                    siteId: input.siteId,
                    workDate: reportDate,
                    ...workRecordData
                  }
                });
              }
            }
            for (const consumption of input.consumptions) {
              const data = {
                siteId: input.siteId,
                materialSizeId: consumption.materialSizeId,
                quantity: consumption.quantity,
                activityReference: consumption.activityReference,
                dailySiteReportId: dsr.id,
                recordedByUserId: submittedByUserId,
                consumedAt: reportDate
              };
              const existing = consumption.clientGeneratedId ? await tx.consumption.findUnique({
                where: { clientGeneratedId: consumption.clientGeneratedId }
              }) : null;
              if (consumption.clientGeneratedId) {
                await tx.consumption.upsert({
                  where: { clientGeneratedId: consumption.clientGeneratedId },
                  update: data,
                  create: {
                    ...data,
                    clientGeneratedId: consumption.clientGeneratedId
                  }
                });
              } else {
                await tx.consumption.create({ data });
              }
              if (existing && existing.materialSizeId !== consumption.materialSizeId) {
                await (0, stock_delta_1.applySiteStockDelta)(tx, existing.siteId, existing.materialSizeId, -existing.quantity.toNumber(), "Not enough Site Stock for this Consumption.");
                await (0, stock_delta_1.applySiteStockDelta)(tx, input.siteId, consumption.materialSizeId, consumption.quantity, "Not enough Site Stock for this Consumption.");
              } else {
                await (0, stock_delta_1.applySiteStockDelta)(tx, input.siteId, consumption.materialSizeId, consumption.quantity - (existing?.quantity.toNumber() ?? 0), "Not enough Site Stock for this Consumption.");
              }
            }
            for (const rmc of input.rmcEntries) {
              const totalAmount = rmc.quantityM3 * rmc.ratePerM3;
              const data = {
                siteId: input.siteId,
                vendorId: rmc.vendorId,
                quantityM3: rmc.quantityM3,
                grade: rmc.grade,
                ratePerM3: rmc.ratePerM3,
                totalAmount,
                deliveredAt: reportDate,
                dailySiteReportId: dsr.id
              };
              if (rmc.clientGeneratedId) {
                await tx.rmcEntry.upsert({
                  where: { clientGeneratedId: rmc.clientGeneratedId },
                  update: data,
                  create: { ...data, clientGeneratedId: rmc.clientGeneratedId }
                });
              } else {
                await tx.rmcEntry.create({ data });
              }
            }
            for (const expense of input.expenses) {
              const data = {
                siteId: input.siteId,
                categoryId: expense.categoryId,
                amount: expense.amount,
                description: expense.description,
                paymentMethod: expense.paymentMethod,
                personOrVendor: expense.personOrVendor,
                dailySiteReportId: dsr.id,
                incurredAt: reportDate
              };
              if (expense.clientGeneratedId) {
                await tx.expense.upsert({
                  where: { clientGeneratedId: expense.clientGeneratedId },
                  update: data,
                  create: { ...data, clientGeneratedId: expense.clientGeneratedId }
                });
              } else {
                await tx.expense.create({ data });
              }
            }
            return tx.dailySiteReport.findUniqueOrThrow({
              where: { id: dsr.id },
              include: {
                workRecords: true,
                consumptions: true,
                rmcEntries: true,
                expenses: true
              }
            });
          });
        } catch (error) {
          if (error instanceof common_1.ConflictException) {
            throw error;
          }
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new common_1.ConflictException("This record conflicts with an existing one");
          }
          throw error;
        }
      }
      async correct(originalId, input, reason, submittedByUserId) {
        const original = await this.prisma.dailySiteReport.findUnique({
          where: { id: originalId }
        });
        if (!original) {
          throw new common_1.NotFoundException(`Daily Site Report ${originalId} not found`);
        }
        const originalDateStr = original.reportDate.toISOString().slice(0, 10);
        if (input.siteId !== original.siteId || input.reportDate !== originalDateStr) {
          throw new common_1.BadRequestException("A correction must keep the same Site and date as the report it corrects");
        }
        const reportDate = new Date(input.reportDate);
        try {
          return await this.prisma.$transaction(async (tx) => {
            await (0, advisory_lock_1.lockOnKey)(tx, `dsr:${input.siteId}:${input.reportDate}`);
            const alreadyCorrected = await tx.dailySiteReport.findFirst({
              where: { correctsId: originalId },
              select: { id: true }
            });
            if (alreadyCorrected) {
              throw new common_1.ConflictException("This report has already been corrected \u2014 correct the latest version instead");
            }
            const dsr = await tx.dailySiteReport.create({
              data: {
                siteId: input.siteId,
                reportDate,
                submittedByUserId,
                workCompleted: input.workCompleted,
                workInProgress: input.workInProgress,
                plannedWork: input.plannedWork,
                issuesBlockers: input.issuesBlockers,
                safetyObservations: input.safetyObservations,
                notes: input.notes,
                equipmentUsed: input.equipmentUsed,
                correctsId: originalId,
                reason
              }
            });
            for (const workRecord of this.sortedWorkRecords(input)) {
              await this.assertNoDoubleBooking(tx, workRecord.teamMemberId, reportDate, input.siteId);
              await tx.workRecord.create({
                data: {
                  teamMemberId: workRecord.teamMemberId,
                  siteId: input.siteId,
                  workDate: reportDate,
                  attended: workRecord.attended,
                  hours: workRecord.hours,
                  overtimeHours: workRecord.overtimeHours,
                  dailySiteReportId: dsr.id
                }
              });
            }
            const supersededConsumptions = await tx.consumption.findMany({
              where: { dailySiteReportId: originalId }
            });
            for (const superseded of supersededConsumptions) {
              await (0, stock_delta_1.applySiteStockDelta)(tx, superseded.siteId, superseded.materialSizeId, -superseded.quantity.toNumber(), "Not enough Site Stock for this Consumption.");
            }
            for (const consumption of input.consumptions) {
              await tx.consumption.create({
                data: {
                  siteId: input.siteId,
                  materialSizeId: consumption.materialSizeId,
                  quantity: consumption.quantity,
                  activityReference: consumption.activityReference,
                  dailySiteReportId: dsr.id,
                  recordedByUserId: submittedByUserId,
                  consumedAt: reportDate
                }
              });
              await (0, stock_delta_1.applySiteStockDelta)(tx, input.siteId, consumption.materialSizeId, consumption.quantity, "Not enough Site Stock for this Consumption.");
            }
            for (const rmc of input.rmcEntries) {
              const totalAmount = rmc.quantityM3 * rmc.ratePerM3;
              await tx.rmcEntry.create({
                data: {
                  siteId: input.siteId,
                  vendorId: rmc.vendorId,
                  quantityM3: rmc.quantityM3,
                  grade: rmc.grade,
                  ratePerM3: rmc.ratePerM3,
                  totalAmount,
                  deliveredAt: reportDate,
                  dailySiteReportId: dsr.id
                }
              });
            }
            for (const expense of input.expenses) {
              await tx.expense.create({
                data: {
                  siteId: input.siteId,
                  categoryId: expense.categoryId,
                  amount: expense.amount,
                  description: expense.description,
                  paymentMethod: expense.paymentMethod,
                  personOrVendor: expense.personOrVendor,
                  dailySiteReportId: dsr.id,
                  incurredAt: reportDate
                }
              });
            }
            return tx.dailySiteReport.findUniqueOrThrow({
              where: { id: dsr.id },
              include: {
                workRecords: true,
                consumptions: true,
                rmcEntries: true,
                expenses: true
              }
            });
          });
        } catch (error) {
          if (error instanceof common_1.ConflictException) {
            throw error;
          }
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new common_1.ConflictException("This record conflicts with an existing one");
          }
          throw error;
        }
      }
      async getCrewDefaults(siteId, beforeDate) {
        const mostRecent = await this.prisma.workRecord.findFirst({
          where: { siteId, workDate: { lt: new Date(beforeDate) } },
          orderBy: { workDate: "desc" },
          select: { workDate: true }
        });
        if (!mostRecent) {
          return [];
        }
        const records = await this.prisma.workRecord.findMany({
          where: {
            siteId,
            workDate: mostRecent.workDate,
            attended: true,
            ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
          },
          include: { teamMember: true }
        });
        return records.map((record) => ({
          teamMemberId: record.teamMemberId,
          name: record.teamMember.name
        }));
      }
      async findCurrentForSiteAndDate(siteId, reportDate) {
        const rows = await this.prisma.dailySiteReport.findMany({
          where: { siteId, reportDate }
        });
        if (rows.length === 0)
          return null;
        const correctedIds = new Set(rows.map((r) => r.correctsId).filter((x) => x !== null));
        return rows.find((r) => !correctedIds.has(r.id)) ?? null;
      }
      async listByDate(date) {
        const rows = await this.prisma.dailySiteReport.findMany({
          where: { reportDate: new Date(date) },
          include: {
            site: { select: { id: true, name: true } },
            submittedBy: { select: { name: true } },
            _count: { select: { workRecords: true, consumptions: true } }
          },
          orderBy: { createdAt: "desc" }
        });
        const correctedIds = new Set(rows.map((r) => r.correctsId).filter((x) => x !== null));
        return rows.filter((r) => !correctedIds.has(r.id));
      }
      async listBySiteInRange(siteId, from, to) {
        const rows = await this.prisma.dailySiteReport.findMany({
          where: { siteId, reportDate: (0, date_range_1.dateRangeBounds)(from, to) },
          include: {
            site: { select: { id: true, name: true } },
            submittedBy: { select: { name: true } },
            _count: { select: { workRecords: true, consumptions: true } }
          },
          orderBy: { reportDate: "desc" }
        });
        const correctedIds = new Set(rows.map((r) => r.correctsId).filter((x) => x !== null));
        return rows.filter((r) => !correctedIds.has(r.id));
      }
      async findOne(id) {
        const dsr = await this.prisma.dailySiteReport.findUnique({
          where: { id },
          include: {
            site: true,
            submittedBy: true,
            workRecords: { include: { teamMember: true } },
            consumptions: {
              include: { materialSize: { include: { material: true } } }
            },
            rmcEntries: { include: { vendor: true } },
            expenses: { include: { category: true } },
            photos: true
          }
        });
        if (!dsr) {
          throw new common_1.NotFoundException(`Daily Site Report ${id} not found`);
        }
        const photos = await Promise.all(dsr.photos.map(async (photo) => ({
          ...photo,
          url: await this.storage.getReadUrl(photo.storageKey)
        })));
        const correction = await this.prisma.dailySiteReport.findFirst({
          where: { correctsId: id },
          select: { id: true }
        });
        return { ...dsr, photos, correctedById: correction?.id ?? null };
      }
    };
    exports2.DsrService = DsrService;
    exports2.DsrService = DsrService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        storage_service_1.StorageService
      ])
    ], DsrService);
  }
});

// dist/src/dsr/dsr.controller.js
var require_dsr_controller = __commonJS({
  "dist/src/dsr/dsr.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DsrController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var dsr_service_1 = require_dsr_service();
    var DsrController = class DsrController {
      dsrService;
      constructor(dsrService) {
        this.dsrService = dsrService;
      }
      create(user, body) {
        return this.dsrService.create(body, user.id);
      }
      correct(user, id, body) {
        const { reason, ...input } = body;
        return this.dsrService.correct(id, input, reason, user.id);
      }
      getDefaults(siteId, date) {
        return this.dsrService.getCrewDefaults(siteId, date);
      }
      list(date) {
        return this.dsrService.listByDate(date);
      }
      findOne(id) {
        return this.dsrService.findOne(id);
      }
    };
    exports2.DsrController = DsrController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createDsrSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], DsrController.prototype, "create", null);
    __decorate([
      (0, common_1.Post)(":id/correct"),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.correctDsrSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Param)("id")),
      __param(2, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, String, Object]),
      __metadata("design:returntype", void 0)
    ], DsrController.prototype, "correct", null);
    __decorate([
      (0, common_1.Get)("defaults"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("date")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String]),
      __metadata("design:returntype", void 0)
    ], DsrController.prototype, "getDefaults", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("date")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], DsrController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], DsrController.prototype, "findOne", null);
    exports2.DsrController = DsrController = __decorate([
      (0, common_1.Controller)("dsr"),
      __metadata("design:paramtypes", [dsr_service_1.DsrService])
    ], DsrController);
  }
});

// dist/src/dsr/dsr.module.js
var require_dsr_module = __commonJS({
  "dist/src/dsr/dsr.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DsrModule = void 0;
    var common_1 = require("@nestjs/common");
    var storage_module_1 = require_storage_module();
    var dsr_controller_1 = require_dsr_controller();
    var dsr_service_1 = require_dsr_service();
    var DsrModule = class DsrModule {
    };
    exports2.DsrModule = DsrModule;
    exports2.DsrModule = DsrModule = __decorate([
      (0, common_1.Module)({
        imports: [storage_module_1.StorageModule],
        controllers: [dsr_controller_1.DsrController],
        providers: [dsr_service_1.DsrService],
        exports: [dsr_service_1.DsrService]
      })
    ], DsrModule);
  }
});

// dist/src/materials/material-categories.service.js
var require_material_categories_service = __commonJS({
  "dist/src/materials/material-categories.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaterialCategoriesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var MaterialCategoriesService = class MaterialCategoriesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.materialCategory.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.materialCategory.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.materialCategory.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Material Category ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("A Material Category with this name already exists");
        }
        return error;
      }
    };
    exports2.MaterialCategoriesService = MaterialCategoriesService;
    exports2.MaterialCategoriesService = MaterialCategoriesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MaterialCategoriesService);
  }
});

// dist/src/materials/material-categories.controller.js
var require_material_categories_controller = __commonJS({
  "dist/src/materials/material-categories.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaterialCategoriesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var material_categories_service_1 = require_material_categories_service();
    var MaterialCategoriesController = class MaterialCategoriesController {
      materialCategoriesService;
      constructor(materialCategoriesService) {
        this.materialCategoriesService = materialCategoriesService;
      }
      create(body) {
        return this.materialCategoriesService.create(body);
      }
      list() {
        return this.materialCategoriesService.list();
      }
      update(id, body) {
        return this.materialCategoriesService.update(id, body);
      }
    };
    exports2.MaterialCategoriesController = MaterialCategoriesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMaterialCategorySchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], MaterialCategoriesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], MaterialCategoriesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateMaterialCategorySchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MaterialCategoriesController.prototype, "update", null);
    exports2.MaterialCategoriesController = MaterialCategoriesController = __decorate([
      (0, common_1.Controller)("material-categories"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [material_categories_service_1.MaterialCategoriesService])
    ], MaterialCategoriesController);
  }
});

// dist/src/materials/units.service.js
var require_units_service = __commonJS({
  "dist/src/materials/units.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnitsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var UnitsService = class UnitsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.unit.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.unit.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.unit.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Unit ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("A Unit with this name already exists");
        }
        return error;
      }
    };
    exports2.UnitsService = UnitsService;
    exports2.UnitsService = UnitsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], UnitsService);
  }
});

// dist/src/materials/units.controller.js
var require_units_controller = __commonJS({
  "dist/src/materials/units.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnitsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var units_service_1 = require_units_service();
    var UnitsController = class UnitsController {
      unitsService;
      constructor(unitsService) {
        this.unitsService = unitsService;
      }
      create(body) {
        return this.unitsService.create(body);
      }
      list() {
        return this.unitsService.list();
      }
      update(id, body) {
        return this.unitsService.update(id, body);
      }
    };
    exports2.UnitsController = UnitsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createUnitSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], UnitsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], UnitsController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateUnitSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], UnitsController.prototype, "update", null);
    exports2.UnitsController = UnitsController = __decorate([
      (0, common_1.Controller)("units"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [units_service_1.UnitsService])
    ], UnitsController);
  }
});

// dist/src/materials/materials.service.js
var require_materials_service = __commonJS({
  "dist/src/materials/materials.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaterialsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var MaterialsService = class MaterialsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          const material = await this.prisma.material.create({ data: input });
          return this.normalizeCustomFields(material);
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list() {
        const materials = await this.prisma.material.findMany({
          include: { category: true, unit: true, sizes: true },
          orderBy: { name: "asc" }
        });
        return materials.map((material) => this.normalizeCustomFields(material));
      }
      async update(id, input) {
        try {
          const material = await this.prisma.material.update({
            where: { id },
            data: input
          });
          return this.normalizeCustomFields(material);
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Material ${id} not found`);
          }
          throw this.translateWriteError(error);
        }
      }
      normalizeCustomFields(material) {
        return {
          ...material,
          customFields: Array.isArray(material.customFields) ? material.customFields : []
        };
      }
      async searchCandidates(q) {
        const where = {
          isActive: true,
          name: { contains: q, mode: "insensitive" }
        };
        const [candidates, total] = await Promise.all([
          this.prisma.material.findMany({
            where,
            include: { category: true },
            orderBy: { name: "asc" },
            take: 200
          }),
          this.prisma.material.count({ where })
        ]);
        return { candidates, total };
      }
      async listThresholds() {
        const materials = await this.prisma.material.findMany({
          where: { isActive: true, lowStockThreshold: { not: null } },
          select: {
            id: true,
            name: true,
            lowStockThreshold: true,
            unit: { select: { name: true } }
          },
          orderBy: { name: "asc" }
        });
        return materials.map((material) => ({
          id: material.id,
          name: material.name,
          lowStockThreshold: material.lowStockThreshold,
          unit: material.unit.name
        }));
      }
      async createSize(materialId, input) {
        try {
          return await this.prisma.materialSize.create({
            data: { materialId, label: input.label }
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new common_1.BadRequestException("This Size already exists for this Material");
          }
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            throw new common_1.BadRequestException(`Material ${materialId} does not exist`);
          }
          throw error;
        }
      }
      listSizes(materialId) {
        return this.prisma.materialSize.findMany({
          where: { materialId },
          orderBy: { label: "asc" }
        });
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2003") {
            return new common_1.BadRequestException("This Material references a Category or Unit that does not exist");
          }
          if (error.code === "P2002") {
            return new common_1.BadRequestException("A Material with this name already exists in this Category");
          }
        }
        return error;
      }
    };
    exports2.MaterialsService = MaterialsService;
    exports2.MaterialsService = MaterialsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MaterialsService);
  }
});

// dist/src/materials/materials.controller.js
var require_materials_controller = __commonJS({
  "dist/src/materials/materials.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaterialsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var materials_service_1 = require_materials_service();
    var MaterialsController = class MaterialsController {
      materialsService;
      constructor(materialsService) {
        this.materialsService = materialsService;
      }
      create(body) {
        return this.materialsService.create(body);
      }
      list() {
        return this.materialsService.list();
      }
      listThresholds() {
        return this.materialsService.listThresholds();
      }
      update(id, body) {
        return this.materialsService.update(id, body);
      }
      createSize(materialId, body) {
        return this.materialsService.createSize(materialId, body);
      }
      listSizes(materialId) {
        return this.materialsService.listSizes(materialId);
      }
    };
    exports2.MaterialsController = MaterialsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMaterialSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("thresholds"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "listThresholds", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateMaterialSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "update", null);
    __decorate([
      (0, common_1.Post)(":materialId/sizes"),
      __param(0, (0, common_1.Param)("materialId")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMaterialSizeSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "createSize", null);
    __decorate([
      (0, common_1.Get)(":materialId/sizes"),
      __param(0, (0, common_1.Param)("materialId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], MaterialsController.prototype, "listSizes", null);
    exports2.MaterialsController = MaterialsController = __decorate([
      (0, common_1.Controller)("materials"),
      __metadata("design:paramtypes", [materials_service_1.MaterialsService])
    ], MaterialsController);
  }
});

// dist/src/materials/materials.module.js
var require_materials_module = __commonJS({
  "dist/src/materials/materials.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaterialsModule = void 0;
    var common_1 = require("@nestjs/common");
    var material_categories_controller_1 = require_material_categories_controller();
    var material_categories_service_1 = require_material_categories_service();
    var units_controller_1 = require_units_controller();
    var units_service_1 = require_units_service();
    var materials_controller_1 = require_materials_controller();
    var materials_service_1 = require_materials_service();
    var MaterialsModule = class MaterialsModule {
    };
    exports2.MaterialsModule = MaterialsModule;
    exports2.MaterialsModule = MaterialsModule = __decorate([
      (0, common_1.Module)({
        controllers: [
          material_categories_controller_1.MaterialCategoriesController,
          units_controller_1.UnitsController,
          materials_controller_1.MaterialsController
        ],
        providers: [material_categories_service_1.MaterialCategoriesService, units_service_1.UnitsService, materials_service_1.MaterialsService],
        exports: [materials_service_1.MaterialsService]
      })
    ], MaterialsModule);
  }
});

// dist/src/inventory/purchases.service.js
var require_purchases_service = __commonJS({
  "dist/src/inventory/purchases.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PurchasesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var PurchasesService = class PurchasesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.purchase.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Purchase ${input.correctsId} does not exist`);
          }
          if (original.materialSizeId !== input.materialSizeId || original.destination !== input.destination || original.siteId !== (input.siteId ?? null)) {
            throw new common_1.BadRequestException("A correction's Material Size, destination, and Site must match the Purchase it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.create({
              data: { ...input, purchasedAt: new Date(input.purchasedAt) }
            });
            if (input.destination === "GODOWN") {
              await tx.godownStock.upsert({
                where: { materialSizeId: input.materialSizeId },
                update: { quantity: { increment: input.quantity } },
                create: {
                  materialSizeId: input.materialSizeId,
                  quantity: input.quantity
                }
              });
            } else {
              await tx.siteStock.upsert({
                where: {
                  siteId_materialSizeId: {
                    siteId: input.siteId,
                    materialSizeId: input.materialSizeId
                  }
                },
                update: { quantity: { increment: input.quantity } },
                create: {
                  siteId: input.siteId,
                  materialSizeId: input.materialSizeId,
                  quantity: input.quantity
                }
              });
            }
            return purchase;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(filters = {}) {
        return this.prisma.purchase.findMany({
          where: this.reportWhere(filters),
          include: {
            vendor: true,
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { purchasedAt: "desc" }
        });
      }
      reportWhere(filters) {
        const where = {};
        if (filters.siteId)
          where.siteId = filters.siteId;
        if (filters.materialId) {
          where.materialSize = { materialId: filters.materialId };
        }
        where.purchasedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return where;
      }
      async completePricing(id, input) {
        const purchase = await this.prisma.purchase.findUnique({ where: { id } });
        if (!purchase) {
          throw new common_1.NotFoundException(`Purchase ${id} not found`);
        }
        if (purchase.correctsId !== null) {
          throw new common_1.BadRequestException("A correction entry is never priced separately \u2014 price the original Purchase it corrects");
        }
        if (purchase.totalAmount !== null) {
          throw new common_1.BadRequestException("This Purchase is already priced \u2014 changes to a priced Purchase must be filed as a correction");
        }
        const { count } = await this.prisma.purchase.updateMany({
          where: { id, totalAmount: null },
          data: {
            rate: input.rate,
            totalAmount: input.totalAmount,
            paymentStatus: input.paymentStatus
          }
        });
        if (count === 0) {
          throw new common_1.BadRequestException("This Purchase is already priced \u2014 changes to a priced Purchase must be filed as a correction");
        }
        return this.prisma.purchase.findUnique({ where: { id } });
      }
      countPendingPricing() {
        return this.prisma.purchase.count({
          where: { totalAmount: null, correctsId: null }
        });
      }
      countThisMonth() {
        const now = /* @__PURE__ */ new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return this.prisma.purchase.count({
          where: { purchasedAt: { gte: monthStart, lt: nextMonthStart } }
        });
      }
      async findOne(id) {
        const purchase = await this.prisma.purchase.findUnique({
          where: { id },
          include: {
            vendor: true,
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          }
        });
        if (!purchase) {
          throw new common_1.NotFoundException(`Purchase ${id} not found`);
        }
        return purchase;
      }
      listByVendor(vendorId) {
        return this.prisma.purchase.findMany({
          where: { vendorId },
          include: {
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { purchasedAt: "desc" }
        });
      }
      async summaryForVendor(vendorId) {
        const now = /* @__PURE__ */ new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
        const [thisYear, notFullyPaid] = await Promise.all([
          this.prisma.purchase.aggregate({
            where: { vendorId, purchasedAt: { gte: yearStart, lt: nextYearStart } },
            _sum: { totalAmount: true }
          }),
          this.prisma.purchase.aggregate({
            where: { vendorId, paymentStatus: { in: ["UNPAID", "PARTIAL"] } },
            _sum: { totalAmount: true }
          })
        ]);
        return {
          totalThisYear: thisYear._sum.totalAmount?.toNumber() ?? 0,
          notFullyPaidTotal: notFullyPaid._sum.totalAmount?.toNumber() ?? 0
        };
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Purchase references a Vendor, Material Size, or Site that does not exist");
        }
        return error;
      }
    };
    exports2.PurchasesService = PurchasesService;
    exports2.PurchasesService = PurchasesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], PurchasesService);
  }
});

// dist/src/inventory/purchases.controller.js
var require_purchases_controller = __commonJS({
  "dist/src/inventory/purchases.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PurchasesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var purchases_service_1 = require_purchases_service();
    var PurchasesController = class PurchasesController {
      purchasesService;
      constructor(purchasesService) {
        this.purchasesService = purchasesService;
      }
      create(body) {
        return this.purchasesService.create(body);
      }
      list() {
        return this.purchasesService.list();
      }
      countThisMonth() {
        return this.purchasesService.countThisMonth();
      }
      countPendingPricing() {
        return this.purchasesService.countPendingPricing();
      }
      findOne(id) {
        return this.purchasesService.findOne(id);
      }
      completePricing(id, body) {
        return this.purchasesService.completePricing(id, body);
      }
    };
    exports2.PurchasesController = PurchasesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createPurchaseSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("count/this-month"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "countThisMonth", null);
    __decorate([
      (0, common_1.Get)("count/pending-pricing"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "countPendingPricing", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Patch)(":id/pricing"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.completePurchasePricingSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "completePricing", null);
    exports2.PurchasesController = PurchasesController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, common_1.Controller)("purchases"),
      __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
    ], PurchasesController);
  }
});

// dist/src/inventory/movements.service.js
var require_movements_service = __commonJS({
  "dist/src/inventory/movements.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MovementsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var stock_delta_1 = require_stock_delta();
    var MovementsService = class MovementsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.movement.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Movement ${input.correctsId} does not exist`);
          }
          if (original.kind !== input.kind || original.materialSizeId !== input.materialSizeId || original.sourceSiteId !== (input.sourceSiteId ?? null) || original.destinationSiteId !== input.destinationSiteId) {
            throw new common_1.BadRequestException("A correction's kind, Material Size, and Site(s) must match the Movement it corrects");
          }
        }
        const isGodownToSite = input.kind === "GODOWN_TO_SITE";
        try {
          return await this.prisma.$transaction(async (tx) => {
            const movement = await tx.movement.create({
              data: { ...input, movedAt: new Date(input.movedAt) }
            });
            await (0, stock_delta_1.decrementStockWithFloorCheck)(tx, isGodownToSite ? { model: "godownStock", materialSizeId: input.materialSizeId } : {
              model: "siteStock",
              siteId: input.sourceSiteId,
              materialSizeId: input.materialSizeId
            }, input.sentQuantity, isGodownToSite ? "Not enough Godown Stock for this Movement." : "Not enough of the source Site's Stock for this Movement.");
            return movement;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async confirmReceipt(id, input) {
        const movement = await this.prisma.movement.findUnique({ where: { id } });
        if (!movement) {
          throw new common_1.NotFoundException(`Movement ${id} not found`);
        }
        return this.prisma.$transaction(async (tx) => {
          const result = await tx.movement.updateMany({
            where: { id, receivedQuantity: null },
            data: { receivedQuantity: input.receivedQuantity }
          });
          if (result.count === 0) {
            throw new common_1.BadRequestException(`Movement ${id} has already had its receipt confirmed`);
          }
          await tx.siteStock.upsert({
            where: {
              siteId_materialSizeId: {
                siteId: movement.destinationSiteId,
                materialSizeId: movement.materialSizeId
              }
            },
            update: { quantity: { increment: input.receivedQuantity } },
            create: {
              siteId: movement.destinationSiteId,
              materialSizeId: movement.materialSizeId,
              quantity: input.receivedQuantity
            }
          });
          return tx.movement.findUniqueOrThrow({ where: { id } });
        });
      }
      list(filters = {}) {
        return this.prisma.movement.findMany({
          where: this.reportWhere(filters),
          include: {
            sourceSite: true,
            destinationSite: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { movedAt: "desc" }
        });
      }
      reportWhere(filters) {
        const where = {};
        if (filters.siteId) {
          where.OR = [
            { sourceSiteId: filters.siteId },
            { destinationSiteId: filters.siteId }
          ];
        }
        if (filters.materialId) {
          where.materialSize = { materialId: filters.materialId };
        }
        where.movedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return where;
      }
      async findOne(id) {
        const movement = await this.prisma.movement.findUnique({
          where: { id },
          include: {
            sourceSite: true,
            destinationSite: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          }
        });
        if (!movement) {
          throw new common_1.NotFoundException(`Movement ${id} not found`);
        }
        return movement;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Movement references a Material Size or Site that does not exist");
        }
        return error;
      }
    };
    exports2.MovementsService = MovementsService;
    exports2.MovementsService = MovementsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MovementsService);
  }
});

// dist/src/inventory/movements.controller.js
var require_movements_controller = __commonJS({
  "dist/src/inventory/movements.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MovementsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var movements_service_1 = require_movements_service();
    var MovementsController = class MovementsController {
      movementsService;
      constructor(movementsService) {
        this.movementsService = movementsService;
      }
      create(body) {
        return this.movementsService.create(body);
      }
      confirmReceipt(id, body) {
        return this.movementsService.confirmReceipt(id, body);
      }
      list() {
        return this.movementsService.list();
      }
      findOne(id) {
        return this.movementsService.findOne(id);
      }
    };
    exports2.MovementsController = MovementsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMovementSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], MovementsController.prototype, "create", null);
    __decorate([
      (0, common_1.Patch)(":id/confirm-receipt"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.confirmMovementReceiptSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MovementsController.prototype, "confirmReceipt", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], MovementsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], MovementsController.prototype, "findOne", null);
    exports2.MovementsController = MovementsController = __decorate([
      (0, common_1.Controller)("movements"),
      __metadata("design:paramtypes", [movements_service_1.MovementsService])
    ], MovementsController);
  }
});

// dist/src/inventory/consumption.service.js
var require_consumption_service = __commonJS({
  "dist/src/inventory/consumption.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumptionService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var stock_delta_1 = require_stock_delta();
    var ConsumptionService = class ConsumptionService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input, recordedByUserId) {
        if (input.correctsId) {
          const original = await this.prisma.consumption.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Consumption ${input.correctsId} does not exist`);
          }
          if (original.siteId !== input.siteId || original.materialSizeId !== input.materialSizeId) {
            throw new common_1.BadRequestException("A correction's Site and Material Size must match the Consumption it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const consumption = await tx.consumption.create({
              data: {
                ...input,
                recordedByUserId,
                consumedAt: new Date(input.consumedAt)
              }
            });
            await (0, stock_delta_1.decrementStockWithFloorCheck)(tx, {
              model: "siteStock",
              siteId: input.siteId,
              materialSizeId: input.materialSizeId
            }, input.quantity, "Not enough Site Stock for this Consumption.");
            return consumption;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(filters = {}) {
        const superseded = await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma);
        return this.prisma.consumption.findMany({
          where: {
            ...this.reportWhere(filters),
            ...(0, superseded_dsrs_1.currentDsrRowsWhere)(superseded)
          },
          include: {
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { consumedAt: "desc" }
        });
      }
      reportWhere(filters) {
        const where = {};
        if (filters.siteId)
          where.siteId = filters.siteId;
        if (filters.materialId) {
          where.materialSize = { materialId: filters.materialId };
        }
        where.consumedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return where;
      }
      async findOne(id) {
        const consumption = await this.prisma.consumption.findUnique({
          where: { id },
          include: {
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          }
        });
        if (!consumption) {
          throw new common_1.NotFoundException(`Consumption ${id} not found`);
        }
        return consumption;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Consumption references a Site, Material Size, or User that does not exist");
        }
        return error;
      }
    };
    exports2.ConsumptionService = ConsumptionService;
    exports2.ConsumptionService = ConsumptionService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ConsumptionService);
  }
});

// dist/src/inventory/consumption.controller.js
var require_consumption_controller = __commonJS({
  "dist/src/inventory/consumption.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumptionController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var consumption_service_1 = require_consumption_service();
    var ConsumptionController = class ConsumptionController {
      consumptionService;
      constructor(consumptionService) {
        this.consumptionService = consumptionService;
      }
      create(user, body) {
        return this.consumptionService.create(body, user.id);
      }
      list() {
        return this.consumptionService.list();
      }
      findOne(id) {
        return this.consumptionService.findOne(id);
      }
    };
    exports2.ConsumptionController = ConsumptionController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createConsumptionSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], ConsumptionController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], ConsumptionController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], ConsumptionController.prototype, "findOne", null);
    exports2.ConsumptionController = ConsumptionController = __decorate([
      (0, common_1.Controller)("consumption"),
      __metadata("design:paramtypes", [consumption_service_1.ConsumptionService])
    ], ConsumptionController);
  }
});

// dist/src/inventory/return-wastage.service.js
var require_return_wastage_service = __commonJS({
  "dist/src/inventory/return-wastage.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReturnWastageService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var stock_delta_1 = require_stock_delta();
    var ReturnWastageService = class ReturnWastageService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.returnWastage.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Return/Wastage ${input.correctsId} does not exist`);
          }
          if (original.kind !== input.kind || original.siteId !== input.siteId || original.materialSizeId !== input.materialSizeId) {
            throw new common_1.BadRequestException("A correction's kind, Site, and Material Size must match the Return/Wastage entry it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const returnWastage = await tx.returnWastage.create({
              data: { ...input, recordedAt: new Date(input.recordedAt) }
            });
            await (0, stock_delta_1.decrementStockWithFloorCheck)(tx, {
              model: "siteStock",
              siteId: input.siteId,
              materialSizeId: input.materialSizeId
            }, input.quantity, "Not enough Site Stock for this Return/Wastage entry.");
            return returnWastage;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(filters = {}) {
        return this.prisma.returnWastage.findMany({
          where: this.reportWhere(filters),
          include: {
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { recordedAt: "desc" }
        });
      }
      reportWhere(filters) {
        const where = {};
        if (filters.siteId)
          where.siteId = filters.siteId;
        if (filters.materialId) {
          where.materialSize = { materialId: filters.materialId };
        }
        where.recordedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return where;
      }
      async findOne(id) {
        const returnWastage = await this.prisma.returnWastage.findUnique({
          where: { id },
          include: {
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          }
        });
        if (!returnWastage) {
          throw new common_1.NotFoundException(`Return/Wastage ${id} not found`);
        }
        return returnWastage;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Return/Wastage entry references a Site or Material Size that does not exist");
        }
        return error;
      }
    };
    exports2.ReturnWastageService = ReturnWastageService;
    exports2.ReturnWastageService = ReturnWastageService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ReturnWastageService);
  }
});

// dist/src/inventory/return-wastage.controller.js
var require_return_wastage_controller = __commonJS({
  "dist/src/inventory/return-wastage.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReturnWastageController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var return_wastage_service_1 = require_return_wastage_service();
    var ReturnWastageController = class ReturnWastageController {
      returnWastageService;
      constructor(returnWastageService) {
        this.returnWastageService = returnWastageService;
      }
      create(body) {
        return this.returnWastageService.create(body);
      }
      list() {
        return this.returnWastageService.list();
      }
      findOne(id) {
        return this.returnWastageService.findOne(id);
      }
    };
    exports2.ReturnWastageController = ReturnWastageController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createReturnWastageSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], ReturnWastageController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], ReturnWastageController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], ReturnWastageController.prototype, "findOne", null);
    exports2.ReturnWastageController = ReturnWastageController = __decorate([
      (0, common_1.Controller)("return-wastage"),
      __metadata("design:paramtypes", [return_wastage_service_1.ReturnWastageService])
    ], ReturnWastageController);
  }
});

// dist/src/inventory/stock.service.js
var require_stock_service = __commonJS({
  "dist/src/inventory/stock.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StockService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var StockService = class StockService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      getGodownStock(materialId) {
        return this.prisma.godownStock.findMany({
          where: materialId ? { materialSize: { materialId } } : void 0,
          include: {
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { materialSize: { material: { name: "asc" } } }
        });
      }
      getSiteStock(siteId, materialId) {
        return this.prisma.siteStock.findMany({
          where: {
            siteId,
            materialSize: materialId ? { materialId } : void 0
          },
          include: {
            site: true,
            materialSize: { include: { material: { include: { unit: true } } } }
          },
          orderBy: { materialSize: { material: { name: "asc" } } }
        });
      }
      async getStockByMaterial(materialId) {
        const [godownRows, siteRows] = await Promise.all([
          this.prisma.godownStock.findMany({
            where: { materialSize: { materialId }, quantity: { gt: 0 } },
            include: {
              materialSize: { include: { material: { include: { unit: true } } } }
            }
          }),
          this.prisma.siteStock.findMany({
            where: { materialSize: { materialId }, quantity: { gt: 0 } },
            include: {
              site: true,
              materialSize: { include: { material: { include: { unit: true } } } }
            }
          })
        ]);
        const rows = [
          ...godownRows.map((row) => ({
            location: { kind: "godown" },
            materialSizeId: row.materialSizeId,
            sizeLabel: row.materialSize.label,
            quantity: row.quantity,
            unit: row.materialSize.material.unit.name
          })),
          ...siteRows.map((row) => ({
            location: {
              kind: "site",
              id: row.site.id,
              name: row.site.name
            },
            materialSizeId: row.materialSizeId,
            sizeLabel: row.materialSize.label,
            quantity: row.quantity,
            unit: row.materialSize.material.unit.name
          }))
        ];
        return rows.sort((a, b) => Number(b.quantity) - Number(a.quantity));
      }
      async getLowStockMaterials() {
        const materials = await this.prisma.material.findMany({
          where: { lowStockThreshold: { not: null } },
          include: {
            unit: true,
            sizes: { include: { godownStock: true } }
          }
        });
        return materials.map((material) => {
          const godownQuantity = material.sizes.reduce((sum, size) => sum + size.godownStock.reduce((s, stock) => s + Number(stock.quantity), 0), 0);
          return {
            id: material.id,
            name: material.name,
            unit: { id: material.unit.id, name: material.unit.name },
            lowStockThreshold: material.lowStockThreshold.toString(),
            godownQuantity: godownQuantity.toString()
          };
        }).filter((material) => Number(material.godownQuantity) < Number(material.lowStockThreshold));
      }
    };
    exports2.StockService = StockService;
    exports2.StockService = StockService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], StockService);
  }
});

// dist/src/inventory/stock.controller.js
var require_stock_controller = __commonJS({
  "dist/src/inventory/stock.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StockController = void 0;
    var common_1 = require("@nestjs/common");
    var stock_service_1 = require_stock_service();
    var StockController = class StockController {
      stockService;
      constructor(stockService) {
        this.stockService = stockService;
      }
      getGodownStock() {
        return this.stockService.getGodownStock();
      }
      getSiteStock(siteId) {
        return this.stockService.getSiteStock(siteId);
      }
      getLowStockMaterials() {
        return this.stockService.getLowStockMaterials();
      }
      getStockByMaterial(materialId) {
        return this.stockService.getStockByMaterial(materialId);
      }
    };
    exports2.StockController = StockController;
    __decorate([
      (0, common_1.Get)("godown"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], StockController.prototype, "getGodownStock", null);
    __decorate([
      (0, common_1.Get)("site/:siteId"),
      __param(0, (0, common_1.Param)("siteId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], StockController.prototype, "getSiteStock", null);
    __decorate([
      (0, common_1.Get)("low-stock"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], StockController.prototype, "getLowStockMaterials", null);
    __decorate([
      (0, common_1.Get)("material/:materialId"),
      __param(0, (0, common_1.Param)("materialId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], StockController.prototype, "getStockByMaterial", null);
    exports2.StockController = StockController = __decorate([
      (0, common_1.Controller)("stock"),
      __metadata("design:paramtypes", [stock_service_1.StockService])
    ], StockController);
  }
});

// dist/src/inventory/movements-log.service.js
var require_movements_log_service = __commonJS({
  "dist/src/inventory/movements-log.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MovementsLogService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var pagination_1 = require_pagination();
    var date_range_1 = require_date_range();
    var sort_order_1 = require_sort_order();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var MOVEMENT_LOG_TYPES = [
      "PURCHASE",
      "MOVEMENT",
      "CONSUMPTION",
      "RETURN_WASTAGE"
    ];
    function isMovementLogType(value) {
      return Boolean(value) && MOVEMENT_LOG_TYPES.includes(value);
    }
    var materialSizeInclude = {
      materialSize: { include: { material: { include: { unit: true } } } }
    };
    var MovementsLogService = class MovementsLogService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async list(query) {
        const { q, type, siteId, from, to } = query;
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        const page = pagination.paginated ? pagination.page : 1;
        const pageSize = pagination.paginated ? pagination.pageSize : 25;
        const limit = page * pageSize;
        const dateRange = (0, date_range_1.dateRangeBounds)(from, to);
        const dateDirection = query.sort === "date" && (0, sort_order_1.isSortOrder)(query.order) ? query.order : "desc";
        const knownType = isMovementLogType(type) ? type : void 0;
        const wantPurchase = !knownType || knownType === "PURCHASE";
        const wantMovement = !knownType || knownType === "MOVEMENT";
        const wantConsumption = !knownType || knownType === "CONSUMPTION";
        const wantReturnWastage = !knownType || knownType === "RETURN_WASTAGE";
        const purchaseSearch = q ? {
          OR: [
            {
              materialSize: {
                material: {
                  name: { contains: q, mode: "insensitive" }
                }
              }
            },
            { site: { name: { contains: q, mode: "insensitive" } } }
          ]
        } : {};
        const siteSearch = (siteRelation) => q ? {
          OR: [
            {
              materialSize: {
                material: {
                  name: { contains: q, mode: "insensitive" }
                }
              }
            },
            {
              [siteRelation]: {
                name: { contains: q, mode: "insensitive" }
              }
            }
          ]
        } : {};
        const purchaseWhere = {
          ...siteId ? { siteId } : {},
          ...dateRange ? { purchasedAt: dateRange } : {},
          ...purchaseSearch
        };
        const movementWhere = {
          ...siteId ? { OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }] } : {},
          ...dateRange ? { movedAt: dateRange } : {},
          ...q ? {
            OR: [
              {
                materialSize: {
                  material: {
                    name: { contains: q, mode: "insensitive" }
                  }
                }
              },
              {
                sourceSite: {
                  name: { contains: q, mode: "insensitive" }
                }
              },
              {
                destinationSite: {
                  name: { contains: q, mode: "insensitive" }
                }
              }
            ]
          } : {}
        };
        const superseded = wantConsumption ? await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma) : [];
        const consumptionSearch = siteSearch("site");
        const consumptionWhere = {
          ...siteId ? { siteId } : {},
          ...dateRange ? { consumedAt: dateRange } : {},
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(superseded),
          ..."OR" in consumptionSearch ? { AND: [consumptionSearch] } : {}
        };
        const returnWastageWhere = {
          ...siteId ? { siteId } : {},
          ...dateRange ? { recordedAt: dateRange } : {},
          ...siteSearch("site")
        };
        const [purchases, purchaseTotal] = wantPurchase ? await Promise.all([
          this.prisma.purchase.findMany({
            where: purchaseWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { purchasedAt: dateDirection },
            take: limit
          }),
          this.prisma.purchase.count({ where: purchaseWhere })
        ]) : [[], 0];
        const [movements, movementTotal] = wantMovement ? await Promise.all([
          this.prisma.movement.findMany({
            where: movementWhere,
            include: {
              ...materialSizeInclude,
              sourceSite: true,
              destinationSite: true
            },
            orderBy: { movedAt: dateDirection },
            take: limit
          }),
          this.prisma.movement.count({ where: movementWhere })
        ]) : [[], 0];
        const [consumptions, consumptionTotal] = wantConsumption ? await Promise.all([
          this.prisma.consumption.findMany({
            where: consumptionWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { consumedAt: dateDirection },
            take: limit
          }),
          this.prisma.consumption.count({ where: consumptionWhere })
        ]) : [[], 0];
        const [returnWastages, returnWastageTotal] = wantReturnWastage ? await Promise.all([
          this.prisma.returnWastage.findMany({
            where: returnWastageWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { recordedAt: dateDirection },
            take: limit
          }),
          this.prisma.returnWastage.count({ where: returnWastageWhere })
        ]) : [[], 0];
        const merged = [
          ...purchases.map((item) => ({
            type: "PURCHASE",
            id: item.id,
            date: item.purchasedAt,
            item
          })),
          ...movements.map((item) => ({
            type: "MOVEMENT",
            id: item.id,
            date: item.movedAt,
            item
          })),
          ...consumptions.map((item) => ({
            type: "CONSUMPTION",
            id: item.id,
            date: item.consumedAt,
            item
          })),
          ...returnWastages.map((item) => ({
            type: "RETURN_WASTAGE",
            id: item.id,
            date: item.recordedAt,
            item
          }))
        ].sort((a, b) => dateDirection === "asc" ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime());
        const skip = (page - 1) * pageSize;
        const rows = merged.slice(skip, skip + pageSize);
        const total = purchaseTotal + movementTotal + consumptionTotal + returnWastageTotal;
        return { rows, total, page, pageSize };
      }
    };
    exports2.MovementsLogService = MovementsLogService;
    exports2.MovementsLogService = MovementsLogService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MovementsLogService);
  }
});

// dist/src/inventory/movements-log.controller.js
var require_movements_log_controller = __commonJS({
  "dist/src/inventory/movements-log.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MovementsLogController = void 0;
    var common_1 = require("@nestjs/common");
    var movements_log_service_1 = require_movements_log_service();
    var MovementsLogController = class MovementsLogController {
      movementsLogService;
      constructor(movementsLogService) {
        this.movementsLogService = movementsLogService;
      }
      list(q, page, pageSize, type, siteId, from, to, sort, order) {
        return this.movementsLogService.list({
          q,
          page,
          pageSize,
          type,
          siteId,
          from,
          to,
          sort,
          order
        });
      }
    };
    exports2.MovementsLogController = MovementsLogController;
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("type")),
      __param(4, (0, common_1.Query)("siteId")),
      __param(5, (0, common_1.Query)("from")),
      __param(6, (0, common_1.Query)("to")),
      __param(7, (0, common_1.Query)("sort")),
      __param(8, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], MovementsLogController.prototype, "list", null);
    exports2.MovementsLogController = MovementsLogController = __decorate([
      (0, common_1.Controller)("movements-log"),
      __metadata("design:paramtypes", [movements_log_service_1.MovementsLogService])
    ], MovementsLogController);
  }
});

// dist/src/inventory/inventory.module.js
var require_inventory_module = __commonJS({
  "dist/src/inventory/inventory.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InventoryModule = void 0;
    var common_1 = require("@nestjs/common");
    var purchases_controller_1 = require_purchases_controller();
    var purchases_service_1 = require_purchases_service();
    var movements_controller_1 = require_movements_controller();
    var movements_service_1 = require_movements_service();
    var consumption_controller_1 = require_consumption_controller();
    var consumption_service_1 = require_consumption_service();
    var return_wastage_controller_1 = require_return_wastage_controller();
    var return_wastage_service_1 = require_return_wastage_service();
    var stock_controller_1 = require_stock_controller();
    var stock_service_1 = require_stock_service();
    var movements_log_controller_1 = require_movements_log_controller();
    var movements_log_service_1 = require_movements_log_service();
    var InventoryModule = class InventoryModule {
    };
    exports2.InventoryModule = InventoryModule;
    exports2.InventoryModule = InventoryModule = __decorate([
      (0, common_1.Module)({
        controllers: [
          purchases_controller_1.PurchasesController,
          movements_controller_1.MovementsController,
          consumption_controller_1.ConsumptionController,
          return_wastage_controller_1.ReturnWastageController,
          stock_controller_1.StockController,
          movements_log_controller_1.MovementsLogController
        ],
        providers: [
          purchases_service_1.PurchasesService,
          movements_service_1.MovementsService,
          consumption_service_1.ConsumptionService,
          return_wastage_service_1.ReturnWastageService,
          stock_service_1.StockService,
          movements_log_service_1.MovementsLogService
        ],
        exports: [
          purchases_service_1.PurchasesService,
          stock_service_1.StockService,
          movements_service_1.MovementsService,
          consumption_service_1.ConsumptionService,
          return_wastage_service_1.ReturnWastageService
        ]
      })
    ], InventoryModule);
  }
});

// dist/src/team/outstanding-balance.js
var require_outstanding_balance = __commonJS({
  "dist/src/team/outstanding-balance.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decrementOutstandingBalanceWithFloorCheck = decrementOutstandingBalanceWithFloorCheck;
    var common_1 = require("@nestjs/common");
    async function decrementOutstandingBalanceWithFloorCheck(tx, teamMemberId, amount, message = "Adjustment cannot exceed the current Outstanding Balance.") {
      const result = await tx.teamMember.updateMany({
        where: { id: teamMemberId, outstandingAdvanceBalance: { gte: amount } },
        data: { outstandingAdvanceBalance: { decrement: amount } }
      });
      if (result.count === 0) {
        throw new common_1.BadRequestException({
          error: { code: "ADJUSTMENT_EXCEEDS_BALANCE", message }
        });
      }
    }
  }
});

// dist/src/team/advance-adjustments.service.js
var require_advance_adjustments_service = __commonJS({
  "dist/src/team/advance-adjustments.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdvanceAdjustmentsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var outstanding_balance_1 = require_outstanding_balance();
    var AdvanceAdjustmentsService = class AdvanceAdjustmentsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.advanceAdjustment.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`AdvanceAdjustment ${input.correctsId} does not exist`);
          }
          if (original.advanceId !== input.advanceId) {
            throw new common_1.BadRequestException("A correction's Advance must match the AdvanceAdjustment it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const advance = await tx.advance.findUniqueOrThrow({
              where: { id: input.advanceId }
            });
            await (0, outstanding_balance_1.decrementOutstandingBalanceWithFloorCheck)(tx, advance.teamMemberId, input.amount);
            return tx.advanceAdjustment.create({ data: input });
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(filters = {}) {
        const where = {};
        if (filters.teamMemberId) {
          where.advance = { teamMemberId: filters.teamMemberId };
        }
        where.adjustedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return this.prisma.advanceAdjustment.findMany({
          where,
          include: { advance: { include: { teamMember: true } }, payment: true },
          orderBy: { adjustedAt: "desc" }
        });
      }
      async findOne(id) {
        const advanceAdjustment = await this.prisma.advanceAdjustment.findUnique({
          where: { id },
          include: { advance: { include: { teamMember: true } }, payment: true }
        });
        if (!advanceAdjustment) {
          throw new common_1.NotFoundException(`AdvanceAdjustment ${id} not found`);
        }
        return advanceAdjustment;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && (error.code === "P2003" || error.code === "P2025")) {
          return new common_1.BadRequestException("This Advance Adjustment references an Advance or Payment that does not exist");
        }
        return error;
      }
    };
    exports2.AdvanceAdjustmentsService = AdvanceAdjustmentsService;
    exports2.AdvanceAdjustmentsService = AdvanceAdjustmentsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AdvanceAdjustmentsService);
  }
});

// dist/src/team/advance-adjustments.controller.js
var require_advance_adjustments_controller = __commonJS({
  "dist/src/team/advance-adjustments.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdvanceAdjustmentsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var advance_adjustments_service_1 = require_advance_adjustments_service();
    var AdvanceAdjustmentsController = class AdvanceAdjustmentsController {
      advanceAdjustmentsService;
      constructor(advanceAdjustmentsService) {
        this.advanceAdjustmentsService = advanceAdjustmentsService;
      }
      create(body) {
        return this.advanceAdjustmentsService.create(body);
      }
      list() {
        return this.advanceAdjustmentsService.list();
      }
      findOne(id) {
        return this.advanceAdjustmentsService.findOne(id);
      }
    };
    exports2.AdvanceAdjustmentsController = AdvanceAdjustmentsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createAdvanceAdjustmentSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], AdvanceAdjustmentsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], AdvanceAdjustmentsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], AdvanceAdjustmentsController.prototype, "findOne", null);
    exports2.AdvanceAdjustmentsController = AdvanceAdjustmentsController = __decorate([
      (0, common_1.Controller)("advance-adjustments"),
      __metadata("design:paramtypes", [advance_adjustments_service_1.AdvanceAdjustmentsService])
    ], AdvanceAdjustmentsController);
  }
});

// dist/src/team/advances.service.js
var require_advances_service = __commonJS({
  "dist/src/team/advances.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdvancesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var outstanding_balance_1 = require_outstanding_balance();
    var AdvancesService = class AdvancesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.advance.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Advance ${input.correctsId} does not exist`);
          }
          if (original.teamMemberId !== input.teamMemberId) {
            throw new common_1.BadRequestException("A correction's Team Member must match the Advance it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const advance = await tx.advance.create({ data: input });
            await (0, outstanding_balance_1.decrementOutstandingBalanceWithFloorCheck)(tx, input.teamMemberId, -input.amount, "This correction would take the Team Member's Outstanding Balance below zero.");
            return advance;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(filters = {}) {
        const where = {};
        if (filters.teamMemberId)
          where.teamMemberId = filters.teamMemberId;
        where.givenAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return this.prisma.advance.findMany({
          where,
          include: { teamMember: true },
          orderBy: { givenAt: "desc" }
        });
      }
      async findOne(id) {
        const advance = await this.prisma.advance.findUnique({
          where: { id },
          include: { teamMember: true }
        });
        if (!advance) {
          throw new common_1.NotFoundException(`Advance ${id} not found`);
        }
        return advance;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Advance references a Team Member that does not exist");
        }
        return error;
      }
    };
    exports2.AdvancesService = AdvancesService;
    exports2.AdvancesService = AdvancesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AdvancesService);
  }
});

// dist/src/team/advances.controller.js
var require_advances_controller = __commonJS({
  "dist/src/team/advances.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdvancesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var advances_service_1 = require_advances_service();
    var AdvancesController = class AdvancesController {
      advancesService;
      constructor(advancesService) {
        this.advancesService = advancesService;
      }
      create(body) {
        return this.advancesService.create(body);
      }
      list() {
        return this.advancesService.list();
      }
      findOne(id) {
        return this.advancesService.findOne(id);
      }
    };
    exports2.AdvancesController = AdvancesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createAdvanceSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], AdvancesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], AdvancesController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], AdvancesController.prototype, "findOne", null);
    exports2.AdvancesController = AdvancesController = __decorate([
      (0, common_1.Controller)("advances"),
      __metadata("design:paramtypes", [advances_service_1.AdvancesService])
    ], AdvancesController);
  }
});

// dist/src/team/employment-types.service.js
var require_employment_types_service = __commonJS({
  "dist/src/team/employment-types.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EmploymentTypesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var EmploymentTypesService = class EmploymentTypesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.employmentType.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.employmentType.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.employmentType.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Employment Type ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("An Employment Type with this name already exists");
        }
        return error;
      }
    };
    exports2.EmploymentTypesService = EmploymentTypesService;
    exports2.EmploymentTypesService = EmploymentTypesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], EmploymentTypesService);
  }
});

// dist/src/team/employment-types.controller.js
var require_employment_types_controller = __commonJS({
  "dist/src/team/employment-types.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EmploymentTypesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var employment_types_service_1 = require_employment_types_service();
    var EmploymentTypesController = class EmploymentTypesController {
      employmentTypesService;
      constructor(employmentTypesService) {
        this.employmentTypesService = employmentTypesService;
      }
      create(body) {
        return this.employmentTypesService.create(body);
      }
      list() {
        return this.employmentTypesService.list();
      }
      update(id, body) {
        return this.employmentTypesService.update(id, body);
      }
    };
    exports2.EmploymentTypesController = EmploymentTypesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createEmploymentTypeSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], EmploymentTypesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], EmploymentTypesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateEmploymentTypeSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], EmploymentTypesController.prototype, "update", null);
    exports2.EmploymentTypesController = EmploymentTypesController = __decorate([
      (0, common_1.Controller)("employment-types"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [employment_types_service_1.EmploymentTypesService])
    ], EmploymentTypesController);
  }
});

// dist/src/team/payments.service.js
var require_payments_service = __commonJS({
  "dist/src/team/payments.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PaymentsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var outstanding_balance_1 = require_outstanding_balance();
    var PAYMENT_SORT_FIELDS = [
      "payPeriod",
      "basePay",
      "additionalAmount",
      "deductions",
      "netPayable",
      "status"
    ];
    function isPaymentSortField(value) {
      return Boolean(value) && PAYMENT_SORT_FIELDS.includes(value);
    }
    var PaymentsService = class PaymentsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        let originalLinkedAdjustment = null;
        if (input.correctsId) {
          const original = await this.prisma.payment.findUnique({
            where: { id: input.correctsId },
            include: { advanceAdjustments: true }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Payment ${input.correctsId} does not exist`);
          }
          if (original.teamMemberId !== input.teamMemberId) {
            throw new common_1.BadRequestException("A correction's Team Member must match the Payment it corrects");
          }
          originalLinkedAdjustment = original.advanceAdjustments[0] ?? null;
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            const netPayable = input.basePay + input.additionalAmount - input.deductions - (input.advanceAdjustment?.amount ?? 0);
            const payment = await tx.payment.create({
              data: {
                teamMemberId: input.teamMemberId,
                basePay: input.basePay,
                additionalAmount: input.additionalAmount,
                deductions: input.deductions,
                payPeriod: input.payPeriod,
                netPayable,
                status: "pending",
                paidAt: null,
                correctsId: input.correctsId,
                reason: input.reason
              }
            });
            const newAmount = input.advanceAdjustment?.amount ?? 0;
            const previousAmount = originalLinkedAdjustment?.amount.toNumber() ?? 0;
            const delta = newAmount - previousAmount;
            if (input.advanceAdjustment) {
              const advance = await tx.advance.findUniqueOrThrow({
                where: { id: input.advanceAdjustment.advanceId }
              });
              if (advance.teamMemberId !== input.teamMemberId) {
                throw new common_1.BadRequestException("The linked Advance must belong to the same Team Member as the Payment");
              }
              if (delta !== 0) {
                await (0, outstanding_balance_1.decrementOutstandingBalanceWithFloorCheck)(tx, advance.teamMemberId, delta);
              }
              await tx.advanceAdjustment.create({
                data: {
                  advanceId: input.advanceAdjustment.advanceId,
                  paymentId: payment.id,
                  amount: input.advanceAdjustment.amount,
                  note: input.advanceAdjustment.note,
                  adjustedAt: payment.createdAt,
                  correctsId: originalLinkedAdjustment?.id,
                  correctionReason: originalLinkedAdjustment ? input.reason : void 0
                }
              });
            } else if (originalLinkedAdjustment) {
              await (0, outstanding_balance_1.decrementOutstandingBalanceWithFloorCheck)(tx, input.teamMemberId, -previousAmount);
              await tx.advanceAdjustment.create({
                data: {
                  advanceId: originalLinkedAdjustment.advanceId,
                  paymentId: payment.id,
                  amount: -previousAmount,
                  adjustedAt: payment.createdAt,
                  correctsId: originalLinkedAdjustment.id,
                  correctionReason: input.reason
                }
              });
            }
            return payment;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async markPaid(id) {
        const result = await this.prisma.payment.updateMany({
          where: { id, status: "pending" },
          data: { status: "paid", paidAt: /* @__PURE__ */ new Date() }
        });
        if (result.count === 0) {
          const payment = await this.prisma.payment.findUnique({
            where: { id }
          });
          if (!payment) {
            throw new common_1.NotFoundException(`Payment ${id} not found`);
          }
          throw new common_1.ConflictException(`Payment ${id} has already been paid`);
        }
        return this.prisma.payment.findUniqueOrThrow({ where: { id } });
      }
      countPending() {
        return this.prisma.payment.count({ where: { status: "pending" } });
      }
      list(query = {}) {
        const where = this.reportWhere(query);
        if (query.q) {
          where.teamMember = { name: { contains: query.q, mode: "insensitive" } };
        }
        const include = {
          teamMember: true,
          advanceAdjustments: { include: { advance: true } }
        };
        const orderBy = isPaymentSortField(query.sort) ? { [query.sort]: (0, sort_order_1.isSortOrder)(query.order) ? query.order : "asc" } : { createdAt: "desc" };
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        if (!pagination.paginated) {
          return this.prisma.payment.findMany({ where, include, orderBy });
        }
        return Promise.all([
          this.prisma.payment.findMany({
            where,
            include,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.payment.count({ where })
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      reportWhere(filters) {
        const where = {};
        if (filters.teamMemberId)
          where.teamMemberId = filters.teamMemberId;
        where.createdAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        return where;
      }
      async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
          where: { id },
          include: {
            teamMember: true,
            advanceAdjustments: { include: { advance: true } }
          }
        });
        if (!payment) {
          throw new common_1.NotFoundException(`Payment ${id} not found`);
        }
        return payment;
      }
      translateWriteError(error) {
        if (error instanceof common_1.ConflictException) {
          return error;
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && (error.code === "P2003" || error.code === "P2025")) {
          return new common_1.BadRequestException("This Payment references a Team Member or Advance that does not exist");
        }
        return error;
      }
    };
    exports2.PaymentsService = PaymentsService;
    exports2.PaymentsService = PaymentsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], PaymentsService);
  }
});

// dist/src/team/payments.controller.js
var require_payments_controller = __commonJS({
  "dist/src/team/payments.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PaymentsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var payments_service_1 = require_payments_service();
    var PaymentsController = class PaymentsController {
      paymentsService;
      constructor(paymentsService) {
        this.paymentsService = paymentsService;
      }
      create(body) {
        return this.paymentsService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.paymentsService.list({ q, page, pageSize, sort, order });
      }
      countPending() {
        return this.paymentsService.countPending();
      }
      findOne(id) {
        return this.paymentsService.findOne(id);
      }
      markPaid(id) {
        return this.paymentsService.markPaid(id);
      }
    };
    exports2.PaymentsController = PaymentsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createPaymentSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], PaymentsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], PaymentsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("count/pending"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], PaymentsController.prototype, "countPending", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], PaymentsController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Patch)(":id/mark-paid"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], PaymentsController.prototype, "markPaid", null);
    exports2.PaymentsController = PaymentsController = __decorate([
      (0, common_1.Controller)("payments"),
      __metadata("design:paramtypes", [payments_service_1.PaymentsService])
    ], PaymentsController);
  }
});

// dist/src/team/team-members.service.js
var require_team_members_service = __commonJS({
  "dist/src/team/team-members.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TeamMembersService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var TEAM_MEMBER_SORT_FIELDS = [
      "name",
      "designation",
      "employmentType"
    ];
    function isTeamMemberSortField(value) {
      return Boolean(value) && TEAM_MEMBER_SORT_FIELDS.includes(value);
    }
    function teamMemberOrderBy(sort, order) {
      if (!isTeamMemberSortField(sort)) {
        return { name: "asc" };
      }
      const direction = (0, sort_order_1.isSortOrder)(order) ? order : "asc";
      return sort === "employmentType" ? { employmentType: { name: direction } } : { [sort]: direction };
    }
    var TeamMembersService = class TeamMembersService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.teamMember.create({ data: input });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(query = {}) {
        const { q, sort, order } = query;
        const where = q ? { name: { contains: q, mode: "insensitive" } } : void 0;
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        const findManyArgs = {
          ...where ? { where } : {},
          include: {
            employmentType: true,
            workRecords: {
              orderBy: { workDate: "desc" },
              take: 1,
              include: { site: true }
            }
          },
          orderBy: teamMemberOrderBy(sort, order),
          ...pagination.paginated ? { skip: pagination.skip, take: pagination.take } : {}
        };
        const teamMembers = await this.prisma.teamMember.findMany(findManyArgs);
        const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const rows = teamMembers.map(({ workRecords, ...teamMember }) => {
          const mostRecent = workRecords[0];
          const isToday = mostRecent && mostRecent.workDate.toISOString().slice(0, 10) === todayStr;
          return {
            ...teamMember,
            currentOrLastSite: mostRecent ? mostRecent.site.name : null,
            todaysAttendance: isToday ? mostRecent.attended ? "PRESENT" : "ABSENT" : null
          };
        });
        if (!pagination.paginated) {
          return rows;
        }
        const total = await this.prisma.teamMember.count(where ? { where } : void 0);
        return {
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        };
      }
      async findOne(id) {
        const teamMember = await this.prisma.teamMember.findUnique({
          where: { id },
          include: { employmentType: true }
        });
        if (!teamMember) {
          throw new common_1.NotFoundException(`Team Member ${id} not found`);
        }
        return teamMember;
      }
      async getWorkHistory(id) {
        const teamMember = await this.prisma.teamMember.findUnique({
          where: { id }
        });
        if (!teamMember) {
          throw new common_1.NotFoundException(`Team Member ${id} not found`);
        }
        return this.prisma.workRecord.findMany({
          where: {
            teamMemberId: id,
            ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
          },
          include: { site: true },
          orderBy: { workDate: "desc" }
        });
      }
      async getTeamSummary(options = {}) {
        const now = /* @__PURE__ */ new Date();
        const today = options.today ?? new Date(now.toISOString().slice(0, 10));
        const dayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
        const weekStart = new Date(now);
        weekStart.setUTCDate(now.getUTCDate() - (dayOfWeek - 1));
        weekStart.setUTCHours(0, 0, 0, 0);
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const [totalTeamMembers, workingToday, weeklyPayments, monthlyPayments] = await Promise.all([
          this.prisma.teamMember.count({ where: { isActive: true } }),
          this.prisma.workRecord.findMany({
            where: { workDate: today, attended: true },
            distinct: ["teamMemberId"],
            select: { teamMemberId: true }
          }),
          this.prisma.payment.aggregate({
            where: { paidAt: { gte: weekStart } },
            _sum: { netPayable: true }
          }),
          this.prisma.payment.aggregate({
            where: { paidAt: { gte: monthStart } },
            _sum: { netPayable: true }
          })
        ]);
        return {
          totalTeamMembers,
          todaysWorkingHeadcount: workingToday.length,
          weeklyPaymentTotal: weeklyPayments._sum.netPayable?.toNumber() ?? 0,
          monthlyPaymentTotal: monthlyPayments._sum.netPayable?.toNumber() ?? 0
        };
      }
      async getOutstandingAdvances() {
        const [teamMembers, aggregate] = await Promise.all([
          this.prisma.teamMember.findMany({
            select: { id: true, name: true, outstandingAdvanceBalance: true },
            orderBy: { outstandingAdvanceBalance: "desc" }
          }),
          this.prisma.teamMember.aggregate({
            _sum: { outstandingAdvanceBalance: true }
          })
        ]);
        return {
          total: aggregate._sum.outstandingAdvanceBalance?.toNumber() ?? 0,
          byTeamMember: teamMembers.map((t) => ({
            teamMemberId: t.id,
            name: t.name,
            outstandingAdvanceBalance: t.outstandingAdvanceBalance
          }))
        };
      }
      async update(id, input) {
        try {
          return await this.prisma.teamMember.update({
            where: { id },
            data: input,
            include: { employmentType: true }
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Team Member ${id} not found`);
          }
          throw this.translateWriteError(error);
        }
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Team Member references an Employment Type that does not exist");
        }
        return error;
      }
    };
    exports2.TeamMembersService = TeamMembersService;
    exports2.TeamMembersService = TeamMembersService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], TeamMembersService);
  }
});

// dist/src/team/team-members.controller.js
var require_team_members_controller = __commonJS({
  "dist/src/team/team-members.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TeamMembersController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var team_members_service_1 = require_team_members_service();
    var TeamMembersController = class TeamMembersController {
      teamMembersService;
      constructor(teamMembersService) {
        this.teamMembersService = teamMembersService;
      }
      create(body) {
        return this.teamMembersService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.teamMembersService.list({ q, page, pageSize, sort, order });
      }
      getTeamSummary() {
        return this.teamMembersService.getTeamSummary();
      }
      getOutstandingAdvances() {
        return this.teamMembersService.getOutstandingAdvances();
      }
      findOne(id) {
        return this.teamMembersService.findOne(id);
      }
      getWorkHistory(id) {
        return this.teamMembersService.getWorkHistory(id);
      }
      update(id, body) {
        return this.teamMembersService.update(id, body);
      }
    };
    exports2.TeamMembersController = TeamMembersController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createTeamMemberSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("team-summary"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "getTeamSummary", null);
    __decorate([
      (0, common_1.Get)("outstanding-advances"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "getOutstandingAdvances", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Get)(":id/work-history"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "getWorkHistory", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateTeamMemberSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], TeamMembersController.prototype, "update", null);
    exports2.TeamMembersController = TeamMembersController = __decorate([
      (0, common_1.Controller)("team-members"),
      __metadata("design:paramtypes", [team_members_service_1.TeamMembersService])
    ], TeamMembersController);
  }
});

// dist/src/team/work-records.service.js
var require_work_records_service = __commonJS({
  "dist/src/team/work-records.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkRecordsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var advisory_lock_1 = require_advisory_lock();
    var date_range_1 = require_date_range();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var WorkRecordsService = class WorkRecordsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        const workDate = new Date(input.workDate);
        try {
          return await this.prisma.$transaction(async (tx) => {
            await this.assertNoExistingWorkRecord(tx, input.teamMemberId, workDate);
            return this.createRow(tx, input, workDate);
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async createBatch(input) {
        const sorted = [...input].sort((a, b) => a.teamMemberId.localeCompare(b.teamMemberId));
        try {
          return await this.prisma.$transaction(async (tx) => {
            const created = [];
            for (const record of sorted) {
              const workDate = new Date(record.workDate);
              await this.assertNoExistingWorkRecord(tx, record.teamMemberId, workDate);
              created.push(await this.createRow(tx, record, workDate));
            }
            return created;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(siteId, filters = {}) {
        const where = {
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
        };
        if (siteId)
          where.siteId = siteId;
        if (filters.teamMemberId)
          where.teamMemberId = filters.teamMemberId;
        const bounds = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        if (bounds)
          where.workDate = bounds;
        return this.prisma.workRecord.findMany({
          where,
          include: { teamMember: true, site: true },
          orderBy: { workDate: "desc" }
        });
      }
      async getDefaultCrew(siteId, beforeDate) {
        const parsedDate = new Date(beforeDate);
        if (Number.isNaN(parsedDate.getTime())) {
          throw new common_1.BadRequestException(`"${beforeDate}" is not a valid date`);
        }
        const mostRecent = await this.prisma.workRecord.findFirst({
          where: { siteId, workDate: { lt: parsedDate } },
          orderBy: { workDate: "desc" },
          select: { workDate: true }
        });
        if (!mostRecent) {
          return [];
        }
        const records = await this.prisma.workRecord.findMany({
          where: {
            siteId,
            workDate: mostRecent.workDate,
            ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
          },
          include: { teamMember: true }
        });
        return records.map((record) => ({
          teamMemberId: record.teamMemberId,
          name: record.teamMember.name,
          attended: record.attended
        }));
      }
      async assertNoExistingWorkRecord(tx, teamMemberId, workDate) {
        await (0, advisory_lock_1.lockOnKey)(tx, `workrecord:${teamMemberId}:${workDate.toISOString()}`);
        const existing = await tx.workRecord.findFirst({
          where: { teamMemberId, workDate },
          include: { teamMember: true }
        });
        if (existing) {
          throw new common_1.ConflictException(`${existing.teamMember.name} already has a Work Record for ${workDate.toISOString().slice(0, 10)}`);
        }
      }
      createRow(tx, input, workDate) {
        return tx.workRecord.create({
          data: {
            teamMemberId: input.teamMemberId,
            siteId: input.siteId,
            workDate,
            attended: input.attended,
            hours: input.hours,
            overtimeHours: input.overtimeHours
          }
        });
      }
      translateWriteError(error) {
        if (error instanceof common_1.ConflictException) {
          return error;
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Work Record references a Team Member or Site that does not exist");
        }
        return error;
      }
    };
    exports2.WorkRecordsService = WorkRecordsService;
    exports2.WorkRecordsService = WorkRecordsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], WorkRecordsService);
  }
});

// dist/src/team/work-records.controller.js
var require_work_records_controller = __commonJS({
  "dist/src/team/work-records.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkRecordsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var work_records_service_1 = require_work_records_service();
    var WorkRecordsController = class WorkRecordsController {
      workRecordsService;
      constructor(workRecordsService) {
        this.workRecordsService = workRecordsService;
      }
      create(body) {
        return this.workRecordsService.create(body);
      }
      createBatch(body) {
        return this.workRecordsService.createBatch(body);
      }
      list(siteId) {
        return this.workRecordsService.list(siteId);
      }
      getDefaultCrew(siteId, date) {
        return this.workRecordsService.getDefaultCrew(siteId, date);
      }
    };
    exports2.WorkRecordsController = WorkRecordsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createWorkRecordSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], WorkRecordsController.prototype, "create", null);
    __decorate([
      (0, common_1.Post)("batch"),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createWorkRecordBatchSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Array]),
      __metadata("design:returntype", void 0)
    ], WorkRecordsController.prototype, "createBatch", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], WorkRecordsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("default-crew"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("date")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String]),
      __metadata("design:returntype", void 0)
    ], WorkRecordsController.prototype, "getDefaultCrew", null);
    exports2.WorkRecordsController = WorkRecordsController = __decorate([
      (0, common_1.Controller)("work-records"),
      __metadata("design:paramtypes", [work_records_service_1.WorkRecordsService])
    ], WorkRecordsController);
  }
});

// dist/src/team/team.module.js
var require_team_module = __commonJS({
  "dist/src/team/team.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TeamModule = void 0;
    var common_1 = require("@nestjs/common");
    var advance_adjustments_controller_1 = require_advance_adjustments_controller();
    var advance_adjustments_service_1 = require_advance_adjustments_service();
    var advances_controller_1 = require_advances_controller();
    var advances_service_1 = require_advances_service();
    var employment_types_controller_1 = require_employment_types_controller();
    var employment_types_service_1 = require_employment_types_service();
    var payments_controller_1 = require_payments_controller();
    var payments_service_1 = require_payments_service();
    var team_members_controller_1 = require_team_members_controller();
    var team_members_service_1 = require_team_members_service();
    var work_records_controller_1 = require_work_records_controller();
    var work_records_service_1 = require_work_records_service();
    var TeamModule = class TeamModule {
    };
    exports2.TeamModule = TeamModule;
    exports2.TeamModule = TeamModule = __decorate([
      (0, common_1.Module)({
        controllers: [
          advance_adjustments_controller_1.AdvanceAdjustmentsController,
          advances_controller_1.AdvancesController,
          employment_types_controller_1.EmploymentTypesController,
          payments_controller_1.PaymentsController,
          team_members_controller_1.TeamMembersController,
          work_records_controller_1.WorkRecordsController
        ],
        providers: [
          advance_adjustments_service_1.AdvanceAdjustmentsService,
          advances_service_1.AdvancesService,
          employment_types_service_1.EmploymentTypesService,
          payments_service_1.PaymentsService,
          team_members_service_1.TeamMembersService,
          work_records_service_1.WorkRecordsService
        ],
        exports: [
          team_members_service_1.TeamMembersService,
          payments_service_1.PaymentsService,
          work_records_service_1.WorkRecordsService,
          advances_service_1.AdvancesService,
          advance_adjustments_service_1.AdvanceAdjustmentsService
        ]
      })
    ], TeamModule);
  }
});

// dist/src/assets/machinery-types.service.js
var require_machinery_types_service = __commonJS({
  "dist/src/assets/machinery-types.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MachineryTypesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var MachineryTypesService = class MachineryTypesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.machineryType.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.machineryType.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.machineryType.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Machinery Type ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("A Machinery Type with this name already exists");
        }
        return error;
      }
    };
    exports2.MachineryTypesService = MachineryTypesService;
    exports2.MachineryTypesService = MachineryTypesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MachineryTypesService);
  }
});

// dist/src/assets/machinery-types.controller.js
var require_machinery_types_controller = __commonJS({
  "dist/src/assets/machinery-types.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MachineryTypesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var machinery_types_service_1 = require_machinery_types_service();
    var MachineryTypesController = class MachineryTypesController {
      machineryTypesService;
      constructor(machineryTypesService) {
        this.machineryTypesService = machineryTypesService;
      }
      create(body) {
        return this.machineryTypesService.create(body);
      }
      list() {
        return this.machineryTypesService.list();
      }
      update(id, body) {
        return this.machineryTypesService.update(id, body);
      }
    };
    exports2.MachineryTypesController = MachineryTypesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMachineryTypeSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], MachineryTypesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], MachineryTypesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateMachineryTypeSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MachineryTypesController.prototype, "update", null);
    exports2.MachineryTypesController = MachineryTypesController = __decorate([
      (0, common_1.Controller)("machinery-types"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [machinery_types_service_1.MachineryTypesService])
    ], MachineryTypesController);
  }
});

// dist/src/assets/vehicle-types.service.js
var require_vehicle_types_service = __commonJS({
  "dist/src/assets/vehicle-types.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VehicleTypesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var VehicleTypesService = class VehicleTypesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.vehicleType.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.vehicleType.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.vehicleType.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Vehicle Type ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("A Vehicle Type with this name already exists");
        }
        return error;
      }
    };
    exports2.VehicleTypesService = VehicleTypesService;
    exports2.VehicleTypesService = VehicleTypesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], VehicleTypesService);
  }
});

// dist/src/assets/vehicle-types.controller.js
var require_vehicle_types_controller = __commonJS({
  "dist/src/assets/vehicle-types.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VehicleTypesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var vehicle_types_service_1 = require_vehicle_types_service();
    var VehicleTypesController = class VehicleTypesController {
      vehicleTypesService;
      constructor(vehicleTypesService) {
        this.vehicleTypesService = vehicleTypesService;
      }
      create(body) {
        return this.vehicleTypesService.create(body);
      }
      list() {
        return this.vehicleTypesService.list();
      }
      update(id, body) {
        return this.vehicleTypesService.update(id, body);
      }
    };
    exports2.VehicleTypesController = VehicleTypesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createVehicleTypeSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], VehicleTypesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], VehicleTypesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateVehicleTypeSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], VehicleTypesController.prototype, "update", null);
    exports2.VehicleTypesController = VehicleTypesController = __decorate([
      (0, common_1.Controller)("vehicle-types"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [vehicle_types_service_1.VehicleTypesService])
    ], VehicleTypesController);
  }
});

// dist/src/assets/machinery.service.js
var require_machinery_service = __commonJS({
  "dist/src/assets/machinery.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MachineryService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var MACHINERY_SORT_FIELDS = [
      "name",
      "assetNumber",
      "currentStatus",
      "currentSite",
      "type"
    ];
    function isMachinerySortField(value) {
      return Boolean(value) && MACHINERY_SORT_FIELDS.includes(value);
    }
    function machineryOrderBy(sort, order) {
      if (!isMachinerySortField(sort)) {
        return { name: "asc" };
      }
      const direction = (0, sort_order_1.isSortOrder)(order) ? order : "asc";
      if (sort === "currentSite" || sort === "type") {
        return { [sort]: { name: direction } };
      }
      return { [sort]: direction };
    }
    var MachineryService = class MachineryService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.machinery.create({
            data: input,
            include: { type: true, currentSite: true }
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(query = {}) {
        const { q } = query;
        const where = q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { assetNumber: { contains: q, mode: "insensitive" } }
          ]
        } : void 0;
        const include = {
          type: true,
          currentSite: true,
          movementLogs: { orderBy: { movedAt: "desc" }, take: 1 }
        };
        const orderBy = machineryOrderBy(query.sort, query.order);
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        if (!pagination.paginated) {
          return this.prisma.machinery.findMany({
            ...where ? { where } : {},
            include,
            orderBy
          });
        }
        return Promise.all([
          this.prisma.machinery.findMany({
            ...where ? { where } : {},
            include,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.machinery.count(where ? { where } : void 0)
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      async findOne(id) {
        const machinery = await this.prisma.machinery.findUnique({
          where: { id },
          include: { type: true, currentSite: true }
        });
        if (!machinery) {
          throw new common_1.NotFoundException(`Machinery ${id} not found`);
        }
        return machinery;
      }
      async update(id, input) {
        try {
          return await this.prisma.machinery.update({
            where: { id },
            data: input,
            include: { type: true, currentSite: true }
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Machinery ${id} not found`);
          }
          throw this.translateWriteError(error);
        }
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2003") {
            return new common_1.BadRequestException("This Machine references a Machinery Type that does not exist");
          }
          if (error.code === "P2002") {
            return new common_1.BadRequestException("A Machine with this Asset Number already exists");
          }
        }
        return error;
      }
    };
    exports2.MachineryService = MachineryService;
    exports2.MachineryService = MachineryService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], MachineryService);
  }
});

// dist/src/assets/machinery.controller.js
var require_machinery_controller = __commonJS({
  "dist/src/assets/machinery.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MachineryController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var machinery_service_1 = require_machinery_service();
    var MachineryController = class MachineryController {
      machineryService;
      constructor(machineryService) {
        this.machineryService = machineryService;
      }
      create(body) {
        return this.machineryService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.machineryService.list({ q, page, pageSize, sort, order });
      }
      findOne(id) {
        return this.machineryService.findOne(id);
      }
      update(id, body) {
        return this.machineryService.update(id, body);
      }
    };
    exports2.MachineryController = MachineryController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createMachinerySchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], MachineryController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], MachineryController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], MachineryController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateMachinerySchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MachineryController.prototype, "update", null);
    exports2.MachineryController = MachineryController = __decorate([
      (0, common_1.Controller)("machinery"),
      __metadata("design:paramtypes", [machinery_service_1.MachineryService])
    ], MachineryController);
  }
});

// dist/src/assets/vehicle.service.js
var require_vehicle_service = __commonJS({
  "dist/src/assets/vehicle.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VehicleService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var VEHICLE_SORT_FIELDS = [
      "number",
      "driver",
      "currentStatus",
      "currentSite",
      "type"
    ];
    function isVehicleSortField(value) {
      return Boolean(value) && VEHICLE_SORT_FIELDS.includes(value);
    }
    function vehicleOrderBy(sort, order) {
      if (!isVehicleSortField(sort)) {
        return { number: "asc" };
      }
      const direction = (0, sort_order_1.isSortOrder)(order) ? order : "asc";
      if (sort === "currentSite" || sort === "type") {
        return { [sort]: { name: direction } };
      }
      return { [sort]: direction };
    }
    var VehicleService = class VehicleService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.vehicle.create({
            data: input,
            include: { type: true, currentSite: true }
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(query = {}) {
        const { q } = query;
        const where = q ? { number: { contains: q, mode: "insensitive" } } : void 0;
        const include = {
          type: true,
          currentSite: true,
          movementLogs: { orderBy: { movedAt: "desc" }, take: 1 }
        };
        const orderBy = vehicleOrderBy(query.sort, query.order);
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        if (!pagination.paginated) {
          return this.prisma.vehicle.findMany({
            ...where ? { where } : {},
            include,
            orderBy
          });
        }
        return Promise.all([
          this.prisma.vehicle.findMany({
            ...where ? { where } : {},
            include,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.vehicle.count(where ? { where } : void 0)
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
          where: { id },
          include: { type: true, currentSite: true }
        });
        if (!vehicle) {
          throw new common_1.NotFoundException(`Vehicle ${id} not found`);
        }
        return vehicle;
      }
      async update(id, input) {
        try {
          return await this.prisma.vehicle.update({
            where: { id },
            data: input,
            include: { type: true, currentSite: true }
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Vehicle ${id} not found`);
          }
          throw this.translateWriteError(error);
        }
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2003") {
            return new common_1.BadRequestException("This Vehicle references a Vehicle Type that does not exist");
          }
          if (error.code === "P2002") {
            return new common_1.BadRequestException("A Vehicle with this Number already exists");
          }
        }
        return error;
      }
    };
    exports2.VehicleService = VehicleService;
    exports2.VehicleService = VehicleService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], VehicleService);
  }
});

// dist/src/assets/vehicle.controller.js
var require_vehicle_controller = __commonJS({
  "dist/src/assets/vehicle.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VehicleController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var vehicle_service_1 = require_vehicle_service();
    var VehicleController = class VehicleController {
      vehicleService;
      constructor(vehicleService) {
        this.vehicleService = vehicleService;
      }
      create(body) {
        return this.vehicleService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.vehicleService.list({ q, page, pageSize, sort, order });
      }
      findOne(id) {
        return this.vehicleService.findOne(id);
      }
      update(id, body) {
        return this.vehicleService.update(id, body);
      }
    };
    exports2.VehicleController = VehicleController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createVehicleSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], VehicleController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], VehicleController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], VehicleController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateVehicleSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], VehicleController.prototype, "update", null);
    exports2.VehicleController = VehicleController = __decorate([
      (0, common_1.Controller)("vehicles"),
      __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
    ], VehicleController);
  }
});

// dist/src/assets/asset-movements.service.js
var require_asset_movements_service = __commonJS({
  "dist/src/assets/asset-movements.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AssetMovementsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var AssetMovementsService = class AssetMovementsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        const currentSiteId = input.toStatus === "AT_SITE" ? input.siteId ?? null : null;
        if (input.correctsId) {
          const original = input.assetType === "MACHINERY" ? await this.prisma.machineryMovementLog.findUnique({
            where: { id: input.correctsId }
          }) : await this.prisma.vehicleMovementLog.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Movement ${input.correctsId} does not exist`);
          }
          const originalAssetId = input.assetType === "MACHINERY" ? original.machineryId : original.vehicleId;
          if (originalAssetId !== input.assetId) {
            throw new common_1.BadRequestException("A correction's asset must match the Movement it corrects");
          }
        }
        try {
          return await this.prisma.$transaction(async (tx) => {
            if (input.assetType === "MACHINERY") {
              const log2 = await tx.machineryMovementLog.create({
                data: {
                  machineryId: input.assetId,
                  toStatus: input.toStatus,
                  siteId: currentSiteId,
                  movedAt: input.movedAt,
                  correctsId: input.correctsId,
                  reason: input.reason
                },
                include: { site: true }
              });
              await tx.machinery.update({
                where: { id: input.assetId },
                data: { currentStatus: input.toStatus, currentSiteId }
              });
              return log2;
            }
            const log = await tx.vehicleMovementLog.create({
              data: {
                vehicleId: input.assetId,
                toStatus: input.toStatus,
                siteId: currentSiteId,
                movedAt: input.movedAt,
                correctsId: input.correctsId,
                reason: input.reason
              },
              include: { site: true }
            });
            await tx.vehicle.update({
              where: { id: input.assetId },
              data: { currentStatus: input.toStatus, currentSiteId }
            });
            return log;
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(assetType, assetId, filters = {}) {
        const movedAt = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        if (assetType === "MACHINERY") {
          return this.prisma.machineryMovementLog.findMany({
            where: { machineryId: assetId, movedAt },
            include: { site: true },
            orderBy: { movedAt: "desc" }
          });
        }
        return this.prisma.vehicleMovementLog.findMany({
          where: { vehicleId: assetId, movedAt },
          include: { site: true },
          orderBy: { movedAt: "desc" }
        });
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Movement references a Machine/Vehicle or Site that does not exist");
        }
        return error;
      }
    };
    exports2.AssetMovementsService = AssetMovementsService;
    exports2.AssetMovementsService = AssetMovementsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AssetMovementsService);
  }
});

// dist/src/assets/asset-movements.controller.js
var require_asset_movements_controller = __commonJS({
  "dist/src/assets/asset-movements.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AssetMovementsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var asset_movements_service_1 = require_asset_movements_service();
    var AssetMovementsController = class AssetMovementsController {
      assetMovementsService;
      constructor(assetMovementsService) {
        this.assetMovementsService = assetMovementsService;
      }
      create(body) {
        return this.assetMovementsService.create(body);
      }
      list(assetType, assetId) {
        const parsedAssetType = shared_1.assetTypeSchema.safeParse(assetType);
        if (!parsedAssetType.success || !assetId) {
          throw new common_1.BadRequestException("assetType (MACHINERY or VEHICLE) and assetId query params are required");
        }
        return this.assetMovementsService.list(parsedAssetType.data, assetId);
      }
    };
    exports2.AssetMovementsController = AssetMovementsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createAssetMovementSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], AssetMovementsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("assetType")),
      __param(1, (0, common_1.Query)("assetId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String]),
      __metadata("design:returntype", void 0)
    ], AssetMovementsController.prototype, "list", null);
    exports2.AssetMovementsController = AssetMovementsController = __decorate([
      (0, common_1.Controller)("asset-movements"),
      __metadata("design:paramtypes", [asset_movements_service_1.AssetMovementsService])
    ], AssetMovementsController);
  }
});

// dist/src/assets/asset-service-logs.service.js
var require_asset_service_logs_service = __commonJS({
  "dist/src/assets/asset-service-logs.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AssetServiceLogsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var AssetServiceLogsService = class AssetServiceLogsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          if (input.assetType === "MACHINERY") {
            return await this.prisma.machineryServiceLog.create({
              data: {
                machineryId: input.assetId,
                kind: input.kind,
                notes: input.notes,
                cost: input.cost,
                serviceDate: input.serviceDate
              }
            });
          }
          return await this.prisma.vehicleServiceLog.create({
            data: {
              vehicleId: input.assetId,
              kind: input.kind,
              notes: input.notes,
              cost: input.cost,
              serviceDate: input.serviceDate
            }
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      list(assetType, assetId, filters = {}) {
        const serviceDate = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        if (assetType === "MACHINERY") {
          return this.prisma.machineryServiceLog.findMany({
            where: { machineryId: assetId, serviceDate },
            orderBy: { serviceDate: "desc" }
          });
        }
        return this.prisma.vehicleServiceLog.findMany({
          where: { vehicleId: assetId, serviceDate },
          orderBy: { serviceDate: "desc" }
        });
      }
      async update(id, assetType, input) {
        try {
          if (assetType === "MACHINERY") {
            return await this.prisma.machineryServiceLog.update({
              where: { id },
              data: input
            });
          }
          return await this.prisma.vehicleServiceLog.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Service Log ${id} not found`);
          }
          throw this.translateWriteError(error);
        }
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Service Log entry references a Machine/Vehicle that does not exist");
        }
        return error;
      }
    };
    exports2.AssetServiceLogsService = AssetServiceLogsService;
    exports2.AssetServiceLogsService = AssetServiceLogsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AssetServiceLogsService);
  }
});

// dist/src/assets/asset-service-logs.controller.js
var require_asset_service_logs_controller = __commonJS({
  "dist/src/assets/asset-service-logs.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AssetServiceLogsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var asset_service_logs_service_1 = require_asset_service_logs_service();
    var AssetServiceLogsController = class AssetServiceLogsController {
      assetServiceLogsService;
      constructor(assetServiceLogsService) {
        this.assetServiceLogsService = assetServiceLogsService;
      }
      create(body) {
        return this.assetServiceLogsService.create(body);
      }
      list(assetType, assetId) {
        const parsedAssetType = shared_1.assetTypeSchema.safeParse(assetType);
        if (!parsedAssetType.success || !assetId) {
          throw new common_1.BadRequestException("assetType (MACHINERY or VEHICLE) and assetId query params are required");
        }
        return this.assetServiceLogsService.list(parsedAssetType.data, assetId);
      }
      update(id, assetType, body) {
        const parsedAssetType = shared_1.assetTypeSchema.safeParse(assetType);
        if (!parsedAssetType.success) {
          throw new common_1.BadRequestException("assetType (MACHINERY or VEHICLE) query param is required");
        }
        return this.assetServiceLogsService.update(id, parsedAssetType.data, body);
      }
    };
    exports2.AssetServiceLogsController = AssetServiceLogsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createAssetServiceLogSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], AssetServiceLogsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("assetType")),
      __param(1, (0, common_1.Query)("assetId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String]),
      __metadata("design:returntype", void 0)
    ], AssetServiceLogsController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Query)("assetType")),
      __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateAssetServiceLogSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, Object]),
      __metadata("design:returntype", void 0)
    ], AssetServiceLogsController.prototype, "update", null);
    exports2.AssetServiceLogsController = AssetServiceLogsController = __decorate([
      (0, common_1.Controller)("asset-service-logs"),
      __metadata("design:paramtypes", [asset_service_logs_service_1.AssetServiceLogsService])
    ], AssetServiceLogsController);
  }
});

// dist/src/assets/assets.module.js
var require_assets_module = __commonJS({
  "dist/src/assets/assets.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AssetsModule = void 0;
    var common_1 = require("@nestjs/common");
    var machinery_types_controller_1 = require_machinery_types_controller();
    var machinery_types_service_1 = require_machinery_types_service();
    var vehicle_types_controller_1 = require_vehicle_types_controller();
    var vehicle_types_service_1 = require_vehicle_types_service();
    var machinery_controller_1 = require_machinery_controller();
    var machinery_service_1 = require_machinery_service();
    var vehicle_controller_1 = require_vehicle_controller();
    var vehicle_service_1 = require_vehicle_service();
    var asset_movements_controller_1 = require_asset_movements_controller();
    var asset_movements_service_1 = require_asset_movements_service();
    var asset_service_logs_controller_1 = require_asset_service_logs_controller();
    var asset_service_logs_service_1 = require_asset_service_logs_service();
    var AssetsModule = class AssetsModule {
    };
    exports2.AssetsModule = AssetsModule;
    exports2.AssetsModule = AssetsModule = __decorate([
      (0, common_1.Module)({
        controllers: [
          machinery_types_controller_1.MachineryTypesController,
          vehicle_types_controller_1.VehicleTypesController,
          machinery_controller_1.MachineryController,
          vehicle_controller_1.VehicleController,
          asset_movements_controller_1.AssetMovementsController,
          asset_service_logs_controller_1.AssetServiceLogsController
        ],
        providers: [
          machinery_types_service_1.MachineryTypesService,
          vehicle_types_service_1.VehicleTypesService,
          machinery_service_1.MachineryService,
          vehicle_service_1.VehicleService,
          asset_movements_service_1.AssetMovementsService,
          asset_service_logs_service_1.AssetServiceLogsService
        ],
        exports: [
          machinery_service_1.MachineryService,
          vehicle_service_1.VehicleService,
          asset_movements_service_1.AssetMovementsService,
          asset_service_logs_service_1.AssetServiceLogsService
        ]
      })
    ], AssetsModule);
  }
});

// dist/src/vendors/vendors.service.js
var require_vendors_service = __commonJS({
  "dist/src/vendors/vendors.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VendorsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var purchases_service_1 = require_purchases_service();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var VENDOR_SORT_FIELDS = ["name", "contactPerson", "phone"];
    function isVendorSortField(value) {
      return Boolean(value) && VENDOR_SORT_FIELDS.includes(value);
    }
    var VendorsService = class VendorsService {
      prisma;
      purchasesService;
      constructor(prisma, purchasesService) {
        this.prisma = prisma;
        this.purchasesService = purchasesService;
      }
      create(input) {
        return this.prisma.vendor.create({ data: input });
      }
      list(query = {}) {
        const { q, sort, order } = query;
        const where = {
          deletedAt: null,
          ...q ? { name: { contains: q, mode: "insensitive" } } : {}
        };
        const orderBy = isVendorSortField(sort) ? { [sort]: (0, sort_order_1.isSortOrder)(order) ? order : "asc" } : { name: "asc" };
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        if (!pagination.paginated) {
          return this.prisma.vendor.findMany({ where, orderBy });
        }
        return Promise.all([
          this.prisma.vendor.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.vendor.count({ where })
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      async update(id, input) {
        await this.findOne(id);
        try {
          return await this.prisma.vendor.update({ where: { id }, data: input });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Vendor ${id} not found`);
          }
          throw error;
        }
      }
      async findOne(id) {
        const vendor = await this.prisma.vendor.findUnique({ where: { id } });
        if (!vendor || vendor.deletedAt) {
          throw new common_1.NotFoundException(`Vendor ${id} not found`);
        }
        return vendor;
      }
      async softDelete(id) {
        const vendor = await this.prisma.vendor.findUnique({ where: { id } });
        if (!vendor || vendor.deletedAt) {
          throw new common_1.NotFoundException(`Vendor ${id} not found`);
        }
        return this.prisma.vendor.update({
          where: { id },
          data: { deletedAt: /* @__PURE__ */ new Date() }
        });
      }
      async purchases(id) {
        await this.findOne(id);
        return this.purchasesService.listByVendor(id);
      }
      async purchaseSummary(id) {
        await this.findOne(id);
        return this.purchasesService.summaryForVendor(id);
      }
    };
    exports2.VendorsService = VendorsService;
    exports2.VendorsService = VendorsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        purchases_service_1.PurchasesService
      ])
    ], VendorsService);
  }
});

// dist/src/vendors/vendors.controller.js
var require_vendors_controller = __commonJS({
  "dist/src/vendors/vendors.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VendorsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var vendors_service_1 = require_vendors_service();
    var VendorsController = class VendorsController {
      vendorsService;
      constructor(vendorsService) {
        this.vendorsService = vendorsService;
      }
      create(body) {
        return this.vendorsService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.vendorsService.list({ q, page, pageSize, sort, order });
      }
      update(id, body) {
        return this.vendorsService.update(id, body);
      }
      findOne(id) {
        return this.vendorsService.findOne(id);
      }
      purchases(id) {
        return this.vendorsService.purchases(id);
      }
      purchaseSummary(id) {
        return this.vendorsService.purchaseSummary(id);
      }
      remove(id) {
        return this.vendorsService.softDelete(id);
      }
    };
    exports2.VendorsController = VendorsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createVendorSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateVendorSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "update", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Get)(":id/purchases"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "purchases", null);
    __decorate([
      (0, common_1.Get)(":id/purchase-summary"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "purchaseSummary", null);
    __decorate([
      (0, common_1.Delete)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], VendorsController.prototype, "remove", null);
    exports2.VendorsController = VendorsController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, common_1.Controller)("vendors"),
      __metadata("design:paramtypes", [vendors_service_1.VendorsService])
    ], VendorsController);
  }
});

// dist/src/vendors/vendors.module.js
var require_vendors_module = __commonJS({
  "dist/src/vendors/vendors.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VendorsModule = void 0;
    var common_1 = require("@nestjs/common");
    var inventory_module_1 = require_inventory_module();
    var vendors_controller_1 = require_vendors_controller();
    var vendors_service_1 = require_vendors_service();
    var VendorsModule = class VendorsModule {
    };
    exports2.VendorsModule = VendorsModule;
    exports2.VendorsModule = VendorsModule = __decorate([
      (0, common_1.Module)({
        imports: [inventory_module_1.InventoryModule],
        controllers: [vendors_controller_1.VendorsController],
        providers: [vendors_service_1.VendorsService]
      })
    ], VendorsModule);
  }
});

// dist/src/subcontractors/site-contracts.computed.js
var require_site_contracts_computed = __commonJS({
  "dist/src/subcontractors/site-contracts.computed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.computeSiteContractAmounts = computeSiteContractAmounts;
    function computeSiteContractAmounts(contract) {
      let amountPayable;
      if (contract.rateType === "FIXED_COST") {
        amountPayable = contract.fixedAmount === null ? null : contract.fixedAmount.toNumber();
      } else if (contract.rate === null) {
        amountPayable = null;
      } else {
        amountPayable = contract.rate.toNumber() * contract.quantityCompleted.toNumber();
      }
      const outstandingAmount = amountPayable === null ? null : amountPayable - contract.amountPaid.toNumber();
      return { amountPayable, outstandingAmount };
    }
  }
});

// dist/src/subcontractors/site-contracts.service.js
var require_site_contracts_service = __commonJS({
  "dist/src/subcontractors/site-contracts.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SiteContractsService = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var site_contracts_computed_1 = require_site_contracts_computed();
    var SiteContractsService = class SiteContractsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      withComputed(contract) {
        return { ...contract, ...(0, site_contracts_computed_1.computeSiteContractAmounts)(contract) };
      }
      async create(input) {
        const subcontractor = await this.prisma.subcontractor.findUnique({
          where: { id: input.subcontractorId }
        });
        if (!subcontractor || subcontractor.deletedAt) {
          throw new common_1.BadRequestException("This Subcontractor does not exist");
        }
        const site = await this.prisma.site.findUnique({
          where: { id: input.siteId }
        });
        if (!site || site.deletedAt) {
          throw new common_1.BadRequestException("This Site does not exist");
        }
        const contract = await this.prisma.siteContract.create({ data: input });
        return this.withComputed(contract);
      }
      async list(query = {}) {
        const parsedStatus = query.status ? shared_1.contractStatusSchema.safeParse(query.status) : void 0;
        if (parsedStatus && !parsedStatus.success) {
          throw new common_1.BadRequestException(`Invalid status filter: ${query.status}`);
        }
        const where = {
          ...query.siteId ? { siteId: query.siteId } : {},
          ...query.subcontractorId ? { subcontractorId: query.subcontractorId } : {},
          ...parsedStatus?.success ? { status: parsedStatus.data } : {}
        };
        const contracts = await this.prisma.siteContract.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: { subcontractor: true, site: true }
        });
        return contracts.map((c) => this.withComputed(c));
      }
      async findOne(id) {
        const contract = await this.prisma.siteContract.findUnique({
          where: { id },
          include: { subcontractor: true, site: true }
        });
        if (!contract || contract.subcontractor.deletedAt || contract.site.deletedAt) {
          throw new common_1.NotFoundException(`Site Contract ${id} not found`);
        }
        return this.withComputed(contract);
      }
      async update(id, input) {
        const existing = await this.findOne(id);
        const merged = {
          workCategory: input.workCategory !== void 0 ? input.workCategory : existing.workCategory,
          rateType: input.rateType !== void 0 ? input.rateType : existing.rateType,
          rate: input.rate !== void 0 ? input.rate : existing.rate?.toNumber(),
          fixedAmount: input.fixedAmount !== void 0 ? input.fixedAmount : existing.fixedAmount?.toNumber(),
          rateUnitLabel: input.rateUnitLabel !== void 0 ? input.rateUnitLabel : existing.rateUnitLabel,
          startDate: input.startDate !== void 0 ? input.startDate : existing.startDate,
          status: input.status !== void 0 ? input.status : existing.status
        };
        const issues = [
          ...(0, shared_1.collectRateTypeIssues)(merged),
          ...(0, shared_1.collectActiveRequiredIssues)(merged)
        ];
        if (issues.length > 0) {
          const fieldErrors = {};
          for (const issue of issues) {
            (fieldErrors[issue.path] ??= []).push(issue.message);
          }
          throw new common_1.BadRequestException({
            error: { code: "VALIDATION_FAILED", details: { fieldErrors } }
          });
        }
        try {
          const updated = await this.prisma.siteContract.update({
            where: { id },
            data: input
          });
          return this.withComputed(updated);
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Site Contract ${id} not found`);
          }
          throw error;
        }
      }
      async outstandingSummary() {
        const contracts = await this.prisma.siteContract.findMany({
          include: { subcontractor: true }
        });
        const bySubcontractor = /* @__PURE__ */ new Map();
        let totalOutstanding = 0;
        for (const contract of contracts) {
          const { outstandingAmount } = (0, site_contracts_computed_1.computeSiteContractAmounts)(contract);
          const amount = outstandingAmount ?? 0;
          totalOutstanding += amount;
          const existing = bySubcontractor.get(contract.subcontractorId);
          if (existing) {
            existing.outstanding += amount;
          } else {
            bySubcontractor.set(contract.subcontractorId, {
              subcontractorId: contract.subcontractorId,
              subcontractorName: contract.subcontractor.name,
              outstanding: amount
            });
          }
        }
        return {
          totalOutstanding,
          bySubcontractor: Array.from(bySubcontractor.values())
        };
      }
      countDraftPendingTerms() {
        return this.prisma.siteContract.count({
          where: {
            status: "DRAFT",
            OR: [
              { workCategory: null },
              { rateType: null },
              { startDate: null },
              {
                AND: [{ rateType: "FIXED_COST" }, { fixedAmount: null }]
              },
              {
                AND: [
                  { rateType: { not: "FIXED_COST" } },
                  { rateType: { not: null } },
                  { rate: null }
                ]
              }
            ]
          }
        });
      }
    };
    exports2.SiteContractsService = SiteContractsService;
    exports2.SiteContractsService = SiteContractsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], SiteContractsService);
  }
});

// dist/src/subcontractors/subcontractors.service.js
var require_subcontractors_service = __commonJS({
  "dist/src/subcontractors/subcontractors.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubcontractorsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var site_contracts_service_1 = require_site_contracts_service();
    var SUBCONTRACTOR_SORT_FIELDS = ["name", "contactPerson", "phone"];
    function isSubcontractorSortField(value) {
      return Boolean(value) && SUBCONTRACTOR_SORT_FIELDS.includes(value);
    }
    var SubcontractorsService = class SubcontractorsService {
      prisma;
      siteContractsService;
      constructor(prisma, siteContractsService) {
        this.prisma = prisma;
        this.siteContractsService = siteContractsService;
      }
      create(input) {
        return this.prisma.subcontractor.create({ data: input });
      }
      list(query = {}) {
        const { q, sort, order } = query;
        const where = {
          deletedAt: null,
          ...q ? { name: { contains: q, mode: "insensitive" } } : {}
        };
        const orderBy = isSubcontractorSortField(sort) ? { [sort]: (0, sort_order_1.isSortOrder)(order) ? order : "asc" } : { name: "asc" };
        const pagination = (0, pagination_1.paginationParams)(query.page, query.pageSize);
        if (!pagination.paginated) {
          return this.prisma.subcontractor.findMany({ where, orderBy });
        }
        return Promise.all([
          this.prisma.subcontractor.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.subcontractor.count({ where })
        ]).then(([rows, total]) => ({
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        }));
      }
      async update(id, input) {
        await this.findOne(id);
        try {
          return await this.prisma.subcontractor.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Subcontractor ${id} not found`);
          }
          throw error;
        }
      }
      async findOne(id) {
        const subcontractor = await this.prisma.subcontractor.findUnique({
          where: { id }
        });
        if (!subcontractor || subcontractor.deletedAt) {
          throw new common_1.NotFoundException(`Subcontractor ${id} not found`);
        }
        return subcontractor;
      }
      async contracts(id) {
        await this.findOne(id);
        return this.siteContractsService.list({ subcontractorId: id });
      }
      async softDelete(id) {
        const subcontractor = await this.prisma.subcontractor.findUnique({
          where: { id }
        });
        if (!subcontractor || subcontractor.deletedAt) {
          throw new common_1.NotFoundException(`Subcontractor ${id} not found`);
        }
        return this.prisma.subcontractor.update({
          where: { id },
          data: { deletedAt: /* @__PURE__ */ new Date() }
        });
      }
    };
    exports2.SubcontractorsService = SubcontractorsService;
    exports2.SubcontractorsService = SubcontractorsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        site_contracts_service_1.SiteContractsService
      ])
    ], SubcontractorsService);
  }
});

// dist/src/subcontractors/subcontractors.controller.js
var require_subcontractors_controller = __commonJS({
  "dist/src/subcontractors/subcontractors.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubcontractorsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var subcontractors_service_1 = require_subcontractors_service();
    var SubcontractorsController = class SubcontractorsController {
      subcontractorsService;
      constructor(subcontractorsService) {
        this.subcontractorsService = subcontractorsService;
      }
      create(body) {
        return this.subcontractorsService.create(body);
      }
      list(q, page, pageSize, sort, order) {
        return this.subcontractorsService.list({ q, page, pageSize, sort, order });
      }
      update(id, body) {
        return this.subcontractorsService.update(id, body);
      }
      findOne(id) {
        return this.subcontractorsService.findOne(id);
      }
      contracts(id) {
        return this.subcontractorsService.contracts(id);
      }
      remove(id) {
        return this.subcontractorsService.softDelete(id);
      }
    };
    exports2.SubcontractorsController = SubcontractorsController;
    __decorate([
      (0, common_1.Post)(),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createSubcontractorSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __param(1, (0, common_1.Query)("page")),
      __param(2, (0, common_1.Query)("pageSize")),
      __param(3, (0, common_1.Query)("sort")),
      __param(4, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateSubcontractorSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "update", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Get)(":id/contracts"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "contracts", null);
    __decorate([
      (0, common_1.Delete)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SubcontractorsController.prototype, "remove", null);
    exports2.SubcontractorsController = SubcontractorsController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, common_1.Controller)("subcontractors"),
      __metadata("design:paramtypes", [subcontractors_service_1.SubcontractorsService])
    ], SubcontractorsController);
  }
});

// dist/src/subcontractors/site-contracts.controller.js
var require_site_contracts_controller = __commonJS({
  "dist/src/subcontractors/site-contracts.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SiteContractsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var site_contracts_service_1 = require_site_contracts_service();
    var SiteContractsController = class SiteContractsController {
      siteContractsService;
      constructor(siteContractsService) {
        this.siteContractsService = siteContractsService;
      }
      create(body) {
        return this.siteContractsService.create(body);
      }
      list(siteId, subcontractorId, status) {
        return this.siteContractsService.list({ siteId, subcontractorId, status });
      }
      outstandingSummary() {
        return this.siteContractsService.outstandingSummary();
      }
      countDraftPendingTerms() {
        return this.siteContractsService.countDraftPendingTerms();
      }
      findOne(id) {
        return this.siteContractsService.findOne(id);
      }
      update(id, body) {
        return this.siteContractsService.update(id, body);
      }
    };
    exports2.SiteContractsController = SiteContractsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createSiteContractSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      (0, roles_decorator_1.Roles)(),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("subcontractorId")),
      __param(2, (0, common_1.Query)("status")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("outstanding-summary"),
      (0, roles_decorator_1.Roles)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "outstandingSummary", null);
    __decorate([
      (0, common_1.Get)("count/draft-pending-terms"),
      (0, roles_decorator_1.Roles)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "countDraftPendingTerms", null);
    __decorate([
      (0, common_1.Get)(":id"),
      (0, roles_decorator_1.Roles)(),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "findOne", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateSiteContractSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], SiteContractsController.prototype, "update", null);
    exports2.SiteContractsController = SiteContractsController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      (0, common_1.Controller)("site-contracts"),
      __metadata("design:paramtypes", [site_contracts_service_1.SiteContractsService])
    ], SiteContractsController);
  }
});

// dist/src/subcontractors/quantity-completed.js
var require_quantity_completed = __commonJS({
  "dist/src/subcontractors/quantity-completed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyQuantityDelta = applyQuantityDelta;
    var common_1 = require("@nestjs/common");
    async function applyQuantityDelta(tx, siteContractId, delta, message = "This correction would reduce completed quantity below zero.") {
      const result = await tx.siteContract.updateMany({
        where: { id: siteContractId, quantityCompleted: { gte: -delta } },
        data: { quantityCompleted: { increment: delta } }
      });
      if (result.count === 0) {
        throw new common_1.BadRequestException({
          error: { code: "QUANTITY_BELOW_ZERO", message }
        });
      }
    }
  }
});

// dist/src/subcontractors/work-entries.service.js
var require_work_entries_service = __commonJS({
  "dist/src/subcontractors/work-entries.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkEntriesService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var quantity_completed_1 = require_quantity_completed();
    var WorkEntriesService = class WorkEntriesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      list(query = {}) {
        return this.prisma.subcontractorWorkEntry.findMany({
          where: query.siteContractId ? { siteContractId: query.siteContractId } : {},
          orderBy: { workDate: "desc" }
        });
      }
      async create(input, recordedByUserId) {
        const contract = await this.prisma.siteContract.findUnique({
          where: { id: input.siteContractId },
          include: { subcontractor: true }
        });
        if (!contract || contract.subcontractor.deletedAt) {
          throw new common_1.BadRequestException("This Site Contract does not exist");
        }
        if (contract.status !== "ACTIVE") {
          throw new common_1.BadRequestException({
            error: {
              code: "CONTRACT_NOT_ACTIVE",
              message: "Work Entries can only be recorded against an Active Site Contract"
            }
          });
        }
        if (contract.rateType === "FIXED_COST") {
          throw new common_1.BadRequestException({
            error: {
              code: "FIXED_COST_NO_QUANTITY",
              message: "Fixed Cost contracts don't track work quantity \u2014 update the contract's status directly"
            }
          });
        }
        if (input.correctsId) {
          const original = await this.prisma.subcontractorWorkEntry.findUnique({
            where: { id: input.correctsId }
          });
          if (!original || original.siteContractId !== input.siteContractId) {
            throw new common_1.BadRequestException("The Work Entry being corrected does not exist on this Site Contract");
          }
        }
        return this.prisma.$transaction(async (tx) => {
          const entry = await tx.subcontractorWorkEntry.create({
            data: { ...input, recordedByUserId }
          });
          await (0, quantity_completed_1.applyQuantityDelta)(tx, input.siteContractId, input.quantity);
          return entry;
        });
      }
    };
    exports2.WorkEntriesService = WorkEntriesService;
    exports2.WorkEntriesService = WorkEntriesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], WorkEntriesService);
  }
});

// dist/src/subcontractors/work-entries.controller.js
var require_work_entries_controller = __commonJS({
  "dist/src/subcontractors/work-entries.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkEntriesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var work_entries_service_1 = require_work_entries_service();
    var WorkEntriesController = class WorkEntriesController {
      workEntriesService;
      constructor(workEntriesService) {
        this.workEntriesService = workEntriesService;
      }
      create(user, body) {
        return this.workEntriesService.create(body, user.id);
      }
      list(siteContractId) {
        return this.workEntriesService.list({ siteContractId });
      }
    };
    exports2.WorkEntriesController = WorkEntriesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createSubcontractorWorkEntrySchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], WorkEntriesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteContractId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], WorkEntriesController.prototype, "list", null);
    exports2.WorkEntriesController = WorkEntriesController = __decorate([
      (0, common_1.Controller)("subcontractor-work-entries"),
      __metadata("design:paramtypes", [work_entries_service_1.WorkEntriesService])
    ], WorkEntriesController);
  }
});

// dist/src/subcontractors/amount-paid.js
var require_amount_paid = __commonJS({
  "dist/src/subcontractors/amount-paid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyAmountPaidDelta = applyAmountPaidDelta;
    var common_1 = require("@nestjs/common");
    async function applyAmountPaidDelta(tx, siteContractId, delta, message = "This correction would reduce amount paid below zero.") {
      const result = await tx.siteContract.updateMany({
        where: { id: siteContractId, amountPaid: { gte: -delta } },
        data: { amountPaid: { increment: delta } }
      });
      if (result.count === 0) {
        throw new common_1.BadRequestException({
          error: { code: "AMOUNT_PAID_BELOW_ZERO", message }
        });
      }
    }
  }
});

// dist/src/subcontractors/subcontractor-payments.service.js
var require_subcontractor_payments_service = __commonJS({
  "dist/src/subcontractors/subcontractor-payments.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubcontractorPaymentsService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var amount_paid_1 = require_amount_paid();
    var SubcontractorPaymentsService = class SubcontractorPaymentsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      list(query = {}) {
        return this.prisma.subcontractorPayment.findMany({
          where: query.siteContractId ? { siteContractId: query.siteContractId } : {},
          orderBy: { paidAt: "desc" }
        });
      }
      async create(input, recordedByUserId) {
        const contract = await this.prisma.siteContract.findUnique({
          where: { id: input.siteContractId },
          include: { subcontractor: true }
        });
        if (!contract || contract.subcontractor.deletedAt) {
          throw new common_1.BadRequestException("This Site Contract does not exist");
        }
        if (input.correctsId) {
          const original = await this.prisma.subcontractorPayment.findUnique({
            where: { id: input.correctsId }
          });
          if (!original || original.siteContractId !== input.siteContractId) {
            throw new common_1.BadRequestException("The Payment being corrected does not exist on this Site Contract");
          }
        }
        return this.prisma.$transaction(async (tx) => {
          const payment = await tx.subcontractorPayment.create({
            data: { ...input, recordedByUserId }
          });
          await (0, amount_paid_1.applyAmountPaidDelta)(tx, input.siteContractId, input.amount);
          return payment;
        });
      }
    };
    exports2.SubcontractorPaymentsService = SubcontractorPaymentsService;
    exports2.SubcontractorPaymentsService = SubcontractorPaymentsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], SubcontractorPaymentsService);
  }
});

// dist/src/subcontractors/subcontractor-payments.controller.js
var require_subcontractor_payments_controller = __commonJS({
  "dist/src/subcontractors/subcontractor-payments.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubcontractorPaymentsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var current_user_decorator_1 = require_current_user_decorator();
    var subcontractor_payments_service_1 = require_subcontractor_payments_service();
    var SubcontractorPaymentsController = class SubcontractorPaymentsController {
      paymentsService;
      constructor(paymentsService) {
        this.paymentsService = paymentsService;
      }
      create(user, body) {
        return this.paymentsService.create(body, user.id);
      }
      list(siteContractId) {
        return this.paymentsService.list({ siteContractId });
      }
    };
    exports2.SubcontractorPaymentsController = SubcontractorPaymentsController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createSubcontractorPaymentSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], SubcontractorPaymentsController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteContractId")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], SubcontractorPaymentsController.prototype, "list", null);
    exports2.SubcontractorPaymentsController = SubcontractorPaymentsController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      (0, common_1.Controller)("subcontractor-payments"),
      __metadata("design:paramtypes", [subcontractor_payments_service_1.SubcontractorPaymentsService])
    ], SubcontractorPaymentsController);
  }
});

// dist/src/subcontractors/subcontractors.module.js
var require_subcontractors_module = __commonJS({
  "dist/src/subcontractors/subcontractors.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubcontractorsModule = void 0;
    var common_1 = require("@nestjs/common");
    var subcontractors_controller_1 = require_subcontractors_controller();
    var subcontractors_service_1 = require_subcontractors_service();
    var site_contracts_controller_1 = require_site_contracts_controller();
    var site_contracts_service_1 = require_site_contracts_service();
    var work_entries_controller_1 = require_work_entries_controller();
    var work_entries_service_1 = require_work_entries_service();
    var subcontractor_payments_controller_1 = require_subcontractor_payments_controller();
    var subcontractor_payments_service_1 = require_subcontractor_payments_service();
    var SubcontractorsModule = class SubcontractorsModule {
    };
    exports2.SubcontractorsModule = SubcontractorsModule;
    exports2.SubcontractorsModule = SubcontractorsModule = __decorate([
      (0, common_1.Module)({
        controllers: [
          subcontractors_controller_1.SubcontractorsController,
          site_contracts_controller_1.SiteContractsController,
          work_entries_controller_1.WorkEntriesController,
          subcontractor_payments_controller_1.SubcontractorPaymentsController
        ],
        providers: [
          subcontractors_service_1.SubcontractorsService,
          site_contracts_service_1.SiteContractsService,
          work_entries_service_1.WorkEntriesService,
          subcontractor_payments_service_1.SubcontractorPaymentsService
        ]
      })
    ], SubcontractorsModule);
  }
});

// dist/src/rmc/rmc.service.js
var require_rmc_service = __commonJS({
  "dist/src/rmc/rmc.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RmcService = exports2.RMC_REPORT_GROUP_BYS = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var RMC_ENTRY_SORT_FIELDS = [
      "deliveredAt",
      "quantityM3",
      "grade",
      "ratePerM3",
      "totalAmount",
      "site",
      "vendor"
    ];
    function isRmcEntrySortField(value) {
      return Boolean(value) && RMC_ENTRY_SORT_FIELDS.includes(value);
    }
    function rmcEntryOrderBy(sort, order) {
      if (!isRmcEntrySortField(sort)) {
        return { deliveredAt: "desc" };
      }
      const direction = (0, sort_order_1.isSortOrder)(order) ? order : "asc";
      if (sort === "site" || sort === "vendor") {
        return { [sort]: { name: direction } };
      }
      return { [sort]: direction };
    }
    exports2.RMC_REPORT_GROUP_BYS = ["day", "site", "vendor"];
    var RmcService = class RmcService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.rmcEntry.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`RMC delivery ${input.correctsId} does not exist`);
          }
          if (original.siteId !== input.siteId || original.vendorId !== input.vendorId || original.grade !== input.grade) {
            throw new common_1.BadRequestException("A correction's Site, Vendor, and Grade must match the RMC delivery it corrects");
          }
        }
        try {
          return await this.prisma.rmcEntry.create({
            data: { ...input, deliveredAt: new Date(input.deliveredAt) }
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(filters = {}) {
        const where = {
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
        };
        if (filters.siteId) {
          where.siteId = filters.siteId;
        }
        if (filters.vendorId) {
          where.vendorId = filters.vendorId;
        }
        if (filters.date) {
          const dayStart = new Date(filters.date);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          where.deliveredAt = { gte: dayStart, lt: dayEnd };
        }
        if (filters.q) {
          where.AND = [
            {
              OR: [
                { grade: { contains: filters.q, mode: "insensitive" } },
                { site: { name: { contains: filters.q, mode: "insensitive" } } },
                { vendor: { name: { contains: filters.q, mode: "insensitive" } } }
              ]
            }
          ];
        }
        const include = { site: true, vendor: true };
        const orderBy = rmcEntryOrderBy(filters.sort, filters.order);
        const pagination = (0, pagination_1.paginationParams)(filters.page, filters.pageSize);
        if (!pagination.paginated) {
          return this.prisma.rmcEntry.findMany({ where, include, orderBy });
        }
        const [rows, total] = await Promise.all([
          this.prisma.rmcEntry.findMany({
            where,
            include,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.rmcEntry.count({ where })
        ]);
        return {
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        };
      }
      async report(groupBy, filters = {}) {
        const where = {
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
        };
        if (filters.from || filters.to) {
          const deliveredAt = {};
          if (filters.from) {
            deliveredAt.gte = new Date(filters.from);
          }
          if (filters.to) {
            const toEnd = new Date(filters.to);
            toEnd.setDate(toEnd.getDate() + 1);
            deliveredAt.lt = toEnd;
          }
          where.deliveredAt = deliveredAt;
        }
        const entries = await this.prisma.rmcEntry.findMany({
          where,
          include: { site: true, vendor: true },
          orderBy: { deliveredAt: "desc" }
        });
        const groups = /* @__PURE__ */ new Map();
        for (const entry of entries) {
          const { key, label } = this.reportGroupOf(entry, groupBy);
          const bucket = groups.get(key) ?? {
            key,
            label,
            totalQuantityM3: 0,
            totalCost: 0,
            entryCount: 0
          };
          bucket.totalQuantityM3 += entry.quantityM3.toNumber();
          bucket.totalCost += entry.totalAmount.toNumber();
          bucket.entryCount += 1;
          groups.set(key, bucket);
        }
        const rows = [...groups.values()];
        if (groupBy === "day") {
          rows.sort((a, b) => b.key.localeCompare(a.key));
        } else {
          rows.sort((a, b) => a.label.localeCompare(b.label));
        }
        return rows;
      }
      reportGroupOf(entry, groupBy) {
        if (groupBy === "site") {
          return { key: entry.siteId, label: entry.site.name };
        }
        if (groupBy === "vendor") {
          return { key: entry.vendorId, label: entry.vendor.name };
        }
        const day = new Date(entry.deliveredAt).toISOString().slice(0, 10);
        return { key: day, label: day };
      }
      async findOne(id) {
        const entry = await this.prisma.rmcEntry.findUnique({
          where: { id },
          include: { site: true, vendor: true }
        });
        if (!entry) {
          throw new common_1.NotFoundException(`RMC delivery ${id} not found`);
        }
        return entry;
      }
      async statsThisMonth() {
        const now = /* @__PURE__ */ new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const whereThisMonth = {
          deliveredAt: { gte: monthStart, lt: nextMonthStart },
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
        };
        const [aggregate, activeVendors] = await Promise.all([
          this.prisma.rmcEntry.aggregate({
            where: whereThisMonth,
            _sum: { quantityM3: true, totalAmount: true }
          }),
          this.prisma.rmcEntry.findMany({
            where: whereThisMonth,
            select: { vendorId: true },
            distinct: ["vendorId"]
          })
        ]);
        return {
          totalQuantityM3: aggregate._sum.quantityM3?.toNumber() ?? 0,
          totalCost: aggregate._sum.totalAmount?.toNumber() ?? 0,
          activeVendorCount: activeVendors.length
        };
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This RMC delivery references a Vendor or Site that does not exist");
        }
        return error;
      }
    };
    exports2.RmcService = RmcService;
    exports2.RmcService = RmcService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], RmcService);
  }
});

// dist/src/rmc/rmc.controller.js
var require_rmc_controller = __commonJS({
  "dist/src/rmc/rmc.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RmcController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var rmc_service_1 = require_rmc_service();
    var RmcController = class RmcController {
      rmcService;
      constructor(rmcService) {
        this.rmcService = rmcService;
      }
      create(body) {
        return this.rmcService.create(body);
      }
      list(siteId, vendorId, date, q, page, pageSize, sort, order) {
        return this.rmcService.list({
          siteId,
          vendorId,
          date,
          q,
          page,
          pageSize,
          sort,
          order
        });
      }
      statsThisMonth() {
        return this.rmcService.statsThisMonth();
      }
      report(groupBy, from, to) {
        const resolved = groupBy ?? "day";
        if (!rmc_service_1.RMC_REPORT_GROUP_BYS.includes(resolved)) {
          throw new common_1.BadRequestException(`groupBy must be one of: ${rmc_service_1.RMC_REPORT_GROUP_BYS.join(", ")}`);
        }
        return this.rmcService.report(resolved, { from, to });
      }
      findOne(id) {
        return this.rmcService.findOne(id);
      }
    };
    exports2.RmcController = RmcController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createRmcEntrySchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], RmcController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("vendorId")),
      __param(2, (0, common_1.Query)("date")),
      __param(3, (0, common_1.Query)("q")),
      __param(4, (0, common_1.Query)("page")),
      __param(5, (0, common_1.Query)("pageSize")),
      __param(6, (0, common_1.Query)("sort")),
      __param(7, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], RmcController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("stats/this-month"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], RmcController.prototype, "statsThisMonth", null);
    __decorate([
      (0, common_1.Get)("report"),
      __param(0, (0, common_1.Query)("groupBy")),
      __param(1, (0, common_1.Query)("from")),
      __param(2, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], RmcController.prototype, "report", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], RmcController.prototype, "findOne", null);
    exports2.RmcController = RmcController = __decorate([
      (0, common_1.Controller)("rmc-entries"),
      __metadata("design:paramtypes", [rmc_service_1.RmcService])
    ], RmcController);
  }
});

// dist/src/rmc/rmc.module.js
var require_rmc_module = __commonJS({
  "dist/src/rmc/rmc.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RmcModule = void 0;
    var common_1 = require("@nestjs/common");
    var rmc_controller_1 = require_rmc_controller();
    var rmc_service_1 = require_rmc_service();
    var RmcModule = class RmcModule {
    };
    exports2.RmcModule = RmcModule;
    exports2.RmcModule = RmcModule = __decorate([
      (0, common_1.Module)({
        controllers: [rmc_controller_1.RmcController],
        providers: [rmc_service_1.RmcService]
      })
    ], RmcModule);
  }
});

// dist/src/expenses/expenses.service.js
var require_expenses_service = __commonJS({
  "dist/src/expenses/expenses.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpensesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var pagination_1 = require_pagination();
    var sort_order_1 = require_sort_order();
    var EXPENSE_SORT_FIELDS = [
      "incurredAt",
      "amount",
      "description",
      "paymentMethod",
      "personOrVendor"
    ];
    function isExpenseSortField(value) {
      return Boolean(value) && EXPENSE_SORT_FIELDS.includes(value);
    }
    var ExpensesService = class ExpensesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        if (input.correctsId) {
          const original = await this.prisma.expense.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Expense ${input.correctsId} does not exist`);
          }
          if (original.siteId !== input.siteId || original.categoryId !== input.categoryId) {
            throw new common_1.BadRequestException("A correction's Site and Category must match the Expense it corrects");
          }
        }
        try {
          return await this.prisma.expense.create({
            data: { ...input, incurredAt: new Date(input.incurredAt) },
            include: { site: true, category: true }
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(filters = {}) {
        const where = {
          ...(0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma))
        };
        if (filters.siteId) {
          where.siteId = filters.siteId;
        }
        if (filters.categoryId) {
          where.categoryId = filters.categoryId;
        }
        if (filters.from || filters.to) {
          const incurredAt = {};
          if (filters.from) {
            incurredAt.gte = new Date(filters.from);
          }
          if (filters.to) {
            const toEnd = new Date(filters.to);
            toEnd.setDate(toEnd.getDate() + 1);
            incurredAt.lt = toEnd;
          }
          where.incurredAt = incurredAt;
        }
        if (filters.q) {
          where.AND = [
            {
              OR: [
                { description: { contains: filters.q, mode: "insensitive" } },
                { personOrVendor: { contains: filters.q, mode: "insensitive" } }
              ]
            }
          ];
        }
        const include = { site: true, category: true };
        const orderBy = isExpenseSortField(filters.sort) ? { [filters.sort]: (0, sort_order_1.isSortOrder)(filters.order) ? filters.order : "asc" } : { incurredAt: "desc" };
        const pagination = (0, pagination_1.paginationParams)(filters.page, filters.pageSize);
        if (!pagination.paginated) {
          return this.prisma.expense.findMany({ where, include, orderBy });
        }
        const [rows, total] = await Promise.all([
          this.prisma.expense.findMany({
            where,
            include,
            orderBy,
            skip: pagination.skip,
            take: pagination.take
          }),
          this.prisma.expense.count({ where })
        ]);
        return {
          rows,
          total,
          page: pagination.page,
          pageSize: pagination.pageSize
        };
      }
      async findOne(id) {
        const expense = await this.prisma.expense.findUnique({
          where: { id },
          include: { site: true, category: true }
        });
        if (!expense) {
          throw new common_1.NotFoundException(`Expense ${id} not found`);
        }
        return expense;
      }
      async summary() {
        const now = /* @__PURE__ */ new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const currentRows = (0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma));
        const whereThisMonth = {
          incurredAt: { gte: monthStart, lt: nextMonthStart },
          ...currentRows
        };
        const weekStart = startOfWeek(now);
        const nextWeekStart = new Date(weekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const [monthAgg, weekAgg, byCategory] = await Promise.all([
          this.prisma.expense.aggregate({
            where: whereThisMonth,
            _sum: { amount: true }
          }),
          this.prisma.expense.aggregate({
            where: {
              incurredAt: { gte: weekStart, lt: nextWeekStart },
              ...currentRows
            },
            _sum: { amount: true }
          }),
          this.prisma.expense.groupBy({
            by: ["categoryId"],
            where: whereThisMonth,
            _sum: { amount: true }
          })
        ]);
        let largestCategoryThisMonth = null;
        if (byCategory.length > 0) {
          const top = byCategory.reduce((max, row) => (row._sum.amount?.toNumber() ?? 0) > (max._sum.amount?.toNumber() ?? 0) ? row : max);
          const category = await this.prisma.expenseCategory.findUnique({
            where: { id: top.categoryId }
          });
          if (category) {
            largestCategoryThisMonth = {
              name: category.name,
              total: top._sum.amount?.toNumber() ?? 0
            };
          }
        }
        return {
          totalThisMonth: monthAgg._sum.amount?.toNumber() ?? 0,
          totalThisWeek: weekAgg._sum.amount?.toNumber() ?? 0,
          largestCategoryThisMonth
        };
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("This Expense references a Site or Category that does not exist");
        }
        return error;
      }
    };
    exports2.ExpensesService = ExpensesService;
    exports2.ExpensesService = ExpensesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ExpensesService);
    function startOfWeek(date) {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      return start;
    }
  }
});

// dist/src/expenses/expenses.controller.js
var require_expenses_controller = __commonJS({
  "dist/src/expenses/expenses.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpensesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var expenses_service_1 = require_expenses_service();
    var ExpensesController = class ExpensesController {
      expensesService;
      constructor(expensesService) {
        this.expensesService = expensesService;
      }
      create(body) {
        return this.expensesService.create(body);
      }
      list(siteId, categoryId, from, to, q, page, pageSize, sort, order) {
        return this.expensesService.list({
          siteId,
          categoryId,
          from,
          to,
          q,
          page,
          pageSize,
          sort,
          order
        });
      }
      summary() {
        return this.expensesService.summary();
      }
      findOne(id) {
        return this.expensesService.findOne(id);
      }
    };
    exports2.ExpensesController = ExpensesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createExpenseSchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], ExpensesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("categoryId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __param(4, (0, common_1.Query)("q")),
      __param(5, (0, common_1.Query)("page")),
      __param(6, (0, common_1.Query)("pageSize")),
      __param(7, (0, common_1.Query)("sort")),
      __param(8, (0, common_1.Query)("order")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], ExpensesController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("summary"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], ExpensesController.prototype, "summary", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], ExpensesController.prototype, "findOne", null);
    exports2.ExpensesController = ExpensesController = __decorate([
      (0, common_1.Controller)("expenses"),
      __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
    ], ExpensesController);
  }
});

// dist/src/expenses/expense-categories.service.js
var require_expense_categories_service = __commonJS({
  "dist/src/expenses/expense-categories.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpenseCategoriesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var ExpenseCategoriesService = class ExpenseCategoriesService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input) {
        try {
          return await this.prisma.expenseCategory.create({ data: input });
        } catch (error) {
          throw this.translateDuplicateNameError(error);
        }
      }
      list() {
        return this.prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
        try {
          return await this.prisma.expenseCategory.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Expense Category ${id} not found`);
          }
          throw this.translateDuplicateNameError(error);
        }
      }
      translateDuplicateNameError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return new common_1.BadRequestException("An Expense Category with this name already exists");
        }
        return error;
      }
    };
    exports2.ExpenseCategoriesService = ExpenseCategoriesService;
    exports2.ExpenseCategoriesService = ExpenseCategoriesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ExpenseCategoriesService);
  }
});

// dist/src/expenses/expense-categories.controller.js
var require_expense_categories_controller = __commonJS({
  "dist/src/expenses/expense-categories.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpenseCategoriesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var expense_categories_service_1 = require_expense_categories_service();
    var ExpenseCategoriesController = class ExpenseCategoriesController {
      expenseCategoriesService;
      constructor(expenseCategoriesService) {
        this.expenseCategoriesService = expenseCategoriesService;
      }
      create(body) {
        return this.expenseCategoriesService.create(body);
      }
      list() {
        return this.expenseCategoriesService.list();
      }
      update(id, body) {
        return this.expenseCategoriesService.update(id, body);
      }
    };
    exports2.ExpenseCategoriesController = ExpenseCategoriesController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createExpenseCategorySchema)),
      __param(0, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], ExpenseCategoriesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], ExpenseCategoriesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateExpenseCategorySchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], ExpenseCategoriesController.prototype, "update", null);
    exports2.ExpenseCategoriesController = ExpenseCategoriesController = __decorate([
      (0, common_1.Controller)("expense-categories"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [expense_categories_service_1.ExpenseCategoriesService])
    ], ExpenseCategoriesController);
  }
});

// dist/src/expenses/expenses.module.js
var require_expenses_module = __commonJS({
  "dist/src/expenses/expenses.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpensesModule = void 0;
    var common_1 = require("@nestjs/common");
    var expenses_controller_1 = require_expenses_controller();
    var expense_categories_controller_1 = require_expense_categories_controller();
    var expenses_service_1 = require_expenses_service();
    var expense_categories_service_1 = require_expense_categories_service();
    var ExpensesModule = class ExpensesModule {
    };
    exports2.ExpensesModule = ExpensesModule;
    exports2.ExpensesModule = ExpensesModule = __decorate([
      (0, common_1.Module)({
        controllers: [expenses_controller_1.ExpensesController, expense_categories_controller_1.ExpenseCategoriesController],
        providers: [expenses_service_1.ExpensesService, expense_categories_service_1.ExpenseCategoriesService]
      })
    ], ExpensesModule);
  }
});

// dist/src/waste-disposal/waste-disposal.service.js
var require_waste_disposal_service = __commonJS({
  "dist/src/waste-disposal/waste-disposal.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WasteDisposalService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var DISPOSAL_INCLUDE = {
      site: { select: { id: true, name: true } },
      vendor: { select: { id: true, name: true } },
      machinery: { select: { id: true, name: true } },
      vehicle: { select: { id: true, number: true } }
    };
    var WasteDisposalService = class WasteDisposalService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async create(input, recordedByUserId) {
        if (input.correctsId) {
          const original = await this.prisma.wasteDisposal.findUnique({
            where: { id: input.correctsId }
          });
          if (!original) {
            throw new common_1.BadRequestException(`Waste Disposal ${input.correctsId} does not exist`);
          }
          if (original.siteId !== input.siteId || original.wasteType !== input.wasteType || original.ownership !== input.ownership || (original.vendorId ?? void 0) !== input.vendorId || !original.ratePerTrip.equals(new client_1.Prisma.Decimal(input.ratePerTrip))) {
            throw new common_1.BadRequestException("A correction's Site, waste type, ownership, party and rate must match the entry it corrects");
          }
        }
        const totalAmount = new client_1.Prisma.Decimal(input.tripCount).mul(new client_1.Prisma.Decimal(input.ratePerTrip)).add(new client_1.Prisma.Decimal(input.otherCharges ?? 0));
        try {
          return await this.prisma.wasteDisposal.create({
            data: {
              ...input,
              otherCharges: input.otherCharges ?? 0,
              totalAmount,
              disposedAt: new Date(input.disposedAt),
              recordedByUserId
            },
            include: DISPOSAL_INCLUDE
          });
        } catch (error) {
          throw this.translateWriteError(error);
        }
      }
      async list(filters = {}) {
        return this.prisma.wasteDisposal.findMany({
          where: this.whereFor(filters),
          include: DISPOSAL_INCLUDE,
          orderBy: { disposedAt: "desc" }
        });
      }
      async summary(filters = {}) {
        const rows = await this.prisma.wasteDisposal.findMany({
          where: this.whereFor(filters),
          include: DISPOSAL_INCLUDE
        });
        const summary = {
          totalCost: 0,
          totalTrips: 0,
          own: { cost: 0, trips: 0 },
          hired: { cost: 0, trips: 0 },
          byVendor: [],
          byWasteType: [],
          bySite: []
        };
        const vendorBuckets = /* @__PURE__ */ new Map();
        const wasteTypeBuckets = /* @__PURE__ */ new Map();
        const siteBuckets = /* @__PURE__ */ new Map();
        for (const row of rows) {
          const cost = row.totalAmount.toNumber();
          const trips = row.tripCount;
          summary.totalCost += cost;
          summary.totalTrips += trips;
          const split = row.ownership === "OWN" ? summary.own : summary.hired;
          split.cost += cost;
          split.trips += trips;
          if (row.vendor) {
            const bucket = vendorBuckets.get(row.vendor.id) ?? {
              vendorId: row.vendor.id,
              name: row.vendor.name,
              cost: 0,
              trips: 0
            };
            bucket.cost += cost;
            bucket.trips += trips;
            vendorBuckets.set(row.vendor.id, bucket);
          }
          const typeBucket = wasteTypeBuckets.get(row.wasteType) ?? {
            wasteType: row.wasteType,
            cost: 0,
            trips: 0
          };
          typeBucket.cost += cost;
          typeBucket.trips += trips;
          wasteTypeBuckets.set(row.wasteType, typeBucket);
          const siteBucket = siteBuckets.get(row.site.id) ?? {
            siteId: row.site.id,
            name: row.site.name,
            cost: 0,
            trips: 0
          };
          siteBucket.cost += cost;
          siteBucket.trips += trips;
          siteBuckets.set(row.site.id, siteBucket);
        }
        const byCostDesc = (a, b) => b.cost - a.cost;
        summary.byVendor = [...vendorBuckets.values()].sort(byCostDesc);
        summary.byWasteType = [...wasteTypeBuckets.values()].sort(byCostDesc);
        summary.bySite = [...siteBuckets.values()].sort(byCostDesc);
        return summary;
      }
      async findOne(id) {
        const disposal = await this.prisma.wasteDisposal.findUnique({
          where: { id },
          include: DISPOSAL_INCLUDE
        });
        if (!disposal) {
          throw new common_1.NotFoundException(`Waste Disposal ${id} not found`);
        }
        return disposal;
      }
      whereFor(filters) {
        const where = {};
        if (filters.siteId) {
          where.siteId = filters.siteId;
        }
        if (filters.vendorId) {
          where.vendorId = filters.vendorId;
        }
        const bounds = (0, date_range_1.dateRangeBounds)(filters.from, filters.to);
        if (bounds) {
          where.disposedAt = bounds;
        }
        return where;
      }
      translateWriteError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          return new common_1.BadRequestException("A referenced Site, Vendor, Machinery or Vehicle does not exist");
        }
        return error;
      }
    };
    exports2.WasteDisposalService = WasteDisposalService;
    exports2.WasteDisposalService = WasteDisposalService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], WasteDisposalService);
  }
});

// dist/src/waste-disposal/waste-disposal.controller.js
var require_waste_disposal_controller = __commonJS({
  "dist/src/waste-disposal/waste-disposal.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WasteDisposalController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var waste_disposal_service_1 = require_waste_disposal_service();
    var WasteDisposalController = class WasteDisposalController {
      wasteDisposalService;
      constructor(wasteDisposalService) {
        this.wasteDisposalService = wasteDisposalService;
      }
      create(user, body) {
        return this.wasteDisposalService.create(body, user.id);
      }
      list(siteId, vendorId, from, to) {
        return this.wasteDisposalService.list({ siteId, vendorId, from, to });
      }
      summary(siteId, vendorId, from, to) {
        return this.wasteDisposalService.summary({ siteId, vendorId, from, to });
      }
      findOne(id) {
        return this.wasteDisposalService.findOne(id);
      }
    };
    exports2.WasteDisposalController = WasteDisposalController;
    __decorate([
      (0, common_1.Post)(),
      (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createWasteDisposalSchema)),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __param(1, (0, common_1.Body)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object, Object]),
      __metadata("design:returntype", void 0)
    ], WasteDisposalController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("vendorId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], WasteDisposalController.prototype, "list", null);
    __decorate([
      (0, common_1.Get)("summary"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("vendorId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], WasteDisposalController.prototype, "summary", null);
    __decorate([
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], WasteDisposalController.prototype, "findOne", null);
    exports2.WasteDisposalController = WasteDisposalController = __decorate([
      (0, common_1.Controller)("waste-disposals"),
      __metadata("design:paramtypes", [waste_disposal_service_1.WasteDisposalService])
    ], WasteDisposalController);
  }
});

// dist/src/waste-disposal/waste-disposal.module.js
var require_waste_disposal_module = __commonJS({
  "dist/src/waste-disposal/waste-disposal.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WasteDisposalModule = void 0;
    var common_1 = require("@nestjs/common");
    var waste_disposal_controller_1 = require_waste_disposal_controller();
    var waste_disposal_service_1 = require_waste_disposal_service();
    var WasteDisposalModule = class WasteDisposalModule {
    };
    exports2.WasteDisposalModule = WasteDisposalModule;
    exports2.WasteDisposalModule = WasteDisposalModule = __decorate([
      (0, common_1.Module)({
        controllers: [waste_disposal_controller_1.WasteDisposalController],
        providers: [waste_disposal_service_1.WasteDisposalService]
      })
    ], WasteDisposalModule);
  }
});

// dist/src/dashboard/local-day.js
var require_local_day = __commonJS({
  "dist/src/dashboard/local-day.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_APP_TIMEZONE = void 0;
    exports2.resolveAppTimeZone = resolveAppTimeZone;
    exports2.localDayRange = localDayRange;
    exports2.DEFAULT_APP_TIMEZONE = "Asia/Kolkata";
    function resolveAppTimeZone() {
      return process.env.APP_TIMEZONE ?? exports2.DEFAULT_APP_TIMEZONE;
    }
    function timeZoneOffsetMs(instant, timeZone) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).formatToParts(instant);
      const lookup = (type) => Number(parts.find((p) => p.type === type)?.value);
      const asUtc = Date.UTC(lookup("year"), lookup("month") - 1, lookup("day"), lookup("hour"), lookup("minute"), lookup("second"));
      return asUtc - instant.getTime();
    }
    function zonedMidnightUtc(year, monthIndex, day, timeZone) {
      const guessUtc = Date.UTC(year, monthIndex, day, 0, 0, 0, 0);
      const offset = timeZoneOffsetMs(new Date(guessUtc), timeZone);
      return new Date(guessUtc - offset);
    }
    function localDayRange(now, timeZone) {
      const dateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(now);
      const [year, month, day] = dateStr.split("-").map(Number);
      return {
        dateStr,
        dateOnly: /* @__PURE__ */ new Date(`${dateStr}T00:00:00.000Z`),
        startUtc: zonedMidnightUtc(year, month - 1, day, timeZone),
        endUtc: zonedMidnightUtc(year, month - 1, day + 1, timeZone)
      };
    }
  }
});

// dist/src/dashboard/dashboard.service.js
var require_dashboard_service = __commonJS({
  "dist/src/dashboard/dashboard.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DashboardService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var superseded_dsrs_1 = require_superseded_dsrs();
    var sites_service_1 = require_sites_service();
    var stock_service_1 = require_stock_service();
    var payments_service_1 = require_payments_service();
    var team_members_service_1 = require_team_members_service();
    var local_day_1 = require_local_day();
    var SITES_PREVIEW_LIMIT = 6;
    var DashboardService = class DashboardService {
      prisma;
      teamMembersService;
      sitesService;
      stockService;
      paymentsService;
      constructor(prisma, teamMembersService, sitesService, stockService, paymentsService) {
        this.prisma = prisma;
        this.teamMembersService = teamMembersService;
        this.sitesService = sitesService;
        this.stockService = stockService;
        this.paymentsService = paymentsService;
      }
      async getToday(now = /* @__PURE__ */ new Date(), timeZone = (0, local_day_1.resolveAppTimeZone)()) {
        const { dateOnly, startUtc, endUtc } = (0, local_day_1.localDayRange)(now, timeZone);
        const dayRange = { gte: startUtc, lt: endUtc };
        const currentRows = (0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(this.prisma));
        const [reportingSites, teamSummary, materialsReceivedToday, materialsConsumedToday, rmcAggregate, machineryInUse, expensesAggregate, activeSites] = await Promise.all([
          this.prisma.dailySiteReport.findMany({
            where: { reportDate: dateOnly },
            distinct: ["siteId"],
            select: { siteId: true }
          }),
          this.teamMembersService.getTeamSummary({ today: dateOnly }),
          this.prisma.purchase.count({ where: { purchasedAt: dayRange } }),
          this.prisma.consumption.count({
            where: { consumedAt: dayRange, ...currentRows }
          }),
          this.prisma.rmcEntry.aggregate({
            where: { deliveredAt: dayRange, ...currentRows },
            _sum: { quantityM3: true }
          }),
          this.prisma.machinery.count({ where: { currentStatus: "AT_SITE" } }),
          this.prisma.expense.aggregate({
            where: { incurredAt: dayRange, ...currentRows },
            _sum: { amount: true }
          }),
          this.prisma.site.findMany({
            where: { status: "ACTIVE", deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: "asc" }
          })
        ]);
        const reportingSiteIds = new Set(reportingSites.map((r) => r.siteId));
        return {
          sitesReportingToday: reportingSiteIds.size,
          labourWorkingToday: teamSummary.todaysWorkingHeadcount,
          materialsReceivedToday,
          materialsConsumedToday,
          rmcUsedTodayM3: rmcAggregate._sum.quantityM3?.toNumber() ?? 0,
          machineryInUse,
          expensesToday: expensesAggregate._sum.amount?.toNumber() ?? 0,
          sitesMissingDsrToday: activeSites.filter((site) => !reportingSiteIds.has(site.id)).map((site) => ({ siteId: site.id, name: site.name }))
        };
      }
      async getOverall() {
        const [activeSites, lowStockMaterials, outstanding, pendingCount] = await Promise.all([
          this.sitesService.list({ status: "ACTIVE" }),
          this.stockService.getLowStockMaterials(),
          this.teamMembersService.getOutstandingAdvances(),
          this.paymentsService.countPending()
        ]);
        return {
          activeSites: {
            count: activeSites.length,
            names: activeSites.map((site) => site.name)
          },
          inventory: { lowStockCount: lowStockMaterials.length },
          outstandingAdvances: {
            total: outstanding.total,
            teamMemberCount: outstanding.byTeamMember.length
          },
          pendingPayments: { count: pendingCount }
        };
      }
      async getSitesPreview() {
        const sites = await this.sitesService.list();
        return sites.slice(0, SITES_PREVIEW_LIMIT).map((site) => ({
          id: site.id,
          name: site.name,
          location: site.location,
          status: site.status
        }));
      }
    };
    exports2.DashboardService = DashboardService;
    exports2.DashboardService = DashboardService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        team_members_service_1.TeamMembersService,
        sites_service_1.SitesService,
        stock_service_1.StockService,
        payments_service_1.PaymentsService
      ])
    ], DashboardService);
  }
});

// dist/src/dashboard/dashboard.controller.js
var require_dashboard_controller = __commonJS({
  "dist/src/dashboard/dashboard.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DashboardController = void 0;
    var common_1 = require("@nestjs/common");
    var dashboard_service_1 = require_dashboard_service();
    var DashboardController = class DashboardController {
      dashboardService;
      constructor(dashboardService) {
        this.dashboardService = dashboardService;
      }
      getToday() {
        return this.dashboardService.getToday();
      }
      getOverall() {
        return this.dashboardService.getOverall();
      }
      getSitesPreview() {
        return this.dashboardService.getSitesPreview();
      }
    };
    exports2.DashboardController = DashboardController;
    __decorate([
      (0, common_1.Get)("today"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], DashboardController.prototype, "getToday", null);
    __decorate([
      (0, common_1.Get)("overall"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], DashboardController.prototype, "getOverall", null);
    __decorate([
      (0, common_1.Get)("sites-preview"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], DashboardController.prototype, "getSitesPreview", null);
    exports2.DashboardController = DashboardController = __decorate([
      (0, common_1.Controller)("dashboard"),
      __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
    ], DashboardController);
  }
});

// dist/src/dashboard/dashboard.module.js
var require_dashboard_module = __commonJS({
  "dist/src/dashboard/dashboard.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DashboardModule = void 0;
    var common_1 = require("@nestjs/common");
    var inventory_module_1 = require_inventory_module();
    var sites_module_1 = require_sites_module();
    var team_module_1 = require_team_module();
    var dashboard_controller_1 = require_dashboard_controller();
    var dashboard_service_1 = require_dashboard_service();
    var DashboardModule = class DashboardModule {
    };
    exports2.DashboardModule = DashboardModule;
    exports2.DashboardModule = DashboardModule = __decorate([
      (0, common_1.Module)({
        imports: [team_module_1.TeamModule, sites_module_1.SitesModule, inventory_module_1.InventoryModule],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService]
      })
    ], DashboardModule);
  }
});

// dist/src/reports/report-compiler.service.js
var require_report_compiler_service = __commonJS({
  "dist/src/reports/report-compiler.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportCompilerService = exports2.DEFAULT_BRANDING = exports2.DEFAULT_PRIMARY_COLOR = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    exports2.DEFAULT_PRIMARY_COLOR = "#0F5257";
    exports2.DEFAULT_BRANDING = {
      tenantName: "Your Company",
      logoUrl: null,
      primaryColor: exports2.DEFAULT_PRIMARY_COLOR
    };
    var dsrCompileInclude = {
      site: true,
      workRecords: true,
      consumptions: {
        include: {
          materialSize: { include: { material: { include: { unit: true } } } }
        }
      },
      rmcEntries: true,
      expenses: true,
      photos: true
    };
    function toNum(value) {
      if (value == null)
        return 0;
      if (typeof value === "number")
        return value;
      if (typeof value === "string")
        return Number(value);
      const maybeDecimal = value;
      return typeof maybeDecimal.toNumber === "function" ? maybeDecimal.toNumber() : Number(value);
    }
    var ReportCompilerService = class ReportCompilerService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async currentDsrsForDate(reportDate) {
        const rows = await this.prisma.dailySiteReport.findMany({
          where: { reportDate },
          include: dsrCompileInclude,
          orderBy: { createdAt: "desc" }
        });
        const correctedIds = new Set(rows.map((r) => r.correctsId).filter((x) => x !== null));
        return rows.filter((r) => !correctedIds.has(r.id));
      }
      async getBrandingSnapshot() {
        const config = await this.prisma.brandingConfig.findFirst();
        if (!config)
          return exports2.DEFAULT_BRANDING;
        return {
          tenantName: config.tenantName,
          logoUrl: config.logoUrl,
          primaryColor: config.primaryColor
        };
      }
      buildContent(dsr, branding) {
        const materials = dsr.consumptions.map((consumption) => ({
          material: consumption.materialSize.material.name,
          size: consumption.materialSize.label,
          quantity: toNum(consumption.quantity),
          unit: consumption.materialSize.material.unit.name
        }));
        const grades = [...new Set(dsr.rmcEntries.map((entry) => entry.grade))];
        const rmc = {
          loads: dsr.rmcEntries.length,
          totalQuantityM3: dsr.rmcEntries.reduce((sum, entry) => sum + toNum(entry.quantityM3), 0),
          grades
        };
        const equipmentUsed = Array.isArray(dsr.equipmentUsed) ? dsr.equipmentUsed.map((item) => String(item)) : [];
        return {
          siteName: dsr.site.name,
          reportDate: dsr.reportDate.toISOString().slice(0, 10),
          branding,
          work: {
            completed: dsr.workCompleted,
            inProgress: dsr.workInProgress,
            planned: dsr.plannedWork,
            issuesBlockers: dsr.issuesBlockers,
            safetyObservations: dsr.safetyObservations,
            notes: dsr.notes
          },
          labour: {
            present: dsr.workRecords.filter((record) => record.attended).length,
            total: dsr.workRecords.length
          },
          materials,
          rmc,
          equipmentUsed,
          expenses: {
            total: dsr.expenses.reduce((sum, expense) => sum + toNum(expense.amount), 0)
          },
          photos: { count: dsr.photos.length }
        };
      }
      async compile(dsr) {
        const existing = await this.prisma.dailyReport.findUnique({
          where: {
            siteId_reportDate: { siteId: dsr.siteId, reportDate: dsr.reportDate }
          }
        });
        if (existing)
          return existing;
        const branding = await this.getBrandingSnapshot();
        const content = this.buildContent(dsr, branding);
        return this.prisma.dailyReport.create({
          data: {
            siteId: dsr.siteId,
            dailySiteReportId: dsr.id,
            reportDate: dsr.reportDate,
            content
          }
        });
      }
    };
    exports2.ReportCompilerService = ReportCompilerService;
    exports2.ReportCompilerService = ReportCompilerService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ReportCompilerService);
  }
});

// dist/src/reports/report-senders.js
var require_report_senders = __commonJS({
  "dist/src/reports/report-senders.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotConfiguredWhatsAppSender = exports2.ResendEmailSender = exports2.WHATSAPP_SENDER = exports2.EMAIL_SENDER = void 0;
    exports2.escapeHtml = escapeHtml;
    exports2.renderReportEmailHtml = renderReportEmailHtml;
    exports2.EMAIL_SENDER = "EMAIL_SENDER";
    exports2.WHATSAPP_SENDER = "WHATSAPP_SENDER";
    function escapeHtml(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function renderReportEmailHtml(content) {
      const row = (label, value) => `<tr><td style="padding:6px 12px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:.05em">${label}</td><td style="padding:6px 12px;color:#1B2430;font-size:14px">${value}</td></tr>`;
      const materials = content.materials.map((m) => `${escapeHtml(m.material)} (${escapeHtml(m.size)}) \u2014 ${m.quantity} ${escapeHtml(m.unit)}`).join("; ") || "None recorded";
      const rmc = content.rmc.loads > 0 ? `${content.rmc.loads} load(s), ${content.rmc.grades.map(escapeHtml).join(", ")} \u2014 ${content.rmc.totalQuantityM3} m\xB3` : "None recorded";
      const brandColor = content.branding.primaryColor;
      const tenantName = escapeHtml(content.branding.tenantName);
      const logo = content.branding.logoUrl ? `<img src="${escapeHtml(content.branding.logoUrl)}" alt="${tenantName} logo" width="32" height="32" style="border-radius:6px;object-fit:contain;margin-right:12px;vertical-align:middle" />` : "";
      return [
        `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">`,
        `<div style="background:${brandColor};color:#F7F5EE;padding:20px 24px">`,
        logo,
        `<span style="display:inline-block;vertical-align:middle">`,
        `<span style="display:block;font-size:17px;font-weight:700">${tenantName}</span>`,
        `<span style="display:block;font-size:12px;color:#F7F5EE;opacity:.75">Daily Site Report</span>`,
        `</span>`,
        `</div>`,
        `<div style="padding:24px">`,
        `<div style="color:#6B7280;font-size:13px;margin-bottom:16px">${escapeHtml(content.siteName)} \xB7 ${escapeHtml(content.reportDate)}</div>`,
        `<table style="width:100%;border-collapse:collapse">`,
        row("Work Completed", escapeHtml(content.work.completed ?? "\u2014")),
        row("Labour Present", `${content.labour.present} of ${content.labour.total}`),
        row("Materials Consumed", materials),
        row("RMC Delivered", rmc),
        row("Expenses Logged", `\u20B9${content.expenses.total.toLocaleString("en-IN")}`),
        row("Site Photos", `${content.photos.count} attached`),
        `</table>`,
        `</div>`,
        `</div>`
      ].join("");
    }
    var ResendEmailSender = class {
      async send(recipients, content) {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.REPORT_EMAIL_FROM;
        if (!apiKey || !from) {
          throw new Error("Email delivery not configured (RESEND_API_KEY / REPORT_EMAIL_FROM missing)");
        }
        const rawResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from,
            to: recipients,
            subject: `Daily Site Report \u2014 ${content.siteName} \u2014 ${content.reportDate}`,
            html: renderReportEmailHtml(content)
          })
        });
        const response = rawResponse;
        if (!response.ok) {
          throw new Error(`Resend API responded ${response.status}`);
        }
      }
    };
    exports2.ResendEmailSender = ResendEmailSender;
    var NotConfiguredWhatsAppSender = class {
      send() {
        return Promise.reject(new Error("WhatsApp BSP not yet selected (PRD Open Question 3)"));
      }
    };
    exports2.NotConfiguredWhatsAppSender = NotConfiguredWhatsAppSender;
  }
});

// dist/src/reports/report-delivery.service.js
var require_report_delivery_service = __commonJS({
  "dist/src/reports/report-delivery.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportDeliveryService = exports2.MAX_DELIVERY_ATTEMPTS = exports2.ENABLED_CHANNELS = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var report_senders_1 = require_report_senders();
    exports2.ENABLED_CHANNELS = ["IN_APP", "EMAIL"];
    exports2.MAX_DELIVERY_ATTEMPTS = 3;
    var ReportDeliveryService = class ReportDeliveryService {
      prisma;
      emailSender;
      whatsAppSender;
      constructor(prisma, emailSender, whatsAppSender) {
        this.prisma = prisma;
        this.emailSender = emailSender;
        this.whatsAppSender = whatsAppSender;
      }
      async ensureDeliveries(dailyReportId) {
        const existing = await this.prisma.reportDelivery.findMany({
          where: { dailyReportId },
          select: { channel: true }
        });
        const existingChannels = new Set(existing.map((row) => row.channel));
        const enabled = await this.prisma.notificationChannelSetting.findMany({
          where: { enabled: true },
          select: { channel: true }
        });
        for (const { channel } of enabled) {
          if (existingChannels.has(channel))
            continue;
          let deliveryId;
          try {
            const delivery = await this.prisma.reportDelivery.create({
              data: { dailyReportId, channel }
            });
            deliveryId = delivery.id;
          } catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
              continue;
            }
            throw error;
          }
          await this.send(deliveryId);
        }
      }
      async retryPending() {
        const pending = await this.prisma.reportDelivery.findMany({
          where: { status: "PENDING", attempts: { lt: exports2.MAX_DELIVERY_ATTEMPTS } },
          select: { id: true }
        });
        for (const delivery of pending) {
          await this.send(delivery.id);
        }
        return { retried: pending.length };
      }
      async send(deliveryId) {
        const delivery = await this.prisma.reportDelivery.findUnique({
          where: { id: deliveryId },
          include: { dailyReport: true }
        });
        if (!delivery)
          return;
        if (delivery.status === "SENT" || delivery.status === "FAILED")
          return;
        try {
          await this.dispatch(delivery.channel, delivery.dailyReport.content);
          await this.prisma.reportDelivery.update({
            where: { id: deliveryId },
            data: {
              status: "SENT",
              deliveredAt: /* @__PURE__ */ new Date(),
              attempts: delivery.attempts + 1,
              lastError: null
            }
          });
        } catch (error) {
          const attempts = delivery.attempts + 1;
          const message = error instanceof Error ? error.message : String(error);
          const exhausted = attempts >= exports2.MAX_DELIVERY_ATTEMPTS;
          await this.prisma.reportDelivery.update({
            where: { id: deliveryId },
            data: {
              attempts,
              lastError: message,
              status: exhausted ? "FAILED" : "PENDING"
            }
          });
        }
      }
      async dispatch(channel, content) {
        switch (channel) {
          case "IN_APP":
            return;
          case "EMAIL": {
            const recipients = await this.recipientEmailsFor("EMAIL");
            if (recipients.length === 0) {
              throw new Error("No recipients configured for email");
            }
            await this.emailSender.send(recipients, content);
            return;
          }
          case "WHATSAPP":
            await this.whatsAppSender.send([], content);
            return;
          default:
            throw new Error(`Unknown delivery channel: ${channel}`);
        }
      }
      async recipientEmailsFor(channel) {
        const setting = await this.prisma.notificationChannelSetting.findUnique({
          where: { channel }
        });
        const ids = setting?.recipientUserIds ?? [];
        return this.emailsForUserIds(ids);
      }
      async emailsForUserIds(ids) {
        if (ids.length === 0)
          return [];
        const users = await this.prisma.user.findMany({
          where: { id: { in: ids } },
          select: { email: true }
        });
        return users.map((user) => user.email);
      }
      async deliverScheduledReport(recipientUserIds, content) {
        const recipients = await this.emailsForUserIds(recipientUserIds);
        if (recipients.length > 0) {
          await this.emailSender.send(recipients, content);
        }
        return { recipients: recipients.length };
      }
    };
    exports2.ReportDeliveryService = ReportDeliveryService;
    exports2.ReportDeliveryService = ReportDeliveryService = __decorate([
      (0, common_1.Injectable)(),
      __param(1, (0, common_1.Inject)(report_senders_1.EMAIL_SENDER)),
      __param(2, (0, common_1.Inject)(report_senders_1.WHATSAPP_SENDER)),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, Object])
    ], ReportDeliveryService);
  }
});

// dist/src/reports/reports.service.js
var require_reports_service = __commonJS({
  "dist/src/reports/reports.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportsService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    function reportDateWhere(filters) {
      const where = {};
      if (filters.siteId)
        where.siteId = filters.siteId;
      if (filters.from || filters.to) {
        const reportDate = {};
        if (filters.from)
          reportDate.gte = new Date(filters.from);
        if (filters.to)
          reportDate.lte = new Date(filters.to);
        where.reportDate = reportDate;
      }
      return where;
    }
    var ReportsService = class ReportsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async listDaily(filters = {}) {
        const reports = await this.prisma.dailyReport.findMany({
          where: reportDateWhere(filters),
          include: {
            site: { select: { id: true, name: true } },
            deliveries: {
              select: {
                channel: true,
                status: true,
                attempts: true,
                lastError: true,
                deliveredAt: true
              }
            }
          },
          orderBy: { generatedAt: "desc" }
        });
        return reports.map((report) => ({
          id: report.id,
          reportType: "Daily Site Report",
          siteId: report.siteId,
          siteName: report.site.name,
          reportDate: report.reportDate,
          generatedAt: report.generatedAt,
          deliveries: report.deliveries
        }));
      }
      async findDaily(id) {
        const report = await this.prisma.dailyReport.findUnique({
          where: { id },
          include: {
            site: { select: { id: true, name: true } },
            deliveries: {
              select: {
                channel: true,
                status: true,
                attempts: true,
                lastError: true,
                deliveredAt: true
              }
            }
          }
        });
        if (!report) {
          throw new common_1.NotFoundException(`Daily report ${id} not found`);
        }
        return report;
      }
    };
    exports2.ReportsService = ReportsService;
    exports2.ReportsService = ReportsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], ReportsService);
  }
});

// dist/src/reports/site-inventory-reports.service.js
var require_site_inventory_reports_service = __commonJS({
  "dist/src/reports/site-inventory-reports.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SiteInventoryReportsService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var storage_service_1 = require_storage_service();
    var dsr_service_1 = require_dsr_service();
    var stock_service_1 = require_stock_service();
    var purchases_service_1 = require_purchases_service();
    var movements_service_1 = require_movements_service();
    var consumption_service_1 = require_consumption_service();
    var return_wastage_service_1 = require_return_wastage_service();
    var site_activity_feed_1 = require_site_activity_feed();
    var site_photo_gallery_1 = require_site_photo_gallery();
    var SiteInventoryReportsService = class SiteInventoryReportsService {
      prisma;
      storage;
      dsr;
      stock;
      purchases;
      movements;
      consumption;
      returnWastage;
      constructor(prisma, storage, dsr, stock, purchases, movements, consumption, returnWastage) {
        this.prisma = prisma;
        this.storage = storage;
        this.dsr = dsr;
        this.stock = stock;
        this.purchases = purchases;
        this.movements = movements;
        this.consumption = consumption;
        this.returnWastage = returnWastage;
      }
      async getSiteReport(filters) {
        const { siteId, from, to } = filters;
        if (!siteId) {
          return { site: null, dsrs: [], photos: [], feed: [] };
        }
        const siteRow = await this.prisma.site.findUnique({
          where: { id: siteId },
          select: {
            id: true,
            name: true,
            location: true,
            status: true,
            deletedAt: true
          }
        });
        if (!siteRow || siteRow.deletedAt) {
          throw new common_1.NotFoundException(`Site ${siteId} not found`);
        }
        const site = {
          id: siteRow.id,
          name: siteRow.name,
          location: siteRow.location,
          status: siteRow.status
        };
        const [dsrs, photos, feed] = await Promise.all([
          this.dsr.listBySiteInRange(siteId, from, to),
          (0, site_photo_gallery_1.getSitePhotoGallery)(this.prisma, this.storage, siteId, { from, to }),
          (0, site_activity_feed_1.getSiteActivityFeed)(this.prisma, siteId, { from, to })
        ]);
        return { site, dsrs, photos, feed };
      }
      async getInventoryReport(filters) {
        const { siteId, materialId } = filters;
        const [godownStock, siteStock, lowStock, purchases, movements, consumptions, returnWastages] = await Promise.all([
          this.stock.getGodownStock(materialId),
          siteId ? this.stock.getSiteStock(siteId, materialId) : Promise.resolve([]),
          this.stock.getLowStockMaterials(),
          this.purchases.list(filters),
          this.movements.list(filters),
          this.consumption.list(filters),
          this.returnWastage.list(filters)
        ]);
        return {
          godownStock,
          siteStock,
          lowStock,
          purchases,
          movements,
          consumptions,
          returnWastages
        };
      }
    };
    exports2.SiteInventoryReportsService = SiteInventoryReportsService;
    exports2.SiteInventoryReportsService = SiteInventoryReportsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        dsr_service_1.DsrService,
        stock_service_1.StockService,
        purchases_service_1.PurchasesService,
        movements_service_1.MovementsService,
        consumption_service_1.ConsumptionService,
        return_wastage_service_1.ReturnWastageService
      ])
    ], SiteInventoryReportsService);
  }
});

// dist/src/reports/labour-reports.service.js
var require_labour_reports_service = __commonJS({
  "dist/src/reports/labour-reports.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LabourReportsService = void 0;
    var common_1 = require("@nestjs/common");
    var team_members_service_1 = require_team_members_service();
    var work_records_service_1 = require_work_records_service();
    var payments_service_1 = require_payments_service();
    var advances_service_1 = require_advances_service();
    var advance_adjustments_service_1 = require_advance_adjustments_service();
    var LabourReportsService = class LabourReportsService {
      teamMembers;
      workRecords;
      payments;
      advances;
      advanceAdjustments;
      constructor(teamMembers, workRecords, payments, advances, advanceAdjustments) {
        this.teamMembers = teamMembers;
        this.workRecords = workRecords;
        this.payments = payments;
        this.advances = advances;
        this.advanceAdjustments = advanceAdjustments;
      }
      async getLabourReport(filters) {
        const { teamMemberId, from, to } = filters;
        const scoped = { teamMemberId, from, to };
        const [summary, outstanding, workRecords, payments, advances, adjustments] = await Promise.all([
          this.teamMembers.getTeamSummary(),
          this.teamMembers.getOutstandingAdvances(),
          this.workRecords.list(void 0, scoped),
          this.payments.list(scoped),
          this.advances.list(scoped),
          this.advanceAdjustments.list(scoped)
        ]);
        return {
          summary,
          outstanding,
          workRecords,
          payments,
          advances,
          adjustments
        };
      }
    };
    exports2.LabourReportsService = LabourReportsService;
    exports2.LabourReportsService = LabourReportsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        team_members_service_1.TeamMembersService,
        work_records_service_1.WorkRecordsService,
        payments_service_1.PaymentsService,
        advances_service_1.AdvancesService,
        advance_adjustments_service_1.AdvanceAdjustmentsService
      ])
    ], LabourReportsService);
  }
});

// dist/src/reports/machinery-reports.service.js
var require_machinery_reports_service = __commonJS({
  "dist/src/reports/machinery-reports.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MachineryVehicleReportsService = void 0;
    var common_1 = require("@nestjs/common");
    var machinery_service_1 = require_machinery_service();
    var vehicle_service_1 = require_vehicle_service();
    var asset_movements_service_1 = require_asset_movements_service();
    var asset_service_logs_service_1 = require_asset_service_logs_service();
    var MachineryVehicleReportsService = class MachineryVehicleReportsService {
      machinery;
      vehicle;
      assetMovements;
      assetServiceLogs;
      constructor(machinery, vehicle, assetMovements, assetServiceLogs) {
        this.machinery = machinery;
        this.vehicle = vehicle;
        this.assetMovements = assetMovements;
        this.assetServiceLogs = assetServiceLogs;
      }
      async getMachineryReport(filters) {
        const { assetType, assetId, from, to } = filters;
        const hasAsset = Boolean(assetType && assetId);
        const [machinery, vehicles, asset, movements, serviceLogs] = await Promise.all([
          this.machinery.list(),
          this.vehicle.list(),
          hasAsset ? assetType === "MACHINERY" ? this.machinery.findOne(assetId) : this.vehicle.findOne(assetId) : Promise.resolve(null),
          hasAsset ? this.assetMovements.list(assetType, assetId, { from, to }) : Promise.resolve([]),
          hasAsset ? this.assetServiceLogs.list(assetType, assetId, { from, to }) : Promise.resolve([])
        ]);
        return { machinery, vehicles, asset, movements, serviceLogs };
      }
    };
    exports2.MachineryVehicleReportsService = MachineryVehicleReportsService;
    exports2.MachineryVehicleReportsService = MachineryVehicleReportsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        machinery_service_1.MachineryService,
        vehicle_service_1.VehicleService,
        asset_movements_service_1.AssetMovementsService,
        asset_service_logs_service_1.AssetServiceLogsService
      ])
    ], MachineryVehicleReportsService);
  }
});

// dist/src/reports/financial-reports.service.js
var require_financial_reports_service = __commonJS({
  "dist/src/reports/financial-reports.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FinancialReportsService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var superseded_dsrs_1 = require_superseded_dsrs();
    function toNum(value) {
      return value?.toNumber() ?? 0;
    }
    var FinancialReportsService = class FinancialReportsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async getFinancialReport(filters) {
        const { siteId, from, to } = filters;
        const bounds = (0, date_range_1.dateRangeBounds)(from, to);
        const [superseded, paymentCorrections] = await Promise.all([
          (0, superseded_dsrs_1.supersededDsrIds)(this.prisma),
          this.prisma.payment.findMany({
            where: { correctsId: { not: null } },
            select: { correctsId: true }
          })
        ]);
        const currentRows = (0, superseded_dsrs_1.currentDsrRowsWhere)(superseded);
        const supersededPaymentIds = paymentCorrections.map((row) => row.correctsId).filter((id) => id !== null);
        const [materialGroups, labourAgg, rmcGroups, machineryAgg, vehicleAgg, expenseGroups, wasteDisposalGroups] = await Promise.all([
          this.prisma.purchase.groupBy({
            by: ["siteId"],
            where: { purchasedAt: bounds },
            _sum: { totalAmount: true }
          }),
          this.prisma.payment.aggregate({
            where: { createdAt: bounds, id: { notIn: supersededPaymentIds } },
            _sum: { netPayable: true }
          }),
          this.prisma.rmcEntry.groupBy({
            by: ["siteId"],
            where: { deliveredAt: bounds, ...currentRows },
            _sum: { totalAmount: true }
          }),
          this.prisma.machineryServiceLog.aggregate({
            where: { serviceDate: bounds },
            _sum: { cost: true }
          }),
          this.prisma.vehicleServiceLog.aggregate({
            where: { serviceDate: bounds },
            _sum: { cost: true }
          }),
          this.prisma.expense.groupBy({
            by: ["siteId"],
            where: { incurredAt: bounds, ...currentRows },
            _sum: { amount: true }
          }),
          this.prisma.wasteDisposal.groupBy({
            by: ["siteId"],
            where: { disposedAt: bounds },
            _sum: { totalAmount: true }
          })
        ]);
        const labour = toNum(labourAgg._sum.netPayable);
        const machineryVehicle = toNum(machineryAgg._sum.cost) + toNum(vehicleAgg._sum.cost);
        let godownMaterial = 0;
        const materialBySite = /* @__PURE__ */ new Map();
        for (const group of materialGroups) {
          const amount = toNum(group._sum.totalAmount);
          if (group.siteId === null) {
            godownMaterial += amount;
          } else {
            materialBySite.set(group.siteId, amount);
          }
        }
        const rmcBySite = /* @__PURE__ */ new Map();
        for (const group of rmcGroups) {
          if (group.siteId !== null) {
            rmcBySite.set(group.siteId, toNum(group._sum.totalAmount));
          }
        }
        const expensesBySite = /* @__PURE__ */ new Map();
        for (const group of expenseGroups) {
          if (group.siteId !== null) {
            expensesBySite.set(group.siteId, toNum(group._sum.amount));
          }
        }
        const wasteDisposalBySite = /* @__PURE__ */ new Map();
        for (const group of wasteDisposalGroups) {
          if (group.siteId !== null) {
            wasteDisposalBySite.set(group.siteId, toNum(group._sum.totalAmount));
          }
        }
        const siteMaterialTotal = sumValues(materialBySite);
        const rmcTotal = sumValues(rmcBySite);
        const expensesTotal = sumValues(expensesBySite);
        const wasteDisposalTotal = sumValues(wasteDisposalBySite);
        const materialTotal = siteMaterialTotal + godownMaterial;
        const contractorTotal = {
          material: materialTotal,
          labour,
          rmc: rmcTotal,
          machineryVehicle,
          expenses: expensesTotal,
          wasteDisposal: wasteDisposalTotal,
          total: materialTotal + labour + rmcTotal + machineryVehicle + expensesTotal + wasteDisposalTotal
        };
        const siteIds = /* @__PURE__ */ new Set([
          ...materialBySite.keys(),
          ...rmcBySite.keys(),
          ...expensesBySite.keys(),
          ...wasteDisposalBySite.keys()
        ]);
        const names = await this.siteNames([...siteIds]);
        const buildRow = (id, name) => {
          const material = materialBySite.get(id) ?? 0;
          const rmc = rmcBySite.get(id) ?? 0;
          const expenses = expensesBySite.get(id) ?? 0;
          const wasteDisposal = wasteDisposalBySite.get(id) ?? 0;
          return {
            siteId: id,
            name,
            material,
            labour: null,
            rmc,
            machineryVehicle: null,
            expenses,
            wasteDisposal,
            total: material + rmc + expenses + wasteDisposal
          };
        };
        let bySite;
        if (siteId) {
          const name = names.get(siteId) ?? await this.requireSiteName(siteId);
          bySite = [buildRow(siteId, name)];
        } else {
          bySite = [...siteIds].map((id) => buildRow(id, names.get(id) ?? id)).sort((a, b) => a.name.localeCompare(b.name));
        }
        return { bySite, contractorTotal };
      }
      async siteNames(ids) {
        if (ids.length === 0) {
          return /* @__PURE__ */ new Map();
        }
        const sites = await this.prisma.site.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true }
        });
        return new Map(sites.map((site) => [site.id, site.name]));
      }
      async requireSiteName(siteId) {
        const site = await this.prisma.site.findUnique({
          where: { id: siteId },
          select: { name: true }
        });
        if (!site) {
          throw new common_1.NotFoundException(`Site ${siteId} not found`);
        }
        return site.name;
      }
    };
    exports2.FinancialReportsService = FinancialReportsService;
    exports2.FinancialReportsService = FinancialReportsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], FinancialReportsService);
    function sumValues(map) {
      let total = 0;
      for (const value of map.values()) {
        total += value;
      }
      return total;
    }
  }
});

// dist/src/reports/reports.controller.js
var require_reports_controller = __commonJS({
  "dist/src/reports/reports.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var public_decorator_1 = require_public_decorator();
    var report_compiler_service_1 = require_report_compiler_service();
    var report_delivery_service_1 = require_report_delivery_service();
    var reports_service_1 = require_reports_service();
    var site_inventory_reports_service_1 = require_site_inventory_reports_service();
    var labour_reports_service_1 = require_labour_reports_service();
    var machinery_reports_service_1 = require_machinery_reports_service();
    var financial_reports_service_1 = require_financial_reports_service();
    function toReportDate(input) {
      const base = input ? new Date(input) : /* @__PURE__ */ new Date();
      return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
    }
    var ReportsController = class ReportsController {
      compiler;
      delivery;
      reports;
      siteInventoryReports;
      labourReports;
      machineryReports;
      financialReports;
      constructor(compiler, delivery, reports, siteInventoryReports, labourReports, machineryReports, financialReports) {
        this.compiler = compiler;
        this.delivery = delivery;
        this.reports = reports;
        this.siteInventoryReports = siteInventoryReports;
        this.labourReports = labourReports;
        this.machineryReports = machineryReports;
        this.financialReports = financialReports;
      }
      assertCron(authorization) {
        const secret = process.env.CRON_SECRET;
        if (!secret || authorization !== `Bearer ${secret}`) {
          throw new common_1.UnauthorizedException();
        }
      }
      async compileDailyReports(authorization, date) {
        this.assertCron(authorization);
        const reportDate = toReportDate(date);
        const dsrs = await this.compiler.currentDsrsForDate(reportDate);
        let compiled = 0;
        const failedSiteIds = [];
        for (const dsr of dsrs) {
          try {
            const report = await this.compiler.compile(dsr);
            await this.delivery.ensureDeliveries(report.id);
            compiled += 1;
          } catch {
            failedSiteIds.push(dsr.siteId);
          }
        }
        return {
          reportDate: reportDate.toISOString().slice(0, 10),
          sitesWithDsr: dsrs.length,
          compiled,
          failedSiteIds
        };
      }
      async retryReportDeliveries(authorization) {
        this.assertCron(authorization);
        return this.delivery.retryPending();
      }
      listDaily(siteId, from, to) {
        return this.reports.listDaily({ siteId, from, to });
      }
      findDaily(id) {
        return this.reports.findDaily(id);
      }
      siteReport(siteId, from, to) {
        return this.siteInventoryReports.getSiteReport({ siteId, from, to });
      }
      inventoryReport(siteId, materialId, from, to) {
        return this.siteInventoryReports.getInventoryReport({
          siteId,
          materialId,
          from,
          to
        });
      }
      labourReport(teamMemberId, from, to) {
        return this.labourReports.getLabourReport({ teamMemberId, from, to });
      }
      machineryReport(assetType, assetId, from, to) {
        const parsed = assetType ? shared_1.assetTypeSchema.safeParse(assetType) : void 0;
        return this.machineryReports.getMachineryReport({
          assetType: parsed?.success ? parsed.data : void 0,
          assetId,
          from,
          to
        });
      }
      financialReport(siteId, from, to) {
        return this.financialReports.getFinancialReport({ siteId, from, to });
      }
    };
    exports2.ReportsController = ReportsController;
    __decorate([
      (0, public_decorator_1.Public)(),
      (0, common_1.Post)("cron/compile-daily-reports"),
      __param(0, (0, common_1.Headers)("authorization")),
      __param(1, (0, common_1.Query)("date")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String]),
      __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "compileDailyReports", null);
    __decorate([
      (0, public_decorator_1.Public)(),
      (0, common_1.Post)("cron/retry-report-deliveries"),
      __param(0, (0, common_1.Headers)("authorization")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "retryReportDeliveries", null);
    __decorate([
      (0, common_1.Get)("reports/daily"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("from")),
      __param(2, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "listDaily", null);
    __decorate([
      (0, common_1.Get)("reports/daily/:id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "findDaily", null);
    __decorate([
      (0, common_1.Get)("reports/sites"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("from")),
      __param(2, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "siteReport", null);
    __decorate([
      (0, common_1.Get)("reports/inventory"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("materialId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "inventoryReport", null);
    __decorate([
      (0, common_1.Get)("reports/labour"),
      __param(0, (0, common_1.Query)("teamMemberId")),
      __param(1, (0, common_1.Query)("from")),
      __param(2, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "labourReport", null);
    __decorate([
      (0, common_1.Get)("reports/machinery-vehicles"),
      __param(0, (0, common_1.Query)("assetType")),
      __param(1, (0, common_1.Query)("assetId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "machineryReport", null);
    __decorate([
      (0, common_1.Get)("reports/financial"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("from")),
      __param(2, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
      __metadata("design:returntype", void 0)
    ], ReportsController.prototype, "financialReport", null);
    exports2.ReportsController = ReportsController = __decorate([
      (0, common_1.Controller)(),
      __metadata("design:paramtypes", [
        report_compiler_service_1.ReportCompilerService,
        report_delivery_service_1.ReportDeliveryService,
        reports_service_1.ReportsService,
        site_inventory_reports_service_1.SiteInventoryReportsService,
        labour_reports_service_1.LabourReportsService,
        machinery_reports_service_1.MachineryVehicleReportsService,
        financial_reports_service_1.FinancialReportsService
      ])
    ], ReportsController);
  }
});

// dist/src/reports/branding-config.service.js
var require_branding_config_service = __commonJS({
  "dist/src/reports/branding-config.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BrandingConfigService = void 0;
    var common_1 = require("@nestjs/common");
    var prisma_service_1 = require_prisma_service();
    var BrandingConfigService = class BrandingConfigService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async getConfig() {
        const existing = await this.prisma.brandingConfig.findFirst();
        if (existing)
          return existing;
        return this.prisma.brandingConfig.create({
          data: { tenantName: "Your Company" }
        });
      }
      async update(input) {
        const config = await this.getConfig();
        return this.prisma.brandingConfig.update({
          where: { id: config.id },
          data: input
        });
      }
    };
    exports2.BrandingConfigService = BrandingConfigService;
    exports2.BrandingConfigService = BrandingConfigService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], BrandingConfigService);
  }
});

// dist/src/reports/branding-config.controller.js
var require_branding_config_controller = __commonJS({
  "dist/src/reports/branding-config.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BrandingConfigController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var storage_service_1 = require_storage_service();
    var branding_config_service_1 = require_branding_config_service();
    var BrandingConfigController = class BrandingConfigController {
      brandingConfig;
      storage;
      constructor(brandingConfig, storage) {
        this.brandingConfig = brandingConfig;
        this.storage = storage;
      }
      get() {
        return this.brandingConfig.getConfig();
      }
      update(body) {
        return this.brandingConfig.update(body);
      }
      presignLogo() {
        return this.storage.presignBrandingLogoUpload();
      }
    };
    exports2.BrandingConfigController = BrandingConfigController;
    __decorate([
      (0, common_1.Get)(),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], BrandingConfigController.prototype, "get", null);
    __decorate([
      (0, common_1.Patch)(),
      __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateBrandingConfigSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], BrandingConfigController.prototype, "update", null);
    __decorate([
      (0, common_1.Post)("logo/presign"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], BrandingConfigController.prototype, "presignLogo", null);
    exports2.BrandingConfigController = BrandingConfigController = __decorate([
      (0, common_1.Controller)("branding-config"),
      __metadata("design:paramtypes", [
        branding_config_service_1.BrandingConfigService,
        storage_service_1.StorageService
      ])
    ], BrandingConfigController);
  }
});

// dist/src/reports/notification-settings.service.js
var require_notification_settings_service = __commonJS({
  "dist/src/reports/notification-settings.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotificationSettingsService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var NotificationSettingsService = class NotificationSettingsService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      list() {
        return this.prisma.notificationChannelSetting.findMany({
          orderBy: { channel: "asc" }
        });
      }
      async update(channel, input) {
        try {
          return await this.prisma.notificationChannelSetting.update({
            where: { channel },
            data: {
              enabled: input.enabled,
              recipientUserIds: input.recipientUserIds
            }
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Notification channel ${channel} not found`);
          }
          throw error;
        }
      }
    };
    exports2.NotificationSettingsService = NotificationSettingsService;
    exports2.NotificationSettingsService = NotificationSettingsService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], NotificationSettingsService);
  }
});

// dist/src/reports/notification-settings.controller.js
var require_notification_settings_controller = __commonJS({
  "dist/src/reports/notification-settings.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotificationSettingsController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var notification_settings_service_1 = require_notification_settings_service();
    var NotificationSettingsController = class NotificationSettingsController {
      service;
      constructor(service) {
        this.service = service;
      }
      list() {
        return this.service.list();
      }
      update(channel, body) {
        return this.service.update(channel, body);
      }
    };
    exports2.NotificationSettingsController = NotificationSettingsController;
    __decorate([
      (0, common_1.Get)(),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], NotificationSettingsController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)(":channel"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("channel")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateNotificationChannelSettingSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], NotificationSettingsController.prototype, "update", null);
    exports2.NotificationSettingsController = NotificationSettingsController = __decorate([
      (0, common_1.Controller)("notification-settings"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [notification_settings_service_1.NotificationSettingsService])
    ], NotificationSettingsController);
  }
});

// dist/src/reports/report-schedules.service.js
var require_report_schedules_service = __commonJS({
  "dist/src/reports/report-schedules.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportSchedulesService = void 0;
    var common_1 = require("@nestjs/common");
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var site_inventory_reports_service_1 = require_site_inventory_reports_service();
    var labour_reports_service_1 = require_labour_reports_service();
    var machinery_reports_service_1 = require_machinery_reports_service();
    var financial_reports_service_1 = require_financial_reports_service();
    var report_delivery_service_1 = require_report_delivery_service();
    var report_compiler_service_1 = require_report_compiler_service();
    var DAY_MS = 24 * 60 * 60 * 1e3;
    var FREQUENCY_INTERVAL_MS = {
      DAILY: DAY_MS,
      WEEKLY: 7 * DAY_MS,
      MONTHLY: 30 * DAY_MS
    };
    function toDateString(date) {
      return date.toISOString().slice(0, 10);
    }
    var ReportSchedulesService = class ReportSchedulesService {
      prisma;
      siteInventoryReports;
      labourReports;
      machineryReports;
      financialReports;
      delivery;
      constructor(prisma, siteInventoryReports, labourReports, machineryReports, financialReports, delivery) {
        this.prisma = prisma;
        this.siteInventoryReports = siteInventoryReports;
        this.labourReports = labourReports;
        this.machineryReports = machineryReports;
        this.financialReports = financialReports;
        this.delivery = delivery;
      }
      create(input) {
        return this.prisma.reportSchedule.create({ data: input });
      }
      list() {
        return this.prisma.reportSchedule.findMany({
          orderBy: { createdAt: "desc" }
        });
      }
      async update(id, input) {
        try {
          return await this.prisma.reportSchedule.update({
            where: { id },
            data: input
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`Report Schedule ${id} not found`);
          }
          throw error;
        }
      }
      isDue(schedule, now) {
        if (!schedule.lastRunAt)
          return true;
        const elapsed = now.getTime() - new Date(schedule.lastRunAt).getTime();
        const interval = FREQUENCY_INTERVAL_MS[schedule.frequency] ?? DAY_MS;
        return elapsed >= interval;
      }
      dateRange(frequency, now) {
        if (frequency === "WEEKLY") {
          const to = new Date(now.getTime() - DAY_MS);
          const from = new Date(now.getTime() - 7 * DAY_MS);
          return { from: toDateString(from), to: toDateString(to) };
        }
        if (frequency === "MONTHLY") {
          const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
          const lastMonthEnd = new Date(firstOfThisMonth.getTime() - DAY_MS);
          const lastMonthStart = new Date(Date.UTC(lastMonthEnd.getUTCFullYear(), lastMonthEnd.getUTCMonth(), 1));
          return {
            from: toDateString(lastMonthStart),
            to: toDateString(lastMonthEnd)
          };
        }
        const yesterday = new Date(now.getTime() - DAY_MS);
        return { from: toDateString(yesterday), to: toDateString(yesterday) };
      }
      fetchReport(schedule, range) {
        const { from, to } = range;
        const siteId = schedule.siteId ?? void 0;
        switch (schedule.reportType) {
          case "SITE":
            return this.siteInventoryReports.getSiteReport({ siteId, from, to });
          case "INVENTORY":
            return this.siteInventoryReports.getInventoryReport({
              siteId,
              from,
              to
            });
          case "LABOUR":
            return this.labourReports.getLabourReport({ from, to });
          case "MACHINERY_VEHICLE":
            return this.machineryReports.getMachineryReport({ from, to });
          case "FINANCIAL":
            return this.financialReports.getFinancialReport({ siteId, from, to });
          default:
            throw new Error(`Unknown report type: ${schedule.reportType}`);
        }
      }
      buildEnvelope(schedule, range) {
        const label = `${schedule.reportType.replace(/_/g, " / ")} Report`;
        return {
          siteName: label,
          reportDate: `${range.from} \u2192 ${range.to}`,
          branding: report_compiler_service_1.DEFAULT_BRANDING,
          work: {
            completed: null,
            inProgress: null,
            planned: null,
            issuesBlockers: null,
            safetyObservations: null,
            notes: null
          },
          labour: { present: 0, total: 0 },
          materials: [],
          rmc: { loads: 0, totalQuantityM3: 0, grades: [] },
          equipmentUsed: [],
          expenses: { total: 0 },
          photos: { count: 0 }
        };
      }
      async runDueSchedules(now = /* @__PURE__ */ new Date()) {
        const schedules = await this.prisma.reportSchedule.findMany({
          where: { enabled: true }
        });
        let delivered = 0;
        const failedScheduleIds = [];
        for (const schedule of schedules) {
          if (!this.isDue(schedule, now))
            continue;
          try {
            const range = this.dateRange(schedule.frequency, now);
            await this.fetchReport(schedule, range);
            await this.delivery.deliverScheduledReport(schedule.recipientUserIds, this.buildEnvelope(schedule, range));
            await this.prisma.reportSchedule.update({
              where: { id: schedule.id },
              data: { lastRunAt: now }
            });
            delivered += 1;
          } catch {
            failedScheduleIds.push(schedule.id);
          }
        }
        return {
          evaluated: schedules.length,
          delivered,
          failedScheduleIds
        };
      }
    };
    exports2.ReportSchedulesService = ReportSchedulesService;
    exports2.ReportSchedulesService = ReportSchedulesService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        prisma_service_1.PrismaService,
        site_inventory_reports_service_1.SiteInventoryReportsService,
        labour_reports_service_1.LabourReportsService,
        machinery_reports_service_1.MachineryVehicleReportsService,
        financial_reports_service_1.FinancialReportsService,
        report_delivery_service_1.ReportDeliveryService
      ])
    ], ReportSchedulesService);
  }
});

// dist/src/reports/report-schedules.controller.js
var require_report_schedules_controller = __commonJS({
  "dist/src/reports/report-schedules.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportSchedulesController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var public_decorator_1 = require_public_decorator();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var report_schedules_service_1 = require_report_schedules_service();
    var ReportSchedulesController = class ReportSchedulesController {
      service;
      constructor(service) {
        this.service = service;
      }
      assertCron(authorization) {
        const secret = process.env.CRON_SECRET;
        if (!secret || authorization !== `Bearer ${secret}`) {
          throw new common_1.UnauthorizedException();
        }
      }
      create(body) {
        return this.service.create(body);
      }
      list() {
        return this.service.list();
      }
      update(id, body) {
        return this.service.update(id, body);
      }
      async runReportSchedules(authorization) {
        this.assertCron(authorization);
        return this.service.runDueSchedules();
      }
    };
    exports2.ReportSchedulesController = ReportSchedulesController;
    __decorate([
      (0, common_1.Post)("report-schedules"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createReportScheduleSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], ReportSchedulesController.prototype, "create", null);
    __decorate([
      (0, common_1.Get)("report-schedules"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], ReportSchedulesController.prototype, "list", null);
    __decorate([
      (0, common_1.Patch)("report-schedules/:id"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateReportScheduleSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], ReportSchedulesController.prototype, "update", null);
    __decorate([
      (0, public_decorator_1.Public)(),
      (0, common_1.Post)("cron/run-report-schedules"),
      __param(0, (0, common_1.Headers)("authorization")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", Promise)
    ], ReportSchedulesController.prototype, "runReportSchedules", null);
    exports2.ReportSchedulesController = ReportSchedulesController = __decorate([
      (0, common_1.Controller)(),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [report_schedules_service_1.ReportSchedulesService])
    ], ReportSchedulesController);
  }
});

// dist/src/reports/reports.module.js
var require_reports_module = __commonJS({
  "dist/src/reports/reports.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReportsModule = void 0;
    var common_1 = require("@nestjs/common");
    var dsr_module_1 = require_dsr_module();
    var inventory_module_1 = require_inventory_module();
    var storage_module_1 = require_storage_module();
    var team_module_1 = require_team_module();
    var assets_module_1 = require_assets_module();
    var reports_controller_1 = require_reports_controller();
    var reports_service_1 = require_reports_service();
    var site_inventory_reports_service_1 = require_site_inventory_reports_service();
    var labour_reports_service_1 = require_labour_reports_service();
    var machinery_reports_service_1 = require_machinery_reports_service();
    var financial_reports_service_1 = require_financial_reports_service();
    var report_compiler_service_1 = require_report_compiler_service();
    var report_delivery_service_1 = require_report_delivery_service();
    var branding_config_controller_1 = require_branding_config_controller();
    var branding_config_service_1 = require_branding_config_service();
    var notification_settings_controller_1 = require_notification_settings_controller();
    var notification_settings_service_1 = require_notification_settings_service();
    var report_schedules_controller_1 = require_report_schedules_controller();
    var report_schedules_service_1 = require_report_schedules_service();
    var report_senders_1 = require_report_senders();
    var ReportsModule = class ReportsModule {
    };
    exports2.ReportsModule = ReportsModule;
    exports2.ReportsModule = ReportsModule = __decorate([
      (0, common_1.Module)({
        imports: [
          dsr_module_1.DsrModule,
          inventory_module_1.InventoryModule,
          storage_module_1.StorageModule,
          team_module_1.TeamModule,
          assets_module_1.AssetsModule
        ],
        controllers: [
          reports_controller_1.ReportsController,
          branding_config_controller_1.BrandingConfigController,
          notification_settings_controller_1.NotificationSettingsController,
          report_schedules_controller_1.ReportSchedulesController
        ],
        providers: [
          reports_service_1.ReportsService,
          branding_config_service_1.BrandingConfigService,
          notification_settings_service_1.NotificationSettingsService,
          report_schedules_service_1.ReportSchedulesService,
          site_inventory_reports_service_1.SiteInventoryReportsService,
          labour_reports_service_1.LabourReportsService,
          machinery_reports_service_1.MachineryVehicleReportsService,
          financial_reports_service_1.FinancialReportsService,
          report_compiler_service_1.ReportCompilerService,
          report_delivery_service_1.ReportDeliveryService,
          { provide: report_senders_1.EMAIL_SENDER, useClass: report_senders_1.ResendEmailSender },
          { provide: report_senders_1.WHATSAPP_SENDER, useClass: report_senders_1.NotConfiguredWhatsAppSender }
        ]
      })
    ], ReportsModule);
  }
});

// dist/src/users/users.service.js
var require_users_service = __commonJS({
  "dist/src/users/users.service.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UsersService = void 0;
    var common_1 = require("@nestjs/common");
    var bcrypt = __importStar(require("bcryptjs"));
    var client_1 = require_client();
    var prisma_service_1 = require_prisma_service();
    var SAFE_USER_SELECT = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    };
    var UsersService = class UsersService {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async getMe(userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: SAFE_USER_SELECT
        });
        if (!user) {
          throw new common_1.NotFoundException("Current user not found");
        }
        return user;
      }
      async list() {
        return this.prisma.user.findMany({
          orderBy: { createdAt: "asc" },
          select: SAFE_USER_SELECT
        });
      }
      async createUser(input) {
        const passwordHash = await bcrypt.hash(input.password, 10);
        try {
          return await this.prisma.user.create({
            data: {
              name: input.name,
              email: input.email,
              role: input.role,
              passwordHash
            },
            select: SAFE_USER_SELECT
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new common_1.ConflictException("A user with that email already exists.");
          }
          throw error;
        }
      }
      async updateRole(id, input) {
        try {
          return await this.prisma.user.update({
            where: { id },
            data: { role: input.role },
            select: SAFE_USER_SELECT
          });
        } catch (error) {
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new common_1.NotFoundException(`User ${id} not found`);
          }
          throw error;
        }
      }
    };
    exports2.UsersService = UsersService;
    exports2.UsersService = UsersService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], UsersService);
  }
});

// dist/src/users/users.controller.js
var require_users_controller = __commonJS({
  "dist/src/users/users.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UsersController = void 0;
    var common_1 = require("@nestjs/common");
    var shared_1 = (init_src(), __toCommonJS(src_exports));
    var zod_validation_pipe_1 = require_zod_validation_pipe();
    var current_user_decorator_1 = require_current_user_decorator();
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var users_service_1 = require_users_service();
    var UsersController = class UsersController {
      usersService;
      constructor(usersService) {
        this.usersService = usersService;
      }
      me(user) {
        return this.usersService.getMe(user.id);
      }
      list() {
        return this.usersService.list();
      }
      create(body) {
        return this.usersService.createUser(body);
      }
      updateRole(id, body) {
        return this.usersService.updateRole(id, body);
      }
    };
    exports2.UsersController = UsersController;
    __decorate([
      (0, common_1.Get)("me"),
      __param(0, (0, current_user_decorator_1.CurrentUser)()),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], UsersController.prototype, "me", null);
    __decorate([
      (0, common_1.Get)(),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0)
    ], UsersController.prototype, "list", null);
    __decorate([
      (0, common_1.Post)(),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.createUserSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], UsersController.prototype, "create", null);
    __decorate([
      (0, common_1.Patch)(":id/role"),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateUserRoleSchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], UsersController.prototype, "updateRole", null);
    exports2.UsersController = UsersController = __decorate([
      (0, common_1.Controller)("users"),
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      __metadata("design:paramtypes", [users_service_1.UsersService])
    ], UsersController);
  }
});

// dist/src/users/users.module.js
var require_users_module = __commonJS({
  "dist/src/users/users.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UsersModule = void 0;
    var common_1 = require("@nestjs/common");
    var users_controller_1 = require_users_controller();
    var users_service_1 = require_users_service();
    var UsersModule = class UsersModule {
    };
    exports2.UsersModule = UsersModule;
    exports2.UsersModule = UsersModule = __decorate([
      (0, common_1.Module)({
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService]
      })
    ], UsersModule);
  }
});

// dist/src/audit/audit.controller.js
var require_audit_controller = __commonJS({
  "dist/src/audit/audit.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuditController = void 0;
    var common_1 = require("@nestjs/common");
    var roles_decorator_1 = require_roles_decorator();
    var roles_guard_1 = require_roles_guard();
    var prisma_service_1 = require_prisma_service();
    var date_range_1 = require_date_range();
    var AUDIT_LOG_LIMIT = 200;
    var AuditController = class AuditController {
      prisma;
      constructor(prisma) {
        this.prisma = prisma;
      }
      async list(siteId, userId, from, to) {
        const rows = await this.prisma.auditLog.findMany({
          where: {
            ...siteId ? { siteId } : {},
            ...userId ? { userId } : {},
            occurredAt: (0, date_range_1.dateRangeBounds)(from, to)
          },
          include: { user: { select: { name: true } } },
          orderBy: { occurredAt: "desc" },
          take: AUDIT_LOG_LIMIT
        });
        const siteIds = [
          ...new Set(rows.map((r) => r.siteId).filter((x) => !!x))
        ];
        const sites = siteIds.length === 0 ? [] : await this.prisma.site.findMany({
          where: { id: { in: siteIds } },
          select: { id: true, name: true }
        });
        const siteNames = new Map(sites.map((s) => [s.id, s.name]));
        return rows.map((row) => ({
          ...row,
          siteName: row.siteId ? siteNames.get(row.siteId) ?? null : null
        }));
      }
    };
    exports2.AuditController = AuditController;
    __decorate([
      (0, common_1.Get)(),
      (0, roles_decorator_1.Roles)("OWNER_ADMIN"),
      __param(0, (0, common_1.Query)("siteId")),
      __param(1, (0, common_1.Query)("userId")),
      __param(2, (0, common_1.Query)("from")),
      __param(3, (0, common_1.Query)("to")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
      __metadata("design:returntype", Promise)
    ], AuditController.prototype, "list", null);
    exports2.AuditController = AuditController = __decorate([
      (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
      (0, common_1.Controller)("audit-logs"),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AuditController);
  }
});

// dist/src/audit/audit-log.interceptor.js
var require_audit_log_interceptor = __commonJS({
  "dist/src/audit/audit-log.interceptor.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var AuditLogInterceptor_1;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuditLogInterceptor = void 0;
    var common_1 = require("@nestjs/common");
    var rxjs_1 = require("rxjs");
    var prisma_service_1 = require_prisma_service();
    var ENTITY_LABELS = {
      sites: "Site",
      materials: "Material",
      units: "Unit",
      "material-categories": "Material Category",
      purchases: "Purchase",
      movements: "Movement",
      consumption: "Consumption",
      "return-wastage": "Return/Wastage",
      dsr: "Daily Site Report",
      photos: "Photo",
      "team-members": "Team Member",
      "work-records": "Work Record",
      advances: "Advance",
      "advance-adjustments": "Advance Adjustment",
      payments: "Payment",
      "rmc-entries": "RMC Entry",
      expenses: "Expense",
      "expense-categories": "Expense Category",
      "employment-types": "Employment Type",
      "machinery-types": "Machinery Type",
      "vehicle-types": "Vehicle Type",
      machinery: "Machinery",
      vehicles: "Vehicle",
      "asset-movements": "Asset Movement",
      "asset-service-logs": "Asset Service Log",
      vendors: "Vendor",
      "waste-disposals": "Waste Disposal",
      users: "User",
      "branding-config": "Branding Config",
      "notification-settings": "Notification Setting",
      "report-schedules": "Report Schedule"
    };
    var SKIP_PREFIXES = [
      "/auth",
      "/cron",
      "/photos/presign",
      "/photos/challan",
      "/branding-config/logo/presign"
    ];
    function isSkippedPath(path) {
      return SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix) && path[prefix.length] === "/");
    }
    var AUDITED_METHODS = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
    var AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
      prisma;
      logger = new common_1.Logger(AuditLogInterceptor_1.name);
      constructor(prisma) {
        this.prisma = prisma;
      }
      intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, body } = request;
        const path = url.split("?")[0] ?? url;
        if (!AUDITED_METHODS.has(method) || !user?.id || isSkippedPath(path)) {
          return next.handle();
        }
        return next.handle().pipe((0, rxjs_1.mergeMap)(async (response) => {
          try {
            await this.record(method, path, user.id, body, response);
          } catch (error) {
            this.logger.warn(`audit write failed for ${method} ${path}`, error);
          }
          return response;
        }));
      }
      async record(method, path, userId, body, response) {
        const segment = path.split("/").filter(Boolean)[0] ?? path;
        const entityType = ENTITY_LABELS[segment] ?? segment;
        const responseId = response && typeof response === "object" && "id" in response ? String(response.id) : void 0;
        const responseSiteId = response && typeof response === "object" && "siteId" in response ? response.siteId : void 0;
        const bodySiteId = [
          body?.siteId,
          body?.destinationSiteId,
          body?.sourceSiteId
        ].find((value) => typeof value === "string");
        const siteId = bodySiteId ?? (typeof responseSiteId === "string" ? responseSiteId : entityType === "Site" ? responseId : void 0);
        await this.prisma.auditLog.create({
          data: {
            userId,
            method,
            path,
            action: this.describe(method, path, entityType, body),
            entityType,
            entityId: responseId,
            siteId
          }
        });
      }
      describe(method, path, entityType, body) {
        if (method === "DELETE")
          return `Deleted ${entityType}`;
        if (method === "PATCH") {
          if (path.endsWith("/mark-paid"))
            return "Marked Payment as paid";
          if (path.endsWith("/confirm-receipt"))
            return "Confirmed Movement receipt";
          return `Updated ${entityType}`;
        }
        if (path.endsWith("/correct") || body?.correctsId)
          return `Corrected ${entityType}`;
        return `Created ${entityType}`;
      }
    };
    exports2.AuditLogInterceptor = AuditLogInterceptor;
    exports2.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], AuditLogInterceptor);
  }
});

// dist/src/audit/audit.module.js
var require_audit_module = __commonJS({
  "dist/src/audit/audit.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AuditModule = void 0;
    var common_1 = require("@nestjs/common");
    var core_12 = require("@nestjs/core");
    var audit_controller_1 = require_audit_controller();
    var audit_log_interceptor_1 = require_audit_log_interceptor();
    var AuditModule = class AuditModule {
    };
    exports2.AuditModule = AuditModule;
    exports2.AuditModule = AuditModule = __decorate([
      (0, common_1.Module)({
        controllers: [audit_controller_1.AuditController],
        providers: [
          { provide: core_12.APP_INTERCEPTOR, useClass: audit_log_interceptor_1.AuditLogInterceptor }
        ]
      })
    ], AuditModule);
  }
});

// dist/src/search/rank-by-query.js
var require_rank_by_query = __commonJS({
  "dist/src/search/rank-by-query.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.rankByQuery = rankByQuery;
    function rankByQuery(items, query, getText) {
      const q = query.trim().toLowerCase();
      function fields(item) {
        const text = getText(item);
        return Array.isArray(text) ? text : [text];
      }
      function tier(item) {
        return fields(item).reduce((best, field) => {
          const text = field.toLowerCase();
          const fieldTier = text === q ? 0 : text.startsWith(q) ? 1 : 2;
          return Math.min(best, fieldTier);
        }, 2);
      }
      return [...items].sort((a, b) => {
        const tierDiff = tier(a) - tier(b);
        if (tierDiff !== 0)
          return tierDiff;
        return (fields(a)[0] ?? "").localeCompare(fields(b)[0] ?? "");
      });
    }
  }
});

// dist/src/search/search.service.js
var require_search_service = __commonJS({
  "dist/src/search/search.service.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SearchService = void 0;
    var common_1 = require("@nestjs/common");
    var sites_service_1 = require_sites_service();
    var materials_service_1 = require_materials_service();
    var rank_by_query_1 = require_rank_by_query();
    var INLINE_LIMIT = 5;
    var SearchService = class SearchService {
      sites;
      materials;
      constructor(sites, materials) {
        this.sites = sites;
        this.materials = materials;
      }
      async search(q) {
        const query = q?.trim() ?? "";
        if (!query) {
          return {
            sites: { results: [], total: 0 },
            materials: { results: [], total: 0 }
          };
        }
        const emptyGroup = { candidates: [], total: 0 };
        const [siteSettled, materialSettled] = await Promise.allSettled([
          this.sites.searchCandidates(query),
          this.materials.searchCandidates(query)
        ]);
        const siteResult = siteSettled.status === "fulfilled" ? siteSettled.value : emptyGroup;
        const materialResult = materialSettled.status === "fulfilled" ? materialSettled.value : emptyGroup;
        const rankedSites = (0, rank_by_query_1.rankByQuery)(siteResult.candidates, query, (site) => [
          site.name,
          site.location,
          site.contractReference ?? ""
        ]).slice(0, INLINE_LIMIT);
        const rankedMaterials = (0, rank_by_query_1.rankByQuery)(materialResult.candidates, query, (material) => material.name).slice(0, INLINE_LIMIT);
        return {
          sites: {
            results: rankedSites.map((site) => ({
              id: site.id,
              name: site.name,
              location: site.location,
              contractReference: site.contractReference
            })),
            total: siteResult.total
          },
          materials: {
            results: rankedMaterials.map((material) => ({
              id: material.id,
              name: material.name,
              category: { id: material.category.id, name: material.category.name }
            })),
            total: materialResult.total
          }
        };
      }
    };
    exports2.SearchService = SearchService;
    exports2.SearchService = SearchService = __decorate([
      (0, common_1.Injectable)(),
      __metadata("design:paramtypes", [
        sites_service_1.SitesService,
        materials_service_1.MaterialsService
      ])
    ], SearchService);
  }
});

// dist/src/search/search.controller.js
var require_search_controller = __commonJS({
  "dist/src/search/search.controller.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = exports2 && exports2.__metadata || function(k, v) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = exports2 && exports2.__param || function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SearchController = void 0;
    var common_1 = require("@nestjs/common");
    var search_service_1 = require_search_service();
    var SearchController = class SearchController {
      searchService;
      constructor(searchService) {
        this.searchService = searchService;
      }
      search(q) {
        const value = Array.isArray(q) ? q[0] : q;
        return this.searchService.search(value ?? "");
      }
    };
    exports2.SearchController = SearchController;
    __decorate([
      (0, common_1.Get)(),
      __param(0, (0, common_1.Query)("q")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [Object]),
      __metadata("design:returntype", void 0)
    ], SearchController.prototype, "search", null);
    exports2.SearchController = SearchController = __decorate([
      (0, common_1.Controller)("search"),
      __metadata("design:paramtypes", [search_service_1.SearchService])
    ], SearchController);
  }
});

// dist/src/search/search.module.js
var require_search_module = __commonJS({
  "dist/src/search/search.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SearchModule = void 0;
    var common_1 = require("@nestjs/common");
    var sites_module_1 = require_sites_module();
    var materials_module_1 = require_materials_module();
    var search_controller_1 = require_search_controller();
    var search_service_1 = require_search_service();
    var SearchModule = class SearchModule {
    };
    exports2.SearchModule = SearchModule;
    exports2.SearchModule = SearchModule = __decorate([
      (0, common_1.Module)({
        imports: [sites_module_1.SitesModule, materials_module_1.MaterialsModule],
        controllers: [search_controller_1.SearchController],
        providers: [search_service_1.SearchService]
      })
    ], SearchModule);
  }
});

// dist/src/app.module.js
var require_app_module = __commonJS({
  "dist/src/app.module.js"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppModule = void 0;
    var common_1 = require("@nestjs/common");
    var core_12 = require("@nestjs/core");
    var app_controller_1 = require_app_controller();
    var app_service_1 = require_app_service();
    var auth_module_1 = require_auth_module();
    var custom_auth_guard_1 = require_custom_auth_guard();
    var prisma_module_1 = require_prisma_module();
    var sites_module_1 = require_sites_module();
    var dsr_module_1 = require_dsr_module();
    var storage_module_1 = require_storage_module();
    var materials_module_1 = require_materials_module();
    var inventory_module_1 = require_inventory_module();
    var team_module_1 = require_team_module();
    var assets_module_1 = require_assets_module();
    var vendors_module_1 = require_vendors_module();
    var subcontractors_module_1 = require_subcontractors_module();
    var rmc_module_1 = require_rmc_module();
    var expenses_module_1 = require_expenses_module();
    var waste_disposal_module_1 = require_waste_disposal_module();
    var dashboard_module_1 = require_dashboard_module();
    var reports_module_1 = require_reports_module();
    var users_module_1 = require_users_module();
    var audit_module_1 = require_audit_module();
    var search_module_1 = require_search_module();
    var AppModule = class AppModule {
    };
    exports2.AppModule = AppModule;
    exports2.AppModule = AppModule = __decorate([
      (0, common_1.Module)({
        imports: [
          prisma_module_1.PrismaModule,
          auth_module_1.AuthModule,
          sites_module_1.SitesModule,
          dsr_module_1.DsrModule,
          storage_module_1.StorageModule,
          materials_module_1.MaterialsModule,
          inventory_module_1.InventoryModule,
          team_module_1.TeamModule,
          assets_module_1.AssetsModule,
          vendors_module_1.VendorsModule,
          subcontractors_module_1.SubcontractorsModule,
          rmc_module_1.RmcModule,
          expenses_module_1.ExpensesModule,
          waste_disposal_module_1.WasteDisposalModule,
          dashboard_module_1.DashboardModule,
          reports_module_1.ReportsModule,
          users_module_1.UsersModule,
          audit_module_1.AuditModule,
          search_module_1.SearchModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
          app_service_1.AppService,
          { provide: core_12.APP_GUARD, useClass: custom_auth_guard_1.CustomAuthGuard }
        ]
      })
    ], AppModule);
  }
});

// dist/src/main.js
Object.defineProperty(exports, "__esModule", { value: true });
require("tsx/cjs");
require("dotenv/config");
var core_1 = require("@nestjs/core");
var app_module_1 = require_app_module();
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
