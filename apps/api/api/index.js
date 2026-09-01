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
      totalAmount: import_zod28.z.number().positive(),
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
        if (!data.reason) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "A reason is required when filing a correction"
          });
        }
      } else if (data.quantityM3 <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantityM3"],
          message: "Quantity must be positive"
        });
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
      systemFlow: ["Owner", "Sites", "Work", "Materials", "Labour", "Expenses", "DSR", "Reports", "Owner Visibility"],
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
          afterSaving: "The new site appears in the list immediately and is ready to use everywhere else in the app \u2014 the DSR form, Inventory, Reports.",
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
            "Open Movements \u2192 Record Consumption (or record it inside today's DSR).",
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
            "Open RMC \u2192 Record Delivery (or add it inside today's DSR).",
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
            "Open Expenses \u2192 Record Expense (or add it inside today's DSR).",
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
          name: "Daily Site Report (DSR)",
          whatIsIt: "The DSR is the site's daily update \u2014 one entry that covers everything that happened today.",
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
          example: "Submitting today's DSR at Site A instantly shows up on the Owner's Dashboard, updates the stock for the cement used, and logs the \u20B92,000 spent on fuel.",
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
        { time: "DSR submitted", title: "One tap, everything above included", detail: "Attendance, stock, expenses, photos \u2014 all in one entry." },
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
        "Submit DSR",
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
            { title: "Open today's report", detail: "From your phone, open the Daily Site Report." },
            { title: "Select site", detail: "Today's date is already filled in." },
            { title: "Add labour", detail: "Tick who was present." },
            { title: "Add material", detail: "Add what was used today." },
            { title: "Add expenses", detail: "Add anything spent today." },
            { title: "Add photos", detail: "Tap the camera icon." },
            { title: "Submit", detail: "Tap Submit Daily Site Report." }
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
  completePurchasePricingSchema: () => completePurchasePricingSchema,
  confirmMovementReceiptSchema: () => confirmMovementReceiptSchema,
  confirmPhotoUploadSchema: () => confirmPhotoUploadSchema,
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
  createSiteSchema: () => createSiteSchema,
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
  reportScheduleFrequencySchema: () => reportScheduleFrequencySchema,
  reportScheduleTypeSchema: () => reportScheduleTypeSchema,
  returnWastageKindSchema: () => returnWastageKindSchema,
  serviceLogKindSchema: () => serviceLogKindSchema,
  siteStatusSchema: () => siteStatusSchema,
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
  updateSiteSchema: () => updateSiteSchema,
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
      "inlineSchema": '// Single schema, run identically against every tenant\'s separate database\n// (architecture spine AD-2, AD-12). No tenant_id anywhere \u2014 AD-1 forbids it;\n// a deployment\'s database belongs to exactly one Tenant.\n//\n// Tables listed under "Append-only (AD-9)" below are never UPDATEd or\n// DELETEd by application code \u2014 enforced by revoking those grants from the\n// API\'s Postgres role in the deployment migration, not by Prisma itself.\n// A correction is a new row with `correctsId` pointing at the row it fixes\n// and a required `reason`.\n\ngenerator client {\n  provider     = "prisma-client"\n  output       = "../../apps/api/src/generated/prisma"\n  moduleFormat = "cjs" // apps/api is a CommonJS NestJS build, not ESM\n}\n\n// Connection URL lives in prisma.config.ts (Prisma 7), not here.\ndatasource db {\n  provider = "postgresql"\n}\n\n// ---------- Identity ----------\n\nenum Role {\n  OWNER_ADMIN\n  SITE_SUPERVISOR\n}\n\n// This table owns both authentication (bcrypt passwordHash, verified by\n// apps/api\'s own /auth/login) and authorization (AD-10, AD-11 \u2014 Role here is\n// the only in-app role set, never "Platform Operator").\nmodel User {\n  id           String   @id @default(uuid(7))\n  name         String\n  email        String   @unique\n  passwordHash String\n  role         Role\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  dailySiteReports DailySiteReport[]\n  photos           Photo[]\n  auditLogs        AuditLog[]\n}\n\n// Audit trail (write-once, never updated or deleted): one row per\n// successful mutating API request, written automatically by the global\n// AuditLogInterceptor \u2014 a new write endpoint is audited by construction,\n// with no per-service code. Who (userId), what (action/entityType/\n// entityId), where (siteId when the write named one), when (occurredAt).\nmodel AuditLog {\n  id         String   @id @default(uuid(7))\n  occurredAt DateTime @default(now())\n  userId     String\n  user       User     @relation(fields: [userId], references: [id])\n  method     String // POST | PATCH | DELETE\n  path       String // the request path, e.g. /waste-disposals\n  action     String // human summary, e.g. "Created Waste Disposal"\n  entityType String?\n  entityId   String?\n  siteId     String?\n\n  // The read path is "latest 200, optionally filtered by site/user/date"\n  // over a table that grows forever \u2014 index the sort key and both filters.\n  @@index([occurredAt])\n  @@index([siteId])\n  @@index([userId])\n}\n\n// ---------- Sites ----------\n\nenum SiteStatus {\n  ACTIVE\n  COMPLETED\n  ON_HOLD\n}\n\nmodel Site {\n  id                String     @id @default(uuid(7))\n  name              String\n  location          String\n  status            SiteStatus @default(ACTIVE)\n  contractReference String?\n  description       String?\n  // Soft delete: a deleted Site disappears from every list/picker but its\n  // row \u2014 and every transaction row pointing at it \u2014 stays in the database\n  // (the ledger\'s history is never destroyed). Master-data-only concept;\n  // AD-9 transaction tables are corrected, never deleted.\n  deletedAt         DateTime?\n  createdAt         DateTime   @default(now())\n  updatedAt         DateTime   @updatedAt\n\n  siteStock              SiteStock[]\n  purchases              Purchase[]\n  movementsFrom          Movement[]             @relation("MovementSourceSite")\n  movementsTo            Movement[]             @relation("MovementDestinationSite")\n  consumptions           Consumption[]\n  returnWastages         ReturnWastage[]\n  machineryMovements     MachineryMovementLog[]\n  vehicleMovements       VehicleMovementLog[]\n  workRecords            WorkRecord[]\n  rmcEntries             RmcEntry[]\n  dailySiteReports       DailySiteReport[]\n  expenses               Expense[]\n  machineryCurrentlyHere Machinery[]\n  vehiclesCurrentlyHere  Vehicle[]\n  dailyReports           DailyReport[]\n  wasteDisposals         WasteDisposal[]\n}\n\n// ---------- Material catalog (FR-4..FR-7) ----------\n\nmodel MaterialCategory {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  isActive  Boolean    @default(true)\n  materials Material[]\n}\n\nmodel Unit {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  // FR-49, NFR-4: brings Unit in line with every other admin-configurable\n  // lookup type\'s rename/disable lifecycle (MachineryType, VehicleType,\n  // EmploymentType, ExpenseCategory) \u2014 disabling hides it from new-Material\n  // entry forms without touching Materials already using it.\n  isActive  Boolean    @default(true)\n  materials Material[]\n}\n\nmodel Material {\n  id                String           @id @default(uuid(7))\n  categoryId        String\n  category          MaterialCategory @relation(fields: [categoryId], references: [id])\n  unitId            String\n  unit              Unit             @relation(fields: [unitId], references: [id])\n  name              String\n  isActive          Boolean          @default(true)\n  customFields      Json             @default("{}") // FR-7 \u2014 admin custom fields, no migration needed\n  lowStockThreshold Decimal? // FR-36 \u2014 nullable: no threshold set means never flagged, never a default nobody chose\n\n  sizes MaterialSize[]\n\n  @@unique([categoryId, name])\n}\n\nmodel MaterialSize {\n  id         String   @id @default(uuid(7))\n  materialId String\n  material   Material @relation(fields: [materialId], references: [id])\n  label      String // e.g. "300mm"\n\n  godownStock    GodownStock[]\n  siteStock      SiteStock[]\n  purchases      Purchase[]\n  movements      Movement[]\n  consumptions   Consumption[]\n  returnWastages ReturnWastage[]\n\n  @@unique([materialId, label])\n}\n\n// ---------- Inventory lifecycle (FR-8..FR-14) ----------\n// GodownStock/SiteStock are materialized, write-path-only balances\n// (AD-9): the only writer is the same transaction that inserts the\n// causing Purchase/Movement/Consumption/ReturnWastage row.\n\nmodel GodownStock {\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([materialSizeId])\n}\n\nmodel SiteStock {\n  siteId         String\n  site           Site         @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([siteId, materialSizeId])\n}\n\nenum PurchaseDestination {\n  GODOWN\n  SITE\n}\n\n// Append-only (AD-9).\nmodel Purchase {\n  id                 String              @id @default(uuid(7))\n  vendorId           String\n  vendor             Vendor              @relation(fields: [vendorId], references: [id])\n  materialSizeId     String\n  materialSize       MaterialSize        @relation(fields: [materialSizeId], references: [id])\n  destination        PurchaseDestination\n  siteId             String? // required when destination = SITE (FR-8, FR-10)\n  site               Site?               @relation(fields: [siteId], references: [id])\n  quantity           Decimal\n  // Pricing is nullable (decision D7, 2026-09-01): a Site Supervisor records\n  // the physical facts at the gate (vendor/material/quantity/challan) and the\n  // Owner/Admin completes rate/totalAmount/paymentStatus later via\n  // PATCH /purchases/:id/pricing. `totalAmount IS NULL` \u21D4 "Pricing pending".\n  // That PATCH is a one-time fill of these to-be-priced fields only \u2014 never\n  // a change to an already-priced row (AD-9\'s append-only rule still governs\n  // every recorded value; priced corrections go through the Correct flow).\n  rate               Decimal?\n  totalAmount        Decimal?\n  invoiceOrChallanNo String?\n  challanPhotoUrl    String?\n  paymentStatus      String?\n  deliveryLocation   String?\n  vehicleDetails     String?\n  receiverName       String? // FR-10 direct Vendor->Site\n  notes              String?\n  purchasedAt        DateTime\n  createdAt          DateTime            @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  expenses Expense[]\n}\n\nenum MovementKind {\n  GODOWN_TO_SITE // FR-9\n  SITE_TO_SITE // FR-11\n}\n\n// Append-only (AD-9).\nmodel Movement {\n  id                String       @id @default(uuid(7))\n  kind              MovementKind\n  materialSizeId    String\n  materialSize      MaterialSize @relation(fields: [materialSizeId], references: [id])\n  sourceSiteId      String? // null when kind = GODOWN_TO_SITE (source is the Godown)\n  sourceSite        Site?        @relation("MovementSourceSite", fields: [sourceSiteId], references: [id])\n  destinationSiteId String\n  destinationSite   Site         @relation("MovementDestinationSite", fields: [destinationSiteId], references: [id])\n  sentQuantity      Decimal\n  receivedQuantity  Decimal? // shortage/damage gap = sentQuantity - receivedQuantity\n  vehicleDetails    String?\n  personResponsible String?\n  notes             String?\n  movedAt           DateTime\n  createdAt         DateTime     @default(now())\n  correctsId        String?\n  reason            String?\n\n  @@index([materialSizeId])\n}\n\n// Append-only (AD-9).\nmodel Consumption {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  materialSizeId    String\n  materialSize      MaterialSize     @relation(fields: [materialSizeId], references: [id])\n  quantity          Decimal\n  activityReference String?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  recordedByUserId  String\n  notes             String?\n  consumedAt        DateTime\n  createdAt         DateTime         @default(now())\n  correctsId        String?\n  reason            String?\n  // Story 3.2: set by the offline queue at queue-write time so a retried\n  // sync upserts the same row instead of creating a duplicate \u2014 this\n  // model has no other natural key (a Site can legitimately have two\n  // separate Consumption entries for the same Material on the same day).\n  clientGeneratedId String?          @unique\n}\n\nenum ReturnWastageKind {\n  RETURN\n  WASTAGE\n}\n\n// Append-only (AD-9).\nmodel ReturnWastage {\n  id             String            @id @default(uuid(7))\n  siteId         String\n  site           Site              @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize      @relation(fields: [materialSizeId], references: [id])\n  kind           ReturnWastageKind\n  quantity       Decimal\n  notes          String?\n  recordedAt     DateTime\n  createdAt      DateTime          @default(now())\n  correctsId     String?\n  reason         String?\n}\n\n// ---------- Machinery & Vehicles (FR-15..FR-18) ----------\n\nenum AssetLocationStatus {\n  AVAILABLE\n  AT_SITE\n  MAINTENANCE\n}\n\n// FR-15, NFR-4: admin-configurable data, not a hardcoded enum or free\n// string \u2014 same minimal create+list-now, full admin lifecycle later\n// (Epic 14) split Epic 4 Story 4.1 used for Unit (no isActive field\n// either, same precedent).\nmodel MachineryType {\n  id        String      @id @default(uuid(7))\n  name      String      @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 8.1 deferred to\n  // Epic 14. Disabling hides the type from new-asset entry forms without\n  // touching Machinery already assigned to it \u2014 master data, an in-place edit,\n  // never one of AD-9\'s append-only tables.\n  isActive  Boolean     @default(true)\n  machinery Machinery[]\n}\n\n// FR-16, NFR-4: same split as MachineryType above \u2014 a separate table, not\n// shared with it, since Machinery and Vehicle types aren\'t the same\n// domain concept.\nmodel VehicleType {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): same admin-lifecycle addition as MachineryType.\n  isActive Boolean   @default(true)\n  vehicles Vehicle[]\n}\n\nmodel Machinery {\n  id            String              @id @default(uuid(7))\n  name          String\n  typeId        String\n  type          MachineryType       @relation(fields: [typeId], references: [id])\n  assetNumber   String              @unique\n  model         String?\n  ownership     String?\n  operator      String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs   MachineryMovementLog[]\n  serviceLogs    MachineryServiceLog[]\n  wasteDisposals WasteDisposal[]\n}\n\n// Append-only (AD-9) \u2014 full movement history, not just current state.\n// Story 8.2: a correction is a new row with correctsId set, whose\n// toStatus/siteId is a full restatement of the corrected value (not a\n// delta, unlike Purchase/Movement/Consumption\'s numeric quantities) \u2014 same\n// plain correctsId/reason pattern as elsewhere in this schema, no\n// enforced self-relation.\nmodel MachineryMovementLog {\n  id          String              @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery           @relation(fields: [machineryId], references: [id])\n  toStatus    AssetLocationStatus\n  siteId      String?\n  site        Site?               @relation(fields: [siteId], references: [id])\n  movedAt     DateTime\n  createdAt   DateTime            @default(now())\n  correctsId  String?\n  reason      String? // required when correctsId is set\n}\n\nmodel MachineryServiceLog {\n  id          String    @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery @relation(fields: [machineryId], references: [id])\n  kind        String // fuel | maintenance | repair\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime  @default(now())\n}\n\nmodel Vehicle {\n  id            String              @id @default(uuid(7))\n  number        String              @unique\n  typeId        String\n  type          VehicleType         @relation(fields: [typeId], references: [id])\n  ownership     String?\n  driver        String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs   VehicleMovementLog[]\n  serviceLogs    VehicleServiceLog[]\n  wasteDisposals WasteDisposal[]\n}\n\n// Append-only (AD-9). Same correction shape as MachineryMovementLog above.\nmodel VehicleMovementLog {\n  id         String              @id @default(uuid(7))\n  vehicleId  String\n  vehicle    Vehicle             @relation(fields: [vehicleId], references: [id])\n  toStatus   AssetLocationStatus\n  siteId     String?\n  site       Site?               @relation(fields: [siteId], references: [id])\n  movedAt    DateTime\n  createdAt  DateTime            @default(now())\n  correctsId String?\n  reason     String? // required when correctsId is set\n}\n\nmodel VehicleServiceLog {\n  id          String   @id @default(uuid(7))\n  vehicleId   String\n  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])\n  kind        String\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime @default(now())\n}\n\n// ---------- Labour (FR-19..FR-25) ----------\n\n// FR-19, NFR-4: admin-configurable data, not a hardcoded enum \u2014 same\n// minimal create+list-now, full admin lifecycle later (Epic 14) split\n// Epic 4 Story 4.1 used for Unit.\nmodel EmploymentType {\n  id       String  @id @default(uuid(7))\n  name     String  @unique\n  isActive Boolean @default(true)\n\n  teamMembers TeamMember[]\n}\n\nmodel TeamMember {\n  id               String         @id @default(uuid(7))\n  name             String\n  designation      String?\n  contact          String?\n  employmentTypeId String\n  employmentType   EmploymentType @relation(fields: [employmentTypeId], references: [id])\n  isActive         Boolean        @default(true)\n\n  // AD-9\'s materialized, write-path-only balance (Story 7.1) \u2014 same class\n  // of column as GodownStock/SiteStock.quantity, never a value summed from\n  // Advance/AdvanceAdjustment rows on every read.\n  outstandingAdvanceBalance Decimal @default(0)\n\n  workRecords WorkRecord[]\n  advances    Advance[]\n  payments    Payment[]\n}\n\n// One row per Team Member per Site per date (FR-20) \u2014 enforced at the\n// application level (apps/api/src/dsr/dsr.service.ts), not by a DB unique\n// constraint. Story 3.5: a correction that changes an existing crew\n// member\'s attendance for an already-reported date needs to insert its own\n// fresh WorkRecord row (AD-9 \u2014 the original\'s rows are never touched), which\n// a hard unique constraint on (teamMemberId, workDate) would make\n// impossible (a correction and the row it corrects can legitimately share\n// the same team member + date). The "never two Sites, same date"\n// double-booking rule this constraint used to enforce as a DB backstop\n// moved to an explicit application-level check instead (same as\n// DailySiteReport\'s own siteId+reportDate constraint, relaxed for the same\n// reason).\nmodel WorkRecord {\n  id                String           @id @default(uuid(7))\n  teamMemberId      String\n  teamMember        TeamMember       @relation(fields: [teamMemberId], references: [id])\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  workDate          DateTime         @db.Date\n  attended          Boolean          @default(true)\n  hours             Decimal?\n  overtimeHours     Decimal?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  createdAt         DateTime         @default(now())\n\n  @@index([teamMemberId, workDate])\n}\n\n// Append-only (AD-9). `reason` is the business reason the Advance was\n// given (e.g. "medical emergency") \u2014 a different question from why a\n// correcting entry exists, so the correction pair below is a distinct,\n// separately-named field (Story 7.1), same disambiguation DailySiteReport\n// needed for its own pre-existing `notes` field.\nmodel Advance {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  amount           Decimal\n  reason           String?\n  paymentMethod    String?\n  givenAt          DateTime\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n\n  adjustments AdvanceAdjustment[]\n}\n\n// Append-only (AD-9). FR-23: amount must never exceed the Advance\'s\n// current outstanding balance \u2014 enforced in the service layer at the same\n// transaction boundary that writes this row, not just at the UI. `note` is\n// the free-form business note for the adjustment itself \u2014 same\n// disambiguation as Advance.reason vs. correctionReason above.\nmodel AdvanceAdjustment {\n  id               String   @id @default(uuid(7))\n  advanceId        String\n  advance          Advance  @relation(fields: [advanceId], references: [id])\n  paymentId        String?\n  payment          Payment? @relation(fields: [paymentId], references: [id])\n  amount           Decimal\n  note             String?\n  adjustedAt       DateTime\n  createdAt        DateTime @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n}\n\n// Append-only (AD-9). No pre-existing reason/note field to collide with,\n// so this uses the plain correctsId/reason pair (Purchase/Movement/\n// Consumption\'s convention), not the disambiguated correctionReason name\n// Advance/AdvanceAdjustment need above.\nmodel Payment {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  basePay          Decimal\n  additionalAmount Decimal    @default(0)\n  deductions       Decimal    @default(0)\n  netPayable       Decimal\n  // Free text, e.g. "1-15 Aug 2026" \u2014 not a structured date range; no FR\n  // requires a calendar-computed period (Story 7.3).\n  payPeriod        String?\n  status           String // pending | paid\n  paidAt           DateTime?\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  reason           String? // required when correctsId is set\n\n  advanceAdjustments AdvanceAdjustment[]\n}\n\n// ---------- RMC (FR-26..FR-27) ----------\n\nmodel RmcEntry {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  vendorId           String\n  vendor             Vendor   @relation(fields: [vendorId], references: [id])\n  quantityM3         Decimal\n  grade              String\n  ratePerM3          Decimal\n  totalAmount        Decimal\n  invoiceOrChallanNo String?\n  challanPhotoUrl    String?\n  deliveredAt        DateTime\n  createdAt          DateTime @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// ---------- Daily Site Report (FR-28..FR-31) ----------\n\nmodel DailySiteReport {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  reportDate         DateTime @db.Date\n  submittedByUserId  String\n  submittedBy        User     @relation(fields: [submittedByUserId], references: [id])\n  workCompleted      String?\n  workInProgress     String?\n  plannedWork        String?\n  issuesBlockers     String?\n  safetyObservations String?\n  notes              String?\n  createdAt          DateTime @default(now())\n\n  workRecords  WorkRecord[]\n  consumptions Consumption[]\n  photos       Photo[]\n  expenses     Expense[]\n  rmcEntries   RmcEntry[]\n  dailyReports DailyReport[]\n\n  // Informational tagging only \u2014 "JCB 3DX was in use today" is not a\n  // location/status change (that\'s Epic 8\'s MachineryMovementLog /\n  // VehicleMovementLog concern), so this is deliberately not a relation.\n  // Denormalized (stores the name at entry time) so this DSR\'s feed entry\n  // still reads correctly even if the asset is later renamed/deleted.\n  equipmentUsed Json @default("[]")\n\n  // Story 3.5 (AD-9, FR-54): a correction is a new row, never an edit \u2014\n  // same plain correctsId/reason pattern as Purchase/Movement/Consumption\n  // elsewhere in this schema, no enforced self-relation.\n  correctsId String?\n  reason     String? // required when correctsId is set\n\n  @@index([siteId, reportDate])\n}\n\nmodel Photo {\n  id                String          @id @default(uuid(7))\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  storageKey        String // Cloudflare R2 object key\n  uploadedByUserId  String\n  uploadedBy        User            @relation(fields: [uploadedByUserId], references: [id])\n  createdAt         DateTime        @default(now())\n}\n\n// ---------- Vendors & Expenses (FR-39..FR-41) ----------\n\nmodel Vendor {\n  id                String    @id @default(uuid(7))\n  name              String\n  contactPerson     String?\n  phone             String?\n  email             String?\n  address           String?\n  materialsSupplied String[]  @default([])\n  // Soft delete \u2014 same rule as Site.deletedAt.\n  deletedAt         DateTime?\n\n  purchases      Purchase[]\n  rmcEntries     RmcEntry[]\n  wasteDisposals WasteDisposal[]\n}\n\nmodel ExpenseCategory {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 11.1 deferred to\n  // Epic 14. Disabling hides the category from the Expense entry form without\n  // touching Expenses already recorded against it.\n  isActive Boolean   @default(true)\n  expenses Expense[]\n}\n\nmodel Expense {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  categoryId        String\n  category          ExpenseCategory  @relation(fields: [categoryId], references: [id])\n  amount            Decimal\n  description       String?\n  paymentMethod     String?\n  personOrVendor    String?\n  purchaseId        String? // links an Expense that IS a Purchase\'s cost entry\n  purchase          Purchase?        @relation(fields: [purchaseId], references: [id])\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  incurredAt        DateTime\n  createdAt         DateTime         @default(now())\n  // Story 11.1 (AD-9, FR-41): a correction is a new, reason-carrying row\n  // linked to the one it corrects \u2014 never an edit/delete. Plain\n  // correctsId/reason pair (no pre-existing reason/note field on Expense to\n  // collide with), same convention as Purchase/Movement/RmcEntry. A\n  // correcting row\'s `amount` is a signed delta (Epic 5\'s Story 5.1 rule),\n  // not a restated total.\n  correctsId        String?\n  reason            String? // required when correctsId is set\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// Waste & Disposal (debris/excavated-material removal from a Site). A\n// per-trip COST record: the contractor pays to move waste out \u2014 either a\n// hired third party (vendorId + paymentStatus) or an own register asset\n// (machineryId/vehicleId, no vendor). Append-only (AD-9): a correction is\n// a new row with correctsId + reason whose tripCount/otherCharges are\n// SIGNED deltas (Epic 5\'s Story 5.1 rule); ratePerTrip must match the\n// original\'s, and totalAmount is always server-computed\n// (tripCount \xD7 ratePerTrip + otherCharges \u2014 signed on corrections), never\n// client-supplied.\nmodel WasteDisposal {\n  id               String     @id @default(uuid(7))\n  siteId           String\n  site             Site       @relation(fields: [siteId], references: [id])\n  // Free text ("Debris", "Excavated earth / murum") \u2014 waste is not catalog\n  // Material and gets no stock effect; a lookup table would be premature.\n  wasteType        String\n  // Informational only ("approx 40 MT") \u2014 cost is trips \xD7 rate, never this.\n  quantityDetails  String?\n  ownership        String // OWN | HIRED (Zod-enforced vocabulary)\n  vendorId         String?\n  vendor           Vendor?    @relation(fields: [vendorId], references: [id])\n  machineryId      String?\n  machinery        Machinery? @relation(fields: [machineryId], references: [id])\n  vehicleId        String?\n  vehicle          Vehicle?   @relation(fields: [vehicleId], references: [id])\n  // Free text for hired dumpers/trucks that aren\'t in the own registers.\n  vehicleDetails   String?\n  tripCount        Int\n  ratePerTrip      Decimal\n  otherCharges     Decimal    @default(0) // loading/JCB/toll etc.\n  totalAmount      Decimal // server-computed, see model comment\n  disposalLocation String?\n  // PAID | PARTIAL | UNPAID \u2014 HIRED rows only (same vocabulary as\n  // Purchase.paymentStatus); null for OWN rows, never a fabricated PAID.\n  paymentStatus    String?\n  notes            String?\n  disposedAt       DateTime\n  recordedByUserId String\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  reason           String? // required when correctsId is set\n}\n\n// ---------- Branding & Automated Report Delivery (FR-32, FR-33) ----------\n\n// Story 13.1: single-row app-configuration record for this deployment\'s own\n// branding. This is NOT a `Tenant` table in AD-1\'s forbidden sense \u2014 no\n// tenant_id, no cross-tenant selector; it is the same category of thing as\n// infra/tenants/*.json\'s committed per-deployment config, just runtime-\n// editable (a build-time/env-var config couldn\'t satisfy FR-47\'s "no publish\n// step"). Seeded with exactly one row at deploy time (infra/prisma/seed.ts);\n// Epic 14 later adds the admin UI that edits it. `primaryColor` defaults to\n// this product\'s own accent-teal-700 token as a neutral placeholder.\n//\n// Story 14.1 (FR-47) extends 13.1\'s minimum three fields with the rest of the\n// mockup\'s Branding section: two more brand-colour swatches (Secondary/Accent,\n// defaulting to the accent-navy-800 / gold-500 token values), plus the\n// registered address, contact phone and GSTIN. These do NOT recreate the model\n// \u2014 13.1\'s row is edited in place \u2014 so every generated report carries the full\n// business identity, not just a name + one colour.\nmodel BrandingConfig {\n  id                String   @id @default(uuid(7))\n  tenantName        String\n  logoUrl           String?\n  primaryColor      String   @default("#0F5257")\n  secondaryColor    String   @default("#16273E")\n  accentColor       String   @default("#C7912B")\n  registeredAddress String?\n  contactPhone      String?\n  gstin             String?\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n}\n\n// Story 13.1 (FR-32): the compiled, auto-generated per-Site daily report.\n// `content` is the fully-rendered payload \u2014 site name, date, a branding\n// snapshot, and the work/labour/material/RMC/expense summary plus the DSR\'s\n// free-text `equipmentUsed` tags (informational tags entered on the DSR, not\n// machinery-at-site location data) drawn from the linked DSR\'s own relations \u2014\n// deliberately DENORMALIZED and stored\n// at generation time: if BrandingConfig or the underlying DSR data changes\n// afterwards, a historical report must still read exactly as it was\n// delivered, never silently re-render with today\'s branding.\n// `dailySiteReportId` is required \u2014 no DailyReport row exists for a Site/day\n// with no DSR at all (AC #4), so this is not a nullable "maybe compiled"\n// field.\nmodel DailyReport {\n  id                String          @id @default(uuid(7))\n  siteId            String\n  site              Site            @relation(fields: [siteId], references: [id])\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  reportDate        DateTime        @db.Date\n  content           Json\n  generatedAt       DateTime        @default(now())\n\n  deliveries ReportDelivery[]\n\n  @@unique([siteId, reportDate])\n}\n\n// Story 13.1 (FR-33): one row per (DailyReport, channel). `status`/\n// `attempts`/`lastError`/`deliveredAt` are narrowly mutable via retry \u2014 this\n// is lifecycle completion of an in-progress delivery event, NOT an AD-9\n// correction (the same reasoning Epic 5 Story 5.2\'s `confirmReceipt` and\n// Epic 7 Story 7.3\'s `markPaid` already established: completing an\n// in-progress event is not a transaction-history correction), so there is\n// deliberately no correctsId/reason pair here. `@@unique([dailyReportId,\n// channel])` makes delivery idempotent at the DB level: a re-run of the\n// compile Cron (or a `?date=` backfill of an already-processed day) can never\n// create a second row for the same channel, so no double-send is possible even\n// under a check-then-act race \u2014 the create\'s P2002 is caught and treated as\n// "already exists / skip send".\nmodel ReportDelivery {\n  id            String      @id @default(uuid(7))\n  dailyReportId String\n  dailyReport   DailyReport @relation(fields: [dailyReportId], references: [id])\n  channel       String\n  status        String      @default("PENDING")\n  attempts      Int         @default(0)\n  lastError     String?\n  deliveredAt   DateTime?\n  createdAt     DateTime    @default(now())\n\n  @@unique([dailyReportId, channel])\n}\n\n// Story 14.4 (FR-50): which channels receive automated reports, and to whom.\n// This replaces Story 13.1\'s hardcoded enabled-channels set + Owner/Admin\n// recipient default with real, admin-editable configuration. Same\n// configuration-record category as BrandingConfig (Story 13.1) \u2014 NOT an AD-9\n// transaction-history table (no correctsId/reason), edited in place. Seeded\n// (infra/prisma/seed.ts) with exactly the three rows Story 13.1\'s defaults\n// implied, so switching ReportDeliveryService to read from this table does not\n// change day-one delivery behaviour. `channel` is @unique \u2014 it is the natural\n// key the PATCH /notification-settings/:channel route targets. `recipientUserIds`\n// holds User.id values (resolved to emails at send time); IN_APP ignores it\n// (in-app "delivery" has no per-user targeting).\nmodel NotificationChannelSetting {\n  id               String   @id @default(uuid(7))\n  channel          String   @unique\n  enabled          Boolean  @default(false)\n  recipientUserIds String[] @default([])\n}\n\n// Story 14.5 (FR-51): scheduled, multi-cadence delivery of Epic 13\'s report set\n// (Site/Inventory/Labour/Machinery-Vehicle/Financial) \u2014 configured and run\n// entirely INDEPENDENTLY of the daily-DSR delivery (FR-50 / Story 13.1). A\n// separate model + a separate Cron job (POST /cron/run-report-schedules), never\n// a shared "reports" scheduler with a mode flag: independence is structural, not\n// conventional. Configuration record, edited in place (no correctsId/reason) \u2014\n// same category as NotificationChannelSetting / BrandingConfig, NOT an AD-9\n// transaction-history table. `reportType`: SITE | INVENTORY | LABOUR |\n// MACHINERY_VEHICLE | FINANCIAL. `frequency`: DAILY | WEEKLY | MONTHLY. `siteId`\n// optional \u2014 a schedule can be Site-scoped or cover all Sites (null), matching\n// Epic 13\'s own filter shape (plain scalar, not an FK relation \u2014 it is a query\n// param the report endpoints accept, not a structural link). `lastRunAt` drives\n// due-detection: a schedule is due when frequency-worth of time has elapsed\n// since it, or immediately if null.\nmodel ReportSchedule {\n  id               String    @id @default(uuid(7))\n  reportType       String\n  frequency        String\n  recipientUserIds String[]  @default([])\n  enabled          Boolean   @default(false)\n  siteId           String?\n  lastRunAt        DateTime?\n  createdAt        DateTime  @default(now())\n  updatedAt        DateTime  @updatedAt\n}\n',
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
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToUser"},{"name":"photos","kind":"object","type":"Photo","relationName":"PhotoToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"}],"dbName":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"occurredAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AuditLogToUser"},{"name":"method","kind":"scalar","type":"String"},{"name":"path","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"entityType","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"}],"dbName":null},"Site":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SiteStatus"},{"name":"contractReference","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"SiteToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToSite"},{"name":"movementsFrom","kind":"object","type":"Movement","relationName":"MovementSourceSite"},{"name":"movementsTo","kind":"object","type":"Movement","relationName":"MovementDestinationSite"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToSite"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"ReturnWastageToSite"},{"name":"machineryMovements","kind":"object","type":"MachineryMovementLog","relationName":"MachineryMovementLogToSite"},{"name":"vehicleMovements","kind":"object","type":"VehicleMovementLog","relationName":"SiteToVehicleMovementLog"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"SiteToWorkRecord"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToSite"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToSite"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToSite"},{"name":"machineryCurrentlyHere","kind":"object","type":"Machinery","relationName":"MachineryToSite"},{"name":"vehiclesCurrentlyHere","kind":"object","type":"Vehicle","relationName":"SiteToVehicle"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToSite"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"SiteToWasteDisposal"}],"dbName":null},"MaterialCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToMaterialCategory"}],"dbName":null},"Unit":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToUnit"}],"dbName":null},"Material":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"MaterialCategory","relationName":"MaterialToMaterialCategory"},{"name":"unitId","kind":"scalar","type":"String"},{"name":"unit","kind":"object","type":"Unit","relationName":"MaterialToUnit"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"lowStockThreshold","kind":"scalar","type":"Decimal"},{"name":"sizes","kind":"object","type":"MaterialSize","relationName":"MaterialToMaterialSize"}],"dbName":null},"MaterialSize":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"materialId","kind":"scalar","type":"String"},{"name":"material","kind":"object","type":"Material","relationName":"MaterialToMaterialSize"},{"name":"label","kind":"scalar","type":"String"},{"name":"godownStock","kind":"object","type":"GodownStock","relationName":"GodownStockToMaterialSize"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"MaterialSizeToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"MaterialSizeToPurchase"},{"name":"movements","kind":"object","type":"Movement","relationName":"MaterialSizeToMovement"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToMaterialSize"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"MaterialSizeToReturnWastage"}],"dbName":null},"GodownStock":{"fields":[{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"GodownStockToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"SiteStock":{"fields":[{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToSiteStock"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToSiteStock"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"PurchaseToVendor"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToPurchase"},{"name":"destination","kind":"enum","type":"PurchaseDestination"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"PurchaseToSite"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"rate","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"challanPhotoUrl","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"deliveryLocation","kind":"scalar","type":"String"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"receiverName","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"purchasedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToPurchase"}],"dbName":null},"Movement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"kind","kind":"enum","type":"MovementKind"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToMovement"},{"name":"sourceSiteId","kind":"scalar","type":"String"},{"name":"sourceSite","kind":"object","type":"Site","relationName":"MovementSourceSite"},{"name":"destinationSiteId","kind":"scalar","type":"String"},{"name":"destinationSite","kind":"object","type":"Site","relationName":"MovementDestinationSite"},{"name":"sentQuantity","kind":"scalar","type":"Decimal"},{"name":"receivedQuantity","kind":"scalar","type":"Decimal"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"personResponsible","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Consumption":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ConsumptionToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"ConsumptionToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"activityReference","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"ConsumptionToDailySiteReport"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"consumedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"ReturnWastage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ReturnWastageToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToReturnWastage"},{"name":"kind","kind":"enum","type":"ReturnWastageKind"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"notes","kind":"scalar","type":"String"},{"name":"recordedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryType"}],"dbName":null},"VehicleType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"vehicles","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleType"}],"dbName":null},"Machinery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"MachineryType","relationName":"MachineryToMachineryType"},{"name":"assetNumber","kind":"scalar","type":"String"},{"name":"model","kind":"scalar","type":"String"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"operator","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"MachineryToSite"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"MachineryMovementLog","relationName":"MachineryToMachineryMovementLog"},{"name":"serviceLogs","kind":"object","type":"MachineryServiceLog","relationName":"MachineryToMachineryServiceLog"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"MachineryToWasteDisposal"}],"dbName":null},"MachineryMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"MachineryMovementLogToSite"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vehicle":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"number","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"VehicleType","relationName":"VehicleToVehicleType"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"driver","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"SiteToVehicle"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"VehicleMovementLog","relationName":"VehicleToVehicleMovementLog"},{"name":"serviceLogs","kind":"object","type":"VehicleServiceLog","relationName":"VehicleToVehicleServiceLog"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"VehicleToWasteDisposal"}],"dbName":null},"VehicleMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToVehicleMovementLog"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"VehicleServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"EmploymentType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"teamMembers","kind":"object","type":"TeamMember","relationName":"EmploymentTypeToTeamMember"}],"dbName":null},"TeamMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contact","kind":"scalar","type":"String"},{"name":"employmentTypeId","kind":"scalar","type":"String"},{"name":"employmentType","kind":"object","type":"EmploymentType","relationName":"EmploymentTypeToTeamMember"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"outstandingAdvanceBalance","kind":"scalar","type":"Decimal"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"TeamMemberToWorkRecord"},{"name":"advances","kind":"object","type":"Advance","relationName":"AdvanceToTeamMember"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToTeamMember"}],"dbName":null},"WorkRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"TeamMemberToWorkRecord"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToWorkRecord"},{"name":"workDate","kind":"scalar","type":"DateTime"},{"name":"attended","kind":"scalar","type":"Boolean"},{"name":"hours","kind":"scalar","type":"Decimal"},{"name":"overtimeHours","kind":"scalar","type":"Decimal"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToWorkRecord"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Advance":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"AdvanceToTeamMember"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"reason","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"givenAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"},{"name":"adjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceToAdvanceAdjustment"}],"dbName":null},"AdvanceAdjustment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"advanceId","kind":"scalar","type":"String"},{"name":"advance","kind":"object","type":"Advance","relationName":"AdvanceToAdvanceAdjustment"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"AdvanceAdjustmentToPayment"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"note","kind":"scalar","type":"String"},{"name":"adjustedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"PaymentToTeamMember"},{"name":"basePay","kind":"scalar","type":"Decimal"},{"name":"additionalAmount","kind":"scalar","type":"Decimal"},{"name":"deductions","kind":"scalar","type":"Decimal"},{"name":"netPayable","kind":"scalar","type":"Decimal"},{"name":"payPeriod","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"advanceAdjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceAdjustmentToPayment"}],"dbName":null},"RmcEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"RmcEntryToSite"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"RmcEntryToVendor"},{"name":"quantityM3","kind":"scalar","type":"Decimal"},{"name":"grade","kind":"scalar","type":"String"},{"name":"ratePerM3","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"challanPhotoUrl","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToRmcEntry"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"DailySiteReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailySiteReportToSite"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"submittedByUserId","kind":"scalar","type":"String"},{"name":"submittedBy","kind":"object","type":"User","relationName":"DailySiteReportToUser"},{"name":"workCompleted","kind":"scalar","type":"String"},{"name":"workInProgress","kind":"scalar","type":"String"},{"name":"plannedWork","kind":"scalar","type":"String"},{"name":"issuesBlockers","kind":"scalar","type":"String"},{"name":"safetyObservations","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"DailySiteReportToWorkRecord"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToDailySiteReport"},{"name":"photos","kind":"object","type":"Photo","relationName":"DailySiteReportToPhoto"},{"name":"expenses","kind":"object","type":"Expense","relationName":"DailySiteReportToExpense"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"DailySiteReportToRmcEntry"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToDailySiteReport"},{"name":"equipmentUsed","kind":"scalar","type":"Json"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Photo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToPhoto"},{"name":"storageKey","kind":"scalar","type":"String"},{"name":"uploadedByUserId","kind":"scalar","type":"String"},{"name":"uploadedBy","kind":"object","type":"User","relationName":"PhotoToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vendor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"contactPerson","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"materialsSupplied","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToVendor"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToVendor"},{"name":"wasteDisposals","kind":"object","type":"WasteDisposal","relationName":"VendorToWasteDisposal"}],"dbName":null},"ExpenseCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToExpenseCategory"}],"dbName":null},"Expense":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ExpenseToSite"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"ExpenseCategory","relationName":"ExpenseToExpenseCategory"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"description","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"personOrVendor","kind":"scalar","type":"String"},{"name":"purchaseId","kind":"scalar","type":"String"},{"name":"purchase","kind":"object","type":"Purchase","relationName":"ExpenseToPurchase"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToExpense"},{"name":"incurredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"WasteDisposal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToWasteDisposal"},{"name":"wasteType","kind":"scalar","type":"String"},{"name":"quantityDetails","kind":"scalar","type":"String"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"VendorToWasteDisposal"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToWasteDisposal"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToWasteDisposal"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"tripCount","kind":"scalar","type":"Int"},{"name":"ratePerTrip","kind":"scalar","type":"Decimal"},{"name":"otherCharges","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"disposalLocation","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"disposedAt","kind":"scalar","type":"DateTime"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"BrandingConfig":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantName","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"primaryColor","kind":"scalar","type":"String"},{"name":"secondaryColor","kind":"scalar","type":"String"},{"name":"accentColor","kind":"scalar","type":"String"},{"name":"registeredAddress","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"gstin","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"DailyReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailyReportToSite"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailyReportToDailySiteReport"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"content","kind":"scalar","type":"Json"},{"name":"generatedAt","kind":"scalar","type":"DateTime"},{"name":"deliveries","kind":"object","type":"ReportDelivery","relationName":"DailyReportToReportDelivery"}],"dbName":null},"ReportDelivery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailyReportId","kind":"scalar","type":"String"},{"name":"dailyReport","kind":"object","type":"DailyReport","relationName":"DailyReportToReportDelivery"},{"name":"channel","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"lastError","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"NotificationChannelSetting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"channel","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"recipientUserIds","kind":"scalar","type":"String"}],"dbName":null},"ReportSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"reportType","kind":"scalar","type":"String"},{"name":"frequency","kind":"scalar","type":"String"},{"name":"recipientUserIds","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"lastRunAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
    config.parameterizationSchema = {
      strings: JSON.parse('["where","orderBy","cursor","site","materials","_count","category","unit","sizes","material","materialSize","godownStock","siteStock","purchases","vendor","dailySiteReport","rmcEntries","machinery","type","currentSite","movementLogs","serviceLogs","wasteDisposals","vehicles","vehicle","expenses","purchase","sourceSite","destinationSite","movements","consumptions","returnWastages","movementsFrom","movementsTo","machineryMovements","vehicleMovements","teamMembers","employmentType","workRecords","teamMember","advance","advanceAdjustments","payment","adjustments","advances","payments","dailySiteReports","machineryCurrentlyHere","vehiclesCurrentlyHere","dailyReport","deliveries","dailyReports","submittedBy","uploadedBy","photos","user","auditLogs","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","Site.findUnique","Site.findUniqueOrThrow","Site.findFirst","Site.findFirstOrThrow","Site.findMany","Site.createOne","Site.createMany","Site.createManyAndReturn","Site.updateOne","Site.updateMany","Site.updateManyAndReturn","Site.upsertOne","Site.deleteOne","Site.deleteMany","Site.groupBy","Site.aggregate","MaterialCategory.findUnique","MaterialCategory.findUniqueOrThrow","MaterialCategory.findFirst","MaterialCategory.findFirstOrThrow","MaterialCategory.findMany","MaterialCategory.createOne","MaterialCategory.createMany","MaterialCategory.createManyAndReturn","MaterialCategory.updateOne","MaterialCategory.updateMany","MaterialCategory.updateManyAndReturn","MaterialCategory.upsertOne","MaterialCategory.deleteOne","MaterialCategory.deleteMany","MaterialCategory.groupBy","MaterialCategory.aggregate","Unit.findUnique","Unit.findUniqueOrThrow","Unit.findFirst","Unit.findFirstOrThrow","Unit.findMany","Unit.createOne","Unit.createMany","Unit.createManyAndReturn","Unit.updateOne","Unit.updateMany","Unit.updateManyAndReturn","Unit.upsertOne","Unit.deleteOne","Unit.deleteMany","Unit.groupBy","Unit.aggregate","Material.findUnique","Material.findUniqueOrThrow","Material.findFirst","Material.findFirstOrThrow","Material.findMany","Material.createOne","Material.createMany","Material.createManyAndReturn","Material.updateOne","Material.updateMany","Material.updateManyAndReturn","Material.upsertOne","Material.deleteOne","Material.deleteMany","_avg","_sum","Material.groupBy","Material.aggregate","MaterialSize.findUnique","MaterialSize.findUniqueOrThrow","MaterialSize.findFirst","MaterialSize.findFirstOrThrow","MaterialSize.findMany","MaterialSize.createOne","MaterialSize.createMany","MaterialSize.createManyAndReturn","MaterialSize.updateOne","MaterialSize.updateMany","MaterialSize.updateManyAndReturn","MaterialSize.upsertOne","MaterialSize.deleteOne","MaterialSize.deleteMany","MaterialSize.groupBy","MaterialSize.aggregate","GodownStock.findUnique","GodownStock.findUniqueOrThrow","GodownStock.findFirst","GodownStock.findFirstOrThrow","GodownStock.findMany","GodownStock.createOne","GodownStock.createMany","GodownStock.createManyAndReturn","GodownStock.updateOne","GodownStock.updateMany","GodownStock.updateManyAndReturn","GodownStock.upsertOne","GodownStock.deleteOne","GodownStock.deleteMany","GodownStock.groupBy","GodownStock.aggregate","SiteStock.findUnique","SiteStock.findUniqueOrThrow","SiteStock.findFirst","SiteStock.findFirstOrThrow","SiteStock.findMany","SiteStock.createOne","SiteStock.createMany","SiteStock.createManyAndReturn","SiteStock.updateOne","SiteStock.updateMany","SiteStock.updateManyAndReturn","SiteStock.upsertOne","SiteStock.deleteOne","SiteStock.deleteMany","SiteStock.groupBy","SiteStock.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Movement.findUnique","Movement.findUniqueOrThrow","Movement.findFirst","Movement.findFirstOrThrow","Movement.findMany","Movement.createOne","Movement.createMany","Movement.createManyAndReturn","Movement.updateOne","Movement.updateMany","Movement.updateManyAndReturn","Movement.upsertOne","Movement.deleteOne","Movement.deleteMany","Movement.groupBy","Movement.aggregate","Consumption.findUnique","Consumption.findUniqueOrThrow","Consumption.findFirst","Consumption.findFirstOrThrow","Consumption.findMany","Consumption.createOne","Consumption.createMany","Consumption.createManyAndReturn","Consumption.updateOne","Consumption.updateMany","Consumption.updateManyAndReturn","Consumption.upsertOne","Consumption.deleteOne","Consumption.deleteMany","Consumption.groupBy","Consumption.aggregate","ReturnWastage.findUnique","ReturnWastage.findUniqueOrThrow","ReturnWastage.findFirst","ReturnWastage.findFirstOrThrow","ReturnWastage.findMany","ReturnWastage.createOne","ReturnWastage.createMany","ReturnWastage.createManyAndReturn","ReturnWastage.updateOne","ReturnWastage.updateMany","ReturnWastage.updateManyAndReturn","ReturnWastage.upsertOne","ReturnWastage.deleteOne","ReturnWastage.deleteMany","ReturnWastage.groupBy","ReturnWastage.aggregate","MachineryType.findUnique","MachineryType.findUniqueOrThrow","MachineryType.findFirst","MachineryType.findFirstOrThrow","MachineryType.findMany","MachineryType.createOne","MachineryType.createMany","MachineryType.createManyAndReturn","MachineryType.updateOne","MachineryType.updateMany","MachineryType.updateManyAndReturn","MachineryType.upsertOne","MachineryType.deleteOne","MachineryType.deleteMany","MachineryType.groupBy","MachineryType.aggregate","VehicleType.findUnique","VehicleType.findUniqueOrThrow","VehicleType.findFirst","VehicleType.findFirstOrThrow","VehicleType.findMany","VehicleType.createOne","VehicleType.createMany","VehicleType.createManyAndReturn","VehicleType.updateOne","VehicleType.updateMany","VehicleType.updateManyAndReturn","VehicleType.upsertOne","VehicleType.deleteOne","VehicleType.deleteMany","VehicleType.groupBy","VehicleType.aggregate","Machinery.findUnique","Machinery.findUniqueOrThrow","Machinery.findFirst","Machinery.findFirstOrThrow","Machinery.findMany","Machinery.createOne","Machinery.createMany","Machinery.createManyAndReturn","Machinery.updateOne","Machinery.updateMany","Machinery.updateManyAndReturn","Machinery.upsertOne","Machinery.deleteOne","Machinery.deleteMany","Machinery.groupBy","Machinery.aggregate","MachineryMovementLog.findUnique","MachineryMovementLog.findUniqueOrThrow","MachineryMovementLog.findFirst","MachineryMovementLog.findFirstOrThrow","MachineryMovementLog.findMany","MachineryMovementLog.createOne","MachineryMovementLog.createMany","MachineryMovementLog.createManyAndReturn","MachineryMovementLog.updateOne","MachineryMovementLog.updateMany","MachineryMovementLog.updateManyAndReturn","MachineryMovementLog.upsertOne","MachineryMovementLog.deleteOne","MachineryMovementLog.deleteMany","MachineryMovementLog.groupBy","MachineryMovementLog.aggregate","MachineryServiceLog.findUnique","MachineryServiceLog.findUniqueOrThrow","MachineryServiceLog.findFirst","MachineryServiceLog.findFirstOrThrow","MachineryServiceLog.findMany","MachineryServiceLog.createOne","MachineryServiceLog.createMany","MachineryServiceLog.createManyAndReturn","MachineryServiceLog.updateOne","MachineryServiceLog.updateMany","MachineryServiceLog.updateManyAndReturn","MachineryServiceLog.upsertOne","MachineryServiceLog.deleteOne","MachineryServiceLog.deleteMany","MachineryServiceLog.groupBy","MachineryServiceLog.aggregate","Vehicle.findUnique","Vehicle.findUniqueOrThrow","Vehicle.findFirst","Vehicle.findFirstOrThrow","Vehicle.findMany","Vehicle.createOne","Vehicle.createMany","Vehicle.createManyAndReturn","Vehicle.updateOne","Vehicle.updateMany","Vehicle.updateManyAndReturn","Vehicle.upsertOne","Vehicle.deleteOne","Vehicle.deleteMany","Vehicle.groupBy","Vehicle.aggregate","VehicleMovementLog.findUnique","VehicleMovementLog.findUniqueOrThrow","VehicleMovementLog.findFirst","VehicleMovementLog.findFirstOrThrow","VehicleMovementLog.findMany","VehicleMovementLog.createOne","VehicleMovementLog.createMany","VehicleMovementLog.createManyAndReturn","VehicleMovementLog.updateOne","VehicleMovementLog.updateMany","VehicleMovementLog.updateManyAndReturn","VehicleMovementLog.upsertOne","VehicleMovementLog.deleteOne","VehicleMovementLog.deleteMany","VehicleMovementLog.groupBy","VehicleMovementLog.aggregate","VehicleServiceLog.findUnique","VehicleServiceLog.findUniqueOrThrow","VehicleServiceLog.findFirst","VehicleServiceLog.findFirstOrThrow","VehicleServiceLog.findMany","VehicleServiceLog.createOne","VehicleServiceLog.createMany","VehicleServiceLog.createManyAndReturn","VehicleServiceLog.updateOne","VehicleServiceLog.updateMany","VehicleServiceLog.updateManyAndReturn","VehicleServiceLog.upsertOne","VehicleServiceLog.deleteOne","VehicleServiceLog.deleteMany","VehicleServiceLog.groupBy","VehicleServiceLog.aggregate","EmploymentType.findUnique","EmploymentType.findUniqueOrThrow","EmploymentType.findFirst","EmploymentType.findFirstOrThrow","EmploymentType.findMany","EmploymentType.createOne","EmploymentType.createMany","EmploymentType.createManyAndReturn","EmploymentType.updateOne","EmploymentType.updateMany","EmploymentType.updateManyAndReturn","EmploymentType.upsertOne","EmploymentType.deleteOne","EmploymentType.deleteMany","EmploymentType.groupBy","EmploymentType.aggregate","TeamMember.findUnique","TeamMember.findUniqueOrThrow","TeamMember.findFirst","TeamMember.findFirstOrThrow","TeamMember.findMany","TeamMember.createOne","TeamMember.createMany","TeamMember.createManyAndReturn","TeamMember.updateOne","TeamMember.updateMany","TeamMember.updateManyAndReturn","TeamMember.upsertOne","TeamMember.deleteOne","TeamMember.deleteMany","TeamMember.groupBy","TeamMember.aggregate","WorkRecord.findUnique","WorkRecord.findUniqueOrThrow","WorkRecord.findFirst","WorkRecord.findFirstOrThrow","WorkRecord.findMany","WorkRecord.createOne","WorkRecord.createMany","WorkRecord.createManyAndReturn","WorkRecord.updateOne","WorkRecord.updateMany","WorkRecord.updateManyAndReturn","WorkRecord.upsertOne","WorkRecord.deleteOne","WorkRecord.deleteMany","WorkRecord.groupBy","WorkRecord.aggregate","Advance.findUnique","Advance.findUniqueOrThrow","Advance.findFirst","Advance.findFirstOrThrow","Advance.findMany","Advance.createOne","Advance.createMany","Advance.createManyAndReturn","Advance.updateOne","Advance.updateMany","Advance.updateManyAndReturn","Advance.upsertOne","Advance.deleteOne","Advance.deleteMany","Advance.groupBy","Advance.aggregate","AdvanceAdjustment.findUnique","AdvanceAdjustment.findUniqueOrThrow","AdvanceAdjustment.findFirst","AdvanceAdjustment.findFirstOrThrow","AdvanceAdjustment.findMany","AdvanceAdjustment.createOne","AdvanceAdjustment.createMany","AdvanceAdjustment.createManyAndReturn","AdvanceAdjustment.updateOne","AdvanceAdjustment.updateMany","AdvanceAdjustment.updateManyAndReturn","AdvanceAdjustment.upsertOne","AdvanceAdjustment.deleteOne","AdvanceAdjustment.deleteMany","AdvanceAdjustment.groupBy","AdvanceAdjustment.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","RmcEntry.findUnique","RmcEntry.findUniqueOrThrow","RmcEntry.findFirst","RmcEntry.findFirstOrThrow","RmcEntry.findMany","RmcEntry.createOne","RmcEntry.createMany","RmcEntry.createManyAndReturn","RmcEntry.updateOne","RmcEntry.updateMany","RmcEntry.updateManyAndReturn","RmcEntry.upsertOne","RmcEntry.deleteOne","RmcEntry.deleteMany","RmcEntry.groupBy","RmcEntry.aggregate","DailySiteReport.findUnique","DailySiteReport.findUniqueOrThrow","DailySiteReport.findFirst","DailySiteReport.findFirstOrThrow","DailySiteReport.findMany","DailySiteReport.createOne","DailySiteReport.createMany","DailySiteReport.createManyAndReturn","DailySiteReport.updateOne","DailySiteReport.updateMany","DailySiteReport.updateManyAndReturn","DailySiteReport.upsertOne","DailySiteReport.deleteOne","DailySiteReport.deleteMany","DailySiteReport.groupBy","DailySiteReport.aggregate","Photo.findUnique","Photo.findUniqueOrThrow","Photo.findFirst","Photo.findFirstOrThrow","Photo.findMany","Photo.createOne","Photo.createMany","Photo.createManyAndReturn","Photo.updateOne","Photo.updateMany","Photo.updateManyAndReturn","Photo.upsertOne","Photo.deleteOne","Photo.deleteMany","Photo.groupBy","Photo.aggregate","Vendor.findUnique","Vendor.findUniqueOrThrow","Vendor.findFirst","Vendor.findFirstOrThrow","Vendor.findMany","Vendor.createOne","Vendor.createMany","Vendor.createManyAndReturn","Vendor.updateOne","Vendor.updateMany","Vendor.updateManyAndReturn","Vendor.upsertOne","Vendor.deleteOne","Vendor.deleteMany","Vendor.groupBy","Vendor.aggregate","ExpenseCategory.findUnique","ExpenseCategory.findUniqueOrThrow","ExpenseCategory.findFirst","ExpenseCategory.findFirstOrThrow","ExpenseCategory.findMany","ExpenseCategory.createOne","ExpenseCategory.createMany","ExpenseCategory.createManyAndReturn","ExpenseCategory.updateOne","ExpenseCategory.updateMany","ExpenseCategory.updateManyAndReturn","ExpenseCategory.upsertOne","ExpenseCategory.deleteOne","ExpenseCategory.deleteMany","ExpenseCategory.groupBy","ExpenseCategory.aggregate","Expense.findUnique","Expense.findUniqueOrThrow","Expense.findFirst","Expense.findFirstOrThrow","Expense.findMany","Expense.createOne","Expense.createMany","Expense.createManyAndReturn","Expense.updateOne","Expense.updateMany","Expense.updateManyAndReturn","Expense.upsertOne","Expense.deleteOne","Expense.deleteMany","Expense.groupBy","Expense.aggregate","WasteDisposal.findUnique","WasteDisposal.findUniqueOrThrow","WasteDisposal.findFirst","WasteDisposal.findFirstOrThrow","WasteDisposal.findMany","WasteDisposal.createOne","WasteDisposal.createMany","WasteDisposal.createManyAndReturn","WasteDisposal.updateOne","WasteDisposal.updateMany","WasteDisposal.updateManyAndReturn","WasteDisposal.upsertOne","WasteDisposal.deleteOne","WasteDisposal.deleteMany","WasteDisposal.groupBy","WasteDisposal.aggregate","BrandingConfig.findUnique","BrandingConfig.findUniqueOrThrow","BrandingConfig.findFirst","BrandingConfig.findFirstOrThrow","BrandingConfig.findMany","BrandingConfig.createOne","BrandingConfig.createMany","BrandingConfig.createManyAndReturn","BrandingConfig.updateOne","BrandingConfig.updateMany","BrandingConfig.updateManyAndReturn","BrandingConfig.upsertOne","BrandingConfig.deleteOne","BrandingConfig.deleteMany","BrandingConfig.groupBy","BrandingConfig.aggregate","DailyReport.findUnique","DailyReport.findUniqueOrThrow","DailyReport.findFirst","DailyReport.findFirstOrThrow","DailyReport.findMany","DailyReport.createOne","DailyReport.createMany","DailyReport.createManyAndReturn","DailyReport.updateOne","DailyReport.updateMany","DailyReport.updateManyAndReturn","DailyReport.upsertOne","DailyReport.deleteOne","DailyReport.deleteMany","DailyReport.groupBy","DailyReport.aggregate","ReportDelivery.findUnique","ReportDelivery.findUniqueOrThrow","ReportDelivery.findFirst","ReportDelivery.findFirstOrThrow","ReportDelivery.findMany","ReportDelivery.createOne","ReportDelivery.createMany","ReportDelivery.createManyAndReturn","ReportDelivery.updateOne","ReportDelivery.updateMany","ReportDelivery.updateManyAndReturn","ReportDelivery.upsertOne","ReportDelivery.deleteOne","ReportDelivery.deleteMany","ReportDelivery.groupBy","ReportDelivery.aggregate","NotificationChannelSetting.findUnique","NotificationChannelSetting.findUniqueOrThrow","NotificationChannelSetting.findFirst","NotificationChannelSetting.findFirstOrThrow","NotificationChannelSetting.findMany","NotificationChannelSetting.createOne","NotificationChannelSetting.createMany","NotificationChannelSetting.createManyAndReturn","NotificationChannelSetting.updateOne","NotificationChannelSetting.updateMany","NotificationChannelSetting.updateManyAndReturn","NotificationChannelSetting.upsertOne","NotificationChannelSetting.deleteOne","NotificationChannelSetting.deleteMany","NotificationChannelSetting.groupBy","NotificationChannelSetting.aggregate","ReportSchedule.findUnique","ReportSchedule.findUniqueOrThrow","ReportSchedule.findFirst","ReportSchedule.findFirstOrThrow","ReportSchedule.findMany","ReportSchedule.createOne","ReportSchedule.createMany","ReportSchedule.createManyAndReturn","ReportSchedule.updateOne","ReportSchedule.updateMany","ReportSchedule.updateManyAndReturn","ReportSchedule.upsertOne","ReportSchedule.deleteOne","ReportSchedule.deleteMany","ReportSchedule.groupBy","ReportSchedule.aggregate","AND","OR","NOT","id","reportType","frequency","recipientUserIds","enabled","siteId","lastRunAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","has","hasEvery","hasSome","channel","dailyReportId","status","attempts","lastError","deliveredAt","dailySiteReportId","reportDate","content","generatedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","tenantName","logoUrl","primaryColor","secondaryColor","accentColor","registeredAddress","contactPhone","gstin","wasteType","quantityDetails","ownership","vendorId","machineryId","vehicleId","vehicleDetails","tripCount","ratePerTrip","otherCharges","totalAmount","disposalLocation","paymentStatus","notes","disposedAt","recordedByUserId","correctsId","reason","categoryId","amount","description","paymentMethod","personOrVendor","purchaseId","incurredAt","clientGeneratedId","name","isActive","every","some","none","contactPerson","phone","email","address","materialsSupplied","deletedAt","storageKey","uploadedByUserId","submittedByUserId","workCompleted","workInProgress","plannedWork","issuesBlockers","safetyObservations","equipmentUsed","quantityM3","grade","ratePerM3","invoiceOrChallanNo","challanPhotoUrl","teamMemberId","basePay","additionalAmount","deductions","netPayable","payPeriod","paidAt","advanceId","paymentId","note","adjustedAt","correctionReason","givenAt","workDate","attended","hours","overtimeHours","designation","contact","employmentTypeId","outstandingAdvanceBalance","kind","cost","serviceDate","AssetLocationStatus","toStatus","movedAt","number","typeId","driver","currentStatus","currentSiteId","customFields","assetNumber","model","operator","materialSizeId","ReturnWastageKind","quantity","recordedAt","activityReference","consumedAt","MovementKind","sourceSiteId","destinationSiteId","sentQuantity","receivedQuantity","personResponsible","PurchaseDestination","destination","rate","deliveryLocation","receiverName","purchasedAt","materialId","label","unitId","lowStockThreshold","location","SiteStatus","contractReference","occurredAt","userId","method","path","action","entityType","entityId","passwordHash","Role","role","dailyReportId_channel","siteId_reportDate","materialId_label","categoryId_name","siteId_materialSizeId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
      graph: "2xTwAvAEDS4AANoJACA2AADjCQAgOAAA5AkAILEFAADhCQAwsgUAANIBABCzBQAA4QkAMLQFAQAAAAG7BUAAgQkAIbwFQACBCQAh_QUBAP0IACGEBgEAAAAB2gYBAP0IACHcBgAA4gncBiIBAAAAAQAgGQMAAPAJACAQAACYCQAgGQAAlAkAIB4AANUJACAmAADZCQAgMwAA2wkAIDQAAOYJACA2AADjCQAgsQUAAKwKADCyBQAAAwAQswUAAKwKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHSBUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIYoGAQD9CAAhiwYBAP8IACGMBgEA_wgAIY0GAQD_CAAhjgYBAP8IACGPBgEA_wgAIZAGAADvCQAgEAMAAIASACAQAADPCwAgGQAAiQsAIB4AAMcRACAmAADLEQAgMwAAzREAIDQAAP0RACA2AAD7EQAg8AUAAK0KACDzBQAArQoAIPQFAACtCgAgiwYAAK0KACCMBgAArQoAII0GAACtCgAgjgYAAK0KACCPBgAArQoAIBkDAADwCQAgEAAAmAkAIBkAAJQJACAeAADVCQAgJgAA2QkAIDMAANsJACA0AADmCQAgNgAA4wkAILEFAACsCgAwsgUAAAMAELMFAACsCgAwtAUBAAAAAbkFAQD9CAAhuwVAAIEJACHSBUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIYoGAQD9CAAhiwYBAP8IACGMBgEA_wgAIY0GAQD_CAAhjgYBAP8IACGPBgEA_wgAIZAGAADvCQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAADwCQAgCgAAgwoAILEFAACrCgAwsgUAAAcAELMFAACrCgAwuQUBAP0IACG8BUAAgQkAIboGAQD9CAAhvAYQAPMJACECAwAAgBIAIAoAAIkSACAKAwAA8AkAIAoAAIMKACCxBQAAqwoAMLIFAAAHABCzBQAAqwoAMLkFAQD9CAAhvAVAAIEJACG6BgEA_QgAIbwGEADzCQAh4QYAAKoKACADAAAABwAgAQAACAAwAgAACQAgDQYAAKcKACAHAACoCgAgCAAAqQoAILEFAACmCgAwsgUAAAsAELMFAACmCgAwtAUBAP0IACH1BQEA_QgAIf0FAQD9CAAh_gUgAP4IACG2BgAA7wkAIM4GAQD9CAAhzwYQAP8JACEEBgAAlRIAIAcAAJYSACAIAACXEgAgzwYAAK0KACAOBgAApwoAIAcAAKgKACAIAACpCgAgsQUAAKYKADCyBQAACwAQswUAAKYKADC0BQEAAAAB9QUBAP0IACH9BQEA_QgAIf4FIAD-CAAhtgYAAO8JACDOBgEA_QgAIc8GEAD_CQAh4AYAAKUKACADAAAACwAgAQAADAAwAgAADQAgAQAAAAsAIAMAAAALACABAAAMADACAAANACABAAAACwAgDQkAAKMKACALAACkCgAgDAAA0wkAIA0AAJcJACAdAADUCQAgHgAA1QkAIB8AANYJACCxBQAAogoAMLIFAAASABCzBQAAogoAMLQFAQD9CAAhzAYBAP0IACHNBgEA_QgAIQcJAACTEgAgCwAAlBIAIAwAAMURACANAADOCwAgHQAAxhEAIB4AAMcRACAfAADIEQAgDgkAAKMKACALAACkCgAgDAAA0wkAIA0AAJcJACAdAADUCQAgHgAA1QkAIB8AANYJACCxBQAAogoAMLIFAAASABCzBQAAogoAMLQFAQAAAAHMBgEA_QgAIc0GAQD9CAAh3wYAAKEKACADAAAAEgAgAQAAEwAwAgAAFAAgAQAAABIAIAcKAACDCgAgsQUAAKAKADCyBQAAFwAQswUAAKAKADC8BUAAgQkAIboGAQD9CAAhvAYQAPMJACEBCgAAiRIAIAcKAACDCgAgsQUAAKAKADCyBQAAFwAQswUAAKAKADC8BUAAgQkAIboGAQAAAAG8BhAA8wkAIQMAAAAXACABAAAYADACAAAZACADAAAABwAgAQAACAAwAgAACQAgGgMAAIcKACAKAACDCgAgDgAAnQoAIBkAAJQJACCxBQAAngoAMLIFAAAcABCzBQAAngoAMLQFAQD9CAAhuQUBAP8IACG7BUAAgQkAIeYFAQD9CAAh6QUBAP8IACHtBRAA_wkAIe8FAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhlAYBAP8IACGVBgEA_wgAIboGAQD9CAAhvAYQAPMJACHHBgAAnwrHBiLIBhAA_wkAIckGAQD_CAAhygYBAP8IACHLBkAAgQkAIRADAACAEgAgCgAAiRIAIA4AAJISACAZAACJCwAguQUAAK0KACDpBQAArQoAIO0FAACtCgAg7wUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACCUBgAArQoAIJUGAACtCgAgyAYAAK0KACDJBgAArQoAIMoGAACtCgAgGgMAAIcKACAKAACDCgAgDgAAnQoAIBkAAJQJACCxBQAAngoAMLIFAAAcABCzBQAAngoAMLQFAQAAAAG5BQEA_wgAIbsFQACBCQAh5gUBAP0IACHpBQEA_wgAIe0FEAD_CQAh7wUBAP8IACHwBQEA_wgAIfMFAQD_CAAh9AUBAP8IACGUBgEA_wgAIZUGAQD_CAAhugYBAP0IACG8BhAA8wkAIccGAACfCscGIsgGEAD_CQAhyQYBAP8IACHKBgEA_wgAIcsGQACBCQAhAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAcACABAAAdADACAAAeACAVAwAA8AkAIA4AAJ0KACAPAACACgAgsQUAAJwKADCyBQAAIQAQswUAAJwKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHQBUAAgQkAIdEFAQD_CAAh5gUBAP0IACHtBRAA8wkAIfMFAQD_CAAh9AUBAP8IACH8BQEA_wgAIZEGEADzCQAhkgYBAP0IACGTBhAA8wkAIZQGAQD_CAAhlQYBAP8IACEJAwAAgBIAIA4AAJISACAPAAD-EQAg0QUAAK0KACDzBQAArQoAIPQFAACtCgAg_AUAAK0KACCUBgAArQoAIJUGAACtCgAgFQMAAPAJACAOAACdCgAgDwAAgAoAILEFAACcCgAwsgUAACEAELMFAACcCgAwtAUBAAAAAbkFAQD9CAAhuwVAAIEJACHQBUAAgQkAIdEFAQD_CAAh5gUBAP0IACHtBRAA8wkAIfMFAQD_CAAh9AUBAP8IACH8BQEAAAABkQYQAPMJACGSBgEA_QgAIZMGEADzCQAhlAYBAP8IACGVBgEA_wgAIQMAAAAhACABAAAiADACAAAjACABAAAAAwAgHAMAAPAJACAOAACZCgAgEQAAmgoAIBgAAJsKACCxBQAAmAoAMLIFAAAmABCzBQAAmAoAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIeMFAQD9CAAh5AUBAP8IACHlBQEA_QgAIeYFAQD_CAAh5wUBAP8IACHoBQEA_wgAIekFAQD_CAAh6gUCAOsJACHrBRAA8wkAIewFEADzCQAh7QUQAPMJACHuBQEA_wgAIe8FAQD_CAAh8AUBAP8IACHxBUAAgQkAIfIFAQD9CAAh8wUBAP8IACH0BQEA_wgAIQ4DAACAEgAgDgAAkhIAIBEAAI8SACAYAACMEgAg5AUAAK0KACDmBQAArQoAIOcFAACtCgAg6AUAAK0KACDpBQAArQoAIO4FAACtCgAg7wUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACAcAwAA8AkAIA4AAJkKACARAACaCgAgGAAAmwoAILEFAACYCgAwsgUAACYAELMFAACYCgAwtAUBAAAAAbkFAQD9CAAhuwVAAIEJACHjBQEA_QgAIeQFAQD_CAAh5QUBAP0IACHmBQEA_wgAIecFAQD_CAAh6AUBAP8IACHpBQEA_wgAIeoFAgDrCQAh6wUQAPMJACHsBRAA8wkAIe0FEADzCQAh7gUBAP8IACHvBQEA_wgAIfAFAQD_CAAh8QVAAIEJACHyBQEA_QgAIfMFAQD_CAAh9AUBAP8IACEDAAAAJgAgAQAAJwAwAgAAKAAgDg0AAJcJACAQAACYCQAgFgAAmQkAILEFAACWCQAwsgUAACoAELMFAACWCQAwtAUBAP0IACH9BQEA_QgAIYIGAQD_CAAhgwYBAP8IACGEBgEA_wgAIYUGAQD_CAAhhgYAAOsIACCHBkAAgAkAIQEAAAAqACASEgAAlgoAIBMAAIcKACAUAADXCQAgFQAAlwoAIBYAAJkJACCxBQAAlQoAMLIFAAAsABCzBQAAlQoAMLQFAQD9CAAh5QUBAP8IACH9BQEA_QgAIbIGAQD9CAAhtAYAAI4KrwYitQYBAP8IACG2BgAA7wkAILcGAQD9CAAhuAYBAP8IACG5BgEA_wgAIQEAAAAsACAJEgAAkBIAIBMAAIASACAUAADJEQAgFQAAkRIAIBYAANALACDlBQAArQoAILUGAACtCgAguAYAAK0KACC5BgAArQoAIBISAACWCgAgEwAAhwoAIBQAANcJACAVAACXCgAgFgAAmQkAILEFAACVCgAwsgUAACwAELMFAACVCgAwtAUBAAAAAeUFAQD_CAAh_QUBAP0IACGyBgEA_QgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACC3BgEAAAABuAYBAP8IACG5BgEA_wgAIQMAAAAsACABAAAuADACAAAvACABAAAALAAgHAwAANMJACANAACXCQAgEAAAmAkAIBYAAJkJACAZAACUCQAgHgAA1QkAIB8AANYJACAgAADUCQAgIQAA1AkAICIAANcJACAjAADYCQAgJgAA2QkAIC4AANoJACAvAAC2CQAgMAAAswkAIDMAANsJACCxBQAA0QkAMLIFAAAyABCzBQAA0QkAMLQFAQD9CAAhuwVAAIEJACG8BUAAgQkAIc0FAADSCdIGIvcFAQD_CAAh_QUBAP0IACGHBkAAgAkAIdAGAQD9CAAh0gYBAP8IACEBAAAAMgAgDQMAAIcKACARAACTCgAgsQUAAJQKADCyBQAANAAQswUAAJQKADC0BQEA_QgAIbkFAQD_CAAhuwVAAIEJACHnBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGvBgAAjgqvBiKwBkAAgQkAIQUDAACAEgAgEQAAjxIAILkFAACtCgAg8wUAAK0KACD0BQAArQoAIA0DAACHCgAgEQAAkwoAILEFAACUCgAwsgUAADQAELMFAACUCgAwtAUBAAAAAbkFAQD_CAAhuwVAAIEJACHnBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGvBgAAjgqvBiKwBkAAgQkAIQMAAAA0ACABAAA1ADACAAA2ACABAAAAMgAgCxEAAJMKACCxBQAAkgoAMLIFAAA5ABCzBQAAkgoAMLQFAQD9CAAhuwVAAIEJACHnBQEA_QgAIfAFAQD_CAAhqwYBAP0IACGsBhAA_wkAIa0GQACBCQAhAxEAAI8SACDwBQAArQoAIKwGAACtCgAgCxEAAJMKACCxBQAAkgoAMLIFAAA5ABCzBQAAkgoAMLQFAQAAAAG7BUAAgQkAIecFAQD9CAAh8AUBAP8IACGrBgEA_QgAIawGEAD_CQAhrQZAAIEJACEDAAAAOQAgAQAAOgAwAgAAOwAgAwAAACYAIAEAACcAMAIAACgAIAEAAAA0ACABAAAAOQAgAQAAACYAIBASAACQCgAgEwAAhwoAIBQAANgJACAVAACRCgAgFgAAmQkAILEFAACPCgAwsgUAAEEAELMFAACPCgAwtAUBAP0IACHlBQEA_wgAIbEGAQD9CAAhsgYBAP0IACGzBgEA_wgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACABAAAAQQAgCBIAAI0SACATAACAEgAgFAAAyhEAIBUAAI4SACAWAADQCwAg5QUAAK0KACCzBgAArQoAILUGAACtCgAgEBIAAJAKACATAACHCgAgFAAA2AkAIBUAAJEKACAWAACZCQAgsQUAAI8KADCyBQAAQQAQswUAAI8KADC0BQEAAAAB5QUBAP8IACGxBgEAAAABsgYBAP0IACGzBgEA_wgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACADAAAAQQAgAQAAQwAwAgAARAAgAQAAAEEAIAEAAAAyACANAwAAhwoAIBgAAIwKACCxBQAAjQoAMLIFAABIABCzBQAAjQoAMLQFAQD9CAAhuQUBAP8IACG7BUAAgQkAIegFAQD9CAAh8wUBAP8IACH0BQEA_wgAIa8GAACOCq8GIrAGQACBCQAhBQMAAIASACAYAACMEgAguQUAAK0KACDzBQAArQoAIPQFAACtCgAgDQMAAIcKACAYAACMCgAgsQUAAI0KADCyBQAASAAQswUAAI0KADC0BQEAAAABuQUBAP8IACG7BUAAgQkAIegFAQD9CAAh8wUBAP8IACH0BQEA_wgAIa8GAACOCq8GIrAGQACBCQAhAwAAAEgAIAEAAEkAMAIAAEoAIAEAAAAyACALGAAAjAoAILEFAACLCgAwsgUAAE0AELMFAACLCgAwtAUBAP0IACG7BUAAgQkAIegFAQD9CAAh8AUBAP8IACGrBgEA_QgAIawGEAD_CQAhrQZAAIEJACEDGAAAjBIAIPAFAACtCgAgrAYAAK0KACALGAAAjAoAILEFAACLCgAwsgUAAE0AELMFAACLCgAwtAUBAAAAAbsFQACBCQAh6AUBAP0IACHwBQEA_wgAIasGAQD9CAAhrAYQAP8JACGtBkAAgQkAIQMAAABNACABAABOADACAABPACADAAAAJgAgAQAAJwAwAgAAKAAgAQAAAEgAIAEAAABNACABAAAAJgAgAQAAABwAIAEAAAAhACABAAAAJgAgAQAAADIAIBUDAADwCQAgBgAAiQoAIA8AAIAKACAaAACKCgAgsQUAAIgKADCyBQAAWQAQswUAAIgKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIfMFAQD_CAAh9AUBAP8IACH1BQEA_QgAIfYFEADzCQAh9wUBAP8IACH4BQEA_wgAIfkFAQD_CAAh-gUBAP8IACH7BUAAgQkAIfwFAQD_CAAhDAMAAIASACAGAACKEgAgDwAA_hEAIBoAAIsSACDRBQAArQoAIPMFAACtCgAg9AUAAK0KACD3BQAArQoAIPgFAACtCgAg-QUAAK0KACD6BQAArQoAIPwFAACtCgAgFQMAAPAJACAGAACJCgAgDwAAgAoAIBoAAIoKACCxBQAAiAoAMLIFAABZABCzBQAAiAoAMLQFAQAAAAG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHzBQEA_wgAIfQFAQD_CAAh9QUBAP0IACH2BRAA8wkAIfcFAQD_CAAh-AUBAP8IACH5BQEA_wgAIfoFAQD_CAAh-wVAAIEJACH8BQEAAAABAwAAAFkAIAEAAFoAMAIAAFsAIAMAAABZACABAABaADACAABbACABAAAAWQAgAQAAABwAIAEAAAADACABAAAAWQAgFAoAAIMKACAbAACHCgAgHAAA8AkAILEFAACFCgAwsgUAAGIAELMFAACFCgAwtAUBAP0IACG7BUAAgQkAIekFAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhqwYAAIYKwQYisAZAAIEJACG6BgEA_QgAIcEGAQD_CAAhwgYBAP0IACHDBhAA8wkAIcQGEAD_CQAhxQYBAP8IACEKCgAAiRIAIBsAAIASACAcAACAEgAg6QUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACDBBgAArQoAIMQGAACtCgAgxQYAAK0KACAUCgAAgwoAIBsAAIcKACAcAADwCQAgsQUAAIUKADCyBQAAYgAQswUAAIUKADC0BQEAAAABuwVAAIEJACHpBQEA_wgAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACGCsEGIrAGQACBCQAhugYBAP0IACHBBgEA_wgAIcIGAQD9CAAhwwYQAPMJACHEBhAA_wkAIcUGAQD_CAAhAwAAAGIAIAEAAGMAMAIAAGQAIAEAAAAyACATAwAA8AkAIAoAAIMKACAPAACACgAgsQUAAIQKADCyBQAAZwAQswUAAIQKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIfAFAQD_CAAh8gUBAP0IACHzBQEA_wgAIfQFAQD_CAAh_AUBAP8IACG6BgEA_QgAIbwGEADzCQAhvgYBAP8IACG_BkAAgQkAIQkDAACAEgAgCgAAiRIAIA8AAP4RACDRBQAArQoAIPAFAACtCgAg8wUAAK0KACD0BQAArQoAIPwFAACtCgAgvgYAAK0KACATAwAA8AkAIAoAAIMKACAPAACACgAgsQUAAIQKADCyBQAAZwAQswUAAIQKADC0BQEAAAABuQUBAP0IACG7BUAAgQkAIdEFAQD_CAAh8AUBAP8IACHyBQEA_QgAIfMFAQD_CAAh9AUBAP8IACH8BQEAAAABugYBAP0IACG8BhAA8wkAIb4GAQD_CAAhvwZAAIEJACEDAAAAZwAgAQAAaAAwAgAAaQAgAQAAAAMAIA8DAADwCQAgCgAAgwoAILEFAACBCgAwsgUAAGwAELMFAACBCgAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhqwYAAIIKvAYiugYBAP0IACG8BhAA8wkAIb0GQACBCQAhBQMAAIASACAKAACJEgAg8AUAAK0KACDzBQAArQoAIPQFAACtCgAgDwMAAPAJACAKAACDCgAgsQUAAIEKADCyBQAAbAAQswUAAIEKADC0BQEAAAABuQUBAP0IACG7BUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACCCrwGIroGAQD9CAAhvAYQAPMJACG9BkAAgQkAIQMAAABsACABAABtADACAABuACABAAAAFwAgAQAAAAcAIAEAAAAcACABAAAAYgAgAQAAAGcAIAEAAABsACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAAGIAIAEAAGMAMAIAAGQAIAMAAABiACABAABjADACAABkACADAAAAZwAgAQAAaAAwAgAAaQAgAwAAAGwAIAEAAG0AMAIAAG4AIAMAAAA0ACABAAA1ADACAAA2ACADAAAASAAgAQAASQAwAgAASgAgDwMAAPAJACAPAACACgAgJwAA9AkAILEFAAD-CQAwsgUAAH0AELMFAAD-CQAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACGWBgEA_QgAIaMGQACBCQAhpAYgAP4IACGlBhAA_wkAIaYGEAD_CQAhBgMAAIASACAPAAD-EQAgJwAAghIAINEFAACtCgAgpQYAAK0KACCmBgAArQoAIA8DAADwCQAgDwAAgAoAICcAAPQJACCxBQAA_gkAMLIFAAB9ABCzBQAA_gkAMLQFAQAAAAG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACGWBgEA_QgAIaMGQACBCQAhpAYgAP4IACGlBhAA_wkAIaYGEAD_CQAhAwAAAH0AIAEAAH4AMAIAAH8AIA4lAAD7CQAgJgAA2QkAICwAAPwJACAtAAD9CQAgsQUAAPoJADCyBQAAgQEAELMFAAD6CQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhpwYBAP8IACGoBgEA_wgAIakGAQD9CAAhqgYQAPMJACEGJQAAhhIAICYAAMsRACAsAACHEgAgLQAAiBIAIKcGAACtCgAgqAYAAK0KACAOJQAA-wkAICYAANkJACAsAAD8CQAgLQAA_QkAILEFAAD6CQAwsgUAAIEBABCzBQAA-gkAMLQFAQAAAAH9BQEA_QgAIf4FIAD-CAAhpwYBAP8IACGoBgEA_wgAIakGAQD9CAAhqgYQAPMJACEDAAAAgQEAIAEAAIIBADACAACDAQAgAQAAAIEBACADAAAAfQAgAQAAfgAwAgAAfwAgDicAAPQJACArAAD1CQAgsQUAAPkJADCyBQAAhwEAELMFAAD5CQAwtAUBAP0IACG7BUAAgQkAIfMFAQD_CAAh9AUBAP8IACH2BRAA8wkAIfgFAQD_CAAhlgYBAP0IACGhBgEA_wgAIaIGQACBCQAhBicAAIISACArAACDEgAg8wUAAK0KACD0BQAArQoAIPgFAACtCgAgoQYAAK0KACAOJwAA9AkAICsAAPUJACCxBQAA-QkAMLIFAACHAQAQswUAAPkJADC0BQEAAAABuwVAAIEJACHzBQEA_wgAIfQFAQD_CAAh9gUQAPMJACH4BQEA_wgAIZYGAQD9CAAhoQYBAP8IACGiBkAAgQkAIQMAAACHAQAgAQAAiAEAMAIAAIkBACAOKAAA9wkAICoAAPgJACCxBQAA9gkAMLIFAACLAQAQswUAAPYJADC0BQEA_QgAIbsFQACBCQAh8wUBAP8IACH2BRAA8wkAIZ0GAQD9CAAhngYBAP8IACGfBgEA_wgAIaAGQACBCQAhoQYBAP8IACEGKAAAhBIAICoAAIUSACDzBQAArQoAIJ4GAACtCgAgnwYAAK0KACChBgAArQoAIA4oAAD3CQAgKgAA-AkAILEFAAD2CQAwsgUAAIsBABCzBQAA9gkAMLQFAQAAAAG7BUAAgQkAIfMFAQD_CAAh9gUQAPMJACGdBgEA_QgAIZ4GAQD_CAAhnwYBAP8IACGgBkAAgQkAIaEGAQD_CAAhAwAAAIsBACABAACMAQAwAgAAjQEAIBEnAAD0CQAgKQAA9QkAILEFAADyCQAwsgUAAI8BABCzBQAA8gkAMLQFAQD9CAAhuwVAAIEJACHNBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGWBgEA_QgAIZcGEADzCQAhmAYQAPMJACGZBhAA8wkAIZoGEADzCQAhmwYBAP8IACGcBkAAgAkAIQEAAACPAQAgAwAAAIsBACABAACMAQAwAgAAjQEAIAEAAACLAQAgAQAAAIsBACAGJwAAghIAICkAAIMSACDzBQAArQoAIPQFAACtCgAgmwYAAK0KACCcBgAArQoAIBEnAAD0CQAgKQAA9QkAILEFAADyCQAwsgUAAI8BABCzBQAA8gkAMLQFAQAAAAG7BUAAgQkAIc0FAQD9CAAh8wUBAP8IACH0BQEA_wgAIZYGAQD9CAAhlwYQAPMJACGYBhAA8wkAIZkGEADzCQAhmgYQAPMJACGbBgEA_wgAIZwGQACACQAhAwAAAI8BACABAACUAQAwAgAAlQEAIAEAAAB9ACABAAAAhwEAIAEAAACPAQAgAQAAAAMAIAMAAAAhACABAAAiADACAAAjACADAAAAAwAgAQAABAAwAgAABQAgAwAAAFkAIAEAAFoAMAIAAFsAIAMAAAAsACABAAAuADACAAAvACADAAAAQQAgAQAAQwAwAgAARAAgDAMAAPAJACAPAADoCQAgMgAA8QkAILEFAADuCQAwsgUAAKABABCzBQAA7gkAMLQFAQD9CAAhuQUBAP0IACHRBQEA_QgAIdIFQACBCQAh0wUAAO8JACDUBUAAgQkAIQMDAACAEgAgDwAA_hEAIDIAAIESACANAwAA8AkAIA8AAOgJACAyAADxCQAgsQUAAO4JADCyBQAAoAEAELMFAADuCQAwtAUBAAAAAbkFAQD9CAAh0QUBAP0IACHSBUAAgQkAIdMFAADvCQAg1AVAAIEJACHeBgAA7QkAIAMAAACgAQAgAQAAoQEAMAIAAKIBACAMMQAA7AkAILEFAADqCQAwsgUAAKQBABCzBQAA6gkAMLQFAQD9CAAhuwVAAIEJACHLBQEA_QgAIcwFAQD9CAAhzQUBAP0IACHOBQIA6wkAIc8FAQD_CAAh0AVAAIAJACEDMQAA_xEAIM8FAACtCgAg0AUAAK0KACANMQAA7AkAILEFAADqCQAwsgUAAKQBABCzBQAA6gkAMLQFAQAAAAG7BUAAgQkAIcsFAQD9CAAhzAUBAP0IACHNBQEA_QgAIc4FAgDrCQAhzwUBAP8IACHQBUAAgAkAId0GAADpCQAgAwAAAKQBACABAAClAQAwAgAApgEAIAEAAACkAQAgAwAAACYAIAEAACcAMAIAACgAIAEAAAAHACABAAAAHAAgAQAAAGIAIAEAAABiACABAAAAZwAgAQAAAGwAIAEAAAA0ACABAAAASAAgAQAAAH0AIAEAAAAhACABAAAAAwAgAQAAAFkAIAEAAAAsACABAAAAQQAgAQAAAKABACABAAAAJgAgAwAAAH0AIAEAAH4AMAIAAH8AIAMAAABnACABAABoADACAABpACAKDwAA6AkAIDUAAOYJACCxBQAA5wkAMLIFAAC8AQAQswUAAOcJADC0BQEA_QgAIbsFQACBCQAh0QUBAP0IACGIBgEA_QgAIYkGAQD9CAAhAg8AAP4RACA1AAD9EQAgCg8AAOgJACA1AADmCQAgsQUAAOcJADCyBQAAvAEAELMFAADnCQAwtAUBAAAAAbsFQACBCQAh0QUBAP0IACGIBgEA_QgAIYkGAQD9CAAhAwAAALwBACABAAC9AQAwAgAAvgEAIAMAAABZACABAABaADACAABbACADAAAAIQAgAQAAIgAwAgAAIwAgAwAAAKABACABAAChAQAwAgAAogEAIAEAAAB9ACABAAAAZwAgAQAAALwBACABAAAAWQAgAQAAACEAIAEAAACgAQAgAwAAALwBACABAAC9AQAwAgAAvgEAIA03AADmCQAgsQUAAOUJADCyBQAAygEAELMFAADlCQAwtAUBAP0IACG5BQEA_wgAIdMGQACBCQAh1AYBAP0IACHVBgEA_QgAIdYGAQD9CAAh1wYBAP0IACHYBgEA_wgAIdkGAQD_CAAhBDcAAP0RACC5BQAArQoAINgGAACtCgAg2QYAAK0KACANNwAA5gkAILEFAADlCQAwsgUAAMoBABCzBQAA5QkAMLQFAQAAAAG5BQEA_wgAIdMGQACBCQAh1AYBAP0IACHVBgEA_QgAIdYGAQD9CAAh1wYBAP0IACHYBgEA_wgAIdkGAQD_CAAhAwAAAMoBACABAADLAQAwAgAAzAEAIAEAAAADACABAAAAvAEAIAEAAADKAQAgAQAAAAEAIA0uAADaCQAgNgAA4wkAIDgAAOQJACCxBQAA4QkAMLIFAADSAQAQswUAAOEJADC0BQEA_QgAIbsFQACBCQAhvAVAAIEJACH9BQEA_QgAIYQGAQD9CAAh2gYBAP0IACHcBgAA4gncBiIDLgAAzBEAIDYAAPsRACA4AAD8EQAgAwAAANIBACABAADTAQAwAgAAAQAgAwAAANIBACABAADTAQAwAgAAAQAgAwAAANIBACABAADTAQAwAgAAAQAgCi4AAPgRACA2AAD5EQAgOAAA-hEAILQFAQAAAAG7BUAAAAABvAVAAAAAAf0FAQAAAAGEBgEAAAAB2gYBAAAAAdwGAAAA3AYCAT4AANcBACAHtAUBAAAAAbsFQAAAAAG8BUAAAAAB_QUBAAAAAYQGAQAAAAHaBgEAAAAB3AYAAADcBgIBPgAA2QEAMAE-AADZAQAwCi4AANcRACA2AADYEQAgOAAA2REAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIf0FAQCxCgAhhAYBALEKACHaBgEAsQoAIdwGAADWEdwGIgIAAAABACA-AADcAQAgB7QFAQCxCgAhuwVAALYKACG8BUAAtgoAIf0FAQCxCgAhhAYBALEKACHaBgEAsQoAIdwGAADWEdwGIgIAAADSAQAgPgAA3gEAIAIAAADSAQAgPgAA3gEAIAMAAAABACBFAADXAQAgRgAA3AEAIAEAAAABACABAAAA0gEAIAMFAADTEQAgSwAA1REAIEwAANQRACAKsQUAAN0JADCyBQAA5QEAELMFAADdCQAwtAUBAOoIACG7BUAA7wgAIbwFQADvCAAh_QUBAOoIACGEBgEA6ggAIdoGAQDqCAAh3AYAAN4J3AYiAwAAANIBACABAADkAQAwSgAA5QEAIAMAAADSAQAgAQAA0wEAMAIAAAEAIAEAAADMAQAgAQAAAMwBACADAAAAygEAIAEAAMsBADACAADMAQAgAwAAAMoBACABAADLAQAwAgAAzAEAIAMAAADKAQAgAQAAywEAMAIAAMwBACAKNwAA0hEAILQFAQAAAAG5BQEAAAAB0wZAAAAAAdQGAQAAAAHVBgEAAAAB1gYBAAAAAdcGAQAAAAHYBgEAAAAB2QYBAAAAAQE-AADtAQAgCbQFAQAAAAG5BQEAAAAB0wZAAAAAAdQGAQAAAAHVBgEAAAAB1gYBAAAAAdcGAQAAAAHYBgEAAAAB2QYBAAAAAQE-AADvAQAwAT4AAO8BADAKNwAA0REAILQFAQCxCgAhuQUBALQKACHTBkAAtgoAIdQGAQCxCgAh1QYBALEKACHWBgEAsQoAIdcGAQCxCgAh2AYBALQKACHZBgEAtAoAIQIAAADMAQAgPgAA8gEAIAm0BQEAsQoAIbkFAQC0CgAh0wZAALYKACHUBgEAsQoAIdUGAQCxCgAh1gYBALEKACHXBgEAsQoAIdgGAQC0CgAh2QYBALQKACECAAAAygEAID4AAPQBACACAAAAygEAID4AAPQBACADAAAAzAEAIEUAAO0BACBGAADyAQAgAQAAAMwBACABAAAAygEAIAYFAADOEQAgSwAA0BEAIEwAAM8RACC5BQAArQoAINgGAACtCgAg2QYAAK0KACAMsQUAANwJADCyBQAA-wEAELMFAADcCQAwtAUBAOoIACG5BQEA7QgAIdMGQADvCAAh1AYBAOoIACHVBgEA6ggAIdYGAQDqCAAh1wYBAOoIACHYBgEA7QgAIdkGAQDtCAAhAwAAAMoBACABAAD6AQAwSgAA-wEAIAMAAADKAQAgAQAAywEAMAIAAMwBACAcDAAA0wkAIA0AAJcJACAQAACYCQAgFgAAmQkAIBkAAJQJACAeAADVCQAgHwAA1gkAICAAANQJACAhAADUCQAgIgAA1wkAICMAANgJACAmAADZCQAgLgAA2gkAIC8AALYJACAwAACzCQAgMwAA2wkAILEFAADRCQAwsgUAADIAELMFAADRCQAwtAUBAAAAAbsFQACBCQAhvAVAAIEJACHNBQAA0gnSBiL3BQEA_wgAIf0FAQD9CAAhhwZAAIAJACHQBgEA_QgAIdIGAQD_CAAhAQAAAP4BACABAAAA_gEAIBMMAADFEQAgDQAAzgsAIBAAAM8LACAWAADQCwAgGQAAiQsAIB4AAMcRACAfAADIEQAgIAAAxhEAICEAAMYRACAiAADJEQAgIwAAyhEAICYAAMsRACAuAADMEQAgLwAAzw4AIDAAAL0OACAzAADNEQAg9wUAAK0KACCHBgAArQoAINIGAACtCgAgAwAAADIAIAEAAIECADACAAD-AQAgAwAAADIAIAEAAIECADACAAD-AQAgAwAAADIAIAEAAIECADACAAD-AQAgGQwAALURACANAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAvAADBEQAgMAAAwhEAIDMAAMMRACC0BQEAAAABuwVAAAAAAbwFQAAAAAHNBQAAANIGAvcFAQAAAAH9BQEAAAABhwZAAAAAAdAGAQAAAAHSBgEAAAABAT4AAIUCACAJtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQE-AACHAgAwAT4AAIcCADAZDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACECAAAA_gEAID4AAIoCACAJtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQIAAAAyACA-AACMAgAgAgAAADIAID4AAIwCACADAAAA_gEAIEUAAIUCACBGAACKAgAgAQAAAP4BACABAAAAMgAgBgUAAI4QACBLAACQEAAgTAAAjxAAIPcFAACtCgAghwYAAK0KACDSBgAArQoAIAyxBQAAzQkAMLIFAACTAgAQswUAAM0JADC0BQEA6ggAIbsFQADvCAAhvAVAAO8IACHNBQAAzgnSBiL3BQEA7QgAIf0FAQDqCAAhhwZAAO4IACHQBgEA6ggAIdIGAQDtCAAhAwAAADIAIAEAAJICADBKAACTAgAgAwAAADIAIAEAAIECADACAAD-AQAgBwQAAMoJACCxBQAAzAkAMLIFAACZAgAQswUAAMwJADC0BQEAAAAB_QUBAAAAAf4FIAD-CAAhAQAAAJYCACABAAAAlgIAIAcEAADKCQAgsQUAAMwJADCyBQAAmQIAELMFAADMCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhAQQAAP8PACADAAAAmQIAIAEAAJoCADACAACWAgAgAwAAAJkCACABAACaAgAwAgAAlgIAIAMAAACZAgAgAQAAmgIAMAIAAJYCACAEBAAAjRAAILQFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AACeAgAgA7QFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AACgAgAwAT4AAKACADAEBAAAgxAAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQIAAACWAgAgPgAAowIAIAO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACECAAAAmQIAID4AAKUCACACAAAAmQIAID4AAKUCACADAAAAlgIAIEUAAJ4CACBGAACjAgAgAQAAAJYCACABAAAAmQIAIAMFAACAEAAgSwAAghAAIEwAAIEQACAGsQUAAMsJADCyBQAArAIAELMFAADLCQAwtAUBAOoIACH9BQEA6ggAIf4FIADsCAAhAwAAAJkCACABAACrAgAwSgAArAIAIAMAAACZAgAgAQAAmgIAMAIAAJYCACAHBAAAygkAILEFAADJCQAwsgUAALICABCzBQAAyQkAMLQFAQAAAAH9BQEAAAAB_gUgAP4IACEBAAAArwIAIAEAAACvAgAgBwQAAMoJACCxBQAAyQkAMLIFAACyAgAQswUAAMkJADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACEBBAAA_w8AIAMAAACyAgAgAQAAswIAMAIAAK8CACADAAAAsgIAIAEAALMCADACAACvAgAgAwAAALICACABAACzAgAwAgAArwIAIAQEAAD-DwAgtAUBAAAAAf0FAQAAAAH-BSAAAAABAT4AALcCACADtAUBAAAAAf0FAQAAAAH-BSAAAAABAT4AALkCADABPgAAuQIAMAQEAADxDwAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhAgAAAK8CACA-AAC8AgAgA7QFAQCxCgAh_QUBALEKACH-BSAAswoAIQIAAACyAgAgPgAAvgIAIAIAAACyAgAgPgAAvgIAIAMAAACvAgAgRQAAtwIAIEYAALwCACABAAAArwIAIAEAAACyAgAgAwUAAO4PACBLAADwDwAgTAAA7w8AIAaxBQAAyAkAMLIFAADFAgAQswUAAMgJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEDAAAAsgIAIAEAAMQCADBKAADFAgAgAwAAALICACABAACzAgAwAgAArwIAIAEAAAANACABAAAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgCgYAAOsPACAHAADsDwAgCAAA7Q8AILQFAQAAAAH1BQEAAAAB_QUBAAAAAf4FIAAAAAG2BoAAAAABzgYBAAAAAc8GEAAAAAEBPgAAzQIAIAe0BQEAAAAB9QUBAAAAAf0FAQAAAAH-BSAAAAABtgaAAAAAAc4GAQAAAAHPBhAAAAABAT4AAM8CADABPgAAzwIAMAoGAADcDwAgBwAA3Q8AIAgAAN4PACC0BQEAsQoAIfUFAQCxCgAh_QUBALEKACH-BSAAswoAIbYGgAAAAAHOBgEAsQoAIc8GEAC4CwAhAgAAAA0AID4AANICACAHtAUBALEKACH1BQEAsQoAIf0FAQCxCgAh_gUgALMKACG2BoAAAAABzgYBALEKACHPBhAAuAsAIQIAAAALACA-AADUAgAgAgAAAAsAID4AANQCACADAAAADQAgRQAAzQIAIEYAANICACABAAAADQAgAQAAAAsAIAYFAADXDwAgSwAA2g8AIEwAANkPACCdAQAA2A8AIJ4BAADbDwAgzwYAAK0KACAKsQUAAMcJADCyBQAA2wIAELMFAADHCQAwtAUBAOoIACH1BQEA6ggAIf0FAQDqCAAh_gUgAOwIACG2BgAAiQkAIM4GAQDqCAAhzwYQAKEJACEDAAAACwAgAQAA2gIAMEoAANsCACADAAAACwAgAQAADAAwAgAADQAgAQAAABQAIAEAAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAABIAIAEAABMAMAIAABQAIAMAAAASACABAAATADACAAAUACAKCQAA0A8AIAsAANEPACAMAADSDwAgDQAA0w8AIB0AANQPACAeAADVDwAgHwAA1g8AILQFAQAAAAHMBgEAAAABzQYBAAAAAQE-AADjAgAgA7QFAQAAAAHMBgEAAAABzQYBAAAAAQE-AADlAgAwAT4AAOUCADAKCQAAhw8AIAsAAIgPACAMAACJDwAgDQAAig8AIB0AAIsPACAeAACMDwAgHwAAjQ8AILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIQIAAAAUACA-AADoAgAgA7QFAQCxCgAhzAYBALEKACHNBgEAsQoAIQIAAAASACA-AADqAgAgAgAAABIAID4AAOoCACADAAAAFAAgRQAA4wIAIEYAAOgCACABAAAAFAAgAQAAABIAIAMFAACEDwAgSwAAhg8AIEwAAIUPACAGsQUAAMYJADCyBQAA8QIAELMFAADGCQAwtAUBAOoIACHMBgEA6ggAIc0GAQDqCAAhAwAAABIAIAEAAPACADBKAADxAgAgAwAAABIAIAEAABMAMAIAABQAIAEAAAAZACABAAAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgBAoAAIMPACC8BUAAAAABugYBAAAAAbwGEAAAAAEBPgAA-QIAIAO8BUAAAAABugYBAAAAAbwGEAAAAAEBPgAA-wIAMAE-AAD7AgAwBAoAAIIPACC8BUAAtgoAIboGAQCxCgAhvAYQAOIKACECAAAAGQAgPgAA_gIAIAO8BUAAtgoAIboGAQCxCgAhvAYQAOIKACECAAAAFwAgPgAAgAMAIAIAAAAXACA-AACAAwAgAwAAABkAIEUAAPkCACBGAAD-AgAgAQAAABkAIAEAAAAXACAFBQAA_Q4AIEsAAIAPACBMAAD_DgAgnQEAAP4OACCeAQAAgQ8AIAaxBQAAxQkAMLIFAACHAwAQswUAAMUJADC8BUAA7wgAIboGAQDqCAAhvAYQAI4JACEDAAAAFwAgAQAAhgMAMEoAAIcDACADAAAAFwAgAQAAGAAwAgAAGQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAGAwAA-w4AIAoAAPwOACC5BQEAAAABvAVAAAAAAboGAQAAAAG8BhAAAAABAT4AAI8DACAEuQUBAAAAAbwFQAAAAAG6BgEAAAABvAYQAAAAAQE-AACRAwAwAT4AAJEDADAGAwAA-Q4AIAoAAPoOACC5BQEAsQoAIbwFQAC2CgAhugYBALEKACG8BhAA4goAIQIAAAAJACA-AACUAwAgBLkFAQCxCgAhvAVAALYKACG6BgEAsQoAIbwGEADiCgAhAgAAAAcAID4AAJYDACACAAAABwAgPgAAlgMAIAMAAAAJACBFAACPAwAgRgAAlAMAIAEAAAAJACABAAAABwAgBQUAAPQOACBLAAD3DgAgTAAA9g4AIJ0BAAD1DgAgngEAAPgOACAHsQUAAMQJADCyBQAAnQMAELMFAADECQAwuQUBAOoIACG8BUAA7wgAIboGAQDqCAAhvAYQAI4JACEDAAAABwAgAQAAnAMAMEoAAJ0DACADAAAABwAgAQAACAAwAgAACQAgAQAAAB4AIAEAAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAcACABAAAdADACAAAeACAXAwAAyAsAIAoAAMcLACAOAADzDgAgGQAAyQsAILQFAQAAAAG5BQEAAAABuwVAAAAAAeYFAQAAAAHpBQEAAAAB7QUQAAAAAe8FAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGUBgEAAAABlQYBAAAAAboGAQAAAAG8BhAAAAABxwYAAADHBgLIBhAAAAAByQYBAAAAAcoGAQAAAAHLBkAAAAABAT4AAKUDACATtAUBAAAAAbkFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABugYBAAAAAbwGEAAAAAHHBgAAAMcGAsgGEAAAAAHJBgEAAAABygYBAAAAAcsGQAAAAAEBPgAApwMAMAE-AACnAwAwAQAAADIAIBcDAAC7CwAgCgAAugsAIA4AAPIOACAZAAC8CwAgtAUBALEKACG5BQEAtAoAIbsFQAC2CgAh5gUBALEKACHpBQEAtAoAIe0FEAC4CwAh7wUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGUBgEAtAoAIZUGAQC0CgAhugYBALEKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhAgAAAB4AID4AAKsDACATtAUBALEKACG5BQEAtAoAIbsFQAC2CgAh5gUBALEKACHpBQEAtAoAIe0FEAC4CwAh7wUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGUBgEAtAoAIZUGAQC0CgAhugYBALEKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhAgAAABwAID4AAK0DACACAAAAHAAgPgAArQMAIAEAAAAyACADAAAAHgAgRQAApQMAIEYAAKsDACABAAAAHgAgAQAAABwAIBEFAADtDgAgSwAA8A4AIEwAAO8OACCdAQAA7g4AIJ4BAADxDgAguQUAAK0KACDpBQAArQoAIO0FAACtCgAg7wUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACCUBgAArQoAIJUGAACtCgAgyAYAAK0KACDJBgAArQoAIMoGAACtCgAgFrEFAADACQAwsgUAALUDABCzBQAAwAkAMLQFAQDqCAAhuQUBAO0IACG7BUAA7wgAIeYFAQDqCAAh6QUBAO0IACHtBRAAoQkAIe8FAQDtCAAh8AUBAO0IACHzBQEA7QgAIfQFAQDtCAAhlAYBAO0IACGVBgEA7QgAIboGAQDqCAAhvAYQAI4JACHHBgAAwQnHBiLIBhAAoQkAIckGAQDtCAAhygYBAO0IACHLBkAA7wgAIQMAAAAcACABAAC0AwAwSgAAtQMAIAMAAAAcACABAAAdADACAAAeACABAAAAZAAgAQAAAGQAIAMAAABiACABAABjADACAABkACADAAAAYgAgAQAAYwAwAgAAZAAgAwAAAGIAIAEAAGMAMAIAAGQAIBEKAADqDgAgGwAA6w4AIBwAAOwOACC0BQEAAAABuwVAAAAAAekFAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAAMEGArAGQAAAAAG6BgEAAAABwQYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAEBPgAAvQMAIA60BQEAAAABuwVAAAAAAekFAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAAMEGArAGQAAAAAG6BgEAAAABwQYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAEBPgAAvwMAMAE-AAC_AwAwAQAAADIAIBEKAADnDgAgGwAA6A4AIBwAAOkOACC0BQEAsQoAIbsFQAC2CgAh6QUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGrBgAA5g7BBiKwBkAAtgoAIboGAQCxCgAhwQYBALQKACHCBgEAsQoAIcMGEADiCgAhxAYQALgLACHFBgEAtAoAIQIAAABkACA-AADDAwAgDrQFAQCxCgAhuwVAALYKACHpBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIasGAADmDsEGIrAGQAC2CgAhugYBALEKACHBBgEAtAoAIcIGAQCxCgAhwwYQAOIKACHEBhAAuAsAIcUGAQC0CgAhAgAAAGIAID4AAMUDACACAAAAYgAgPgAAxQMAIAEAAAAyACADAAAAZAAgRQAAvQMAIEYAAMMDACABAAAAZAAgAQAAAGIAIAwFAADhDgAgSwAA5A4AIEwAAOMOACCdAQAA4g4AIJ4BAADlDgAg6QUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACDBBgAArQoAIMQGAACtCgAgxQYAAK0KACARsQUAALwJADCyBQAAzQMAELMFAAC8CQAwtAUBAOoIACG7BUAA7wgAIekFAQDtCAAh8AUBAO0IACHzBQEA7QgAIfQFAQDtCAAhqwYAAL0JwQYisAZAAO8IACG6BgEA6ggAIcEGAQDtCAAhwgYBAOoIACHDBhAAjgkAIcQGEAChCQAhxQYBAO0IACEDAAAAYgAgAQAAzAMAMEoAAM0DACADAAAAYgAgAQAAYwAwAgAAZAAgAQAAAGkAIAEAAABpACADAAAAZwAgAQAAaAAwAgAAaQAgAwAAAGcAIAEAAGgAMAIAAGkAIAMAAABnACABAABoADACAABpACAQAwAAnQwAIAoAAJ4MACAPAADgDgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0QUBAAAAAfAFAQAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABugYBAAAAAbwGEAAAAAG-BgEAAAABvwZAAAAAAQE-AADVAwAgDbQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHwBQEAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAboGAQAAAAG8BhAAAAABvgYBAAAAAb8GQAAAAAEBPgAA1wMAMAE-AADXAwAwAQAAAAMAIBADAACaDAAgCgAAmwwAIA8AAN8OACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHRBQEAtAoAIfAFAQC0CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACG6BgEAsQoAIbwGEADiCgAhvgYBALQKACG_BkAAtgoAIQIAAABpACA-AADbAwAgDbQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAh8AUBALQKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACH8BQEAtAoAIboGAQCxCgAhvAYQAOIKACG-BgEAtAoAIb8GQAC2CgAhAgAAAGcAID4AAN0DACACAAAAZwAgPgAA3QMAIAEAAAADACADAAAAaQAgRQAA1QMAIEYAANsDACABAAAAaQAgAQAAAGcAIAsFAADaDgAgSwAA3Q4AIEwAANwOACCdAQAA2w4AIJ4BAADeDgAg0QUAAK0KACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACD8BQAArQoAIL4GAACtCgAgELEFAAC7CQAwsgUAAOUDABCzBQAAuwkAMLQFAQDqCAAhuQUBAOoIACG7BUAA7wgAIdEFAQDtCAAh8AUBAO0IACHyBQEA6ggAIfMFAQDtCAAh9AUBAO0IACH8BQEA7QgAIboGAQDqCAAhvAYQAI4JACG-BgEA7QgAIb8GQADvCAAhAwAAAGcAIAEAAOQDADBKAADlAwAgAwAAAGcAIAEAAGgAMAIAAGkAIAEAAABuACABAAAAbgAgAwAAAGwAIAEAAG0AMAIAAG4AIAMAAABsACABAABtADACAABuACADAAAAbAAgAQAAbQAwAgAAbgAgDAMAANgOACAKAADZDgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAAC8BgK6BgEAAAABvAYQAAAAAb0GQAAAAAEBPgAA7QMAIAq0BQEAAAABuQUBAAAAAbsFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAALwGAroGAQAAAAG8BhAAAAABvQZAAAAAAQE-AADvAwAwAT4AAO8DADAMAwAA1g4AIAoAANcOACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGrBgAA1Q68BiK6BgEAsQoAIbwGEADiCgAhvQZAALYKACECAAAAbgAgPgAA8gMAIAq0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGrBgAA1Q68BiK6BgEAsQoAIbwGEADiCgAhvQZAALYKACECAAAAbAAgPgAA9AMAIAIAAABsACA-AAD0AwAgAwAAAG4AIEUAAO0DACBGAADyAwAgAQAAAG4AIAEAAABsACAIBQAA0A4AIEsAANMOACBMAADSDgAgnQEAANEOACCeAQAA1A4AIPAFAACtCgAg8wUAAK0KACD0BQAArQoAIA2xBQAAtwkAMLIFAAD7AwAQswUAALcJADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHwBQEA7QgAIfMFAQDtCAAh9AUBAO0IACGrBgAAuAm8BiK6BgEA6ggAIbwGEACOCQAhvQZAAO8IACEDAAAAbAAgAQAA-gMAMEoAAPsDACADAAAAbAAgAQAAbQAwAgAAbgAgBxEAALYJACCxBQAAtQkAMLIFAACBBAAQswUAALUJADC0BQEAAAAB_QUBAAAAAf4FIAD-CAAhAQAAAP4DACABAAAA_gMAIAcRAAC2CQAgsQUAALUJADCyBQAAgQQAELMFAAC1CQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhAREAAM8OACADAAAAgQQAIAEAAIIEADACAAD-AwAgAwAAAIEEACABAACCBAAwAgAA_gMAIAMAAACBBAAgAQAAggQAMAIAAP4DACAEEQAAzg4AILQFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AACGBAAgA7QFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AACIBAAwAT4AAIgEADAEEQAAwQ4AILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQIAAAD-AwAgPgAAiwQAIAO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACECAAAAgQQAID4AAI0EACACAAAAgQQAID4AAI0EACADAAAA_gMAIEUAAIYEACBGAACLBAAgAQAAAP4DACABAAAAgQQAIAMFAAC-DgAgSwAAwA4AIEwAAL8OACAGsQUAALQJADCyBQAAlAQAELMFAAC0CQAwtAUBAOoIACH9BQEA6ggAIf4FIADsCAAhAwAAAIEEACABAACTBAAwSgAAlAQAIAMAAACBBAAgAQAAggQAMAIAAP4DACAHFwAAswkAILEFAACyCQAwsgUAAJoEABCzBQAAsgkAMLQFAQAAAAH9BQEAAAAB_gUgAP4IACEBAAAAlwQAIAEAAACXBAAgBxcAALMJACCxBQAAsgkAMLIFAACaBAAQswUAALIJADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACEBFwAAvQ4AIAMAAACaBAAgAQAAmwQAMAIAAJcEACADAAAAmgQAIAEAAJsEADACAACXBAAgAwAAAJoEACABAACbBAAwAgAAlwQAIAQXAAC8DgAgtAUBAAAAAf0FAQAAAAH-BSAAAAABAT4AAJ8EACADtAUBAAAAAf0FAQAAAAH-BSAAAAABAT4AAKEEADABPgAAoQQAMAQXAACvDgAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhAgAAAJcEACA-AACkBAAgA7QFAQCxCgAh_QUBALEKACH-BSAAswoAIQIAAACaBAAgPgAApgQAIAIAAACaBAAgPgAApgQAIAMAAACXBAAgRQAAnwQAIEYAAKQEACABAAAAlwQAIAEAAACaBAAgAwUAAKwOACBLAACuDgAgTAAArQ4AIAaxBQAAsQkAMLIFAACtBAAQswUAALEJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEDAAAAmgQAIAEAAKwEADBKAACtBAAgAwAAAJoEACABAACbBAAwAgAAlwQAIAEAAAAvACABAAAALwAgAwAAACwAIAEAAC4AMAIAAC8AIAMAAAAsACABAAAuADACAAAvACADAAAALAAgAQAALgAwAgAALwAgDxIAAKcOACATAACoDgAgFAAAqQ4AIBUAAKoOACAWAACrDgAgtAUBAAAAAeUFAQAAAAH9BQEAAAABsgYBAAAAAbQGAAAArwYCtQYBAAAAAbYGgAAAAAG3BgEAAAABuAYBAAAAAbkGAQAAAAEBPgAAtQQAIAq0BQEAAAAB5QUBAAAAAf0FAQAAAAGyBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAbcGAQAAAAG4BgEAAAABuQYBAAAAAQE-AAC3BAAwAT4AALcEADABAAAAMgAgDxIAAIEOACATAACCDgAgFAAAgw4AIBUAAIQOACAWAACFDgAgtAUBALEKACHlBQEAtAoAIf0FAQCxCgAhsgYBALEKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAG3BgEAsQoAIbgGAQC0CgAhuQYBALQKACECAAAALwAgPgAAuwQAIAq0BQEAsQoAIeUFAQC0CgAh_QUBALEKACGyBgEAsQoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAbcGAQCxCgAhuAYBALQKACG5BgEAtAoAIQIAAAAsACA-AAC9BAAgAgAAACwAID4AAL0EACABAAAAMgAgAwAAAC8AIEUAALUEACBGAAC7BAAgAQAAAC8AIAEAAAAsACAHBQAA_g0AIEsAAIAOACBMAAD_DQAg5QUAAK0KACC1BgAArQoAILgGAACtCgAguQYAAK0KACANsQUAALAJADCyBQAAxQQAELMFAACwCQAwtAUBAOoIACHlBQEA7QgAIf0FAQDqCAAhsgYBAOoIACG0BgAAqgmvBiK1BgEA7QgAIbYGAACJCQAgtwYBAOoIACG4BgEA7QgAIbkGAQDtCAAhAwAAACwAIAEAAMQEADBKAADFBAAgAwAAACwAIAEAAC4AMAIAAC8AIAEAAAA2ACABAAAANgAgAwAAADQAIAEAADUAMAIAADYAIAMAAAA0ACABAAA1ADACAAA2ACADAAAANAAgAQAANQAwAgAANgAgCgMAAP0NACARAAD8DQAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB5wUBAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABAT4AAM0EACAItAUBAAAAAbkFAQAAAAG7BUAAAAAB5wUBAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABAT4AAM8EADABPgAAzwQAMAEAAAAyACAKAwAA-w0AIBEAAPoNACC0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHnBQEAsQoAIfMFAQC0CgAh9AUBALQKACGvBgAAvQ2vBiKwBkAAtgoAIQIAAAA2ACA-AADTBAAgCLQFAQCxCgAhuQUBALQKACG7BUAAtgoAIecFAQCxCgAh8wUBALQKACH0BQEAtAoAIa8GAAC9Da8GIrAGQAC2CgAhAgAAADQAID4AANUEACACAAAANAAgPgAA1QQAIAEAAAAyACADAAAANgAgRQAAzQQAIEYAANMEACABAAAANgAgAQAAADQAIAYFAAD3DQAgSwAA-Q0AIEwAAPgNACC5BQAArQoAIPMFAACtCgAg9AUAAK0KACALsQUAAK8JADCyBQAA3QQAELMFAACvCQAwtAUBAOoIACG5BQEA7QgAIbsFQADvCAAh5wUBAOoIACHzBQEA7QgAIfQFAQDtCAAhrwYAAKoJrwYisAZAAO8IACEDAAAANAAgAQAA3AQAMEoAAN0EACADAAAANAAgAQAANQAwAgAANgAgAQAAADsAIAEAAAA7ACADAAAAOQAgAQAAOgAwAgAAOwAgAwAAADkAIAEAADoAMAIAADsAIAMAAAA5ACABAAA6ADACAAA7ACAIEQAA9g0AILQFAQAAAAG7BUAAAAAB5wUBAAAAAfAFAQAAAAGrBgEAAAABrAYQAAAAAa0GQAAAAAEBPgAA5QQAIAe0BQEAAAABuwVAAAAAAecFAQAAAAHwBQEAAAABqwYBAAAAAawGEAAAAAGtBkAAAAABAT4AAOcEADABPgAA5wQAMAgRAAD1DQAgtAUBALEKACG7BUAAtgoAIecFAQCxCgAh8AUBALQKACGrBgEAsQoAIawGEAC4CwAhrQZAALYKACECAAAAOwAgPgAA6gQAIAe0BQEAsQoAIbsFQAC2CgAh5wUBALEKACHwBQEAtAoAIasGAQCxCgAhrAYQALgLACGtBkAAtgoAIQIAAAA5ACA-AADsBAAgAgAAADkAID4AAOwEACADAAAAOwAgRQAA5QQAIEYAAOoEACABAAAAOwAgAQAAADkAIAcFAADwDQAgSwAA8w0AIEwAAPINACCdAQAA8Q0AIJ4BAAD0DQAg8AUAAK0KACCsBgAArQoAIAqxBQAArgkAMLIFAADzBAAQswUAAK4JADC0BQEA6ggAIbsFQADvCAAh5wUBAOoIACHwBQEA7QgAIasGAQDqCAAhrAYQAKEJACGtBkAA7wgAIQMAAAA5ACABAADyBAAwSgAA8wQAIAMAAAA5ACABAAA6ADACAAA7ACABAAAARAAgAQAAAEQAIAMAAABBACABAABDADACAABEACADAAAAQQAgAQAAQwAwAgAARAAgAwAAAEEAIAEAAEMAMAIAAEQAIA0SAADrDQAgEwAA7A0AIBQAAO0NACAVAADuDQAgFgAA7w0AILQFAQAAAAHlBQEAAAABsQYBAAAAAbIGAQAAAAGzBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAQE-AAD7BAAgCLQFAQAAAAHlBQEAAAABsQYBAAAAAbIGAQAAAAGzBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAQE-AAD9BAAwAT4AAP0EADABAAAAMgAgDRIAAMUNACATAADGDQAgFAAAxw0AIBUAAMgNACAWAADJDQAgtAUBALEKACHlBQEAtAoAIbEGAQCxCgAhsgYBALEKACGzBgEAtAoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAQIAAABEACA-AACBBQAgCLQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAECAAAAQQAgPgAAgwUAIAIAAABBACA-AACDBQAgAQAAADIAIAMAAABEACBFAAD7BAAgRgAAgQUAIAEAAABEACABAAAAQQAgBgUAAMINACBLAADEDQAgTAAAww0AIOUFAACtCgAgswYAAK0KACC1BgAArQoAIAuxBQAArQkAMLIFAACLBQAQswUAAK0JADC0BQEA6ggAIeUFAQDtCAAhsQYBAOoIACGyBgEA6ggAIbMGAQDtCAAhtAYAAKoJrwYitQYBAO0IACG2BgAAiQkAIAMAAABBACABAACKBQAwSgAAiwUAIAMAAABBACABAABDADACAABEACABAAAASgAgAQAAAEoAIAMAAABIACABAABJADACAABKACADAAAASAAgAQAASQAwAgAASgAgAwAAAEgAIAEAAEkAMAIAAEoAIAoDAADBDQAgGAAAwA0AILQFAQAAAAG5BQEAAAABuwVAAAAAAegFAQAAAAHzBQEAAAAB9AUBAAAAAa8GAAAArwYCsAZAAAAAAQE-AACTBQAgCLQFAQAAAAG5BQEAAAABuwVAAAAAAegFAQAAAAHzBQEAAAAB9AUBAAAAAa8GAAAArwYCsAZAAAAAAQE-AACVBQAwAT4AAJUFADABAAAAMgAgCgMAAL8NACAYAAC-DQAgtAUBALEKACG5BQEAtAoAIbsFQAC2CgAh6AUBALEKACHzBQEAtAoAIfQFAQC0CgAhrwYAAL0NrwYisAZAALYKACECAAAASgAgPgAAmQUAIAi0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHoBQEAsQoAIfMFAQC0CgAh9AUBALQKACGvBgAAvQ2vBiKwBkAAtgoAIQIAAABIACA-AACbBQAgAgAAAEgAID4AAJsFACABAAAAMgAgAwAAAEoAIEUAAJMFACBGAACZBQAgAQAAAEoAIAEAAABIACAGBQAAug0AIEsAALwNACBMAAC7DQAguQUAAK0KACDzBQAArQoAIPQFAACtCgAgC7EFAACpCQAwsgUAAKMFABCzBQAAqQkAMLQFAQDqCAAhuQUBAO0IACG7BUAA7wgAIegFAQDqCAAh8wUBAO0IACH0BQEA7QgAIa8GAACqCa8GIrAGQADvCAAhAwAAAEgAIAEAAKIFADBKAACjBQAgAwAAAEgAIAEAAEkAMAIAAEoAIAEAAABPACABAAAATwAgAwAAAE0AIAEAAE4AMAIAAE8AIAMAAABNACABAABOADACAABPACADAAAATQAgAQAATgAwAgAATwAgCBgAALkNACC0BQEAAAABuwVAAAAAAegFAQAAAAHwBQEAAAABqwYBAAAAAawGEAAAAAGtBkAAAAABAT4AAKsFACAHtAUBAAAAAbsFQAAAAAHoBQEAAAAB8AUBAAAAAasGAQAAAAGsBhAAAAABrQZAAAAAAQE-AACtBQAwAT4AAK0FADAIGAAAuA0AILQFAQCxCgAhuwVAALYKACHoBQEAsQoAIfAFAQC0CgAhqwYBALEKACGsBhAAuAsAIa0GQAC2CgAhAgAAAE8AID4AALAFACAHtAUBALEKACG7BUAAtgoAIegFAQCxCgAh8AUBALQKACGrBgEAsQoAIawGEAC4CwAhrQZAALYKACECAAAATQAgPgAAsgUAIAIAAABNACA-AACyBQAgAwAAAE8AIEUAAKsFACBGAACwBQAgAQAAAE8AIAEAAABNACAHBQAAsw0AIEsAALYNACBMAAC1DQAgnQEAALQNACCeAQAAtw0AIPAFAACtCgAgrAYAAK0KACAKsQUAAKgJADCyBQAAuQUAELMFAACoCQAwtAUBAOoIACG7BUAA7wgAIegFAQDqCAAh8AUBAO0IACGrBgEA6ggAIawGEAChCQAhrQZAAO8IACEDAAAATQAgAQAAuAUAMEoAALkFACADAAAATQAgAQAATgAwAgAATwAgByQAAKcJACCxBQAApgkAMLIFAAC_BQAQswUAAKYJADC0BQEAAAAB_QUBAAAAAf4FIAD-CAAhAQAAALwFACABAAAAvAUAIAckAACnCQAgsQUAAKYJADCyBQAAvwUAELMFAACmCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhASQAALINACADAAAAvwUAIAEAAMAFADACAAC8BQAgAwAAAL8FACABAADABQAwAgAAvAUAIAMAAAC_BQAgAQAAwAUAMAIAALwFACAEJAAAsQ0AILQFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AADEBQAgA7QFAQAAAAH9BQEAAAAB_gUgAAAAAQE-AADGBQAwAT4AAMYFADAEJAAApA0AILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQIAAAC8BQAgPgAAyQUAIAO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACECAAAAvwUAID4AAMsFACACAAAAvwUAID4AAMsFACADAAAAvAUAIEUAAMQFACBGAADJBQAgAQAAALwFACABAAAAvwUAIAMFAAChDQAgSwAAow0AIEwAAKINACAGsQUAAKUJADCyBQAA0gUAELMFAAClCQAwtAUBAOoIACH9BQEA6ggAIf4FIADsCAAhAwAAAL8FACABAADRBQAwSgAA0gUAIAMAAAC_BQAgAQAAwAUAMAIAALwFACABAAAAgwEAIAEAAACDAQAgAwAAAIEBACABAACCAQAwAgAAgwEAIAMAAACBAQAgAQAAggEAMAIAAIMBACADAAAAgQEAIAEAAIIBADACAACDAQAgCyUAAJ0NACAmAACeDQAgLAAAnw0AIC0AAKANACC0BQEAAAAB_QUBAAAAAf4FIAAAAAGnBgEAAAABqAYBAAAAAakGAQAAAAGqBhAAAAABAT4AANoFACAHtAUBAAAAAf0FAQAAAAH-BSAAAAABpwYBAAAAAagGAQAAAAGpBgEAAAABqgYQAAAAAQE-AADcBQAwAT4AANwFADALJQAA-AwAICYAAPkMACAsAAD6DAAgLQAA-wwAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIacGAQC0CgAhqAYBALQKACGpBgEAsQoAIaoGEADiCgAhAgAAAIMBACA-AADfBQAgB7QFAQCxCgAh_QUBALEKACH-BSAAswoAIacGAQC0CgAhqAYBALQKACGpBgEAsQoAIaoGEADiCgAhAgAAAIEBACA-AADhBQAgAgAAAIEBACA-AADhBQAgAwAAAIMBACBFAADaBQAgRgAA3wUAIAEAAACDAQAgAQAAAIEBACAHBQAA8wwAIEsAAPYMACBMAAD1DAAgnQEAAPQMACCeAQAA9wwAIKcGAACtCgAgqAYAAK0KACAKsQUAAKQJADCyBQAA6AUAELMFAACkCQAwtAUBAOoIACH9BQEA6ggAIf4FIADsCAAhpwYBAO0IACGoBgEA7QgAIakGAQDqCAAhqgYQAI4JACEDAAAAgQEAIAEAAOcFADBKAADoBQAgAwAAAIEBACABAACCAQAwAgAAgwEAIAEAAAB_ACABAAAAfwAgAwAAAH0AIAEAAH4AMAIAAH8AIAMAAAB9ACABAAB-ADACAAB_ACADAAAAfQAgAQAAfgAwAgAAfwAgDAMAAK4MACAPAADyDAAgJwAArQwAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAGWBgEAAAABowZAAAAAAaQGIAAAAAGlBhAAAAABpgYQAAAAAQE-AADwBQAgCbQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAGWBgEAAAABowZAAAAAAaQGIAAAAAGlBhAAAAABpgYQAAAAAQE-AADyBQAwAT4AAPIFADABAAAAAwAgDAMAAKsMACAPAADxDAAgJwAAqgwAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAhlgYBALEKACGjBkAAtgoAIaQGIACzCgAhpQYQALgLACGmBhAAuAsAIQIAAAB_ACA-AAD2BQAgCbQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAhlgYBALEKACGjBkAAtgoAIaQGIACzCgAhpQYQALgLACGmBhAAuAsAIQIAAAB9ACA-AAD4BQAgAgAAAH0AID4AAPgFACABAAAAAwAgAwAAAH8AIEUAAPAFACBGAAD2BQAgAQAAAH8AIAEAAAB9ACAIBQAA7AwAIEsAAO8MACBMAADuDAAgnQEAAO0MACCeAQAA8AwAINEFAACtCgAgpQYAAK0KACCmBgAArQoAIAyxBQAAoAkAMLIFAACABgAQswUAAKAJADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHRBQEA7QgAIZYGAQDqCAAhowZAAO8IACGkBiAA7AgAIaUGEAChCQAhpgYQAKEJACEDAAAAfQAgAQAA_wUAMEoAAIAGACADAAAAfQAgAQAAfgAwAgAAfwAgAQAAAIkBACABAAAAiQEAIAMAAACHAQAgAQAAiAEAMAIAAIkBACADAAAAhwEAIAEAAIgBADACAACJAQAgAwAAAIcBACABAACIAQAwAgAAiQEAIAsnAADqDAAgKwAA6wwAILQFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAH2BRAAAAAB-AUBAAAAAZYGAQAAAAGhBgEAAAABogZAAAAAAQE-AACIBgAgCbQFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAH2BRAAAAAB-AUBAAAAAZYGAQAAAAGhBgEAAAABogZAAAAAAQE-AACKBgAwAT4AAIoGADALJwAA3wwAICsAAOAMACC0BQEAsQoAIbsFQAC2CgAh8wUBALQKACH0BQEAtAoAIfYFEADiCgAh-AUBALQKACGWBgEAsQoAIaEGAQC0CgAhogZAALYKACECAAAAiQEAID4AAI0GACAJtAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9AUBALQKACH2BRAA4goAIfgFAQC0CgAhlgYBALEKACGhBgEAtAoAIaIGQAC2CgAhAgAAAIcBACA-AACPBgAgAgAAAIcBACA-AACPBgAgAwAAAIkBACBFAACIBgAgRgAAjQYAIAEAAACJAQAgAQAAAIcBACAJBQAA2gwAIEsAAN0MACBMAADcDAAgnQEAANsMACCeAQAA3gwAIPMFAACtCgAg9AUAAK0KACD4BQAArQoAIKEGAACtCgAgDLEFAACfCQAwsgUAAJYGABCzBQAAnwkAMLQFAQDqCAAhuwVAAO8IACHzBQEA7QgAIfQFAQDtCAAh9gUQAI4JACH4BQEA7QgAIZYGAQDqCAAhoQYBAO0IACGiBkAA7wgAIQMAAACHAQAgAQAAlQYAMEoAAJYGACADAAAAhwEAIAEAAIgBADACAACJAQAgAQAAAI0BACABAAAAjQEAIAMAAACLAQAgAQAAjAEAMAIAAI0BACADAAAAiwEAIAEAAIwBADACAACNAQAgAwAAAIsBACABAACMAQAwAgAAjQEAIAsoAADQDAAgKgAA2QwAILQFAQAAAAG7BUAAAAAB8wUBAAAAAfYFEAAAAAGdBgEAAAABngYBAAAAAZ8GAQAAAAGgBkAAAAABoQYBAAAAAQE-AACeBgAgCbQFAQAAAAG7BUAAAAAB8wUBAAAAAfYFEAAAAAGdBgEAAAABngYBAAAAAZ8GAQAAAAGgBkAAAAABoQYBAAAAAQE-AACgBgAwAT4AAKAGADABAAAAjwEAIAsoAADODAAgKgAA2AwAILQFAQCxCgAhuwVAALYKACHzBQEAtAoAIfYFEADiCgAhnQYBALEKACGeBgEAtAoAIZ8GAQC0CgAhoAZAALYKACGhBgEAtAoAIQIAAACNAQAgPgAApAYAIAm0BQEAsQoAIbsFQAC2CgAh8wUBALQKACH2BRAA4goAIZ0GAQCxCgAhngYBALQKACGfBgEAtAoAIaAGQAC2CgAhoQYBALQKACECAAAAiwEAID4AAKYGACACAAAAiwEAID4AAKYGACABAAAAjwEAIAMAAACNAQAgRQAAngYAIEYAAKQGACABAAAAjQEAIAEAAACLAQAgCQUAANMMACBLAADWDAAgTAAA1QwAIJ0BAADUDAAgngEAANcMACDzBQAArQoAIJ4GAACtCgAgnwYAAK0KACChBgAArQoAIAyxBQAAngkAMLIFAACuBgAQswUAAJ4JADC0BQEA6ggAIbsFQADvCAAh8wUBAO0IACH2BRAAjgkAIZ0GAQDqCAAhngYBAO0IACGfBgEA7QgAIaAGQADvCAAhoQYBAO0IACEDAAAAiwEAIAEAAK0GADBKAACuBgAgAwAAAIsBACABAACMAQAwAgAAjQEAIAEAAACVAQAgAQAAAJUBACADAAAAjwEAIAEAAJQBADACAACVAQAgAwAAAI8BACABAACUAQAwAgAAlQEAIAMAAACPAQAgAQAAlAEAMAIAAJUBACAOJwAA0QwAICkAANIMACC0BQEAAAABuwVAAAAAAc0FAQAAAAHzBQEAAAAB9AUBAAAAAZYGAQAAAAGXBhAAAAABmAYQAAAAAZkGEAAAAAGaBhAAAAABmwYBAAAAAZwGQAAAAAEBPgAAtgYAIAy0BQEAAAABuwVAAAAAAc0FAQAAAAHzBQEAAAAB9AUBAAAAAZYGAQAAAAGXBhAAAAABmAYQAAAAAZkGEAAAAAGaBhAAAAABmwYBAAAAAZwGQAAAAAEBPgAAuAYAMAE-AAC4BgAwDicAAMEMACApAADCDAAgtAUBALEKACG7BUAAtgoAIc0FAQCxCgAh8wUBALQKACH0BQEAtAoAIZYGAQCxCgAhlwYQAOIKACGYBhAA4goAIZkGEADiCgAhmgYQAOIKACGbBgEAtAoAIZwGQAC1CgAhAgAAAJUBACA-AAC7BgAgDLQFAQCxCgAhuwVAALYKACHNBQEAsQoAIfMFAQC0CgAh9AUBALQKACGWBgEAsQoAIZcGEADiCgAhmAYQAOIKACGZBhAA4goAIZoGEADiCgAhmwYBALQKACGcBkAAtQoAIQIAAACPAQAgPgAAvQYAIAIAAACPAQAgPgAAvQYAIAMAAACVAQAgRQAAtgYAIEYAALsGACABAAAAlQEAIAEAAACPAQAgCQUAALwMACBLAAC_DAAgTAAAvgwAIJ0BAAC9DAAgngEAAMAMACDzBQAArQoAIPQFAACtCgAgmwYAAK0KACCcBgAArQoAIA-xBQAAnQkAMLIFAADEBgAQswUAAJ0JADC0BQEA6ggAIbsFQADvCAAhzQUBAOoIACHzBQEA7QgAIfQFAQDtCAAhlgYBAOoIACGXBhAAjgkAIZgGEACOCQAhmQYQAI4JACGaBhAAjgkAIZsGAQDtCAAhnAZAAO4IACEDAAAAjwEAIAEAAMMGADBKAADEBgAgAwAAAI8BACABAACUAQAwAgAAlQEAIAEAAAAjACABAAAAIwAgAwAAACEAIAEAACIAMAIAACMAIAMAAAAhACABAAAiADACAAAjACADAAAAIQAgAQAAIgAwAgAAIwAgEgMAAKsLACAOAAD5CwAgDwAArAsAILQFAQAAAAG5BQEAAAABuwVAAAAAAdAFQAAAAAHRBQEAAAAB5gUBAAAAAe0FEAAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAGRBhAAAAABkgYBAAAAAZMGEAAAAAGUBgEAAAABlQYBAAAAAQE-AADMBgAgD7QFAQAAAAG5BQEAAAABuwVAAAAAAdAFQAAAAAHRBQEAAAAB5gUBAAAAAe0FEAAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAGRBhAAAAABkgYBAAAAAZMGEAAAAAGUBgEAAAABlQYBAAAAAQE-AADOBgAwAT4AAM4GADABAAAAAwAgEgMAAKgLACAOAAD3CwAgDwAAqQsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdAFQAC2CgAh0QUBALQKACHmBQEAsQoAIe0FEADiCgAh8wUBALQKACH0BQEAtAoAIfwFAQC0CgAhkQYQAOIKACGSBgEAsQoAIZMGEADiCgAhlAYBALQKACGVBgEAtAoAIQIAAAAjACA-AADSBgAgD7QFAQCxCgAhuQUBALEKACG7BUAAtgoAIdAFQAC2CgAh0QUBALQKACHmBQEAsQoAIe0FEADiCgAh8wUBALQKACH0BQEAtAoAIfwFAQC0CgAhkQYQAOIKACGSBgEAsQoAIZMGEADiCgAhlAYBALQKACGVBgEAtAoAIQIAAAAhACA-AADUBgAgAgAAACEAID4AANQGACABAAAAAwAgAwAAACMAIEUAAMwGACBGAADSBgAgAQAAACMAIAEAAAAhACALBQAAtwwAIEsAALoMACBMAAC5DAAgnQEAALgMACCeAQAAuwwAINEFAACtCgAg8wUAAK0KACD0BQAArQoAIPwFAACtCgAglAYAAK0KACCVBgAArQoAIBKxBQAAnAkAMLIFAADcBgAQswUAAJwJADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHQBUAA7wgAIdEFAQDtCAAh5gUBAOoIACHtBRAAjgkAIfMFAQDtCAAh9AUBAO0IACH8BQEA7QgAIZEGEACOCQAhkgYBAOoIACGTBhAAjgkAIZQGAQDtCAAhlQYBAO0IACEDAAAAIQAgAQAA2wYAMEoAANwGACADAAAAIQAgAQAAIgAwAgAAIwAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAWAwAArwwAIBAAALUMACAZAAC0DAAgHgAAsgwAICYAALEMACAzAAC2DAAgNAAAsAwAIDYAALMMACC0BQEAAAABuQUBAAAAAbsFQAAAAAHSBUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABigYBAAAAAYsGAQAAAAGMBgEAAAABjQYBAAAAAY4GAQAAAAGPBgEAAAABkAaAAAAAAQE-AADkBgAgDrQFAQAAAAG5BQEAAAABuwVAAAAAAdIFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGKBgEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAGQBoAAAAABAT4AAOYGADABPgAA5gYAMBYDAADbCwAgEAAA4QsAIBkAAOALACAeAADeCwAgJgAA3QsAIDMAAOILACA0AADcCwAgNgAA3wsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAAQIAAAAFACA-AADpBgAgDrQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAAQIAAAADACA-AADrBgAgAgAAAAMAID4AAOsGACADAAAABQAgRQAA5AYAIEYAAOkGACABAAAABQAgAQAAAAMAIAsFAADYCwAgSwAA2gsAIEwAANkLACDwBQAArQoAIPMFAACtCgAg9AUAAK0KACCLBgAArQoAIIwGAACtCgAgjQYAAK0KACCOBgAArQoAII8GAACtCgAgEbEFAACbCQAwsgUAAPIGABCzBQAAmwkAMLQFAQDqCAAhuQUBAOoIACG7BUAA7wgAIdIFQADvCAAh8AUBAO0IACHzBQEA7QgAIfQFAQDtCAAhigYBAOoIACGLBgEA7QgAIYwGAQDtCAAhjQYBAO0IACGOBgEA7QgAIY8GAQDtCAAhkAYAAIkJACADAAAAAwAgAQAA8QYAMEoAAPIGACADAAAAAwAgAQAABAAwAgAABQAgAQAAAL4BACABAAAAvgEAIAMAAAC8AQAgAQAAvQEAMAIAAL4BACADAAAAvAEAIAEAAL0BADACAAC-AQAgAwAAALwBACABAAC9AQAwAgAAvgEAIAcPAADWCwAgNQAA1wsAILQFAQAAAAG7BUAAAAAB0QUBAAAAAYgGAQAAAAGJBgEAAAABAT4AAPoGACAFtAUBAAAAAbsFQAAAAAHRBQEAAAABiAYBAAAAAYkGAQAAAAEBPgAA_AYAMAE-AAD8BgAwBw8AANQLACA1AADVCwAgtAUBALEKACG7BUAAtgoAIdEFAQCxCgAhiAYBALEKACGJBgEAsQoAIQIAAAC-AQAgPgAA_wYAIAW0BQEAsQoAIbsFQAC2CgAh0QUBALEKACGIBgEAsQoAIYkGAQCxCgAhAgAAALwBACA-AACBBwAgAgAAALwBACA-AACBBwAgAwAAAL4BACBFAAD6BgAgRgAA_wYAIAEAAAC-AQAgAQAAALwBACADBQAA0QsAIEsAANMLACBMAADSCwAgCLEFAACaCQAwsgUAAIgHABCzBQAAmgkAMLQFAQDqCAAhuwVAAO8IACHRBQEA6ggAIYgGAQDqCAAhiQYBAOoIACEDAAAAvAEAIAEAAIcHADBKAACIBwAgAwAAALwBACABAAC9AQAwAgAAvgEAIA4NAACXCQAgEAAAmAkAIBYAAJkJACCxBQAAlgkAMLIFAAAqABCzBQAAlgkAMLQFAQAAAAH9BQEA_QgAIYIGAQD_CAAhgwYBAP8IACGEBgEA_wgAIYUGAQD_CAAhhgYAAOsIACCHBkAAgAkAIQEAAACLBwAgAQAAAIsHACAIDQAAzgsAIBAAAM8LACAWAADQCwAgggYAAK0KACCDBgAArQoAIIQGAACtCgAghQYAAK0KACCHBgAArQoAIAMAAAAqACABAACOBwAwAgAAiwcAIAMAAAAqACABAACOBwAwAgAAiwcAIAMAAAAqACABAACOBwAwAgAAiwcAIAsNAADLCwAgEAAAzAsAIBYAAM0LACC0BQEAAAAB_QUBAAAAAYIGAQAAAAGDBgEAAAABhAYBAAAAAYUGAQAAAAGGBgAAygsAIIcGQAAAAAEBPgAAkgcAIAi0BQEAAAAB_QUBAAAAAYIGAQAAAAGDBgEAAAABhAYBAAAAAYUGAQAAAAGGBgAAygsAIIcGQAAAAAEBPgAAlAcAMAE-AACUBwAwCw0AAI4LACAQAACPCwAgFgAAkAsAILQFAQCxCgAh_QUBALEKACGCBgEAtAoAIYMGAQC0CgAhhAYBALQKACGFBgEAtAoAIYYGAACNCwAghwZAALUKACECAAAAiwcAID4AAJcHACAItAUBALEKACH9BQEAsQoAIYIGAQC0CgAhgwYBALQKACGEBgEAtAoAIYUGAQC0CgAhhgYAAI0LACCHBkAAtQoAIQIAAAAqACA-AACZBwAgAgAAACoAID4AAJkHACADAAAAiwcAIEUAAJIHACBGAACXBwAgAQAAAIsHACABAAAAKgAgCAUAAIoLACBLAACMCwAgTAAAiwsAIIIGAACtCgAggwYAAK0KACCEBgAArQoAIIUGAACtCgAghwYAAK0KACALsQUAAJUJADCyBQAAoAcAELMFAACVCQAwtAUBAOoIACH9BQEA6ggAIYIGAQDtCAAhgwYBAO0IACGEBgEA7QgAIYUGAQDtCAAhhgYAAOsIACCHBkAA7ggAIQMAAAAqACABAACfBwAwSgAAoAcAIAMAAAAqACABAACOBwAwAgAAiwcAIAcZAACUCQAgsQUAAJMJADCyBQAApgcAELMFAACTCQAwtAUBAAAAAf0FAQAAAAH-BSAA_ggAIQEAAACjBwAgAQAAAKMHACAHGQAAlAkAILEFAACTCQAwsgUAAKYHABCzBQAAkwkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIQEZAACJCwAgAwAAAKYHACABAACnBwAwAgAAowcAIAMAAACmBwAgAQAApwcAMAIAAKMHACADAAAApgcAIAEAAKcHADACAACjBwAgBBkAAIgLACC0BQEAAAAB_QUBAAAAAf4FIAAAAAEBPgAAqwcAIAO0BQEAAAAB_QUBAAAAAf4FIAAAAAEBPgAArQcAMAE-AACtBwAwBBkAAPsKACC0BQEAsQoAIf0FAQCxCgAh_gUgALMKACECAAAAowcAID4AALAHACADtAUBALEKACH9BQEAsQoAIf4FIACzCgAhAgAAAKYHACA-AACyBwAgAgAAAKYHACA-AACyBwAgAwAAAKMHACBFAACrBwAgRgAAsAcAIAEAAACjBwAgAQAAAKYHACADBQAA-AoAIEsAAPoKACBMAAD5CgAgBrEFAACSCQAwsgUAALkHABCzBQAAkgkAMLQFAQDqCAAh_QUBAOoIACH-BSAA7AgAIQMAAACmBwAgAQAAuAcAMEoAALkHACADAAAApgcAIAEAAKcHADACAACjBwAgAQAAAFsAIAEAAABbACADAAAAWQAgAQAAWgAwAgAAWwAgAwAAAFkAIAEAAFoAMAIAAFsAIAMAAABZACABAABaADACAABbACASAwAA9AoAIAYAAPUKACAPAAD3CgAgGgAA9goAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-gUBAAAAAfsFQAAAAAH8BQEAAAABAT4AAMEHACAOtAUBAAAAAbkFAQAAAAG7BUAAAAAB0QUBAAAAAfMFAQAAAAH0BQEAAAAB9QUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAEBPgAAwwcAMAE-AADDBwAwAQAAABwAIAEAAAADACASAwAA8AoAIAYAAPEKACAPAADzCgAgGgAA8goAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAh8wUBALQKACH0BQEAtAoAIfUFAQCxCgAh9gUQAOIKACH3BQEAtAoAIfgFAQC0CgAh-QUBALQKACH6BQEAtAoAIfsFQAC2CgAh_AUBALQKACECAAAAWwAgPgAAyAcAIA60BQEAsQoAIbkFAQCxCgAhuwVAALYKACHRBQEAtAoAIfMFAQC0CgAh9AUBALQKACH1BQEAsQoAIfYFEADiCgAh9wUBALQKACH4BQEAtAoAIfkFAQC0CgAh-gUBALQKACH7BUAAtgoAIfwFAQC0CgAhAgAAAFkAID4AAMoHACACAAAAWQAgPgAAygcAIAEAAAAcACABAAAAAwAgAwAAAFsAIEUAAMEHACBGAADIBwAgAQAAAFsAIAEAAABZACANBQAA6woAIEsAAO4KACBMAADtCgAgnQEAAOwKACCeAQAA7woAINEFAACtCgAg8wUAAK0KACD0BQAArQoAIPcFAACtCgAg-AUAAK0KACD5BQAArQoAIPoFAACtCgAg_AUAAK0KACARsQUAAJEJADCyBQAA0wcAELMFAACRCQAwtAUBAOoIACG5BQEA6ggAIbsFQADvCAAh0QUBAO0IACHzBQEA7QgAIfQFAQDtCAAh9QUBAOoIACH2BRAAjgkAIfcFAQDtCAAh-AUBAO0IACH5BQEA7QgAIfoFAQDtCAAh-wVAAO8IACH8BQEA7QgAIQMAAABZACABAADSBwAwSgAA0wcAIAMAAABZACABAABaADACAABbACABAAAAKAAgAQAAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgAwAAACYAIAEAACcAMAIAACgAIBkDAADnCgAgDgAA6AoAIBEAAOkKACAYAADqCgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB4wUBAAAAAeQFAQAAAAHlBQEAAAAB5gUBAAAAAecFAQAAAAHoBQEAAAAB6QUBAAAAAeoFAgAAAAHrBRAAAAAB7AUQAAAAAe0FEAAAAAHuBQEAAAAB7wUBAAAAAfAFAQAAAAHxBUAAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAABAT4AANsHACAVtAUBAAAAAbkFAQAAAAG7BUAAAAAB4wUBAAAAAeQFAQAAAAHlBQEAAAAB5gUBAAAAAecFAQAAAAHoBQEAAAAB6QUBAAAAAeoFAgAAAAHrBRAAAAAB7AUQAAAAAe0FEAAAAAHuBQEAAAAB7wUBAAAAAfAFAQAAAAHxBUAAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAABAT4AAN0HADABPgAA3QcAMAEAAAAqACABAAAALAAgAQAAAEEAIBkDAADjCgAgDgAA5AoAIBEAAOUKACAYAADmCgAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh4wUBALEKACHkBQEAtAoAIeUFAQCxCgAh5gUBALQKACHnBQEAtAoAIegFAQC0CgAh6QUBALQKACHqBQIAwgoAIesFEADiCgAh7AUQAOIKACHtBRAA4goAIe4FAQC0CgAh7wUBALQKACHwBQEAtAoAIfEFQAC2CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAhAgAAACgAID4AAOMHACAVtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh4wUBALEKACHkBQEAtAoAIeUFAQCxCgAh5gUBALQKACHnBQEAtAoAIegFAQC0CgAh6QUBALQKACHqBQIAwgoAIesFEADiCgAh7AUQAOIKACHtBRAA4goAIe4FAQC0CgAh7wUBALQKACHwBQEAtAoAIfEFQAC2CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAhAgAAACYAID4AAOUHACACAAAAJgAgPgAA5QcAIAEAAAAqACABAAAALAAgAQAAAEEAIAMAAAAoACBFAADbBwAgRgAA4wcAIAEAAAAoACABAAAAJgAgDwUAAN0KACBLAADgCgAgTAAA3woAIJ0BAADeCgAgngEAAOEKACDkBQAArQoAIOYFAACtCgAg5wUAAK0KACDoBQAArQoAIOkFAACtCgAg7gUAAK0KACDvBQAArQoAIPAFAACtCgAg8wUAAK0KACD0BQAArQoAIBixBQAAjQkAMLIFAADvBwAQswUAAI0JADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHjBQEA6ggAIeQFAQDtCAAh5QUBAOoIACHmBQEA7QgAIecFAQDtCAAh6AUBAO0IACHpBQEA7QgAIeoFAgCFCQAh6wUQAI4JACHsBRAAjgkAIe0FEACOCQAh7gUBAO0IACHvBQEA7QgAIfAFAQDtCAAh8QVAAO8IACHyBQEA6ggAIfMFAQDtCAAh9AUBAO0IACEDAAAAJgAgAQAA7gcAMEoAAO8HACADAAAAJgAgAQAAJwAwAgAAKAAgDrEFAACMCQAwsgUAAPUHABCzBQAAjAkAMLQFAQAAAAG7BUAAgQkAIbwFQACBCQAh2wUBAP0IACHcBQEA_wgAId0FAQD9CAAh3gUBAP0IACHfBQEA_QgAIeAFAQD_CAAh4QUBAP8IACHiBQEA_wgAIQEAAADyBwAgAQAAAPIHACAOsQUAAIwJADCyBQAA9QcAELMFAACMCQAwtAUBAP0IACG7BUAAgQkAIbwFQACBCQAh2wUBAP0IACHcBQEA_wgAId0FAQD9CAAh3gUBAP0IACHfBQEA_QgAIeAFAQD_CAAh4QUBAP8IACHiBQEA_wgAIQTcBQAArQoAIOAFAACtCgAg4QUAAK0KACDiBQAArQoAIAMAAAD1BwAgAQAA9gcAMAIAAPIHACADAAAA9QcAIAEAAPYHADACAADyBwAgAwAAAPUHACABAAD2BwAwAgAA8gcAIAu0BQEAAAABuwVAAAAAAbwFQAAAAAHbBQEAAAAB3AUBAAAAAd0FAQAAAAHeBQEAAAAB3wUBAAAAAeAFAQAAAAHhBQEAAAAB4gUBAAAAAQE-AAD6BwAgC7QFAQAAAAG7BUAAAAABvAVAAAAAAdsFAQAAAAHcBQEAAAAB3QUBAAAAAd4FAQAAAAHfBQEAAAAB4AUBAAAAAeEFAQAAAAHiBQEAAAABAT4AAPwHADABPgAA_AcAMAu0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHbBQEAsQoAIdwFAQC0CgAh3QUBALEKACHeBQEAsQoAId8FAQCxCgAh4AUBALQKACHhBQEAtAoAIeIFAQC0CgAhAgAAAPIHACA-AAD_BwAgC7QFAQCxCgAhuwVAALYKACG8BUAAtgoAIdsFAQCxCgAh3AUBALQKACHdBQEAsQoAId4FAQCxCgAh3wUBALEKACHgBQEAtAoAIeEFAQC0CgAh4gUBALQKACECAAAA9QcAID4AAIEIACACAAAA9QcAID4AAIEIACADAAAA8gcAIEUAAPoHACBGAAD_BwAgAQAAAPIHACABAAAA9QcAIAcFAADaCgAgSwAA3AoAIEwAANsKACDcBQAArQoAIOAFAACtCgAg4QUAAK0KACDiBQAArQoAIA6xBQAAiwkAMLIFAACICAAQswUAAIsJADC0BQEA6ggAIbsFQADvCAAhvAVAAO8IACHbBQEA6ggAIdwFAQDtCAAh3QUBAOoIACHeBQEA6ggAId8FAQDqCAAh4AUBAO0IACHhBQEA7QgAIeIFAQDtCAAhAwAAAPUHACABAACHCAAwSgAAiAgAIAMAAAD1BwAgAQAA9gcAMAIAAPIHACABAAAAogEAIAEAAACiAQAgAwAAAKABACABAAChAQAwAgAAogEAIAMAAACgAQAgAQAAoQEAMAIAAKIBACADAAAAoAEAIAEAAKEBADACAACiAQAgCQMAANcKACAPAADYCgAgMgAA2QoAILQFAQAAAAG5BQEAAAAB0QUBAAAAAdIFQAAAAAHTBYAAAAAB1AVAAAAAAQE-AACQCAAgBrQFAQAAAAG5BQEAAAAB0QUBAAAAAdIFQAAAAAHTBYAAAAAB1AVAAAAAAQE-AACSCAAwAT4AAJIIADAJAwAAyAoAIA8AAMkKACAyAADKCgAgtAUBALEKACG5BQEAsQoAIdEFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACECAAAAogEAID4AAJUIACAGtAUBALEKACG5BQEAsQoAIdEFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACECAAAAoAEAID4AAJcIACACAAAAoAEAID4AAJcIACADAAAAogEAIEUAAJAIACBGAACVCAAgAQAAAKIBACABAAAAoAEAIAMFAADFCgAgSwAAxwoAIEwAAMYKACAJsQUAAIgJADCyBQAAnggAELMFAACICQAwtAUBAOoIACG5BQEA6ggAIdEFAQDqCAAh0gVAAO8IACHTBQAAiQkAINQFQADvCAAhAwAAAKABACABAACdCAAwSgAAnggAIAMAAACgAQAgAQAAoQEAMAIAAKIBACABAAAApgEAIAEAAACmAQAgAwAAAKQBACABAAClAQAwAgAApgEAIAMAAACkAQAgAQAApQEAMAIAAKYBACADAAAApAEAIAEAAKUBADACAACmAQAgCTEAAMQKACC0BQEAAAABuwVAAAAAAcsFAQAAAAHMBQEAAAABzQUBAAAAAc4FAgAAAAHPBQEAAAAB0AVAAAAAAQE-AACmCAAgCLQFAQAAAAG7BUAAAAABywUBAAAAAcwFAQAAAAHNBQEAAAABzgUCAAAAAc8FAQAAAAHQBUAAAAABAT4AAKgIADABPgAAqAgAMAkxAADDCgAgtAUBALEKACG7BUAAtgoAIcsFAQCxCgAhzAUBALEKACHNBQEAsQoAIc4FAgDCCgAhzwUBALQKACHQBUAAtQoAIQIAAACmAQAgPgAAqwgAIAi0BQEAsQoAIbsFQAC2CgAhywUBALEKACHMBQEAsQoAIc0FAQCxCgAhzgUCAMIKACHPBQEAtAoAIdAFQAC1CgAhAgAAAKQBACA-AACtCAAgAgAAAKQBACA-AACtCAAgAwAAAKYBACBFAACmCAAgRgAAqwgAIAEAAACmAQAgAQAAAKQBACAHBQAAvQoAIEsAAMAKACBMAAC_CgAgnQEAAL4KACCeAQAAwQoAIM8FAACtCgAg0AUAAK0KACALsQUAAIQJADCyBQAAtAgAELMFAACECQAwtAUBAOoIACG7BUAA7wgAIcsFAQDqCAAhzAUBAOoIACHNBQEA6ggAIc4FAgCFCQAhzwUBAO0IACHQBUAA7ggAIQMAAACkAQAgAQAAswgAMEoAALQIACADAAAApAEAIAEAAKUBADACAACmAQAgB7EFAACDCQAwsgUAALoIABCzBQAAgwkAMLQFAQAAAAG3BQAA6wgAILgFIAD-CAAhywUBAAAAAQEAAAC3CAAgAQAAALcIACAHsQUAAIMJADCyBQAAuggAELMFAACDCQAwtAUBAP0IACG3BQAA6wgAILgFIAD-CAAhywUBAP0IACEAAwAAALoIACABAAC7CAAwAgAAtwgAIAMAAAC6CAAgAQAAuwgAMAIAALcIACADAAAAuggAIAEAALsIADACAAC3CAAgBLQFAQAAAAG3BQAAvAoAILgFIAAAAAHLBQEAAAABAT4AAL8IACAEtAUBAAAAAbcFAAC8CgAguAUgAAAAAcsFAQAAAAEBPgAAwQgAMAE-AADBCAAwBLQFAQCxCgAhtwUAALsKACC4BSAAswoAIcsFAQCxCgAhAgAAALcIACA-AADECAAgBLQFAQCxCgAhtwUAALsKACC4BSAAswoAIcsFAQCxCgAhAgAAALoIACA-AADGCAAgAgAAALoIACA-AADGCAAgAwAAALcIACBFAAC_CAAgRgAAxAgAIAEAAAC3CAAgAQAAALoIACADBQAAuAoAIEsAALoKACBMAAC5CgAgB7EFAACCCQAwsgUAAM0IABCzBQAAggkAMLQFAQDqCAAhtwUAAOsIACC4BSAA7AgAIcsFAQDqCAAhAwAAALoIACABAADMCAAwSgAAzQgAIAMAAAC6CAAgAQAAuwgAMAIAALcIACAMsQUAAPwIADCyBQAA0wgAELMFAAD8CAAwtAUBAAAAAbUFAQD9CAAhtgUBAP0IACG3BQAA6wgAILgFIAD-CAAhuQUBAP8IACG6BUAAgAkAIbsFQACBCQAhvAVAAIEJACEBAAAA0AgAIAEAAADQCAAgDLEFAAD8CAAwsgUAANMIABCzBQAA_AgAMLQFAQD9CAAhtQUBAP0IACG2BQEA_QgAIbcFAADrCAAguAUgAP4IACG5BQEA_wgAIboFQACACQAhuwVAAIEJACG8BUAAgQkAIQK5BQAArQoAILoFAACtCgAgAwAAANMIACABAADUCAAwAgAA0AgAIAMAAADTCAAgAQAA1AgAMAIAANAIACADAAAA0wgAIAEAANQIADACAADQCAAgCbQFAQAAAAG1BQEAAAABtgUBAAAAAbcFAAC3CgAguAUgAAAAAbkFAQAAAAG6BUAAAAABuwVAAAAAAbwFQAAAAAEBPgAA2AgAIAm0BQEAAAABtQUBAAAAAbYFAQAAAAG3BQAAtwoAILgFIAAAAAG5BQEAAAABugVAAAAAAbsFQAAAAAG8BUAAAAABAT4AANoIADABPgAA2ggAMAm0BQEAsQoAIbUFAQCxCgAhtgUBALEKACG3BQAAsgoAILgFIACzCgAhuQUBALQKACG6BUAAtQoAIbsFQAC2CgAhvAVAALYKACECAAAA0AgAID4AAN0IACAJtAUBALEKACG1BQEAsQoAIbYFAQCxCgAhtwUAALIKACC4BSAAswoAIbkFAQC0CgAhugVAALUKACG7BUAAtgoAIbwFQAC2CgAhAgAAANMIACA-AADfCAAgAgAAANMIACA-AADfCAAgAwAAANAIACBFAADYCAAgRgAA3QgAIAEAAADQCAAgAQAAANMIACAFBQAArgoAIEsAALAKACBMAACvCgAguQUAAK0KACC6BQAArQoAIAyxBQAA6QgAMLIFAADmCAAQswUAAOkIADC0BQEA6ggAIbUFAQDqCAAhtgUBAOoIACG3BQAA6wgAILgFIADsCAAhuQUBAO0IACG6BUAA7ggAIbsFQADvCAAhvAVAAO8IACEDAAAA0wgAIAEAAOUIADBKAADmCAAgAwAAANMIACABAADUCAAwAgAA0AgAIAyxBQAA6QgAMLIFAADmCAAQswUAAOkIADC0BQEA6ggAIbUFAQDqCAAhtgUBAOoIACG3BQAA6wgAILgFIADsCAAhuQUBAO0IACG6BUAA7ggAIbsFQADvCAAhvAVAAO8IACEOBQAA8QgAIEsAAPsIACBMAAD7CAAgvQUBAAAAAb4FAQAAAAS_BQEAAAAEwAUBAAAAAcEFAQAAAAHCBQEAAAABwwUBAAAAAcQFAQD6CAAhxQUBAAAAAcYFAQAAAAHHBQEAAAABBL0FAQAAAAXIBQEAAAAByQUBAAAABMoFAQAAAAQFBQAA8QgAIEsAAPkIACBMAAD5CAAgvQUgAAAAAcQFIAD4CAAhDgUAAPQIACBLAAD3CAAgTAAA9wgAIL0FAQAAAAG-BQEAAAAFvwUBAAAABcAFAQAAAAHBBQEAAAABwgUBAAAAAcMFAQAAAAHEBQEA9ggAIcUFAQAAAAHGBQEAAAABxwUBAAAAAQsFAAD0CAAgSwAA9QgAIEwAAPUIACC9BUAAAAABvgVAAAAABb8FQAAAAAXABUAAAAABwQVAAAAAAcIFQAAAAAHDBUAAAAABxAVAAPMIACELBQAA8QgAIEsAAPIIACBMAADyCAAgvQVAAAAAAb4FQAAAAAS_BUAAAAAEwAVAAAAAAcEFQAAAAAHCBUAAAAABwwVAAAAAAcQFQADwCAAhCwUAAPEIACBLAADyCAAgTAAA8ggAIL0FQAAAAAG-BUAAAAAEvwVAAAAABMAFQAAAAAHBBUAAAAABwgVAAAAAAcMFQAAAAAHEBUAA8AgAIQi9BQIAAAABvgUCAAAABL8FAgAAAATABQIAAAABwQUCAAAAAcIFAgAAAAHDBQIAAAABxAUCAPEIACEIvQVAAAAAAb4FQAAAAAS_BUAAAAAEwAVAAAAAAcEFQAAAAAHCBUAAAAABwwVAAAAAAcQFQADyCAAhCwUAAPQIACBLAAD1CAAgTAAA9QgAIL0FQAAAAAG-BUAAAAAFvwVAAAAABcAFQAAAAAHBBUAAAAABwgVAAAAAAcMFQAAAAAHEBUAA8wgAIQi9BQIAAAABvgUCAAAABb8FAgAAAAXABQIAAAABwQUCAAAAAcIFAgAAAAHDBQIAAAABxAUCAPQIACEIvQVAAAAAAb4FQAAAAAW_BUAAAAAFwAVAAAAAAcEFQAAAAAHCBUAAAAABwwVAAAAAAcQFQAD1CAAhDgUAAPQIACBLAAD3CAAgTAAA9wgAIL0FAQAAAAG-BQEAAAAFvwUBAAAABcAFAQAAAAHBBQEAAAABwgUBAAAAAcMFAQAAAAHEBQEA9ggAIcUFAQAAAAHGBQEAAAABxwUBAAAAAQu9BQEAAAABvgUBAAAABb8FAQAAAAXABQEAAAABwQUBAAAAAcIFAQAAAAHDBQEAAAABxAUBAPcIACHFBQEAAAABxgUBAAAAAccFAQAAAAEFBQAA8QgAIEsAAPkIACBMAAD5CAAgvQUgAAAAAcQFIAD4CAAhAr0FIAAAAAHEBSAA-QgAIQ4FAADxCAAgSwAA-wgAIEwAAPsIACC9BQEAAAABvgUBAAAABL8FAQAAAATABQEAAAABwQUBAAAAAcIFAQAAAAHDBQEAAAABxAUBAPoIACHFBQEAAAABxgUBAAAAAccFAQAAAAELvQUBAAAAAb4FAQAAAAS_BQEAAAAEwAUBAAAAAcEFAQAAAAHCBQEAAAABwwUBAAAAAcQFAQD7CAAhxQUBAAAAAcYFAQAAAAHHBQEAAAABDLEFAAD8CAAwsgUAANMIABCzBQAA_AgAMLQFAQD9CAAhtQUBAP0IACG2BQEA_QgAIbcFAADrCAAguAUgAP4IACG5BQEA_wgAIboFQACACQAhuwVAAIEJACG8BUAAgQkAIQu9BQEAAAABvgUBAAAABL8FAQAAAATABQEAAAABwQUBAAAAAcIFAQAAAAHDBQEAAAABxAUBAPsIACHFBQEAAAABxgUBAAAAAccFAQAAAAECvQUgAAAAAcQFIAD5CAAhC70FAQAAAAG-BQEAAAAFvwUBAAAABcAFAQAAAAHBBQEAAAABwgUBAAAAAcMFAQAAAAHEBQEA9wgAIcUFAQAAAAHGBQEAAAABxwUBAAAAAQi9BUAAAAABvgVAAAAABb8FQAAAAAXABUAAAAABwQVAAAAAAcIFQAAAAAHDBUAAAAABxAVAAPUIACEIvQVAAAAAAb4FQAAAAAS_BUAAAAAEwAVAAAAAAcEFQAAAAAHCBUAAAAABwwVAAAAAAcQFQADyCAAhB7EFAACCCQAwsgUAAM0IABCzBQAAggkAMLQFAQDqCAAhtwUAAOsIACC4BSAA7AgAIcsFAQDqCAAhB7EFAACDCQAwsgUAALoIABCzBQAAgwkAMLQFAQD9CAAhtwUAAOsIACC4BSAA_ggAIcsFAQD9CAAhC7EFAACECQAwsgUAALQIABCzBQAAhAkAMLQFAQDqCAAhuwVAAO8IACHLBQEA6ggAIcwFAQDqCAAhzQUBAOoIACHOBQIAhQkAIc8FAQDtCAAh0AVAAO4IACENBQAA8QgAIEsAAPEIACBMAADxCAAgnQEAAIcJACCeAQAA8QgAIL0FAgAAAAG-BQIAAAAEvwUCAAAABMAFAgAAAAHBBQIAAAABwgUCAAAAAcMFAgAAAAHEBQIAhgkAIQ0FAADxCAAgSwAA8QgAIEwAAPEIACCdAQAAhwkAIJ4BAADxCAAgvQUCAAAAAb4FAgAAAAS_BQIAAAAEwAUCAAAAAcEFAgAAAAHCBQIAAAABwwUCAAAAAcQFAgCGCQAhCL0FCAAAAAG-BQgAAAAEvwUIAAAABMAFCAAAAAHBBQgAAAABwgUIAAAAAcMFCAAAAAHEBQgAhwkAIQmxBQAAiAkAMLIFAACeCAAQswUAAIgJADC0BQEA6ggAIbkFAQDqCAAh0QUBAOoIACHSBUAA7wgAIdMFAACJCQAg1AVAAO8IACEPBQAA8QgAIEsAAIoJACBMAACKCQAgvQWAAAAAAcAFgAAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAHEBYAAAAAB1QUBAAAAAdYFAQAAAAHXBQEAAAAB2AWAAAAAAdkFgAAAAAHaBYAAAAABDL0FgAAAAAHABYAAAAABwQWAAAAAAcIFgAAAAAHDBYAAAAABxAWAAAAAAdUFAQAAAAHWBQEAAAAB1wUBAAAAAdgFgAAAAAHZBYAAAAAB2gWAAAAAAQ6xBQAAiwkAMLIFAACICAAQswUAAIsJADC0BQEA6ggAIbsFQADvCAAhvAVAAO8IACHbBQEA6ggAIdwFAQDtCAAh3QUBAOoIACHeBQEA6ggAId8FAQDqCAAh4AUBAO0IACHhBQEA7QgAIeIFAQDtCAAhDrEFAACMCQAwsgUAAPUHABCzBQAAjAkAMLQFAQD9CAAhuwVAAIEJACG8BUAAgQkAIdsFAQD9CAAh3AUBAP8IACHdBQEA_QgAId4FAQD9CAAh3wUBAP0IACHgBQEA_wgAIeEFAQD_CAAh4gUBAP8IACEYsQUAAI0JADCyBQAA7wcAELMFAACNCQAwtAUBAOoIACG5BQEA6ggAIbsFQADvCAAh4wUBAOoIACHkBQEA7QgAIeUFAQDqCAAh5gUBAO0IACHnBQEA7QgAIegFAQDtCAAh6QUBAO0IACHqBQIAhQkAIesFEACOCQAh7AUQAI4JACHtBRAAjgkAIe4FAQDtCAAh7wUBAO0IACHwBQEA7QgAIfEFQADvCAAh8gUBAOoIACHzBQEA7QgAIfQFAQDtCAAhDQUAAPEIACBLAACQCQAgTAAAkAkAIJ0BAACQCQAgngEAAJAJACC9BRAAAAABvgUQAAAABL8FEAAAAATABRAAAAABwQUQAAAAAcIFEAAAAAHDBRAAAAABxAUQAI8JACENBQAA8QgAIEsAAJAJACBMAACQCQAgnQEAAJAJACCeAQAAkAkAIL0FEAAAAAG-BRAAAAAEvwUQAAAABMAFEAAAAAHBBRAAAAABwgUQAAAAAcMFEAAAAAHEBRAAjwkAIQi9BRAAAAABvgUQAAAABL8FEAAAAATABRAAAAABwQUQAAAAAcIFEAAAAAHDBRAAAAABxAUQAJAJACERsQUAAJEJADCyBQAA0wcAELMFAACRCQAwtAUBAOoIACG5BQEA6ggAIbsFQADvCAAh0QUBAO0IACHzBQEA7QgAIfQFAQDtCAAh9QUBAOoIACH2BRAAjgkAIfcFAQDtCAAh-AUBAO0IACH5BQEA7QgAIfoFAQDtCAAh-wVAAO8IACH8BQEA7QgAIQaxBQAAkgkAMLIFAAC5BwAQswUAAJIJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEHGQAAlAkAILEFAACTCQAwsgUAAKYHABCzBQAAkwkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIQP_BQAAWQAggAYAAFkAIIEGAABZACALsQUAAJUJADCyBQAAoAcAELMFAACVCQAwtAUBAOoIACH9BQEA6ggAIYIGAQDtCAAhgwYBAO0IACGEBgEA7QgAIYUGAQDtCAAhhgYAAOsIACCHBkAA7ggAIQ4NAACXCQAgEAAAmAkAIBYAAJkJACCxBQAAlgkAMLIFAAAqABCzBQAAlgkAMLQFAQD9CAAh_QUBAP0IACGCBgEA_wgAIYMGAQD_CAAhhAYBAP8IACGFBgEA_wgAIYYGAADrCAAghwZAAIAJACED_wUAABwAIIAGAAAcACCBBgAAHAAgA_8FAAAhACCABgAAIQAggQYAACEAIAP_BQAAJgAggAYAACYAIIEGAAAmACAIsQUAAJoJADCyBQAAiAcAELMFAACaCQAwtAUBAOoIACG7BUAA7wgAIdEFAQDqCAAhiAYBAOoIACGJBgEA6ggAIRGxBQAAmwkAMLIFAADyBgAQswUAAJsJADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHSBUAA7wgAIfAFAQDtCAAh8wUBAO0IACH0BQEA7QgAIYoGAQDqCAAhiwYBAO0IACGMBgEA7QgAIY0GAQDtCAAhjgYBAO0IACGPBgEA7QgAIZAGAACJCQAgErEFAACcCQAwsgUAANwGABCzBQAAnAkAMLQFAQDqCAAhuQUBAOoIACG7BUAA7wgAIdAFQADvCAAh0QUBAO0IACHmBQEA6ggAIe0FEACOCQAh8wUBAO0IACH0BQEA7QgAIfwFAQDtCAAhkQYQAI4JACGSBgEA6ggAIZMGEACOCQAhlAYBAO0IACGVBgEA7QgAIQ-xBQAAnQkAMLIFAADEBgAQswUAAJ0JADC0BQEA6ggAIbsFQADvCAAhzQUBAOoIACHzBQEA7QgAIfQFAQDtCAAhlgYBAOoIACGXBhAAjgkAIZgGEACOCQAhmQYQAI4JACGaBhAAjgkAIZsGAQDtCAAhnAZAAO4IACEMsQUAAJ4JADCyBQAArgYAELMFAACeCQAwtAUBAOoIACG7BUAA7wgAIfMFAQDtCAAh9gUQAI4JACGdBgEA6ggAIZ4GAQDtCAAhnwYBAO0IACGgBkAA7wgAIaEGAQDtCAAhDLEFAACfCQAwsgUAAJYGABCzBQAAnwkAMLQFAQDqCAAhuwVAAO8IACHzBQEA7QgAIfQFAQDtCAAh9gUQAI4JACH4BQEA7QgAIZYGAQDqCAAhoQYBAO0IACGiBkAA7wgAIQyxBQAAoAkAMLIFAACABgAQswUAAKAJADC0BQEA6ggAIbkFAQDqCAAhuwVAAO8IACHRBQEA7QgAIZYGAQDqCAAhowZAAO8IACGkBiAA7AgAIaUGEAChCQAhpgYQAKEJACENBQAA9AgAIEsAAKMJACBMAACjCQAgnQEAAKMJACCeAQAAowkAIL0FEAAAAAG-BRAAAAAFvwUQAAAABcAFEAAAAAHBBRAAAAABwgUQAAAAAcMFEAAAAAHEBRAAogkAIQ0FAAD0CAAgSwAAowkAIEwAAKMJACCdAQAAowkAIJ4BAACjCQAgvQUQAAAAAb4FEAAAAAW_BRAAAAAFwAUQAAAAAcEFEAAAAAHCBRAAAAABwwUQAAAAAcQFEACiCQAhCL0FEAAAAAG-BRAAAAAFvwUQAAAABcAFEAAAAAHBBRAAAAABwgUQAAAAAcMFEAAAAAHEBRAAowkAIQqxBQAApAkAMLIFAADoBQAQswUAAKQJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACGnBgEA7QgAIagGAQDtCAAhqQYBAOoIACGqBhAAjgkAIQaxBQAApQkAMLIFAADSBQAQswUAAKUJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEHJAAApwkAILEFAACmCQAwsgUAAL8FABCzBQAApgkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIQP_BQAAgQEAIIAGAACBAQAggQYAAIEBACAKsQUAAKgJADCyBQAAuQUAELMFAACoCQAwtAUBAOoIACG7BUAA7wgAIegFAQDqCAAh8AUBAO0IACGrBgEA6ggAIawGEAChCQAhrQZAAO8IACELsQUAAKkJADCyBQAAowUAELMFAACpCQAwtAUBAOoIACG5BQEA7QgAIbsFQADvCAAh6AUBAOoIACHzBQEA7QgAIfQFAQDtCAAhrwYAAKoJrwYisAZAAO8IACEHBQAA8QgAIEsAAKwJACBMAACsCQAgvQUAAACvBgK-BQAAAK8GCL8FAAAArwYIxAUAAKsJrwYiBwUAAPEIACBLAACsCQAgTAAArAkAIL0FAAAArwYCvgUAAACvBgi_BQAAAK8GCMQFAACrCa8GIgS9BQAAAK8GAr4FAAAArwYIvwUAAACvBgjEBQAArAmvBiILsQUAAK0JADCyBQAAiwUAELMFAACtCQAwtAUBAOoIACHlBQEA7QgAIbEGAQDqCAAhsgYBAOoIACGzBgEA7QgAIbQGAACqCa8GIrUGAQDtCAAhtgYAAIkJACAKsQUAAK4JADCyBQAA8wQAELMFAACuCQAwtAUBAOoIACG7BUAA7wgAIecFAQDqCAAh8AUBAO0IACGrBgEA6ggAIawGEAChCQAhrQZAAO8IACELsQUAAK8JADCyBQAA3QQAELMFAACvCQAwtAUBAOoIACG5BQEA7QgAIbsFQADvCAAh5wUBAOoIACHzBQEA7QgAIfQFAQDtCAAhrwYAAKoJrwYisAZAAO8IACENsQUAALAJADCyBQAAxQQAELMFAACwCQAwtAUBAOoIACHlBQEA7QgAIf0FAQDqCAAhsgYBAOoIACG0BgAAqgmvBiK1BgEA7QgAIbYGAACJCQAgtwYBAOoIACG4BgEA7QgAIbkGAQDtCAAhBrEFAACxCQAwsgUAAK0EABCzBQAAsQkAMLQFAQDqCAAh_QUBAOoIACH-BSAA7AgAIQcXAACzCQAgsQUAALIJADCyBQAAmgQAELMFAACyCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhA_8FAABBACCABgAAQQAggQYAAEEAIAaxBQAAtAkAMLIFAACUBAAQswUAALQJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEHEQAAtgkAILEFAAC1CQAwsgUAAIEEABCzBQAAtQkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIQP_BQAALAAggAYAACwAIIEGAAAsACANsQUAALcJADCyBQAA-wMAELMFAAC3CQAwtAUBAOoIACG5BQEA6ggAIbsFQADvCAAh8AUBAO0IACHzBQEA7QgAIfQFAQDtCAAhqwYAALgJvAYiugYBAOoIACG8BhAAjgkAIb0GQADvCAAhBwUAAPEIACBLAAC6CQAgTAAAugkAIL0FAAAAvAYCvgUAAAC8Bgi_BQAAALwGCMQFAAC5CbwGIgcFAADxCAAgSwAAugkAIEwAALoJACC9BQAAALwGAr4FAAAAvAYIvwUAAAC8BgjEBQAAuQm8BiIEvQUAAAC8BgK-BQAAALwGCL8FAAAAvAYIxAUAALoJvAYiELEFAAC7CQAwsgUAAOUDABCzBQAAuwkAMLQFAQDqCAAhuQUBAOoIACG7BUAA7wgAIdEFAQDtCAAh8AUBAO0IACHyBQEA6ggAIfMFAQDtCAAh9AUBAO0IACH8BQEA7QgAIboGAQDqCAAhvAYQAI4JACG-BgEA7QgAIb8GQADvCAAhEbEFAAC8CQAwsgUAAM0DABCzBQAAvAkAMLQFAQDqCAAhuwVAAO8IACHpBQEA7QgAIfAFAQDtCAAh8wUBAO0IACH0BQEA7QgAIasGAAC9CcEGIrAGQADvCAAhugYBAOoIACHBBgEA7QgAIcIGAQDqCAAhwwYQAI4JACHEBhAAoQkAIcUGAQDtCAAhBwUAAPEIACBLAAC_CQAgTAAAvwkAIL0FAAAAwQYCvgUAAADBBgi_BQAAAMEGCMQFAAC-CcEGIgcFAADxCAAgSwAAvwkAIEwAAL8JACC9BQAAAMEGAr4FAAAAwQYIvwUAAADBBgjEBQAAvgnBBiIEvQUAAADBBgK-BQAAAMEGCL8FAAAAwQYIxAUAAL8JwQYiFrEFAADACQAwsgUAALUDABCzBQAAwAkAMLQFAQDqCAAhuQUBAO0IACG7BUAA7wgAIeYFAQDqCAAh6QUBAO0IACHtBRAAoQkAIe8FAQDtCAAh8AUBAO0IACHzBQEA7QgAIfQFAQDtCAAhlAYBAO0IACGVBgEA7QgAIboGAQDqCAAhvAYQAI4JACHHBgAAwQnHBiLIBhAAoQkAIckGAQDtCAAhygYBAO0IACHLBkAA7wgAIQcFAADxCAAgSwAAwwkAIEwAAMMJACC9BQAAAMcGAr4FAAAAxwYIvwUAAADHBgjEBQAAwgnHBiIHBQAA8QgAIEsAAMMJACBMAADDCQAgvQUAAADHBgK-BQAAAMcGCL8FAAAAxwYIxAUAAMIJxwYiBL0FAAAAxwYCvgUAAADHBgi_BQAAAMcGCMQFAADDCccGIgexBQAAxAkAMLIFAACdAwAQswUAAMQJADC5BQEA6ggAIbwFQADvCAAhugYBAOoIACG8BhAAjgkAIQaxBQAAxQkAMLIFAACHAwAQswUAAMUJADC8BUAA7wgAIboGAQDqCAAhvAYQAI4JACEGsQUAAMYJADCyBQAA8QIAELMFAADGCQAwtAUBAOoIACHMBgEA6ggAIc0GAQDqCAAhCrEFAADHCQAwsgUAANsCABCzBQAAxwkAMLQFAQDqCAAh9QUBAOoIACH9BQEA6ggAIf4FIADsCAAhtgYAAIkJACDOBgEA6ggAIc8GEAChCQAhBrEFAADICQAwsgUAAMUCABCzBQAAyAkAMLQFAQDqCAAh_QUBAOoIACH-BSAA7AgAIQcEAADKCQAgsQUAAMkJADCyBQAAsgIAELMFAADJCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAhA_8FAAALACCABgAACwAggQYAAAsAIAaxBQAAywkAMLIFAACsAgAQswUAAMsJADC0BQEA6ggAIf0FAQDqCAAh_gUgAOwIACEHBAAAygkAILEFAADMCQAwsgUAAJkCABCzBQAAzAkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIQyxBQAAzQkAMLIFAACTAgAQswUAAM0JADC0BQEA6ggAIbsFQADvCAAhvAVAAO8IACHNBQAAzgnSBiL3BQEA7QgAIf0FAQDqCAAhhwZAAO4IACHQBgEA6ggAIdIGAQDtCAAhBwUAAPEIACBLAADQCQAgTAAA0AkAIL0FAAAA0gYCvgUAAADSBgi_BQAAANIGCMQFAADPCdIGIgcFAADxCAAgSwAA0AkAIEwAANAJACC9BQAAANIGAr4FAAAA0gYIvwUAAADSBgjEBQAAzwnSBiIEvQUAAADSBgK-BQAAANIGCL8FAAAA0gYIxAUAANAJ0gYiHAwAANMJACANAACXCQAgEAAAmAkAIBYAAJkJACAZAACUCQAgHgAA1QkAIB8AANYJACAgAADUCQAgIQAA1AkAICIAANcJACAjAADYCQAgJgAA2QkAIC4AANoJACAvAAC2CQAgMAAAswkAIDMAANsJACCxBQAA0QkAMLIFAAAyABCzBQAA0QkAMLQFAQD9CAAhuwVAAIEJACG8BUAAgQkAIc0FAADSCdIGIvcFAQD_CAAh_QUBAP0IACGHBkAAgAkAIdAGAQD9CAAh0gYBAP8IACEEvQUAAADSBgK-BQAAANIGCL8FAAAA0gYIxAUAANAJ0gYiA_8FAAAHACCABgAABwAggQYAAAcAIAP_BQAAYgAggAYAAGIAIIEGAABiACAD_wUAAGcAIIAGAABnACCBBgAAZwAgA_8FAABsACCABgAAbAAggQYAAGwAIAP_BQAANAAggAYAADQAIIEGAAA0ACAD_wUAAEgAIIAGAABIACCBBgAASAAgA_8FAAB9ACCABgAAfQAggQYAAH0AIAP_BQAAAwAggAYAAAMAIIEGAAADACAD_wUAAKABACCABgAAoAEAIIEGAACgAQAgDLEFAADcCQAwsgUAAPsBABCzBQAA3AkAMLQFAQDqCAAhuQUBAO0IACHTBkAA7wgAIdQGAQDqCAAh1QYBAOoIACHWBgEA6ggAIdcGAQDqCAAh2AYBAO0IACHZBgEA7QgAIQqxBQAA3QkAMLIFAADlAQAQswUAAN0JADC0BQEA6ggAIbsFQADvCAAhvAVAAO8IACH9BQEA6ggAIYQGAQDqCAAh2gYBAOoIACHcBgAA3gncBiIHBQAA8QgAIEsAAOAJACBMAADgCQAgvQUAAADcBgK-BQAAANwGCL8FAAAA3AYIxAUAAN8J3AYiBwUAAPEIACBLAADgCQAgTAAA4AkAIL0FAAAA3AYCvgUAAADcBgi_BQAAANwGCMQFAADfCdwGIgS9BQAAANwGAr4FAAAA3AYIvwUAAADcBgjEBQAA4AncBiINLgAA2gkAIDYAAOMJACA4AADkCQAgsQUAAOEJADCyBQAA0gEAELMFAADhCQAwtAUBAP0IACG7BUAAgQkAIbwFQACBCQAh_QUBAP0IACGEBgEA_QgAIdoGAQD9CAAh3AYAAOIJ3AYiBL0FAAAA3AYCvgUAAADcBgi_BQAAANwGCMQFAADgCdwGIgP_BQAAvAEAIIAGAAC8AQAggQYAALwBACAD_wUAAMoBACCABgAAygEAIIEGAADKAQAgDTcAAOYJACCxBQAA5QkAMLIFAADKAQAQswUAAOUJADC0BQEA_QgAIbkFAQD_CAAh0wZAAIEJACHUBgEA_QgAIdUGAQD9CAAh1gYBAP0IACHXBgEA_QgAIdgGAQD_CAAh2QYBAP8IACEPLgAA2gkAIDYAAOMJACA4AADkCQAgsQUAAOEJADCyBQAA0gEAELMFAADhCQAwtAUBAP0IACG7BUAAgQkAIbwFQACBCQAh_QUBAP0IACGEBgEA_QgAIdoGAQD9CAAh3AYAAOIJ3AYi4gYAANIBACDjBgAA0gEAIAoPAADoCQAgNQAA5gkAILEFAADnCQAwsgUAALwBABCzBQAA5wkAMLQFAQD9CAAhuwVAAIEJACHRBQEA_QgAIYgGAQD9CAAhiQYBAP0IACEbAwAA8AkAIBAAAJgJACAZAACUCQAgHgAA1QkAICYAANkJACAzAADbCQAgNAAA5gkAIDYAAOMJACCxBQAArAoAMLIFAAADABCzBQAArAoAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIdIFQACBCQAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhigYBAP0IACGLBgEA_wgAIYwGAQD_CAAhjQYBAP8IACGOBgEA_wgAIY8GAQD_CAAhkAYAAO8JACDiBgAAAwAg4wYAAAMAIALLBQEAAAABzAUBAAAAAQwxAADsCQAgsQUAAOoJADCyBQAApAEAELMFAADqCQAwtAUBAP0IACG7BUAAgQkAIcsFAQD9CAAhzAUBAP0IACHNBQEA_QgAIc4FAgDrCQAhzwUBAP8IACHQBUAAgAkAIQi9BQIAAAABvgUCAAAABL8FAgAAAATABQIAAAABwQUCAAAAAcIFAgAAAAHDBQIAAAABxAUCAPEIACEOAwAA8AkAIA8AAOgJACAyAADxCQAgsQUAAO4JADCyBQAAoAEAELMFAADuCQAwtAUBAP0IACG5BQEA_QgAIdEFAQD9CAAh0gVAAIEJACHTBQAA7wkAINQFQACBCQAh4gYAAKABACDjBgAAoAEAIAK5BQEAAAAB0gVAAAAAAQwDAADwCQAgDwAA6AkAIDIAAPEJACCxBQAA7gkAMLIFAACgAQAQswUAAO4JADC0BQEA_QgAIbkFAQD9CAAh0QUBAP0IACHSBUAAgQkAIdMFAADvCQAg1AVAAIEJACEMvQWAAAAAAcAFgAAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAHEBYAAAAAB1QUBAAAAAdYFAQAAAAHXBQEAAAAB2AWAAAAAAdkFgAAAAAHaBYAAAAABHgwAANMJACANAACXCQAgEAAAmAkAIBYAAJkJACAZAACUCQAgHgAA1QkAIB8AANYJACAgAADUCQAgIQAA1AkAICIAANcJACAjAADYCQAgJgAA2QkAIC4AANoJACAvAAC2CQAgMAAAswkAIDMAANsJACCxBQAA0QkAMLIFAAAyABCzBQAA0QkAMLQFAQD9CAAhuwVAAIEJACG8BUAAgQkAIc0FAADSCdIGIvcFAQD_CAAh_QUBAP0IACGHBkAAgAkAIdAGAQD9CAAh0gYBAP8IACHiBgAAMgAg4wYAADIAIAP_BQAApAEAIIAGAACkAQAggQYAAKQBACARJwAA9AkAICkAAPUJACCxBQAA8gkAMLIFAACPAQAQswUAAPIJADC0BQEA_QgAIbsFQACBCQAhzQUBAP0IACHzBQEA_wgAIfQFAQD_CAAhlgYBAP0IACGXBhAA8wkAIZgGEADzCQAhmQYQAPMJACGaBhAA8wkAIZsGAQD_CAAhnAZAAIAJACEIvQUQAAAAAb4FEAAAAAS_BRAAAAAEwAUQAAAAAcEFEAAAAAHCBRAAAAABwwUQAAAAAcQFEACQCQAhECUAAPsJACAmAADZCQAgLAAA_AkAIC0AAP0JACCxBQAA-gkAMLIFAACBAQAQswUAAPoJADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACGnBgEA_wgAIagGAQD_CAAhqQYBAP0IACGqBhAA8wkAIeIGAACBAQAg4wYAAIEBACAD_wUAAIsBACCABgAAiwEAIIEGAACLAQAgDigAAPcJACAqAAD4CQAgsQUAAPYJADCyBQAAiwEAELMFAAD2CQAwtAUBAP0IACG7BUAAgQkAIfMFAQD_CAAh9gUQAPMJACGdBgEA_QgAIZ4GAQD_CAAhnwYBAP8IACGgBkAAgQkAIaEGAQD_CAAhECcAAPQJACArAAD1CQAgsQUAAPkJADCyBQAAhwEAELMFAAD5CQAwtAUBAP0IACG7BUAAgQkAIfMFAQD_CAAh9AUBAP8IACH2BRAA8wkAIfgFAQD_CAAhlgYBAP0IACGhBgEA_wgAIaIGQACBCQAh4gYAAIcBACDjBgAAhwEAIBMnAAD0CQAgKQAA9QkAILEFAADyCQAwsgUAAI8BABCzBQAA8gkAMLQFAQD9CAAhuwVAAIEJACHNBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGWBgEA_QgAIZcGEADzCQAhmAYQAPMJACGZBhAA8wkAIZoGEADzCQAhmwYBAP8IACGcBkAAgAkAIeIGAACPAQAg4wYAAI8BACAOJwAA9AkAICsAAPUJACCxBQAA-QkAMLIFAACHAQAQswUAAPkJADC0BQEA_QgAIbsFQACBCQAh8wUBAP8IACH0BQEA_wgAIfYFEADzCQAh-AUBAP8IACGWBgEA_QgAIaEGAQD_CAAhogZAAIEJACEOJQAA-wkAICYAANkJACAsAAD8CQAgLQAA_QkAILEFAAD6CQAwsgUAAIEBABCzBQAA-gkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIacGAQD_CAAhqAYBAP8IACGpBgEA_QgAIaoGEADzCQAhCSQAAKcJACCxBQAApgkAMLIFAAC_BQAQswUAAKYJADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACHiBgAAvwUAIOMGAAC_BQAgA_8FAACHAQAggAYAAIcBACCBBgAAhwEAIAP_BQAAjwEAIIAGAACPAQAggQYAAI8BACAPAwAA8AkAIA8AAIAKACAnAAD0CQAgsQUAAP4JADCyBQAAfQAQswUAAP4JADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIZYGAQD9CAAhowZAAIEJACGkBiAA_ggAIaUGEAD_CQAhpgYQAP8JACEIvQUQAAAAAb4FEAAAAAW_BRAAAAAFwAUQAAAAAcEFEAAAAAHCBRAAAAABwwUQAAAAAcQFEACjCQAhGwMAAPAJACAQAACYCQAgGQAAlAkAIB4AANUJACAmAADZCQAgMwAA2wkAIDQAAOYJACA2AADjCQAgsQUAAKwKADCyBQAAAwAQswUAAKwKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHSBUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIYoGAQD9CAAhiwYBAP8IACGMBgEA_wgAIY0GAQD_CAAhjgYBAP8IACGPBgEA_wgAIZAGAADvCQAg4gYAAAMAIOMGAAADACAPAwAA8AkAIAoAAIMKACCxBQAAgQoAMLIFAABsABCzBQAAgQoAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACCCrwGIroGAQD9CAAhvAYQAPMJACG9BkAAgQkAIQS9BQAAALwGAr4FAAAAvAYIvwUAAAC8BgjEBQAAugm8BiIPCQAAowoAIAsAAKQKACAMAADTCQAgDQAAlwkAIB0AANQJACAeAADVCQAgHwAA1gkAILEFAACiCgAwsgUAABIAELMFAACiCgAwtAUBAP0IACHMBgEA_QgAIc0GAQD9CAAh4gYAABIAIOMGAAASACATAwAA8AkAIAoAAIMKACAPAACACgAgsQUAAIQKADCyBQAAZwAQswUAAIQKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIfAFAQD_CAAh8gUBAP0IACHzBQEA_wgAIfQFAQD_CAAh_AUBAP8IACG6BgEA_QgAIbwGEADzCQAhvgYBAP8IACG_BkAAgQkAIRQKAACDCgAgGwAAhwoAIBwAAPAJACCxBQAAhQoAMLIFAABiABCzBQAAhQoAMLQFAQD9CAAhuwVAAIEJACHpBQEA_wgAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACGCsEGIrAGQACBCQAhugYBAP0IACHBBgEA_wgAIcIGAQD9CAAhwwYQAPMJACHEBhAA_wkAIcUGAQD_CAAhBL0FAAAAwQYCvgUAAADBBgi_BQAAAMEGCMQFAAC_CcEGIh4MAADTCQAgDQAAlwkAIBAAAJgJACAWAACZCQAgGQAAlAkAIB4AANUJACAfAADWCQAgIAAA1AkAICEAANQJACAiAADXCQAgIwAA2AkAICYAANkJACAuAADaCQAgLwAAtgkAIDAAALMJACAzAADbCQAgsQUAANEJADCyBQAAMgAQswUAANEJADC0BQEA_QgAIbsFQACBCQAhvAVAAIEJACHNBQAA0gnSBiL3BQEA_wgAIf0FAQD9CAAhhwZAAIAJACHQBgEA_QgAIdIGAQD_CAAh4gYAADIAIOMGAAAyACAVAwAA8AkAIAYAAIkKACAPAACACgAgGgAAigoAILEFAACICgAwsgUAAFkAELMFAACICgAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHzBQEA_wgAIfQFAQD_CAAh9QUBAP0IACH2BRAA8wkAIfcFAQD_CAAh-AUBAP8IACH5BQEA_wgAIfoFAQD_CAAh-wVAAIEJACH8BQEA_wgAIQkZAACUCQAgsQUAAJMJADCyBQAApgcAELMFAACTCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAh4gYAAKYHACDjBgAApgcAIBwDAACHCgAgCgAAgwoAIA4AAJ0KACAZAACUCQAgsQUAAJ4KADCyBQAAHAAQswUAAJ4KADC0BQEA_QgAIbkFAQD_CAAhuwVAAIEJACHmBQEA_QgAIekFAQD_CAAh7QUQAP8JACHvBQEA_wgAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIZQGAQD_CAAhlQYBAP8IACG6BgEA_QgAIbwGEADzCQAhxwYAAJ8KxwYiyAYQAP8JACHJBgEA_wgAIcoGAQD_CAAhywZAAIEJACHiBgAAHAAg4wYAABwAIAsYAACMCgAgsQUAAIsKADCyBQAATQAQswUAAIsKADC0BQEA_QgAIbsFQACBCQAh6AUBAP0IACHwBQEA_wgAIasGAQD9CAAhrAYQAP8JACGtBkAAgQkAIRISAACQCgAgEwAAhwoAIBQAANgJACAVAACRCgAgFgAAmQkAILEFAACPCgAwsgUAAEEAELMFAACPCgAwtAUBAP0IACHlBQEA_wgAIbEGAQD9CAAhsgYBAP0IACGzBgEA_wgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACDiBgAAQQAg4wYAAEEAIA0DAACHCgAgGAAAjAoAILEFAACNCgAwsgUAAEgAELMFAACNCgAwtAUBAP0IACG5BQEA_wgAIbsFQACBCQAh6AUBAP0IACHzBQEA_wgAIfQFAQD_CAAhrwYAAI4KrwYisAZAAIEJACEEvQUAAACvBgK-BQAAAK8GCL8FAAAArwYIxAUAAKwJrwYiEBIAAJAKACATAACHCgAgFAAA2AkAIBUAAJEKACAWAACZCQAgsQUAAI8KADCyBQAAQQAQswUAAI8KADC0BQEA_QgAIeUFAQD_CAAhsQYBAP0IACGyBgEA_QgAIbMGAQD_CAAhtAYAAI4KrwYitQYBAP8IACG2BgAA7wkAIAkXAACzCQAgsQUAALIJADCyBQAAmgQAELMFAACyCQAwtAUBAP0IACH9BQEA_QgAIf4FIAD-CAAh4gYAAJoEACDjBgAAmgQAIAP_BQAATQAggAYAAE0AIIEGAABNACALEQAAkwoAILEFAACSCgAwsgUAADkAELMFAACSCgAwtAUBAP0IACG7BUAAgQkAIecFAQD9CAAh8AUBAP8IACGrBgEA_QgAIawGEAD_CQAhrQZAAIEJACEUEgAAlgoAIBMAAIcKACAUAADXCQAgFQAAlwoAIBYAAJkJACCxBQAAlQoAMLIFAAAsABCzBQAAlQoAMLQFAQD9CAAh5QUBAP8IACH9BQEA_QgAIbIGAQD9CAAhtAYAAI4KrwYitQYBAP8IACG2BgAA7wkAILcGAQD9CAAhuAYBAP8IACG5BgEA_wgAIeIGAAAsACDjBgAALAAgDQMAAIcKACARAACTCgAgsQUAAJQKADCyBQAANAAQswUAAJQKADC0BQEA_QgAIbkFAQD_CAAhuwVAAIEJACHnBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGvBgAAjgqvBiKwBkAAgQkAIRISAACWCgAgEwAAhwoAIBQAANcJACAVAACXCgAgFgAAmQkAILEFAACVCgAwsgUAACwAELMFAACVCgAwtAUBAP0IACHlBQEA_wgAIf0FAQD9CAAhsgYBAP0IACG0BgAAjgqvBiK1BgEA_wgAIbYGAADvCQAgtwYBAP0IACG4BgEA_wgAIbkGAQD_CAAhCREAALYJACCxBQAAtQkAMLIFAACBBAAQswUAALUJADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACHiBgAAgQQAIOMGAACBBAAgA_8FAAA5ACCABgAAOQAggQYAADkAIBwDAADwCQAgDgAAmQoAIBEAAJoKACAYAACbCgAgsQUAAJgKADCyBQAAJgAQswUAAJgKADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHjBQEA_QgAIeQFAQD_CAAh5QUBAP0IACHmBQEA_wgAIecFAQD_CAAh6AUBAP8IACHpBQEA_wgAIeoFAgDrCQAh6wUQAPMJACHsBRAA8wkAIe0FEADzCQAh7gUBAP8IACHvBQEA_wgAIfAFAQD_CAAh8QVAAIEJACHyBQEA_QgAIfMFAQD_CAAh9AUBAP8IACEQDQAAlwkAIBAAAJgJACAWAACZCQAgsQUAAJYJADCyBQAAKgAQswUAAJYJADC0BQEA_QgAIf0FAQD9CAAhggYBAP8IACGDBgEA_wgAIYQGAQD_CAAhhQYBAP8IACGGBgAA6wgAIIcGQACACQAh4gYAACoAIOMGAAAqACAUEgAAlgoAIBMAAIcKACAUAADXCQAgFQAAlwoAIBYAAJkJACCxBQAAlQoAMLIFAAAsABCzBQAAlQoAMLQFAQD9CAAh5QUBAP8IACH9BQEA_QgAIbIGAQD9CAAhtAYAAI4KrwYitQYBAP8IACG2BgAA7wkAILcGAQD9CAAhuAYBAP8IACG5BgEA_wgAIeIGAAAsACDjBgAALAAgEhIAAJAKACATAACHCgAgFAAA2AkAIBUAAJEKACAWAACZCQAgsQUAAI8KADCyBQAAQQAQswUAAI8KADC0BQEA_QgAIeUFAQD_CAAhsQYBAP0IACGyBgEA_QgAIbMGAQD_CAAhtAYAAI4KrwYitQYBAP8IACG2BgAA7wkAIOIGAABBACDjBgAAQQAgFQMAAPAJACAOAACdCgAgDwAAgAoAILEFAACcCgAwsgUAACEAELMFAACcCgAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0AVAAIEJACHRBQEA_wgAIeYFAQD9CAAh7QUQAPMJACHzBQEA_wgAIfQFAQD_CAAh_AUBAP8IACGRBhAA8wkAIZIGAQD9CAAhkwYQAPMJACGUBgEA_wgAIZUGAQD_CAAhEA0AAJcJACAQAACYCQAgFgAAmQkAILEFAACWCQAwsgUAACoAELMFAACWCQAwtAUBAP0IACH9BQEA_QgAIYIGAQD_CAAhgwYBAP8IACGEBgEA_wgAIYUGAQD_CAAhhgYAAOsIACCHBkAAgAkAIeIGAAAqACDjBgAAKgAgGgMAAIcKACAKAACDCgAgDgAAnQoAIBkAAJQJACCxBQAAngoAMLIFAAAcABCzBQAAngoAMLQFAQD9CAAhuQUBAP8IACG7BUAAgQkAIeYFAQD9CAAh6QUBAP8IACHtBRAA_wkAIe8FAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhlAYBAP8IACGVBgEA_wgAIboGAQD9CAAhvAYQAPMJACHHBgAAnwrHBiLIBhAA_wkAIckGAQD_CAAhygYBAP8IACHLBkAAgQkAIQS9BQAAAMcGAr4FAAAAxwYIvwUAAADHBgjEBQAAwwnHBiIHCgAAgwoAILEFAACgCgAwsgUAABcAELMFAACgCgAwvAVAAIEJACG6BgEA_QgAIbwGEADzCQAhAswGAQAAAAHNBgEAAAABDQkAAKMKACALAACkCgAgDAAA0wkAIA0AAJcJACAdAADUCQAgHgAA1QkAIB8AANYJACCxBQAAogoAMLIFAAASABCzBQAAogoAMLQFAQD9CAAhzAYBAP0IACHNBgEA_QgAIQ8GAACnCgAgBwAAqAoAIAgAAKkKACCxBQAApgoAMLIFAAALABCzBQAApgoAMLQFAQD9CAAh9QUBAP0IACH9BQEA_QgAIf4FIAD-CAAhtgYAAO8JACDOBgEA_QgAIc8GEAD_CQAh4gYAAAsAIOMGAAALACAD_wUAABcAIIAGAAAXACCBBgAAFwAgAvUFAQAAAAH9BQEAAAABDQYAAKcKACAHAACoCgAgCAAAqQoAILEFAACmCgAwsgUAAAsAELMFAACmCgAwtAUBAP0IACH1BQEA_QgAIf0FAQD9CAAh_gUgAP4IACG2BgAA7wkAIM4GAQD9CAAhzwYQAP8JACEJBAAAygkAILEFAADMCQAwsgUAAJkCABCzBQAAzAkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIeIGAACZAgAg4wYAAJkCACAJBAAAygkAILEFAADJCQAwsgUAALICABCzBQAAyQkAMLQFAQD9CAAh_QUBAP0IACH-BSAA_ggAIeIGAACyAgAg4wYAALICACAD_wUAABIAIIAGAAASACCBBgAAEgAgArkFAQAAAAG6BgEAAAABCQMAAPAJACAKAACDCgAgsQUAAKsKADCyBQAABwAQswUAAKsKADC5BQEA_QgAIbwFQACBCQAhugYBAP0IACG8BhAA8wkAIRkDAADwCQAgEAAAmAkAIBkAAJQJACAeAADVCQAgJgAA2QkAIDMAANsJACA0AADmCQAgNgAA4wkAILEFAACsCgAwsgUAAAMAELMFAACsCgAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0gVAAIEJACHwBQEA_wgAIfMFAQD_CAAh9AUBAP8IACGKBgEA_QgAIYsGAQD_CAAhjAYBAP8IACGNBgEA_wgAIY4GAQD_CAAhjwYBAP8IACGQBgAA7wkAIAAAAAAB5wYBAAAAAQLnBgEAAAAE8QYBAAAABQHnBiAAAAABAecGAQAAAAEB5wZAAAAAAQHnBkAAAAABAecGAQAAAAQAAAAC5wYBAAAABPEGAQAAAAUB5wYBAAAABAAAAAAABecGAgAAAAHtBgIAAAAB7gYCAAAAAe8GAgAAAAHwBgIAAAABBUUAANcUACBGAADaFAAg5AYAANgUACDlBgAA2RQAIOoGAACiAQAgA0UAANcUACDkBgAA2BQAIOoGAACiAQAgAAAABUUAAM4UACBGAADVFAAg5AYAAM8UACDlBgAA1BQAIOoGAAD-AQAgBUUAAMwUACBGAADSFAAg5AYAAM0UACDlBgAA0RQAIOoGAAAFACALRQAAywoAMEYAANAKADDkBgAAzAoAMOUGAADNCgAw5gYAAM4KACDnBgAAzwoAMOgGAADPCgAw6QYAAM8KADDqBgAAzwoAMOsGAADRCgAw7AYAANIKADAHtAUBAAAAAbsFQAAAAAHLBQEAAAABzQUBAAAAAc4FAgAAAAHPBQEAAAAB0AVAAAAAAQIAAACmAQAgRQAA1goAIAMAAACmAQAgRQAA1goAIEYAANUKACABPgAA0BQAMA0xAADsCQAgsQUAAOoJADCyBQAApAEAELMFAADqCQAwtAUBAAAAAbsFQACBCQAhywUBAP0IACHMBQEA_QgAIc0FAQD9CAAhzgUCAOsJACHPBQEA_wgAIdAFQACACQAh3QYAAOkJACACAAAApgEAID4AANUKACACAAAA0woAID4AANQKACALsQUAANIKADCyBQAA0woAELMFAADSCgAwtAUBAP0IACG7BUAAgQkAIcsFAQD9CAAhzAUBAP0IACHNBQEA_QgAIc4FAgDrCQAhzwUBAP8IACHQBUAAgAkAIQuxBQAA0goAMLIFAADTCgAQswUAANIKADC0BQEA_QgAIbsFQACBCQAhywUBAP0IACHMBQEA_QgAIc0FAQD9CAAhzgUCAOsJACHPBQEA_wgAIdAFQACACQAhB7QFAQCxCgAhuwVAALYKACHLBQEAsQoAIc0FAQCxCgAhzgUCAMIKACHPBQEAtAoAIdAFQAC1CgAhB7QFAQCxCgAhuwVAALYKACHLBQEAsQoAIc0FAQCxCgAhzgUCAMIKACHPBQEAtAoAIdAFQAC1CgAhB7QFAQAAAAG7BUAAAAABywUBAAAAAc0FAQAAAAHOBQIAAAABzwUBAAAAAdAFQAAAAAEDRQAAzhQAIOQGAADPFAAg6gYAAP4BACADRQAAzBQAIOQGAADNFAAg6gYAAAUAIARFAADLCgAw5AYAAMwKADDmBgAAzgoAIOoGAADPCgAwAAAAAAAAAAAF5wYQAAAAAe0GEAAAAAHuBhAAAAAB7wYQAAAAAfAGEAAAAAEFRQAAvhQAIEYAAMoUACDkBgAAvxQAIOUGAADJFAAg6gYAAP4BACAHRQAAvBQAIEYAAMcUACDkBgAAvRQAIOUGAADGFAAg6AYAACoAIOkGAAAqACDqBgAAiwcAIAdFAAC6FAAgRgAAxBQAIOQGAAC7FAAg5QYAAMMUACDoBgAALAAg6QYAACwAIOoGAAAvACAHRQAAuBQAIEYAAMEUACDkBgAAuRQAIOUGAADAFAAg6AYAAEEAIOkGAABBACDqBgAARAAgA0UAAL4UACDkBgAAvxQAIOoGAAD-AQAgA0UAALwUACDkBgAAvRQAIOoGAACLBwAgA0UAALoUACDkBgAAuxQAIOoGAAAvACADRQAAuBQAIOQGAAC5FAAg6gYAAEQAIAAAAAAABUUAAKoUACBGAAC2FAAg5AYAAKsUACDlBgAAtRQAIOoGAAD-AQAgBUUAAKgUACBGAACzFAAg5AYAAKkUACDlBgAAshQAIOoGAACjBwAgB0UAAKYUACBGAACwFAAg5AYAAKcUACDlBgAArxQAIOgGAAAcACDpBgAAHAAg6gYAAB4AIAdFAACkFAAgRgAArRQAIOQGAAClFAAg5QYAAKwUACDoBgAAAwAg6QYAAAMAIOoGAAAFACADRQAAqhQAIOQGAACrFAAg6gYAAP4BACADRQAAqBQAIOQGAACpFAAg6gYAAKMHACADRQAAphQAIOQGAACnFAAg6gYAAB4AIANFAACkFAAg5AYAAKUUACDqBgAABQAgAAAAC0UAAPwKADBGAACBCwAw5AYAAP0KADDlBgAA_goAMOYGAAD_CgAg5wYAAIALADDoBgAAgAsAMOkGAACACwAw6gYAAIALADDrBgAAggsAMOwGAACDCwAwEAMAAPQKACAPAAD3CgAgGgAA9goAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAECAAAAWwAgRQAAhwsAIAMAAABbACBFAACHCwAgRgAAhgsAIAE-AACjFAAwFQMAAPAJACAGAACJCgAgDwAAgAoAIBoAAIoKACCxBQAAiAoAMLIFAABZABCzBQAAiAoAMLQFAQAAAAG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHzBQEA_wgAIfQFAQD_CAAh9QUBAP0IACH2BRAA8wkAIfcFAQD_CAAh-AUBAP8IACH5BQEA_wgAIfoFAQD_CAAh-wVAAIEJACH8BQEAAAABAgAAAFsAID4AAIYLACACAAAAhAsAID4AAIULACARsQUAAIMLADCyBQAAhAsAELMFAACDCwAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHzBQEA_wgAIfQFAQD_CAAh9QUBAP0IACH2BRAA8wkAIfcFAQD_CAAh-AUBAP8IACH5BQEA_wgAIfoFAQD_CAAh-wVAAIEJACH8BQEA_wgAIRGxBQAAgwsAMLIFAACECwAQswUAAIMLADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIfMFAQD_CAAh9AUBAP8IACH1BQEA_QgAIfYFEADzCQAh9wUBAP8IACH4BQEA_wgAIfkFAQD_CAAh-gUBAP8IACH7BUAAgQkAIfwFAQD_CAAhDbQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAh8wUBALQKACH0BQEAtAoAIfYFEADiCgAh9wUBALQKACH4BQEAtAoAIfkFAQC0CgAh-gUBALQKACH7BUAAtgoAIfwFAQC0CgAhEAMAAPAKACAPAADzCgAgGgAA8goAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdEFAQC0CgAh8wUBALQKACH0BQEAtAoAIfYFEADiCgAh9wUBALQKACH4BQEAtAoAIfkFAQC0CgAh-gUBALQKACH7BUAAtgoAIfwFAQC0CgAhEAMAAPQKACAPAAD3CgAgGgAA9goAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAEERQAA_AoAMOQGAAD9CgAw5gYAAP8KACDqBgAAgAsAMAAAAAAC5wYBAAAABPEGAQAAAAULRQAArQsAMEYAALILADDkBgAArgsAMOUGAACvCwAw5gYAALALACDnBgAAsQsAMOgGAACxCwAw6QYAALELADDqBgAAsQsAMOsGAACzCwAw7AYAALQLADALRQAAnQsAMEYAAKILADDkBgAAngsAMOUGAACfCwAw5gYAAKALACDnBgAAoQsAMOgGAAChCwAw6QYAAKELADDqBgAAoQsAMOsGAACjCwAw7AYAAKQLADALRQAAkQsAMEYAAJYLADDkBgAAkgsAMOUGAACTCwAw5gYAAJQLACDnBgAAlQsAMOgGAACVCwAw6QYAAJULADDqBgAAlQsAMOsGAACXCwAw7AYAAJgLADAXAwAA5woAIBEAAOkKACAYAADqCgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB4wUBAAAAAeQFAQAAAAHlBQEAAAAB5wUBAAAAAegFAQAAAAHpBQEAAAAB6gUCAAAAAesFEAAAAAHsBRAAAAAB7QUQAAAAAe4FAQAAAAHvBQEAAAAB8AUBAAAAAfEFQAAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAECAAAAKAAgRQAAnAsAIAMAAAAoACBFAACcCwAgRgAAmwsAIAE-AACiFAAwHAMAAPAJACAOAACZCgAgEQAAmgoAIBgAAJsKACCxBQAAmAoAMLIFAAAmABCzBQAAmAoAMLQFAQAAAAG5BQEA_QgAIbsFQACBCQAh4wUBAP0IACHkBQEA_wgAIeUFAQD9CAAh5gUBAP8IACHnBQEA_wgAIegFAQD_CAAh6QUBAP8IACHqBQIA6wkAIesFEADzCQAh7AUQAPMJACHtBRAA8wkAIe4FAQD_CAAh7wUBAP8IACHwBQEA_wgAIfEFQACBCQAh8gUBAP0IACHzBQEA_wgAIfQFAQD_CAAhAgAAACgAID4AAJsLACACAAAAmQsAID4AAJoLACAYsQUAAJgLADCyBQAAmQsAELMFAACYCwAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh4wUBAP0IACHkBQEA_wgAIeUFAQD9CAAh5gUBAP8IACHnBQEA_wgAIegFAQD_CAAh6QUBAP8IACHqBQIA6wkAIesFEADzCQAh7AUQAPMJACHtBRAA8wkAIe4FAQD_CAAh7wUBAP8IACHwBQEA_wgAIfEFQACBCQAh8gUBAP0IACHzBQEA_wgAIfQFAQD_CAAhGLEFAACYCwAwsgUAAJkLABCzBQAAmAsAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIeMFAQD9CAAh5AUBAP8IACHlBQEA_QgAIeYFAQD_CAAh5wUBAP8IACHoBQEA_wgAIekFAQD_CAAh6gUCAOsJACHrBRAA8wkAIewFEADzCQAh7QUQAPMJACHuBQEA_wgAIe8FAQD_CAAh8AUBAP8IACHxBUAAgQkAIfIFAQD9CAAh8wUBAP8IACH0BQEA_wgAIRS0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHjBQEAsQoAIeQFAQC0CgAh5QUBALEKACHnBQEAtAoAIegFAQC0CgAh6QUBALQKACHqBQIAwgoAIesFEADiCgAh7AUQAOIKACHtBRAA4goAIe4FAQC0CgAh7wUBALQKACHwBQEAtAoAIfEFQAC2CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAhFwMAAOMKACARAADlCgAgGAAA5goAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIeMFAQCxCgAh5AUBALQKACHlBQEAsQoAIecFAQC0CgAh6AUBALQKACHpBQEAtAoAIeoFAgDCCgAh6wUQAOIKACHsBRAA4goAIe0FEADiCgAh7gUBALQKACHvBQEAtAoAIfAFAQC0CgAh8QVAALYKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACEXAwAA5woAIBEAAOkKACAYAADqCgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB4wUBAAAAAeQFAQAAAAHlBQEAAAAB5wUBAAAAAegFAQAAAAHpBQEAAAAB6gUCAAAAAesFEAAAAAHsBRAAAAAB7QUQAAAAAe4FAQAAAAHvBQEAAAAB8AUBAAAAAfEFQAAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAEQAwAAqwsAIA8AAKwLACC0BQEAAAABuQUBAAAAAbsFQAAAAAHQBUAAAAAB0QUBAAAAAe0FEAAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAGRBhAAAAABkgYBAAAAAZMGEAAAAAGUBgEAAAABlQYBAAAAAQIAAAAjACBFAACqCwAgAwAAACMAIEUAAKoLACBGAACnCwAgAT4AAKEUADAVAwAA8AkAIA4AAJ0KACAPAACACgAgsQUAAJwKADCyBQAAIQAQswUAAJwKADC0BQEAAAABuQUBAP0IACG7BUAAgQkAIdAFQACBCQAh0QUBAP8IACHmBQEA_QgAIe0FEADzCQAh8wUBAP8IACH0BQEA_wgAIfwFAQAAAAGRBhAA8wkAIZIGAQD9CAAhkwYQAPMJACGUBgEA_wgAIZUGAQD_CAAhAgAAACMAID4AAKcLACACAAAApQsAID4AAKYLACASsQUAAKQLADCyBQAApQsAELMFAACkCwAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0AVAAIEJACHRBQEA_wgAIeYFAQD9CAAh7QUQAPMJACHzBQEA_wgAIfQFAQD_CAAh_AUBAP8IACGRBhAA8wkAIZIGAQD9CAAhkwYQAPMJACGUBgEA_wgAIZUGAQD_CAAhErEFAACkCwAwsgUAAKULABCzBQAApAsAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIdAFQACBCQAh0QUBAP8IACHmBQEA_QgAIe0FEADzCQAh8wUBAP8IACH0BQEA_wgAIfwFAQD_CAAhkQYQAPMJACGSBgEA_QgAIZMGEADzCQAhlAYBAP8IACGVBgEA_wgAIQ60BQEAsQoAIbkFAQCxCgAhuwVAALYKACHQBUAAtgoAIdEFAQC0CgAh7QUQAOIKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACGRBhAA4goAIZIGAQCxCgAhkwYQAOIKACGUBgEAtAoAIZUGAQC0CgAhEAMAAKgLACAPAACpCwAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0AVAALYKACHRBQEAtAoAIe0FEADiCgAh8wUBALQKACH0BQEAtAoAIfwFAQC0CgAhkQYQAOIKACGSBgEAsQoAIZMGEADiCgAhlAYBALQKACGVBgEAtAoAIQVFAACZFAAgRgAAnxQAIOQGAACaFAAg5QYAAJ4UACDqBgAA_gEAIAdFAACXFAAgRgAAnBQAIOQGAACYFAAg5QYAAJsUACDoBgAAAwAg6QYAAAMAIOoGAAAFACAQAwAAqwsAIA8AAKwLACC0BQEAAAABuQUBAAAAAbsFQAAAAAHQBUAAAAAB0QUBAAAAAe0FEAAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAGRBhAAAAABkgYBAAAAAZMGEAAAAAGUBgEAAAABlQYBAAAAAQNFAACZFAAg5AYAAJoUACDqBgAA_gEAIANFAACXFAAg5AYAAJgUACDqBgAABQAgFQMAAMgLACAKAADHCwAgGQAAyQsAILQFAQAAAAG5BQEAAAABuwVAAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABugYBAAAAAbwGEAAAAAHHBgAAAMcGAsgGEAAAAAHJBgEAAAABygYBAAAAAcsGQAAAAAECAAAAHgAgRQAAxgsAIAMAAAAeACBFAADGCwAgRgAAuQsAIAE-AACWFAAwGgMAAIcKACAKAACDCgAgDgAAnQoAIBkAAJQJACCxBQAAngoAMLIFAAAcABCzBQAAngoAMLQFAQAAAAG5BQEA_wgAIbsFQACBCQAh5gUBAP0IACHpBQEA_wgAIe0FEAD_CQAh7wUBAP8IACHwBQEA_wgAIfMFAQD_CAAh9AUBAP8IACGUBgEA_wgAIZUGAQD_CAAhugYBAP0IACG8BhAA8wkAIccGAACfCscGIsgGEAD_CQAhyQYBAP8IACHKBgEA_wgAIcsGQACBCQAhAgAAAB4AID4AALkLACACAAAAtQsAID4AALYLACAWsQUAALQLADCyBQAAtQsAELMFAAC0CwAwtAUBAP0IACG5BQEA_wgAIbsFQACBCQAh5gUBAP0IACHpBQEA_wgAIe0FEAD_CQAh7wUBAP8IACHwBQEA_wgAIfMFAQD_CAAh9AUBAP8IACGUBgEA_wgAIZUGAQD_CAAhugYBAP0IACG8BhAA8wkAIccGAACfCscGIsgGEAD_CQAhyQYBAP8IACHKBgEA_wgAIcsGQACBCQAhFrEFAAC0CwAwsgUAALULABCzBQAAtAsAMLQFAQD9CAAhuQUBAP8IACG7BUAAgQkAIeYFAQD9CAAh6QUBAP8IACHtBRAA_wkAIe8FAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhlAYBAP8IACGVBgEA_wgAIboGAQD9CAAhvAYQAPMJACHHBgAAnwrHBiLIBhAA_wkAIckGAQD_CAAhygYBAP8IACHLBkAAgQkAIRK0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHpBQEAtAoAIe0FEAC4CwAh7wUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGUBgEAtAoAIZUGAQC0CgAhugYBALEKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhAecGAAAAxwYCBecGEAAAAAHtBhAAAAAB7gYQAAAAAe8GEAAAAAHwBhAAAAABFQMAALsLACAKAAC6CwAgGQAAvAsAILQFAQCxCgAhuQUBALQKACG7BUAAtgoAIekFAQC0CgAh7QUQALgLACHvBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIZQGAQC0CgAhlQYBALQKACG6BgEAsQoAIbwGEADiCgAhxwYAALcLxwYiyAYQALgLACHJBgEAtAoAIcoGAQC0CgAhywZAALYKACEFRQAAjRQAIEYAAJQUACDkBgAAjhQAIOUGAACTFAAg6gYAABQAIAdFAACLFAAgRgAAkRQAIOQGAACMFAAg5QYAAJAUACDoBgAAMgAg6QYAADIAIOoGAAD-AQAgC0UAAL0LADBGAADBCwAw5AYAAL4LADDlBgAAvwsAMOYGAADACwAg5wYAAIALADDoBgAAgAsAMOkGAACACwAw6gYAAIALADDrBgAAwgsAMOwGAACDCwAwEAMAAPQKACAGAAD1CgAgDwAA9woAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-wVAAAAAAfwFAQAAAAECAAAAWwAgRQAAxQsAIAMAAABbACBFAADFCwAgRgAAxAsAIAE-AACPFAAwAgAAAFsAID4AAMQLACACAAAAhAsAID4AAMMLACANtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0QUBALQKACHzBQEAtAoAIfQFAQC0CgAh9QUBALEKACH2BRAA4goAIfcFAQC0CgAh-AUBALQKACH5BQEAtAoAIfsFQAC2CgAh_AUBALQKACEQAwAA8AoAIAYAAPEKACAPAADzCgAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0QUBALQKACHzBQEAtAoAIfQFAQC0CgAh9QUBALEKACH2BRAA4goAIfcFAQC0CgAh-AUBALQKACH5BQEAtAoAIfsFQAC2CgAh_AUBALQKACEQAwAA9AoAIAYAAPUKACAPAAD3CgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0QUBAAAAAfMFAQAAAAH0BQEAAAAB9QUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH7BUAAAAAB_AUBAAAAARUDAADICwAgCgAAxwsAIBkAAMkLACC0BQEAAAABuQUBAAAAAbsFQAAAAAHpBQEAAAAB7QUQAAAAAe8FAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGUBgEAAAABlQYBAAAAAboGAQAAAAG8BhAAAAABxwYAAADHBgLIBhAAAAAByQYBAAAAAcoGAQAAAAHLBkAAAAABA0UAAI0UACDkBgAAjhQAIOoGAAAUACADRQAAixQAIOQGAACMFAAg6gYAAP4BACAERQAAvQsAMOQGAAC-CwAw5gYAAMALACDqBgAAgAsAMAHnBgEAAAAEBEUAAK0LADDkBgAArgsAMOYGAACwCwAg6gYAALELADAERQAAnQsAMOQGAACeCwAw5gYAAKALACDqBgAAoQsAMARFAACRCwAw5AYAAJILADDmBgAAlAsAIOoGAACVCwAwAAAAAAAABUUAAIMUACBGAACJFAAg5AYAAIQUACDlBgAAiBQAIOoGAAAFACAFRQAAgRQAIEYAAIYUACDkBgAAghQAIOUGAACFFAAg6gYAAAEAIANFAACDFAAg5AYAAIQUACDqBgAABQAgA0UAAIEUACDkBgAAghQAIOoGAAABACAAAAAFRQAA2hMAIEYAAP8TACDkBgAA2xMAIOUGAAD-EwAg6gYAAP4BACAFRQAA2BMAIEYAAPwTACDkBgAA2RMAIOUGAAD7EwAg6gYAAAEAIAtFAACfDAAwRgAApAwAMOQGAACgDAAw5QYAAKEMADDmBgAAogwAIOcGAACjDAAw6AYAAKMMADDpBgAAowwAMOoGAACjDAAw6wYAAKUMADDsBgAApgwAMAtFAACPDAAwRgAAlAwAMOQGAACQDAAw5QYAAJEMADDmBgAAkgwAIOcGAACTDAAw6AYAAJMMADDpBgAAkwwAMOoGAACTDAAw6wYAAJUMADDsBgAAlgwAMAtFAACDDAAwRgAAiAwAMOQGAACEDAAw5QYAAIUMADDmBgAAhgwAIOcGAACHDAAw6AYAAIcMADDpBgAAhwwAMOoGAACHDAAw6wYAAIkMADDsBgAAigwAMAtFAAD6CwAwRgAA_gsAMOQGAAD7CwAw5QYAAPwLADDmBgAA_QsAIOcGAACACwAw6AYAAIALADDpBgAAgAsAMOoGAACACwAw6wYAAP8LADDsBgAAgwsAMAtFAADvCwAwRgAA8wsAMOQGAADwCwAw5QYAAPELADDmBgAA8gsAIOcGAAChCwAw6AYAAKELADDpBgAAoQsAMOoGAAChCwAw6wYAAPQLADDsBgAApAsAMAtFAADjCwAwRgAA6AsAMOQGAADkCwAw5QYAAOULADDmBgAA5gsAIOcGAADnCwAw6AYAAOcLADDpBgAA5wsAMOoGAADnCwAw6wYAAOkLADDsBgAA6gsAMAcDAADXCgAgMgAA2QoAILQFAQAAAAG5BQEAAAAB0gVAAAAAAdMFgAAAAAHUBUAAAAABAgAAAKIBACBFAADuCwAgAwAAAKIBACBFAADuCwAgRgAA7QsAIAE-AAD6EwAwDQMAAPAJACAPAADoCQAgMgAA8QkAILEFAADuCQAwsgUAAKABABCzBQAA7gkAMLQFAQAAAAG5BQEA_QgAIdEFAQD9CAAh0gVAAIEJACHTBQAA7wkAINQFQACBCQAh3gYAAO0JACACAAAAogEAID4AAO0LACACAAAA6wsAID4AAOwLACAJsQUAAOoLADCyBQAA6wsAELMFAADqCwAwtAUBAP0IACG5BQEA_QgAIdEFAQD9CAAh0gVAAIEJACHTBQAA7wkAINQFQACBCQAhCbEFAADqCwAwsgUAAOsLABCzBQAA6gsAMLQFAQD9CAAhuQUBAP0IACHRBQEA_QgAIdIFQACBCQAh0wUAAO8JACDUBUAAgQkAIQW0BQEAsQoAIbkFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACEHAwAAyAoAIDIAAMoKACC0BQEAsQoAIbkFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACEHAwAA1woAIDIAANkKACC0BQEAAAABuQUBAAAAAdIFQAAAAAHTBYAAAAAB1AVAAAAAARADAACrCwAgDgAA-QsAILQFAQAAAAG5BQEAAAABuwVAAAAAAdAFQAAAAAHmBQEAAAAB7QUQAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAZEGEAAAAAGSBgEAAAABkwYQAAAAAZQGAQAAAAGVBgEAAAABAgAAACMAIEUAAPgLACADAAAAIwAgRQAA-AsAIEYAAPYLACABPgAA-RMAMAIAAAAjACA-AAD2CwAgAgAAAKULACA-AAD1CwAgDrQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdAFQAC2CgAh5gUBALEKACHtBRAA4goAIfMFAQC0CgAh9AUBALQKACH8BQEAtAoAIZEGEADiCgAhkgYBALEKACGTBhAA4goAIZQGAQC0CgAhlQYBALQKACEQAwAAqAsAIA4AAPcLACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHQBUAAtgoAIeYFAQCxCgAh7QUQAOIKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACGRBhAA4goAIZIGAQCxCgAhkwYQAOIKACGUBgEAtAoAIZUGAQC0CgAhBUUAAPQTACBGAAD3EwAg5AYAAPUTACDlBgAA9hMAIOoGAACLBwAgEAMAAKsLACAOAAD5CwAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0AVAAAAAAeYFAQAAAAHtBRAAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABkQYQAAAAAZIGAQAAAAGTBhAAAAABlAYBAAAAAZUGAQAAAAEDRQAA9BMAIOQGAAD1EwAg6gYAAIsHACAQAwAA9AoAIAYAAPUKACAaAAD2CgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAH1BQEAAAAB9gUQAAAAAfcFAQAAAAH4BQEAAAAB-QUBAAAAAfoFAQAAAAH7BUAAAAAB_AUBAAAAAQIAAABbACBFAACCDAAgAwAAAFsAIEUAAIIMACBGAACBDAAgAT4AAPMTADACAAAAWwAgPgAAgQwAIAIAAACECwAgPgAAgAwAIA20BQEAsQoAIbkFAQCxCgAhuwVAALYKACHzBQEAtAoAIfQFAQC0CgAh9QUBALEKACH2BRAA4goAIfcFAQC0CgAh-AUBALQKACH5BQEAtAoAIfoFAQC0CgAh-wVAALYKACH8BQEAtAoAIRADAADwCgAgBgAA8QoAIBoAAPIKACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHzBQEAtAoAIfQFAQC0CgAh9QUBALEKACH2BRAA4goAIfcFAQC0CgAh-AUBALQKACH5BQEAtAoAIfoFAQC0CgAh-wVAALYKACH8BQEAtAoAIRADAAD0CgAgBgAA9QoAIBoAAPYKACC0BQEAAAABuQUBAAAAAbsFQAAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-gUBAAAAAfsFQAAAAAH8BQEAAAABBTUAANcLACC0BQEAAAABuwVAAAAAAYgGAQAAAAGJBgEAAAABAgAAAL4BACBFAACODAAgAwAAAL4BACBFAACODAAgRgAAjQwAIAE-AADyEwAwCg8AAOgJACA1AADmCQAgsQUAAOcJADCyBQAAvAEAELMFAADnCQAwtAUBAAAAAbsFQACBCQAh0QUBAP0IACGIBgEA_QgAIYkGAQD9CAAhAgAAAL4BACA-AACNDAAgAgAAAIsMACA-AACMDAAgCLEFAACKDAAwsgUAAIsMABCzBQAAigwAMLQFAQD9CAAhuwVAAIEJACHRBQEA_QgAIYgGAQD9CAAhiQYBAP0IACEIsQUAAIoMADCyBQAAiwwAELMFAACKDAAwtAUBAP0IACG7BUAAgQkAIdEFAQD9CAAhiAYBAP0IACGJBgEA_QgAIQS0BQEAsQoAIbsFQAC2CgAhiAYBALEKACGJBgEAsQoAIQU1AADVCwAgtAUBALEKACG7BUAAtgoAIYgGAQCxCgAhiQYBALEKACEFNQAA1wsAILQFAQAAAAG7BUAAAAABiAYBAAAAAYkGAQAAAAEOAwAAnQwAIAoAAJ4MACC0BQEAAAABuQUBAAAAAbsFQAAAAAHwBQEAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAboGAQAAAAG8BhAAAAABvgYBAAAAAb8GQAAAAAECAAAAaQAgRQAAnAwAIAMAAABpACBFAACcDAAgRgAAmQwAIAE-AADxEwAwEwMAAPAJACAKAACDCgAgDwAAgAoAILEFAACECgAwsgUAAGcAELMFAACECgAwtAUBAAAAAbkFAQD9CAAhuwVAAIEJACHRBQEA_wgAIfAFAQD_CAAh8gUBAP0IACHzBQEA_wgAIfQFAQD_CAAh_AUBAAAAAboGAQD9CAAhvAYQAPMJACG-BgEA_wgAIb8GQACBCQAhAgAAAGkAID4AAJkMACACAAAAlwwAID4AAJgMACAQsQUAAJYMADCyBQAAlwwAELMFAACWDAAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHwBQEA_wgAIfIFAQD9CAAh8wUBAP8IACH0BQEA_wgAIfwFAQD_CAAhugYBAP0IACG8BhAA8wkAIb4GAQD_CAAhvwZAAIEJACEQsQUAAJYMADCyBQAAlwwAELMFAACWDAAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACHwBQEA_wgAIfIFAQD9CAAh8wUBAP8IACH0BQEA_wgAIfwFAQD_CAAhugYBAP0IACG8BhAA8wkAIb4GAQD_CAAhvwZAAIEJACEMtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh8AUBALQKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACH8BQEAtAoAIboGAQCxCgAhvAYQAOIKACG-BgEAtAoAIb8GQAC2CgAhDgMAAJoMACAKAACbDAAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh8AUBALQKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACH8BQEAtAoAIboGAQCxCgAhvAYQAOIKACG-BgEAtAoAIb8GQAC2CgAhBUUAAOkTACBGAADvEwAg5AYAAOoTACDlBgAA7hMAIOoGAAD-AQAgBUUAAOcTACBGAADsEwAg5AYAAOgTACDlBgAA6xMAIOoGAAAUACAOAwAAnQwAIAoAAJ4MACC0BQEAAAABuQUBAAAAAbsFQAAAAAHwBQEAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAboGAQAAAAG8BhAAAAABvgYBAAAAAb8GQAAAAAEDRQAA6RMAIOQGAADqEwAg6gYAAP4BACADRQAA5xMAIOQGAADoEwAg6gYAABQAIAoDAACuDAAgJwAArQwAILQFAQAAAAG5BQEAAAABuwVAAAAAAZYGAQAAAAGjBkAAAAABpAYgAAAAAaUGEAAAAAGmBhAAAAABAgAAAH8AIEUAAKwMACADAAAAfwAgRQAArAwAIEYAAKkMACABPgAA5hMAMA8DAADwCQAgDwAAgAoAICcAAPQJACCxBQAA_gkAMLIFAAB9ABCzBQAA_gkAMLQFAQAAAAG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACGWBgEA_QgAIaMGQACBCQAhpAYgAP4IACGlBhAA_wkAIaYGEAD_CQAhAgAAAH8AID4AAKkMACACAAAApwwAID4AAKgMACAMsQUAAKYMADCyBQAApwwAELMFAACmDAAwtAUBAP0IACG5BQEA_QgAIbsFQACBCQAh0QUBAP8IACGWBgEA_QgAIaMGQACBCQAhpAYgAP4IACGlBhAA_wkAIaYGEAD_CQAhDLEFAACmDAAwsgUAAKcMABCzBQAApgwAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIdEFAQD_CAAhlgYBAP0IACGjBkAAgQkAIaQGIAD-CAAhpQYQAP8JACGmBhAA_wkAIQi0BQEAsQoAIbkFAQCxCgAhuwVAALYKACGWBgEAsQoAIaMGQAC2CgAhpAYgALMKACGlBhAAuAsAIaYGEAC4CwAhCgMAAKsMACAnAACqDAAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAhlgYBALEKACGjBkAAtgoAIaQGIACzCgAhpQYQALgLACGmBhAAuAsAIQVFAADeEwAgRgAA5BMAIOQGAADfEwAg5QYAAOMTACDqBgAAgwEAIAVFAADcEwAgRgAA4RMAIOQGAADdEwAg5QYAAOATACDqBgAA_gEAIAoDAACuDAAgJwAArQwAILQFAQAAAAG5BQEAAAABuwVAAAAAAZYGAQAAAAGjBkAAAAABpAYgAAAAAaUGEAAAAAGmBhAAAAABA0UAAN4TACDkBgAA3xMAIOoGAACDAQAgA0UAANwTACDkBgAA3RMAIOoGAAD-AQAgA0UAANoTACDkBgAA2xMAIOoGAAD-AQAgA0UAANgTACDkBgAA2RMAIOoGAAABACAERQAAnwwAMOQGAACgDAAw5gYAAKIMACDqBgAAowwAMARFAACPDAAw5AYAAJAMADDmBgAAkgwAIOoGAACTDAAwBEUAAIMMADDkBgAAhAwAMOYGAACGDAAg6gYAAIcMADAERQAA-gsAMOQGAAD7CwAw5gYAAP0LACDqBgAAgAsAMARFAADvCwAw5AYAAPALADDmBgAA8gsAIOoGAAChCwAwBEUAAOMLADDkBgAA5AsAMOYGAADmCwAg6gYAAOcLADAAAAAAAAAAAAAABUUAAM0TACBGAADWEwAg5AYAAM4TACDlBgAA1RMAIOoGAACDAQAgC0UAAMMMADBGAADIDAAw5AYAAMQMADDlBgAAxQwAMOYGAADGDAAg5wYAAMcMADDoBgAAxwwAMOkGAADHDAAw6gYAAMcMADDrBgAAyQwAMOwGAADKDAAwCSgAANAMACC0BQEAAAABuwVAAAAAAfMFAQAAAAH2BRAAAAABnQYBAAAAAZ8GAQAAAAGgBkAAAAABoQYBAAAAAQIAAACNAQAgRQAAzwwAIAMAAACNAQAgRQAAzwwAIEYAAM0MACABPgAA1BMAMA4oAAD3CQAgKgAA-AkAILEFAAD2CQAwsgUAAIsBABCzBQAA9gkAMLQFAQAAAAG7BUAAgQkAIfMFAQD_CAAh9gUQAPMJACGdBgEA_QgAIZ4GAQD_CAAhnwYBAP8IACGgBkAAgQkAIaEGAQD_CAAhAgAAAI0BACA-AADNDAAgAgAAAMsMACA-AADMDAAgDLEFAADKDAAwsgUAAMsMABCzBQAAygwAMLQFAQD9CAAhuwVAAIEJACHzBQEA_wgAIfYFEADzCQAhnQYBAP0IACGeBgEA_wgAIZ8GAQD_CAAhoAZAAIEJACGhBgEA_wgAIQyxBQAAygwAMLIFAADLDAAQswUAAMoMADC0BQEA_QgAIbsFQACBCQAh8wUBAP8IACH2BRAA8wkAIZ0GAQD9CAAhngYBAP8IACGfBgEA_wgAIaAGQACBCQAhoQYBAP8IACEItAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9gUQAOIKACGdBgEAsQoAIZ8GAQC0CgAhoAZAALYKACGhBgEAtAoAIQkoAADODAAgtAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9gUQAOIKACGdBgEAsQoAIZ8GAQC0CgAhoAZAALYKACGhBgEAtAoAIQVFAADPEwAgRgAA0hMAIOQGAADQEwAg5QYAANETACDqBgAAiQEAIAkoAADQDAAgtAUBAAAAAbsFQAAAAAHzBQEAAAAB9gUQAAAAAZ0GAQAAAAGfBgEAAAABoAZAAAAAAaEGAQAAAAEDRQAAzxMAIOQGAADQEwAg6gYAAIkBACADRQAAzRMAIOQGAADOEwAg6gYAAIMBACAERQAAwwwAMOQGAADEDAAw5gYAAMYMACDqBgAAxwwAMAAAAAAAB0UAAMgTACBGAADLEwAg5AYAAMkTACDlBgAAyhMAIOgGAACPAQAg6QYAAI8BACDqBgAAlQEAIANFAADIEwAg5AYAAMkTACDqBgAAlQEAIAAAAAAABUUAAMITACBGAADGEwAg5AYAAMMTACDlBgAAxRMAIOoGAACDAQAgC0UAAOEMADBGAADlDAAw5AYAAOIMADDlBgAA4wwAMOYGAADkDAAg5wYAAMcMADDoBgAAxwwAMOkGAADHDAAw6gYAAMcMADDrBgAA5gwAMOwGAADKDAAwCSoAANkMACC0BQEAAAABuwVAAAAAAfMFAQAAAAH2BRAAAAABngYBAAAAAZ8GAQAAAAGgBkAAAAABoQYBAAAAAQIAAACNAQAgRQAA6QwAIAMAAACNAQAgRQAA6QwAIEYAAOgMACABPgAAxBMAMAIAAACNAQAgPgAA6AwAIAIAAADLDAAgPgAA5wwAIAi0BQEAsQoAIbsFQAC2CgAh8wUBALQKACH2BRAA4goAIZ4GAQC0CgAhnwYBALQKACGgBkAAtgoAIaEGAQC0CgAhCSoAANgMACC0BQEAsQoAIbsFQAC2CgAh8wUBALQKACH2BRAA4goAIZ4GAQC0CgAhnwYBALQKACGgBkAAtgoAIaEGAQC0CgAhCSoAANkMACC0BQEAAAABuwVAAAAAAfMFAQAAAAH2BRAAAAABngYBAAAAAZ8GAQAAAAGgBkAAAAABoQYBAAAAAQNFAADCEwAg5AYAAMMTACDqBgAAgwEAIARFAADhDAAw5AYAAOIMADDmBgAA5AwAIOoGAADHDAAwAAAAAAAHRQAAvRMAIEYAAMATACDkBgAAvhMAIOUGAAC_EwAg6AYAAAMAIOkGAAADACDqBgAABQAgA0UAAL0TACDkBgAAvhMAIOoGAAAFACAAAAAAAAVFAAC1EwAgRgAAuxMAIOQGAAC2EwAg5QYAALoTACDqBgAAvAUAIAtFAACUDQAwRgAAmA0AMOQGAACVDQAw5QYAAJYNADDmBgAAlw0AIOcGAACjDAAw6AYAAKMMADDpBgAAowwAMOoGAACjDAAw6wYAAJkNADDsBgAApgwAMAtFAACIDQAwRgAAjQ0AMOQGAACJDQAw5QYAAIoNADDmBgAAiw0AIOcGAACMDQAw6AYAAIwNADDpBgAAjA0AMOoGAACMDQAw6wYAAI4NADDsBgAAjw0AMAtFAAD8DAAwRgAAgQ0AMOQGAAD9DAAw5QYAAP4MADDmBgAA_wwAIOcGAACADQAw6AYAAIANADDpBgAAgA0AMOoGAACADQAw6wYAAIINADDsBgAAgw0AMAwpAADSDAAgtAUBAAAAAbsFQAAAAAHNBQEAAAAB8wUBAAAAAfQFAQAAAAGXBhAAAAABmAYQAAAAAZkGEAAAAAGaBhAAAAABmwYBAAAAAZwGQAAAAAECAAAAlQEAIEUAAIcNACADAAAAlQEAIEUAAIcNACBGAACGDQAgAT4AALkTADARJwAA9AkAICkAAPUJACCxBQAA8gkAMLIFAACPAQAQswUAAPIJADC0BQEAAAABuwVAAIEJACHNBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGWBgEA_QgAIZcGEADzCQAhmAYQAPMJACGZBhAA8wkAIZoGEADzCQAhmwYBAP8IACGcBkAAgAkAIQIAAACVAQAgPgAAhg0AIAIAAACEDQAgPgAAhQ0AIA-xBQAAgw0AMLIFAACEDQAQswUAAIMNADC0BQEA_QgAIbsFQACBCQAhzQUBAP0IACHzBQEA_wgAIfQFAQD_CAAhlgYBAP0IACGXBhAA8wkAIZgGEADzCQAhmQYQAPMJACGaBhAA8wkAIZsGAQD_CAAhnAZAAIAJACEPsQUAAIMNADCyBQAAhA0AELMFAACDDQAwtAUBAP0IACG7BUAAgQkAIc0FAQD9CAAh8wUBAP8IACH0BQEA_wgAIZYGAQD9CAAhlwYQAPMJACGYBhAA8wkAIZkGEADzCQAhmgYQAPMJACGbBgEA_wgAIZwGQACACQAhC7QFAQCxCgAhuwVAALYKACHNBQEAsQoAIfMFAQC0CgAh9AUBALQKACGXBhAA4goAIZgGEADiCgAhmQYQAOIKACGaBhAA4goAIZsGAQC0CgAhnAZAALUKACEMKQAAwgwAILQFAQCxCgAhuwVAALYKACHNBQEAsQoAIfMFAQC0CgAh9AUBALQKACGXBhAA4goAIZgGEADiCgAhmQYQAOIKACGaBhAA4goAIZsGAQC0CgAhnAZAALUKACEMKQAA0gwAILQFAQAAAAG7BUAAAAABzQUBAAAAAfMFAQAAAAH0BQEAAAABlwYQAAAAAZgGEAAAAAGZBhAAAAABmgYQAAAAAZsGAQAAAAGcBkAAAAABCSsAAOsMACC0BQEAAAABuwVAAAAAAfMFAQAAAAH0BQEAAAAB9gUQAAAAAfgFAQAAAAGhBgEAAAABogZAAAAAAQIAAACJAQAgRQAAkw0AIAMAAACJAQAgRQAAkw0AIEYAAJINACABPgAAuBMAMA4nAAD0CQAgKwAA9QkAILEFAAD5CQAwsgUAAIcBABCzBQAA-QkAMLQFAQAAAAG7BUAAgQkAIfMFAQD_CAAh9AUBAP8IACH2BRAA8wkAIfgFAQD_CAAhlgYBAP0IACGhBgEA_wgAIaIGQACBCQAhAgAAAIkBACA-AACSDQAgAgAAAJANACA-AACRDQAgDLEFAACPDQAwsgUAAJANABCzBQAAjw0AMLQFAQD9CAAhuwVAAIEJACHzBQEA_wgAIfQFAQD_CAAh9gUQAPMJACH4BQEA_wgAIZYGAQD9CAAhoQYBAP8IACGiBkAAgQkAIQyxBQAAjw0AMLIFAACQDQAQswUAAI8NADC0BQEA_QgAIbsFQACBCQAh8wUBAP8IACH0BQEA_wgAIfYFEADzCQAh-AUBAP8IACGWBgEA_QgAIaEGAQD_CAAhogZAAIEJACEItAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9AUBALQKACH2BRAA4goAIfgFAQC0CgAhoQYBALQKACGiBkAAtgoAIQkrAADgDAAgtAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9AUBALQKACH2BRAA4goAIfgFAQC0CgAhoQYBALQKACGiBkAAtgoAIQkrAADrDAAgtAUBAAAAAbsFQAAAAAHzBQEAAAAB9AUBAAAAAfYFEAAAAAH4BQEAAAABoQYBAAAAAaIGQAAAAAEKAwAArgwAIA8AAPIMACC0BQEAAAABuQUBAAAAAbsFQAAAAAHRBQEAAAABowZAAAAAAaQGIAAAAAGlBhAAAAABpgYQAAAAAQIAAAB_ACBFAACcDQAgAwAAAH8AIEUAAJwNACBGAACbDQAgAT4AALcTADACAAAAfwAgPgAAmw0AIAIAAACnDAAgPgAAmg0AIAi0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHRBQEAtAoAIaMGQAC2CgAhpAYgALMKACGlBhAAuAsAIaYGEAC4CwAhCgMAAKsMACAPAADxDAAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0QUBALQKACGjBkAAtgoAIaQGIACzCgAhpQYQALgLACGmBhAAuAsAIQoDAACuDAAgDwAA8gwAILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAGjBkAAAAABpAYgAAAAAaUGEAAAAAGmBhAAAAABA0UAALUTACDkBgAAthMAIOoGAAC8BQAgBEUAAJQNADDkBgAAlQ0AMOYGAACXDQAg6gYAAKMMADAERQAAiA0AMOQGAACJDQAw5gYAAIsNACDqBgAAjA0AMARFAAD8DAAw5AYAAP0MADDmBgAA_wwAIOoGAACADQAwAAAAC0UAAKUNADBGAACqDQAw5AYAAKYNADDlBgAApw0AMOYGAACoDQAg5wYAAKkNADDoBgAAqQ0AMOkGAACpDQAw6gYAAKkNADDrBgAAqw0AMOwGAACsDQAwCSYAAJ4NACAsAACfDQAgLQAAoA0AILQFAQAAAAH9BQEAAAAB_gUgAAAAAacGAQAAAAGoBgEAAAABqgYQAAAAAQIAAACDAQAgRQAAsA0AIAMAAACDAQAgRQAAsA0AIEYAAK8NACABPgAAtBMAMA4lAAD7CQAgJgAA2QkAICwAAPwJACAtAAD9CQAgsQUAAPoJADCyBQAAgQEAELMFAAD6CQAwtAUBAAAAAf0FAQD9CAAh_gUgAP4IACGnBgEA_wgAIagGAQD_CAAhqQYBAP0IACGqBhAA8wkAIQIAAACDAQAgPgAArw0AIAIAAACtDQAgPgAArg0AIAqxBQAArA0AMLIFAACtDQAQswUAAKwNADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACGnBgEA_wgAIagGAQD_CAAhqQYBAP0IACGqBhAA8wkAIQqxBQAArA0AMLIFAACtDQAQswUAAKwNADC0BQEA_QgAIf0FAQD9CAAh_gUgAP4IACGnBgEA_wgAIagGAQD_CAAhqQYBAP0IACGqBhAA8wkAIQa0BQEAsQoAIf0FAQCxCgAh_gUgALMKACGnBgEAtAoAIagGAQC0CgAhqgYQAOIKACEJJgAA-QwAICwAAPoMACAtAAD7DAAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhpwYBALQKACGoBgEAtAoAIaoGEADiCgAhCSYAAJ4NACAsAACfDQAgLQAAoA0AILQFAQAAAAH9BQEAAAAB_gUgAAAAAacGAQAAAAGoBgEAAAABqgYQAAAAAQRFAAClDQAw5AYAAKYNADDmBgAAqA0AIOoGAACpDQAwAAAAAAAABUUAAK8TACBGAACyEwAg5AYAALATACDlBgAAsRMAIOoGAABEACADRQAArxMAIOQGAACwEwAg6gYAAEQAIAAAAAHnBgAAAK8GAgVFAACnEwAgRgAArRMAIOQGAACoEwAg5QYAAKwTACDqBgAARAAgB0UAAKUTACBGAACqEwAg5AYAAKYTACDlBgAAqRMAIOgGAAAyACDpBgAAMgAg6gYAAP4BACADRQAApxMAIOQGAACoEwAg6gYAAEQAIANFAAClEwAg5AYAAKYTACDqBgAA_gEAIAAAAAVFAACaEwAgRgAAoxMAIOQGAACbEwAg5QYAAKITACDqBgAAlwQAIAdFAACYEwAgRgAAoBMAIOQGAACZEwAg5QYAAJ8TACDoBgAAMgAg6QYAADIAIOoGAAD-AQAgC0UAAN8NADBGAADkDQAw5AYAAOANADDlBgAA4Q0AMOYGAADiDQAg5wYAAOMNADDoBgAA4w0AMOkGAADjDQAw6gYAAOMNADDrBgAA5Q0AMOwGAADmDQAwC0UAANMNADBGAADYDQAw5AYAANQNADDlBgAA1Q0AMOYGAADWDQAg5wYAANcNADDoBgAA1w0AMOkGAADXDQAw6gYAANcNADDrBgAA2Q0AMOwGAADaDQAwC0UAAMoNADBGAADODQAw5AYAAMsNADDlBgAAzA0AMOYGAADNDQAg5wYAAJULADDoBgAAlQsAMOkGAACVCwAw6gYAAJULADDrBgAAzw0AMOwGAACYCwAwFwMAAOcKACAOAADoCgAgEQAA6QoAILQFAQAAAAG5BQEAAAABuwVAAAAAAeMFAQAAAAHkBQEAAAAB5QUBAAAAAeYFAQAAAAHnBQEAAAAB6QUBAAAAAeoFAgAAAAHrBRAAAAAB7AUQAAAAAe0FEAAAAAHuBQEAAAAB7wUBAAAAAfAFAQAAAAHxBUAAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAABAgAAACgAIEUAANINACADAAAAKAAgRQAA0g0AIEYAANENACABPgAAnhMAMAIAAAAoACA-AADRDQAgAgAAAJkLACA-AADQDQAgFLQFAQCxCgAhuQUBALEKACG7BUAAtgoAIeMFAQCxCgAh5AUBALQKACHlBQEAsQoAIeYFAQC0CgAh5wUBALQKACHpBQEAtAoAIeoFAgDCCgAh6wUQAOIKACHsBRAA4goAIe0FEADiCgAh7gUBALQKACHvBQEAtAoAIfAFAQC0CgAh8QVAALYKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACEXAwAA4woAIA4AAOQKACARAADlCgAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh4wUBALEKACHkBQEAtAoAIeUFAQCxCgAh5gUBALQKACHnBQEAtAoAIekFAQC0CgAh6gUCAMIKACHrBRAA4goAIewFEADiCgAh7QUQAOIKACHuBQEAtAoAIe8FAQC0CgAh8AUBALQKACHxBUAAtgoAIfIFAQCxCgAh8wUBALQKACH0BQEAtAoAIRcDAADnCgAgDgAA6AoAIBEAAOkKACC0BQEAAAABuQUBAAAAAbsFQAAAAAHjBQEAAAAB5AUBAAAAAeUFAQAAAAHmBQEAAAAB5wUBAAAAAekFAQAAAAHqBQIAAAAB6wUQAAAAAewFEAAAAAHtBRAAAAAB7gUBAAAAAe8FAQAAAAHwBQEAAAAB8QVAAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAQa0BQEAAAABuwVAAAAAAfAFAQAAAAGrBgEAAAABrAYQAAAAAa0GQAAAAAECAAAATwAgRQAA3g0AIAMAAABPACBFAADeDQAgRgAA3Q0AIAE-AACdEwAwCxgAAIwKACCxBQAAiwoAMLIFAABNABCzBQAAiwoAMLQFAQAAAAG7BUAAgQkAIegFAQD9CAAh8AUBAP8IACGrBgEA_QgAIawGEAD_CQAhrQZAAIEJACECAAAATwAgPgAA3Q0AIAIAAADbDQAgPgAA3A0AIAqxBQAA2g0AMLIFAADbDQAQswUAANoNADC0BQEA_QgAIbsFQACBCQAh6AUBAP0IACHwBQEA_wgAIasGAQD9CAAhrAYQAP8JACGtBkAAgQkAIQqxBQAA2g0AMLIFAADbDQAQswUAANoNADC0BQEA_QgAIbsFQACBCQAh6AUBAP0IACHwBQEA_wgAIasGAQD9CAAhrAYQAP8JACGtBkAAgQkAIQa0BQEAsQoAIbsFQAC2CgAh8AUBALQKACGrBgEAsQoAIawGEAC4CwAhrQZAALYKACEGtAUBALEKACG7BUAAtgoAIfAFAQC0CgAhqwYBALEKACGsBhAAuAsAIa0GQAC2CgAhBrQFAQAAAAG7BUAAAAAB8AUBAAAAAasGAQAAAAGsBhAAAAABrQZAAAAAAQgDAADBDQAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAGvBgAAAK8GArAGQAAAAAECAAAASgAgRQAA6g0AIAMAAABKACBFAADqDQAgRgAA6Q0AIAE-AACcEwAwDQMAAIcKACAYAACMCgAgsQUAAI0KADCyBQAASAAQswUAAI0KADC0BQEAAAABuQUBAP8IACG7BUAAgQkAIegFAQD9CAAh8wUBAP8IACH0BQEA_wgAIa8GAACOCq8GIrAGQACBCQAhAgAAAEoAID4AAOkNACACAAAA5w0AID4AAOgNACALsQUAAOYNADCyBQAA5w0AELMFAADmDQAwtAUBAP0IACG5BQEA_wgAIbsFQACBCQAh6AUBAP0IACHzBQEA_wgAIfQFAQD_CAAhrwYAAI4KrwYisAZAAIEJACELsQUAAOYNADCyBQAA5w0AELMFAADmDQAwtAUBAP0IACG5BQEA_wgAIbsFQACBCQAh6AUBAP0IACHzBQEA_wgAIfQFAQD_CAAhrwYAAI4KrwYisAZAAIEJACEHtAUBALEKACG5BQEAtAoAIbsFQAC2CgAh8wUBALQKACH0BQEAtAoAIa8GAAC9Da8GIrAGQAC2CgAhCAMAAL8NACC0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHzBQEAtAoAIfQFAQC0CgAhrwYAAL0NrwYisAZAALYKACEIAwAAwQ0AILQFAQAAAAG5BQEAAAABuwVAAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABA0UAAJoTACDkBgAAmxMAIOoGAACXBAAgA0UAAJgTACDkBgAAmRMAIOoGAAD-AQAgBEUAAN8NADDkBgAA4A0AMOYGAADiDQAg6gYAAOMNADAERQAA0w0AMOQGAADUDQAw5gYAANYNACDqBgAA1w0AMARFAADKDQAw5AYAAMsNADDmBgAAzQ0AIOoGAACVCwAwAAAAAAAFRQAAkxMAIEYAAJYTACDkBgAAlBMAIOUGAACVEwAg6gYAAC8AIANFAACTEwAg5AYAAJQTACDqBgAALwAgAAAABUUAAIsTACBGAACREwAg5AYAAIwTACDlBgAAkBMAIOoGAAAvACAHRQAAiRMAIEYAAI4TACDkBgAAihMAIOUGAACNEwAg6AYAADIAIOkGAAAyACDqBgAA_gEAIANFAACLEwAg5AYAAIwTACDqBgAALwAgA0UAAIkTACDkBgAAihMAIOoGAAD-AQAgAAAABUUAAP4SACBGAACHEwAg5AYAAP8SACDlBgAAhhMAIOoGAAD-AwAgB0UAAPwSACBGAACEEwAg5AYAAP0SACDlBgAAgxMAIOgGAAAyACDpBgAAMgAg6gYAAP4BACALRQAAmw4AMEYAAKAOADDkBgAAnA4AMOUGAACdDgAw5gYAAJ4OACDnBgAAnw4AMOgGAACfDgAw6QYAAJ8OADDqBgAAnw4AMOsGAAChDgAw7AYAAKIOADALRQAAjw4AMEYAAJQOADDkBgAAkA4AMOUGAACRDgAw5gYAAJIOACDnBgAAkw4AMOgGAACTDgAw6QYAAJMOADDqBgAAkw4AMOsGAACVDgAw7AYAAJYOADALRQAAhg4AMEYAAIoOADDkBgAAhw4AMOUGAACIDgAw5gYAAIkOACDnBgAAlQsAMOgGAACVCwAw6QYAAJULADDqBgAAlQsAMOsGAACLDgAw7AYAAJgLADAXAwAA5woAIA4AAOgKACAYAADqCgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB4wUBAAAAAeQFAQAAAAHlBQEAAAAB5gUBAAAAAegFAQAAAAHpBQEAAAAB6gUCAAAAAesFEAAAAAHsBRAAAAAB7QUQAAAAAe4FAQAAAAHvBQEAAAAB8AUBAAAAAfEFQAAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAECAAAAKAAgRQAAjg4AIAMAAAAoACBFAACODgAgRgAAjQ4AIAE-AACCEwAwAgAAACgAID4AAI0OACACAAAAmQsAID4AAIwOACAUtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh4wUBALEKACHkBQEAtAoAIeUFAQCxCgAh5gUBALQKACHoBQEAtAoAIekFAQC0CgAh6gUCAMIKACHrBRAA4goAIewFEADiCgAh7QUQAOIKACHuBQEAtAoAIe8FAQC0CgAh8AUBALQKACHxBUAAtgoAIfIFAQCxCgAh8wUBALQKACH0BQEAtAoAIRcDAADjCgAgDgAA5AoAIBgAAOYKACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHjBQEAsQoAIeQFAQC0CgAh5QUBALEKACHmBQEAtAoAIegFAQC0CgAh6QUBALQKACHqBQIAwgoAIesFEADiCgAh7AUQAOIKACHtBRAA4goAIe4FAQC0CgAh7wUBALQKACHwBQEAtAoAIfEFQAC2CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAhFwMAAOcKACAOAADoCgAgGAAA6goAILQFAQAAAAG5BQEAAAABuwVAAAAAAeMFAQAAAAHkBQEAAAAB5QUBAAAAAeYFAQAAAAHoBQEAAAAB6QUBAAAAAeoFAgAAAAHrBRAAAAAB7AUQAAAAAe0FEAAAAAHuBQEAAAAB7wUBAAAAAfAFAQAAAAHxBUAAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAABBrQFAQAAAAG7BUAAAAAB8AUBAAAAAasGAQAAAAGsBhAAAAABrQZAAAAAAQIAAAA7ACBFAACaDgAgAwAAADsAIEUAAJoOACBGAACZDgAgAT4AAIETADALEQAAkwoAILEFAACSCgAwsgUAADkAELMFAACSCgAwtAUBAAAAAbsFQACBCQAh5wUBAP0IACHwBQEA_wgAIasGAQD9CAAhrAYQAP8JACGtBkAAgQkAIQIAAAA7ACA-AACZDgAgAgAAAJcOACA-AACYDgAgCrEFAACWDgAwsgUAAJcOABCzBQAAlg4AMLQFAQD9CAAhuwVAAIEJACHnBQEA_QgAIfAFAQD_CAAhqwYBAP0IACGsBhAA_wkAIa0GQACBCQAhCrEFAACWDgAwsgUAAJcOABCzBQAAlg4AMLQFAQD9CAAhuwVAAIEJACHnBQEA_QgAIfAFAQD_CAAhqwYBAP0IACGsBhAA_wkAIa0GQACBCQAhBrQFAQCxCgAhuwVAALYKACHwBQEAtAoAIasGAQCxCgAhrAYQALgLACGtBkAAtgoAIQa0BQEAsQoAIbsFQAC2CgAh8AUBALQKACGrBgEAsQoAIawGEAC4CwAhrQZAALYKACEGtAUBAAAAAbsFQAAAAAHwBQEAAAABqwYBAAAAAawGEAAAAAGtBkAAAAABCAMAAP0NACC0BQEAAAABuQUBAAAAAbsFQAAAAAHzBQEAAAAB9AUBAAAAAa8GAAAArwYCsAZAAAAAAQIAAAA2ACBFAACmDgAgAwAAADYAIEUAAKYOACBGAAClDgAgAT4AAIATADANAwAAhwoAIBEAAJMKACCxBQAAlAoAMLIFAAA0ABCzBQAAlAoAMLQFAQAAAAG5BQEA_wgAIbsFQACBCQAh5wUBAP0IACHzBQEA_wgAIfQFAQD_CAAhrwYAAI4KrwYisAZAAIEJACECAAAANgAgPgAApQ4AIAIAAACjDgAgPgAApA4AIAuxBQAAog4AMLIFAACjDgAQswUAAKIOADC0BQEA_QgAIbkFAQD_CAAhuwVAAIEJACHnBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGvBgAAjgqvBiKwBkAAgQkAIQuxBQAAog4AMLIFAACjDgAQswUAAKIOADC0BQEA_QgAIbkFAQD_CAAhuwVAAIEJACHnBQEA_QgAIfMFAQD_CAAh9AUBAP8IACGvBgAAjgqvBiKwBkAAgQkAIQe0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHzBQEAtAoAIfQFAQC0CgAhrwYAAL0NrwYisAZAALYKACEIAwAA-w0AILQFAQCxCgAhuQUBALQKACG7BUAAtgoAIfMFAQC0CgAh9AUBALQKACGvBgAAvQ2vBiKwBkAAtgoAIQgDAAD9DQAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAGvBgAAAK8GArAGQAAAAAEDRQAA_hIAIOQGAAD_EgAg6gYAAP4DACADRQAA_BIAIOQGAAD9EgAg6gYAAP4BACAERQAAmw4AMOQGAACcDgAw5gYAAJ4OACDqBgAAnw4AMARFAACPDgAw5AYAAJAOADDmBgAAkg4AIOoGAACTDgAwBEUAAIYOADDkBgAAhw4AMOYGAACJDgAg6gYAAJULADAAAAALRQAAsA4AMEYAALUOADDkBgAAsQ4AMOUGAACyDgAw5gYAALMOACDnBgAAtA4AMOgGAAC0DgAw6QYAALQOADDqBgAAtA4AMOsGAAC2DgAw7AYAALcOADALEwAA7A0AIBQAAO0NACAVAADuDQAgFgAA7w0AILQFAQAAAAHlBQEAAAABsQYBAAAAAbMGAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABAgAAAEQAIEUAALsOACADAAAARAAgRQAAuw4AIEYAALoOACABPgAA-xIAMBASAACQCgAgEwAAhwoAIBQAANgJACAVAACRCgAgFgAAmQkAILEFAACPCgAwsgUAAEEAELMFAACPCgAwtAUBAAAAAeUFAQD_CAAhsQYBAAAAAbIGAQD9CAAhswYBAP8IACG0BgAAjgqvBiK1BgEA_wgAIbYGAADvCQAgAgAAAEQAID4AALoOACACAAAAuA4AID4AALkOACALsQUAALcOADCyBQAAuA4AELMFAAC3DgAwtAUBAP0IACHlBQEA_wgAIbEGAQD9CAAhsgYBAP0IACGzBgEA_wgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACALsQUAALcOADCyBQAAuA4AELMFAAC3DgAwtAUBAP0IACHlBQEA_wgAIbEGAQD9CAAhsgYBAP0IACGzBgEA_wgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACAHtAUBALEKACHlBQEAtAoAIbEGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAELEwAAxg0AIBQAAMcNACAVAADIDQAgFgAAyQ0AILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbMGAQC0CgAhtAYAAL0NrwYitQYBALQKACG2BoAAAAABCxMAAOwNACAUAADtDQAgFQAA7g0AIBYAAO8NACC0BQEAAAAB5QUBAAAAAbEGAQAAAAGzBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAQRFAACwDgAw5AYAALEOADDmBgAAsw4AIOoGAAC0DgAwAAAAAAtFAADCDgAwRgAAxw4AMOQGAADDDgAw5QYAAMQOADDmBgAAxQ4AIOcGAADGDgAw6AYAAMYOADDpBgAAxg4AMOoGAADGDgAw6wYAAMgOADDsBgAAyQ4AMA0TAACoDgAgFAAAqQ4AIBUAAKoOACAWAACrDgAgtAUBAAAAAeUFAQAAAAH9BQEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAbcGAQAAAAG4BgEAAAABuQYBAAAAAQIAAAAvACBFAADNDgAgAwAAAC8AIEUAAM0OACBGAADMDgAgAT4AAPoSADASEgAAlgoAIBMAAIcKACAUAADXCQAgFQAAlwoAIBYAAJkJACCxBQAAlQoAMLIFAAAsABCzBQAAlQoAMLQFAQAAAAHlBQEA_wgAIf0FAQD9CAAhsgYBAP0IACG0BgAAjgqvBiK1BgEA_wgAIbYGAADvCQAgtwYBAAAAAbgGAQD_CAAhuQYBAP8IACECAAAALwAgPgAAzA4AIAIAAADKDgAgPgAAyw4AIA2xBQAAyQ4AMLIFAADKDgAQswUAAMkOADC0BQEA_QgAIeUFAQD_CAAh_QUBAP0IACGyBgEA_QgAIbQGAACOCq8GIrUGAQD_CAAhtgYAAO8JACC3BgEA_QgAIbgGAQD_CAAhuQYBAP8IACENsQUAAMkOADCyBQAAyg4AELMFAADJDgAwtAUBAP0IACHlBQEA_wgAIf0FAQD9CAAhsgYBAP0IACG0BgAAjgqvBiK1BgEA_wgAIbYGAADvCQAgtwYBAP0IACG4BgEA_wgAIbkGAQD_CAAhCbQFAQCxCgAh5QUBALQKACH9BQEAsQoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAbcGAQCxCgAhuAYBALQKACG5BgEAtAoAIQ0TAACCDgAgFAAAgw4AIBUAAIQOACAWAACFDgAgtAUBALEKACHlBQEAtAoAIf0FAQCxCgAhtAYAAL0NrwYitQYBALQKACG2BoAAAAABtwYBALEKACG4BgEAtAoAIbkGAQC0CgAhDRMAAKgOACAUAACpDgAgFQAAqg4AIBYAAKsOACC0BQEAAAAB5QUBAAAAAf0FAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABtwYBAAAAAbgGAQAAAAG5BgEAAAABBEUAAMIOADDkBgAAww4AMOYGAADFDgAg6gYAAMYOADAAAAAAAAAB5wYAAAC8BgIFRQAA8hIAIEYAAPgSACDkBgAA8xIAIOUGAAD3EgAg6gYAAP4BACAFRQAA8BIAIEYAAPUSACDkBgAA8RIAIOUGAAD0EgAg6gYAABQAIANFAADyEgAg5AYAAPMSACDqBgAA_gEAIANFAADwEgAg5AYAAPESACDqBgAAFAAgAAAAAAAHRQAA6xIAIEYAAO4SACDkBgAA7BIAIOUGAADtEgAg6AYAAAMAIOkGAAADACDqBgAABQAgA0UAAOsSACDkBgAA7BIAIOoGAAAFACAAAAAAAAHnBgAAAMEGAgVFAADgEgAgRgAA6RIAIOQGAADhEgAg5QYAAOgSACDqBgAAFAAgB0UAAN4SACBGAADmEgAg5AYAAN8SACDlBgAA5RIAIOgGAAAyACDpBgAAMgAg6gYAAP4BACAFRQAA3BIAIEYAAOMSACDkBgAA3RIAIOUGAADiEgAg6gYAAP4BACADRQAA4BIAIOQGAADhEgAg6gYAABQAIANFAADeEgAg5AYAAN8SACDqBgAA_gEAIANFAADcEgAg5AYAAN0SACDqBgAA_gEAIAAAAAAABUUAANcSACBGAADaEgAg5AYAANgSACDlBgAA2RIAIOoGAACLBwAgA0UAANcSACDkBgAA2BIAIOoGAACLBwAgAAAAAAAFRQAAzxIAIEYAANUSACDkBgAA0BIAIOUGAADUEgAg6gYAAP4BACAFRQAAzRIAIEYAANISACDkBgAAzhIAIOUGAADREgAg6gYAABQAIANFAADPEgAg5AYAANASACDqBgAA_gEAIANFAADNEgAg5AYAAM4SACDqBgAAFAAgAAAAAAAFRQAAyBIAIEYAAMsSACDkBgAAyRIAIOUGAADKEgAg6gYAABQAIANFAADIEgAg5AYAAMkSACDqBgAAFAAgAAAABUUAAL0SACBGAADGEgAg5AYAAL4SACDlBgAAxRIAIOoGAAANACALRQAAxA8AMEYAAMkPADDkBgAAxQ8AMOUGAADGDwAw5gYAAMcPACDnBgAAyA8AMOgGAADIDwAw6QYAAMgPADDqBgAAyA8AMOsGAADKDwAw7AYAAMsPADALRQAAuA8AMEYAAL0PADDkBgAAuQ8AMOUGAAC6DwAw5gYAALsPACDnBgAAvA8AMOgGAAC8DwAw6QYAALwPADDqBgAAvA8AMOsGAAC-DwAw7AYAAL8PADALRQAArw8AMEYAALMPADDkBgAAsA8AMOUGAACxDwAw5gYAALIPACDnBgAAsQsAMOgGAACxCwAw6QYAALELADDqBgAAsQsAMOsGAAC0DwAw7AYAALQLADALRQAAow8AMEYAAKgPADDkBgAApA8AMOUGAAClDwAw5gYAAKYPACDnBgAApw8AMOgGAACnDwAw6QYAAKcPADDqBgAApw8AMOsGAACpDwAw7AYAAKoPADALRQAAmg8AMEYAAJ4PADDkBgAAmw8AMOUGAACcDwAw5gYAAJ0PACDnBgAAkwwAMOgGAACTDAAw6QYAAJMMADDqBgAAkwwAMOsGAACfDwAw7AYAAJYMADALRQAAjg8AMEYAAJMPADDkBgAAjw8AMOUGAACQDwAw5gYAAJEPACDnBgAAkg8AMOgGAACSDwAw6QYAAJIPADDqBgAAkg8AMOsGAACUDwAw7AYAAJUPADAKAwAA2A4AILQFAQAAAAG5BQEAAAABuwVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAasGAAAAvAYCvAYQAAAAAb0GQAAAAAECAAAAbgAgRQAAmQ8AIAMAAABuACBFAACZDwAgRgAAmA8AIAE-AADEEgAwDwMAAPAJACAKAACDCgAgsQUAAIEKADCyBQAAbAAQswUAAIEKADC0BQEAAAABuQUBAP0IACG7BUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACCCrwGIroGAQD9CAAhvAYQAPMJACG9BkAAgQkAIQIAAABuACA-AACYDwAgAgAAAJYPACA-AACXDwAgDbEFAACVDwAwsgUAAJYPABCzBQAAlQ8AMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACCCrwGIroGAQD9CAAhvAYQAPMJACG9BkAAgQkAIQ2xBQAAlQ8AMLIFAACWDwAQswUAAJUPADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHwBQEA_wgAIfMFAQD_CAAh9AUBAP8IACGrBgAAggq8BiK6BgEA_QgAIbwGEADzCQAhvQZAAIEJACEJtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAANUOvAYivAYQAOIKACG9BkAAtgoAIQoDAADWDgAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAANUOvAYivAYQAOIKACG9BkAAtgoAIQoDAADYDgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAAC8BgK8BhAAAAABvQZAAAAAAQ4DAACdDAAgDwAA4A4AILQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHwBQEAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAbwGEAAAAAG-BgEAAAABvwZAAAAAAQIAAABpACBFAACiDwAgAwAAAGkAIEUAAKIPACBGAAChDwAgAT4AAMMSADACAAAAaQAgPgAAoQ8AIAIAAACXDAAgPgAAoA8AIAy0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHRBQEAtAoAIfAFAQC0CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACG8BhAA4goAIb4GAQC0CgAhvwZAALYKACEOAwAAmgwAIA8AAN8OACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHRBQEAtAoAIfAFAQC0CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACG8BhAA4goAIb4GAQC0CgAhvwZAALYKACEOAwAAnQwAIA8AAOAOACC0BQEAAAABuQUBAAAAAbsFQAAAAAHRBQEAAAAB8AUBAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAG8BhAAAAABvgYBAAAAAb8GQAAAAAEPGwAA6w4AIBwAAOwOACC0BQEAAAABuwVAAAAAAekFAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAAMEGArAGQAAAAAHBBgEAAAABwgYBAAAAAcMGEAAAAAHEBhAAAAABxQYBAAAAAQIAAABkACBFAACuDwAgAwAAAGQAIEUAAK4PACBGAACtDwAgAT4AAMISADAUCgAAgwoAIBsAAIcKACAcAADwCQAgsQUAAIUKADCyBQAAYgAQswUAAIUKADC0BQEAAAABuwVAAIEJACHpBQEA_wgAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIasGAACGCsEGIrAGQACBCQAhugYBAP0IACHBBgEA_wgAIcIGAQD9CAAhwwYQAPMJACHEBhAA_wkAIcUGAQD_CAAhAgAAAGQAID4AAK0PACACAAAAqw8AID4AAKwPACARsQUAAKoPADCyBQAAqw8AELMFAACqDwAwtAUBAP0IACG7BUAAgQkAIekFAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhqwYAAIYKwQYisAZAAIEJACG6BgEA_QgAIcEGAQD_CAAhwgYBAP0IACHDBhAA8wkAIcQGEAD_CQAhxQYBAP8IACERsQUAAKoPADCyBQAAqw8AELMFAACqDwAwtAUBAP0IACG7BUAAgQkAIekFAQD_CAAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhqwYAAIYKwQYisAZAAIEJACG6BgEA_QgAIcEGAQD_CAAhwgYBAP0IACHDBhAA8wkAIcQGEAD_CQAhxQYBAP8IACENtAUBALEKACG7BUAAtgoAIekFAQC0CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAAOYOwQYisAZAALYKACHBBgEAtAoAIcIGAQCxCgAhwwYQAOIKACHEBhAAuAsAIcUGAQC0CgAhDxsAAOgOACAcAADpDgAgtAUBALEKACG7BUAAtgoAIekFAQC0CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAAOYOwQYisAZAALYKACHBBgEAtAoAIcIGAQCxCgAhwwYQAOIKACHEBhAAuAsAIcUGAQC0CgAhDxsAAOsOACAcAADsDgAgtAUBAAAAAbsFQAAAAAHpBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAADBBgKwBkAAAAABwQYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAEVAwAAyAsAIA4AAPMOACAZAADJCwAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABvAYQAAAAAccGAAAAxwYCyAYQAAAAAckGAQAAAAHKBgEAAAABywZAAAAAAQIAAAAeACBFAAC3DwAgAwAAAB4AIEUAALcPACBGAAC2DwAgAT4AAMESADACAAAAHgAgPgAAtg8AIAIAAAC1CwAgPgAAtQ8AIBK0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHmBQEAsQoAIekFAQC0CgAh7QUQALgLACHvBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIZQGAQC0CgAhlQYBALQKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhFQMAALsLACAOAADyDgAgGQAAvAsAILQFAQCxCgAhuQUBALQKACG7BUAAtgoAIeYFAQCxCgAh6QUBALQKACHtBRAAuAsAIe8FAQC0CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhlAYBALQKACGVBgEAtAoAIbwGEADiCgAhxwYAALcLxwYiyAYQALgLACHJBgEAtAoAIcoGAQC0CgAhywZAALYKACEVAwAAyAsAIA4AAPMOACAZAADJCwAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABvAYQAAAAAccGAAAAxwYCyAYQAAAAAckGAQAAAAHKBgEAAAABywZAAAAAAQQDAAD7DgAguQUBAAAAAbwFQAAAAAG8BhAAAAABAgAAAAkAIEUAAMMPACADAAAACQAgRQAAww8AIEYAAMIPACABPgAAwBIAMAoDAADwCQAgCgAAgwoAILEFAACrCgAwsgUAAAcAELMFAACrCgAwuQUBAP0IACG8BUAAgQkAIboGAQD9CAAhvAYQAPMJACHhBgAAqgoAIAIAAAAJACA-AADCDwAgAgAAAMAPACA-AADBDwAgB7EFAAC_DwAwsgUAAMAPABCzBQAAvw8AMLkFAQD9CAAhvAVAAIEJACG6BgEA_QgAIbwGEADzCQAhB7EFAAC_DwAwsgUAAMAPABCzBQAAvw8AMLkFAQD9CAAhvAVAAIEJACG6BgEA_QgAIbwGEADzCQAhA7kFAQCxCgAhvAVAALYKACG8BhAA4goAIQQDAAD5DgAguQUBALEKACG8BUAAtgoAIbwGEADiCgAhBAMAAPsOACC5BQEAAAABvAVAAAAAAbwGEAAAAAECvAVAAAAAAbwGEAAAAAECAAAAGQAgRQAAzw8AIAMAAAAZACBFAADPDwAgRgAAzg8AIAE-AAC_EgAwBwoAAIMKACCxBQAAoAoAMLIFAAAXABCzBQAAoAoAMLwFQACBCQAhugYBAAAAAbwGEADzCQAhAgAAABkAID4AAM4PACACAAAAzA8AID4AAM0PACAGsQUAAMsPADCyBQAAzA8AELMFAADLDwAwvAVAAIEJACG6BgEA_QgAIbwGEADzCQAhBrEFAADLDwAwsgUAAMwPABCzBQAAyw8AMLwFQACBCQAhugYBAP0IACG8BhAA8wkAIQK8BUAAtgoAIbwGEADiCgAhArwFQAC2CgAhvAYQAOIKACECvAVAAAAAAbwGEAAAAAEDRQAAvRIAIOQGAAC-EgAg6gYAAA0AIARFAADEDwAw5AYAAMUPADDmBgAAxw8AIOoGAADIDwAwBEUAALgPADDkBgAAuQ8AMOYGAAC7DwAg6gYAALwPADAERQAArw8AMOQGAACwDwAw5gYAALIPACDqBgAAsQsAMARFAACjDwAw5AYAAKQPADDmBgAApg8AIOoGAACnDwAwBEUAAJoPADDkBgAAmw8AMOYGAACdDwAg6gYAAJMMADAERQAAjg8AMOQGAACPDwAw5gYAAJEPACDqBgAAkg8AMAAAAAAABUUAALQSACBGAAC7EgAg5AYAALUSACDlBgAAuhIAIOoGAACWAgAgBUUAALISACBGAAC4EgAg5AYAALMSACDlBgAAtxIAIOoGAACvAgAgC0UAAN8PADBGAADkDwAw5AYAAOAPADDlBgAA4Q8AMOYGAADiDwAg5wYAAOMPADDoBgAA4w8AMOkGAADjDwAw6gYAAOMPADDrBgAA5Q8AMOwGAADmDwAwCAsAANEPACAMAADSDwAgDQAA0w8AIB0AANQPACAeAADVDwAgHwAA1g8AILQFAQAAAAHNBgEAAAABAgAAABQAIEUAAOoPACADAAAAFAAgRQAA6g8AIEYAAOkPACABPgAAthIAMA4JAACjCgAgCwAApAoAIAwAANMJACANAACXCQAgHQAA1AkAIB4AANUJACAfAADWCQAgsQUAAKIKADCyBQAAEgAQswUAAKIKADC0BQEAAAABzAYBAP0IACHNBgEA_QgAId8GAAChCgAgAgAAABQAID4AAOkPACACAAAA5w8AID4AAOgPACAGsQUAAOYPADCyBQAA5w8AELMFAADmDwAwtAUBAP0IACHMBgEA_QgAIc0GAQD9CAAhBrEFAADmDwAwsgUAAOcPABCzBQAA5g8AMLQFAQD9CAAhzAYBAP0IACHNBgEA_QgAIQK0BQEAsQoAIc0GAQCxCgAhCAsAAIgPACAMAACJDwAgDQAAig8AIB0AAIsPACAeAACMDwAgHwAAjQ8AILQFAQCxCgAhzQYBALEKACEICwAA0Q8AIAwAANIPACANAADTDwAgHQAA1A8AIB4AANUPACAfAADWDwAgtAUBAAAAAc0GAQAAAAEDRQAAtBIAIOQGAAC1EgAg6gYAAJYCACADRQAAshIAIOQGAACzEgAg6gYAAK8CACAERQAA3w8AMOQGAADgDwAw5gYAAOIPACDqBgAA4w8AMAAAAAtFAADyDwAwRgAA9w8AMOQGAADzDwAw5QYAAPQPADDmBgAA9Q8AIOcGAAD2DwAw6AYAAPYPADDpBgAA9g8AMOoGAAD2DwAw6wYAAPgPADDsBgAA-Q8AMAgGAADrDwAgCAAA7Q8AILQFAQAAAAH1BQEAAAAB_QUBAAAAAf4FIAAAAAG2BoAAAAABzwYQAAAAAQIAAAANACBFAAD9DwAgAwAAAA0AIEUAAP0PACBGAAD8DwAgAT4AALESADAOBgAApwoAIAcAAKgKACAIAACpCgAgsQUAAKYKADCyBQAACwAQswUAAKYKADC0BQEAAAAB9QUBAP0IACH9BQEA_QgAIf4FIAD-CAAhtgYAAO8JACDOBgEA_QgAIc8GEAD_CQAh4AYAAKUKACACAAAADQAgPgAA_A8AIAIAAAD6DwAgPgAA-w8AIAqxBQAA-Q8AMLIFAAD6DwAQswUAAPkPADC0BQEA_QgAIfUFAQD9CAAh_QUBAP0IACH-BSAA_ggAIbYGAADvCQAgzgYBAP0IACHPBhAA_wkAIQqxBQAA-Q8AMLIFAAD6DwAQswUAAPkPADC0BQEA_QgAIfUFAQD9CAAh_QUBAP0IACH-BSAA_ggAIbYGAADvCQAgzgYBAP0IACHPBhAA_wkAIQa0BQEAsQoAIfUFAQCxCgAh_QUBALEKACH-BSAAswoAIbYGgAAAAAHPBhAAuAsAIQgGAADcDwAgCAAA3g8AILQFAQCxCgAh9QUBALEKACH9BQEAsQoAIf4FIACzCgAhtgaAAAAAAc8GEAC4CwAhCAYAAOsPACAIAADtDwAgtAUBAAAAAfUFAQAAAAH9BQEAAAAB_gUgAAAAAbYGgAAAAAHPBhAAAAABBEUAAPIPADDkBgAA8w8AMOYGAAD1DwAg6gYAAPYPADAAAAAAC0UAAIQQADBGAACIEAAw5AYAAIUQADDlBgAAhhAAMOYGAACHEAAg5wYAAPYPADDoBgAA9g8AMOkGAAD2DwAw6gYAAPYPADDrBgAAiRAAMOwGAAD5DwAwCAcAAOwPACAIAADtDwAgtAUBAAAAAf0FAQAAAAH-BSAAAAABtgaAAAAAAc4GAQAAAAHPBhAAAAABAgAAAA0AIEUAAIwQACADAAAADQAgRQAAjBAAIEYAAIsQACABPgAAsBIAMAIAAAANACA-AACLEAAgAgAAAPoPACA-AACKEAAgBrQFAQCxCgAh_QUBALEKACH-BSAAswoAIbYGgAAAAAHOBgEAsQoAIc8GEAC4CwAhCAcAAN0PACAIAADeDwAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhtgaAAAAAAc4GAQCxCgAhzwYQALgLACEIBwAA7A8AIAgAAO0PACC0BQEAAAAB_QUBAAAAAf4FIAAAAAG2BoAAAAABzgYBAAAAAc8GEAAAAAEERQAAhBAAMOQGAACFEAAw5gYAAIcQACDqBgAA9g8AMAAAAAHnBgAAANIGAgtFAACsEQAwRgAAsBEAMOQGAACtEQAw5QYAAK4RADDmBgAArxEAIOcGAAC8DwAw6AYAALwPADDpBgAAvA8AMOoGAAC8DwAw6wYAALERADDsBgAAvw8AMAtFAACjEQAwRgAApxEAMOQGAACkEQAw5QYAAKURADDmBgAAphEAIOcGAACxCwAw6AYAALELADDpBgAAsQsAMOoGAACxCwAw6wYAAKgRADDsBgAAtAsAMAtFAACaEQAwRgAAnhEAMOQGAACbEQAw5QYAAJwRADDmBgAAnREAIOcGAACnDwAw6AYAAKcPADDpBgAApw8AMOoGAACnDwAw6wYAAJ8RADDsBgAAqg8AMAtFAACREQAwRgAAlREAMOQGAACSEQAw5QYAAJMRADDmBgAAlBEAIOcGAACnDwAw6AYAAKcPADDpBgAApw8AMOoGAACnDwAw6wYAAJYRADDsBgAAqg8AMAtFAACIEQAwRgAAjBEAMOQGAACJEQAw5QYAAIoRADDmBgAAixEAIOcGAACTDAAw6AYAAJMMADDpBgAAkwwAMOoGAACTDAAw6wYAAI0RADDsBgAAlgwAMAtFAAD_EAAwRgAAgxEAMOQGAACAEQAw5QYAAIERADDmBgAAghEAIOcGAACSDwAw6AYAAJIPADDpBgAAkg8AMOoGAACSDwAw6wYAAIQRADDsBgAAlQ8AMAtFAAD2EAAwRgAA-hAAMOQGAAD3EAAw5QYAAPgQADDmBgAA-RAAIOcGAACfDgAw6AYAAJ8OADDpBgAAnw4AMOoGAACfDgAw6wYAAPsQADDsBgAAog4AMAtFAADtEAAwRgAA8RAAMOQGAADuEAAw5QYAAO8QADDmBgAA8BAAIOcGAADjDQAw6AYAAOMNADDpBgAA4w0AMOoGAADjDQAw6wYAAPIQADDsBgAA5g0AMAtFAADkEAAwRgAA6BAAMOQGAADlEAAw5QYAAOYQADDmBgAA5xAAIOcGAACjDAAw6AYAAKMMADDpBgAAowwAMOoGAACjDAAw6wYAAOkQADDsBgAApgwAMAtFAADbEAAwRgAA3xAAMOQGAADcEAAw5QYAAN0QADDmBgAA3hAAIOcGAAChCwAw6AYAAKELADDpBgAAoQsAMOoGAAChCwAw6wYAAOAQADDsBgAApAsAMAtFAADPEAAwRgAA1BAAMOQGAADQEAAw5QYAANEQADDmBgAA0hAAIOcGAADTEAAw6AYAANMQADDpBgAA0xAAMOoGAADTEAAw6wYAANUQADDsBgAA1hAAMAtFAADGEAAwRgAAyhAAMOQGAADHEAAw5QYAAMgQADDmBgAAyRAAIOcGAACACwAw6AYAAIALADDpBgAAgAsAMOoGAACACwAw6wYAAMsQADDsBgAAgwsAMAtFAAC9EAAwRgAAwRAAMOQGAAC-EAAw5QYAAL8QADDmBgAAwBAAIOcGAADGDgAw6AYAAMYOADDpBgAAxg4AMOoGAADGDgAw6wYAAMIQADDsBgAAyQ4AMAtFAAC0EAAwRgAAuBAAMOQGAAC1EAAw5QYAALYQADDmBgAAtxAAIOcGAAC0DgAw6AYAALQOADDpBgAAtA4AMOoGAAC0DgAw6wYAALkQADDsBgAAtw4AMAtFAACrEAAwRgAArxAAMOQGAACsEAAw5QYAAK0QADDmBgAArhAAIOcGAADnCwAw6AYAAOcLADDpBgAA5wsAMOoGAADnCwAw6wYAALAQADDsBgAA6gsAMAtFAACiEAAwRgAAphAAMOQGAACjEAAw5QYAAKQQADDmBgAApRAAIOcGAACVCwAw6AYAAJULADDpBgAAlQsAMOoGAACVCwAw6wYAAKcQADDsBgAAmAsAMBcOAADoCgAgEQAA6QoAIBgAAOoKACC0BQEAAAABuwVAAAAAAeMFAQAAAAHkBQEAAAAB5QUBAAAAAeYFAQAAAAHnBQEAAAAB6AUBAAAAAekFAQAAAAHqBQIAAAAB6wUQAAAAAewFEAAAAAHtBRAAAAAB7gUBAAAAAe8FAQAAAAHwBQEAAAAB8QVAAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAQIAAAAoACBFAACqEAAgAwAAACgAIEUAAKoQACBGAACpEAAgAT4AAK8SADACAAAAKAAgPgAAqRAAIAIAAACZCwAgPgAAqBAAIBS0BQEAsQoAIbsFQAC2CgAh4wUBALEKACHkBQEAtAoAIeUFAQCxCgAh5gUBALQKACHnBQEAtAoAIegFAQC0CgAh6QUBALQKACHqBQIAwgoAIesFEADiCgAh7AUQAOIKACHtBRAA4goAIe4FAQC0CgAh7wUBALQKACHwBQEAtAoAIfEFQAC2CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAhFw4AAOQKACARAADlCgAgGAAA5goAILQFAQCxCgAhuwVAALYKACHjBQEAsQoAIeQFAQC0CgAh5QUBALEKACHmBQEAtAoAIecFAQC0CgAh6AUBALQKACHpBQEAtAoAIeoFAgDCCgAh6wUQAOIKACHsBRAA4goAIe0FEADiCgAh7gUBALQKACHvBQEAtAoAIfAFAQC0CgAh8QVAALYKACHyBQEAsQoAIfMFAQC0CgAh9AUBALQKACEXDgAA6AoAIBEAAOkKACAYAADqCgAgtAUBAAAAAbsFQAAAAAHjBQEAAAAB5AUBAAAAAeUFAQAAAAHmBQEAAAAB5wUBAAAAAegFAQAAAAHpBQEAAAAB6gUCAAAAAesFEAAAAAHsBRAAAAAB7QUQAAAAAe4FAQAAAAHvBQEAAAAB8AUBAAAAAfEFQAAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAEHDwAA2AoAIDIAANkKACC0BQEAAAAB0QUBAAAAAdIFQAAAAAHTBYAAAAAB1AVAAAAAAQIAAACiAQAgRQAAsxAAIAMAAACiAQAgRQAAsxAAIEYAALIQACABPgAArhIAMAIAAACiAQAgPgAAshAAIAIAAADrCwAgPgAAsRAAIAW0BQEAsQoAIdEFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACEHDwAAyQoAIDIAAMoKACC0BQEAsQoAIdEFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACEHDwAA2AoAIDIAANkKACC0BQEAAAAB0QUBAAAAAdIFQAAAAAHTBYAAAAAB1AVAAAAAAQsSAADrDQAgFAAA7Q0AIBUAAO4NACAWAADvDQAgtAUBAAAAAeUFAQAAAAGxBgEAAAABsgYBAAAAAbMGAQAAAAG0BgAAAK8GArYGgAAAAAECAAAARAAgRQAAvBAAIAMAAABEACBFAAC8EAAgRgAAuxAAIAE-AACtEgAwAgAAAEQAID4AALsQACACAAAAuA4AID4AALoQACAHtAUBALEKACHlBQEAtAoAIbEGAQCxCgAhsgYBALEKACGzBgEAtAoAIbQGAAC9Da8GIrYGgAAAAAELEgAAxQ0AIBQAAMcNACAVAADIDQAgFgAAyQ0AILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK2BoAAAAABCxIAAOsNACAUAADtDQAgFQAA7g0AIBYAAO8NACC0BQEAAAAB5QUBAAAAAbEGAQAAAAGyBgEAAAABswYBAAAAAbQGAAAArwYCtgaAAAAAAQ0SAACnDgAgFAAAqQ4AIBUAAKoOACAWAACrDgAgtAUBAAAAAeUFAQAAAAH9BQEAAAABsgYBAAAAAbQGAAAArwYCtgaAAAAAAbcGAQAAAAG4BgEAAAABuQYBAAAAAQIAAAAvACBFAADFEAAgAwAAAC8AIEUAAMUQACBGAADEEAAgAT4AAKwSADACAAAALwAgPgAAxBAAIAIAAADKDgAgPgAAwxAAIAm0BQEAsQoAIeUFAQC0CgAh_QUBALEKACGyBgEAsQoAIbQGAAC9Da8GIrYGgAAAAAG3BgEAsQoAIbgGAQC0CgAhuQYBALQKACENEgAAgQ4AIBQAAIMOACAVAACEDgAgFgAAhQ4AILQFAQCxCgAh5QUBALQKACH9BQEAsQoAIbIGAQCxCgAhtAYAAL0NrwYitgaAAAAAAbcGAQCxCgAhuAYBALQKACG5BgEAtAoAIQ0SAACnDgAgFAAAqQ4AIBUAAKoOACAWAACrDgAgtAUBAAAAAeUFAQAAAAH9BQEAAAABsgYBAAAAAbQGAAAArwYCtgaAAAAAAbcGAQAAAAG4BgEAAAABuQYBAAAAARAGAAD1CgAgDwAA9woAIBoAAPYKACC0BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-gUBAAAAAfsFQAAAAAH8BQEAAAABAgAAAFsAIEUAAM4QACADAAAAWwAgRQAAzhAAIEYAAM0QACABPgAAqxIAMAIAAABbACA-AADNEAAgAgAAAIQLACA-AADMEAAgDbQFAQCxCgAhuwVAALYKACHRBQEAtAoAIfMFAQC0CgAh9AUBALQKACH1BQEAsQoAIfYFEADiCgAh9wUBALQKACH4BQEAtAoAIfkFAQC0CgAh-gUBALQKACH7BUAAtgoAIfwFAQC0CgAhEAYAAPEKACAPAADzCgAgGgAA8goAILQFAQCxCgAhuwVAALYKACHRBQEAtAoAIfMFAQC0CgAh9AUBALQKACH1BQEAsQoAIfYFEADiCgAh9wUBALQKACH4BQEAtAoAIfkFAQC0CgAh-gUBALQKACH7BUAAtgoAIfwFAQC0CgAhEAYAAPUKACAPAAD3CgAgGgAA9goAILQFAQAAAAG7BUAAAAAB0QUBAAAAAfMFAQAAAAH0BQEAAAAB9QUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAEUEAAAtQwAIBkAALQMACAeAACyDAAgJgAAsQwAIDMAALYMACA0AACwDAAgNgAAswwAILQFAQAAAAG7BUAAAAAB0gVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAYoGAQAAAAGLBgEAAAABjAYBAAAAAY0GAQAAAAGOBgEAAAABjwYBAAAAAZAGgAAAAAECAAAABQAgRQAA2hAAIAMAAAAFACBFAADaEAAgRgAA2RAAIAE-AACqEgAwGQMAAPAJACAQAACYCQAgGQAAlAkAIB4AANUJACAmAADZCQAgMwAA2wkAIDQAAOYJACA2AADjCQAgsQUAAKwKADCyBQAAAwAQswUAAKwKADC0BQEAAAABuQUBAP0IACG7BUAAgQkAIdIFQACBCQAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhigYBAP0IACGLBgEA_wgAIYwGAQD_CAAhjQYBAP8IACGOBgEA_wgAIY8GAQD_CAAhkAYAAO8JACACAAAABQAgPgAA2RAAIAIAAADXEAAgPgAA2BAAIBGxBQAA1hAAMLIFAADXEAAQswUAANYQADC0BQEA_QgAIbkFAQD9CAAhuwVAAIEJACHSBUAAgQkAIfAFAQD_CAAh8wUBAP8IACH0BQEA_wgAIYoGAQD9CAAhiwYBAP8IACGMBgEA_wgAIY0GAQD_CAAhjgYBAP8IACGPBgEA_wgAIZAGAADvCQAgEbEFAADWEAAwsgUAANcQABCzBQAA1hAAMLQFAQD9CAAhuQUBAP0IACG7BUAAgQkAIdIFQACBCQAh8AUBAP8IACHzBQEA_wgAIfQFAQD_CAAhigYBAP0IACGLBgEA_wgAIYwGAQD_CAAhjQYBAP8IACGOBgEA_wgAIY8GAQD_CAAhkAYAAO8JACANtAUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAARQQAADhCwAgGQAA4AsAIB4AAN4LACAmAADdCwAgMwAA4gsAIDQAANwLACA2AADfCwAgtAUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAARQQAAC1DAAgGQAAtAwAIB4AALIMACAmAACxDAAgMwAAtgwAIDQAALAMACA2AACzDAAgtAUBAAAAAbsFQAAAAAHSBUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABigYBAAAAAYsGAQAAAAGMBgEAAAABjQYBAAAAAY4GAQAAAAGPBgEAAAABkAaAAAAAARAOAAD5CwAgDwAArAsAILQFAQAAAAG7BUAAAAAB0AVAAAAAAdEFAQAAAAHmBQEAAAAB7QUQAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAZEGEAAAAAGSBgEAAAABkwYQAAAAAZQGAQAAAAGVBgEAAAABAgAAACMAIEUAAOMQACADAAAAIwAgRQAA4xAAIEYAAOIQACABPgAAqRIAMAIAAAAjACA-AADiEAAgAgAAAKULACA-AADhEAAgDrQFAQCxCgAhuwVAALYKACHQBUAAtgoAIdEFAQC0CgAh5gUBALEKACHtBRAA4goAIfMFAQC0CgAh9AUBALQKACH8BQEAtAoAIZEGEADiCgAhkgYBALEKACGTBhAA4goAIZQGAQC0CgAhlQYBALQKACEQDgAA9wsAIA8AAKkLACC0BQEAsQoAIbsFQAC2CgAh0AVAALYKACHRBQEAtAoAIeYFAQCxCgAh7QUQAOIKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACGRBhAA4goAIZIGAQCxCgAhkwYQAOIKACGUBgEAtAoAIZUGAQC0CgAhEA4AAPkLACAPAACsCwAgtAUBAAAAAbsFQAAAAAHQBUAAAAAB0QUBAAAAAeYFAQAAAAHtBRAAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABkQYQAAAAAZIGAQAAAAGTBhAAAAABlAYBAAAAAZUGAQAAAAEKDwAA8gwAICcAAK0MACC0BQEAAAABuwVAAAAAAdEFAQAAAAGWBgEAAAABowZAAAAAAaQGIAAAAAGlBhAAAAABpgYQAAAAAQIAAAB_ACBFAADsEAAgAwAAAH8AIEUAAOwQACBGAADrEAAgAT4AAKgSADACAAAAfwAgPgAA6xAAIAIAAACnDAAgPgAA6hAAIAi0BQEAsQoAIbsFQAC2CgAh0QUBALQKACGWBgEAsQoAIaMGQAC2CgAhpAYgALMKACGlBhAAuAsAIaYGEAC4CwAhCg8AAPEMACAnAACqDAAgtAUBALEKACG7BUAAtgoAIdEFAQC0CgAhlgYBALEKACGjBkAAtgoAIaQGIACzCgAhpQYQALgLACGmBhAAuAsAIQoPAADyDAAgJwAArQwAILQFAQAAAAG7BUAAAAAB0QUBAAAAAZYGAQAAAAGjBkAAAAABpAYgAAAAAaUGEAAAAAGmBhAAAAABCBgAAMANACC0BQEAAAABuwVAAAAAAegFAQAAAAHzBQEAAAAB9AUBAAAAAa8GAAAArwYCsAZAAAAAAQIAAABKACBFAAD1EAAgAwAAAEoAIEUAAPUQACBGAAD0EAAgAT4AAKcSADACAAAASgAgPgAA9BAAIAIAAADnDQAgPgAA8xAAIAe0BQEAsQoAIbsFQAC2CgAh6AUBALEKACHzBQEAtAoAIfQFAQC0CgAhrwYAAL0NrwYisAZAALYKACEIGAAAvg0AILQFAQCxCgAhuwVAALYKACHoBQEAsQoAIfMFAQC0CgAh9AUBALQKACGvBgAAvQ2vBiKwBkAAtgoAIQgYAADADQAgtAUBAAAAAbsFQAAAAAHoBQEAAAAB8wUBAAAAAfQFAQAAAAGvBgAAAK8GArAGQAAAAAEIEQAA_A0AILQFAQAAAAG7BUAAAAAB5wUBAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABAgAAADYAIEUAAP4QACADAAAANgAgRQAA_hAAIEYAAP0QACABPgAAphIAMAIAAAA2ACA-AAD9EAAgAgAAAKMOACA-AAD8EAAgB7QFAQCxCgAhuwVAALYKACHnBQEAsQoAIfMFAQC0CgAh9AUBALQKACGvBgAAvQ2vBiKwBkAAtgoAIQgRAAD6DQAgtAUBALEKACG7BUAAtgoAIecFAQCxCgAh8wUBALQKACH0BQEAtAoAIa8GAAC9Da8GIrAGQAC2CgAhCBEAAPwNACC0BQEAAAABuwVAAAAAAecFAQAAAAHzBQEAAAAB9AUBAAAAAa8GAAAArwYCsAZAAAAAAQoKAADZDgAgtAUBAAAAAbsFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAALwGAroGAQAAAAG8BhAAAAABvQZAAAAAAQIAAABuACBFAACHEQAgAwAAAG4AIEUAAIcRACBGAACGEQAgAT4AAKUSADACAAAAbgAgPgAAhhEAIAIAAACWDwAgPgAAhREAIAm0BQEAsQoAIbsFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAANUOvAYiugYBALEKACG8BhAA4goAIb0GQAC2CgAhCgoAANcOACC0BQEAsQoAIbsFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAANUOvAYiugYBALEKACG8BhAA4goAIb0GQAC2CgAhCgoAANkOACC0BQEAAAABuwVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAasGAAAAvAYCugYBAAAAAbwGEAAAAAG9BkAAAAABDgoAAJ4MACAPAADgDgAgtAUBAAAAAbsFQAAAAAHRBQEAAAAB8AUBAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAG6BgEAAAABvAYQAAAAAb4GAQAAAAG_BkAAAAABAgAAAGkAIEUAAJARACADAAAAaQAgRQAAkBEAIEYAAI8RACABPgAApBIAMAIAAABpACA-AACPEQAgAgAAAJcMACA-AACOEQAgDLQFAQCxCgAhuwVAALYKACHRBQEAtAoAIfAFAQC0CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACG6BgEAsQoAIbwGEADiCgAhvgYBALQKACG_BkAAtgoAIQ4KAACbDAAgDwAA3w4AILQFAQCxCgAhuwVAALYKACHRBQEAtAoAIfAFAQC0CgAh8gUBALEKACHzBQEAtAoAIfQFAQC0CgAh_AUBALQKACG6BgEAsQoAIbwGEADiCgAhvgYBALQKACG_BkAAtgoAIQ4KAACeDAAgDwAA4A4AILQFAQAAAAG7BUAAAAAB0QUBAAAAAfAFAQAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABugYBAAAAAbwGEAAAAAG-BgEAAAABvwZAAAAAAQ8KAADqDgAgGwAA6w4AILQFAQAAAAG7BUAAAAAB6QUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAasGAAAAwQYCsAZAAAAAAboGAQAAAAHBBgEAAAABwwYQAAAAAcQGEAAAAAHFBgEAAAABAgAAAGQAIEUAAJkRACADAAAAZAAgRQAAmREAIEYAAJgRACABPgAAoxIAMAIAAABkACA-AACYEQAgAgAAAKsPACA-AACXEQAgDbQFAQCxCgAhuwVAALYKACHpBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIasGAADmDsEGIrAGQAC2CgAhugYBALEKACHBBgEAtAoAIcMGEADiCgAhxAYQALgLACHFBgEAtAoAIQ8KAADnDgAgGwAA6A4AILQFAQCxCgAhuwVAALYKACHpBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIasGAADmDsEGIrAGQAC2CgAhugYBALEKACHBBgEAtAoAIcMGEADiCgAhxAYQALgLACHFBgEAtAoAIQ8KAADqDgAgGwAA6w4AILQFAQAAAAG7BUAAAAAB6QUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAasGAAAAwQYCsAZAAAAAAboGAQAAAAHBBgEAAAABwwYQAAAAAcQGEAAAAAHFBgEAAAABDwoAAOoOACAcAADsDgAgtAUBAAAAAbsFQAAAAAHpBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAADBBgKwBkAAAAABugYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAECAAAAZAAgRQAAohEAIAMAAABkACBFAACiEQAgRgAAoREAIAE-AACiEgAwAgAAAGQAID4AAKERACACAAAAqw8AID4AAKARACANtAUBALEKACG7BUAAtgoAIekFAQC0CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAAOYOwQYisAZAALYKACG6BgEAsQoAIcIGAQCxCgAhwwYQAOIKACHEBhAAuAsAIcUGAQC0CgAhDwoAAOcOACAcAADpDgAgtAUBALEKACG7BUAAtgoAIekFAQC0CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhqwYAAOYOwQYisAZAALYKACG6BgEAsQoAIcIGAQCxCgAhwwYQAOIKACHEBhAAuAsAIcUGAQC0CgAhDwoAAOoOACAcAADsDgAgtAUBAAAAAbsFQAAAAAHpBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAADBBgKwBkAAAAABugYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAEVCgAAxwsAIA4AAPMOACAZAADJCwAgtAUBAAAAAbsFQAAAAAHmBQEAAAAB6QUBAAAAAe0FEAAAAAHvBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABlAYBAAAAAZUGAQAAAAG6BgEAAAABvAYQAAAAAccGAAAAxwYCyAYQAAAAAckGAQAAAAHKBgEAAAABywZAAAAAAQIAAAAeACBFAACrEQAgAwAAAB4AIEUAAKsRACBGAACqEQAgAT4AAKESADACAAAAHgAgPgAAqhEAIAIAAAC1CwAgPgAAqREAIBK0BQEAsQoAIbsFQAC2CgAh5gUBALEKACHpBQEAtAoAIe0FEAC4CwAh7wUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGUBgEAtAoAIZUGAQC0CgAhugYBALEKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhFQoAALoLACAOAADyDgAgGQAAvAsAILQFAQCxCgAhuwVAALYKACHmBQEAsQoAIekFAQC0CgAh7QUQALgLACHvBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIZQGAQC0CgAhlQYBALQKACG6BgEAsQoAIbwGEADiCgAhxwYAALcLxwYiyAYQALgLACHJBgEAtAoAIcoGAQC0CgAhywZAALYKACEVCgAAxwsAIA4AAPMOACAZAADJCwAgtAUBAAAAAbsFQAAAAAHmBQEAAAAB6QUBAAAAAe0FEAAAAAHvBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABlAYBAAAAAZUGAQAAAAG6BgEAAAABvAYQAAAAAccGAAAAxwYCyAYQAAAAAckGAQAAAAHKBgEAAAABywZAAAAAAQQKAAD8DgAgvAVAAAAAAboGAQAAAAG8BhAAAAABAgAAAAkAIEUAALQRACADAAAACQAgRQAAtBEAIEYAALMRACABPgAAoBIAMAIAAAAJACA-AACzEQAgAgAAAMAPACA-AACyEQAgA7wFQAC2CgAhugYBALEKACG8BhAA4goAIQQKAAD6DgAgvAVAALYKACG6BgEAsQoAIbwGEADiCgAhBAoAAPwOACC8BUAAAAABugYBAAAAAbwGEAAAAAEERQAArBEAMOQGAACtEQAw5gYAAK8RACDqBgAAvA8AMARFAACjEQAw5AYAAKQRADDmBgAAphEAIOoGAACxCwAwBEUAAJoRADDkBgAAmxEAMOYGAACdEQAg6gYAAKcPADAERQAAkREAMOQGAACSEQAw5gYAAJQRACDqBgAApw8AMARFAACIEQAw5AYAAIkRADDmBgAAixEAIOoGAACTDAAwBEUAAP8QADDkBgAAgBEAMOYGAACCEQAg6gYAAJIPADAERQAA9hAAMOQGAAD3EAAw5gYAAPkQACDqBgAAnw4AMARFAADtEAAw5AYAAO4QADDmBgAA8BAAIOoGAADjDQAwBEUAAOQQADDkBgAA5RAAMOYGAADnEAAg6gYAAKMMADAERQAA2xAAMOQGAADcEAAw5gYAAN4QACDqBgAAoQsAMARFAADPEAAw5AYAANAQADDmBgAA0hAAIOoGAADTEAAwBEUAAMYQADDkBgAAxxAAMOYGAADJEAAg6gYAAIALADAERQAAvRAAMOQGAAC-EAAw5gYAAMAQACDqBgAAxg4AMARFAAC0EAAw5AYAALUQADDmBgAAtxAAIOoGAAC0DgAwBEUAAKsQADDkBgAArBAAMOYGAACuEAAg6gYAAOcLADAERQAAohAAMOQGAACjEAAw5gYAAKUQACDqBgAAlQsAMAAAAAAAAAAAAAAAAAVFAACbEgAgRgAAnhIAIOQGAACcEgAg5QYAAJ0SACDqBgAAAQAgA0UAAJsSACDkBgAAnBIAIOoGAAABACAAAAAB5wYAAADcBgILRQAA7xEAMEYAAPMRADDkBgAA8BEAMOUGAADxEQAw5gYAAPIRACDnBgAA0xAAMOgGAADTEAAw6QYAANMQADDqBgAA0xAAMOsGAAD0EQAw7AYAANYQADALRQAA5hEAMEYAAOoRADDkBgAA5xEAMOUGAADoEQAw5gYAAOkRACDnBgAAhwwAMOgGAACHDAAw6QYAAIcMADDqBgAAhwwAMOsGAADrEQAw7AYAAIoMADALRQAA2hEAMEYAAN8RADDkBgAA2xEAMOUGAADcEQAw5gYAAN0RACDnBgAA3hEAMOgGAADeEQAw6QYAAN4RADDqBgAA3hEAMOsGAADgEQAw7AYAAOERADAItAUBAAAAAbkFAQAAAAHTBkAAAAAB1QYBAAAAAdYGAQAAAAHXBgEAAAAB2AYBAAAAAdkGAQAAAAECAAAAzAEAIEUAAOURACADAAAAzAEAIEUAAOURACBGAADkEQAgAT4AAJoSADANNwAA5gkAILEFAADlCQAwsgUAAMoBABCzBQAA5QkAMLQFAQAAAAG5BQEA_wgAIdMGQACBCQAh1AYBAP0IACHVBgEA_QgAIdYGAQD9CAAh1wYBAP0IACHYBgEA_wgAIdkGAQD_CAAhAgAAAMwBACA-AADkEQAgAgAAAOIRACA-AADjEQAgDLEFAADhEQAwsgUAAOIRABCzBQAA4REAMLQFAQD9CAAhuQUBAP8IACHTBkAAgQkAIdQGAQD9CAAh1QYBAP0IACHWBgEA_QgAIdcGAQD9CAAh2AYBAP8IACHZBgEA_wgAIQyxBQAA4REAMLIFAADiEQAQswUAAOERADC0BQEA_QgAIbkFAQD_CAAh0wZAAIEJACHUBgEA_QgAIdUGAQD9CAAh1gYBAP0IACHXBgEA_QgAIdgGAQD_CAAh2QYBAP8IACEItAUBALEKACG5BQEAtAoAIdMGQAC2CgAh1QYBALEKACHWBgEAsQoAIdcGAQCxCgAh2AYBALQKACHZBgEAtAoAIQi0BQEAsQoAIbkFAQC0CgAh0wZAALYKACHVBgEAsQoAIdYGAQCxCgAh1wYBALEKACHYBgEAtAoAIdkGAQC0CgAhCLQFAQAAAAG5BQEAAAAB0wZAAAAAAdUGAQAAAAHWBgEAAAAB1wYBAAAAAdgGAQAAAAHZBgEAAAABBQ8AANYLACC0BQEAAAABuwVAAAAAAdEFAQAAAAGIBgEAAAABAgAAAL4BACBFAADuEQAgAwAAAL4BACBFAADuEQAgRgAA7REAIAE-AACZEgAwAgAAAL4BACA-AADtEQAgAgAAAIsMACA-AADsEQAgBLQFAQCxCgAhuwVAALYKACHRBQEAsQoAIYgGAQCxCgAhBQ8AANQLACC0BQEAsQoAIbsFQAC2CgAh0QUBALEKACGIBgEAsQoAIQUPAADWCwAgtAUBAAAAAbsFQAAAAAHRBQEAAAABiAYBAAAAARQDAACvDAAgEAAAtQwAIBkAALQMACAeAACyDAAgJgAAsQwAIDMAALYMACA2AACzDAAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0gVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAYsGAQAAAAGMBgEAAAABjQYBAAAAAY4GAQAAAAGPBgEAAAABkAaAAAAAAQIAAAAFACBFAAD3EQAgAwAAAAUAIEUAAPcRACBGAAD2EQAgAT4AAJgSADACAAAABQAgPgAA9hEAIAIAAADXEAAgPgAA9REAIA20BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYsGAQC0CgAhjAYBALQKACGNBgEAtAoAIY4GAQC0CgAhjwYBALQKACGQBoAAAAABFAMAANsLACAQAADhCwAgGQAA4AsAIB4AAN4LACAmAADdCwAgMwAA4gsAIDYAAN8LACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYsGAQC0CgAhjAYBALQKACGNBgEAtAoAIY4GAQC0CgAhjwYBALQKACGQBoAAAAABFAMAAK8MACAQAAC1DAAgGQAAtAwAIB4AALIMACAmAACxDAAgMwAAtgwAIDYAALMMACC0BQEAAAABuQUBAAAAAbsFQAAAAAHSBUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAGQBoAAAAABBEUAAO8RADDkBgAA8BEAMOYGAADyEQAg6gYAANMQADAERQAA5hEAMOQGAADnEQAw5gYAAOkRACDqBgAAhwwAMARFAADaEQAw5AYAANsRADDmBgAA3REAIOoGAADeEQAwAAADLgAAzBEAIDYAAPsRACA4AAD8EQAgEAMAAIASACAQAADPCwAgGQAAiQsAIB4AAMcRACAmAADLEQAgMwAAzREAIDQAAP0RACA2AAD7EQAg8AUAAK0KACDzBQAArQoAIPQFAACtCgAgiwYAAK0KACCMBgAArQoAII0GAACtCgAgjgYAAK0KACCPBgAArQoAIAMDAACAEgAgDwAA_hEAIDIAAIESACATDAAAxREAIA0AAM4LACAQAADPCwAgFgAA0AsAIBkAAIkLACAeAADHEQAgHwAAyBEAICAAAMYRACAhAADGEQAgIgAAyREAICMAAMoRACAmAADLEQAgLgAAzBEAIC8AAM8OACAwAAC9DgAgMwAAzREAIPcFAACtCgAghwYAAK0KACDSBgAArQoAIAAGJQAAhhIAICYAAMsRACAsAACHEgAgLQAAiBIAIKcGAACtCgAgqAYAAK0KACAABicAAIISACArAACDEgAg8wUAAK0KACD0BQAArQoAIPgFAACtCgAgoQYAAK0KACAGJwAAghIAICkAAIMSACDzBQAArQoAIPQFAACtCgAgmwYAAK0KACCcBgAArQoAIAEkAACyDQAgAAAHCQAAkxIAIAsAAJQSACAMAADFEQAgDQAAzgsAIB0AAMYRACAeAADHEQAgHwAAyBEAIAEZAACJCwAgEAMAAIASACAKAACJEgAgDgAAkhIAIBkAAIkLACC5BQAArQoAIOkFAACtCgAg7QUAAK0KACDvBQAArQoAIPAFAACtCgAg8wUAAK0KACD0BQAArQoAIJQGAACtCgAglQYAAK0KACDIBgAArQoAIMkGAACtCgAgygYAAK0KACAIEgAAjRIAIBMAAIASACAUAADKEQAgFQAAjhIAIBYAANALACDlBQAArQoAILMGAACtCgAgtQYAAK0KACABFwAAvQ4AIAAJEgAAkBIAIBMAAIASACAUAADJEQAgFQAAkRIAIBYAANALACDlBQAArQoAILUGAACtCgAguAYAAK0KACC5BgAArQoAIAERAADPDgAgAAgNAADOCwAgEAAAzwsAIBYAANALACCCBgAArQoAIIMGAACtCgAghAYAAK0KACCFBgAArQoAIIcGAACtCgAgBAYAAJUSACAHAACWEgAgCAAAlxIAIM8GAACtCgAgAAEEAAD_DwAgAQQAAP8PACAADbQFAQAAAAG5BQEAAAABuwVAAAAAAdIFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGLBgEAAAABjAYBAAAAAY0GAQAAAAGOBgEAAAABjwYBAAAAAZAGgAAAAAEEtAUBAAAAAbsFQAAAAAHRBQEAAAABiAYBAAAAAQi0BQEAAAABuQUBAAAAAdMGQAAAAAHVBgEAAAAB1gYBAAAAAdcGAQAAAAHYBgEAAAAB2QYBAAAAAQkuAAD4EQAgNgAA-REAILQFAQAAAAG7BUAAAAABvAVAAAAAAf0FAQAAAAGEBgEAAAAB2gYBAAAAAdwGAAAA3AYCAgAAAAEAIEUAAJsSACADAAAA0gEAIEUAAJsSACBGAACfEgAgCwAAANIBACAuAADXEQAgNgAA2BEAID4AAJ8SACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIJLgAA1xEAIDYAANgRACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIDvAVAAAAAAboGAQAAAAG8BhAAAAABErQFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABugYBAAAAAbwGEAAAAAHHBgAAAMcGAsgGEAAAAAHJBgEAAAABygYBAAAAAcsGQAAAAAENtAUBAAAAAbsFQAAAAAHpBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAADBBgKwBkAAAAABugYBAAAAAcIGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAENtAUBAAAAAbsFQAAAAAHpBQEAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAADBBgKwBkAAAAABugYBAAAAAcEGAQAAAAHDBhAAAAABxAYQAAAAAcUGAQAAAAEMtAUBAAAAAbsFQAAAAAHRBQEAAAAB8AUBAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAG6BgEAAAABvAYQAAAAAb4GAQAAAAG_BkAAAAABCbQFAQAAAAG7BUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAAC8BgK6BgEAAAABvAYQAAAAAb0GQAAAAAEHtAUBAAAAAbsFQAAAAAHnBQEAAAAB8wUBAAAAAfQFAQAAAAGvBgAAAK8GArAGQAAAAAEHtAUBAAAAAbsFQAAAAAHoBQEAAAAB8wUBAAAAAfQFAQAAAAGvBgAAAK8GArAGQAAAAAEItAUBAAAAAbsFQAAAAAHRBQEAAAABlgYBAAAAAaMGQAAAAAGkBiAAAAABpQYQAAAAAaYGEAAAAAEOtAUBAAAAAbsFQAAAAAHQBUAAAAAB0QUBAAAAAeYFAQAAAAHtBRAAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABkQYQAAAAAZIGAQAAAAGTBhAAAAABlAYBAAAAAZUGAQAAAAENtAUBAAAAAbsFQAAAAAHSBUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABigYBAAAAAYsGAQAAAAGMBgEAAAABjQYBAAAAAY4GAQAAAAGPBgEAAAABkAaAAAAAAQ20BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-gUBAAAAAfsFQAAAAAH8BQEAAAABCbQFAQAAAAHlBQEAAAAB_QUBAAAAAbIGAQAAAAG0BgAAAK8GArYGgAAAAAG3BgEAAAABuAYBAAAAAbkGAQAAAAEHtAUBAAAAAeUFAQAAAAGxBgEAAAABsgYBAAAAAbMGAQAAAAG0BgAAAK8GArYGgAAAAAEFtAUBAAAAAdEFAQAAAAHSBUAAAAAB0wWAAAAAAdQFQAAAAAEUtAUBAAAAAbsFQAAAAAHjBQEAAAAB5AUBAAAAAeUFAQAAAAHmBQEAAAAB5wUBAAAAAegFAQAAAAHpBQEAAAAB6gUCAAAAAesFEAAAAAHsBRAAAAAB7QUQAAAAAe4FAQAAAAHvBQEAAAAB8AUBAAAAAfEFQAAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAEGtAUBAAAAAf0FAQAAAAH-BSAAAAABtgaAAAAAAc4GAQAAAAHPBhAAAAABBrQFAQAAAAH1BQEAAAAB_QUBAAAAAf4FIAAAAAG2BoAAAAABzwYQAAAAAQO0BQEAAAAB_QUBAAAAAf4FIAAAAAECAAAArwIAIEUAALISACADtAUBAAAAAf0FAQAAAAH-BSAAAAABAgAAAJYCACBFAAC0EgAgArQFAQAAAAHNBgEAAAABAwAAALICACBFAACyEgAgRgAAuRIAIAUAAACyAgAgPgAAuRIAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACEDAAAAmQIAIEUAALQSACBGAAC8EgAgBQAAAJkCACA-AAC8EgAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhA7QFAQCxCgAh_QUBALEKACH-BSAAswoAIQkGAADrDwAgBwAA7A8AILQFAQAAAAH1BQEAAAAB_QUBAAAAAf4FIAAAAAG2BoAAAAABzgYBAAAAAc8GEAAAAAECAAAADQAgRQAAvRIAIAK8BUAAAAABvAYQAAAAAQO5BQEAAAABvAVAAAAAAbwGEAAAAAEStAUBAAAAAbkFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABvAYQAAAAAccGAAAAxwYCyAYQAAAAAckGAQAAAAHKBgEAAAABywZAAAAAAQ20BQEAAAABuwVAAAAAAekFAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGrBgAAAMEGArAGQAAAAAHBBgEAAAABwgYBAAAAAcMGEAAAAAHEBhAAAAABxQYBAAAAAQy0BQEAAAABuQUBAAAAAbsFQAAAAAHRBQEAAAAB8AUBAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAfwFAQAAAAG8BhAAAAABvgYBAAAAAb8GQAAAAAEJtAUBAAAAAbkFAQAAAAG7BUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABqwYAAAC8BgK8BhAAAAABvQZAAAAAAQMAAAALACBFAAC9EgAgRgAAxxIAIAsAAAALACAGAADcDwAgBwAA3Q8AID4AAMcSACC0BQEAsQoAIfUFAQCxCgAh_QUBALEKACH-BSAAswoAIbYGgAAAAAHOBgEAsQoAIc8GEAC4CwAhCQYAANwPACAHAADdDwAgtAUBALEKACH1BQEAsQoAIf0FAQCxCgAh_gUgALMKACG2BoAAAAABzgYBALEKACHPBhAAuAsAIQkJAADQDwAgDAAA0g8AIA0AANMPACAdAADUDwAgHgAA1Q8AIB8AANYPACC0BQEAAAABzAYBAAAAAc0GAQAAAAECAAAAFAAgRQAAyBIAIAMAAAASACBFAADIEgAgRgAAzBIAIAsAAAASACAJAACHDwAgDAAAiQ8AIA0AAIoPACAdAACLDwAgHgAAjA8AIB8AAI0PACA-AADMEgAgtAUBALEKACHMBgEAsQoAIc0GAQCxCgAhCQkAAIcPACAMAACJDwAgDQAAig8AIB0AAIsPACAeAACMDwAgHwAAjQ8AILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIQkJAADQDwAgCwAA0Q8AIA0AANMPACAdAADUDwAgHgAA1Q8AIB8AANYPACC0BQEAAAABzAYBAAAAAc0GAQAAAAECAAAAFAAgRQAAzRIAIBgNAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAvAADBEQAgMAAAwhEAIDMAAMMRACC0BQEAAAABuwVAAAAAAbwFQAAAAAHNBQAAANIGAvcFAQAAAAH9BQEAAAABhwZAAAAAAdAGAQAAAAHSBgEAAAABAgAAAP4BACBFAADPEgAgAwAAABIAIEUAAM0SACBGAADTEgAgCwAAABIAIAkAAIcPACALAACIDwAgDQAAig8AIB0AAIsPACAeAACMDwAgHwAAjQ8AID4AANMSACC0BQEAsQoAIcwGAQCxCgAhzQYBALEKACEJCQAAhw8AIAsAAIgPACANAACKDwAgHQAAiw8AIB4AAIwPACAfAACNDwAgtAUBALEKACHMBgEAsQoAIc0GAQCxCgAhAwAAADIAIEUAAM8SACBGAADWEgAgGgAAADIAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAID4AANYSACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhGA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEKEAAAzAsAIBYAAM0LACC0BQEAAAAB_QUBAAAAAYIGAQAAAAGDBgEAAAABhAYBAAAAAYUGAQAAAAGGBgAAygsAIIcGQAAAAAECAAAAiwcAIEUAANcSACADAAAAKgAgRQAA1xIAIEYAANsSACAMAAAAKgAgEAAAjwsAIBYAAJALACA-AADbEgAgtAUBALEKACH9BQEAsQoAIYIGAQC0CgAhgwYBALQKACGEBgEAtAoAIYUGAQC0CgAhhgYAAI0LACCHBkAAtQoAIQoQAACPCwAgFgAAkAsAILQFAQCxCgAh_QUBALEKACGCBgEAtAoAIYMGAQC0CgAhhAYBALQKACGFBgEAtAoAIYYGAACNCwAghwZAALUKACEYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIBkAAMARACAeAAC5EQAgHwAAuhEAICAAALcRACAiAAC7EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAA3BIAIBgMAAC1EQAgDQAAthEAIBAAAL4RACAWAADEEQAgGQAAwBEAIB4AALkRACAfAAC6EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAvAADBEQAgMAAAwhEAIDMAAMMRACC0BQEAAAABuwVAAAAAAbwFQAAAAAHNBQAAANIGAvcFAQAAAAH9BQEAAAABhwZAAAAAAdAGAQAAAAHSBgEAAAABAgAAAP4BACBFAADeEgAgCQkAANAPACALAADRDwAgDAAA0g8AIA0AANMPACAeAADVDwAgHwAA1g8AILQFAQAAAAHMBgEAAAABzQYBAAAAAQIAAAAUACBFAADgEgAgAwAAADIAIEUAANwSACBGAADkEgAgGgAAADIAIAwAAJIQACANAACTEAAgEAAAmxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAID4AAOQSACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhGAwAAJIQACANAACTEAAgEAAAmxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEDAAAAMgAgRQAA3hIAIEYAAOcSACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAA5xIAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQMAAAASACBFAADgEgAgRgAA6hIAIAsAAAASACAJAACHDwAgCwAAiA8AIAwAAIkPACANAACKDwAgHgAAjA8AIB8AAI0PACA-AADqEgAgtAUBALEKACHMBgEAsQoAIc0GAQCxCgAhCQkAAIcPACALAACIDwAgDAAAiQ8AIA0AAIoPACAeAACMDwAgHwAAjQ8AILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIRUDAACvDAAgEAAAtQwAIBkAALQMACAmAACxDAAgMwAAtgwAIDQAALAMACA2AACzDAAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0gVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAYoGAQAAAAGLBgEAAAABjAYBAAAAAY0GAQAAAAGOBgEAAAABjwYBAAAAAZAGgAAAAAECAAAABQAgRQAA6xIAIAMAAAADACBFAADrEgAgRgAA7xIAIBcAAAADACADAADbCwAgEAAA4QsAIBkAAOALACAmAADdCwAgMwAA4gsAIDQAANwLACA2AADfCwAgPgAA7xIAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAARUDAADbCwAgEAAA4QsAIBkAAOALACAmAADdCwAgMwAA4gsAIDQAANwLACA2AADfCwAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0gVAALYKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGKBgEAsQoAIYsGAQC0CgAhjAYBALQKACGNBgEAtAoAIY4GAQC0CgAhjwYBALQKACGQBoAAAAABCQkAANAPACALAADRDwAgDAAA0g8AIA0AANMPACAdAADUDwAgHgAA1Q8AILQFAQAAAAHMBgEAAAABzQYBAAAAAQIAAAAUACBFAADwEgAgGAwAALURACANAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAICAAALcRACAhAAC4EQAgIgAAuxEAICMAALwRACAmAAC9EQAgLgAAvxEAIC8AAMERACAwAADCEQAgMwAAwxEAILQFAQAAAAG7BUAAAAABvAVAAAAAAc0FAAAA0gYC9wUBAAAAAf0FAQAAAAGHBkAAAAAB0AYBAAAAAdIGAQAAAAECAAAA_gEAIEUAAPISACADAAAAEgAgRQAA8BIAIEYAAPYSACALAAAAEgAgCQAAhw8AIAsAAIgPACAMAACJDwAgDQAAig8AIB0AAIsPACAeAACMDwAgPgAA9hIAILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIQkJAACHDwAgCwAAiA8AIAwAAIkPACANAACKDwAgHQAAiw8AIB4AAIwPACC0BQEAsQoAIcwGAQCxCgAhzQYBALEKACEDAAAAMgAgRQAA8hIAIEYAAPkSACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAA-RIAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQm0BQEAAAAB5QUBAAAAAf0FAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABtwYBAAAAAbgGAQAAAAG5BgEAAAABB7QFAQAAAAHlBQEAAAABsQYBAAAAAbMGAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABGAwAALURACANAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAwAADCEQAgMwAAwxEAILQFAQAAAAG7BUAAAAABvAVAAAAAAc0FAAAA0gYC9wUBAAAAAf0FAQAAAAGHBkAAAAAB0AYBAAAAAdIGAQAAAAECAAAA_gEAIEUAAPwSACADtAUBAAAAAf0FAQAAAAH-BSAAAAABAgAAAP4DACBFAAD-EgAgB7QFAQAAAAG5BQEAAAABuwVAAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABBrQFAQAAAAG7BUAAAAAB8AUBAAAAAasGAQAAAAGsBhAAAAABrQZAAAAAARS0BQEAAAABuQUBAAAAAbsFQAAAAAHjBQEAAAAB5AUBAAAAAeUFAQAAAAHmBQEAAAAB6AUBAAAAAekFAQAAAAHqBQIAAAAB6wUQAAAAAewFEAAAAAHtBRAAAAAB7gUBAAAAAe8FAQAAAAHwBQEAAAAB8QVAAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAQMAAAAyACBFAAD8EgAgRgAAhRMAIBoAAAAyACAMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgMAAAnxAAIDMAAKAQACA-AACFEwAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgMAAAnxAAIDMAAKAQACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhAwAAAIEEACBFAAD-EgAgRgAAiBMAIAUAAACBBAAgPgAAiBMAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACEYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIBkAAMARACAeAAC5EQAgHwAAuhEAICAAALcRACAhAAC4EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAAiRMAIA4SAACnDgAgEwAAqA4AIBUAAKoOACAWAACrDgAgtAUBAAAAAeUFAQAAAAH9BQEAAAABsgYBAAAAAbQGAAAArwYCtQYBAAAAAbYGgAAAAAG3BgEAAAABuAYBAAAAAbkGAQAAAAECAAAALwAgRQAAixMAIAMAAAAyACBFAACJEwAgRgAAjxMAIBoAAAAyACAMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACA-AACPEwAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhAwAAACwAIEUAAIsTACBGAACSEwAgEAAAACwAIBIAAIEOACATAACCDgAgFQAAhA4AIBYAAIUOACA-AACSEwAgtAUBALEKACHlBQEAtAoAIf0FAQCxCgAhsgYBALEKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAG3BgEAsQoAIbgGAQC0CgAhuQYBALQKACEOEgAAgQ4AIBMAAIIOACAVAACEDgAgFgAAhQ4AILQFAQCxCgAh5QUBALQKACH9BQEAsQoAIbIGAQCxCgAhtAYAAL0NrwYitQYBALQKACG2BoAAAAABtwYBALEKACG4BgEAtAoAIbkGAQC0CgAhDhIAAKcOACATAACoDgAgFAAAqQ4AIBYAAKsOACC0BQEAAAAB5QUBAAAAAf0FAQAAAAGyBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAbcGAQAAAAG4BgEAAAABuQYBAAAAAQIAAAAvACBFAACTEwAgAwAAACwAIEUAAJMTACBGAACXEwAgEAAAACwAIBIAAIEOACATAACCDgAgFAAAgw4AIBYAAIUOACA-AACXEwAgtAUBALEKACHlBQEAtAoAIf0FAQCxCgAhsgYBALEKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAG3BgEAsQoAIbgGAQC0CgAhuQYBALQKACEOEgAAgQ4AIBMAAIIOACAUAACDDgAgFgAAhQ4AILQFAQCxCgAh5QUBALQKACH9BQEAsQoAIbIGAQCxCgAhtAYAAL0NrwYitQYBALQKACG2BoAAAAABtwYBALEKACG4BgEAtAoAIbkGAQC0CgAhGAwAALURACANAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAvAADBEQAgMwAAwxEAILQFAQAAAAG7BUAAAAABvAVAAAAAAc0FAAAA0gYC9wUBAAAAAf0FAQAAAAGHBkAAAAAB0AYBAAAAAdIGAQAAAAECAAAA_gEAIEUAAJgTACADtAUBAAAAAf0FAQAAAAH-BSAAAAABAgAAAJcEACBFAACaEwAgB7QFAQAAAAG5BQEAAAABuwVAAAAAAfMFAQAAAAH0BQEAAAABrwYAAACvBgKwBkAAAAABBrQFAQAAAAG7BUAAAAAB8AUBAAAAAasGAQAAAAGsBhAAAAABrQZAAAAAARS0BQEAAAABuQUBAAAAAbsFQAAAAAHjBQEAAAAB5AUBAAAAAeUFAQAAAAHmBQEAAAAB5wUBAAAAAekFAQAAAAHqBQIAAAAB6wUQAAAAAewFEAAAAAHtBRAAAAAB7gUBAAAAAe8FAQAAAAHwBQEAAAAB8QVAAAAAAfIFAQAAAAHzBQEAAAAB9AUBAAAAAQMAAAAyACBFAACYEwAgRgAAoRMAIBoAAAAyACAMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDMAAKAQACA-AAChEwAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDMAAKAQACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhAwAAAJoEACBFAACaEwAgRgAApBMAIAUAAACaBAAgPgAApBMAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACEYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIBkAAMARACAeAAC5EQAgHwAAuhEAICAAALcRACAhAAC4EQAgIgAAuxEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAApRMAIAwSAADrDQAgEwAA7A0AIBUAAO4NACAWAADvDQAgtAUBAAAAAeUFAQAAAAGxBgEAAAABsgYBAAAAAbMGAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABAgAAAEQAIEUAAKcTACADAAAAMgAgRQAApRMAIEYAAKsTACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAAqxMAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQMAAABBACBFAACnEwAgRgAArhMAIA4AAABBACASAADFDQAgEwAAxg0AIBUAAMgNACAWAADJDQAgPgAArhMAILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAEMEgAAxQ0AIBMAAMYNACAVAADIDQAgFgAAyQ0AILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAEMEgAA6w0AIBMAAOwNACAUAADtDQAgFgAA7w0AILQFAQAAAAHlBQEAAAABsQYBAAAAAbIGAQAAAAGzBgEAAAABtAYAAACvBgK1BgEAAAABtgaAAAAAAQIAAABEACBFAACvEwAgAwAAAEEAIEUAAK8TACBGAACzEwAgDgAAAEEAIBIAAMUNACATAADGDQAgFAAAxw0AIBYAAMkNACA-AACzEwAgtAUBALEKACHlBQEAtAoAIbEGAQCxCgAhsgYBALEKACGzBgEAtAoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAQwSAADFDQAgEwAAxg0AIBQAAMcNACAWAADJDQAgtAUBALEKACHlBQEAtAoAIbEGAQCxCgAhsgYBALEKACGzBgEAtAoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAQa0BQEAAAAB_QUBAAAAAf4FIAAAAAGnBgEAAAABqAYBAAAAAaoGEAAAAAEDtAUBAAAAAf0FAQAAAAH-BSAAAAABAgAAALwFACBFAAC1EwAgCLQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAGjBkAAAAABpAYgAAAAAaUGEAAAAAGmBhAAAAABCLQFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAH2BRAAAAAB-AUBAAAAAaEGAQAAAAGiBkAAAAABC7QFAQAAAAG7BUAAAAABzQUBAAAAAfMFAQAAAAH0BQEAAAABlwYQAAAAAZgGEAAAAAGZBhAAAAABmgYQAAAAAZsGAQAAAAGcBkAAAAABAwAAAL8FACBFAAC1EwAgRgAAvBMAIAUAAAC_BQAgPgAAvBMAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACEVAwAArwwAIBAAALUMACAZAAC0DAAgHgAAsgwAIDMAALYMACA0AACwDAAgNgAAswwAILQFAQAAAAG5BQEAAAABuwVAAAAAAdIFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGKBgEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAGQBoAAAAABAgAAAAUAIEUAAL0TACADAAAAAwAgRQAAvRMAIEYAAMETACAXAAAAAwAgAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAIDMAAOILACA0AADcCwAgNgAA3wsAID4AAMETACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYoGAQCxCgAhiwYBALQKACGMBgEAtAoAIY0GAQC0CgAhjgYBALQKACGPBgEAtAoAIZAGgAAAAAEVAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAIDMAAOILACA0AADcCwAgNgAA3wsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAAQolAACdDQAgJgAAng0AIC0AAKANACC0BQEAAAAB_QUBAAAAAf4FIAAAAAGnBgEAAAABqAYBAAAAAakGAQAAAAGqBhAAAAABAgAAAIMBACBFAADCEwAgCLQFAQAAAAG7BUAAAAAB8wUBAAAAAfYFEAAAAAGeBgEAAAABnwYBAAAAAaAGQAAAAAGhBgEAAAABAwAAAIEBACBFAADCEwAgRgAAxxMAIAwAAACBAQAgJQAA-AwAICYAAPkMACAtAAD7DAAgPgAAxxMAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIacGAQC0CgAhqAYBALQKACGpBgEAsQoAIaoGEADiCgAhCiUAAPgMACAmAAD5DAAgLQAA-wwAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIacGAQC0CgAhqAYBALQKACGpBgEAsQoAIaoGEADiCgAhDScAANEMACC0BQEAAAABuwVAAAAAAc0FAQAAAAHzBQEAAAAB9AUBAAAAAZYGAQAAAAGXBhAAAAABmAYQAAAAAZkGEAAAAAGaBhAAAAABmwYBAAAAAZwGQAAAAAECAAAAlQEAIEUAAMgTACADAAAAjwEAIEUAAMgTACBGAADMEwAgDwAAAI8BACAnAADBDAAgPgAAzBMAILQFAQCxCgAhuwVAALYKACHNBQEAsQoAIfMFAQC0CgAh9AUBALQKACGWBgEAsQoAIZcGEADiCgAhmAYQAOIKACGZBhAA4goAIZoGEADiCgAhmwYBALQKACGcBkAAtQoAIQ0nAADBDAAgtAUBALEKACG7BUAAtgoAIc0FAQCxCgAh8wUBALQKACH0BQEAtAoAIZYGAQCxCgAhlwYQAOIKACGYBhAA4goAIZkGEADiCgAhmgYQAOIKACGbBgEAtAoAIZwGQAC1CgAhCiUAAJ0NACAmAACeDQAgLAAAnw0AILQFAQAAAAH9BQEAAAAB_gUgAAAAAacGAQAAAAGoBgEAAAABqQYBAAAAAaoGEAAAAAECAAAAgwEAIEUAAM0TACAKJwAA6gwAILQFAQAAAAG7BUAAAAAB8wUBAAAAAfQFAQAAAAH2BRAAAAAB-AUBAAAAAZYGAQAAAAGhBgEAAAABogZAAAAAAQIAAACJAQAgRQAAzxMAIAMAAACHAQAgRQAAzxMAIEYAANMTACAMAAAAhwEAICcAAN8MACA-AADTEwAgtAUBALEKACG7BUAAtgoAIfMFAQC0CgAh9AUBALQKACH2BRAA4goAIfgFAQC0CgAhlgYBALEKACGhBgEAtAoAIaIGQAC2CgAhCicAAN8MACC0BQEAsQoAIbsFQAC2CgAh8wUBALQKACH0BQEAtAoAIfYFEADiCgAh-AUBALQKACGWBgEAsQoAIaEGAQC0CgAhogZAALYKACEItAUBAAAAAbsFQAAAAAHzBQEAAAAB9gUQAAAAAZ0GAQAAAAGfBgEAAAABoAZAAAAAAaEGAQAAAAEDAAAAgQEAIEUAAM0TACBGAADXEwAgDAAAAIEBACAlAAD4DAAgJgAA-QwAICwAAPoMACA-AADXEwAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhpwYBALQKACGoBgEAtAoAIakGAQCxCgAhqgYQAOIKACEKJQAA-AwAICYAAPkMACAsAAD6DAAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhpwYBALQKACGoBgEAtAoAIakGAQCxCgAhqgYQAOIKACEJNgAA-REAIDgAAPoRACC0BQEAAAABuwVAAAAAAbwFQAAAAAH9BQEAAAABhAYBAAAAAdoGAQAAAAHcBgAAANwGAgIAAAABACBFAADYEwAgGAwAALURACANAAC2EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC8AAMERACAwAADCEQAgMwAAwxEAILQFAQAAAAG7BUAAAAABvAVAAAAAAc0FAAAA0gYC9wUBAAAAAf0FAQAAAAGHBkAAAAAB0AYBAAAAAdIGAQAAAAECAAAA_gEAIEUAANoTACAYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIBkAAMARACAeAAC5EQAgHwAAuhEAICAAALcRACAhAAC4EQAgIgAAuxEAICMAALwRACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAA3BMAIAolAACdDQAgLAAAnw0AIC0AAKANACC0BQEAAAAB_QUBAAAAAf4FIAAAAAGnBgEAAAABqAYBAAAAAakGAQAAAAGqBhAAAAABAgAAAIMBACBFAADeEwAgAwAAADIAIEUAANwTACBGAADiEwAgGgAAADIAIAwAAJIQACANAACTEAAgEAAAmxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAID4AAOITACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhGAwAAJIQACANAACTEAAgEAAAmxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgLgAAnBAAIC8AAJ4QACAwAACfEAAgMwAAoBAAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEDAAAAgQEAIEUAAN4TACBGAADlEwAgDAAAAIEBACAlAAD4DAAgLAAA-gwAIC0AAPsMACA-AADlEwAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhpwYBALQKACGoBgEAtAoAIakGAQCxCgAhqgYQAOIKACEKJQAA-AwAICwAAPoMACAtAAD7DAAgtAUBALEKACH9BQEAsQoAIf4FIACzCgAhpwYBALQKACGoBgEAtAoAIakGAQCxCgAhqgYQAOIKACEItAUBAAAAAbkFAQAAAAG7BUAAAAABlgYBAAAAAaMGQAAAAAGkBiAAAAABpQYQAAAAAaYGEAAAAAEJCQAA0A8AIAsAANEPACAMAADSDwAgDQAA0w8AIB0AANQPACAfAADWDwAgtAUBAAAAAcwGAQAAAAHNBgEAAAABAgAAABQAIEUAAOcTACAYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIBkAAMARACAfAAC6EQAgIAAAtxEAICEAALgRACAiAAC7EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAA6RMAIAMAAAASACBFAADnEwAgRgAA7RMAIAsAAAASACAJAACHDwAgCwAAiA8AIAwAAIkPACANAACKDwAgHQAAiw8AIB8AAI0PACA-AADtEwAgtAUBALEKACHMBgEAsQoAIc0GAQCxCgAhCQkAAIcPACALAACIDwAgDAAAiQ8AIA0AAIoPACAdAACLDwAgHwAAjQ8AILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIQMAAAAyACBFAADpEwAgRgAA8BMAIBoAAAAyACAMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACA-AADwEwAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhDLQFAQAAAAG5BQEAAAABuwVAAAAAAfAFAQAAAAHyBQEAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABugYBAAAAAbwGEAAAAAG-BgEAAAABvwZAAAAAAQS0BQEAAAABuwVAAAAAAYgGAQAAAAGJBgEAAAABDbQFAQAAAAG5BQEAAAABuwVAAAAAAfMFAQAAAAH0BQEAAAAB9QUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAEKDQAAywsAIBYAAM0LACC0BQEAAAAB_QUBAAAAAYIGAQAAAAGDBgEAAAABhAYBAAAAAYUGAQAAAAGGBgAAygsAIIcGQAAAAAECAAAAiwcAIEUAAPQTACADAAAAKgAgRQAA9BMAIEYAAPgTACAMAAAAKgAgDQAAjgsAIBYAAJALACA-AAD4EwAgtAUBALEKACH9BQEAsQoAIYIGAQC0CgAhgwYBALQKACGEBgEAtAoAIYUGAQC0CgAhhgYAAI0LACCHBkAAtQoAIQoNAACOCwAgFgAAkAsAILQFAQCxCgAh_QUBALEKACGCBgEAtAoAIYMGAQC0CgAhhAYBALQKACGFBgEAtAoAIYYGAACNCwAghwZAALUKACEOtAUBAAAAAbkFAQAAAAG7BUAAAAAB0AVAAAAAAeYFAQAAAAHtBRAAAAAB8wUBAAAAAfQFAQAAAAH8BQEAAAABkQYQAAAAAZIGAQAAAAGTBhAAAAABlAYBAAAAAZUGAQAAAAEFtAUBAAAAAbkFAQAAAAHSBUAAAAAB0wWAAAAAAdQFQAAAAAEDAAAA0gEAIEUAANgTACBGAAD9EwAgCwAAANIBACA2AADYEQAgOAAA2REAID4AAP0TACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIJNgAA2BEAIDgAANkRACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIDAAAAMgAgRQAA2hMAIEYAAIAUACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAAgBQAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIBkAAJ0QACAeAACWEAAgHwAAlxAAICAAAJQQACAhAACVEAAgIgAAmBAAICMAAJkQACAmAACaEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQkuAAD4EQAgOAAA-hEAILQFAQAAAAG7BUAAAAABvAVAAAAAAf0FAQAAAAGEBgEAAAAB2gYBAAAAAdwGAAAA3AYCAgAAAAEAIEUAAIEUACAVAwAArwwAIBAAALUMACAZAAC0DAAgHgAAsgwAICYAALEMACAzAAC2DAAgNAAAsAwAILQFAQAAAAG5BQEAAAABuwVAAAAAAdIFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGKBgEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAGQBoAAAAABAgAAAAUAIEUAAIMUACADAAAA0gEAIEUAAIEUACBGAACHFAAgCwAAANIBACAuAADXEQAgOAAA2REAID4AAIcUACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIJLgAA1xEAIDgAANkRACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACH9BQEAsQoAIYQGAQCxCgAh2gYBALEKACHcBgAA1hHcBiIDAAAAAwAgRQAAgxQAIEYAAIoUACAXAAAAAwAgAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAICYAAN0LACAzAADiCwAgNAAA3AsAID4AAIoUACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYoGAQCxCgAhiwYBALQKACGMBgEAtAoAIY0GAQC0CgAhjgYBALQKACGPBgEAtAoAIZAGgAAAAAEVAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAICYAAN0LACAzAADiCwAgNAAA3AsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAARgMAAC1EQAgEAAAvhEAIBYAAMQRACAZAADAEQAgHgAAuREAIB8AALoRACAgAAC3EQAgIQAAuBEAICIAALsRACAjAAC8EQAgJgAAvREAIC4AAL8RACAvAADBEQAgMAAAwhEAIDMAAMMRACC0BQEAAAABuwVAAAAAAbwFQAAAAAHNBQAAANIGAvcFAQAAAAH9BQEAAAABhwZAAAAAAdAGAQAAAAHSBgEAAAABAgAAAP4BACBFAACLFAAgCQkAANAPACALAADRDwAgDAAA0g8AIB0AANQPACAeAADVDwAgHwAA1g8AILQFAQAAAAHMBgEAAAABzQYBAAAAAQIAAAAUACBFAACNFAAgDbQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BRAAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-wVAAAAAAfwFAQAAAAEDAAAAMgAgRQAAixQAIEYAAJIUACAaAAAAMgAgDAAAkhAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAAkhQAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQMAAAASACBFAACNFAAgRgAAlRQAIAsAAAASACAJAACHDwAgCwAAiA8AIAwAAIkPACAdAACLDwAgHgAAjA8AIB8AAI0PACA-AACVFAAgtAUBALEKACHMBgEAsQoAIc0GAQCxCgAhCQkAAIcPACALAACIDwAgDAAAiQ8AIB0AAIsPACAeAACMDwAgHwAAjQ8AILQFAQCxCgAhzAYBALEKACHNBgEAsQoAIRK0BQEAAAABuQUBAAAAAbsFQAAAAAHpBQEAAAAB7QUQAAAAAe8FAQAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGUBgEAAAABlQYBAAAAAboGAQAAAAG8BhAAAAABxwYAAADHBgLIBhAAAAAByQYBAAAAAcoGAQAAAAHLBkAAAAABFQMAAK8MACAZAAC0DAAgHgAAsgwAICYAALEMACAzAAC2DAAgNAAAsAwAIDYAALMMACC0BQEAAAABuQUBAAAAAbsFQAAAAAHSBUAAAAAB8AUBAAAAAfMFAQAAAAH0BQEAAAABigYBAAAAAYsGAQAAAAGMBgEAAAABjQYBAAAAAY4GAQAAAAGPBgEAAAABkAaAAAAAAQIAAAAFACBFAACXFAAgGAwAALURACANAAC2EQAgFgAAxBEAIBkAAMARACAeAAC5EQAgHwAAuhEAICAAALcRACAhAAC4EQAgIgAAuxEAICMAALwRACAmAAC9EQAgLgAAvxEAIC8AAMERACAwAADCEQAgMwAAwxEAILQFAQAAAAG7BUAAAAABvAVAAAAAAc0FAAAA0gYC9wUBAAAAAf0FAQAAAAGHBkAAAAAB0AYBAAAAAdIGAQAAAAECAAAA_gEAIEUAAJkUACADAAAAAwAgRQAAlxQAIEYAAJ0UACAXAAAAAwAgAwAA2wsAIBkAAOALACAeAADeCwAgJgAA3QsAIDMAAOILACA0AADcCwAgNgAA3wsAID4AAJ0UACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYoGAQCxCgAhiwYBALQKACGMBgEAtAoAIY0GAQC0CgAhjgYBALQKACGPBgEAtAoAIZAGgAAAAAEVAwAA2wsAIBkAAOALACAeAADeCwAgJgAA3QsAIDMAAOILACA0AADcCwAgNgAA3wsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAAQMAAAAyACBFAACZFAAgRgAAoBQAIBoAAAAyACAMAACSEAAgDQAAkxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACA-AACgFAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBYAAKEQACAZAACdEAAgHgAAlhAAIB8AAJcQACAgAACUEAAgIQAAlRAAICIAAJgQACAjAACZEAAgJgAAmhAAIC4AAJwQACAvAACeEAAgMAAAnxAAIDMAAKAQACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhDrQFAQAAAAG5BQEAAAABuwVAAAAAAdAFQAAAAAHRBQEAAAAB7QUQAAAAAfMFAQAAAAH0BQEAAAAB_AUBAAAAAZEGEAAAAAGSBgEAAAABkwYQAAAAAZQGAQAAAAGVBgEAAAABFLQFAQAAAAG5BQEAAAABuwVAAAAAAeMFAQAAAAHkBQEAAAAB5QUBAAAAAecFAQAAAAHoBQEAAAAB6QUBAAAAAeoFAgAAAAHrBRAAAAAB7AUQAAAAAe0FEAAAAAHuBQEAAAAB7wUBAAAAAfAFAQAAAAHxBUAAAAAB8gUBAAAAAfMFAQAAAAH0BQEAAAABDbQFAQAAAAG5BQEAAAABuwVAAAAAAdEFAQAAAAHzBQEAAAAB9AUBAAAAAfYFEAAAAAH3BQEAAAAB-AUBAAAAAfkFAQAAAAH6BQEAAAAB-wVAAAAAAfwFAQAAAAEVAwAArwwAIBAAALUMACAeAACyDAAgJgAAsQwAIDMAALYMACA0AACwDAAgNgAAswwAILQFAQAAAAG5BQEAAAABuwVAAAAAAdIFQAAAAAHwBQEAAAAB8wUBAAAAAfQFAQAAAAGKBgEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAGQBoAAAAABAgAAAAUAIEUAAKQUACAWAwAAyAsAIAoAAMcLACAOAADzDgAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB5gUBAAAAAekFAQAAAAHtBRAAAAAB7wUBAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAZQGAQAAAAGVBgEAAAABugYBAAAAAbwGEAAAAAHHBgAAAMcGAsgGEAAAAAHJBgEAAAABygYBAAAAAcsGQAAAAAECAAAAHgAgRQAAphQAIAO0BQEAAAAB_QUBAAAAAf4FIAAAAAECAAAAowcAIEUAAKgUACAYDAAAtREAIA0AALYRACAQAAC-EQAgFgAAxBEAIB4AALkRACAfAAC6EQAgIAAAtxEAICEAALgRACAiAAC7EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAAqhQAIAMAAAADACBFAACkFAAgRgAArhQAIBcAAAADACADAADbCwAgEAAA4QsAIB4AAN4LACAmAADdCwAgMwAA4gsAIDQAANwLACA2AADfCwAgPgAArhQAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAARUDAADbCwAgEAAA4QsAIB4AAN4LACAmAADdCwAgMwAA4gsAIDQAANwLACA2AADfCwAgtAUBALEKACG5BQEAsQoAIbsFQAC2CgAh0gVAALYKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGKBgEAsQoAIYsGAQC0CgAhjAYBALQKACGNBgEAtAoAIY4GAQC0CgAhjwYBALQKACGQBoAAAAABAwAAABwAIEUAAKYUACBGAACxFAAgGAAAABwAIAMAALsLACAKAAC6CwAgDgAA8g4AID4AALEUACC0BQEAsQoAIbkFAQC0CgAhuwVAALYKACHmBQEAsQoAIekFAQC0CgAh7QUQALgLACHvBQEAtAoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIZQGAQC0CgAhlQYBALQKACG6BgEAsQoAIbwGEADiCgAhxwYAALcLxwYiyAYQALgLACHJBgEAtAoAIcoGAQC0CgAhywZAALYKACEWAwAAuwsAIAoAALoLACAOAADyDgAgtAUBALEKACG5BQEAtAoAIbsFQAC2CgAh5gUBALEKACHpBQEAtAoAIe0FEAC4CwAh7wUBALQKACHwBQEAtAoAIfMFAQC0CgAh9AUBALQKACGUBgEAtAoAIZUGAQC0CgAhugYBALEKACG8BhAA4goAIccGAAC3C8cGIsgGEAC4CwAhyQYBALQKACHKBgEAtAoAIcsGQAC2CgAhAwAAAKYHACBFAACoFAAgRgAAtBQAIAUAAACmBwAgPgAAtBQAILQFAQCxCgAh_QUBALEKACH-BSAAswoAIQO0BQEAsQoAIf0FAQCxCgAh_gUgALMKACEDAAAAMgAgRQAAqhQAIEYAALcUACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAAtxQAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgFgAAoRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIQwSAADrDQAgEwAA7A0AIBQAAO0NACAVAADuDQAgtAUBAAAAAeUFAQAAAAGxBgEAAAABsgYBAAAAAbMGAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABAgAAAEQAIEUAALgUACAOEgAApw4AIBMAAKgOACAUAACpDgAgFQAAqg4AILQFAQAAAAHlBQEAAAAB_QUBAAAAAbIGAQAAAAG0BgAAAK8GArUGAQAAAAG2BoAAAAABtwYBAAAAAbgGAQAAAAG5BgEAAAABAgAAAC8AIEUAALoUACAKDQAAywsAIBAAAMwLACC0BQEAAAAB_QUBAAAAAYIGAQAAAAGDBgEAAAABhAYBAAAAAYUGAQAAAAGGBgAAygsAIIcGQAAAAAECAAAAiwcAIEUAALwUACAYDAAAtREAIA0AALYRACAQAAC-EQAgGQAAwBEAIB4AALkRACAfAAC6EQAgIAAAtxEAICEAALgRACAiAAC7EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACAzAADDEQAgtAUBAAAAAbsFQAAAAAG8BUAAAAABzQUAAADSBgL3BQEAAAAB_QUBAAAAAYcGQAAAAAHQBgEAAAAB0gYBAAAAAQIAAAD-AQAgRQAAvhQAIAMAAABBACBFAAC4FAAgRgAAwhQAIA4AAABBACASAADFDQAgEwAAxg0AIBQAAMcNACAVAADIDQAgPgAAwhQAILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAEMEgAAxQ0AIBMAAMYNACAUAADHDQAgFQAAyA0AILQFAQCxCgAh5QUBALQKACGxBgEAsQoAIbIGAQCxCgAhswYBALQKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAEDAAAALAAgRQAAuhQAIEYAAMUUACAQAAAALAAgEgAAgQ4AIBMAAIIOACAUAACDDgAgFQAAhA4AID4AAMUUACC0BQEAsQoAIeUFAQC0CgAh_QUBALEKACGyBgEAsQoAIbQGAAC9Da8GIrUGAQC0CgAhtgaAAAAAAbcGAQCxCgAhuAYBALQKACG5BgEAtAoAIQ4SAACBDgAgEwAAgg4AIBQAAIMOACAVAACEDgAgtAUBALEKACHlBQEAtAoAIf0FAQCxCgAhsgYBALEKACG0BgAAvQ2vBiK1BgEAtAoAIbYGgAAAAAG3BgEAsQoAIbgGAQC0CgAhuQYBALQKACEDAAAAKgAgRQAAvBQAIEYAAMgUACAMAAAAKgAgDQAAjgsAIBAAAI8LACA-AADIFAAgtAUBALEKACH9BQEAsQoAIYIGAQC0CgAhgwYBALQKACGEBgEAtAoAIYUGAQC0CgAhhgYAAI0LACCHBkAAtQoAIQoNAACOCwAgEAAAjwsAILQFAQCxCgAh_QUBALEKACGCBgEAtAoAIYMGAQC0CgAhhAYBALQKACGFBgEAtAoAIYYGAACNCwAghwZAALUKACEDAAAAMgAgRQAAvhQAIEYAAMsUACAaAAAAMgAgDAAAkhAAIA0AAJMQACAQAACbEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgPgAAyxQAILQFAQCxCgAhuwVAALYKACG8BUAAtgoAIc0FAACRENIGIvcFAQC0CgAh_QUBALEKACGHBkAAtQoAIdAGAQCxCgAh0gYBALQKACEYDAAAkhAAIA0AAJMQACAQAACbEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACAzAACgEAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRUDAACvDAAgEAAAtQwAIBkAALQMACAeAACyDAAgJgAAsQwAIDQAALAMACA2AACzDAAgtAUBAAAAAbkFAQAAAAG7BUAAAAAB0gVAAAAAAfAFAQAAAAHzBQEAAAAB9AUBAAAAAYoGAQAAAAGLBgEAAAABjAYBAAAAAY0GAQAAAAGOBgEAAAABjwYBAAAAAZAGgAAAAAECAAAABQAgRQAAzBQAIBgMAAC1EQAgDQAAthEAIBAAAL4RACAWAADEEQAgGQAAwBEAIB4AALkRACAfAAC6EQAgIAAAtxEAICEAALgRACAiAAC7EQAgIwAAvBEAICYAAL0RACAuAAC_EQAgLwAAwREAIDAAAMIRACC0BQEAAAABuwVAAAAAAbwFQAAAAAHNBQAAANIGAvcFAQAAAAH9BQEAAAABhwZAAAAAAdAGAQAAAAHSBgEAAAABAgAAAP4BACBFAADOFAAgB7QFAQAAAAG7BUAAAAABywUBAAAAAc0FAQAAAAHOBQIAAAABzwUBAAAAAdAFQAAAAAEDAAAAAwAgRQAAzBQAIEYAANMUACAXAAAAAwAgAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAICYAAN0LACA0AADcCwAgNgAA3wsAID4AANMUACC0BQEAsQoAIbkFAQCxCgAhuwVAALYKACHSBUAAtgoAIfAFAQC0CgAh8wUBALQKACH0BQEAtAoAIYoGAQCxCgAhiwYBALQKACGMBgEAtAoAIY0GAQC0CgAhjgYBALQKACGPBgEAtAoAIZAGgAAAAAEVAwAA2wsAIBAAAOELACAZAADgCwAgHgAA3gsAICYAAN0LACA0AADcCwAgNgAA3wsAILQFAQCxCgAhuQUBALEKACG7BUAAtgoAIdIFQAC2CgAh8AUBALQKACHzBQEAtAoAIfQFAQC0CgAhigYBALEKACGLBgEAtAoAIYwGAQC0CgAhjQYBALQKACGOBgEAtAoAIY8GAQC0CgAhkAaAAAAAAQMAAAAyACBFAADOFAAgRgAA1hQAIBoAAAAyACAMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACA-AADWFAAgtAUBALEKACG7BUAAtgoAIbwFQAC2CgAhzQUAAJEQ0gYi9wUBALQKACH9BQEAsQoAIYcGQAC1CgAh0AYBALEKACHSBgEAtAoAIRgMAACSEAAgDQAAkxAAIBAAAJsQACAWAAChEAAgGQAAnRAAIB4AAJYQACAfAACXEAAgIAAAlBAAICEAAJUQACAiAACYEAAgIwAAmRAAICYAAJoQACAuAACcEAAgLwAAnhAAIDAAAJ8QACC0BQEAsQoAIbsFQAC2CgAhvAVAALYKACHNBQAAkRDSBiL3BQEAtAoAIf0FAQCxCgAhhwZAALUKACHQBgEAsQoAIdIGAQC0CgAhCAMAANcKACAPAADYCgAgtAUBAAAAAbkFAQAAAAHRBQEAAAAB0gVAAAAAAdMFgAAAAAHUBUAAAAABAgAAAKIBACBFAADXFAAgAwAAAKABACBFAADXFAAgRgAA2xQAIAoAAACgAQAgAwAAyAoAIA8AAMkKACA-AADbFAAgtAUBALEKACG5BQEAsQoAIdEFAQCxCgAh0gVAALYKACHTBYAAAAAB1AVAALYKACEIAwAAyAoAIA8AAMkKACC0BQEAsQoAIbkFAQCxCgAh0QUBALEKACHSBUAAtgoAIdMFgAAAAAHUBUAAtgoAIQQFADcuBgI2yQE0OM0BNgkDAAMFADUQwQEPGcABHh67ASMmugEmM8IBMDQAATa_ATQRBQAzDAoEDXYNEJsBDxapARAZnQEeHnkjH3okIHciIXgiInsUI3waJoABJi6cAQIvngERMJ8BFzOjATACAwADCgAFCAUAJQkABgsaDAwbBA0fDR1lIh5qIx9vJAQFAAsGAAcHAAkIFQUCBA4GBQAIAQQPAAIEEAYFAAoBBBEAAQgWAAEKAAUFA1gDBQAhCgAFDgAOGVweBAUAHQ0gDRAkDxYpEAMDAAMOAA4PJQIEAwADDisOES0RGEIXBgUAFhIAEhMzAxQ3FBU8FRY9EAIFABMRMBEBETEAAgM4AxEAEQERABEDFD4AFT8AFkAABgUAHBIAGBNHAxRLGhVQGxZREAIFABkXRRcBF0YAAgNMAxgAFwEYABcDFFIAFVMAFlQAAw1VABBWABZXAAQDAAMGAB8PYAIaXw0CBQAgGV0eARleAAEZYQADCgAFG2YDHAADAwMAAwoABQ9rAgIDAAMKAAUGC3AADHEADXIAHXMAHnQAH3UAAwMAAw-aAQInACcFBQAvJQAoJoYBJiyKASotlgEsAgUAKSSEAScBJIUBAAMFAC4nACcrjgErAigAKiqQASwDBQAtJwAnKZEBKwEpkgEAASuTAQADJpcBACyYAQAtmQEABAMAAwUAMg8AAjKnATEBMQAwATKoAQAQDKoBAA2rAQAQswEAFrkBABm1AQAergEAH68BACCsAQAhrQEAIrABACOxAQAmsgEALrQBAC-2AQAwtwEAM7gBAAIPAAI1AAEGEMcBABnGAQAexAEAJsMBADPIAQA2xQEAATcAAQMuzgEANs8BADjQAQAAAAADBQA8SwA9TAA-AAAAAwUAPEsAPUwAPgE3AAEBNwABAwUAQ0sAREwARQAAAAMFAENLAERMAEUAAAMFAEpLAEtMAEwAAAADBQBKSwBLTABMAAADBQBRSwBSTABTAAAAAwUAUUsAUkwAUwAAAwUAWEsAWUwAWgAAAAMFAFhLAFlMAFoCBgAHBwAJAgYABwcACQUFAF9LAGJMAGOdAQBgngEAYQAAAAAABQUAX0sAYkwAY50BAGCeAQBhAQkABgEJAAYDBQBoSwBpTABqAAAAAwUAaEsAaUwAagEKAAUBCgAFBQUAb0sAckwAc50BAHCeAQBxAAAAAAAFBQBvSwByTABznQEAcJ4BAHECAwADCgAFAgMAAwoABQUFAHhLAHtMAHydAQB5ngEAegAAAAAABQUAeEsAe0wAfJ0BAHmeAQB6AwOqAwMKAAUOAA4DA7ADAwoABQ4ADgUFAIEBSwCEAUwAhQGdAQCCAZ4BAIMBAAAAAAAFBQCBAUsAhAFMAIUBnQEAggGeAQCDAQMKAAUbwgMDHAADAwoABRvIAwMcAAMFBQCKAUsAjQFMAI4BnQEAiwGeAQCMAQAAAAAABQUAigFLAI0BTACOAZ0BAIsBngEAjAEDAwADCgAFD9oDAgMDAAMKAAUP4AMCBQUAkwFLAJYBTACXAZ0BAJQBngEAlQEAAAAAAAUFAJMBSwCWAUwAlwGdAQCUAZ4BAJUBAgMAAwoABQIDAAMKAAUFBQCcAUsAnwFMAKABnQEAnQGeAQCeAQAAAAAABQUAnAFLAJ8BTACgAZ0BAJ0BngEAngEAAAMFAKUBSwCmAUwApwEAAAADBQClAUsApgFMAKcBAAADBQCsAUsArQFMAK4BAAAAAwUArAFLAK0BTACuAQISABITugQDAhIAEhPABAMDBQCzAUsAtAFMALUBAAAAAwUAswFLALQBTAC1AQID0gQDEQARAgPYBAMRABEDBQC6AUsAuwFMALwBAAAAAwUAugFLALsBTAC8AQERABEBEQARBQUAwQFLAMQBTADFAZ0BAMIBngEAwwEAAAAAAAUFAMEBSwDEAUwAxQGdAQDCAZ4BAMMBAhIAGBOABQMCEgAYE4YFAwMFAMoBSwDLAUwAzAEAAAADBQDKAUsAywFMAMwBAgOYBQMYABcCA54FAxgAFwMFANEBSwDSAUwA0wEAAAADBQDRAUsA0gFMANMBARgAFwEYABcFBQDYAUsA2wFMANwBnQEA2QGeAQDaAQAAAAAABQUA2AFLANsBTADcAZ0BANkBngEA2gEAAAMFAOEBSwDiAUwA4wEAAAADBQDhAUsA4gFMAOMBASUAKAElACgFBQDoAUsA6wFMAOwBnQEA6QGeAQDqAQAAAAAABQUA6AFLAOsBTADsAZ0BAOkBngEA6gEDAwADD_UFAicAJwMDAAMP-wUCJwAnBQUA8QFLAPQBTAD1AZ0BAPIBngEA8wEAAAAAAAUFAPEBSwD0AUwA9QGdAQDyAZ4BAPMBAScAJwEnACcFBQD6AUsA_QFMAP4BnQEA-wGeAQD8AQAAAAAABQUA-gFLAP0BTAD-AZ0BAPsBngEA_AECKAAqKqMGLAIoACoqqQYsBQUAgwJLAIYCTACHAp0BAIQCngEAhQIAAAAAAAUFAIMCSwCGAkwAhwKdAQCEAp4BAIUCAScAJwEnACcFBQCMAksAjwJMAJACnQEAjQKeAQCOAgAAAAAABQUAjAJLAI8CTACQAp0BAI0CngEAjgIDAwADDgAOD9EGAgMDAAMOAA4P1wYCBQUAlQJLAJgCTACZAp0BAJYCngEAlwIAAAAAAAUFAJUCSwCYAkwAmQKdAQCWAp4BAJcCAgMAAzQAAQIDAAM0AAEDBQCeAksAnwJMAKACAAAAAwUAngJLAJ8CTACgAgIPAAI1AAECDwACNQABAwUApQJLAKYCTACnAgAAAAMFAKUCSwCmAkwApwIAAAMFAKwCSwCtAkwArgIAAAADBQCsAksArQJMAK4CAAADBQCzAksAtAJMALUCAAAAAwUAswJLALQCTAC1AgQDAAMGAB8PxwcCGsYHDQQDAAMGAB8PzgcCGs0HDQUFALoCSwC9AkwAvgKdAQC7Ap4BALwCAAAAAAAFBQC6AksAvQJMAL4CnQEAuwKeAQC8AgQDAAMO4AcOEeEHERjiBxcEAwADDugHDhHpBxEY6gcXBQUAwwJLAMYCTADHAp0BAMQCngEAxQIAAAAAAAUFAMMCSwDGAkwAxwKdAQDEAp4BAMUCAAAAAwUAzQJLAM4CTADPAgAAAAMFAM0CSwDOAkwAzwICAwADDwACAgMAAw8AAgMFANQCSwDVAkwA1gIAAAADBQDUAksA1QJMANYCATEAMAExADAFBQDbAksA3gJMAN8CnQEA3AKeAQDdAgAAAAAABQUA2wJLAN4CTADfAp0BANwCngEA3QIAAAADBQDlAksA5gJMAOcCAAAAAwUA5QJLAOYCTADnAgAAAAMFAO0CSwDuAkwA7wIAAAADBQDtAksA7gJMAO8COQIBOtEBATvUAQE81QEBPdYBAT_YAQFA2gE4QdsBOULdAQFD3wE4ROABOkfhAQFI4gEBSeMBOE3mATtO5wE_T-gBNlDpATZR6gE2UusBNlPsATZU7gE2VfABOFbxAUBX8wE2WPUBOFn2AUFa9wE2W_gBNlz5AThd_AFCXv0BRl__AQNggAIDYYICA2KDAgNjhAIDZIYCA2WIAjhmiQJHZ4sCA2iNAjhpjgJIao8CA2uQAgNskQI4bZQCSW6VAk1vlwIHcJgCB3GbAgdynAIHc50CB3SfAgd1oQI4dqICTnekAgd4pgI4eacCT3qoAgd7qQIHfKoCOH2tAlB-rgJUf7ACCYABsQIJgQG0AgmCAbUCCYMBtgIJhAG4AgmFAboCOIYBuwJVhwG9AgmIAb8COIkBwAJWigHBAgmLAcICCYwBwwI4jQHGAleOAccCW48ByAIGkAHJAgaRAcoCBpIBywIGkwHMAgaUAc4CBpUB0AI4lgHRAlyXAdMCBpgB1QI4mQHWAl2aAdcCBpsB2AIGnAHZAjifAdwCXqAB3QJkoQHeAgWiAd8CBaMB4AIFpAHhAgWlAeICBaYB5AIFpwHmAjioAecCZakB6QIFqgHrAjirAewCZqwB7QIFrQHuAgWuAe8COK8B8gJnsAHzAmuxAfQCDLIB9QIMswH2Agy0AfcCDLUB-AIMtgH6Agy3AfwCOLgB_QJsuQH_Agy6AYEDOLsBggNtvAGDAwy9AYQDDL4BhQM4vwGIA27AAYkDdMEBigMEwgGLAwTDAYwDBMQBjQMExQGOAwTGAZADBMcBkgM4yAGTA3XJAZUDBMoBlwM4ywGYA3bMAZkDBM0BmgMEzgGbAzjPAZ4Dd9ABnwN90QGgAw3SAaEDDdMBogMN1AGjAw3VAaQDDdYBpgMN1wGoAzjYAakDftkBrAMN2gGuAzjbAa8Df9wBsQMN3QGyAw3eAbMDON8BtgOAAeABtwOGAeEBuAMi4gG5AyLjAboDIuQBuwMi5QG8AyLmAb4DIucBwAM46AHBA4cB6QHEAyLqAcYDOOsBxwOIAewByQMi7QHKAyLuAcsDOO8BzgOJAfABzwOPAfEB0AMj8gHRAyPzAdIDI_QB0wMj9QHUAyP2AdYDI_cB2AM4-AHZA5AB-QHcAyP6Ad4DOPsB3wORAfwB4QMj_QHiAyP-AeMDOP8B5gOSAYAC5wOYAYEC6AMkggLpAySDAuoDJIQC6wMkhQLsAySGAu4DJIcC8AM4iALxA5kBiQLzAySKAvUDOIsC9gOaAYwC9wMkjQL4AySOAvkDOI8C_AObAZAC_QOhAZEC_wMSkgKABBKTAoMEEpQChAQSlQKFBBKWAocEEpcCiQQ4mAKKBKIBmQKMBBKaAo4EOJsCjwSjAZwCkAQSnQKRBBKeApIEOJ8ClQSkAaAClgSoAaECmAQYogKZBBijApwEGKQCnQQYpQKeBBimAqAEGKcCogQ4qAKjBKkBqQKlBBiqAqcEOKsCqASqAawCqQQYrQKqBBiuAqsEOK8CrgSrAbACrwSvAbECsAQRsgKxBBGzArIEEbQCswQRtQK0BBG2ArYEEbcCuAQ4uAK5BLABuQK8BBG6Ar4EOLsCvwSxAbwCwQQRvQLCBBG-AsMEOL8CxgSyAcACxwS2AcECyAQUwgLJBBTDAsoEFMQCywQUxQLMBBTGAs4EFMcC0AQ4yALRBLcByQLUBBTKAtYEOMsC1wS4AcwC2QQUzQLaBBTOAtsEOM8C3gS5AdAC3wS9AdEC4AQV0gLhBBXTAuIEFdQC4wQV1QLkBBXWAuYEFdcC6AQ42ALpBL4B2QLrBBXaAu0EONsC7gS_AdwC7wQV3QLwBBXeAvEEON8C9ATAAeAC9QTGAeEC9gQX4gL3BBfjAvgEF-QC-QQX5QL6BBfmAvwEF-cC_gQ46AL_BMcB6QKCBRfqAoQFOOsChQXIAewChwUX7QKIBRfuAokFOO8CjAXJAfACjQXNAfECjgUa8gKPBRrzApAFGvQCkQUa9QKSBRr2ApQFGvcClgU4-AKXBc4B-QKaBRr6ApwFOPsCnQXPAfwCnwUa_QKgBRr-AqEFOP8CpAXQAYADpQXUAYEDpgUbggOnBRuDA6gFG4QDqQUbhQOqBRuGA6wFG4cDrgU4iAOvBdUBiQOxBRuKA7MFOIsDtAXWAYwDtQUbjQO2BRuOA7cFOI8DugXXAZADuwXdAZEDvQUokgO-BSiTA8EFKJQDwgUolQPDBSiWA8UFKJcDxwU4mAPIBd4BmQPKBSiaA8wFOJsDzQXfAZwDzgUonQPPBSieA9AFOJ8D0wXgAaAD1AXkAaED1QUnogPWBSejA9cFJ6QD2AUnpQPZBSemA9sFJ6cD3QU4qAPeBeUBqQPgBSeqA-IFOKsD4wXmAawD5AUnrQPlBSeuA-YFOK8D6QXnAbAD6gXtAbED6wUmsgPsBSazA-0FJrQD7gUmtQPvBSa2A_EFJrcD8wU4uAP0Be4BuQP3BSa6A_kFOLsD-gXvAbwD_AUmvQP9BSa-A_4FOL8DgQbwAcADggb2AcEDgwYqwgOEBirDA4UGKsQDhgYqxQOHBirGA4kGKscDiwY4yAOMBvcByQOOBirKA5AGOMsDkQb4AcwDkgYqzQOTBirOA5QGOM8Dlwb5AdADmAb_AdEDmQYr0gOaBivTA5sGK9QDnAYr1QOdBivWA58GK9cDoQY42AOiBoAC2QOlBivaA6cGONsDqAaBAtwDqgYr3QOrBiveA6wGON8DrwaCAuADsAaIAuEDsQYs4gOyBizjA7MGLOQDtAYs5QO1BizmA7cGLOcDuQY46AO6BokC6QO8BizqA74GOOsDvwaKAuwDwAYs7QPBBizuA8IGOO8DxQaLAvADxgaRAvEDxwYP8gPIBg_zA8kGD_QDygYP9QPLBg_2A80GD_cDzwY4-APQBpIC-QPTBg_6A9UGOPsD1gaTAvwD2AYP_QPZBg_-A9oGOP8D3QaUAoAE3gaaAoEE3wYCggTgBgKDBOEGAoQE4gYChQTjBgKGBOUGAocE5wY4iAToBpsCiQTqBgKKBOwGOIsE7QacAowE7gYCjQTvBgKOBPAGOI8E8wadApAE9AahApEE9QY0kgT2BjSTBPcGNJQE-AY0lQT5BjSWBPsGNJcE_QY4mAT-BqICmQSABzSaBIIHOJsEgwejApwEhAc0nQSFBzSeBIYHOJ8EiQekAqAEigeoAqEEjAcOogSNBw6jBI8HDqQEkAcOpQSRBw6mBJMHDqcElQc4qASWB6kCqQSYBw6qBJoHOKsEmweqAqwEnAcOrQSdBw6uBJ4HOK8EoQerArAEogevArEEpAcfsgSlBx-zBKgHH7QEqQcftQSqBx-2BKwHH7cErgc4uASvB7ACuQSxBx-6BLMHOLsEtAexArwEtQcfvQS2Bx--BLcHOL8EugeyAsAEuwe2AsEEvAcewgS9Bx7DBL4HHsQEvwcexQTABx7GBMIHHscExAc4yATFB7cCyQTJBx7KBMsHOMsEzAe4AswEzwcezQTQBx7OBNEHOM8E1Ae5AtAE1Qe_AtEE1gcQ0gTXBxDTBNgHENQE2QcQ1QTaBxDWBNwHENcE3gc42ATfB8AC2QTkBxDaBOYHONsE5wfBAtwE6wcQ3QTsBxDeBO0HON8E8AfCAuAE8QfIAuEE8wfJAuIE9AfJAuME9wfJAuQE-AfJAuUE-QfJAuYE-wfJAucE_Qc46AT-B8oC6QSACMkC6gSCCDjrBIMIywLsBIQIyQLtBIUIyQLuBIYIOO8EiQjMAvAEigjQAvEEiwgw8gSMCDDzBI0IMPQEjggw9QSPCDD2BJEIMPcEkwg4-ASUCNEC-QSWCDD6BJgIOPsEmQjSAvwEmggw_QSbCDD-BJwIOP8EnwjTAoAFoAjXAoEFoQgxggWiCDGDBaMIMYQFpAgxhQWlCDGGBacIMYcFqQg4iAWqCNgCiQWsCDGKBa4IOIsFrwjZAowFsAgxjQWxCDGOBbIIOI8FtQjaApAFtgjgApEFuAjhApIFuQjhApMFvAjhApQFvQjhApUFvgjhApYFwAjhApcFwgg4mAXDCOICmQXFCOECmgXHCDibBcgI4wKcBckI4QKdBcoI4QKeBcsIOJ8FzgjkAqAFzwjoAqEF0QjpAqIF0gjpAqMF1QjpAqQF1gjpAqUF1wjpAqYF2QjpAqcF2wg4qAXcCOoCqQXeCOkCqgXgCDirBeEI6wKsBeII6QKtBeMI6QKuBeQIOK8F5wjsArAF6AjwAg"
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
    exports2.defineExtension = exports2.JsonNullValueFilter = exports2.NullsOrder = exports2.QueryMode = exports2.JsonNullValueInput = exports2.SortOrder = exports2.ReportScheduleScalarFieldEnum = exports2.NotificationChannelSettingScalarFieldEnum = exports2.ReportDeliveryScalarFieldEnum = exports2.DailyReportScalarFieldEnum = exports2.BrandingConfigScalarFieldEnum = exports2.WasteDisposalScalarFieldEnum = exports2.ExpenseScalarFieldEnum = exports2.ExpenseCategoryScalarFieldEnum = void 0;
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
      ReportSchedule: "ReportSchedule"
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
    exports2.AssetLocationStatus = exports2.ReturnWastageKind = exports2.MovementKind = exports2.PurchaseDestination = exports2.SiteStatus = exports2.Role = void 0;
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
    async function getSiteActivityFeed(prisma, siteId, range = {}) {
      const bounds = (0, date_range_1.dateRangeBounds)(range.from, range.to);
      const currentRows = (0, superseded_dsrs_1.currentDsrRowsWhere)(await (0, superseded_dsrs_1.supersededDsrIds)(prisma));
      const [purchases, movements, consumptions, returnWastages, workRecords, expenses, rmcEntries, dsrs, machineryMoves, vehicleMoves, wasteDisposals] = await Promise.all([
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
        if (purchase.totalAmount !== null) {
          throw new common_1.BadRequestException("This Purchase is already priced \u2014 changes to a priced Purchase must be filed as a correction");
        }
        return this.prisma.purchase.update({
          where: { id },
          data: {
            rate: input.rate,
            totalAmount: input.totalAmount,
            paymentStatus: input.paymentStatus
          }
        });
      }
      countPendingPricing() {
        return this.prisma.purchase.count({ where: { totalAmount: null } });
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
