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
      contractReference: import_zod3.z.string().max(200).optional()
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
var import_zod7, createUnitSchema;
var init_unit = __esm({
  "../../packages/shared/src/schemas/unit.ts"() {
    "use strict";
    import_zod7 = require("zod");
    createUnitSchema = import_zod7.z.object({
      name: import_zod7.z.string().min(1).max(50)
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
var import_zod9, purchaseDestinationSchema, paymentStatusSchema, createPurchaseSchema;
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
      rate: import_zod9.z.number().positive(),
      totalAmount: import_zod9.z.number().positive(),
      invoiceOrChallanNo: import_zod9.z.string().min(1).optional(),
      paymentStatus: paymentStatusSchema,
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

// ../../packages/shared/src/schemas/branding-config.ts
var import_zod29, hexColor, updateBrandingConfigSchema;
var init_branding_config = __esm({
  "../../packages/shared/src/schemas/branding-config.ts"() {
    "use strict";
    import_zod29 = require("zod");
    hexColor = import_zod29.z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color, e.g. #0F5257");
    updateBrandingConfigSchema = import_zod29.z.object({
      tenantName: import_zod29.z.string().min(1).max(200).optional(),
      logoUrl: import_zod29.z.url().nullable().optional(),
      // Primary/Secondary/Accent — the three swatches the mockup shows. All three
      // share primaryColor's 6-digit-hex validation.
      primaryColor: hexColor.optional(),
      secondaryColor: hexColor.optional(),
      accentColor: hexColor.optional(),
      // GSTIN is validated for length only — this product does not need to enforce
      // India's GST checksum rules to satisfy FR-47 (a valid-looking 15-char GSTIN
      // is enough; a stricter check would reject legitimate edge cases nobody asked
      // us to police).
      registeredAddress: import_zod29.z.string().max(500).nullable().optional(),
      contactPhone: import_zod29.z.string().max(50).nullable().optional(),
      gstin: import_zod29.z.string().max(50).nullable().optional()
    });
  }
});

// ../../packages/shared/src/schemas/notification-channel-setting.ts
var import_zod30, updateNotificationChannelSettingSchema;
var init_notification_channel_setting = __esm({
  "../../packages/shared/src/schemas/notification-channel-setting.ts"() {
    "use strict";
    import_zod30 = require("zod");
    updateNotificationChannelSettingSchema = import_zod30.z.object({
      enabled: import_zod30.z.boolean(),
      recipientUserIds: import_zod30.z.array(import_zod30.z.uuid())
    });
  }
});

// ../../packages/shared/src/schemas/report-schedule.ts
var import_zod31, REPORT_SCHEDULE_TYPES, REPORT_SCHEDULE_FREQUENCIES, reportScheduleTypeSchema, reportScheduleFrequencySchema, createReportScheduleSchema, updateReportScheduleSchema;
var init_report_schedule = __esm({
  "../../packages/shared/src/schemas/report-schedule.ts"() {
    "use strict";
    import_zod31 = require("zod");
    REPORT_SCHEDULE_TYPES = [
      "SITE",
      "INVENTORY",
      "LABOUR",
      "MACHINERY_VEHICLE",
      "FINANCIAL"
    ];
    REPORT_SCHEDULE_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"];
    reportScheduleTypeSchema = import_zod31.z.enum(REPORT_SCHEDULE_TYPES);
    reportScheduleFrequencySchema = import_zod31.z.enum(REPORT_SCHEDULE_FREQUENCIES);
    createReportScheduleSchema = import_zod31.z.object({
      reportType: reportScheduleTypeSchema,
      frequency: reportScheduleFrequencySchema,
      recipientUserIds: import_zod31.z.array(import_zod31.z.uuid()).default([]),
      siteId: import_zod31.z.uuid().optional(),
      enabled: import_zod31.z.boolean().default(true)
    });
    updateReportScheduleSchema = import_zod31.z.object({
      reportType: reportScheduleTypeSchema,
      frequency: reportScheduleFrequencySchema,
      recipientUserIds: import_zod31.z.array(import_zod31.z.uuid()),
      siteId: import_zod31.z.uuid().nullable(),
      enabled: import_zod31.z.boolean()
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

// ../../packages/shared/src/index.ts
var src_exports = {};
__export(src_exports, {
  REPORT_SCHEDULE_FREQUENCIES: () => REPORT_SCHEDULE_FREQUENCIES,
  REPORT_SCHEDULE_TYPES: () => REPORT_SCHEDULE_TYPES,
  ROLES: () => ROLES,
  assetLocationStatusSchema: () => assetLocationStatusSchema,
  assetTypeSchema: () => assetTypeSchema,
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
    init_branding_config();
    init_notification_channel_setting();
    init_report_schedule();
    init_activity_feed();
    init_photo_gallery();
    init_report_filters();
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
      "inlineSchema": '// Single schema, run identically against every tenant\'s separate database\n// (architecture spine AD-2, AD-12). No tenant_id anywhere \u2014 AD-1 forbids it;\n// a deployment\'s database belongs to exactly one Tenant.\n//\n// Tables listed under "Append-only (AD-9)" below are never UPDATEd or\n// DELETEd by application code \u2014 enforced by revoking those grants from the\n// API\'s Postgres role in the deployment migration, not by Prisma itself.\n// A correction is a new row with `correctsId` pointing at the row it fixes\n// and a required `reason`.\n\ngenerator client {\n  provider     = "prisma-client"\n  output       = "../../apps/api/src/generated/prisma"\n  moduleFormat = "cjs" // apps/api is a CommonJS NestJS build, not ESM\n}\n\n// Connection URL lives in prisma.config.ts (Prisma 7), not here.\ndatasource db {\n  provider = "postgresql"\n}\n\n// ---------- Identity ----------\n\nenum Role {\n  OWNER_ADMIN\n  SITE_SUPERVISOR\n}\n\n// This table owns both authentication (bcrypt passwordHash, verified by\n// apps/api\'s own /auth/login) and authorization (AD-10, AD-11 \u2014 Role here is\n// the only in-app role set, never "Platform Operator").\nmodel User {\n  id           String   @id @default(uuid(7))\n  name         String\n  email        String   @unique\n  passwordHash String\n  role         Role\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  dailySiteReports DailySiteReport[]\n  photos           Photo[]\n}\n\n// ---------- Sites ----------\n\nenum SiteStatus {\n  ACTIVE\n  COMPLETED\n  ON_HOLD\n}\n\nmodel Site {\n  id                String     @id @default(uuid(7))\n  name              String\n  location          String\n  status            SiteStatus @default(ACTIVE)\n  contractReference String?\n  createdAt         DateTime   @default(now())\n  updatedAt         DateTime   @updatedAt\n\n  siteStock              SiteStock[]\n  purchases              Purchase[]\n  movementsFrom          Movement[]             @relation("MovementSourceSite")\n  movementsTo            Movement[]             @relation("MovementDestinationSite")\n  consumptions           Consumption[]\n  returnWastages         ReturnWastage[]\n  machineryMovements     MachineryMovementLog[]\n  vehicleMovements       VehicleMovementLog[]\n  workRecords            WorkRecord[]\n  rmcEntries             RmcEntry[]\n  dailySiteReports       DailySiteReport[]\n  expenses               Expense[]\n  machineryCurrentlyHere Machinery[]\n  vehiclesCurrentlyHere  Vehicle[]\n  dailyReports           DailyReport[]\n}\n\n// ---------- Material catalog (FR-4..FR-7) ----------\n\nmodel MaterialCategory {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  isActive  Boolean    @default(true)\n  materials Material[]\n}\n\nmodel Unit {\n  id        String     @id @default(uuid(7))\n  name      String     @unique\n  materials Material[]\n}\n\nmodel Material {\n  id                String           @id @default(uuid(7))\n  categoryId        String\n  category          MaterialCategory @relation(fields: [categoryId], references: [id])\n  unitId            String\n  unit              Unit             @relation(fields: [unitId], references: [id])\n  name              String\n  isActive          Boolean          @default(true)\n  customFields      Json             @default("{}") // FR-7 \u2014 admin custom fields, no migration needed\n  lowStockThreshold Decimal? // FR-36 \u2014 nullable: no threshold set means never flagged, never a default nobody chose\n\n  sizes MaterialSize[]\n\n  @@unique([categoryId, name])\n}\n\nmodel MaterialSize {\n  id         String   @id @default(uuid(7))\n  materialId String\n  material   Material @relation(fields: [materialId], references: [id])\n  label      String // e.g. "300mm"\n\n  godownStock    GodownStock[]\n  siteStock      SiteStock[]\n  purchases      Purchase[]\n  movements      Movement[]\n  consumptions   Consumption[]\n  returnWastages ReturnWastage[]\n\n  @@unique([materialId, label])\n}\n\n// ---------- Inventory lifecycle (FR-8..FR-14) ----------\n// GodownStock/SiteStock are materialized, write-path-only balances\n// (AD-9): the only writer is the same transaction that inserts the\n// causing Purchase/Movement/Consumption/ReturnWastage row.\n\nmodel GodownStock {\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([materialSizeId])\n}\n\nmodel SiteStock {\n  siteId         String\n  site           Site         @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize @relation(fields: [materialSizeId], references: [id])\n  quantity       Decimal      @default(0)\n  updatedAt      DateTime     @updatedAt\n\n  @@id([siteId, materialSizeId])\n}\n\nenum PurchaseDestination {\n  GODOWN\n  SITE\n}\n\n// Append-only (AD-9).\nmodel Purchase {\n  id                 String              @id @default(uuid(7))\n  vendorId           String\n  vendor             Vendor              @relation(fields: [vendorId], references: [id])\n  materialSizeId     String\n  materialSize       MaterialSize        @relation(fields: [materialSizeId], references: [id])\n  destination        PurchaseDestination\n  siteId             String? // required when destination = SITE (FR-8, FR-10)\n  site               Site?               @relation(fields: [siteId], references: [id])\n  quantity           Decimal\n  rate               Decimal\n  totalAmount        Decimal\n  invoiceOrChallanNo String?\n  paymentStatus      String\n  deliveryLocation   String?\n  vehicleDetails     String?\n  receiverName       String? // FR-10 direct Vendor->Site\n  notes              String?\n  purchasedAt        DateTime\n  createdAt          DateTime            @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  expenses Expense[]\n}\n\nenum MovementKind {\n  GODOWN_TO_SITE // FR-9\n  SITE_TO_SITE // FR-11\n}\n\n// Append-only (AD-9).\nmodel Movement {\n  id                String       @id @default(uuid(7))\n  kind              MovementKind\n  materialSizeId    String\n  materialSize      MaterialSize @relation(fields: [materialSizeId], references: [id])\n  sourceSiteId      String? // null when kind = GODOWN_TO_SITE (source is the Godown)\n  sourceSite        Site?        @relation("MovementSourceSite", fields: [sourceSiteId], references: [id])\n  destinationSiteId String\n  destinationSite   Site         @relation("MovementDestinationSite", fields: [destinationSiteId], references: [id])\n  sentQuantity      Decimal\n  receivedQuantity  Decimal? // shortage/damage gap = sentQuantity - receivedQuantity\n  vehicleDetails    String?\n  personResponsible String?\n  notes             String?\n  movedAt           DateTime\n  createdAt         DateTime     @default(now())\n  correctsId        String?\n  reason            String?\n\n  @@index([materialSizeId])\n}\n\n// Append-only (AD-9).\nmodel Consumption {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  materialSizeId    String\n  materialSize      MaterialSize     @relation(fields: [materialSizeId], references: [id])\n  quantity          Decimal\n  activityReference String?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  recordedByUserId  String\n  notes             String?\n  consumedAt        DateTime\n  createdAt         DateTime         @default(now())\n  correctsId        String?\n  reason            String?\n  // Story 3.2: set by the offline queue at queue-write time so a retried\n  // sync upserts the same row instead of creating a duplicate \u2014 this\n  // model has no other natural key (a Site can legitimately have two\n  // separate Consumption entries for the same Material on the same day).\n  clientGeneratedId String?          @unique\n}\n\nenum ReturnWastageKind {\n  RETURN\n  WASTAGE\n}\n\n// Append-only (AD-9).\nmodel ReturnWastage {\n  id             String            @id @default(uuid(7))\n  siteId         String\n  site           Site              @relation(fields: [siteId], references: [id])\n  materialSizeId String\n  materialSize   MaterialSize      @relation(fields: [materialSizeId], references: [id])\n  kind           ReturnWastageKind\n  quantity       Decimal\n  notes          String?\n  recordedAt     DateTime\n  createdAt      DateTime          @default(now())\n  correctsId     String?\n  reason         String?\n}\n\n// ---------- Machinery & Vehicles (FR-15..FR-18) ----------\n\nenum AssetLocationStatus {\n  AVAILABLE\n  AT_SITE\n  MAINTENANCE\n}\n\n// FR-15, NFR-4: admin-configurable data, not a hardcoded enum or free\n// string \u2014 same minimal create+list-now, full admin lifecycle later\n// (Epic 14) split Epic 4 Story 4.1 used for Unit (no isActive field\n// either, same precedent).\nmodel MachineryType {\n  id        String      @id @default(uuid(7))\n  name      String      @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 8.1 deferred to\n  // Epic 14. Disabling hides the type from new-asset entry forms without\n  // touching Machinery already assigned to it \u2014 master data, an in-place edit,\n  // never one of AD-9\'s append-only tables.\n  isActive  Boolean     @default(true)\n  machinery Machinery[]\n}\n\n// FR-16, NFR-4: same split as MachineryType above \u2014 a separate table, not\n// shared with it, since Machinery and Vehicle types aren\'t the same\n// domain concept.\nmodel VehicleType {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): same admin-lifecycle addition as MachineryType.\n  isActive Boolean   @default(true)\n  vehicles Vehicle[]\n}\n\nmodel Machinery {\n  id            String              @id @default(uuid(7))\n  name          String\n  typeId        String\n  type          MachineryType       @relation(fields: [typeId], references: [id])\n  assetNumber   String              @unique\n  model         String?\n  ownership     String?\n  operator      String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs MachineryMovementLog[]\n  serviceLogs  MachineryServiceLog[]\n}\n\n// Append-only (AD-9) \u2014 full movement history, not just current state.\n// Story 8.2: a correction is a new row with correctsId set, whose\n// toStatus/siteId is a full restatement of the corrected value (not a\n// delta, unlike Purchase/Movement/Consumption\'s numeric quantities) \u2014 same\n// plain correctsId/reason pattern as elsewhere in this schema, no\n// enforced self-relation.\nmodel MachineryMovementLog {\n  id          String              @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery           @relation(fields: [machineryId], references: [id])\n  toStatus    AssetLocationStatus\n  siteId      String?\n  site        Site?               @relation(fields: [siteId], references: [id])\n  movedAt     DateTime\n  createdAt   DateTime            @default(now())\n  correctsId  String?\n  reason      String? // required when correctsId is set\n}\n\nmodel MachineryServiceLog {\n  id          String    @id @default(uuid(7))\n  machineryId String\n  machinery   Machinery @relation(fields: [machineryId], references: [id])\n  kind        String // fuel | maintenance | repair\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime  @default(now())\n}\n\nmodel Vehicle {\n  id            String              @id @default(uuid(7))\n  number        String              @unique\n  typeId        String\n  type          VehicleType         @relation(fields: [typeId], references: [id])\n  ownership     String?\n  driver        String?\n  currentStatus AssetLocationStatus @default(AVAILABLE)\n  currentSiteId String?\n  currentSite   Site?               @relation(fields: [currentSiteId], references: [id])\n  customFields  Json                @default("{}")\n\n  movementLogs VehicleMovementLog[]\n  serviceLogs  VehicleServiceLog[]\n}\n\n// Append-only (AD-9). Same correction shape as MachineryMovementLog above.\nmodel VehicleMovementLog {\n  id         String              @id @default(uuid(7))\n  vehicleId  String\n  vehicle    Vehicle             @relation(fields: [vehicleId], references: [id])\n  toStatus   AssetLocationStatus\n  siteId     String?\n  site       Site?               @relation(fields: [siteId], references: [id])\n  movedAt    DateTime\n  createdAt  DateTime            @default(now())\n  correctsId String?\n  reason     String? // required when correctsId is set\n}\n\nmodel VehicleServiceLog {\n  id          String   @id @default(uuid(7))\n  vehicleId   String\n  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])\n  kind        String\n  notes       String?\n  cost        Decimal?\n  serviceDate DateTime\n  createdAt   DateTime @default(now())\n}\n\n// ---------- Labour (FR-19..FR-25) ----------\n\n// FR-19, NFR-4: admin-configurable data, not a hardcoded enum \u2014 same\n// minimal create+list-now, full admin lifecycle later (Epic 14) split\n// Epic 4 Story 4.1 used for Unit.\nmodel EmploymentType {\n  id       String  @id @default(uuid(7))\n  name     String  @unique\n  isActive Boolean @default(true)\n\n  teamMembers TeamMember[]\n}\n\nmodel TeamMember {\n  id               String         @id @default(uuid(7))\n  name             String\n  designation      String?\n  contact          String?\n  employmentTypeId String\n  employmentType   EmploymentType @relation(fields: [employmentTypeId], references: [id])\n  isActive         Boolean        @default(true)\n\n  // AD-9\'s materialized, write-path-only balance (Story 7.1) \u2014 same class\n  // of column as GodownStock/SiteStock.quantity, never a value summed from\n  // Advance/AdvanceAdjustment rows on every read.\n  outstandingAdvanceBalance Decimal @default(0)\n\n  workRecords WorkRecord[]\n  advances    Advance[]\n  payments    Payment[]\n}\n\n// One row per Team Member per Site per date (FR-20) \u2014 enforced at the\n// application level (apps/api/src/dsr/dsr.service.ts), not by a DB unique\n// constraint. Story 3.5: a correction that changes an existing crew\n// member\'s attendance for an already-reported date needs to insert its own\n// fresh WorkRecord row (AD-9 \u2014 the original\'s rows are never touched), which\n// a hard unique constraint on (teamMemberId, workDate) would make\n// impossible (a correction and the row it corrects can legitimately share\n// the same team member + date). The "never two Sites, same date"\n// double-booking rule this constraint used to enforce as a DB backstop\n// moved to an explicit application-level check instead (same as\n// DailySiteReport\'s own siteId+reportDate constraint, relaxed for the same\n// reason).\nmodel WorkRecord {\n  id                String           @id @default(uuid(7))\n  teamMemberId      String\n  teamMember        TeamMember       @relation(fields: [teamMemberId], references: [id])\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  workDate          DateTime         @db.Date\n  attended          Boolean          @default(true)\n  hours             Decimal?\n  overtimeHours     Decimal?\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  createdAt         DateTime         @default(now())\n\n  @@index([teamMemberId, workDate])\n}\n\n// Append-only (AD-9). `reason` is the business reason the Advance was\n// given (e.g. "medical emergency") \u2014 a different question from why a\n// correcting entry exists, so the correction pair below is a distinct,\n// separately-named field (Story 7.1), same disambiguation DailySiteReport\n// needed for its own pre-existing `notes` field.\nmodel Advance {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  amount           Decimal\n  reason           String?\n  paymentMethod    String?\n  givenAt          DateTime\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n\n  adjustments AdvanceAdjustment[]\n}\n\n// Append-only (AD-9). FR-23: amount must never exceed the Advance\'s\n// current outstanding balance \u2014 enforced in the service layer at the same\n// transaction boundary that writes this row, not just at the UI. `note` is\n// the free-form business note for the adjustment itself \u2014 same\n// disambiguation as Advance.reason vs. correctionReason above.\nmodel AdvanceAdjustment {\n  id               String   @id @default(uuid(7))\n  advanceId        String\n  advance          Advance  @relation(fields: [advanceId], references: [id])\n  paymentId        String?\n  payment          Payment? @relation(fields: [paymentId], references: [id])\n  amount           Decimal\n  note             String?\n  adjustedAt       DateTime\n  createdAt        DateTime @default(now())\n  correctsId       String?\n  correctionReason String? // required when correctsId is set\n}\n\n// Append-only (AD-9). No pre-existing reason/note field to collide with,\n// so this uses the plain correctsId/reason pair (Purchase/Movement/\n// Consumption\'s convention), not the disambiguated correctionReason name\n// Advance/AdvanceAdjustment need above.\nmodel Payment {\n  id               String     @id @default(uuid(7))\n  teamMemberId     String\n  teamMember       TeamMember @relation(fields: [teamMemberId], references: [id])\n  basePay          Decimal\n  additionalAmount Decimal    @default(0)\n  deductions       Decimal    @default(0)\n  netPayable       Decimal\n  // Free text, e.g. "1-15 Aug 2026" \u2014 not a structured date range; no FR\n  // requires a calendar-computed period (Story 7.3).\n  payPeriod        String?\n  status           String // pending | paid\n  paidAt           DateTime?\n  createdAt        DateTime   @default(now())\n  correctsId       String?\n  reason           String? // required when correctsId is set\n\n  advanceAdjustments AdvanceAdjustment[]\n}\n\n// ---------- RMC (FR-26..FR-27) ----------\n\nmodel RmcEntry {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  vendorId           String\n  vendor             Vendor   @relation(fields: [vendorId], references: [id])\n  quantityM3         Decimal\n  grade              String\n  ratePerM3          Decimal\n  totalAmount        Decimal\n  invoiceOrChallanNo String?\n  deliveredAt        DateTime\n  createdAt          DateTime @default(now())\n  correctsId         String?\n  reason             String? // required when correctsId is set\n\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// ---------- Daily Site Report (FR-28..FR-31) ----------\n\nmodel DailySiteReport {\n  id                 String   @id @default(uuid(7))\n  siteId             String\n  site               Site     @relation(fields: [siteId], references: [id])\n  reportDate         DateTime @db.Date\n  submittedByUserId  String\n  submittedBy        User     @relation(fields: [submittedByUserId], references: [id])\n  workCompleted      String?\n  workInProgress     String?\n  plannedWork        String?\n  issuesBlockers     String?\n  safetyObservations String?\n  notes              String?\n  createdAt          DateTime @default(now())\n\n  workRecords  WorkRecord[]\n  consumptions Consumption[]\n  photos       Photo[]\n  expenses     Expense[]\n  rmcEntries   RmcEntry[]\n  dailyReports DailyReport[]\n\n  // Informational tagging only \u2014 "JCB 3DX was in use today" is not a\n  // location/status change (that\'s Epic 8\'s MachineryMovementLog /\n  // VehicleMovementLog concern), so this is deliberately not a relation.\n  // Denormalized (stores the name at entry time) so this DSR\'s feed entry\n  // still reads correctly even if the asset is later renamed/deleted.\n  equipmentUsed Json @default("[]")\n\n  // Story 3.5 (AD-9, FR-54): a correction is a new row, never an edit \u2014\n  // same plain correctsId/reason pattern as Purchase/Movement/Consumption\n  // elsewhere in this schema, no enforced self-relation.\n  correctsId String?\n  reason     String? // required when correctsId is set\n\n  @@index([siteId, reportDate])\n}\n\nmodel Photo {\n  id                String          @id @default(uuid(7))\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  storageKey        String // Cloudflare R2 object key\n  uploadedByUserId  String\n  uploadedBy        User            @relation(fields: [uploadedByUserId], references: [id])\n  createdAt         DateTime        @default(now())\n}\n\n// ---------- Vendors & Expenses (FR-39..FR-41) ----------\n\nmodel Vendor {\n  id                String   @id @default(uuid(7))\n  name              String\n  contactPerson     String?\n  phone             String?\n  email             String?\n  address           String?\n  materialsSupplied String[] @default([])\n\n  purchases  Purchase[]\n  rmcEntries RmcEntry[]\n}\n\nmodel ExpenseCategory {\n  id       String    @id @default(uuid(7))\n  name     String    @unique\n  // Story 14.3 (FR-49, NFR-4): the full admin lifecycle Story 11.1 deferred to\n  // Epic 14. Disabling hides the category from the Expense entry form without\n  // touching Expenses already recorded against it.\n  isActive Boolean   @default(true)\n  expenses Expense[]\n}\n\nmodel Expense {\n  id                String           @id @default(uuid(7))\n  siteId            String\n  site              Site             @relation(fields: [siteId], references: [id])\n  categoryId        String\n  category          ExpenseCategory  @relation(fields: [categoryId], references: [id])\n  amount            Decimal\n  description       String?\n  paymentMethod     String?\n  personOrVendor    String?\n  purchaseId        String? // links an Expense that IS a Purchase\'s cost entry\n  purchase          Purchase?        @relation(fields: [purchaseId], references: [id])\n  dailySiteReportId String?\n  dailySiteReport   DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])\n  incurredAt        DateTime\n  createdAt         DateTime         @default(now())\n  // Story 11.1 (AD-9, FR-41): a correction is a new, reason-carrying row\n  // linked to the one it corrects \u2014 never an edit/delete. Plain\n  // correctsId/reason pair (no pre-existing reason/note field on Expense to\n  // collide with), same convention as Purchase/Movement/RmcEntry. A\n  // correcting row\'s `amount` is a signed delta (Epic 5\'s Story 5.1 rule),\n  // not a restated total.\n  correctsId        String?\n  reason            String? // required when correctsId is set\n  // Story 3.2 offline-sync idempotency key \u2014 same reasoning as\n  // Consumption.clientGeneratedId.\n  clientGeneratedId String?          @unique\n}\n\n// ---------- Branding & Automated Report Delivery (FR-32, FR-33) ----------\n\n// Story 13.1: single-row app-configuration record for this deployment\'s own\n// branding. This is NOT a `Tenant` table in AD-1\'s forbidden sense \u2014 no\n// tenant_id, no cross-tenant selector; it is the same category of thing as\n// infra/tenants/*.json\'s committed per-deployment config, just runtime-\n// editable (a build-time/env-var config couldn\'t satisfy FR-47\'s "no publish\n// step"). Seeded with exactly one row at deploy time (infra/prisma/seed.ts);\n// Epic 14 later adds the admin UI that edits it. `primaryColor` defaults to\n// this product\'s own accent-teal-700 token as a neutral placeholder.\n//\n// Story 14.1 (FR-47) extends 13.1\'s minimum three fields with the rest of the\n// mockup\'s Branding section: two more brand-colour swatches (Secondary/Accent,\n// defaulting to the accent-navy-800 / gold-500 token values), plus the\n// registered address, contact phone and GSTIN. These do NOT recreate the model\n// \u2014 13.1\'s row is edited in place \u2014 so every generated report carries the full\n// business identity, not just a name + one colour.\nmodel BrandingConfig {\n  id                String   @id @default(uuid(7))\n  tenantName        String\n  logoUrl           String?\n  primaryColor      String   @default("#0F5257")\n  secondaryColor    String   @default("#16273E")\n  accentColor       String   @default("#C7912B")\n  registeredAddress String?\n  contactPhone      String?\n  gstin             String?\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n}\n\n// Story 13.1 (FR-32): the compiled, auto-generated per-Site daily report.\n// `content` is the fully-rendered payload \u2014 site name, date, a branding\n// snapshot, and the work/labour/material/RMC/expense summary plus the DSR\'s\n// free-text `equipmentUsed` tags (informational tags entered on the DSR, not\n// machinery-at-site location data) drawn from the linked DSR\'s own relations \u2014\n// deliberately DENORMALIZED and stored\n// at generation time: if BrandingConfig or the underlying DSR data changes\n// afterwards, a historical report must still read exactly as it was\n// delivered, never silently re-render with today\'s branding.\n// `dailySiteReportId` is required \u2014 no DailyReport row exists for a Site/day\n// with no DSR at all (AC #4), so this is not a nullable "maybe compiled"\n// field.\nmodel DailyReport {\n  id                String          @id @default(uuid(7))\n  siteId            String\n  site              Site            @relation(fields: [siteId], references: [id])\n  dailySiteReportId String\n  dailySiteReport   DailySiteReport @relation(fields: [dailySiteReportId], references: [id])\n  reportDate        DateTime        @db.Date\n  content           Json\n  generatedAt       DateTime        @default(now())\n\n  deliveries ReportDelivery[]\n\n  @@unique([siteId, reportDate])\n}\n\n// Story 13.1 (FR-33): one row per (DailyReport, channel). `status`/\n// `attempts`/`lastError`/`deliveredAt` are narrowly mutable via retry \u2014 this\n// is lifecycle completion of an in-progress delivery event, NOT an AD-9\n// correction (the same reasoning Epic 5 Story 5.2\'s `confirmReceipt` and\n// Epic 7 Story 7.3\'s `markPaid` already established: completing an\n// in-progress event is not a transaction-history correction), so there is\n// deliberately no correctsId/reason pair here. `@@unique([dailyReportId,\n// channel])` makes delivery idempotent at the DB level: a re-run of the\n// compile Cron (or a `?date=` backfill of an already-processed day) can never\n// create a second row for the same channel, so no double-send is possible even\n// under a check-then-act race \u2014 the create\'s P2002 is caught and treated as\n// "already exists / skip send".\nmodel ReportDelivery {\n  id            String      @id @default(uuid(7))\n  dailyReportId String\n  dailyReport   DailyReport @relation(fields: [dailyReportId], references: [id])\n  channel       String\n  status        String      @default("PENDING")\n  attempts      Int         @default(0)\n  lastError     String?\n  deliveredAt   DateTime?\n  createdAt     DateTime    @default(now())\n\n  @@unique([dailyReportId, channel])\n}\n\n// Story 14.4 (FR-50): which channels receive automated reports, and to whom.\n// This replaces Story 13.1\'s hardcoded enabled-channels set + Owner/Admin\n// recipient default with real, admin-editable configuration. Same\n// configuration-record category as BrandingConfig (Story 13.1) \u2014 NOT an AD-9\n// transaction-history table (no correctsId/reason), edited in place. Seeded\n// (infra/prisma/seed.ts) with exactly the three rows Story 13.1\'s defaults\n// implied, so switching ReportDeliveryService to read from this table does not\n// change day-one delivery behaviour. `channel` is @unique \u2014 it is the natural\n// key the PATCH /notification-settings/:channel route targets. `recipientUserIds`\n// holds User.id values (resolved to emails at send time); IN_APP ignores it\n// (in-app "delivery" has no per-user targeting).\nmodel NotificationChannelSetting {\n  id               String   @id @default(uuid(7))\n  channel          String   @unique\n  enabled          Boolean  @default(false)\n  recipientUserIds String[] @default([])\n}\n\n// Story 14.5 (FR-51): scheduled, multi-cadence delivery of Epic 13\'s report set\n// (Site/Inventory/Labour/Machinery-Vehicle/Financial) \u2014 configured and run\n// entirely INDEPENDENTLY of the daily-DSR delivery (FR-50 / Story 13.1). A\n// separate model + a separate Cron job (POST /cron/run-report-schedules), never\n// a shared "reports" scheduler with a mode flag: independence is structural, not\n// conventional. Configuration record, edited in place (no correctsId/reason) \u2014\n// same category as NotificationChannelSetting / BrandingConfig, NOT an AD-9\n// transaction-history table. `reportType`: SITE | INVENTORY | LABOUR |\n// MACHINERY_VEHICLE | FINANCIAL. `frequency`: DAILY | WEEKLY | MONTHLY. `siteId`\n// optional \u2014 a schedule can be Site-scoped or cover all Sites (null), matching\n// Epic 13\'s own filter shape (plain scalar, not an FK relation \u2014 it is a query\n// param the report endpoints accept, not a structural link). `lastRunAt` drives\n// due-detection: a schedule is due when frequency-worth of time has elapsed\n// since it, or immediately if null.\nmodel ReportSchedule {\n  id               String    @id @default(uuid(7))\n  reportType       String\n  frequency        String\n  recipientUserIds String[]  @default([])\n  enabled          Boolean   @default(false)\n  siteId           String?\n  lastRunAt        DateTime?\n  createdAt        DateTime  @default(now())\n  updatedAt        DateTime  @updatedAt\n}\n',
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
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToUser"},{"name":"photos","kind":"object","type":"Photo","relationName":"PhotoToUser"}],"dbName":null},"Site":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SiteStatus"},{"name":"contractReference","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"SiteToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToSite"},{"name":"movementsFrom","kind":"object","type":"Movement","relationName":"MovementSourceSite"},{"name":"movementsTo","kind":"object","type":"Movement","relationName":"MovementDestinationSite"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToSite"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"ReturnWastageToSite"},{"name":"machineryMovements","kind":"object","type":"MachineryMovementLog","relationName":"MachineryMovementLogToSite"},{"name":"vehicleMovements","kind":"object","type":"VehicleMovementLog","relationName":"SiteToVehicleMovementLog"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"SiteToWorkRecord"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToSite"},{"name":"dailySiteReports","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToSite"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToSite"},{"name":"machineryCurrentlyHere","kind":"object","type":"Machinery","relationName":"MachineryToSite"},{"name":"vehiclesCurrentlyHere","kind":"object","type":"Vehicle","relationName":"SiteToVehicle"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToSite"}],"dbName":null},"MaterialCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToMaterialCategory"}],"dbName":null},"Unit":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"materials","kind":"object","type":"Material","relationName":"MaterialToUnit"}],"dbName":null},"Material":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"MaterialCategory","relationName":"MaterialToMaterialCategory"},{"name":"unitId","kind":"scalar","type":"String"},{"name":"unit","kind":"object","type":"Unit","relationName":"MaterialToUnit"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"lowStockThreshold","kind":"scalar","type":"Decimal"},{"name":"sizes","kind":"object","type":"MaterialSize","relationName":"MaterialToMaterialSize"}],"dbName":null},"MaterialSize":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"materialId","kind":"scalar","type":"String"},{"name":"material","kind":"object","type":"Material","relationName":"MaterialToMaterialSize"},{"name":"label","kind":"scalar","type":"String"},{"name":"godownStock","kind":"object","type":"GodownStock","relationName":"GodownStockToMaterialSize"},{"name":"siteStock","kind":"object","type":"SiteStock","relationName":"MaterialSizeToSiteStock"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"MaterialSizeToPurchase"},{"name":"movements","kind":"object","type":"Movement","relationName":"MaterialSizeToMovement"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToMaterialSize"},{"name":"returnWastages","kind":"object","type":"ReturnWastage","relationName":"MaterialSizeToReturnWastage"}],"dbName":null},"GodownStock":{"fields":[{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"GodownStockToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"SiteStock":{"fields":[{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToSiteStock"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToSiteStock"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"PurchaseToVendor"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToPurchase"},{"name":"destination","kind":"enum","type":"PurchaseDestination"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"PurchaseToSite"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"rate","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"deliveryLocation","kind":"scalar","type":"String"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"receiverName","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"purchasedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToPurchase"}],"dbName":null},"Movement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"kind","kind":"enum","type":"MovementKind"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToMovement"},{"name":"sourceSiteId","kind":"scalar","type":"String"},{"name":"sourceSite","kind":"object","type":"Site","relationName":"MovementSourceSite"},{"name":"destinationSiteId","kind":"scalar","type":"String"},{"name":"destinationSite","kind":"object","type":"Site","relationName":"MovementDestinationSite"},{"name":"sentQuantity","kind":"scalar","type":"Decimal"},{"name":"receivedQuantity","kind":"scalar","type":"Decimal"},{"name":"vehicleDetails","kind":"scalar","type":"String"},{"name":"personResponsible","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Consumption":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ConsumptionToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"ConsumptionToMaterialSize"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"activityReference","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"ConsumptionToDailySiteReport"},{"name":"recordedByUserId","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"consumedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"ReturnWastage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ReturnWastageToSite"},{"name":"materialSizeId","kind":"scalar","type":"String"},{"name":"materialSize","kind":"object","type":"MaterialSize","relationName":"MaterialSizeToReturnWastage"},{"name":"kind","kind":"enum","type":"ReturnWastageKind"},{"name":"quantity","kind":"scalar","type":"Decimal"},{"name":"notes","kind":"scalar","type":"String"},{"name":"recordedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryType"}],"dbName":null},"VehicleType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"vehicles","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleType"}],"dbName":null},"Machinery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"MachineryType","relationName":"MachineryToMachineryType"},{"name":"assetNumber","kind":"scalar","type":"String"},{"name":"model","kind":"scalar","type":"String"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"operator","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"MachineryToSite"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"MachineryMovementLog","relationName":"MachineryToMachineryMovementLog"},{"name":"serviceLogs","kind":"object","type":"MachineryServiceLog","relationName":"MachineryToMachineryServiceLog"}],"dbName":null},"MachineryMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"MachineryMovementLogToSite"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"MachineryServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"machineryId","kind":"scalar","type":"String"},{"name":"machinery","kind":"object","type":"Machinery","relationName":"MachineryToMachineryServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vehicle":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"number","kind":"scalar","type":"String"},{"name":"typeId","kind":"scalar","type":"String"},{"name":"type","kind":"object","type":"VehicleType","relationName":"VehicleToVehicleType"},{"name":"ownership","kind":"scalar","type":"String"},{"name":"driver","kind":"scalar","type":"String"},{"name":"currentStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"currentSiteId","kind":"scalar","type":"String"},{"name":"currentSite","kind":"object","type":"Site","relationName":"SiteToVehicle"},{"name":"customFields","kind":"scalar","type":"Json"},{"name":"movementLogs","kind":"object","type":"VehicleMovementLog","relationName":"VehicleToVehicleMovementLog"},{"name":"serviceLogs","kind":"object","type":"VehicleServiceLog","relationName":"VehicleToVehicleServiceLog"}],"dbName":null},"VehicleMovementLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleMovementLog"},{"name":"toStatus","kind":"enum","type":"AssetLocationStatus"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToVehicleMovementLog"},{"name":"movedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"VehicleServiceLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vehicleId","kind":"scalar","type":"String"},{"name":"vehicle","kind":"object","type":"Vehicle","relationName":"VehicleToVehicleServiceLog"},{"name":"kind","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"cost","kind":"scalar","type":"Decimal"},{"name":"serviceDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"EmploymentType":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"teamMembers","kind":"object","type":"TeamMember","relationName":"EmploymentTypeToTeamMember"}],"dbName":null},"TeamMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contact","kind":"scalar","type":"String"},{"name":"employmentTypeId","kind":"scalar","type":"String"},{"name":"employmentType","kind":"object","type":"EmploymentType","relationName":"EmploymentTypeToTeamMember"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"outstandingAdvanceBalance","kind":"scalar","type":"Decimal"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"TeamMemberToWorkRecord"},{"name":"advances","kind":"object","type":"Advance","relationName":"AdvanceToTeamMember"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToTeamMember"}],"dbName":null},"WorkRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"TeamMemberToWorkRecord"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"SiteToWorkRecord"},{"name":"workDate","kind":"scalar","type":"DateTime"},{"name":"attended","kind":"scalar","type":"Boolean"},{"name":"hours","kind":"scalar","type":"Decimal"},{"name":"overtimeHours","kind":"scalar","type":"Decimal"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToWorkRecord"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Advance":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"AdvanceToTeamMember"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"reason","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"givenAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"},{"name":"adjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceToAdvanceAdjustment"}],"dbName":null},"AdvanceAdjustment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"advanceId","kind":"scalar","type":"String"},{"name":"advance","kind":"object","type":"Advance","relationName":"AdvanceToAdvanceAdjustment"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"AdvanceAdjustmentToPayment"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"note","kind":"scalar","type":"String"},{"name":"adjustedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"correctionReason","kind":"scalar","type":"String"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"teamMemberId","kind":"scalar","type":"String"},{"name":"teamMember","kind":"object","type":"TeamMember","relationName":"PaymentToTeamMember"},{"name":"basePay","kind":"scalar","type":"Decimal"},{"name":"additionalAmount","kind":"scalar","type":"Decimal"},{"name":"deductions","kind":"scalar","type":"Decimal"},{"name":"netPayable","kind":"scalar","type":"Decimal"},{"name":"payPeriod","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"advanceAdjustments","kind":"object","type":"AdvanceAdjustment","relationName":"AdvanceAdjustmentToPayment"}],"dbName":null},"RmcEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"RmcEntryToSite"},{"name":"vendorId","kind":"scalar","type":"String"},{"name":"vendor","kind":"object","type":"Vendor","relationName":"RmcEntryToVendor"},{"name":"quantityM3","kind":"scalar","type":"Decimal"},{"name":"grade","kind":"scalar","type":"String"},{"name":"ratePerM3","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"invoiceOrChallanNo","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToRmcEntry"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"DailySiteReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailySiteReportToSite"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"submittedByUserId","kind":"scalar","type":"String"},{"name":"submittedBy","kind":"object","type":"User","relationName":"DailySiteReportToUser"},{"name":"workCompleted","kind":"scalar","type":"String"},{"name":"workInProgress","kind":"scalar","type":"String"},{"name":"plannedWork","kind":"scalar","type":"String"},{"name":"issuesBlockers","kind":"scalar","type":"String"},{"name":"safetyObservations","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"workRecords","kind":"object","type":"WorkRecord","relationName":"DailySiteReportToWorkRecord"},{"name":"consumptions","kind":"object","type":"Consumption","relationName":"ConsumptionToDailySiteReport"},{"name":"photos","kind":"object","type":"Photo","relationName":"DailySiteReportToPhoto"},{"name":"expenses","kind":"object","type":"Expense","relationName":"DailySiteReportToExpense"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"DailySiteReportToRmcEntry"},{"name":"dailyReports","kind":"object","type":"DailyReport","relationName":"DailyReportToDailySiteReport"},{"name":"equipmentUsed","kind":"scalar","type":"Json"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"}],"dbName":null},"Photo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToPhoto"},{"name":"storageKey","kind":"scalar","type":"String"},{"name":"uploadedByUserId","kind":"scalar","type":"String"},{"name":"uploadedBy","kind":"object","type":"User","relationName":"PhotoToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Vendor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"contactPerson","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"materialsSupplied","kind":"scalar","type":"String"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToVendor"},{"name":"rmcEntries","kind":"object","type":"RmcEntry","relationName":"RmcEntryToVendor"}],"dbName":null},"ExpenseCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToExpenseCategory"}],"dbName":null},"Expense":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"ExpenseToSite"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"ExpenseCategory","relationName":"ExpenseToExpenseCategory"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"description","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"personOrVendor","kind":"scalar","type":"String"},{"name":"purchaseId","kind":"scalar","type":"String"},{"name":"purchase","kind":"object","type":"Purchase","relationName":"ExpenseToPurchase"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailySiteReportToExpense"},{"name":"incurredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"correctsId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"clientGeneratedId","kind":"scalar","type":"String"}],"dbName":null},"BrandingConfig":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantName","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"primaryColor","kind":"scalar","type":"String"},{"name":"secondaryColor","kind":"scalar","type":"String"},{"name":"accentColor","kind":"scalar","type":"String"},{"name":"registeredAddress","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"gstin","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"DailyReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"site","kind":"object","type":"Site","relationName":"DailyReportToSite"},{"name":"dailySiteReportId","kind":"scalar","type":"String"},{"name":"dailySiteReport","kind":"object","type":"DailySiteReport","relationName":"DailyReportToDailySiteReport"},{"name":"reportDate","kind":"scalar","type":"DateTime"},{"name":"content","kind":"scalar","type":"Json"},{"name":"generatedAt","kind":"scalar","type":"DateTime"},{"name":"deliveries","kind":"object","type":"ReportDelivery","relationName":"DailyReportToReportDelivery"}],"dbName":null},"ReportDelivery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dailyReportId","kind":"scalar","type":"String"},{"name":"dailyReport","kind":"object","type":"DailyReport","relationName":"DailyReportToReportDelivery"},{"name":"channel","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"lastError","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"NotificationChannelSetting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"channel","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"recipientUserIds","kind":"scalar","type":"String"}],"dbName":null},"ReportSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"reportType","kind":"scalar","type":"String"},{"name":"frequency","kind":"scalar","type":"String"},{"name":"recipientUserIds","kind":"scalar","type":"String"},{"name":"enabled","kind":"scalar","type":"Boolean"},{"name":"siteId","kind":"scalar","type":"String"},{"name":"lastRunAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
    config.parameterizationSchema = {
      strings: JSON.parse('["where","orderBy","cursor","site","materials","_count","category","unit","sizes","material","materialSize","godownStock","siteStock","purchases","vendor","dailySiteReport","rmcEntries","expenses","purchase","sourceSite","destinationSite","movements","consumptions","returnWastages","movementsFrom","movementsTo","machinery","type","currentSite","movementLogs","serviceLogs","machineryMovements","vehicles","vehicle","vehicleMovements","teamMembers","employmentType","workRecords","teamMember","advance","advanceAdjustments","payment","adjustments","advances","payments","dailySiteReports","machineryCurrentlyHere","vehiclesCurrentlyHere","dailyReport","deliveries","dailyReports","submittedBy","uploadedBy","photos","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Site.findUnique","Site.findUniqueOrThrow","Site.findFirst","Site.findFirstOrThrow","Site.findMany","Site.createOne","Site.createMany","Site.createManyAndReturn","Site.updateOne","Site.updateMany","Site.updateManyAndReturn","Site.upsertOne","Site.deleteOne","Site.deleteMany","Site.groupBy","Site.aggregate","MaterialCategory.findUnique","MaterialCategory.findUniqueOrThrow","MaterialCategory.findFirst","MaterialCategory.findFirstOrThrow","MaterialCategory.findMany","MaterialCategory.createOne","MaterialCategory.createMany","MaterialCategory.createManyAndReturn","MaterialCategory.updateOne","MaterialCategory.updateMany","MaterialCategory.updateManyAndReturn","MaterialCategory.upsertOne","MaterialCategory.deleteOne","MaterialCategory.deleteMany","MaterialCategory.groupBy","MaterialCategory.aggregate","Unit.findUnique","Unit.findUniqueOrThrow","Unit.findFirst","Unit.findFirstOrThrow","Unit.findMany","Unit.createOne","Unit.createMany","Unit.createManyAndReturn","Unit.updateOne","Unit.updateMany","Unit.updateManyAndReturn","Unit.upsertOne","Unit.deleteOne","Unit.deleteMany","Unit.groupBy","Unit.aggregate","Material.findUnique","Material.findUniqueOrThrow","Material.findFirst","Material.findFirstOrThrow","Material.findMany","Material.createOne","Material.createMany","Material.createManyAndReturn","Material.updateOne","Material.updateMany","Material.updateManyAndReturn","Material.upsertOne","Material.deleteOne","Material.deleteMany","_avg","_sum","Material.groupBy","Material.aggregate","MaterialSize.findUnique","MaterialSize.findUniqueOrThrow","MaterialSize.findFirst","MaterialSize.findFirstOrThrow","MaterialSize.findMany","MaterialSize.createOne","MaterialSize.createMany","MaterialSize.createManyAndReturn","MaterialSize.updateOne","MaterialSize.updateMany","MaterialSize.updateManyAndReturn","MaterialSize.upsertOne","MaterialSize.deleteOne","MaterialSize.deleteMany","MaterialSize.groupBy","MaterialSize.aggregate","GodownStock.findUnique","GodownStock.findUniqueOrThrow","GodownStock.findFirst","GodownStock.findFirstOrThrow","GodownStock.findMany","GodownStock.createOne","GodownStock.createMany","GodownStock.createManyAndReturn","GodownStock.updateOne","GodownStock.updateMany","GodownStock.updateManyAndReturn","GodownStock.upsertOne","GodownStock.deleteOne","GodownStock.deleteMany","GodownStock.groupBy","GodownStock.aggregate","SiteStock.findUnique","SiteStock.findUniqueOrThrow","SiteStock.findFirst","SiteStock.findFirstOrThrow","SiteStock.findMany","SiteStock.createOne","SiteStock.createMany","SiteStock.createManyAndReturn","SiteStock.updateOne","SiteStock.updateMany","SiteStock.updateManyAndReturn","SiteStock.upsertOne","SiteStock.deleteOne","SiteStock.deleteMany","SiteStock.groupBy","SiteStock.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Movement.findUnique","Movement.findUniqueOrThrow","Movement.findFirst","Movement.findFirstOrThrow","Movement.findMany","Movement.createOne","Movement.createMany","Movement.createManyAndReturn","Movement.updateOne","Movement.updateMany","Movement.updateManyAndReturn","Movement.upsertOne","Movement.deleteOne","Movement.deleteMany","Movement.groupBy","Movement.aggregate","Consumption.findUnique","Consumption.findUniqueOrThrow","Consumption.findFirst","Consumption.findFirstOrThrow","Consumption.findMany","Consumption.createOne","Consumption.createMany","Consumption.createManyAndReturn","Consumption.updateOne","Consumption.updateMany","Consumption.updateManyAndReturn","Consumption.upsertOne","Consumption.deleteOne","Consumption.deleteMany","Consumption.groupBy","Consumption.aggregate","ReturnWastage.findUnique","ReturnWastage.findUniqueOrThrow","ReturnWastage.findFirst","ReturnWastage.findFirstOrThrow","ReturnWastage.findMany","ReturnWastage.createOne","ReturnWastage.createMany","ReturnWastage.createManyAndReturn","ReturnWastage.updateOne","ReturnWastage.updateMany","ReturnWastage.updateManyAndReturn","ReturnWastage.upsertOne","ReturnWastage.deleteOne","ReturnWastage.deleteMany","ReturnWastage.groupBy","ReturnWastage.aggregate","MachineryType.findUnique","MachineryType.findUniqueOrThrow","MachineryType.findFirst","MachineryType.findFirstOrThrow","MachineryType.findMany","MachineryType.createOne","MachineryType.createMany","MachineryType.createManyAndReturn","MachineryType.updateOne","MachineryType.updateMany","MachineryType.updateManyAndReturn","MachineryType.upsertOne","MachineryType.deleteOne","MachineryType.deleteMany","MachineryType.groupBy","MachineryType.aggregate","VehicleType.findUnique","VehicleType.findUniqueOrThrow","VehicleType.findFirst","VehicleType.findFirstOrThrow","VehicleType.findMany","VehicleType.createOne","VehicleType.createMany","VehicleType.createManyAndReturn","VehicleType.updateOne","VehicleType.updateMany","VehicleType.updateManyAndReturn","VehicleType.upsertOne","VehicleType.deleteOne","VehicleType.deleteMany","VehicleType.groupBy","VehicleType.aggregate","Machinery.findUnique","Machinery.findUniqueOrThrow","Machinery.findFirst","Machinery.findFirstOrThrow","Machinery.findMany","Machinery.createOne","Machinery.createMany","Machinery.createManyAndReturn","Machinery.updateOne","Machinery.updateMany","Machinery.updateManyAndReturn","Machinery.upsertOne","Machinery.deleteOne","Machinery.deleteMany","Machinery.groupBy","Machinery.aggregate","MachineryMovementLog.findUnique","MachineryMovementLog.findUniqueOrThrow","MachineryMovementLog.findFirst","MachineryMovementLog.findFirstOrThrow","MachineryMovementLog.findMany","MachineryMovementLog.createOne","MachineryMovementLog.createMany","MachineryMovementLog.createManyAndReturn","MachineryMovementLog.updateOne","MachineryMovementLog.updateMany","MachineryMovementLog.updateManyAndReturn","MachineryMovementLog.upsertOne","MachineryMovementLog.deleteOne","MachineryMovementLog.deleteMany","MachineryMovementLog.groupBy","MachineryMovementLog.aggregate","MachineryServiceLog.findUnique","MachineryServiceLog.findUniqueOrThrow","MachineryServiceLog.findFirst","MachineryServiceLog.findFirstOrThrow","MachineryServiceLog.findMany","MachineryServiceLog.createOne","MachineryServiceLog.createMany","MachineryServiceLog.createManyAndReturn","MachineryServiceLog.updateOne","MachineryServiceLog.updateMany","MachineryServiceLog.updateManyAndReturn","MachineryServiceLog.upsertOne","MachineryServiceLog.deleteOne","MachineryServiceLog.deleteMany","MachineryServiceLog.groupBy","MachineryServiceLog.aggregate","Vehicle.findUnique","Vehicle.findUniqueOrThrow","Vehicle.findFirst","Vehicle.findFirstOrThrow","Vehicle.findMany","Vehicle.createOne","Vehicle.createMany","Vehicle.createManyAndReturn","Vehicle.updateOne","Vehicle.updateMany","Vehicle.updateManyAndReturn","Vehicle.upsertOne","Vehicle.deleteOne","Vehicle.deleteMany","Vehicle.groupBy","Vehicle.aggregate","VehicleMovementLog.findUnique","VehicleMovementLog.findUniqueOrThrow","VehicleMovementLog.findFirst","VehicleMovementLog.findFirstOrThrow","VehicleMovementLog.findMany","VehicleMovementLog.createOne","VehicleMovementLog.createMany","VehicleMovementLog.createManyAndReturn","VehicleMovementLog.updateOne","VehicleMovementLog.updateMany","VehicleMovementLog.updateManyAndReturn","VehicleMovementLog.upsertOne","VehicleMovementLog.deleteOne","VehicleMovementLog.deleteMany","VehicleMovementLog.groupBy","VehicleMovementLog.aggregate","VehicleServiceLog.findUnique","VehicleServiceLog.findUniqueOrThrow","VehicleServiceLog.findFirst","VehicleServiceLog.findFirstOrThrow","VehicleServiceLog.findMany","VehicleServiceLog.createOne","VehicleServiceLog.createMany","VehicleServiceLog.createManyAndReturn","VehicleServiceLog.updateOne","VehicleServiceLog.updateMany","VehicleServiceLog.updateManyAndReturn","VehicleServiceLog.upsertOne","VehicleServiceLog.deleteOne","VehicleServiceLog.deleteMany","VehicleServiceLog.groupBy","VehicleServiceLog.aggregate","EmploymentType.findUnique","EmploymentType.findUniqueOrThrow","EmploymentType.findFirst","EmploymentType.findFirstOrThrow","EmploymentType.findMany","EmploymentType.createOne","EmploymentType.createMany","EmploymentType.createManyAndReturn","EmploymentType.updateOne","EmploymentType.updateMany","EmploymentType.updateManyAndReturn","EmploymentType.upsertOne","EmploymentType.deleteOne","EmploymentType.deleteMany","EmploymentType.groupBy","EmploymentType.aggregate","TeamMember.findUnique","TeamMember.findUniqueOrThrow","TeamMember.findFirst","TeamMember.findFirstOrThrow","TeamMember.findMany","TeamMember.createOne","TeamMember.createMany","TeamMember.createManyAndReturn","TeamMember.updateOne","TeamMember.updateMany","TeamMember.updateManyAndReturn","TeamMember.upsertOne","TeamMember.deleteOne","TeamMember.deleteMany","TeamMember.groupBy","TeamMember.aggregate","WorkRecord.findUnique","WorkRecord.findUniqueOrThrow","WorkRecord.findFirst","WorkRecord.findFirstOrThrow","WorkRecord.findMany","WorkRecord.createOne","WorkRecord.createMany","WorkRecord.createManyAndReturn","WorkRecord.updateOne","WorkRecord.updateMany","WorkRecord.updateManyAndReturn","WorkRecord.upsertOne","WorkRecord.deleteOne","WorkRecord.deleteMany","WorkRecord.groupBy","WorkRecord.aggregate","Advance.findUnique","Advance.findUniqueOrThrow","Advance.findFirst","Advance.findFirstOrThrow","Advance.findMany","Advance.createOne","Advance.createMany","Advance.createManyAndReturn","Advance.updateOne","Advance.updateMany","Advance.updateManyAndReturn","Advance.upsertOne","Advance.deleteOne","Advance.deleteMany","Advance.groupBy","Advance.aggregate","AdvanceAdjustment.findUnique","AdvanceAdjustment.findUniqueOrThrow","AdvanceAdjustment.findFirst","AdvanceAdjustment.findFirstOrThrow","AdvanceAdjustment.findMany","AdvanceAdjustment.createOne","AdvanceAdjustment.createMany","AdvanceAdjustment.createManyAndReturn","AdvanceAdjustment.updateOne","AdvanceAdjustment.updateMany","AdvanceAdjustment.updateManyAndReturn","AdvanceAdjustment.upsertOne","AdvanceAdjustment.deleteOne","AdvanceAdjustment.deleteMany","AdvanceAdjustment.groupBy","AdvanceAdjustment.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","RmcEntry.findUnique","RmcEntry.findUniqueOrThrow","RmcEntry.findFirst","RmcEntry.findFirstOrThrow","RmcEntry.findMany","RmcEntry.createOne","RmcEntry.createMany","RmcEntry.createManyAndReturn","RmcEntry.updateOne","RmcEntry.updateMany","RmcEntry.updateManyAndReturn","RmcEntry.upsertOne","RmcEntry.deleteOne","RmcEntry.deleteMany","RmcEntry.groupBy","RmcEntry.aggregate","DailySiteReport.findUnique","DailySiteReport.findUniqueOrThrow","DailySiteReport.findFirst","DailySiteReport.findFirstOrThrow","DailySiteReport.findMany","DailySiteReport.createOne","DailySiteReport.createMany","DailySiteReport.createManyAndReturn","DailySiteReport.updateOne","DailySiteReport.updateMany","DailySiteReport.updateManyAndReturn","DailySiteReport.upsertOne","DailySiteReport.deleteOne","DailySiteReport.deleteMany","DailySiteReport.groupBy","DailySiteReport.aggregate","Photo.findUnique","Photo.findUniqueOrThrow","Photo.findFirst","Photo.findFirstOrThrow","Photo.findMany","Photo.createOne","Photo.createMany","Photo.createManyAndReturn","Photo.updateOne","Photo.updateMany","Photo.updateManyAndReturn","Photo.upsertOne","Photo.deleteOne","Photo.deleteMany","Photo.groupBy","Photo.aggregate","Vendor.findUnique","Vendor.findUniqueOrThrow","Vendor.findFirst","Vendor.findFirstOrThrow","Vendor.findMany","Vendor.createOne","Vendor.createMany","Vendor.createManyAndReturn","Vendor.updateOne","Vendor.updateMany","Vendor.updateManyAndReturn","Vendor.upsertOne","Vendor.deleteOne","Vendor.deleteMany","Vendor.groupBy","Vendor.aggregate","ExpenseCategory.findUnique","ExpenseCategory.findUniqueOrThrow","ExpenseCategory.findFirst","ExpenseCategory.findFirstOrThrow","ExpenseCategory.findMany","ExpenseCategory.createOne","ExpenseCategory.createMany","ExpenseCategory.createManyAndReturn","ExpenseCategory.updateOne","ExpenseCategory.updateMany","ExpenseCategory.updateManyAndReturn","ExpenseCategory.upsertOne","ExpenseCategory.deleteOne","ExpenseCategory.deleteMany","ExpenseCategory.groupBy","ExpenseCategory.aggregate","Expense.findUnique","Expense.findUniqueOrThrow","Expense.findFirst","Expense.findFirstOrThrow","Expense.findMany","Expense.createOne","Expense.createMany","Expense.createManyAndReturn","Expense.updateOne","Expense.updateMany","Expense.updateManyAndReturn","Expense.upsertOne","Expense.deleteOne","Expense.deleteMany","Expense.groupBy","Expense.aggregate","BrandingConfig.findUnique","BrandingConfig.findUniqueOrThrow","BrandingConfig.findFirst","BrandingConfig.findFirstOrThrow","BrandingConfig.findMany","BrandingConfig.createOne","BrandingConfig.createMany","BrandingConfig.createManyAndReturn","BrandingConfig.updateOne","BrandingConfig.updateMany","BrandingConfig.updateManyAndReturn","BrandingConfig.upsertOne","BrandingConfig.deleteOne","BrandingConfig.deleteMany","BrandingConfig.groupBy","BrandingConfig.aggregate","DailyReport.findUnique","DailyReport.findUniqueOrThrow","DailyReport.findFirst","DailyReport.findFirstOrThrow","DailyReport.findMany","DailyReport.createOne","DailyReport.createMany","DailyReport.createManyAndReturn","DailyReport.updateOne","DailyReport.updateMany","DailyReport.updateManyAndReturn","DailyReport.upsertOne","DailyReport.deleteOne","DailyReport.deleteMany","DailyReport.groupBy","DailyReport.aggregate","ReportDelivery.findUnique","ReportDelivery.findUniqueOrThrow","ReportDelivery.findFirst","ReportDelivery.findFirstOrThrow","ReportDelivery.findMany","ReportDelivery.createOne","ReportDelivery.createMany","ReportDelivery.createManyAndReturn","ReportDelivery.updateOne","ReportDelivery.updateMany","ReportDelivery.updateManyAndReturn","ReportDelivery.upsertOne","ReportDelivery.deleteOne","ReportDelivery.deleteMany","ReportDelivery.groupBy","ReportDelivery.aggregate","NotificationChannelSetting.findUnique","NotificationChannelSetting.findUniqueOrThrow","NotificationChannelSetting.findFirst","NotificationChannelSetting.findFirstOrThrow","NotificationChannelSetting.findMany","NotificationChannelSetting.createOne","NotificationChannelSetting.createMany","NotificationChannelSetting.createManyAndReturn","NotificationChannelSetting.updateOne","NotificationChannelSetting.updateMany","NotificationChannelSetting.updateManyAndReturn","NotificationChannelSetting.upsertOne","NotificationChannelSetting.deleteOne","NotificationChannelSetting.deleteMany","NotificationChannelSetting.groupBy","NotificationChannelSetting.aggregate","ReportSchedule.findUnique","ReportSchedule.findUniqueOrThrow","ReportSchedule.findFirst","ReportSchedule.findFirstOrThrow","ReportSchedule.findMany","ReportSchedule.createOne","ReportSchedule.createMany","ReportSchedule.createManyAndReturn","ReportSchedule.updateOne","ReportSchedule.updateMany","ReportSchedule.updateManyAndReturn","ReportSchedule.upsertOne","ReportSchedule.deleteOne","ReportSchedule.deleteMany","ReportSchedule.groupBy","ReportSchedule.aggregate","AND","OR","NOT","id","reportType","frequency","recipientUserIds","enabled","siteId","lastRunAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","has","hasEvery","hasSome","channel","dailyReportId","status","attempts","lastError","deliveredAt","dailySiteReportId","reportDate","content","generatedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","tenantName","logoUrl","primaryColor","secondaryColor","accentColor","registeredAddress","contactPhone","gstin","categoryId","amount","description","paymentMethod","personOrVendor","purchaseId","incurredAt","correctsId","reason","clientGeneratedId","name","isActive","every","some","none","contactPerson","phone","email","address","materialsSupplied","storageKey","uploadedByUserId","submittedByUserId","workCompleted","workInProgress","plannedWork","issuesBlockers","safetyObservations","notes","equipmentUsed","vendorId","quantityM3","grade","ratePerM3","totalAmount","invoiceOrChallanNo","teamMemberId","basePay","additionalAmount","deductions","netPayable","payPeriod","paidAt","advanceId","paymentId","note","adjustedAt","correctionReason","givenAt","workDate","attended","hours","overtimeHours","designation","contact","employmentTypeId","outstandingAdvanceBalance","vehicleId","kind","cost","serviceDate","AssetLocationStatus","toStatus","movedAt","number","typeId","ownership","driver","currentStatus","currentSiteId","customFields","machineryId","assetNumber","model","operator","materialSizeId","ReturnWastageKind","quantity","recordedAt","activityReference","recordedByUserId","consumedAt","MovementKind","sourceSiteId","destinationSiteId","sentQuantity","receivedQuantity","vehicleDetails","personResponsible","PurchaseDestination","destination","rate","paymentStatus","deliveryLocation","receiverName","purchasedAt","materialId","label","unitId","lowStockThreshold","location","SiteStatus","contractReference","passwordHash","Role","role","dailyReportId_channel","siteId_reportDate","materialId_label","categoryId_name","siteId_materialSizeId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
      graph: "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_BUAAvAgAIYsGAQC4CAAhkwYBALoIACGUBgEAuAgAIZUGEACpCQAhlgYQALUJACGXBgEAuggAIZgGAQC6CAAhCgoAAPAQACATAADhEAAgFAAA4RAAIMcFAADfCQAgyAUAAN8JACDcBQAA3wkAIJMGAADfCQAglgYAAN8JACCXBgAA3wkAIJgGAADfCQAgFAoAAMcJACATAAC8CQAgFAAApgkAII4FAADJCQAwjwUAADMAEJAFAADJCQAwkQUBAAAAAZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh-gUAAMoJkwYi_wVAALwIACGLBgEAuAgAIZMGAQC6CAAhlAYBALgIACGVBhAAqQkAIZYGEAC1CQAhlwYBALoIACGYBgEAuggAIQMAAAAzACABAAA0ADACAAA1ACABAAAAKAAgEwMAAKYJACAKAADHCQAgDwAAtgkAII4FAADICQAwjwUAADgAEJAFAADICQAwkQUBALgIACGWBQEAuAgAIZgFQAC8CAAhrgUBALoIACHHBQEAuggAIcgFAQC6CAAhyQUBALoIACHcBQEAuggAIYsGAQC4CAAhjQYQAKkJACGPBgEAuggAIZAGAQC4CAAhkQZAALwIACEJAwAA4RAAIAoAAPAQACAPAADeEAAgrgUAAN8JACDHBQAA3wkAIMgFAADfCQAgyQUAAN8JACDcBQAA3wkAII8GAADfCQAgEwMAAKYJACAKAADHCQAgDwAAtgkAII4FAADICQAwjwUAADgAEJAFAADICQAwkQUBAAAAAZYFAQC4CAAhmAVAALwIACGuBQEAuggAIccFAQC6CAAhyAUBALoIACHJBQEAAAAB3AUBALoIACGLBgEAuAgAIY0GEACpCQAhjwYBALoIACGQBgEAuAgAIZEGQAC8CAAhAwAAADgAIAEAADkAMAIAADoAIAEAAAADACAPAwAApgkAIAoAAMcJACCOBQAAxQkAMI8FAAA9ABCQBQAAxQkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACHcBQEAuggAIfoFAADGCY0GIosGAQC4CAAhjQYQAKkJACGOBkAAvAgAIQUDAADhEAAgCgAA8BAAIMcFAADfCQAgyAUAAN8JACDcBQAA3wkAIA8DAACmCQAgCgAAxwkAII4FAADFCQAwjwUAAD0AEJAFAADFCQAwkQUBAAAAAZYFAQC4CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh3AUBALoIACH6BQAAxgmNBiKLBgEAuAgAIY0GEACpCQAhjgZAALwIACEDAAAAPQAgAQAAPgAwAgAAPwAgAQAAABcAIAEAAAAHACABAAAAHAAgAQAAADMAIAEAAAA4ACABAAAAPQAgAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAzACABAAA0ADACAAA1ACADAAAAMwAgAQAANAAwAgAANQAgAwAAADgAIAEAADkAMAIAADoAIAMAAAA9ACABAAA-ADACAAA_ACANAwAAvAkAIBoAAMAJACCOBQAAxAkAMI8FAABMABCQBQAAxAkAMJEFAQC4CAAhlgUBALoIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACH-BQAAugn-BSL_BUAAvAgAIYcGAQC4CAAhBQMAAOEQACAaAADtEAAglgUAAN8JACDHBQAA3wkAIMgFAADfCQAgDQMAALwJACAaAADACQAgjgUAAMQJADCPBQAATAAQkAUAAMQJADCRBQEAAAABlgUBALoIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACH-BQAAugn-BSL_BUAAvAgAIYcGAQC4CAAhAwAAAEwAIAEAAE0AMAIAAE4AIBEbAADCCQAgHAAAvAkAIB0AAJAJACAeAADDCQAgjgUAAMEJADCPBQAAUAAQkAUAAMEJADCRBQEAuAgAIcoFAQC4CAAhgQYBALgIACGCBgEAuggAIYQGAAC6Cf4FIoUGAQC6CAAhhgYAAKUJACCIBgEAuAgAIYkGAQC6CAAhigYBALoIACEIGwAA7hAAIBwAAOEQACAdAAC-EAAgHgAA7xAAIIIGAADfCQAghQYAAN8JACCJBgAA3wkAIIoGAADfCQAgERsAAMIJACAcAAC8CQAgHQAAkAkAIB4AAMMJACCOBQAAwQkAMI8FAABQABCQBQAAwQkAMJEFAQAAAAHKBQEAuAgAIYEGAQC4CAAhggYBALoIACGEBgAAugn-BSKFBgEAuggAIYYGAAClCQAgiAYBAAAAAYkGAQC6CAAhigYBALoIACEDAAAAUAAgAQAAUQAwAgAAUgAgAQAAAFAAIAEAAAAoACADAAAATAAgAQAATQAwAgAATgAgCxoAAMAJACCOBQAAvwkAMI8FAABXABCQBQAAvwkAMJEFAQC4CAAhmAVAALwIACHcBQEAuggAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIYcGAQC4CAAhAxoAAO0QACDcBQAA3wkAIPsFAADfCQAgCxoAAMAJACCOBQAAvwkAMI8FAABXABCQBQAAvwkAMJEFAQAAAAGYBUAAvAgAIdwFAQC6CAAh-gUBALgIACH7BRAAtQkAIfwFQAC8CAAhhwYBALgIACEDAAAAVwAgAQAAWAAwAgAAWQAgAQAAAEwAIAEAAABXACABAAAAKAAgDQMAALwJACAhAAC4CQAgjgUAAL4JADCPBQAAXgAQkAUAAL4JADCRBQEAuAgAIZYFAQC6CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh-QUBALgIACH-BQAAugn-BSL_BUAAvAgAIQUDAADhEAAgIQAA6hAAIJYFAADfCQAgxwUAAN8JACDIBQAA3wkAIA0DAAC8CQAgIQAAuAkAII4FAAC-CQAwjwUAAF4AEJAFAAC-CQAwkQUBAAAAAZYFAQC6CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh-QUBALgIACH-BQAAugn-BSL_BUAAvAgAIQMAAABeACABAABfADACAABgACAPGwAAuwkAIBwAALwJACAdAACRCQAgHgAAvQkAII4FAAC5CQAwjwUAAGIAEJAFAAC5CQAwkQUBALgIACGABgEAuAgAIYEGAQC4CAAhggYBALoIACGDBgEAuggAIYQGAAC6Cf4FIoUGAQC6CAAhhgYAAKUJACAHGwAA6xAAIBwAAOEQACAdAAC_EAAgHgAA7BAAIIIGAADfCQAggwYAAN8JACCFBgAA3wkAIA8bAAC7CQAgHAAAvAkAIB0AAJEJACAeAAC9CQAgjgUAALkJADCPBQAAYgAQkAUAALkJADCRBQEAAAABgAYBAAAAAYEGAQC4CAAhggYBALoIACGDBgEAuggAIYQGAAC6Cf4FIoUGAQC6CAAhhgYAAKUJACADAAAAYgAgAQAAYwAwAgAAZAAgAQAAAGIAIAEAAAAoACADAAAAXgAgAQAAXwAwAgAAYAAgCyEAALgJACCOBQAAtwkAMI8FAABpABCQBQAAtwkAMJEFAQC4CAAhmAVAALwIACHcBQEAuggAIfkFAQC4CAAh-gUBALgIACH7BRAAtQkAIfwFQAC8CAAhAyEAAOoQACDcBQAA3wkAIPsFAADfCQAgCyEAALgJACCOBQAAtwkAMI8FAABpABCQBQAAtwkAMJEFAQAAAAGYBUAAvAgAIdwFAQC6CAAh-QUBALgIACH6BQEAuAgAIfsFEAC1CQAh_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-AQAgAQAAvwEAMAIAAAEAIAMAAAC-AQAgAQAAvwEAMAIAAAEAIAMAAAC-AQAgAQAAvwEAMAIAAAEAIAktAADbEAAgNQAA3BAAIJEFAQAAAAGYBUAAAAABmQVAAAAAAcoFAQAAAAHRBQEAAAABpwYBAAAAAakGAAAAqQYCATsAAMMBACAHkQUBAAAAAZgFQAAAAAGZBUAAAAABygUBAAAAAdEFAQAAAAGnBgEAAAABqQYAAACpBgIBOwAAxQEAMAE7AADFAQAwCS0AAMcQACA1AADIEAAgkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhygUBAOMJACHRBQEA4wkAIacGAQDjCQAhqQYAAMYQqQYiAgAAAAEAIDsAAMgBACAHkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhygUBAOMJACHRBQEA4wkAIacGAQDjCQAhqQYAAMYQqQYiAgAAAL4BACA7AADKAQAgAgAAAL4BACA7AADKAQAgAwAAAAEAIEIAAMMBACBDAADIAQAgAQAAAAEAIAEAAAC-AQAgAwUAAMMQACBIAADFEAAgSQAAxBAAIAqOBQAAlQkAMI8FAADRAQAQkAUAAJUJADCRBQEApQgAIZgFQACqCAAhmQVAAKoIACHKBQEApQgAIdEFAQClCAAhpwYBAKUIACGpBgAAlgmpBiIDAAAAvgEAIAEAANABADBHAADRAQAgAwAAAL4BACABAAC_AQAwAgAAAQAgGQwAAIwJACANAADRCAAgEAAA0ggAIBEAAM4IACAWAACOCQAgFwAAjwkAIBgAAI0JACAZAACNCQAgHwAAkAkAICIAAJEJACAlAACSCQAgLQAAkwkAIC4AAO8IACAvAADsCAAgMgAAlAkAII4FAACKCQAwjwUAACgAEJAFAACKCQAwkQUBAAAAAZgFQAC8CAAhmQVAALwIACGqBQAAiwmmBiLKBQEAuAgAIaQGAQC4CAAhpgYBALoIACEBAAAA1AEAIAEAAADUAQAgEAwAALoQACANAADkCgAgEAAA5QoAIBEAAK4KACAWAAC8EAAgFwAAvRAAIBgAALsQACAZAAC7EAAgHwAAvhAAICIAAL8QACAlAADAEAAgLQAAwRAAIC4AAM8NACAvAAC9DQAgMgAAwhAAIKYGAADfCQAgAwAAACgAIAEAANcBADACAADUAQAgAwAAACgAIAEAANcBADACAADUAQAgAwAAACgAIAEAANcBADACAADUAQAgFgwAAKsQACANAACsEAAgEAAAtBAAIBEAALYQACAWAACvEAAgFwAAsBAAIBgAAK0QACAZAACuEAAgHwAAsRAAICIAALIQACAlAACzEAAgLQAAtRAAIC4AALcQACAvAAC4EAAgMgAAuRAAIJEFAQAAAAGYBUAAAAABmQVAAAAAAaoFAAAApgYCygUBAAAAAaQGAQAAAAGmBgEAAAABATsAANsBACAHkQUBAAAAAZgFQAAAAAGZBUAAAAABqgUAAACmBgLKBQEAAAABpAYBAAAAAaYGAQAAAAEBOwAA3QEAMAE7AADdAQAwFgwAAJIPACANAACTDwAgEAAAmw8AIBEAAJ0PACAWAACWDwAgFwAAlw8AIBgAAJQPACAZAACVDwAgHwAAmA8AICIAAJkPACAlAACaDwAgLQAAnA8AIC4AAJ4PACAvAACfDwAgMgAAoA8AIJEFAQDjCQAhmAVAAOgJACGZBUAA6AkAIaoFAACRD6YGIsoFAQDjCQAhpAYBAOMJACGmBgEA5gkAIQIAAADUAQAgOwAA4AEAIAeRBQEA4wkAIZgFQADoCQAhmQVAAOgJACGqBQAAkQ-mBiLKBQEA4wkAIaQGAQDjCQAhpgYBAOYJACECAAAAKAAgOwAA4gEAIAIAAAAoACA7AADiAQAgAwAAANQBACBCAADbAQAgQwAA4AEAIAEAAADUAQAgAQAAACgAIAQFAACODwAgSAAAkA8AIEkAAI8PACCmBgAA3wkAIAqOBQAAhgkAMI8FAADpAQAQkAUAAIYJADCRBQEApQgAIZgFQACqCAAhmQVAAKoIACGqBQAAhwmmBiLKBQEApQgAIaQGAQClCAAhpgYBAKgIACEDAAAAKAAgAQAA6AEAMEcAAOkBACADAAAAKAAgAQAA1wEAMAIAANQBACAHBAAAgwkAII4FAACFCQAwjwUAAO8BABCQBQAAhQkAMJEFAQAAAAHKBQEAAAABywUgALkIACEBAAAA7AEAIAEAAADsAQAgBwQAAIMJACCOBQAAhQkAMI8FAADvAQAQkAUAAIUJADCRBQEAuAgAIcoFAQC4CAAhywUgALkIACEBBAAA_w4AIAMAAADvAQAgAQAA8AEAMAIAAOwBACADAAAA7wEAIAEAAPABADACAADsAQAgAwAAAO8BACABAADwAQAwAgAA7AEAIAQEAACNDwAgkQUBAAAAAcoFAQAAAAHLBSAAAAABATsAAPQBACADkQUBAAAAAcoFAQAAAAHLBSAAAAABATsAAPYBADABOwAA9gEAMAQEAACDDwAgkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhAgAAAOwBACA7AAD5AQAgA5EFAQDjCQAhygUBAOMJACHLBSAA5QkAIQIAAADvAQAgOwAA-wEAIAIAAADvAQAgOwAA-wEAIAMAAADsAQAgQgAA9AEAIEMAAPkBACABAAAA7AEAIAEAAADvAQAgAwUAAIAPACBIAACCDwAgSQAAgQ8AIAaOBQAAhAkAMI8FAACCAgAQkAUAAIQJADCRBQEApQgAIcoFAQClCAAhywUgAKcIACEDAAAA7wEAIAEAAIECADBHAACCAgAgAwAAAO8BACABAADwAQAwAgAA7AEAIAYEAACDCQAgjgUAAIIJADCPBQAAiAIAEJAFAACCCQAwkQUBAAAAAcoFAQAAAAEBAAAAhQIAIAEAAACFAgAgBgQAAIMJACCOBQAAggkAMI8FAACIAgAQkAUAAIIJADCRBQEAuAgAIcoFAQC4CAAhAQQAAP8OACADAAAAiAIAIAEAAIkCADACAACFAgAgAwAAAIgCACABAACJAgAwAgAAhQIAIAMAAACIAgAgAQAAiQIAMAIAAIUCACADBAAA_g4AIJEFAQAAAAHKBQEAAAABATsAAI0CACACkQUBAAAAAcoFAQAAAAEBOwAAjwIAMAE7AACPAgAwAwQAAPEOACCRBQEA4wkAIcoFAQDjCQAhAgAAAIUCACA7AACSAgAgApEFAQDjCQAhygUBAOMJACECAAAAiAIAIDsAAJQCACACAAAAiAIAIDsAAJQCACADAAAAhQIAIEIAAI0CACBDAACSAgAgAQAAAIUCACABAAAAiAIAIAMFAADuDgAgSAAA8A4AIEkAAO8OACAFjgUAAIEJADCPBQAAmwIAEJAFAACBCQAwkQUBAKUIACHKBQEApQgAIQMAAACIAgAgAQAAmgIAMEcAAJsCACADAAAAiAIAIAEAAIkCADACAACFAgAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAKBgAA6w4AIAcAAOwOACAIAADtDgAgkQUBAAAAAcAFAQAAAAHKBQEAAAABywUgAAAAAYYGgAAAAAGiBgEAAAABowYQAAAAAQE7AACjAgAgB5EFAQAAAAHABQEAAAABygUBAAAAAcsFIAAAAAGGBoAAAAABogYBAAAAAaMGEAAAAAEBOwAApQIAMAE7AAClAgAwCgYAANwOACAHAADdDgAgCAAA3g4AIJEFAQDjCQAhwAUBAOMJACHKBQEA4wkAIcsFIADlCQAhhgaAAAAAAaIGAQDjCQAhowYQAL4LACECAAAADQAgOwAAqAIAIAeRBQEA4wkAIcAFAQDjCQAhygUBAOMJACHLBSAA5QkAIYYGgAAAAAGiBgEA4wkAIaMGEAC-CwAhAgAAAAsAIDsAAKoCACACAAAACwAgOwAAqgIAIAMAAAANACBCAACjAgAgQwAAqAIAIAEAAAANACABAAAACwAgBgUAANcOACBIAADaDgAgSQAA2Q4AIIoBAADYDgAgiwEAANsOACCjBgAA3wkAIAqOBQAAgAkAMI8FAACxAgAQkAUAAIAJADCRBQEApQgAIcAFAQClCAAhygUBAKUIACHLBSAApwgAIYYGAADECAAgogYBAKUIACGjBhAA2ggAIQMAAAALACABAACwAgAwRwAAsQIAIAMAAAALACABAAAMADACAAANACABAAAAFAAgAQAAABQAIAMAAAASACABAAATADACAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAABIAIAEAABMAMAIAABQAIAoJAADQDgAgCwAA0Q4AIAwAANIOACANAADTDgAgFQAA1A4AIBYAANUOACAXAADWDgAgkQUBAAAAAaAGAQAAAAGhBgEAAAABATsAALkCACADkQUBAAAAAaAGAQAAAAGhBgEAAAABATsAALsCADABOwAAuwIAMAoJAACHDgAgCwAAiA4AIAwAAIkOACANAACKDgAgFQAAiw4AIBYAAIwOACAXAACNDgAgkQUBAOMJACGgBgEA4wkAIaEGAQDjCQAhAgAAABQAIDsAAL4CACADkQUBAOMJACGgBgEA4wkAIaEGAQDjCQAhAgAAABIAIDsAAMACACACAAAAEgAgOwAAwAIAIAMAAAAUACBCAAC5AgAgQwAAvgIAIAEAAAAUACABAAAAEgAgAwUAAIQOACBIAACGDgAgSQAAhQ4AIAaOBQAA_wgAMI8FAADHAgAQkAUAAP8IADCRBQEApQgAIaAGAQClCAAhoQYBAKUIACEDAAAAEgAgAQAAxgIAMEcAAMcCACADAAAAEgAgAQAAEwAwAgAAFAAgAQAAABkAIAEAAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACAECgAAgw4AIJkFQAAAAAGLBgEAAAABjQYQAAAAAQE7AADPAgAgA5kFQAAAAAGLBgEAAAABjQYQAAAAAQE7AADRAgAwATsAANECADAECgAAgg4AIJkFQADoCQAhiwYBAOMJACGNBhAAlAoAIQIAAAAZACA7AADUAgAgA5kFQADoCQAhiwYBAOMJACGNBhAAlAoAIQIAAAAXACA7AADWAgAgAgAAABcAIDsAANYCACADAAAAGQAgQgAAzwIAIEMAANQCACABAAAAGQAgAQAAABcAIAUFAAD9DQAgSAAAgA4AIEkAAP8NACCKAQAA_g0AIIsBAACBDgAgBo4FAAD-CAAwjwUAAN0CABCQBQAA_ggAMJkFQACqCAAhiwYBAKUIACGNBhAAyQgAIQMAAAAXACABAADcAgAwRwAA3QIAIAMAAAAXACABAAAYADACAAAZACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAYDAAD7DQAgCgAA_A0AIJYFAQAAAAGZBUAAAAABiwYBAAAAAY0GEAAAAAEBOwAA5QIAIASWBQEAAAABmQVAAAAAAYsGAQAAAAGNBhAAAAABATsAAOcCADABOwAA5wIAMAYDAAD5DQAgCgAA-g0AIJYFAQDjCQAhmQVAAOgJACGLBgEA4wkAIY0GEACUCgAhAgAAAAkAIDsAAOoCACAElgUBAOMJACGZBUAA6AkAIYsGAQDjCQAhjQYQAJQKACECAAAABwAgOwAA7AIAIAIAAAAHACA7AADsAgAgAwAAAAkAIEIAAOUCACBDAADqAgAgAQAAAAkAIAEAAAAHACAFBQAA9A0AIEgAAPcNACBJAAD2DQAgigEAAPUNACCLAQAA-A0AIAeOBQAA_QgAMI8FAADzAgAQkAUAAP0IADCWBQEApQgAIZkFQACqCAAhiwYBAKUIACGNBhAAyQgAIQMAAAAHACABAADyAgAwRwAA8wIAIAMAAAAHACABAAAIADACAAAJACABAAAAHgAgAQAAAB4AIAMAAAAcACABAAAdADACAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIBYDAADfCgAgCgAA3goAIA4AAPMNACARAADgCgAgkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB3gUBAAAAAeIFEAAAAAHjBQEAAAABiwYBAAAAAY0GEAAAAAGXBgEAAAABmgYAAACaBgKbBhAAAAABnAYBAAAAAZ0GAQAAAAGeBgEAAAABnwZAAAAAAQE7AAD7AgAgEpEFAQAAAAGWBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAd4FAQAAAAHiBRAAAAAB4wUBAAAAAYsGAQAAAAGNBhAAAAABlwYBAAAAAZoGAAAAmgYCmwYQAAAAAZwGAQAAAAGdBgEAAAABngYBAAAAAZ8GQAAAAAEBOwAA_QIAMAE7AAD9AgAwAQAAACgAIBYDAADSCgAgCgAA0QoAIA4AAPINACARAADTCgAgkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh3gUBAOMJACHiBRAAlAoAIeMFAQDmCQAhiwYBAOMJACGNBhAAlAoAIZcGAQDmCQAhmgYAAM8KmgYimwYQAJQKACGcBgEA4wkAIZ0GAQDmCQAhngYBAOYJACGfBkAA6AkAIQIAAAAeACA7AACBAwAgEpEFAQDjCQAhlgUBAOYJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACHcBQEA5gkAId4FAQDjCQAh4gUQAJQKACHjBQEA5gkAIYsGAQDjCQAhjQYQAJQKACGXBgEA5gkAIZoGAADPCpoGIpsGEACUCgAhnAYBAOMJACGdBgEA5gkAIZ4GAQDmCQAhnwZAAOgJACECAAAAHAAgOwAAgwMAIAIAAAAcACA7AACDAwAgAQAAACgAIAMAAAAeACBCAAD7AgAgQwAAgQMAIAEAAAAeACABAAAAHAAgDQUAAO0NACBIAADwDQAgSQAA7w0AIIoBAADuDQAgiwEAAPENACCWBQAA3wkAIMcFAADfCQAgyAUAAN8JACDcBQAA3wkAIOMFAADfCQAglwYAAN8JACCdBgAA3wkAIJ4GAADfCQAgFY4FAAD5CAAwjwUAAIsDABCQBQAA-QgAMJEFAQClCAAhlgUBAKgIACGYBUAAqggAIccFAQCoCAAhyAUBAKgIACHcBQEAqAgAId4FAQClCAAh4gUQAMkIACHjBQEAqAgAIYsGAQClCAAhjQYQAMkIACGXBgEAqAgAIZoGAAD6CJoGIpsGEADJCAAhnAYBAKUIACGdBgEAqAgAIZ4GAQCoCAAhnwZAAKoIACEDAAAAHAAgAQAAigMAMEcAAIsDACADAAAAHAAgAQAAHQAwAgAAHgAgAQAAADUAIAEAAAA1ACADAAAAMwAgAQAANAAwAgAANQAgAwAAADMAIAEAADQAMAIAADUAIAMAAAAzACABAAA0ADACAAA1ACARCgAA6g0AIBMAAOsNACAUAADsDQAgkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAJMGAv8FQAAAAAGLBgEAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGAQAAAAGYBgEAAAABATsAAJMDACAOkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAJMGAv8FQAAAAAGLBgEAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGAQAAAAGYBgEAAAABATsAAJUDADABOwAAlQMAMAEAAAAoACARCgAA5w0AIBMAAOgNACAUAADpDQAgkQUBAOMJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACHcBQEA5gkAIfoFAADmDZMGIv8FQADoCQAhiwYBAOMJACGTBgEA5gkAIZQGAQDjCQAhlQYQAJQKACGWBhAAvgsAIZcGAQDmCQAhmAYBAOYJACECAAAANQAgOwAAmQMAIA6RBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAAOYNkwYi_wVAAOgJACGLBgEA4wkAIZMGAQDmCQAhlAYBAOMJACGVBhAAlAoAIZYGEAC-CwAhlwYBAOYJACGYBgEA5gkAIQIAAAAzACA7AACbAwAgAgAAADMAIDsAAJsDACABAAAAKAAgAwAAADUAIEIAAJMDACBDAACZAwAgAQAAADUAIAEAAAAzACAMBQAA4Q0AIEgAAOQNACBJAADjDQAgigEAAOINACCLAQAA5Q0AIMcFAADfCQAgyAUAAN8JACDcBQAA3wkAIJMGAADfCQAglgYAAN8JACCXBgAA3wkAIJgGAADfCQAgEY4FAAD1CAAwjwUAAKMDABCQBQAA9QgAMJEFAQClCAAhmAVAAKoIACHHBQEAqAgAIcgFAQCoCAAh3AUBAKgIACH6BQAA9giTBiL_BUAAqggAIYsGAQClCAAhkwYBAKgIACGUBgEApQgAIZUGEADJCAAhlgYQANoIACGXBgEAqAgAIZgGAQCoCAAhAwAAADMAIAEAAKIDADBHAACjAwAgAwAAADMAIAEAADQAMAIAADUAIAEAAAA6ACABAAAAOgAgAwAAADgAIAEAADkAMAIAADoAIAMAAAA4ACABAAA5ADACAAA6ACADAAAAOAAgAQAAOQAwAgAAOgAgEAMAALILACAKAACzCwAgDwAA4A0AIJEFAQAAAAGWBQEAAAABmAVAAAAAAa4FAQAAAAHHBQEAAAAByAUBAAAAAckFAQAAAAHcBQEAAAABiwYBAAAAAY0GEAAAAAGPBgEAAAABkAYBAAAAAZEGQAAAAAEBOwAAqwMAIA2RBQEAAAABlgUBAAAAAZgFQAAAAAGuBQEAAAABxwUBAAAAAcgFAQAAAAHJBQEAAAAB3AUBAAAAAYsGAQAAAAGNBhAAAAABjwYBAAAAAZAGAQAAAAGRBkAAAAABATsAAK0DADABOwAArQMAMAEAAAADACAQAwAArwsAIAoAALALACAPAADfDQAgkQUBAOMJACGWBQEA4wkAIZgFQADoCQAhrgUBAOYJACHHBQEA5gkAIcgFAQDmCQAhyQUBAOYJACHcBQEA5gkAIYsGAQDjCQAhjQYQAJQKACGPBgEA5gkAIZAGAQDjCQAhkQZAAOgJACECAAAAOgAgOwAAsQMAIA2RBQEA4wkAIZYFAQDjCQAhmAVAAOgJACGuBQEA5gkAIccFAQDmCQAhyAUBAOYJACHJBQEA5gkAIdwFAQDmCQAhiwYBAOMJACGNBhAAlAoAIY8GAQDmCQAhkAYBAOMJACGRBkAA6AkAIQIAAAA4ACA7AACzAwAgAgAAADgAIDsAALMDACABAAAAAwAgAwAAADoAIEIAAKsDACBDAACxAwAgAQAAADoAIAEAAAA4ACALBQAA2g0AIEgAAN0NACBJAADcDQAgigEAANsNACCLAQAA3g0AIK4FAADfCQAgxwUAAN8JACDIBQAA3wkAIMkFAADfCQAg3AUAAN8JACCPBgAA3wkAIBCOBQAA9AgAMI8FAAC7AwAQkAUAAPQIADCRBQEApQgAIZYFAQClCAAhmAVAAKoIACGuBQEAqAgAIccFAQCoCAAhyAUBAKgIACHJBQEAqAgAIdwFAQCoCAAhiwYBAKUIACGNBhAAyQgAIY8GAQCoCAAhkAYBAKUIACGRBkAAqggAIQMAAAA4ACABAAC6AwAwRwAAuwMAIAMAAAA4ACABAAA5ADACAAA6ACABAAAAPwAgAQAAAD8AIAMAAAA9ACABAAA-ADACAAA_ACADAAAAPQAgAQAAPgAwAgAAPwAgAwAAAD0AIAEAAD4AMAIAAD8AIAwDAADYDQAgCgAA2Q0AIJEFAQAAAAGWBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAfoFAAAAjQYCiwYBAAAAAY0GEAAAAAGOBkAAAAABATsAAMMDACAKkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACNBgKLBgEAAAABjQYQAAAAAY4GQAAAAAEBOwAAxQMAMAE7AADFAwAwDAMAANYNACAKAADXDQAgkQUBAOMJACGWBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAANUNjQYiiwYBAOMJACGNBhAAlAoAIY4GQADoCQAhAgAAAD8AIDsAAMgDACAKkQUBAOMJACGWBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAANUNjQYiiwYBAOMJACGNBhAAlAoAIY4GQADoCQAhAgAAAD0AIDsAAMoDACACAAAAPQAgOwAAygMAIAMAAAA_ACBCAADDAwAgQwAAyAMAIAEAAAA_ACABAAAAPQAgCAUAANANACBIAADTDQAgSQAA0g0AIIoBAADRDQAgiwEAANQNACDHBQAA3wkAIMgFAADfCQAg3AUAAN8JACANjgUAAPAIADCPBQAA0QMAEJAFAADwCAAwkQUBAKUIACGWBQEApQgAIZgFQACqCAAhxwUBAKgIACHIBQEAqAgAIdwFAQCoCAAh-gUAAPEIjQYiiwYBAKUIACGNBhAAyQgAIY4GQACqCAAhAwAAAD0AIAEAANADADBHAADRAwAgAwAAAD0AIAEAAD4AMAIAAD8AIAcaAADvCAAgjgUAAO4IADCPBQAA1wMAEJAFAADuCAAwkQUBAAAAAcoFAQAAAAHLBSAAuQgAIQEAAADUAwAgAQAAANQDACAHGgAA7wgAII4FAADuCAAwjwUAANcDABCQBQAA7ggAMJEFAQC4CAAhygUBALgIACHLBSAAuQgAIQEaAADPDQAgAwAAANcDACABAADYAwAwAgAA1AMAIAMAAADXAwAgAQAA2AMAMAIAANQDACADAAAA1wMAIAEAANgDADACAADUAwAgBBoAAM4NACCRBQEAAAABygUBAAAAAcsFIAAAAAEBOwAA3AMAIAORBQEAAAABygUBAAAAAcsFIAAAAAEBOwAA3gMAMAE7AADeAwAwBBoAAMENACCRBQEA4wkAIcoFAQDjCQAhywUgAOUJACECAAAA1AMAIDsAAOEDACADkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhAgAAANcDACA7AADjAwAgAgAAANcDACA7AADjAwAgAwAAANQDACBCAADcAwAgQwAA4QMAIAEAAADUAwAgAQAAANcDACADBQAAvg0AIEgAAMANACBJAAC_DQAgBo4FAADtCAAwjwUAAOoDABCQBQAA7QgAMJEFAQClCAAhygUBAKUIACHLBSAApwgAIQMAAADXAwAgAQAA6QMAMEcAAOoDACADAAAA1wMAIAEAANgDADACAADUAwAgByAAAOwIACCOBQAA6wgAMI8FAADwAwAQkAUAAOsIADCRBQEAAAABygUBAAAAAcsFIAC5CAAhAQAAAO0DACABAAAA7QMAIAcgAADsCAAgjgUAAOsIADCPBQAA8AMAEJAFAADrCAAwkQUBALgIACHKBQEAuAgAIcsFIAC5CAAhASAAAL0NACADAAAA8AMAIAEAAPEDADACAADtAwAgAwAAAPADACABAADxAwAwAgAA7QMAIAMAAADwAwAgAQAA8QMAMAIAAO0DACAEIAAAvA0AIJEFAQAAAAHKBQEAAAABywUgAAAAAQE7AAD1AwAgA5EFAQAAAAHKBQEAAAABywUgAAAAAQE7AAD3AwAwATsAAPcDADAEIAAArw0AIJEFAQDjCQAhygUBAOMJACHLBSAA5QkAIQIAAADtAwAgOwAA-gMAIAORBQEA4wkAIcoFAQDjCQAhywUgAOUJACECAAAA8AMAIDsAAPwDACACAAAA8AMAIDsAAPwDACADAAAA7QMAIEIAAPUDACBDAAD6AwAgAQAAAO0DACABAAAA8AMAIAMFAACsDQAgSAAArg0AIEkAAK0NACAGjgUAAOoIADCPBQAAgwQAEJAFAADqCAAwkQUBAKUIACHKBQEApQgAIcsFIACnCAAhAwAAAPADACABAACCBAAwRwAAgwQAIAMAAADwAwAgAQAA8QMAMAIAAO0DACABAAAAUgAgAQAAAFIAIAMAAABQACABAABRADACAABSACADAAAAUAAgAQAAUQAwAgAAUgAgAwAAAFAAIAEAAFEAMAIAAFIAIA4bAACoDQAgHAAAqQ0AIB0AAKoNACAeAACrDQAgkQUBAAAAAcoFAQAAAAGBBgEAAAABggYBAAAAAYQGAAAA_gUChQYBAAAAAYYGgAAAAAGIBgEAAAABiQYBAAAAAYoGAQAAAAEBOwAAiwQAIAqRBQEAAAABygUBAAAAAYEGAQAAAAGCBgEAAAABhAYAAAD-BQKFBgEAAAABhgaAAAAAAYgGAQAAAAGJBgEAAAABigYBAAAAAQE7AACNBAAwATsAAI0EADABAAAAKAAgDhsAAIwNACAcAACNDQAgHQAAjg0AIB4AAI8NACCRBQEA4wkAIcoFAQDjCQAhgQYBAOMJACGCBgEA5gkAIYQGAADTDP4FIoUGAQDmCQAhhgaAAAAAAYgGAQDjCQAhiQYBAOYJACGKBgEA5gkAIQIAAABSACA7AACRBAAgCpEFAQDjCQAhygUBAOMJACGBBgEA4wkAIYIGAQDmCQAhhAYAANMM_gUihQYBAOYJACGGBoAAAAABiAYBAOMJACGJBgEA5gkAIYoGAQDmCQAhAgAAAFAAIDsAAJMEACACAAAAUAAgOwAAkwQAIAEAAAAoACADAAAAUgAgQgAAiwQAIEMAAJEEACABAAAAUgAgAQAAAFAAIAcFAACJDQAgSAAAiw0AIEkAAIoNACCCBgAA3wkAIIUGAADfCQAgiQYAAN8JACCKBgAA3wkAIA2OBQAA6QgAMI8FAACbBAAQkAUAAOkIADCRBQEApQgAIcoFAQClCAAhgQYBAKUIACGCBgEAqAgAIYQGAADjCP4FIoUGAQCoCAAhhgYAAMQIACCIBgEApQgAIYkGAQCoCAAhigYBAKgIACEDAAAAUAAgAQAAmgQAMEcAAJsEACADAAAAUAAgAQAAUQAwAgAAUgAgAQAAAE4AIAEAAABOACADAAAATAAgAQAATQAwAgAATgAgAwAAAEwAIAEAAE0AMAIAAE4AIAMAAABMACABAABNADACAABOACAKAwAAiA0AIBoAAIcNACCRBQEAAAABlgUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAf4FAAAA_gUC_wVAAAAAAYcGAQAAAAEBOwAAowQAIAiRBQEAAAABlgUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAf4FAAAA_gUC_wVAAAAAAYcGAQAAAAEBOwAApQQAMAE7AAClBAAwAQAAACgAIAoDAACGDQAgGgAAhQ0AIJEFAQDjCQAhlgUBAOYJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACH-BQAA0wz-BSL_BUAA6AkAIYcGAQDjCQAhAgAAAE4AIDsAAKkEACAIkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIf4FAADTDP4FIv8FQADoCQAhhwYBAOMJACECAAAATAAgOwAAqwQAIAIAAABMACA7AACrBAAgAQAAACgAIAMAAABOACBCAACjBAAgQwAAqQQAIAEAAABOACABAAAATAAgBgUAAIINACBIAACEDQAgSQAAgw0AIJYFAADfCQAgxwUAAN8JACDIBQAA3wkAIAuOBQAA6AgAMI8FAACzBAAQkAUAAOgIADCRBQEApQgAIZYFAQCoCAAhmAVAAKoIACHHBQEAqAgAIcgFAQCoCAAh_gUAAOMI_gUi_wVAAKoIACGHBgEApQgAIQMAAABMACABAACyBAAwRwAAswQAIAMAAABMACABAABNADACAABOACABAAAAWQAgAQAAAFkAIAMAAABXACABAABYADACAABZACADAAAAVwAgAQAAWAAwAgAAWQAgAwAAAFcAIAEAAFgAMAIAAFkAIAgaAACBDQAgkQUBAAAAAZgFQAAAAAHcBQEAAAAB-gUBAAAAAfsFEAAAAAH8BUAAAAABhwYBAAAAAQE7AAC7BAAgB5EFAQAAAAGYBUAAAAAB3AUBAAAAAfoFAQAAAAH7BRAAAAAB_AVAAAAAAYcGAQAAAAEBOwAAvQQAMAE7AAC9BAAwCBoAAIANACCRBQEA4wkAIZgFQADoCQAh3AUBAOYJACH6BQEA4wkAIfsFEAC-CwAh_AVAAOgJACGHBgEA4wkAIQIAAABZACA7AADABAAgB5EFAQDjCQAhmAVAAOgJACHcBQEA5gkAIfoFAQDjCQAh-wUQAL4LACH8BUAA6AkAIYcGAQDjCQAhAgAAAFcAIDsAAMIEACACAAAAVwAgOwAAwgQAIAMAAABZACBCAAC7BAAgQwAAwAQAIAEAAABZACABAAAAVwAgBwUAAPsMACBIAAD-DAAgSQAA_QwAIIoBAAD8DAAgiwEAAP8MACDcBQAA3wkAIPsFAADfCQAgCo4FAADnCAAwjwUAAMkEABCQBQAA5wgAMJEFAQClCAAhmAVAAKoIACHcBQEAqAgAIfoFAQClCAAh-wUQANoIACH8BUAAqggAIYcGAQClCAAhAwAAAFcAIAEAAMgEADBHAADJBAAgAwAAAFcAIAEAAFgAMAIAAFkAIAEAAABkACABAAAAZAAgAwAAAGIAIAEAAGMAMAIAAGQAIAMAAABiACABAABjADACAABkACADAAAAYgAgAQAAYwAwAgAAZAAgDBsAAPcMACAcAAD4DAAgHQAA-QwAIB4AAPoMACCRBQEAAAABgAYBAAAAAYEGAQAAAAGCBgEAAAABgwYBAAAAAYQGAAAA_gUChQYBAAAAAYYGgAAAAAEBOwAA0QQAIAiRBQEAAAABgAYBAAAAAYEGAQAAAAGCBgEAAAABgwYBAAAAAYQGAAAA_gUChQYBAAAAAYYGgAAAAAEBOwAA0wQAMAE7AADTBAAwAQAAACgAIAwbAADbDAAgHAAA3AwAIB0AAN0MACAeAADeDAAgkQUBAOMJACGABgEA4wkAIYEGAQDjCQAhggYBAOYJACGDBgEA5gkAIYQGAADTDP4FIoUGAQDmCQAhhgaAAAAAAQIAAABkACA7AADXBAAgCJEFAQDjCQAhgAYBAOMJACGBBgEA4wkAIYIGAQDmCQAhgwYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAECAAAAYgAgOwAA2QQAIAIAAABiACA7AADZBAAgAQAAACgAIAMAAABkACBCAADRBAAgQwAA1wQAIAEAAABkACABAAAAYgAgBgUAANgMACBIAADaDAAgSQAA2QwAIIIGAADfCQAggwYAAN8JACCFBgAA3wkAIAuOBQAA5ggAMI8FAADhBAAQkAUAAOYIADCRBQEApQgAIYAGAQClCAAhgQYBAKUIACGCBgEAqAgAIYMGAQCoCAAhhAYAAOMI_gUihQYBAKgIACGGBgAAxAgAIAMAAABiACABAADgBAAwRwAA4QQAIAMAAABiACABAABjADACAABkACABAAAAYAAgAQAAAGAAIAMAAABeACABAABfADACAABgACADAAAAXgAgAQAAXwAwAgAAYAAgAwAAAF4AIAEAAF8AMAIAAGAAIAoDAADXDAAgIQAA1gwAIJEFAQAAAAGWBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB-QUBAAAAAf4FAAAA_gUC_wVAAAAAAQE7AADpBAAgCJEFAQAAAAGWBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB-QUBAAAAAf4FAAAA_gUC_wVAAAAAAQE7AADrBAAwATsAAOsEADABAAAAKAAgCgMAANUMACAhAADUDAAgkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIfkFAQDjCQAh_gUAANMM_gUi_wVAAOgJACECAAAAYAAgOwAA7wQAIAiRBQEA4wkAIZYFAQDmCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh-QUBAOMJACH-BQAA0wz-BSL_BUAA6AkAIQIAAABeACA7AADxBAAgAgAAAF4AIDsAAPEEACABAAAAKAAgAwAAAGAAIEIAAOkEACBDAADvBAAgAQAAAGAAIAEAAABeACAGBQAA0AwAIEgAANIMACBJAADRDAAglgUAAN8JACDHBQAA3wkAIMgFAADfCQAgC44FAADiCAAwjwUAAPkEABCQBQAA4ggAMJEFAQClCAAhlgUBAKgIACGYBUAAqggAIccFAQCoCAAhyAUBAKgIACH5BQEApQgAIf4FAADjCP4FIv8FQACqCAAhAwAAAF4AIAEAAPgEADBHAAD5BAAgAwAAAF4AIAEAAF8AMAIAAGAAIAEAAABrACABAAAAawAgAwAAAGkAIAEAAGoAMAIAAGsAIAMAAABpACABAABqADACAABrACADAAAAaQAgAQAAagAwAgAAawAgCCEAAM8MACCRBQEAAAABmAVAAAAAAdwFAQAAAAH5BQEAAAAB-gUBAAAAAfsFEAAAAAH8BUAAAAABATsAAIEFACAHkQUBAAAAAZgFQAAAAAHcBQEAAAAB-QUBAAAAAfoFAQAAAAH7BRAAAAAB_AVAAAAAAQE7AACDBQAwATsAAIMFADAIIQAAzgwAIJEFAQDjCQAhmAVAAOgJACHcBQEA5gkAIfkFAQDjCQAh-gUBAOMJACH7BRAAvgsAIfwFQADoCQAhAgAAAGsAIDsAAIYFACAHkQUBAOMJACGYBUAA6AkAIdwFAQDmCQAh-QUBAOMJACH6BQEA4wkAIfsFEAC-CwAh_AVAAOgJACECAAAAaQAgOwAAiAUAIAIAAABpACA7AACIBQAgAwAAAGsAIEIAAIEFACBDAACGBQAgAQAAAGsAIAEAAABpACAHBQAAyQwAIEgAAMwMACBJAADLDAAgigEAAMoMACCLAQAAzQwAINwFAADfCQAg-wUAAN8JACAKjgUAAOEIADCPBQAAjwUAEJAFAADhCAAwkQUBAKUIACGYBUAAqggAIdwFAQCoCAAh-QUBAKUIACH6BQEApQgAIfsFEADaCAAh_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-ACABAAB_ADACAACAAQAgAwAAAH4AIAEAAH8AMAIAAIABACADAAAAfgAgAQAAfwAwAgAAgAEAIAsnAADmCwAgKQAA7wsAIJEFAQAAAAGYBUAAAAABwQUQAAAAAccFAQAAAAHrBQEAAAAB7AUBAAAAAe0FAQAAAAHuBUAAAAAB7wUBAAAAAQE7AAD0BQAgCZEFAQAAAAGYBUAAAAABwQUQAAAAAccFAQAAAAHrBQEAAAAB7AUBAAAAAe0FAQAAAAHuBUAAAAAB7wUBAAAAAQE7AAD2BQAwATsAAPYFADABAAAAggEAIAsnAADkCwAgKQAA7gsAIJEFAQDjCQAhmAVAAOgJACHBBRAAlAoAIccFAQDmCQAh6wUBAOMJACHsBQEA5gkAIe0FAQDmCQAh7gVAAOgJACHvBQEA5gkAIQIAAACAAQAgOwAA-gUAIAmRBQEA4wkAIZgFQADoCQAhwQUQAJQKACHHBQEA5gkAIesFAQDjCQAh7AUBAOYJACHtBQEA5gkAIe4FQADoCQAh7wUBAOYJACECAAAAfgAgOwAA_AUAIAIAAAB-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FAADfCQAgyAUAAN8JACDXBQAA3wkAINgFAADfCQAg2QUAAN8JACDaBQAA3wkAINsFAADfCQAg3AUAAN8JACARjgUAANQIADCPBQAAyAYAEJAFAADUCAAwkQUBAKUIACGWBQEApQgAIZgFQACqCAAhrwVAAKoIACHHBQEAqAgAIcgFAQCoCAAh1gUBAKUIACHXBQEAqAgAIdgFAQCoCAAh2QUBAKgIACHaBQEAqAgAIdsFAQCoCAAh3AUBAKgIACHdBQAAxAgAIAMAAAADACABAADHBgAwRwAAyAYAIAMAAAADACABAAAEADACAAAFACABAAAArwEAIAEAAACvAQAgAwAAAK0BACABAACuAQAwAgAArwEAIAMAAACtAQAgAQAArgEAMAIAAK8BACADAAAArQEAIAEAAK4BADACAACvAQAgBw8AAOsKACA0AADsCgAgkQUBAAAAAZgFQAAAAAGuBQEAAAAB1AUBAAAAAdUFAQAAAAEBOwAA0AYAIAWRBQEAAAABmAVAAAAAAa4FAQAAAAHUBQEAAAAB1QUBAAAAAQE7AADSBgAwATsAANIGADAHDwAA6QoAIDQAAOoKACCRBQEA4wkAIZgFQADoCQAhrgUBAOMJACHUBQEA4wkAIdUFAQDjCQAhAgAAAK8BACA7AADVBgAgBZEFAQDjCQAhmAVAAOgJACGuBQEA4wkAIdQFAQDjCQAh1QUBAOMJACECAAAArQEAIDsAANcGACACAAAArQEAIDsAANcGACADAAAArwEAIEIAANAGACBDAADVBgAgAQAAAK8BACABAAAArQEAIAMFAADmCgAgSAAA6AoAIEkAAOcKACAIjgUAANMIADCPBQAA3gYAEJAFAADTCAAwkQUBAKUIACGYBUAAqggAIa4FAQClCAAh1AUBAKUIACHVBQEApQgAIQMAAACtAQAgAQAA3QYAMEcAAN4GACADAAAArQEAIAEAAK4BADACAACvAQAgDA0AANEIACAQAADSCAAgjgUAANAIADCPBQAA5AYAEJAFAADQCAAwkQUBAAAAAcoFAQC4CAAhzwUBALoIACHQBQEAuggAIdEFAQC6CAAh0gUBALoIACHTBQAApggAIAEAAADhBgAgAQAAAOEGACAMDQAA0QgAIBAAANIIACCOBQAA0AgAMI8FAADkBgAQkAUAANAIADCRBQEAuAgAIcoFAQC4CAAhzwUBALoIACHQBQEAuggAIdEFAQC6CAAh0gUBALoIACHTBQAApggAIAYNAADkCgAgEAAA5QoAIM8FAADfCQAg0AUAAN8JACDRBQAA3wkAINIFAADfCQAgAwAAAOQGACABAADlBgAwAgAA4QYAIAMAAADkBgAgAQAA5QYAMAIAAOEGACADAAAA5AYAIAEAAOUGADACAADhBgAgCQ0AAOIKACAQAADjCgAgkQUBAAAAAcoFAQAAAAHPBQEAAAAB0AUBAAAAAdEFAQAAAAHSBQEAAAAB0wUAAOEKACABOwAA6QYAIAeRBQEAAAABygUBAAAAAc8FAQAAAAHQBQEAAAAB0QUBAAAAAdIFAQAAAAHTBQAA4QoAIAE7AADrBgAwATsAAOsGADAJDQAAswoAIBAAALQKACCRBQEA4wkAIcoFAQDjCQAhzwUBAOYJACHQBQEA5gkAIdEFAQDmCQAh0gUBAOYJACHTBQAAsgoAIAIAAADhBgAgOwAA7gYAIAeRBQEA4wkAIcoFAQDjCQAhzwUBAOYJACHQBQEA5gkAIdEFAQDmCQAh0gUBAOYJACHTBQAAsgoAIAIAAADkBgAgOwAA8AYAIAIAAADkBgAgOwAA8AYAIAMAAADhBgAgQgAA6QYAIEMAAO4GACABAAAA4QYAIAEAAADkBgAgBwUAAK8KACBIAACxCgAgSQAAsAoAIM8FAADfCQAg0AUAAN8JACDRBQAA3wkAINIFAADfCQAgCo4FAADPCAAwjwUAAPcGABCQBQAAzwgAMJEFAQClCAAhygUBAKUIACHPBQEAqAgAIdAFAQCoCAAh0QUBAKgIACHSBQEAqAgAIdMFAACmCAAgAwAAAOQGACABAAD2BgAwRwAA9wYAIAMAAADkBgAgAQAA5QYAMAIAAOEGACAHEQAAzggAII4FAADNCAAwjwUAAP0GABCQBQAAzQgAMJEFAQAAAAHKBQEAAAABywUgALkIACEBAAAA-gYAIAEAAAD6BgAgBxEAAM4IACCOBQAAzQgAMI8FAAD9BgAQkAUAAM0IADCRBQEAuAgAIcoFAQC4CAAhywUgALkIACEBEQAArgoAIAMAAAD9BgAgAQAA_gYAMAIAAPoGACADAAAA_QYAIAEAAP4GADACAAD6BgAgAwAAAP0GACABAAD-BgAwAgAA-gYAIAQRAACtCgAgkQUBAAAAAcoFAQAAAAHLBSAAAAABATsAAIIHACADkQUBAAAAAcoFAQAAAAHLBSAAAAABATsAAIQHADABOwAAhAcAMAQRAACgCgAgkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhAgAAAPoGACA7AACHBwAgA5EFAQDjCQAhygUBAOMJACHLBSAA5QkAIQIAAAD9BgAgOwAAiQcAIAIAAAD9BgAgOwAAiQcAIAMAAAD6BgAgQgAAggcAIEMAAIcHACABAAAA-gYAIAEAAAD9BgAgAwUAAJ0KACBIAACfCgAgSQAAngoAIAaOBQAAzAgAMI8FAACQBwAQkAUAAMwIADCRBQEApQgAIcoFAQClCAAhywUgAKcIACEDAAAA_QYAIAEAAI8HADBHAACQBwAgAwAAAP0GACABAAD-BgAwAgAA-gYAIAEAAAAsACABAAAALAAgAwAAACoAIAEAACsAMAIAACwAIAMAAAAqACABAAArADACAAAsACADAAAAKgAgAQAAKwAwAgAALAAgEgMAAJkKACAGAACaCgAgDwAAnAoAIBIAAJsKACCRBQEAAAABlgUBAAAAAZgFQAAAAAGuBQEAAAABwAUBAAAAAcEFEAAAAAHCBQEAAAABwwUBAAAAAcQFAQAAAAHFBQEAAAABxgVAAAAAAccFAQAAAAHIBQEAAAAByQUBAAAAAQE7AACYBwAgDpEFAQAAAAGWBQEAAAABmAVAAAAAAa4FAQAAAAHABQEAAAABwQUQAAAAAcIFAQAAAAHDBQEAAAABxAUBAAAAAcUFAQAAAAHGBUAAAAABxwUBAAAAAcgFAQAAAAHJBQEAAAABATsAAJoHADABOwAAmgcAMAEAAAAcACABAAAAAwAgEgMAAJUKACAGAACWCgAgDwAAmAoAIBIAAJcKACCRBQEA4wkAIZYFAQDjCQAhmAVAAOgJACGuBQEA5gkAIcAFAQDjCQAhwQUQAJQKACHCBQEA5gkAIcMFAQDmCQAhxAUBAOYJACHFBQEA5gkAIcYFQADoCQAhxwUBAOYJACHIBQEA5gkAIckFAQDmCQAhAgAAACwAIDsAAJ8HACAOkQUBAOMJACGWBQEA4wkAIZgFQADoCQAhrgUBAOYJACHABQEA4wkAIcEFEACUCgAhwgUBAOYJACHDBQEA5gkAIcQFAQDmCQAhxQUBAOYJACHGBUAA6AkAIccFAQDmCQAhyAUBAOYJACHJBQEA5gkAIQIAAAAqACA7AAChBwAgAgAAACoAIDsAAKEHACABAAAAHAAgAQAAAAMAIAMAAAAsACBCAACYBwAgQwAAnwcAIAEAAAAsACABAAAAKgAgDQUAAI8KACBIAACSCgAgSQAAkQoAIIoBAACQCgAgiwEAAJMKACCuBQAA3wkAIMIFAADfCQAgwwUAAN8JACDEBQAA3wkAIMUFAADfCQAgxwUAAN8JACDIBQAA3wkAIMkFAADfCQAgEY4FAADICAAwjwUAAKoHABCQBQAAyAgAMJEFAQClCAAhlgUBAKUIACGYBUAAqggAIa4FAQCoCAAhwAUBAKUIACHBBRAAyQgAIcIFAQCoCAAhwwUBAKgIACHEBQEAqAgAIcUFAQCoCAAhxgVAAKoIACHHBQEAqAgAIcgFAQCoCAAhyQUBAKgIACEDAAAAKgAgAQAAqQcAMEcAAKoHACADAAAAKgAgAQAAKwAwAgAALAAgDo4FAADHCAAwjwUAALAHABCQBQAAxwgAMJEFAQAAAAGYBUAAvAgAIZkFQAC8CAAhuAUBALgIACG5BQEAuggAIboFAQC4CAAhuwUBALgIACG8BQEAuAgAIb0FAQC6CAAhvgUBALoIACG_BQEAuggAIQEAAACtBwAgAQAAAK0HACAOjgUAAMcIADCPBQAAsAcAEJAFAADHCAAwkQUBALgIACGYBUAAvAgAIZkFQAC8CAAhuAUBALgIACG5BQEAuggAIboFAQC4CAAhuwUBALgIACG8BQEAuAgAIb0FAQC6CAAhvgUBALoIACG_BQEAuggAIQS5BQAA3wkAIL0FAADfCQAgvgUAAN8JACC_BQAA3wkAIAMAAACwBwAgAQAAsQcAMAIAAK0HACADAAAAsAcAIAEAALEHADACAACtBwAgAwAAALAHACABAACxBwAwAgAArQcAIAuRBQEAAAABmAVAAAAAAZkFQAAAAAG4BQEAAAABuQUBAAAAAboFAQAAAAG7BQEAAAABvAUBAAAAAb0FAQAAAAG-BQEAAAABvwUBAAAAAQE7AAC1BwAgC5EFAQAAAAGYBUAAAAABmQVAAAAAAbgFAQAAAAG5BQEAAAABugUBAAAAAbsFAQAAAAG8BQEAAAABvQUBAAAAAb4FAQAAAAG_BQEAAAABATsAALcHADABOwAAtwcAMAuRBQEA4wkAIZgFQADoCQAhmQVAAOgJACG4BQEA4wkAIbkFAQDmCQAhugUBAOMJACG7BQEA4wkAIbwFAQDjCQAhvQUBAOYJACG-BQEA5gkAIb8FAQDmCQAhAgAAAK0HACA7AAC6BwAgC5EFAQDjCQAhmAVAAOgJACGZBUAA6AkAIbgFAQDjCQAhuQUBAOYJACG6BQEA4wkAIbsFAQDjCQAhvAUBAOMJACG9BQEA5gkAIb4FAQDmCQAhvwUBAOYJACECAAAAsAcAIDsAALwHACACAAAAsAcAIDsAALwHACADAAAArQcAIEIAALUHACBDAAC6BwAgAQAAAK0HACABAAAAsAcAIAcFAACMCgAgSAAAjgoAIEkAAI0KACC5BQAA3wkAIL0FAADfCQAgvgUAAN8JACC_BQAA3wkAIA6OBQAAxggAMI8FAADDBwAQkAUAAMYIADCRBQEApQgAIZgFQACqCAAhmQVAAKoIACG4BQEApQgAIbkFAQCoCAAhugUBAKUIACG7BQEApQgAIbwFAQClCAAhvQUBAKgIACG-BQEAqAgAIb8FAQCoCAAhAwAAALAHACABAADCBwAwRwAAwwcAIAMAAACwBwAgAQAAsQcAMAIAAK0HACABAAAAlQEAIAEAAACVAQAgAwAAAJMBACABAACUAQAwAgAAlQEAIAMAAACTAQAgAQAAlAEAMAIAAJUBACADAAAAkwEAIAEAAJQBADACAACVAQAgCQMAAIkKACAPAACKCgAgMQAAiwoAIJEFAQAAAAGWBQEAAAABrgUBAAAAAa8FQAAAAAGwBYAAAAABsQVAAAAAAQE7AADLBwAgBpEFAQAAAAGWBQEAAAABrgUBAAAAAa8FQAAAAAGwBYAAAAABsQVAAAAAAQE7AADNBwAwATsAAM0HADAJAwAA-gkAIA8AAPsJACAxAAD8CQAgkQUBAOMJACGWBQEA4wkAIa4FAQDjCQAhrwVAAOgJACGwBYAAAAABsQVAAOgJACECAAAAlQEAIDsAANAHACAGkQUBAOMJACGWBQEA4wkAIa4FAQDjCQAhrwVAAOgJACGwBYAAAAABsQVAAOgJACECAAAAkwEAIDsAANIHACACAAAAkwEAIDsAANIHACADAAAAlQEAIEIAAMsHACBDAADQBwAgAQAAAJUBACABAAAAkwEAIAMFAAD3CQAgSAAA-QkAIEkAAPgJACAJjgUAAMMIADCPBQAA2QcAEJAFAADDCAAwkQUBAKUIACGWBQEApQgAIa4FAQClCAAhrwVAAKoIACGwBQAAxAgAILEFQACqCAAhAwAAAJMBACABAADYBwAwRwAA2QcAIAMAAACTAQAgAQAAlAEAMAIAAJUBACABAAAAmQEAIAEAAACZAQAgAwAAAJcBACABAACYAQAwAgAAmQEAIAMAAACXAQAgAQAAmAEAMAIAAJkBACADAAAAlwEAIAEAAJgBADACAACZAQAgCTAAAPYJACCRBQEAAAABmAVAAAAAAagFAQAAAAGpBQEAAAABqgUBAAAAAasFAgAAAAGsBQEAAAABrQVAAAAAAQE7AADhBwAgCJEFAQAAAAGYBUAAAAABqAUBAAAAAakFAQAAAAGqBQEAAAABqwUCAAAAAawFAQAAAAGtBUAAAAABATsAAOMHADABOwAA4wcAMAkwAAD1CQAgkQUBAOMJACGYBUAA6AkAIagFAQDjCQAhqQUBAOMJACGqBQEA4wkAIasFAgD0CQAhrAUBAOYJACGtBUAA5wkAIQIAAACZAQAgOwAA5gcAIAiRBQEA4wkAIZgFQADoCQAhqAUBAOMJACGpBQEA4wkAIaoFAQDjCQAhqwUCAPQJACGsBQEA5gkAIa0FQADnCQAhAgAAAJcBACA7AADoBwAgAgAAAJcBACA7AADoBwAgAwAAAJkBACBCAADhBwAgQwAA5gcAIAEAAACZAQAgAQAAAJcBACAHBQAA7wkAIEgAAPIJACBJAADxCQAgigEAAPAJACCLAQAA8wkAIKwFAADfCQAgrQUAAN8JACALjgUAAL8IADCPBQAA7wcAEJAFAAC_CAAwkQUBAKUIACGYBUAAqggAIagFAQClCAAhqQUBAKUIACGqBQEApQgAIasFAgDACAAhrAUBAKgIACGtBUAAqQgAIQMAAACXAQAgAQAA7gcAMEcAAO8HACADAAAAlwEAIAEAAJgBADACAACZAQAgB44FAAC-CAAwjwUAAPUHABCQBQAAvggAMJEFAQAAAAGUBQAApggAIJUFIAC5CAAhqAUBAAAAAQEAAADyBwAgAQAAAPIHACAHjgUAAL4IADCPBQAA9QcAEJAFAAC-CAAwkQUBALgIACGUBQAApggAIJUFIAC5CAAhqAUBALgIACEAAwAAAPUHACABAAD2BwAwAgAA8gcAIAMAAAD1BwAgAQAA9gcAMAIAAPIHACADAAAA9QcAIAEAAPYHADACAADyBwAgBJEFAQAAAAGUBQAA7gkAIJUFIAAAAAGoBQEAAAABATsAAPoHACAEkQUBAAAAAZQFAADuCQAglQUgAAAAAagFAQAAAAEBOwAA_AcAMAE7AAD8BwAwBJEFAQDjCQAhlAUAAO0JACCVBSAA5QkAIagFAQDjCQAhAgAAAPIHACA7AAD_BwAgBJEFAQDjCQAhlAUAAO0JACCVBSAA5QkAIagFAQDjCQAhAgAAAPUHACA7AACBCAAgAgAAAPUHACA7AACBCAAgAwAAAPIHACBCAAD6BwAgQwAA_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_CAAwjwUAAO8HABCQBQAAvwgAMJEFAQClCAAhmAVAAKoIACGoBQEApQgAIakFAQClCAAhqgUBAKUIACGrBQIAwAgAIawFAQCoCAAhrQVAAKkIACENBQAArAgAIEgAAKwIACBJAACsCAAgigEAAMIIACCLAQAArAgAIJoFAgAAAAGbBQIAAAAEnAUCAAAABJ0FAgAAAAGeBQIAAAABnwUCAAAAAaAFAgAAAAGhBQIAwQgAIQ0FAACsCAAgSAAArAgAIEkAAKwIACCKAQAAwggAIIsBAACsCAAgmgUCAAAAAZsFAgAAAAScBQIAAAAEnQUCAAAAAZ4FAgAAAAGfBQIAAAABoAUCAAAAAaEFAgDBCAAhCJoFCAAAAAGbBQgAAAAEnAUIAAAABJ0FCAAAAAGeBQgAAAABnwUIAAAAAaAFCAAAAAGhBQgAwggAIQmOBQAAwwgAMI8FAADZBwAQkAUAAMMIADCRBQEApQgAIZYFAQClCAAhrgUBAKUIACGvBUAAqggAIbAFAADECAAgsQVAAKoIACEPBQAArAgAIEgAAMUIACBJAADFCAAgmgWAAAAAAZ0FgAAAAAGeBYAAAAABnwWAAAAAAaAFgAAAAAGhBYAAAAABsgUBAAAAAbMFAQAAAAG0BQEAAAABtQWAAAAAAbYFgAAAAAG3BYAAAAABDJoFgAAAAAGdBYAAAAABngWAAAAAAZ8FgAAAAAGgBYAAAAABoQWAAAAAAbIFAQAAAAGzBQEAAAABtAUBAAAAAbUFgAAAAAG2BYAAAAABtwWAAAAAAQ6OBQAAxggAMI8FAADDBwAQkAUAAMYIADCRBQEApQgAIZgFQACqCAAhmQVAAKoIACG4BQEApQgAIbkFAQCoCAAhugUBAKUIACG7BQEApQgAIbwFAQClCAAhvQUBAKgIACG-BQEAqAgAIb8FAQCoCAAhDo4FAADHCAAwjwUAALAHABCQBQAAxwgAMJEFAQC4CAAhmAVAALwIACGZBUAAvAgAIbgFAQC4CAAhuQUBALoIACG6BQEAuAgAIbsFAQC4CAAhvAUBALgIACG9BQEAuggAIb4FAQC6CAAhvwUBALoIACERjgUAAMgIADCPBQAAqgcAEJAFAADICAAwkQUBAKUIACGWBQEApQgAIZgFQACqCAAhrgUBAKgIACHABQEApQgAIcEFEADJCAAhwgUBAKgIACHDBQEAqAgAIcQFAQCoCAAhxQUBAKgIACHGBUAAqggAIccFAQCoCAAhyAUBAKgIACHJBQEAqAgAIQ0FAACsCAAgSAAAywgAIEkAAMsIACCKAQAAywgAIIsBAADLCAAgmgUQAAAAAZsFEAAAAAScBRAAAAAEnQUQAAAAAZ4FEAAAAAGfBRAAAAABoAUQAAAAAaEFEADKCAAhDQUAAKwIACBIAADLCAAgSQAAywgAIIoBAADLCAAgiwEAAMsIACCaBRAAAAABmwUQAAAABJwFEAAAAASdBRAAAAABngUQAAAAAZ8FEAAAAAGgBRAAAAABoQUQAMoIACEImgUQAAAAAZsFEAAAAAScBRAAAAAEnQUQAAAAAZ4FEAAAAAGfBRAAAAABoAUQAAAAAaEFEADLCAAhBo4FAADMCAAwjwUAAJAHABCQBQAAzAgAMJEFAQClCAAhygUBAKUIACHLBSAApwgAIQcRAADOCAAgjgUAAM0IADCPBQAA_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_gUCmwUAAAD-BQicBQAAAP4FCKEFAADkCP4FIgcFAACsCAAgSAAA5QgAIEkAAOUIACCaBQAAAP4FApsFAAAA_gUInAUAAAD-BQihBQAA5Aj-BSIEmgUAAAD-BQKbBQAAAP4FCJwFAAAA_gUIoQUAAOUI_gUiC44FAADmCAAwjwUAAOEEABCQBQAA5ggAMJEFAQClCAAhgAYBAKUIACGBBgEApQgAIYIGAQCoCAAhgwYBAKgIACGEBgAA4wj-BSKFBgEAqAgAIYYGAADECAAgCo4FAADnCAAwjwUAAMkEABCQBQAA5wgAMJEFAQClCAAhmAVAAKoIACHcBQEAqAgAIfoFAQClCAAh-wUQANoIACH8BUAAqggAIYcGAQClCAAhC44FAADoCAAwjwUAALMEABCQBQAA6AgAMJEFAQClCAAhlgUBAKgIACGYBUAAqggAIccFAQCoCAAhyAUBAKgIACH-BQAA4wj-BSL_BUAAqggAIYcGAQClCAAhDY4FAADpCAAwjwUAAJsEABCQBQAA6QgAMJEFAQClCAAhygUBAKUIACGBBgEApQgAIYIGAQCoCAAhhAYAAOMI_gUihQYBAKgIACGGBgAAxAgAIIgGAQClCAAhiQYBAKgIACGKBgEAqAgAIQaOBQAA6ggAMI8FAACDBAAQkAUAAOoIADCRBQEApQgAIcoFAQClCAAhywUgAKcIACEHIAAA7AgAII4FAADrCAAwjwUAAPADABCQBQAA6wgAMJEFAQC4CAAhygUBALgIACHLBSAAuQgAIQPMBQAAYgAgzQUAAGIAIM4FAABiACAGjgUAAO0IADCPBQAA6gMAEJAFAADtCAAwkQUBAKUIACHKBQEApQgAIcsFIACnCAAhBxoAAO8IACCOBQAA7ggAMI8FAADXAwAQkAUAAO4IADCRBQEAuAgAIcoFAQC4CAAhywUgALkIACEDzAUAAFAAIM0FAABQACDOBQAAUAAgDY4FAADwCAAwjwUAANEDABCQBQAA8AgAMJEFAQClCAAhlgUBAKUIACGYBUAAqggAIccFAQCoCAAhyAUBAKgIACHcBQEAqAgAIfoFAADxCI0GIosGAQClCAAhjQYQAMkIACGOBkAAqggAIQcFAACsCAAgSAAA8wgAIEkAAPMIACCaBQAAAI0GApsFAAAAjQYInAUAAACNBgihBQAA8giNBiIHBQAArAgAIEgAAPMIACBJAADzCAAgmgUAAACNBgKbBQAAAI0GCJwFAAAAjQYIoQUAAPIIjQYiBJoFAAAAjQYCmwUAAACNBgicBQAAAI0GCKEFAADzCI0GIhCOBQAA9AgAMI8FAAC7AwAQkAUAAPQIADCRBQEApQgAIZYFAQClCAAhmAVAAKoIACGuBQEAqAgAIccFAQCoCAAhyAUBAKgIACHJBQEAqAgAIdwFAQCoCAAhiwYBAKUIACGNBhAAyQgAIY8GAQCoCAAhkAYBAKUIACGRBkAAqggAIRGOBQAA9QgAMI8FAACjAwAQkAUAAPUIADCRBQEApQgAIZgFQACqCAAhxwUBAKgIACHIBQEAqAgAIdwFAQCoCAAh-gUAAPYIkwYi_wVAAKoIACGLBgEApQgAIZMGAQCoCAAhlAYBAKUIACGVBhAAyQgAIZYGEADaCAAhlwYBAKgIACGYBgEAqAgAIQcFAACsCAAgSAAA-AgAIEkAAPgIACCaBQAAAJMGApsFAAAAkwYInAUAAACTBgihBQAA9wiTBiIHBQAArAgAIEgAAPgIACBJAAD4CAAgmgUAAACTBgKbBQAAAJMGCJwFAAAAkwYIoQUAAPcIkwYiBJoFAAAAkwYCmwUAAACTBgicBQAAAJMGCKEFAAD4CJMGIhWOBQAA-QgAMI8FAACLAwAQkAUAAPkIADCRBQEApQgAIZYFAQCoCAAhmAVAAKoIACHHBQEAqAgAIcgFAQCoCAAh3AUBAKgIACHeBQEApQgAIeIFEADJCAAh4wUBAKgIACGLBgEApQgAIY0GEADJCAAhlwYBAKgIACGaBgAA-giaBiKbBhAAyQgAIZwGAQClCAAhnQYBAKgIACGeBgEAqAgAIZ8GQACqCAAhBwUAAKwIACBIAAD8CAAgSQAA_AgAIJoFAAAAmgYCmwUAAACaBgicBQAAAJoGCKEFAAD7CJoGIgcFAACsCAAgSAAA_AgAIEkAAPwIACCaBQAAAJoGApsFAAAAmgYInAUAAACaBgihBQAA-wiaBiIEmgUAAACaBgKbBQAAAJoGCJwFAAAAmgYIoQUAAPwImgYiB44FAAD9CAAwjwUAAPMCABCQBQAA_QgAMJYFAQClCAAhmQVAAKoIACGLBgEApQgAIY0GEADJCAAhBo4FAAD-CAAwjwUAAN0CABCQBQAA_ggAMJkFQACqCAAhiwYBAKUIACGNBhAAyQgAIQaOBQAA_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-ACAOJwAArQkAICkAAK4JACCOBQAArAkAMI8FAAB-ABCQBQAArAkAMJEFAQC4CAAhmAVAALwIACHBBRAAqQkAIccFAQC6CAAh6wUBALgIACHsBQEAuggAIe0FAQC6CAAh7gVAALwIACHvBQEAuggAIRAmAACqCQAgKgAAqwkAII4FAACvCQAwjwUAAHoAEJAFAACvCQAwkQUBALgIACGYBUAAvAgAIcEFEACpCQAhwwUBALoIACHHBQEAuggAIcgFAQC6CAAh5AUBALgIACHvBQEAuggAIfAFQAC8CAAhrwYAAHoAILAGAAB6ACATJgAAqgkAICgAAKsJACCOBQAAqAkAMI8FAACCAQAQkAUAAKgJADCRBQEAuAgAIZgFQAC8CAAhqgUBALgIACHHBQEAuggAIcgFAQC6CAAh5AUBALgIACHlBRAAqQkAIeYFEACpCQAh5wUQAKkJACHoBRAAqQkAIekFAQC6CAAh6gVAALsIACGvBgAAggEAILAGAACCAQAgDiYAAKoJACAqAACrCQAgjgUAAK8JADCPBQAAegAQkAUAAK8JADCRBQEAuAgAIZgFQAC8CAAhwQUQAKkJACHDBQEAuggAIccFAQC6CAAhyAUBALoIACHkBQEAuAgAIe8FAQC6CAAh8AVAALwIACEOJAAAsQkAICUAAJIJACArAACyCQAgLAAAswkAII4FAACwCQAwjwUAAHQAEJAFAACwCQAwkQUBALgIACHKBQEAuAgAIcsFIAC5CAAh9QUBALoIACH2BQEAuggAIfcFAQC4CAAh-AUQAKkJACEJIwAA4AgAII4FAADfCAAwjwUAAJUFABCQBQAA3wgAMJEFAQC4CAAhygUBALgIACHLBSAAuQgAIa8GAACVBQAgsAYAAJUFACADzAUAAHoAIM0FAAB6ACDOBQAAegAgA8wFAACCAQAgzQUAAIIBACDOBQAAggEAIA8DAACmCQAgDwAAtgkAICYAAKoJACCOBQAAtAkAMI8FAABwABCQBQAAtAkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIa4FAQC6CAAh5AUBALgIACHxBUAAvAgAIfIFIAC5CAAh8wUQALUJACH0BRAAtQkAIQiaBRAAAAABmwUQAAAABZwFEAAAAAWdBRAAAAABngUQAAAAAZ8FEAAAAAGgBRAAAAABoQUQANwIACEbAwAApgkAIBAAANIIACARAADOCAAgFgAAjgkAICUAAJIJACAyAACUCQAgMwAAngkAIDUAAJsJACCOBQAA3gkAMI8FAAADABCQBQAA3gkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIa8FQAC8CAAhxwUBALoIACHIBQEAuggAIdYFAQC4CAAh1wUBALoIACHYBQEAuggAIdkFAQC6CAAh2gUBALoIACHbBQEAuggAIdwFAQC6CAAh3QUAAKUJACCvBgAAAwAgsAYAAAMAIAshAAC4CQAgjgUAALcJADCPBQAAaQAQkAUAALcJADCRBQEAuAgAIZgFQAC8CAAh3AUBALoIACH5BQEAuAgAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIREbAAC7CQAgHAAAvAkAIB0AAJEJACAeAAC9CQAgjgUAALkJADCPBQAAYgAQkAUAALkJADCRBQEAuAgAIYAGAQC4CAAhgQYBALgIACGCBgEAuggAIYMGAQC6CAAhhAYAALoJ_gUihQYBALoIACGGBgAApQkAIK8GAABiACCwBgAAYgAgDxsAALsJACAcAAC8CQAgHQAAkQkAIB4AAL0JACCOBQAAuQkAMI8FAABiABCQBQAAuQkAMJEFAQC4CAAhgAYBALgIACGBBgEAuAgAIYIGAQC6CAAhgwYBALoIACGEBgAAugn-BSKFBgEAuggAIYYGAAClCQAgBJoFAAAA_gUCmwUAAAD-BQicBQAAAP4FCKEFAADlCP4FIgkgAADsCAAgjgUAAOsIADCPBQAA8AMAEJAFAADrCAAwkQUBALgIACHKBQEAuAgAIcsFIAC5CAAhrwYAAPADACCwBgAA8AMAIBsMAACMCQAgDQAA0QgAIBAAANIIACARAADOCAAgFgAAjgkAIBcAAI8JACAYAACNCQAgGQAAjQkAIB8AAJAJACAiAACRCQAgJQAAkgkAIC0AAJMJACAuAADvCAAgLwAA7AgAIDIAAJQJACCOBQAAigkAMI8FAAAoABCQBQAAigkAMJEFAQC4CAAhmAVAALwIACGZBUAAvAgAIaoFAACLCaYGIsoFAQC4CAAhpAYBALgIACGmBgEAuggAIa8GAAAoACCwBgAAKAAgA8wFAABpACDNBQAAaQAgzgUAAGkAIA0DAAC8CQAgIQAAuAkAII4FAAC-CQAwjwUAAF4AEJAFAAC-CQAwkQUBALgIACGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIfkFAQC4CAAh_gUAALoJ_gUi_wVAALwIACELGgAAwAkAII4FAAC_CQAwjwUAAFcAEJAFAAC_CQAwkQUBALgIACGYBUAAvAgAIdwFAQC6CAAh-gUBALgIACH7BRAAtQkAIfwFQAC8CAAhhwYBALgIACETGwAAwgkAIBwAALwJACAdAACQCQAgHgAAwwkAII4FAADBCQAwjwUAAFAAEJAFAADBCQAwkQUBALgIACHKBQEAuAgAIYEGAQC4CAAhggYBALoIACGEBgAAugn-BSKFBgEAuggAIYYGAAClCQAgiAYBALgIACGJBgEAuggAIYoGAQC6CAAhrwYAAFAAILAGAABQACARGwAAwgkAIBwAALwJACAdAACQCQAgHgAAwwkAII4FAADBCQAwjwUAAFAAEJAFAADBCQAwkQUBALgIACHKBQEAuAgAIYEGAQC4CAAhggYBALoIACGEBgAAugn-BSKFBgEAuggAIYYGAAClCQAgiAYBALgIACGJBgEAuggAIYoGAQC6CAAhCRoAAO8IACCOBQAA7ggAMI8FAADXAwAQkAUAAO4IADCRBQEAuAgAIcoFAQC4CAAhywUgALkIACGvBgAA1wMAILAGAADXAwAgA8wFAABXACDNBQAAVwAgzgUAAFcAIA0DAAC8CQAgGgAAwAkAII4FAADECQAwjwUAAEwAEJAFAADECQAwkQUBALgIACGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIf4FAAC6Cf4FIv8FQAC8CAAhhwYBALgIACEPAwAApgkAIAoAAMcJACCOBQAAxQkAMI8FAAA9ABCQBQAAxQkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACHcBQEAuggAIfoFAADGCY0GIosGAQC4CAAhjQYQAKkJACGOBkAAvAgAIQSaBQAAAI0GApsFAAAAjQYInAUAAACNBgihBQAA8wiNBiIPCQAA1QkAIAsAANYJACAMAACMCQAgDQAA0QgAIBUAAI0JACAWAACOCQAgFwAAjwkAII4FAADUCQAwjwUAABIAEJAFAADUCQAwkQUBALgIACGgBgEAuAgAIaEGAQC4CAAhrwYAABIAILAGAAASACATAwAApgkAIAoAAMcJACAPAAC2CQAgjgUAAMgJADCPBQAAOAAQkAUAAMgJADCRBQEAuAgAIZYFAQC4CAAhmAVAALwIACGuBQEAuggAIccFAQC6CAAhyAUBALoIACHJBQEAuggAIdwFAQC6CAAhiwYBALgIACGNBhAAqQkAIY8GAQC6CAAhkAYBALgIACGRBkAAvAgAIRQKAADHCQAgEwAAvAkAIBQAAKYJACCOBQAAyQkAMI8FAAAzABCQBQAAyQkAMJEFAQC4CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh3AUBALoIACH6BQAAygmTBiL_BUAAvAgAIYsGAQC4CAAhkwYBALoIACGUBgEAuAgAIZUGEACpCQAhlgYQALUJACGXBgEAuggAIZgGAQC6CAAhBJoFAAAAkwYCmwUAAACTBgicBQAAAJMGCKEFAAD4CJMGIhUDAACmCQAgBgAAzAkAIA8AALYJACASAADNCQAgjgUAAMsJADCPBQAAKgAQkAUAAMsJADCRBQEAuAgAIZYFAQC4CAAhmAVAALwIACGuBQEAuggAIcAFAQC4CAAhwQUQAKkJACHCBQEAuggAIcMFAQC6CAAhxAUBALoIACHFBQEAuggAIcYFQAC8CAAhxwUBALoIACHIBQEAuggAIckFAQC6CAAhCREAAM4IACCOBQAAzQgAMI8FAAD9BgAQkAUAAM0IADCRBQEAuAgAIcoFAQC4CAAhywUgALkIACGvBgAA_QYAILAGAAD9BgAgGwMAALwJACAKAADHCQAgDgAAzwkAIBEAAM4IACCOBQAA0AkAMI8FAAAcABCQBQAA0AkAMJEFAQC4CAAhlgUBALoIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACHcBQEAuggAId4FAQC4CAAh4gUQAKkJACHjBQEAuggAIYsGAQC4CAAhjQYQAKkJACGXBgEAuggAIZoGAADRCZoGIpsGEACpCQAhnAYBALgIACGdBgEAuggAIZ4GAQC6CAAhnwZAALwIACGvBgAAHAAgsAYAABwAIBQDAACmCQAgDgAAzwkAIA8AALYJACCOBQAAzgkAMI8FAAAhABCQBQAAzgkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIa0FQAC8CAAhrgUBALoIACHHBQEAuggAIcgFAQC6CAAhyQUBALoIACHeBQEAuAgAId8FEACpCQAh4AUBALgIACHhBRAAqQkAIeIFEACpCQAh4wUBALoIACEODQAA0QgAIBAAANIIACCOBQAA0AgAMI8FAADkBgAQkAUAANAIADCRBQEAuAgAIcoFAQC4CAAhzwUBALoIACHQBQEAuggAIdEFAQC6CAAh0gUBALoIACHTBQAApggAIK8GAADkBgAgsAYAAOQGACAZAwAAvAkAIAoAAMcJACAOAADPCQAgEQAAzggAII4FAADQCQAwjwUAABwAEJAFAADQCQAwkQUBALgIACGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh3gUBALgIACHiBRAAqQkAIeMFAQC6CAAhiwYBALgIACGNBhAAqQkAIZcGAQC6CAAhmgYAANEJmgYimwYQAKkJACGcBgEAuAgAIZ0GAQC6CAAhngYBALoIACGfBkAAvAgAIQSaBQAAAJoGApsFAAAAmgYInAUAAACaBgihBQAA_AiaBiIHCgAAxwkAII4FAADSCQAwjwUAABcAEJAFAADSCQAwmQVAALwIACGLBgEAuAgAIY0GEACpCQAhAqAGAQAAAAGhBgEAAAABDQkAANUJACALAADWCQAgDAAAjAkAIA0AANEIACAVAACNCQAgFgAAjgkAIBcAAI8JACCOBQAA1AkAMI8FAAASABCQBQAA1AkAMJEFAQC4CAAhoAYBALgIACGhBgEAuAgAIQ8GAADZCQAgBwAA2gkAIAgAANsJACCOBQAA2AkAMI8FAAALABCQBQAA2AkAMJEFAQC4CAAhwAUBALgIACHKBQEAuAgAIcsFIAC5CAAhhgYAAKUJACCiBgEAuAgAIaMGEAC1CQAhrwYAAAsAILAGAAALACADzAUAABcAIM0FAAAXACDOBQAAFwAgAsAFAQAAAAHKBQEAAAABDQYAANkJACAHAADaCQAgCAAA2wkAII4FAADYCQAwjwUAAAsAEJAFAADYCQAwkQUBALgIACHABQEAuAgAIcoFAQC4CAAhywUgALkIACGGBgAApQkAIKIGAQC4CAAhowYQALUJACEJBAAAgwkAII4FAACFCQAwjwUAAO8BABCQBQAAhQkAMJEFAQC4CAAhygUBALgIACHLBSAAuQgAIa8GAADvAQAgsAYAAO8BACAIBAAAgwkAII4FAACCCQAwjwUAAIgCABCQBQAAggkAMJEFAQC4CAAhygUBALgIACGvBgAAiAIAILAGAACIAgAgA8wFAAASACDNBQAAEgAgzgUAABIAIAKWBQEAAAABiwYBAAAAAQkDAACmCQAgCgAAxwkAII4FAADdCQAwjwUAAAcAEJAFAADdCQAwlgUBALgIACGZBUAAvAgAIYsGAQC4CAAhjQYQAKkJACEZAwAApgkAIBAAANIIACARAADOCAAgFgAAjgkAICUAAJIJACAyAACUCQAgMwAAngkAIDUAAJsJACCOBQAA3gkAMI8FAAADABCQBQAA3gkAMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIa8FQAC8CAAhxwUBALoIACHIBQEAuggAIdYFAQC4CAAh1wUBALoIACHYBQEAuggAIdkFAQC6CAAh2gUBALoIACHbBQEAuggAIdwFAQC6CAAh3QUAAKUJACAAAAAAAbQGAQAAAAECtAYBAAAABL4GAQAAAAUBtAYgAAAAAQG0BgEAAAABAbQGQAAAAAEBtAZAAAAAAQG0BgEAAAAEAAAAArQGAQAAAAS-BgEAAAAFAbQGAQAAAAQAAAAAAAW0BgIAAAABugYCAAAAAbsGAgAAAAG8BgIAAAABvQYCAAAAAQVCAACaEwAgQwAAnRMAILEGAACbEwAgsgYAAJwTACC3BgAAlQEAIANCAACaEwAgsQYAAJsTACC3BgAAlQEAIAAAAAVCAACREwAgQwAAmBMAILEGAACSEwAgsgYAAJcTACC3BgAA1AEAIAVCAACPEwAgQwAAlRMAILEGAACQEwAgsgYAAJQTACC3BgAABQAgC0IAAP0JADBDAACCCgAwsQYAAP4JADCyBgAA_wkAMLMGAACACgAgtAYAAIEKADC1BgAAgQoAMLYGAACBCgAwtwYAAIEKADC4BgAAgwoAMLkGAACECgAwB5EFAQAAAAGYBUAAAAABqAUBAAAAAaoFAQAAAAGrBQIAAAABrAUBAAAAAa0FQAAAAAECAAAAmQEAIEIAAIgKACADAAAAmQEAIEIAAIgKACBDAACHCgAgATsAAJMTADANMAAAogkAII4FAACgCQAwjwUAAJcBABCQBQAAoAkAMJEFAQAAAAGYBUAAvAgAIagFAQC4CAAhqQUBALgIACGqBQEAuAgAIasFAgChCQAhrAUBALoIACGtBUAAuwgAIaoGAACfCQAgAgAAAJkBACA7AACHCgAgAgAAAIUKACA7AACGCgAgC44FAACECgAwjwUAAIUKABCQBQAAhAoAMJEFAQC4CAAhmAVAALwIACGoBQEAuAgAIakFAQC4CAAhqgUBALgIACGrBQIAoQkAIawFAQC6CAAhrQVAALsIACELjgUAAIQKADCPBQAAhQoAEJAFAACECgAwkQUBALgIACGYBUAAvAgAIagFAQC4CAAhqQUBALgIACGqBQEAuAgAIasFAgChCQAhrAUBALoIACGtBUAAuwgAIQeRBQEA4wkAIZgFQADoCQAhqAUBAOMJACGqBQEA4wkAIasFAgD0CQAhrAUBAOYJACGtBUAA5wkAIQeRBQEA4wkAIZgFQADoCQAhqAUBAOMJACGqBQEA4wkAIasFAgD0CQAhrAUBAOYJACGtBUAA5wkAIQeRBQEAAAABmAVAAAAAAagFAQAAAAGqBQEAAAABqwUCAAAAAawFAQAAAAGtBUAAAAABA0IAAJETACCxBgAAkhMAILcGAADUAQAgA0IAAI8TACCxBgAAkBMAILcGAAAFACAEQgAA_QkAMLEGAAD-CQAwswYAAIAKACC3BgAAgQoAMAAAAAAAAAAABbQGEAAAAAG6BhAAAAABuwYQAAAAAbwGEAAAAAG9BhAAAAABBUIAAIETACBDAACNEwAgsQYAAIITACCyBgAAjBMAILcGAADUAQAgBUIAAP8SACBDAACKEwAgsQYAAIATACCyBgAAiRMAILcGAAD6BgAgB0IAAP0SACBDAACHEwAgsQYAAP4SACCyBgAAhhMAILUGAAAcACC2BgAAHAAgtwYAAB4AIAdCAAD7EgAgQwAAhBMAILEGAAD8EgAgsgYAAIMTACC1BgAAAwAgtgYAAAMAILcGAAAFACADQgAAgRMAILEGAACCEwAgtwYAANQBACADQgAA_xIAILEGAACAEwAgtwYAAPoGACADQgAA_RIAILEGAAD-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_QoAMLEGAAD5CgAwsgYAAPoKADCzBgAA-woAILQGAAD8CgAwtQYAAPwKADC2BgAA_AoAMLcGAAD8CgAwuAYAAP4KADC5BgAA_woAMAcDAACJCgAgMQAAiwoAIJEFAQAAAAGWBQEAAAABrwVAAAAAAbAFgAAAAAGxBUAAAAABAgAAAJUBACBCAACDCwAgAwAAAJUBACBCAACDCwAgQwAAggsAIAE7AADSEgAwDQMAAKYJACAPAACdCQAgMQAApwkAII4FAACkCQAwjwUAAJMBABCQBQAApAkAMJEFAQAAAAGWBQEAuAgAIa4FAQC4CAAhrwVAALwIACGwBQAApQkAILEFQAC8CAAhqwYAAKMJACACAAAAlQEAIDsAAIILACACAAAAgAsAIDsAAIELACAJjgUAAP8KADCPBQAAgAsAEJAFAAD_CgAwkQUBALgIACGWBQEAuAgAIa4FAQC4CAAhrwVAALwIACGwBQAApQkAILEFQAC8CAAhCY4FAAD_CgAwjwUAAIALABCQBQAA_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-wsAMLEGAAD4CwAwsgYAAPkLADCzBgAA-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_DAAwtgYAAL8MADC3BgAAvwwAMLgGAADBDAAwuQYAAMIMADAJJQAAtAwAICsAALUMACAsAAC2DAAgkQUBAAAAAcoFAQAAAAHLBSAAAAAB9QUBAAAAAfYFAQAAAAH4BRAAAAABAgAAAHYAIEIAAMYMACADAAAAdgAgQgAAxgwAIEMAAMUMACABOwAAjBIAMA4kAACxCQAgJQAAkgkAICsAALIJACAsAACzCQAgjgUAALAJADCPBQAAdAAQkAUAALAJADCRBQEAAAABygUBALgIACHLBSAAuQgAIfUFAQC6CAAh9gUBALoIACH3BQEAuAgAIfgFEACpCQAhAgAAAHYAIDsAAMUMACACAAAAwwwAIDsAAMQMACAKjgUAAMIMADCPBQAAwwwAEJAFAADCDAAwkQUBALgIACHKBQEAuAgAIcsFIAC5CAAh9QUBALoIACH2BQEAuggAIfcFAQC4CAAh-AUQAKkJACEKjgUAAMIMADCPBQAAwwwAEJAFAADCDAAwkQUBALgIACHKBQEAuAgAIcsFIAC5CAAh9QUBALoIACH2BQEAuggAIfcFAQC4CAAh-AUQAKkJACEGkQUBAOMJACHKBQEA4wkAIcsFIADlCQAh9QUBAOYJACH2BQEA5gkAIfgFEACUCgAhCSUAAI8MACArAACQDAAgLAAAkQwAIJEFAQDjCQAhygUBAOMJACHLBSAA5QkAIfUFAQDmCQAh9gUBAOYJACH4BRAAlAoAIQklAAC0DAAgKwAAtQwAICwAALYMACCRBQEAAAABygUBAAAAAcsFIAAAAAH1BQEAAAAB9gUBAAAAAfgFEAAAAAEEQgAAuwwAMLEGAAC8DAAwswYAAL4MACC3BgAAvwwAMAAAAAAAAAVCAACHEgAgQwAAihIAILEGAACIEgAgsgYAAIkSACC3BgAAZAAgA0IAAIcSACCxBgAAiBIAILcGAABkACAAAAABtAYAAAD-BQIFQgAA_xEAIEMAAIUSACCxBgAAgBIAILIGAACEEgAgtwYAAGQAIAdCAAD9EQAgQwAAghIAILEGAAD-EQAgsgYAAIESACC1BgAAKAAgtgYAACgAILcGAADUAQAgA0IAAP8RACCxBgAAgBIAILcGAABkACADQgAA_REAILEGAAD-EQAgtwYAANQBACAAAAAFQgAA8xEAIEMAAPsRACCxBgAA9BEAILIGAAD6EQAgtwYAAO0DACAHQgAA8REAIEMAAPgRACCxBgAA8hEAILIGAAD3EQAgtQYAACgAILYGAAAoACC3BgAA1AEAIAtCAADrDAAwQwAA8AwAMLEGAADsDAAwsgYAAO0MADCzBgAA7gwAILQGAADvDAAwtQYAAO8MADC2BgAA7wwAMLcGAADvDAAwuAYAAPEMADC5BgAA8gwAMAtCAADfDAAwQwAA5AwAMLEGAADgDAAwsgYAAOEMADCzBgAA4gwAILQGAADjDAAwtQYAAOMMADC2BgAA4wwAMLcGAADjDAAwuAYAAOUMADC5BgAA5gwAMAaRBQEAAAABmAVAAAAAAdwFAQAAAAH6BQEAAAAB-wUQAAAAAfwFQAAAAAECAAAAawAgQgAA6gwAIAMAAABrACBCAADqDAAgQwAA6QwAIAE7AAD2EQAwCyEAALgJACCOBQAAtwkAMI8FAABpABCQBQAAtwkAMJEFAQAAAAGYBUAAvAgAIdwFAQC6CAAh-QUBALgIACH6BQEAuAgAIfsFEAC1CQAh_AVAALwIACECAAAAawAgOwAA6QwAIAIAAADnDAAgOwAA6AwAIAqOBQAA5gwAMI8FAADnDAAQkAUAAOYMADCRBQEAuAgAIZgFQAC8CAAh3AUBALoIACH5BQEAuAgAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIQqOBQAA5gwAMI8FAADnDAAQkAUAAOYMADCRBQEAuAgAIZgFQAC8CAAh3AUBALoIACH5BQEAuAgAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIQaRBQEA4wkAIZgFQADoCQAh3AUBAOYJACH6BQEA4wkAIfsFEAC-CwAh_AVAAOgJACEGkQUBAOMJACGYBUAA6AkAIdwFAQDmCQAh-gUBAOMJACH7BRAAvgsAIfwFQADoCQAhBpEFAQAAAAGYBUAAAAAB3AUBAAAAAfoFAQAAAAH7BRAAAAAB_AVAAAAAAQgDAADXDAAgkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAH-BQAAAP4FAv8FQAAAAAECAAAAYAAgQgAA9gwAIAMAAABgACBCAAD2DAAgQwAA9QwAIAE7AAD1EQAwDQMAALwJACAhAAC4CQAgjgUAAL4JADCPBQAAXgAQkAUAAL4JADCRBQEAAAABlgUBALoIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACH5BQEAuAgAIf4FAAC6Cf4FIv8FQAC8CAAhAgAAAGAAIDsAAPUMACACAAAA8wwAIDsAAPQMACALjgUAAPIMADCPBQAA8wwAEJAFAADyDAAwkQUBALgIACGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIfkFAQC4CAAh_gUAALoJ_gUi_wVAALwIACELjgUAAPIMADCPBQAA8wwAEJAFAADyDAAwkQUBALgIACGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIfkFAQC4CAAh_gUAALoJ_gUi_wVAALwIACEHkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIf4FAADTDP4FIv8FQADoCQAhCAMAANUMACCRBQEA4wkAIZYFAQDmCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh_gUAANMM_gUi_wVAAOgJACEIAwAA1wwAIJEFAQAAAAGWBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB_gUAAAD-BQL_BUAAAAABA0IAAPMRACCxBgAA9BEAILcGAADtAwAgA0IAAPERACCxBgAA8hEAILcGAADUAQAgBEIAAOsMADCxBgAA7AwAMLMGAADuDAAgtwYAAO8MADAEQgAA3wwAMLEGAADgDAAwswYAAOIMACC3BgAA4wwAMAAAAAAABUIAAOwRACBDAADvEQAgsQYAAO0RACCyBgAA7hEAILcGAABSACADQgAA7BEAILEGAADtEQAgtwYAAFIAIAAAAAVCAADkEQAgQwAA6hEAILEGAADlEQAgsgYAAOkRACC3BgAAUgAgB0IAAOIRACBDAADnEQAgsQYAAOMRACCyBgAA5hEAILUGAAAoACC2BgAAKAAgtwYAANQBACADQgAA5BEAILEGAADlEQAgtwYAAFIAIANCAADiEQAgsQYAAOMRACC3BgAA1AEAIAAAAAVCAADYEQAgQwAA4BEAILEGAADZEQAgsgYAAN8RACC3BgAA1AMAIAdCAADWEQAgQwAA3REAILEGAADXEQAgsgYAANwRACC1BgAAKAAgtgYAACgAILcGAADUAQAgC0IAAJwNADBDAAChDQAwsQYAAJ0NADCyBgAAng0AMLMGAACfDQAgtAYAAKANADC1BgAAoA0AMLYGAACgDQAwtwYAAKANADC4BgAAog0AMLkGAACjDQAwC0IAAJANADBDAACVDQAwsQYAAJENADCyBgAAkg0AMLMGAACTDQAgtAYAAJQNADC1BgAAlA0AMLYGAACUDQAwtwYAAJQNADC4BgAAlg0AMLkGAACXDQAwBpEFAQAAAAGYBUAAAAAB3AUBAAAAAfoFAQAAAAH7BRAAAAAB_AVAAAAAAQIAAABZACBCAACbDQAgAwAAAFkAIEIAAJsNACBDAACaDQAgATsAANsRADALGgAAwAkAII4FAAC_CQAwjwUAAFcAEJAFAAC_CQAwkQUBAAAAAZgFQAC8CAAh3AUBALoIACH6BQEAuAgAIfsFEAC1CQAh_AVAALwIACGHBgEAuAgAIQIAAABZACA7AACaDQAgAgAAAJgNACA7AACZDQAgCo4FAACXDQAwjwUAAJgNABCQBQAAlw0AMJEFAQC4CAAhmAVAALwIACHcBQEAuggAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIYcGAQC4CAAhCo4FAACXDQAwjwUAAJgNABCQBQAAlw0AMJEFAQC4CAAhmAVAALwIACHcBQEAuggAIfoFAQC4CAAh-wUQALUJACH8BUAAvAgAIYcGAQC4CAAhBpEFAQDjCQAhmAVAAOgJACHcBQEA5gkAIfoFAQDjCQAh-wUQAL4LACH8BUAA6AkAIQaRBQEA4wkAIZgFQADoCQAh3AUBAOYJACH6BQEA4wkAIfsFEAC-CwAh_AVAAOgJACEGkQUBAAAAAZgFQAAAAAHcBQEAAAAB-gUBAAAAAfsFEAAAAAH8BUAAAAABCAMAAIgNACCRBQEAAAABlgUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAf4FAAAA_gUC_wVAAAAAAQIAAABOACBCAACnDQAgAwAAAE4AIEIAAKcNACBDAACmDQAgATsAANoRADANAwAAvAkAIBoAAMAJACCOBQAAxAkAMI8FAABMABCQBQAAxAkAMJEFAQAAAAGWBQEAuggAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIf4FAAC6Cf4FIv8FQAC8CAAhhwYBALgIACECAAAATgAgOwAApg0AIAIAAACkDQAgOwAApQ0AIAuOBQAAow0AMI8FAACkDQAQkAUAAKMNADCRBQEAuAgAIZYFAQC6CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh_gUAALoJ_gUi_wVAALwIACGHBgEAuAgAIQuOBQAAow0AMI8FAACkDQAQkAUAAKMNADCRBQEAuAgAIZYFAQC6CAAhmAVAALwIACHHBQEAuggAIcgFAQC6CAAh_gUAALoJ_gUi_wVAALwIACGHBgEAuAgAIQeRBQEA4wkAIZYFAQDmCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh_gUAANMM_gUi_wVAAOgJACEIAwAAhg0AIJEFAQDjCQAhlgUBAOYJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACH-BQAA0wz-BSL_BUAA6AkAIQgDAACIDQAgkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAH-BQAAAP4FAv8FQAAAAAEDQgAA2BEAILEGAADZEQAgtwYAANQDACADQgAA1hEAILEGAADXEQAgtwYAANQBACAEQgAAnA0AMLEGAACdDQAwswYAAJ8NACC3BgAAoA0AMARCAACQDQAwsQYAAJENADCzBgAAkw0AILcGAACUDQAwAAAAC0IAALANADBDAAC1DQAwsQYAALENADCyBgAAsg0AMLMGAACzDQAgtAYAALQNADC1BgAAtA0AMLYGAAC0DQAwtwYAALQNADC4BgAAtg0AMLkGAAC3DQAwChwAAPgMACAdAAD5DAAgHgAA-gwAIJEFAQAAAAGABgEAAAABggYBAAAAAYMGAQAAAAGEBgAAAP4FAoUGAQAAAAGGBoAAAAABAgAAAGQAIEIAALsNACADAAAAZAAgQgAAuw0AIEMAALoNACABOwAA1REAMA8bAAC7CQAgHAAAvAkAIB0AAJEJACAeAAC9CQAgjgUAALkJADCPBQAAYgAQkAUAALkJADCRBQEAAAABgAYBAAAAAYEGAQC4CAAhggYBALoIACGDBgEAuggAIYQGAAC6Cf4FIoUGAQC6CAAhhgYAAKUJACACAAAAZAAgOwAAug0AIAIAAAC4DQAgOwAAuQ0AIAuOBQAAtw0AMI8FAAC4DQAQkAUAALcNADCRBQEAuAgAIYAGAQC4CAAhgQYBALgIACGCBgEAuggAIYMGAQC6CAAhhAYAALoJ_gUihQYBALoIACGGBgAApQkAIAuOBQAAtw0AMI8FAAC4DQAQkAUAALcNADCRBQEAuAgAIYAGAQC4CAAhgQYBALgIACGCBgEAuggAIYMGAQC6CAAhhAYAALoJ_gUihQYBALoIACGGBgAApQkAIAeRBQEA4wkAIYAGAQDjCQAhggYBAOYJACGDBgEA5gkAIYQGAADTDP4FIoUGAQDmCQAhhgaAAAAAAQocAADcDAAgHQAA3QwAIB4AAN4MACCRBQEA4wkAIYAGAQDjCQAhggYBAOYJACGDBgEA5gkAIYQGAADTDP4FIoUGAQDmCQAhhgaAAAAAAQocAAD4DAAgHQAA-QwAIB4AAPoMACCRBQEAAAABgAYBAAAAAYIGAQAAAAGDBgEAAAABhAYAAAD-BQKFBgEAAAABhgaAAAAAAQRCAACwDQAwsQYAALENADCzBgAAsw0AILcGAAC0DQAwAAAAAAtCAADCDQAwQwAAxw0AMLEGAADDDQAwsgYAAMQNADCzBgAAxQ0AILQGAADGDQAwtQYAAMYNADC2BgAAxg0AMLcGAADGDQAwuAYAAMgNADC5BgAAyQ0AMAwcAACpDQAgHQAAqg0AIB4AAKsNACCRBQEAAAABygUBAAAAAYIGAQAAAAGEBgAAAP4FAoUGAQAAAAGGBoAAAAABiAYBAAAAAYkGAQAAAAGKBgEAAAABAgAAAFIAIEIAAM0NACADAAAAUgAgQgAAzQ0AIEMAAMwNACABOwAA1BEAMBEbAADCCQAgHAAAvAkAIB0AAJAJACAeAADDCQAgjgUAAMEJADCPBQAAUAAQkAUAAMEJADCRBQEAAAABygUBALgIACGBBgEAuAgAIYIGAQC6CAAhhAYAALoJ_gUihQYBALoIACGGBgAApQkAIIgGAQAAAAGJBgEAuggAIYoGAQC6CAAhAgAAAFIAIDsAAMwNACACAAAAyg0AIDsAAMsNACANjgUAAMkNADCPBQAAyg0AEJAFAADJDQAwkQUBALgIACHKBQEAuAgAIYEGAQC4CAAhggYBALoIACGEBgAAugn-BSKFBgEAuggAIYYGAAClCQAgiAYBALgIACGJBgEAuggAIYoGAQC6CAAhDY4FAADJDQAwjwUAAMoNABCQBQAAyQ0AMJEFAQC4CAAhygUBALgIACGBBgEAuAgAIYIGAQC6CAAhhAYAALoJ_gUihQYBALoIACGGBgAApQkAIIgGAQC4CAAhiQYBALoIACGKBgEAuggAIQmRBQEA4wkAIcoFAQDjCQAhggYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAGIBgEA4wkAIYkGAQDmCQAhigYBAOYJACEMHAAAjQ0AIB0AAI4NACAeAACPDQAgkQUBAOMJACHKBQEA4wkAIYIGAQDmCQAhhAYAANMM_gUihQYBAOYJACGGBoAAAAABiAYBAOMJACGJBgEA5gkAIYoGAQDmCQAhDBwAAKkNACAdAACqDQAgHgAAqw0AIJEFAQAAAAHKBQEAAAABggYBAAAAAYQGAAAA_gUChQYBAAAAAYYGgAAAAAGIBgEAAAABiQYBAAAAAYoGAQAAAAEEQgAAwg0AMLEGAADDDQAwswYAAMUNACC3BgAAxg0AMAAAAAAAAAG0BgAAAI0GAgVCAADMEQAgQwAA0hEAILEGAADNEQAgsgYAANERACC3BgAA1AEAIAVCAADKEQAgQwAAzxEAILEGAADLEQAgsgYAAM4RACC3BgAAFAAgA0IAAMwRACCxBgAAzREAILcGAADUAQAgA0IAAMoRACCxBgAAyxEAILcGAAAUACAAAAAAAAdCAADFEQAgQwAAyBEAILEGAADGEQAgsgYAAMcRACC1BgAAAwAgtgYAAAMAILcGAAAFACADQgAAxREAILEGAADGEQAgtwYAAAUAIAAAAAAAAbQGAAAAkwYCBUIAALoRACBDAADDEQAgsQYAALsRACCyBgAAwhEAILcGAAAUACAHQgAAuBEAIEMAAMARACCxBgAAuREAILIGAAC_EQAgtQYAACgAILYGAAAoACC3BgAA1AEAIAVCAAC2EQAgQwAAvREAILEGAAC3EQAgsgYAALwRACC3BgAA1AEAIANCAAC6EQAgsQYAALsRACC3BgAAFAAgA0IAALgRACCxBgAAuREAILcGAADUAQAgA0IAALYRACCxBgAAtxEAILcGAADUAQAgAAAAAAAFQgAAsREAIEMAALQRACCxBgAAshEAILIGAACzEQAgtwYAAOEGACADQgAAsREAILEGAACyEQAgtwYAAOEGACAAAAAAAAVCAACpEQAgQwAArxEAILEGAACqEQAgsgYAAK4RACC3BgAA1AEAIAVCAACnEQAgQwAArBEAILEGAACoEQAgsgYAAKsRACC3BgAAFAAgA0IAAKkRACCxBgAAqhEAILcGAADUAQAgA0IAAKcRACCxBgAAqBEAILcGAAAUACAAAAAAAAVCAACiEQAgQwAApREAILEGAACjEQAgsgYAAKQRACC3BgAAFAAgA0IAAKIRACCxBgAAoxEAILcGAAAUACAAAAAFQgAAlxEAIEMAAKARACCxBgAAmBEAILIGAACfEQAgtwYAAA0AIAtCAADEDgAwQwAAyQ4AMLEGAADFDgAwsgYAAMYOADCzBgAAxw4AILQGAADIDgAwtQYAAMgOADC2BgAAyA4AMLcGAADIDgAwuAYAAMoOADC5BgAAyw4AMAtCAAC4DgAwQwAAvQ4AMLEGAAC5DgAwsgYAALoOADCzBgAAuw4AILQGAAC8DgAwtQYAALwOADC2BgAAvA4AMLcGAAC8DgAwuAYAAL4OADC5BgAAvw4AMAtCAACvDgAwQwAAsw4AMLEGAACwDgAwsgYAALEOADCzBgAAsg4AILQGAADJCgAwtQYAAMkKADC2BgAAyQoAMLcGAADJCgAwuAYAALQOADC5BgAAzAoAMAtCAACjDgAwQwAAqA4AMLEGAACkDgAwsgYAAKUOADCzBgAApg4AILQGAACnDgAwtQYAAKcOADC2BgAApw4AMLcGAACnDgAwuAYAAKkOADC5BgAAqg4AMAtCAACaDgAwQwAAng4AMLEGAACbDgAwsgYAAJwOADCzBgAAnQ4AILQGAACoCwAwtQYAAKgLADC2BgAAqAsAMLcGAACoCwAwuAYAAJ8OADC5BgAAqwsAMAtCAACODgAwQwAAkw4AMLEGAACPDgAwsgYAAJAOADCzBgAAkQ4AILQGAACSDgAwtQYAAJIOADC2BgAAkg4AMLcGAACSDgAwuAYAAJQOADC5BgAAlQ4AMAoDAADYDQAgkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACNBgKNBhAAAAABjgZAAAAAAQIAAAA_ACBCAACZDgAgAwAAAD8AIEIAAJkOACBDAACYDgAgATsAAJ4RADAPAwAApgkAIAoAAMcJACCOBQAAxQkAMI8FAAA9ABCQBQAAxQkAMJEFAQAAAAGWBQEAuAgAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh-gUAAMYJjQYiiwYBALgIACGNBhAAqQkAIY4GQAC8CAAhAgAAAD8AIDsAAJgOACACAAAAlg4AIDsAAJcOACANjgUAAJUOADCPBQAAlg4AEJAFAACVDgAwkQUBALgIACGWBQEAuAgAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh-gUAAMYJjQYiiwYBALgIACGNBhAAqQkAIY4GQAC8CAAhDY4FAACVDgAwjwUAAJYOABCQBQAAlQ4AMJEFAQC4CAAhlgUBALgIACGYBUAAvAgAIccFAQC6CAAhyAUBALoIACHcBQEAuggAIfoFAADGCY0GIosGAQC4CAAhjQYQAKkJACGOBkAAvAgAIQmRBQEA4wkAIZYFAQDjCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh3AUBAOYJACH6BQAA1Q2NBiKNBhAAlAoAIY4GQADoCQAhCgMAANYNACCRBQEA4wkAIZYFAQDjCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh3AUBAOYJACH6BQAA1Q2NBiKNBhAAlAoAIY4GQADoCQAhCgMAANgNACCRBQEAAAABlgUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAI0GAo0GEAAAAAGOBkAAAAABDgMAALILACAPAADgDQAgkQUBAAAAAZYFAQAAAAGYBUAAAAABrgUBAAAAAccFAQAAAAHIBQEAAAAByQUBAAAAAdwFAQAAAAGNBhAAAAABjwYBAAAAAZAGAQAAAAGRBkAAAAABAgAAADoAIEIAAKIOACADAAAAOgAgQgAAog4AIEMAAKEOACABOwAAnREAMAIAAAA6ACA7AAChDgAgAgAAAKwLACA7AACgDgAgDJEFAQDjCQAhlgUBAOMJACGYBUAA6AkAIa4FAQDmCQAhxwUBAOYJACHIBQEA5gkAIckFAQDmCQAh3AUBAOYJACGNBhAAlAoAIY8GAQDmCQAhkAYBAOMJACGRBkAA6AkAIQ4DAACvCwAgDwAA3w0AIJEFAQDjCQAhlgUBAOMJACGYBUAA6AkAIa4FAQDmCQAhxwUBAOYJACHIBQEA5gkAIckFAQDmCQAh3AUBAOYJACGNBhAAlAoAIY8GAQDmCQAhkAYBAOMJACGRBkAA6AkAIQ4DAACyCwAgDwAA4A0AIJEFAQAAAAGWBQEAAAABmAVAAAAAAa4FAQAAAAHHBQEAAAAByAUBAAAAAckFAQAAAAHcBQEAAAABjQYQAAAAAY8GAQAAAAGQBgEAAAABkQZAAAAAAQ8TAADrDQAgFAAA7A0AIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACTBgL_BUAAAAABkwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGAQAAAAGYBgEAAAABAgAAADUAIEIAAK4OACADAAAANQAgQgAArg4AIEMAAK0OACABOwAAnBEAMBQKAADHCQAgEwAAvAkAIBQAAKYJACCOBQAAyQkAMI8FAAAzABCQBQAAyQkAMJEFAQAAAAGYBUAAvAgAIccFAQC6CAAhyAUBALoIACHcBQEAuggAIfoFAADKCZMGIv8FQAC8CAAhiwYBALgIACGTBgEAuggAIZQGAQC4CAAhlQYQAKkJACGWBhAAtQkAIZcGAQC6CAAhmAYBALoIACECAAAANQAgOwAArQ4AIAIAAACrDgAgOwAArA4AIBGOBQAAqg4AMI8FAACrDgAQkAUAAKoOADCRBQEAuAgAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh-gUAAMoJkwYi_wVAALwIACGLBgEAuAgAIZMGAQC6CAAhlAYBALgIACGVBhAAqQkAIZYGEAC1CQAhlwYBALoIACGYBgEAuggAIRGOBQAAqg4AMI8FAACrDgAQkAUAAKoOADCRBQEAuAgAIZgFQAC8CAAhxwUBALoIACHIBQEAuggAIdwFAQC6CAAh-gUAAMoJkwYi_wVAALwIACGLBgEAuAgAIZMGAQC6CAAhlAYBALgIACGVBhAAqQkAIZYGEAC1CQAhlwYBALoIACGYBgEAuggAIQ2RBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAAOYNkwYi_wVAAOgJACGTBgEA5gkAIZQGAQDjCQAhlQYQAJQKACGWBhAAvgsAIZcGAQDmCQAhmAYBAOYJACEPEwAA6A0AIBQAAOkNACCRBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAAOYNkwYi_wVAAOgJACGTBgEA5gkAIZQGAQDjCQAhlQYQAJQKACGWBhAAvgsAIZcGAQDmCQAhmAYBAOYJACEPEwAA6w0AIBQAAOwNACCRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAfoFAAAAkwYC_wVAAAAAAZMGAQAAAAGUBgEAAAABlQYQAAAAAZYGEAAAAAGXBgEAAAABmAYBAAAAARQDAADfCgAgDgAA8w0AIBEAAOAKACCRBQEAAAABlgUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAHeBQEAAAAB4gUQAAAAAeMFAQAAAAGNBhAAAAABlwYBAAAAAZoGAAAAmgYCmwYQAAAAAZwGAQAAAAGdBgEAAAABngYBAAAAAZ8GQAAAAAECAAAAHgAgQgAAtw4AIAMAAAAeACBCAAC3DgAgQwAAtg4AIAE7AACbEQAwAgAAAB4AIDsAALYOACACAAAAzQoAIDsAALUOACARkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh3gUBAOMJACHiBRAAlAoAIeMFAQDmCQAhjQYQAJQKACGXBgEA5gkAIZoGAADPCpoGIpsGEACUCgAhnAYBAOMJACGdBgEA5gkAIZ4GAQDmCQAhnwZAAOgJACEUAwAA0goAIA4AAPINACARAADTCgAgkQUBAOMJACGWBQEA5gkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh3gUBAOMJACHiBRAAlAoAIeMFAQDmCQAhjQYQAJQKACGXBgEA5gkAIZoGAADPCpoGIpsGEACUCgAhnAYBAOMJACGdBgEA5gkAIZ4GAQDmCQAhnwZAAOgJACEUAwAA3woAIA4AAPMNACARAADgCgAgkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB3gUBAAAAAeIFEAAAAAHjBQEAAAABjQYQAAAAAZcGAQAAAAGaBgAAAJoGApsGEAAAAAGcBgEAAAABnQYBAAAAAZ4GAQAAAAGfBkAAAAABBAMAAPsNACCWBQEAAAABmQVAAAAAAY0GEAAAAAECAAAACQAgQgAAww4AIAMAAAAJACBCAADDDgAgQwAAwg4AIAE7AACaEQAwCgMAAKYJACAKAADHCQAgjgUAAN0JADCPBQAABwAQkAUAAN0JADCWBQEAuAgAIZkFQAC8CAAhiwYBALgIACGNBhAAqQkAIa4GAADcCQAgAgAAAAkAIDsAAMIOACACAAAAwA4AIDsAAMEOACAHjgUAAL8OADCPBQAAwA4AEJAFAAC_DgAwlgUBALgIACGZBUAAvAgAIYsGAQC4CAAhjQYQAKkJACEHjgUAAL8OADCPBQAAwA4AEJAFAAC_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_Q4AIEMAAPwOACABOwAAixEAMA4GAADZCQAgBwAA2gkAIAgAANsJACCOBQAA2AkAMI8FAAALABCQBQAA2AkAMJEFAQAAAAHABQEAuAgAIcoFAQC4CAAhywUgALkIACGGBgAApQkAIKIGAQC4CAAhowYQALUJACGtBgAA1wkAIAIAAAANACA7AAD8DgAgAgAAAPoOACA7AAD7DgAgCo4FAAD5DgAwjwUAAPoOABCQBQAA-Q4AMJEFAQC4CAAhwAUBALgIACHKBQEAuAgAIcsFIAC5CAAhhgYAAKUJACCiBgEAuAgAIaMGEAC1CQAhCo4FAAD5DgAwjwUAAPoOABCQBQAA-Q4AMJEFAQC4CAAhwAUBALgIACHKBQEAuAgAIcsFIAC5CAAhhgYAAKUJACCiBgEAuAgAIaMGEAC1CQAhBpEFAQDjCQAhwAUBAOMJACHKBQEA4wkAIcsFIADlCQAhhgaAAAAAAaMGEAC-CwAhCAYAANwOACAIAADeDgAgkQUBAOMJACHABQEA4wkAIcoFAQDjCQAhywUgAOUJACGGBoAAAAABowYQAL4LACEIBgAA6w4AIAgAAO0OACCRBQEAAAABwAUBAAAAAcoFAQAAAAHLBSAAAAABhgaAAAAAAaMGEAAAAAEEQgAA8g4AMLEGAADzDgAwswYAAPUOACC3BgAA9g4AMAAAAAALQgAAhA8AMEMAAIgPADCxBgAAhQ8AMLIGAACGDwAwswYAAIcPACC0BgAA9g4AMLUGAAD2DgAwtgYAAPYOADC3BgAA9g4AMLgGAACJDwAwuQYAAPkOADAIBwAA7A4AIAgAAO0OACCRBQEAAAABygUBAAAAAcsFIAAAAAGGBoAAAAABogYBAAAAAaMGEAAAAAECAAAADQAgQgAAjA8AIAMAAAANACBCAACMDwAgQwAAiw8AIAE7AACKEQAwAgAAAA0AIDsAAIsPACACAAAA-g4AIDsAAIoPACAGkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhhgaAAAAAAaIGAQDjCQAhowYQAL4LACEIBwAA3Q4AIAgAAN4OACCRBQEA4wkAIcoFAQDjCQAhywUgAOUJACGGBoAAAAABogYBAOMJACGjBhAAvgsAIQgHAADsDgAgCAAA7Q4AIJEFAQAAAAHKBQEAAAABywUgAAAAAYYGgAAAAAGiBgEAAAABowYQAAAAAQRCAACEDwAwsQYAAIUPADCzBgAAhw8AILcGAAD2DgAwAAAAAbQGAAAApgYCC0IAAKIQADBDAACmEAAwsQYAAKMQADCyBgAApBAAMLMGAAClEAAgtAYAALwOADC1BgAAvA4AMLYGAAC8DgAwtwYAALwOADC4BgAApxAAMLkGAAC_DgAwC0IAAJkQADBDAACdEAAwsQYAAJoQADCyBgAAmxAAMLMGAACcEAAgtAYAAMkKADC1BgAAyQoAMLYGAADJCgAwtwYAAMkKADC4BgAAnhAAMLkGAADMCgAwC0IAAJAQADBDAACUEAAwsQYAAJEQADCyBgAAkhAAMLMGAACTEAAgtAYAAKcOADC1BgAApw4AMLYGAACnDgAwtwYAAKcOADC4BgAAlRAAMLkGAACqDgAwC0IAAIcQADBDAACLEAAwsQYAAIgQADCyBgAAiRAAMLMGAACKEAAgtAYAAKcOADC1BgAApw4AMLYGAACnDgAwtwYAAKcOADC4BgAAjBAAMLkGAACqDgAwC0IAAP4PADBDAACCEAAwsQYAAP8PADCyBgAAgBAAMLMGAACBEAAgtAYAAKgLADC1BgAAqAsAMLYGAACoCwAwtwYAAKgLADC4BgAAgxAAMLkGAACrCwAwC0IAAPUPADBDAAD5DwAwsQYAAPYPADCyBgAA9w8AMLMGAAD4DwAgtAYAAJIOADC1BgAAkg4AMLYGAACSDgAwtwYAAJIOADC4BgAA-g8AMLkGAACVDgAwC0IAAOwPADBDAADwDwAwsQYAAO0PADCyBgAA7g8AMLMGAADvDwAgtAYAAKANADC1BgAAoA0AMLYGAACgDQAwtwYAAKANADC4BgAA8Q8AMLkGAACjDQAwC0IAAOMPADBDAADnDwAwsQYAAOQPADCyBgAA5Q8AMLMGAADmDwAgtAYAAO8MADC1BgAA7wwAMLYGAADvDAAwtwYAAO8MADC4BgAA6A8AMLkGAADyDAAwC0IAANoPADBDAADeDwAwsQYAANsPADCyBgAA3A8AMLMGAADdDwAgtAYAALgLADC1BgAAuAsAMLYGAAC4CwAwtwYAALgLADC4BgAA3w8AMLkGAAC7CwAwC0IAANEPADBDAADVDwAwsQYAANIPADCyBgAA0w8AMLMGAADUDwAgtAYAALkKADC1BgAAuQoAMLYGAAC5CgAwtwYAALkKADC4BgAA1g8AMLkGAAC8CgAwC0IAAMUPADBDAADKDwAwsQYAAMYPADCyBgAAxw8AMLMGAADIDwAgtAYAAMkPADC1BgAAyQ8AMLYGAADJDwAwtwYAAMkPADC4BgAAyw8AMLkGAADMDwAwC0IAALwPADBDAADADwAwsQYAAL0PADCyBgAAvg8AMLMGAAC_DwAgtAYAAKUKADC1BgAApQoAMLYGAAClCgAwtwYAAKUKADC4BgAAwQ8AMLkGAACoCgAwC0IAALMPADBDAAC3DwAwsQYAALQPADCyBgAAtQ8AMLMGAAC2DwAgtAYAAMYNADC1BgAAxg0AMLYGAADGDQAwtwYAAMYNADC4BgAAuA8AMLkGAADJDQAwC0IAAKoPADBDAACuDwAwsQYAAKsPADCyBgAArA8AMLMGAACtDwAgtAYAALQNADC1BgAAtA0AMLYGAAC0DQAwtwYAALQNADC4BgAArw8AMLkGAAC3DQAwC0IAAKEPADBDAAClDwAwsQYAAKIPADCyBgAAow8AMLMGAACkDwAgtAYAAPwKADC1BgAA_AoAMLYGAAD8CgAwtwYAAPwKADC4BgAApg8AMLkGAAD_CgAwBw8AAIoKACAxAACLCgAgkQUBAAAAAa4FAQAAAAGvBUAAAAABsAWAAAAAAbEFQAAAAAECAAAAlQEAIEIAAKkPACADAAAAlQEAIEIAAKkPACBDAACoDwAgATsAAIkRADACAAAAlQEAIDsAAKgPACACAAAAgAsAIDsAAKcPACAFkQUBAOMJACGuBQEA4wkAIa8FQADoCQAhsAWAAAAAAbEFQADoCQAhBw8AAPsJACAxAAD8CQAgkQUBAOMJACGuBQEA4wkAIa8FQADoCQAhsAWAAAAAAbEFQADoCQAhBw8AAIoKACAxAACLCgAgkQUBAAAAAa4FAQAAAAGvBUAAAAABsAWAAAAAAbEFQAAAAAEKGwAA9wwAIB0AAPkMACAeAAD6DAAgkQUBAAAAAYAGAQAAAAGBBgEAAAABggYBAAAAAYMGAQAAAAGEBgAAAP4FAoYGgAAAAAECAAAAZAAgQgAAsg8AIAMAAABkACBCAACyDwAgQwAAsQ8AIAE7AACIEQAwAgAAAGQAIDsAALEPACACAAAAuA0AIDsAALAPACAHkQUBAOMJACGABgEA4wkAIYEGAQDjCQAhggYBAOYJACGDBgEA5gkAIYQGAADTDP4FIoYGgAAAAAEKGwAA2wwAIB0AAN0MACAeAADeDAAgkQUBAOMJACGABgEA4wkAIYEGAQDjCQAhggYBAOYJACGDBgEA5gkAIYQGAADTDP4FIoYGgAAAAAEKGwAA9wwAIB0AAPkMACAeAAD6DAAgkQUBAAAAAYAGAQAAAAGBBgEAAAABggYBAAAAAYMGAQAAAAGEBgAAAP4FAoYGgAAAAAEMGwAAqA0AIB0AAKoNACAeAACrDQAgkQUBAAAAAcoFAQAAAAGBBgEAAAABggYBAAAAAYQGAAAA_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_gUAANMM_gUi_wVAAOgJACEIIQAA1gwAIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAH5BQEAAAAB_gUAAAD-BQL_BUAAAAABCBoAAIcNACCRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB_gUAAAD-BQL_BUAAAAABhwYBAAAAAQIAAABOACBCAAD0DwAgAwAAAE4AIEIAAPQPACBDAADzDwAgATsAAIERADACAAAATgAgOwAA8w8AIAIAAACkDQAgOwAA8g8AIAeRBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIf4FAADTDP4FIv8FQADoCQAhhwYBAOMJACEIGgAAhQ0AIJEFAQDjCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh_gUAANMM_gUi_wVAAOgJACGHBgEA4wkAIQgaAACHDQAgkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAf4FAAAA_gUC_wVAAAAAAYcGAQAAAAEKCgAA2Q0AIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACNBgKLBgEAAAABjQYQAAAAAY4GQAAAAAECAAAAPwAgQgAA_Q8AIAMAAAA_ACBCAAD9DwAgQwAA_A8AIAE7AACAEQAwAgAAAD8AIDsAAPwPACACAAAAlg4AIDsAAPsPACAJkQUBAOMJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACHcBQEA5gkAIfoFAADVDY0GIosGAQDjCQAhjQYQAJQKACGOBkAA6AkAIQoKAADXDQAgkQUBAOMJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACHcBQEA5gkAIfoFAADVDY0GIosGAQDjCQAhjQYQAJQKACGOBkAA6AkAIQoKAADZDQAgkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAI0GAosGAQAAAAGNBhAAAAABjgZAAAAAAQ4KAACzCwAgDwAA4A0AIJEFAQAAAAGYBUAAAAABrgUBAAAAAccFAQAAAAHIBQEAAAAByQUBAAAAAdwFAQAAAAGLBgEAAAABjQYQAAAAAY8GAQAAAAGQBgEAAAABkQZAAAAAAQIAAAA6ACBCAACGEAAgAwAAADoAIEIAAIYQACBDAACFEAAgATsAAP8QADACAAAAOgAgOwAAhRAAIAIAAACsCwAgOwAAhBAAIAyRBQEA4wkAIZgFQADoCQAhrgUBAOYJACHHBQEA5gkAIcgFAQDmCQAhyQUBAOYJACHcBQEA5gkAIYsGAQDjCQAhjQYQAJQKACGPBgEA5gkAIZAGAQDjCQAhkQZAAOgJACEOCgAAsAsAIA8AAN8NACCRBQEA4wkAIZgFQADoCQAhrgUBAOYJACHHBQEA5gkAIcgFAQDmCQAhyQUBAOYJACHcBQEA5gkAIYsGAQDjCQAhjQYQAJQKACGPBgEA5gkAIZAGAQDjCQAhkQZAAOgJACEOCgAAswsAIA8AAOANACCRBQEAAAABmAVAAAAAAa4FAQAAAAHHBQEAAAAByAUBAAAAAckFAQAAAAHcBQEAAAABiwYBAAAAAY0GEAAAAAGPBgEAAAABkAYBAAAAAZEGQAAAAAEPCgAA6g0AIBMAAOsNACCRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAfoFAAAAkwYC_wVAAAAAAYsGAQAAAAGTBgEAAAABlQYQAAAAAZYGEAAAAAGXBgEAAAABmAYBAAAAAQIAAAA1ACBCAACPEAAgAwAAADUAIEIAAI8QACBDAACOEAAgATsAAP4QADACAAAANQAgOwAAjhAAIAIAAACrDgAgOwAAjRAAIA2RBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAAOYNkwYi_wVAAOgJACGLBgEA4wkAIZMGAQDmCQAhlQYQAJQKACGWBhAAvgsAIZcGAQDmCQAhmAYBAOYJACEPCgAA5w0AIBMAAOgNACCRBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh-gUAAOYNkwYi_wVAAOgJACGLBgEA4wkAIZMGAQDmCQAhlQYQAJQKACGWBhAAvgsAIZcGAQDmCQAhmAYBAOYJACEPCgAA6g0AIBMAAOsNACCRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAfoFAAAAkwYC_wVAAAAAAYsGAQAAAAGTBgEAAAABlQYQAAAAAZYGEAAAAAGXBgEAAAABmAYBAAAAAQ8KAADqDQAgFAAA7A0AIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACTBgL_BUAAAAABiwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGAQAAAAGYBgEAAAABAgAAADUAIEIAAJgQACADAAAANQAgQgAAmBAAIEMAAJcQACABOwAA_RAAMAIAAAA1ACA7AACXEAAgAgAAAKsOACA7AACWEAAgDZEFAQDjCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh3AUBAOYJACH6BQAA5g2TBiL_BUAA6AkAIYsGAQDjCQAhlAYBAOMJACGVBhAAlAoAIZYGEAC-CwAhlwYBAOYJACGYBgEA5gkAIQ8KAADnDQAgFAAA6Q0AIJEFAQDjCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh3AUBAOYJACH6BQAA5g2TBiL_BUAA6AkAIYsGAQDjCQAhlAYBAOMJACGVBhAAlAoAIZYGEAC-CwAhlwYBAOYJACGYBgEA5gkAIQ8KAADqDQAgFAAA7A0AIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACTBgL_BUAAAAABiwYBAAAAAZQGAQAAAAGVBhAAAAABlgYQAAAAAZcGAQAAAAGYBgEAAAABFAoAAN4KACAOAADzDQAgEQAA4AoAIJEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB3gUBAAAAAeIFEAAAAAHjBQEAAAABiwYBAAAAAY0GEAAAAAGXBgEAAAABmgYAAACaBgKbBhAAAAABnAYBAAAAAZ0GAQAAAAGeBgEAAAABnwZAAAAAAQIAAAAeACBCAAChEAAgAwAAAB4AIEIAAKEQACBDAACgEAAgATsAAPwQADACAAAAHgAgOwAAoBAAIAIAAADNCgAgOwAAnxAAIBGRBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh3gUBAOMJACHiBRAAlAoAIeMFAQDmCQAhiwYBAOMJACGNBhAAlAoAIZcGAQDmCQAhmgYAAM8KmgYimwYQAJQKACGcBgEA4wkAIZ0GAQDmCQAhngYBAOYJACGfBkAA6AkAIRQKAADRCgAgDgAA8g0AIBEAANMKACCRBQEA4wkAIZgFQADoCQAhxwUBAOYJACHIBQEA5gkAIdwFAQDmCQAh3gUBAOMJACHiBRAAlAoAIeMFAQDmCQAhiwYBAOMJACGNBhAAlAoAIZcGAQDmCQAhmgYAAM8KmgYimwYQAJQKACGcBgEA4wkAIZ0GAQDmCQAhngYBAOYJACGfBkAA6AkAIRQKAADeCgAgDgAA8w0AIBEAAOAKACCRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAd4FAQAAAAHiBRAAAAAB4wUBAAAAAYsGAQAAAAGNBhAAAAABlwYBAAAAAZoGAAAAmgYCmwYQAAAAAZwGAQAAAAGdBgEAAAABngYBAAAAAZ8GQAAAAAEECgAA_A0AIJkFQAAAAAGLBgEAAAABjQYQAAAAAQIAAAAJACBCAACqEAAgAwAAAAkAIEIAAKoQACBDAACpEAAgATsAAPsQADACAAAACQAgOwAAqRAAIAIAAADADgAgOwAAqBAAIAOZBUAA6AkAIYsGAQDjCQAhjQYQAJQKACEECgAA-g0AIJkFQADoCQAhiwYBAOMJACGNBhAAlAoAIQQKAAD8DQAgmQVAAAAAAYsGAQAAAAGNBhAAAAABBEIAAKIQADCxBgAAoxAAMLMGAAClEAAgtwYAALwOADAEQgAAmRAAMLEGAACaEAAwswYAAJwQACC3BgAAyQoAMARCAACQEAAwsQYAAJEQADCzBgAAkxAAILcGAACnDgAwBEIAAIcQADCxBgAAiBAAMLMGAACKEAAgtwYAAKcOADAEQgAA_g8AMLEGAAD_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_EAAgJQAAwBAAIC0AAMEQACAuAADPDQAgLwAAvQ0AIDIAAMIQACCmBgAA3wkAIAAGJAAA5xAAICUAAMAQACArAADoEAAgLAAA6RAAIPUFAADfCQAg9gUAAN8JACAABiYAAOMQACAqAADkEAAgwwUAAN8JACDHBQAA3wkAIMgFAADfCQAg7wUAAN8JACAGJgAA4xAAICgAAOQQACDHBQAA3wkAIMgFAADfCQAg6QUAAN8JACDqBQAA3wkAIAEjAADIDAAgAAAHGwAA6xAAIBwAAOEQACAdAAC_EAAgHgAA7BAAIIIGAADfCQAggwYAAN8JACCFBgAA3wkAIAEgAAC9DQAgAAgbAADuEAAgHAAA4RAAIB0AAL4QACAeAADvEAAgggYAAN8JACCFBgAA3wkAIIkGAADfCQAgigYAAN8JACABGgAAzw0AIAAHCQAA9BAAIAsAAPUQACAMAAC6EAAgDQAA5AoAIBUAALsQACAWAAC8EAAgFwAAvRAAIAERAACuCgAgDAMAAOEQACAKAADwEAAgDgAA8xAAIBEAAK4KACCWBQAA3wkAIMcFAADfCQAgyAUAAN8JACDcBQAA3wkAIOMFAADfCQAglwYAAN8JACCdBgAA3wkAIJ4GAADfCQAgBg0AAOQKACAQAADlCgAgzwUAAN8JACDQBQAA3wkAINEFAADfCQAg0gUAAN8JACAEBgAA9hAAIAcAAPcQACAIAAD4EAAgowYAAN8JACAAAQQAAP8OACABBAAA_w4AIAANkQUBAAAAAZYFAQAAAAGYBUAAAAABrwVAAAAAAccFAQAAAAHIBQEAAAAB1wUBAAAAAdgFAQAAAAHZBQEAAAAB2gUBAAAAAdsFAQAAAAHcBQEAAAAB3QWAAAAAAQSRBQEAAAABmAVAAAAAAa4FAQAAAAHUBQEAAAABA5kFQAAAAAGLBgEAAAABjQYQAAAAARGRBQEAAAABmAVAAAAAAccFAQAAAAHIBQEAAAAB3AUBAAAAAd4FAQAAAAHiBRAAAAAB4wUBAAAAAYsGAQAAAAGNBhAAAAABlwYBAAAAAZoGAAAAmgYCmwYQAAAAAZwGAQAAAAGdBgEAAAABngYBAAAAAZ8GQAAAAAENkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAJMGAv8FQAAAAAGLBgEAAAABlAYBAAAAAZUGEAAAAAGWBhAAAAABlwYBAAAAAZgGAQAAAAENkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAdwFAQAAAAH6BQAAAJMGAv8FQAAAAAGLBgEAAAABkwYBAAAAAZUGEAAAAAGWBhAAAAABlwYBAAAAAZgGAQAAAAEMkQUBAAAAAZgFQAAAAAGuBQEAAAABxwUBAAAAAcgFAQAAAAHJBQEAAAAB3AUBAAAAAYsGAQAAAAGNBhAAAAABjwYBAAAAAZAGAQAAAAGRBkAAAAABCZEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACNBgKLBgEAAAABjQYQAAAAAY4GQAAAAAEHkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAf4FAAAA_gUC_wVAAAAAAYcGAQAAAAEHkQUBAAAAAZgFQAAAAAHHBQEAAAAByAUBAAAAAfkFAQAAAAH-BQAAAP4FAv8FQAAAAAEIkQUBAAAAAZgFQAAAAAGuBQEAAAAB5AUBAAAAAfEFQAAAAAHyBSAAAAAB8wUQAAAAAfQFEAAAAAENkQUBAAAAAZgFQAAAAAGtBUAAAAABrgUBAAAAAccFAQAAAAHIBQEAAAAByQUBAAAAAd4FAQAAAAHfBRAAAAAB4AUBAAAAAeEFEAAAAAHiBRAAAAAB4wUBAAAAAQ2RBQEAAAABmAVAAAAAAa8FQAAAAAHHBQEAAAAByAUBAAAAAdYFAQAAAAHXBQEAAAAB2AUBAAAAAdkFAQAAAAHaBQEAAAAB2wUBAAAAAdwFAQAAAAHdBYAAAAABDZEFAQAAAAGYBUAAAAABrgUBAAAAAcAFAQAAAAHBBRAAAAABwgUBAAAAAcMFAQAAAAHEBQEAAAABxQUBAAAAAcYFQAAAAAHHBQEAAAAByAUBAAAAAckFAQAAAAEJkQUBAAAAAcoFAQAAAAGBBgEAAAABggYBAAAAAYQGAAAA_gUChgaAAAAAAYgGAQAAAAGJBgEAAAABigYBAAAAAQeRBQEAAAABgAYBAAAAAYEGAQAAAAGCBgEAAAABgwYBAAAAAYQGAAAA_gUChgaAAAAAAQWRBQEAAAABrgUBAAAAAa8FQAAAAAGwBYAAAAABsQVAAAAAAQaRBQEAAAABygUBAAAAAcsFIAAAAAGGBoAAAAABogYBAAAAAaMGEAAAAAEGkQUBAAAAAcAFAQAAAAHKBQEAAAABywUgAAAAAYYGgAAAAAGjBhAAAAABApEFAQAAAAHKBQEAAAABAgAAAIUCACBCAACMEQAgA5EFAQAAAAHKBQEAAAABywUgAAAAAQIAAADsAQAgQgAAjhEAIAKRBQEAAAABoQYBAAAAAQMAAACIAgAgQgAAjBEAIEMAAJMRACAEAAAAiAIAIDsAAJMRACCRBQEA4wkAIcoFAQDjCQAhApEFAQDjCQAhygUBAOMJACEDAAAA7wEAIEIAAI4RACBDAACWEQAgBQAAAO8BACA7AACWEQAgkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhA5EFAQDjCQAhygUBAOMJACHLBSAA5QkAIQkGAADrDgAgBwAA7A4AIJEFAQAAAAHABQEAAAABygUBAAAAAcsFIAAAAAGGBoAAAAABogYBAAAAAaMGEAAAAAECAAAADQAgQgAAlxEAIAKZBUAAAAABjQYQAAAAAQOWBQEAAAABmQVAAAAAAY0GEAAAAAERkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB3gUBAAAAAeIFEAAAAAHjBQEAAAABjQYQAAAAAZcGAQAAAAGaBgAAAJoGApsGEAAAAAGcBgEAAAABnQYBAAAAAZ4GAQAAAAGfBkAAAAABDZEFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAHcBQEAAAAB-gUAAACTBgL_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_gUC_wVAAAAAAQaRBQEAAAABmAVAAAAAAdwFAQAAAAH6BQEAAAAB-wUQAAAAAfwFQAAAAAEDAAAAKAAgQgAA1hEAIEMAAN4RACAXAAAAKAAgDAAAkg8AIA0AAJMPACAQAACbDwAgEQAAnQ8AIBYAAJYPACAXAACXDwAgGAAAlA8AIBkAAJUPACAfAACYDwAgIgAAmQ8AICUAAJoPACAtAACcDwAgLwAAnw8AIDIAAKAPACA7AADeEQAgkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhqgUAAJEPpgYiygUBAOMJACGkBgEA4wkAIaYGAQDmCQAhFQwAAJIPACANAACTDwAgEAAAmw8AIBEAAJ0PACAWAACWDwAgFwAAlw8AIBgAAJQPACAZAACVDwAgHwAAmA8AICIAAJkPACAlAACaDwAgLQAAnA8AIC8AAJ8PACAyAACgDwAgkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhqgUAAJEPpgYiygUBAOMJACGkBgEA4wkAIaYGAQDmCQAhAwAAANcDACBCAADYEQAgQwAA4REAIAUAAADXAwAgOwAA4REAIJEFAQDjCQAhygUBAOMJACHLBSAA5QkAIQORBQEA4wkAIcoFAQDjCQAhywUgAOUJACEVDAAAqxAAIA0AAKwQACAQAAC0EAAgEQAAthAAIBYAAK8QACAXAACwEAAgGAAArRAAIBkAAK4QACAiAACyEAAgJQAAsxAAIC0AALUQACAuAAC3EAAgLwAAuBAAIDIAALkQACCRBQEAAAABmAVAAAAAAZkFQAAAAAGqBQAAAKYGAsoFAQAAAAGkBgEAAAABpgYBAAAAAQIAAADUAQAgQgAA4hEAIA0bAACoDQAgHAAAqQ0AIB4AAKsNACCRBQEAAAABygUBAAAAAYEGAQAAAAGCBgEAAAABhAYAAAD-BQKFBgEAAAABhgaAAAAAAYgGAQAAAAGJBgEAAAABigYBAAAAAQIAAABSACBCAADkEQAgAwAAACgAIEIAAOIRACBDAADoEQAgFwAAACgAIAwAAJIPACANAACTDwAgEAAAmw8AIBEAAJ0PACAWAACWDwAgFwAAlw8AIBgAAJQPACAZAACVDwAgIgAAmQ8AICUAAJoPACAtAACcDwAgLgAAng8AIC8AAJ8PACAyAACgDwAgOwAA6BEAIJEFAQDjCQAhmAVAAOgJACGZBUAA6AkAIaoFAACRD6YGIsoFAQDjCQAhpAYBAOMJACGmBgEA5gkAIRUMAACSDwAgDQAAkw8AIBAAAJsPACARAACdDwAgFgAAlg8AIBcAAJcPACAYAACUDwAgGQAAlQ8AICIAAJkPACAlAACaDwAgLQAAnA8AIC4AAJ4PACAvAACfDwAgMgAAoA8AIJEFAQDjCQAhmAVAAOgJACGZBUAA6AkAIaoFAACRD6YGIsoFAQDjCQAhpAYBAOMJACGmBgEA5gkAIQMAAABQACBCAADkEQAgQwAA6xEAIA8AAABQACAbAACMDQAgHAAAjQ0AIB4AAI8NACA7AADrEQAgkQUBAOMJACHKBQEA4wkAIYEGAQDjCQAhggYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAGIBgEA4wkAIYkGAQDmCQAhigYBAOYJACENGwAAjA0AIBwAAI0NACAeAACPDQAgkQUBAOMJACHKBQEA4wkAIYEGAQDjCQAhggYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAGIBgEA4wkAIYkGAQDmCQAhigYBAOYJACENGwAAqA0AIBwAAKkNACAdAACqDQAgkQUBAAAAAcoFAQAAAAGBBgEAAAABggYBAAAAAYQGAAAA_gUChQYBAAAAAYYGgAAAAAGIBgEAAAABiQYBAAAAAYoGAQAAAAECAAAAUgAgQgAA7BEAIAMAAABQACBCAADsEQAgQwAA8BEAIA8AAABQACAbAACMDQAgHAAAjQ0AIB0AAI4NACA7AADwEQAgkQUBAOMJACHKBQEA4wkAIYEGAQDjCQAhggYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAGIBgEA4wkAIYkGAQDmCQAhigYBAOYJACENGwAAjA0AIBwAAI0NACAdAACODQAgkQUBAOMJACHKBQEA4wkAIYEGAQDjCQAhggYBAOYJACGEBgAA0wz-BSKFBgEA5gkAIYYGgAAAAAGIBgEA4wkAIYkGAQDmCQAhigYBAOYJACEVDAAAqxAAIA0AAKwQACAQAAC0EAAgEQAAthAAIBYAAK8QACAXAACwEAAgGAAArRAAIBkAAK4QACAfAACxEAAgIgAAshAAICUAALMQACAtAAC1EAAgLgAAtxAAIDIAALkQACCRBQEAAAABmAVAAAAAAZkFQAAAAAGqBQAAAKYGAsoFAQAAAAGkBgEAAAABpgYBAAAAAQIAAADUAQAgQgAA8REAIAORBQEAAAABygUBAAAAAcsFIAAAAAECAAAA7QMAIEIAAPMRACAHkQUBAAAAAZYFAQAAAAGYBUAAAAABxwUBAAAAAcgFAQAAAAH-BQAAAP4FAv8FQAAAAAEGkQUBAAAAAZgFQAAAAAHcBQEAAAAB-gUBAAAAAfsFEAAAAAH8BUAAAAABAwAAACgAIEIAAPERACBDAAD5EQAgFwAAACgAIAwAAJIPACANAACTDwAgEAAAmw8AIBEAAJ0PACAWAACWDwAgFwAAlw8AIBgAAJQPACAZAACVDwAgHwAAmA8AICIAAJkPACAlAACaDwAgLQAAnA8AIC4AAJ4PACAyAACgDwAgOwAA-REAIJEFAQDjCQAhmAVAAOgJACGZBUAA6AkAIaoFAACRD6YGIsoFAQDjCQAhpAYBAOMJACGmBgEA5gkAIRUMAACSDwAgDQAAkw8AIBAAAJsPACARAACdDwAgFgAAlg8AIBcAAJcPACAYAACUDwAgGQAAlQ8AIB8AAJgPACAiAACZDwAgJQAAmg8AIC0AAJwPACAuAACeDwAgMgAAoA8AIJEFAQDjCQAhmAVAAOgJACGZBUAA6AkAIaoFAACRD6YGIsoFAQDjCQAhpAYBAOMJACGmBgEA5gkAIQMAAADwAwAgQgAA8xEAIEMAAPwRACAFAAAA8AMAIDsAAPwRACCRBQEA4wkAIcoFAQDjCQAhywUgAOUJACEDkQUBAOMJACHKBQEA4wkAIcsFIADlCQAhFQwAAKsQACANAACsEAAgEAAAtBAAIBEAALYQACAWAACvEAAgFwAAsBAAIBgAAK0QACAZAACuEAAgHwAAsRAAICUAALMQACAtAAC1EAAgLgAAtxAAIC8AALgQACAyAAC5EAAgkQUBAAAAAZgFQAAAAAGZBUAAAAABqgUAAACmBgLKBQEAAAABpAYBAAAAAaYGAQAAAAECAAAA1AEAIEIAAP0RACALGwAA9wwAIBwAAPgMACAeAAD6DAAgkQUBAAAAAYAGAQAAAAGBBgEAAAABggYBAAAAAYMGAQAAAAGEBgAAAP4FAoUGAQAAAAGGBoAAAAABAgAAAGQAIEIAAP8RACADAAAAKAAgQgAA_REAIEMAAIMSACAXAAAAKAAgDAAAkg8AIA0AAJMPACAQAACbDwAgEQAAnQ8AIBYAAJYPACAXAACXDwAgGAAAlA8AIBkAAJUPACAfAACYDwAgJQAAmg8AIC0AAJwPACAuAACeDwAgLwAAnw8AIDIAAKAPACA7AACDEgAgkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhqgUAAJEPpgYiygUBAOMJACGkBgEA4wkAIaYGAQDmCQAhFQwAAJIPACANAACTDwAgEAAAmw8AIBEAAJ0PACAWAACWDwAgFwAAlw8AIBgAAJQPACAZAACVDwAgHwAAmA8AICUAAJoPACAtAACcDwAgLgAAng8AIC8AAJ8PACAyAACgDwAgkQUBAOMJACGYBUAA6AkAIZkFQADoCQAhqgUAAJEPpgYiygUBAOMJACGkBgEA4wkAIaYGAQDmCQAhAwAAAGIAIEIAAP8RACBDAACGEgAgDQAAAGIAIBsAANsMACAcAADcDAAgHgAA3gwAIDsAAIYSACCRBQEA4wkAIYAGAQDjCQAhgQYBAOMJACGCBgEA5gkAIYMGAQDmCQAhhAYAANMM_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_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_RIAIAORBQEAAAABygUBAAAAAcsFIAAAAAECAAAA-gYAIEIAAP8SACAVDAAAqxAAIA0AAKwQACAQAAC0EAAgFgAArxAAIBcAALAQACAYAACtEAAgGQAArhAAIB8AALEQACAiAACyEAAgJQAAsxAAIC0AALUQACAuAAC3EAAgLwAAuBAAIDIAALkQACCRBQEAAAABmAVAAAAAAZkFQAAAAAGqBQAAAKYGAsoFAQAAAAGkBgEAAAABpgYBAAAAAQIAAADUAQAgQgAAgRMAIAMAAAADACBCAAD7EgAgQwAAhRMAIBcAAAADACADAADwCgAgEAAA9goAIBYAAPMKACAlAADyCgAgMgAA9woAIDMAAPEKACA1AAD0CgAgOwAAhRMAIJEFAQDjCQAhlgUBAOMJACGYBUAA6AkAIa8FQADoCQAhxwUBAOYJACHIBQEA5gkAIdYFAQDjCQAh1wUBAOYJACHYBQEA5gkAIdkFAQDmCQAh2gUBAOYJACHbBQEA5gkAIdwFAQDmCQAh3QWAAAAAARUDAADwCgAgEAAA9goAIBYAAPMKACAlAADyCgAgMgAA9woAIDMAAPEKACA1AAD0CgAgkQUBAOMJACGWBQEA4wkAIZgFQADoCQAhrwVAAOgJACHHBQEA5gkAIcgFAQDmCQAh1gUBAOMJACHXBQEA5gkAIdgFAQDmCQAh2QUBAOYJACHaBQEA5gkAIdsFAQDmCQAh3AUBAOYJACHdBYAAAAABAwAAABwAIEIAAP0SACBDAACIEwAgFwAAABwAIAMAANIKACAKAADRCgAgDgAA8g0AIDsAAIgTACCRBQEA4wkAIZYFAQDmCQAhmAVAAOgJACHHBQEA5gkAIcgFAQDmCQAh3AUBAOYJACHeBQEA4wkAIeIFEACUCgAh4wUBAOYJACGLBgEA4wkAIY0GEACUCgAhlwYBAOYJACGaBgAAzwqaBiKbBhAAlAoAIZwGAQDjCQAhnQYBAOYJACGeBgEA5gkAIZ8GQADoCQAhFQMAANIKACAKAADRCgAgDgAA8g0AIJEFAQDjCQAhlgUBAOYJACGYBUAA6AkAIccFAQDmCQAhyAUBAOYJACHcBQEA5gkAId4FAQDjCQAh4gUQAJQKACHjBQEA5gkAIYsGAQDjCQAhjQYQAJQKACGXBgEA5gkAIZoGAADPCpoGIpsGEACUCgAhnAYBAOMJACGdBgEA5gkAIZ4GAQDmCQAhnwZAAOgJACEDAAAA_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_RBQImACYFBQDoAUgA6wFJAOwBigEA6QGLAQDqAQAAAAAABQUA6AFIAOsBSQDsAYoBAOkBiwEA6gEBJgAmASYAJgUFAPEBSAD0AUkA9QGKAQDyAYsBAPMBAAAAAAAFBQDxAUgA9AFJAPUBigEA8gGLAQDzAQInACkp-QUrAicAKSn_BSsFBQD6AUgA_QFJAP4BigEA-wGLAQD8AQAAAAAABQUA-gFIAP0BSQD-AYoBAPsBiwEA_AEBJgAmASYAJgUFAIMCSACGAkkAhwKKAQCEAosBAIUCAAAAAAAFBQCDAkgAhgJJAIcCigEAhAKLAQCFAgMDAAMOAA4PpwYCAwMAAw4ADg-tBgIFBQCMAkgAjwJJAJACigEAjQKLAQCOAgAAAAAABQUAjAJIAI8CSQCQAooBAI0CiwEAjgICAwADMwABAgMAAzMAAQMFAJUCSACWAkkAlwIAAAADBQCVAkgAlgJJAJcCAg8AAjQAAQIPAAI0AAEDBQCcAkgAnQJJAJ4CAAAAAwUAnAJIAJ0CSQCeAgAAAwUAowJIAKQCSQClAgAAAAMFAKMCSACkAkkApQIAAAMFAKoCSACrAkkArAIAAAADBQCqAkgAqwJJAKwCBAMAAwYAEg-eBwISnQcNBAMAAwYAEg-lBwISpAcNBQUAsQJIALQCSQC1AooBALICiwEAswIAAAAAAAUFALECSAC0AkkAtQKKAQCyAosBALMCAAAAAwUAuwJIALwCSQC9AgAAAAMFALsCSAC8AkkAvQICAwADDwACAgMAAw8AAgMFAMICSADDAkkAxAIAAAADBQDCAkgAwwJJAMQCATAALwEwAC8FBQDJAkgAzAJJAM0CigEAygKLAQDLAgAAAAAABQUAyQJIAMwCSQDNAooBAMoCiwEAywIAAAADBQDTAkgA1AJJANUCAAAAAwUA0wJIANQCSQDVAgAAAAMFANsCSADcAkkA3QIAAAADBQDbAkgA3AJJAN0CNgIBN70BATjAAQE5wQEBOsIBATzEAQE9xgE2PscBNz_JAQFAywE2QcwBOETNAQFFzgEBRs8BNkrSATlL0wE9TNUBA03WAQNO2AEDT9kBA1DaAQNR3AEDUt4BNlPfAT5U4QEDVeMBNlbkAT9X5QEDWOYBA1nnATZa6gFAW-sBRFztAQdd7gEHXvEBB1_yAQdg8wEHYfUBB2L3ATZj-AFFZPoBB2X8ATZm_QFGZ_4BB2j_AQdpgAI2aoMCR2uEAktshgIJbYcCCW6KAglviwIJcIwCCXGOAglykAI2c5ECTHSTAgl1lQI2dpYCTXeXAgl4mAIJeZkCNnqcAk57nQJSfJ4CBn2fAgZ-oAIGf6ECBoABogIGgQGkAgaCAaYCNoMBpwJThAGpAgaFAasCNoYBrAJUhwGtAgaIAa4CBokBrwI2jAGyAlWNAbMCW44BtAIFjwG1AgWQAbYCBZEBtwIFkgG4AgWTAboCBZQBvAI2lQG9AlyWAb8CBZcBwQI2mAHCAl2ZAcMCBZoBxAIFmwHFAjacAcgCXp0ByQJingHKAgyfAcsCDKABzAIMoQHNAgyiAc4CDKMB0AIMpAHSAjalAdMCY6YB1QIMpwHXAjaoAdgCZKkB2QIMqgHaAgyrAdsCNqwB3gJlrQHfAmuuAeACBK8B4QIEsAHiAgSxAeMCBLIB5AIEswHmAgS0AegCNrUB6QJstgHrAgS3Ae0CNrgB7gJtuQHvAgS6AfACBLsB8QI2vAH0Am69AfUCdL4B9gINvwH3Ag3AAfgCDcEB-QINwgH6Ag3DAfwCDcQB_gI2xQH_AnXGAYIDDccBhAM2yAGFA3bJAYcDDcoBiAMNywGJAzbMAYwDd80BjQN9zgGOAxXPAY8DFdABkAMV0QGRAxXSAZIDFdMBlAMV1AGWAzbVAZcDftYBmgMV1wGcAzbYAZ0Df9kBnwMV2gGgAxXbAaEDNtwBpAOAAd0BpQOGAd4BpgMW3wGnAxbgAagDFuEBqQMW4gGqAxbjAawDFuQBrgM25QGvA4cB5gGyAxbnAbQDNugBtQOIAekBtwMW6gG4AxbrAbkDNuwBvAOJAe0BvQOPAe4BvgMX7wG_AxfwAcADF_EBwQMX8gHCAxfzAcQDF_QBxgM29QHHA5AB9gHJAxf3AcsDNvgBzAORAfkBzQMX-gHOAxf7Ac8DNvwB0gOSAf0B0wOYAf4B1QMb_wHWAxuAAtkDG4EC2gMbggLbAxuDAt0DG4QC3wM2hQLgA5kBhgLiAxuHAuQDNogC5QOaAYkC5gMbigLnAxuLAugDNowC6wObAY0C7AOfAY4C7gMhjwLvAyGQAvIDIZEC8wMhkgL0AyGTAvYDIZQC-AM2lQL5A6ABlgL7AyGXAv0DNpgC_gOhAZkC_wMhmgKABCGbAoEENpwChASiAZ0ChQSmAZ4ChgQanwKHBBqgAogEGqECiQQaogKKBBqjAowEGqQCjgQ2pQKPBKcBpgKSBBqnApQENqgClQSoAakClwQaqgKYBBqrApkENqwCnASpAa0CnQStAa4CngQZrwKfBBmwAqAEGbECoQQZsgKiBBmzAqQEGbQCpgQ2tQKnBK4BtgKqBBm3AqwENrgCrQSvAbkCrwQZugKwBBm7ArEENrwCtASwAb0CtQS0Ab4CtgQdvwK3BB3AArgEHcECuQQdwgK6BB3DArwEHcQCvgQ2xQK_BLUBxgLBBB3HAsMENsgCxAS2AckCxQQdygLGBB3LAscENswCygS3Ac0CywS9Ac4CzAQgzwLNBCDQAs4EINECzwQg0gLQBCDTAtIEINQC1AQ21QLVBL4B1gLYBCDXAtoENtgC2wS_AdkC3QQg2gLeBCDbAt8ENtwC4gTAAd0C4wTEAd4C5AQf3wLlBB_gAuYEH-EC5wQf4gLoBB_jAuoEH-QC7AQ25QLtBMUB5gLwBB_nAvIENugC8wTGAekC9QQf6gL2BB_rAvcENuwC-gTHAe0C-wTLAe4C_AQj7wL9BCPwAv4EI_EC_wQj8gKABSPzAoIFI_QChAU29QKFBcwB9gKHBSP3AokFNvgCigXNAfkCiwUj-gKMBSP7Ao0FNvwCkAXOAf0CkQXUAf4CkwUn_wKUBSeAA5cFJ4EDmAUnggOZBSeDA5sFJ4QDnQU2hQOeBdUBhgOgBSeHA6IFNogDowXWAYkDpAUnigOlBSeLA6YFNowDqQXXAY0DqgXbAY4DqwUmjwOsBSaQA60FJpEDrgUmkgOvBSaTA7EFJpQDswU2lQO0BdwBlgO2BSaXA7gFNpgDuQXdAZkDugUmmgO7BSabA7wFNpwDvwXeAZ0DwAXkAZ4DwQUlnwPCBSWgA8MFJaEDxAUlogPFBSWjA8cFJaQDyQU2pQPKBeUBpgPNBSWnA88FNqgD0AXmAakD0gUlqgPTBSWrA9QFNqwD1wXnAa0D2AXtAa4D2QUprwPaBSmwA9sFKbED3AUpsgPdBSmzA98FKbQD4QU2tQPiBe4BtgPkBSm3A-YFNrgD5wXvAbkD6AUpugPpBSm7A-oFNrwD7QXwAb0D7gX2Ab4D7wUqvwPwBSrAA_EFKsED8gUqwgPzBSrDA_UFKsQD9wU2xQP4BfcBxgP7BSrHA_0FNsgD_gX4AckDgAYqygOBBirLA4IGNswDhQb5Ac0Dhgb_Ac4DhwYrzwOIBivQA4kGK9EDigYr0gOLBivTA40GK9QDjwY21QOQBoAC1gOSBivXA5QGNtgDlQaBAtkDlgYr2gOXBivbA5gGNtwDmwaCAt0DnAaIAt4DnQYP3wOeBg_gA58GD-EDoAYP4gOhBg_jA6MGD-QDpQY25QOmBokC5gOpBg_nA6sGNugDrAaKAukDrgYP6gOvBg_rA7AGNuwDswaLAu0DtAaRAu4DtQYC7wO2BgLwA7cGAvEDuAYC8gO5BgLzA7sGAvQDvQY29QO-BpIC9gPABgL3A8IGNvgDwwaTAvkDxAYC-gPFBgL7A8YGNvwDyQaUAv0DygaYAv4DywYz_wPMBjOABM0GM4EEzgYzggTPBjODBNEGM4QE0wY2hQTUBpkChgTWBjOHBNgGNogE2QaaAokE2gYzigTbBjOLBNwGNowE3wabAo0E4AafAo4E4gYOjwTjBg6QBOYGDpEE5wYOkgToBg6TBOoGDpQE7AY2lQTtBqAClgTvBg6XBPEGNpgE8gahApkE8wYOmgT0Bg6bBPUGNpwE-AaiAp0E-QamAp4E-wYSnwT8BhKgBP8GEqEEgAcSogSBBxKjBIMHEqQEhQc2pQSGB6cCpgSIBxKnBIoHNqgEiweoAqkEjAcSqgSNBxKrBI4HNqwEkQepAq0EkgetAq4EkwcRrwSUBxGwBJUHEbEElgcRsgSXBxGzBJkHEbQEmwc2tQScB64CtgSgBxG3BKIHNrgEowevArkEpgcRugSnBxG7BKgHNrwEqwewAr0ErAe2Ar4Erge3Ar8Erwe3AsAEsge3AsEEswe3AsIEtAe3AsMEtge3AsQEuAc2xQS5B7gCxgS7B7cCxwS9BzbIBL4HuQLJBL8HtwLKBMAHtwLLBMEHNswExAe6As0ExQe-As4ExgcvzwTHBy_QBMgHL9EEyQcv0gTKBy_TBMwHL9QEzgc21QTPB78C1gTRBy_XBNMHNtgE1AfAAtkE1Qcv2gTWBy_bBNcHNtwE2gfBAt0E2wfFAt4E3Acw3wTdBzDgBN4HMOEE3wcw4gTgBzDjBOIHMOQE5Ac25QTlB8YC5gTnBzDnBOkHNugE6gfHAukE6wcw6gTsBzDrBO0HNuwE8AfIAu0E8QfOAu4E8wfPAu8E9AfPAvAE9wfPAvEE-AfPAvIE-QfPAvME-wfPAvQE_Qc29QT-B9AC9gSACM8C9wSCCDb4BIMI0QL5BIQIzwL6BIUIzwL7BIYINvwEiQjSAv0EigjWAv4EjAjXAv8EjQjXAoAFkAjXAoEFkQjXAoIFkgjXAoMFlAjXAoQFlgg2hQWXCNgChgWZCNcChwWbCDaIBZwI2QKJBZ0I1wKKBZ4I1wKLBZ8INowFogjaAo0FowjeAg"
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
    exports2.ExpenseCategoryScalarFieldEnum = exports2.VendorScalarFieldEnum = exports2.PhotoScalarFieldEnum = exports2.DailySiteReportScalarFieldEnum = exports2.RmcEntryScalarFieldEnum = exports2.PaymentScalarFieldEnum = exports2.AdvanceAdjustmentScalarFieldEnum = exports2.AdvanceScalarFieldEnum = exports2.WorkRecordScalarFieldEnum = exports2.TeamMemberScalarFieldEnum = exports2.EmploymentTypeScalarFieldEnum = exports2.VehicleServiceLogScalarFieldEnum = exports2.VehicleMovementLogScalarFieldEnum = exports2.VehicleScalarFieldEnum = exports2.MachineryServiceLogScalarFieldEnum = exports2.MachineryMovementLogScalarFieldEnum = exports2.MachineryScalarFieldEnum = exports2.VehicleTypeScalarFieldEnum = exports2.MachineryTypeScalarFieldEnum = exports2.ReturnWastageScalarFieldEnum = exports2.ConsumptionScalarFieldEnum = exports2.MovementScalarFieldEnum = exports2.PurchaseScalarFieldEnum = exports2.SiteStockScalarFieldEnum = exports2.GodownStockScalarFieldEnum = exports2.MaterialSizeScalarFieldEnum = exports2.MaterialScalarFieldEnum = exports2.UnitScalarFieldEnum = exports2.MaterialCategoryScalarFieldEnum = exports2.SiteScalarFieldEnum = exports2.UserScalarFieldEnum = exports2.TransactionIsolationLevel = exports2.ModelName = exports2.AnyNull = exports2.JsonNull = exports2.DbNull = exports2.NullTypes = exports2.prismaVersion = exports2.getExtensionContext = exports2.Decimal = exports2.Sql = exports2.raw = exports2.join = exports2.empty = exports2.sql = exports2.PrismaClientValidationError = exports2.PrismaClientInitializationError = exports2.PrismaClientRustPanicError = exports2.PrismaClientUnknownRequestError = exports2.PrismaClientKnownRequestError = void 0;
    exports2.defineExtension = exports2.JsonNullValueFilter = exports2.NullsOrder = exports2.QueryMode = exports2.JsonNullValueInput = exports2.SortOrder = exports2.ReportScheduleScalarFieldEnum = exports2.NotificationChannelSettingScalarFieldEnum = exports2.ReportDeliveryScalarFieldEnum = exports2.DailyReportScalarFieldEnum = exports2.BrandingConfigScalarFieldEnum = exports2.ExpenseScalarFieldEnum = void 0;
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
    exports2.SiteScalarFieldEnum = {
      id: "id",
      name: "name",
      location: "location",
      status: "status",
      contractReference: "contractReference",
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
      name: "name"
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
      materialsSupplied: "materialsSupplied"
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
      const [purchases, movements, consumptions, returnWastages, workRecords, expenses, rmcEntries, dsrs, machineryMoves, vehicleMoves] = await Promise.all([
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
        })
      ]);
      const items = [
        ...purchases.map((p) => ({
          id: p.id,
          type: "PURCHASE",
          occurredAt: p.purchasedAt.toISOString(),
          summary: `${p.materialSize.material.name} (${p.materialSize.label}), ${p.quantity.toString()} \u2014 from ${p.vendor.name}`,
          amount: p.totalAmount.toNumber()
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
    var site_activity_feed_1 = require_site_activity_feed();
    var site_photo_gallery_1 = require_site_photo_gallery();
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
            contractReference: input.contractReference
          }
        });
      }
      list(status) {
        return this.prisma.site.findMany({
          where: status ? { status } : void 0,
          orderBy: { createdAt: "desc" }
        });
      }
      async update(id, input) {
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
        if (!site) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        const feed = await (0, site_activity_feed_1.getSiteActivityFeed)(this.prisma, id);
        return { ...site, feed };
      }
      async getPhotos(id) {
        const site = await this.prisma.site.findUnique({ where: { id } });
        if (!site) {
          throw new common_1.NotFoundException(`Site ${id} not found`);
        }
        return (0, site_photo_gallery_1.getSitePhotoGallery)(this.prisma, this.storage, id);
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
    var sites_service_1 = require_sites_service();
    var SitesController = class SitesController {
      sitesService;
      constructor(sitesService) {
        this.sitesService = sitesService;
      }
      create(body) {
        return this.sitesService.create(body);
      }
      list() {
        return this.sitesService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
    exports2.SitesController = SitesController = __decorate([
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
      __param(0, (0, common_1.Param)("id")),
      __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.updateMaterialCategorySchema))),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, Object]),
      __metadata("design:returntype", void 0)
    ], MaterialCategoriesController.prototype, "update", null);
    exports2.MaterialCategoriesController = MaterialCategoriesController = __decorate([
      (0, common_1.Controller)("material-categories"),
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
          if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new common_1.BadRequestException("A Unit with this name already exists");
          }
          throw error;
        }
      }
      list() {
        return this.prisma.unit.findMany({ orderBy: { name: "asc" } });
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
    exports2.UnitsController = UnitsController = __decorate([
      (0, common_1.Controller)("units"),
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
        providers: [material_categories_service_1.MaterialCategoriesService, units_service_1.UnitsService, materials_service_1.MaterialsService]
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
            where: { vendorId, paymentStatus: { not: "PAID" } },
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
      findOne(id) {
        return this.purchasesService.findOne(id);
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
      (0, common_1.Get)(":id"),
      __param(0, (0, common_1.Param)("id")),
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String]),
      __metadata("design:returntype", void 0)
    ], PurchasesController.prototype, "findOne", null);
    exports2.PurchasesController = PurchasesController = __decorate([
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
    exports2.StockController = StockController = __decorate([
      (0, common_1.Controller)("stock"),
      __metadata("design:paramtypes", [stock_service_1.StockService])
    ], StockController);
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
          stock_controller_1.StockController
        ],
        providers: [
          purchases_service_1.PurchasesService,
          movements_service_1.MovementsService,
          consumption_service_1.ConsumptionService,
          return_wastage_service_1.ReturnWastageService,
          stock_service_1.StockService
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
    var outstanding_balance_1 = require_outstanding_balance();
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
      list(filters = {}) {
        return this.prisma.payment.findMany({
          where: this.reportWhere(filters),
          include: {
            teamMember: true,
            advanceAdjustments: { include: { advance: true } }
          },
          orderBy: { createdAt: "desc" }
        });
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
      list() {
        return this.paymentsService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
      async list() {
        const teamMembers = await this.prisma.teamMember.findMany({
          include: {
            employmentType: true,
            workRecords: {
              orderBy: { workDate: "desc" },
              take: 1,
              include: { site: true }
            }
          },
          orderBy: { name: "asc" }
        });
        const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        return teamMembers.map(({ workRecords, ...teamMember }) => {
          const mostRecent = workRecords[0];
          const isToday = mostRecent && mostRecent.workDate.toISOString().slice(0, 10) === todayStr;
          return {
            ...teamMember,
            currentOrLastSite: mostRecent ? mostRecent.site.name : null,
            todaysAttendance: isToday ? mostRecent.attended ? "PRESENT" : "ABSENT" : null
          };
        });
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
      list() {
        return this.teamMembersService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
      list() {
        return this.prisma.machinery.findMany({
          include: {
            type: true,
            currentSite: true,
            movementLogs: { orderBy: { movedAt: "desc" }, take: 1 }
          },
          orderBy: { name: "asc" }
        });
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
      list() {
        return this.machineryService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
      list() {
        return this.prisma.vehicle.findMany({
          include: {
            type: true,
            currentSite: true,
            movementLogs: { orderBy: { movedAt: "desc" }, take: 1 }
          },
          orderBy: { number: "asc" }
        });
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
      list() {
        return this.vehicleService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
      list() {
        return this.prisma.vendor.findMany({ orderBy: { name: "asc" } });
      }
      async update(id, input) {
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
        if (!vendor) {
          throw new common_1.NotFoundException(`Vendor ${id} not found`);
        }
        return vendor;
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
    var vendors_service_1 = require_vendors_service();
    var VendorsController = class VendorsController {
      vendorsService;
      constructor(vendorsService) {
        this.vendorsService = vendorsService;
      }
      create(body) {
        return this.vendorsService.create(body);
      }
      list() {
        return this.vendorsService.list();
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
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
    exports2.VendorsController = VendorsController = __decorate([
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
        return this.prisma.rmcEntry.findMany({
          where,
          include: { site: true, vendor: true },
          orderBy: { deliveredAt: "desc" }
        });
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
      list(siteId, vendorId, date) {
        return this.rmcService.list({ siteId, vendorId, date });
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String]),
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
        return this.prisma.expense.findMany({
          where,
          include: { site: true, category: true },
          orderBy: { incurredAt: "desc" }
        });
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
      list(siteId, categoryId, from, to) {
        return this.expensesService.list({ siteId, categoryId, from, to });
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
      __metadata("design:type", Function),
      __metadata("design:paramtypes", [String, String, String, String]),
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
            where: { status: "ACTIVE" },
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
          this.sitesService.list("ACTIVE"),
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
        const site = await this.prisma.site.findUnique({
          where: { id: siteId },
          select: { id: true, name: true, location: true, status: true }
        });
        if (!site) {
          throw new common_1.NotFoundException(`Site ${siteId} not found`);
        }
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
        const [materialGroups, labourAgg, rmcGroups, machineryAgg, vehicleAgg, expenseGroups] = await Promise.all([
          this.prisma.purchase.groupBy({
            by: ["siteId"],
            where: { purchasedAt: bounds },
            _sum: { totalAmount: true }
          }),
          this.prisma.payment.aggregate({
            where: { createdAt: bounds },
            _sum: { netPayable: true }
          }),
          this.prisma.rmcEntry.groupBy({
            by: ["siteId"],
            where: { deliveredAt: bounds },
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
            where: { incurredAt: bounds },
            _sum: { amount: true }
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
        const siteMaterialTotal = sumValues(materialBySite);
        const rmcTotal = sumValues(rmcBySite);
        const expensesTotal = sumValues(expensesBySite);
        const materialTotal = siteMaterialTotal + godownMaterial;
        const contractorTotal = {
          material: materialTotal,
          labour,
          rmc: rmcTotal,
          machineryVehicle,
          expenses: expensesTotal,
          total: materialTotal + labour + rmcTotal + machineryVehicle + expensesTotal
        };
        const siteIds = /* @__PURE__ */ new Set([
          ...materialBySite.keys(),
          ...rmcBySite.keys(),
          ...expensesBySite.keys()
        ]);
        const names = await this.siteNames([...siteIds]);
        const buildRow = (id, name) => {
          const material = materialBySite.get(id) ?? 0;
          const rmc = rmcBySite.get(id) ?? 0;
          const expenses = expensesBySite.get(id) ?? 0;
          return {
            siteId: id,
            name,
            material,
            labour: null,
            rmc,
            machineryVehicle: null,
            expenses,
            total: material + rmc + expenses
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
    var dashboard_module_1 = require_dashboard_module();
    var reports_module_1 = require_reports_module();
    var users_module_1 = require_users_module();
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
          dashboard_module_1.DashboardModule,
          reports_module_1.ReportsModule,
          users_module_1.UsersModule
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
