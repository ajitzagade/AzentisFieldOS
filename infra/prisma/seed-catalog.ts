import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../apps/api/src/generated/prisma/client";

// Optional, opt-in catalog seed for a general civil contractor tenant —
// the Material taxonomy (Units, Categories, Materials, Sizes) plus
// Machinery/Vehicle types and Expense categories a Site running road
// development, drainage-line, or painting tender work needs on day one.
//
// Deliberately separate from seed.ts: that script is the minimal, always-run
// day-one baseline every deployment gets; this one is a rich starting
// catalog a tenant can choose at provisioning time and then prune with the
// normal status-retirement admin UI. Everything here is master data —
// no Sites, Vendors, Team Members, or transaction rows, which are real-world
// records the tenant creates themselves.
//
// Idempotent: every write is an upsert on the natural unique key
// (Unit.name, MaterialCategory.name, Material [categoryId, name],
// MaterialSize [materialId, label]) with `update: {}`, so re-running never
// duplicates rows and never overwrites an admin's later edits (renames,
// unit changes, disables).

const UNITS = [
  "Bag",
  "Kg",
  "Ton",
  "Quintal",
  "Cum",
  "Sqm",
  "Sqft",
  "Rmt",
  "Nos",
  "Litre",
  "Drum",
  "Brass",
  "Trip",
  "Roll",
  "Set",
  "Bundle",
  "Box",
  "Pair",
  "Packet",
] as const;

type UnitName = (typeof UNITS)[number];

interface CatalogMaterial {
  name: string;
  unit: UnitName;
  sizes: string[];
}

// Sizes use "Standard" when a Material has no meaningful Size/Specification
// split — the same convention the app already uses ("River Sand — Standard").
const CATALOG: Record<string, CatalogMaterial[]> = {
  "Cement & Binders": [
    { name: "OPC 43 Grade Cement", unit: "Bag", sizes: ["50kg"] },
    { name: "OPC 53 Grade Cement", unit: "Bag", sizes: ["50kg"] },
    { name: "PPC Cement", unit: "Bag", sizes: ["50kg"] },
    { name: "White Cement", unit: "Bag", sizes: ["1kg", "5kg", "25kg"] },
    { name: "Lime Powder", unit: "Bag", sizes: ["25kg"] },
  ],
  Aggregates: [
    { name: "10mm Aggregate", unit: "Cum", sizes: ["Standard"] },
    { name: "20mm Aggregate", unit: "Cum", sizes: ["20mm"] },
    { name: "40mm Aggregate", unit: "Cum", sizes: ["Standard"] },
    { name: "GSB (Granular Sub-Base)", unit: "Cum", sizes: ["Standard"] },
    { name: "WMM (Wet Mix Macadam)", unit: "Cum", sizes: ["Standard"] },
    { name: "River Sand", unit: "Cum", sizes: ["Standard"] },
    { name: "M-Sand (Crushed Sand)", unit: "Cum", sizes: ["Standard"] },
    { name: "Stone Dust", unit: "Cum", sizes: ["Standard"] },
    { name: "Murum", unit: "Brass", sizes: ["Standard"] },
    { name: "Boulder / Rubble", unit: "Cum", sizes: ["Standard"] },
  ],
  "Steel & Reinforcement": [
    { name: "TMT Bar Fe500", unit: "Kg", sizes: ["8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm"] },
    { name: "Binding Wire", unit: "Kg", sizes: ["Standard"] },
    { name: "MS Angle", unit: "Kg", sizes: ["35x35x5mm", "50x50x6mm"] },
    { name: "MS Flat", unit: "Kg", sizes: ["25x5mm", "50x6mm"] },
    { name: "Weld Mesh", unit: "Sqm", sizes: ["50x50mm", "75x75mm"] },
    { name: "Chain Link Fencing", unit: "Rmt", sizes: ["4ft", "6ft"] },
  ],
  "Bricks & Masonry": [
    { name: "Red Clay Brick", unit: "Nos", sizes: ["9x4x3in"] },
    { name: "Fly Ash Brick", unit: "Nos", sizes: ["9x4x3in"] },
    { name: "AAC Block", unit: "Nos", sizes: ["600x200x100mm", "600x200x150mm", "600x200x200mm"] },
    { name: "Solid Concrete Block", unit: "Nos", sizes: ["400x200x150mm", "400x200x200mm"] },
  ],
  "Road Work": [
    { name: "Bitumen VG-30", unit: "Drum", sizes: ["Bulk", "Drum 156kg"] },
    { name: "Bitumen VG-40", unit: "Drum", sizes: ["Bulk", "Drum 156kg"] },
    { name: "Bitumen Emulsion RS-1", unit: "Drum", sizes: ["Drum 200kg"] },
    { name: "Bitumen Emulsion SS-2", unit: "Drum", sizes: ["Drum 200kg"] },
    { name: "Paver Block", unit: "Sqm", sizes: ["60mm", "80mm"] },
    { name: "Kerb Stone", unit: "Nos", sizes: ["300x350x150mm", "600x300x150mm"] },
    { name: "Thermoplastic Road Marking Paint", unit: "Bag", sizes: ["25kg"] },
    { name: "Glass Beads (Road Marking)", unit: "Bag", sizes: ["25kg"] },
    { name: "Road Stud / Cat Eye", unit: "Nos", sizes: ["ABS", "Aluminium"] },
  ],
  "Drainage & Sewerage": [
    { name: "RCC Hume Pipe NP2", unit: "Nos", sizes: ["300mm", "450mm", "600mm", "900mm", "1200mm"] },
    { name: "RCC Hume Pipe NP3", unit: "Nos", sizes: ["300mm", "450mm", "600mm", "900mm", "1200mm"] },
    { name: "DWC HDPE Pipe", unit: "Rmt", sizes: ["110mm", "160mm", "200mm", "300mm"] },
    { name: "SWR PVC Pipe", unit: "Nos", sizes: ["75mm", "110mm", "160mm"] },
    { name: "SFRC Manhole Cover", unit: "Nos", sizes: ["Medium Duty", "Heavy Duty"] },
    { name: "CI Manhole Frame & Cover", unit: "Nos", sizes: ["Medium Duty", "Heavy Duty"] },
    { name: "Gully Grating", unit: "Nos", sizes: ["Standard"] },
    { name: "RCC Drain Cover Slab", unit: "Nos", sizes: ["600x450mm", "900x600mm"] },
  ],
  "Painting & Finishes": [
    { name: "Interior Primer", unit: "Litre", sizes: ["1L", "4L", "10L", "20L"] },
    { name: "Exterior Primer", unit: "Litre", sizes: ["1L", "4L", "10L", "20L"] },
    { name: "Metal Primer (Red Oxide)", unit: "Litre", sizes: ["0.5L", "1L", "4L"] },
    { name: "Wall Putty", unit: "Bag", sizes: ["5kg", "20kg", "40kg"] },
    { name: "Acrylic Emulsion (Interior)", unit: "Litre", sizes: ["1L", "4L", "10L", "20L"] },
    { name: "Exterior Emulsion", unit: "Litre", sizes: ["1L", "4L", "10L", "20L"] },
    { name: "Acrylic Distemper", unit: "Kg", sizes: ["1kg", "5kg", "20kg"] },
    { name: "Enamel Paint", unit: "Litre", sizes: ["0.5L", "1L", "4L"] },
    { name: "Epoxy Floor Paint", unit: "Litre", sizes: ["4L", "10L"] },
    { name: "Texture Paint", unit: "Kg", sizes: ["25kg"] },
    { name: "Paint Thinner", unit: "Litre", sizes: ["1L", "5L"] },
    { name: "POP (Plaster of Paris)", unit: "Bag", sizes: ["25kg"] },
    { name: "Sandpaper", unit: "Nos", sizes: ["80 Grit", "120 Grit", "180 Grit", "320 Grit"] },
    { name: "Paint Brush", unit: "Nos", sizes: ["25mm", "50mm", "75mm", "100mm"] },
    { name: "Paint Roller", unit: "Nos", sizes: ["7in", "9in"] },
    { name: "Masking Tape", unit: "Roll", sizes: ["1in", "2in"] },
  ],
  "Plumbing & Water Supply": [
    { name: "CPVC Pipe", unit: "Nos", sizes: ["15mm", "20mm", "25mm", "32mm"] },
    { name: "UPVC Pipe", unit: "Nos", sizes: ["15mm", "20mm", "25mm", "32mm"] },
    { name: "GI Pipe", unit: "Nos", sizes: ["15mm", "25mm", "40mm", "50mm"] },
    { name: "HDPE Pipe", unit: "Roll", sizes: ["63mm", "90mm", "110mm"] },
    { name: "PVC Ball Valve", unit: "Nos", sizes: ["15mm", "25mm", "40mm"] },
    { name: "Solvent Cement", unit: "Nos", sizes: ["100ml", "250ml", "500ml"] },
    { name: "Teflon Tape", unit: "Roll", sizes: ["Standard"] },
  ],
  Electrical: [
    { name: "PVC Conduit", unit: "Nos", sizes: ["20mm", "25mm"] },
    { name: "FRLS Copper Wire", unit: "Roll", sizes: ["1.0 sqmm", "1.5 sqmm", "2.5 sqmm", "4.0 sqmm"] },
    { name: "Armoured Cable", unit: "Rmt", sizes: ["4C x 16 sqmm", "4C x 25 sqmm"] },
    { name: "MCB", unit: "Nos", sizes: ["6A", "16A", "32A"] },
    { name: "Switch & Socket", unit: "Nos", sizes: ["6A", "16A"] },
    { name: "LED Street Light", unit: "Nos", sizes: ["30W", "60W", "120W"] },
  ],
  "Shuttering & Scaffolding": [
    { name: "Shuttering Plywood", unit: "Nos", sizes: ["12mm", "18mm"] },
    { name: "Shuttering Oil", unit: "Litre", sizes: ["5L", "20L"] },
    { name: "Adjustable Prop (Acrow Span)", unit: "Nos", sizes: ["2m", "3m", "4m"] },
    { name: "Scaffolding Pipe", unit: "Nos", sizes: ["6ft", "10ft", "20ft"] },
    { name: "Scaffolding Coupler", unit: "Nos", sizes: ["Fixed", "Swivel"] },
    { name: "Base Jack / U-Jack", unit: "Nos", sizes: ["Base", "U-Head"] },
    { name: "Wooden Batten / Runner", unit: "Nos", sizes: ["3x2in", "4x2in"] },
  ],
  "Chemicals & Waterproofing": [
    { name: "Concrete Admixture (Plasticizer)", unit: "Litre", sizes: ["5L", "20L", "200L"] },
    { name: "Curing Compound", unit: "Litre", sizes: ["20L", "200L"] },
    { name: "SBR Latex Waterproofing", unit: "Litre", sizes: ["1L", "5L", "20L"] },
    { name: "Crystalline Waterproofing", unit: "Bag", sizes: ["25kg"] },
    { name: "Tile Adhesive", unit: "Bag", sizes: ["20kg"] },
    { name: "Epoxy Grout", unit: "Kg", sizes: ["1kg", "5kg"] },
    { name: "Anti-termite Chemical", unit: "Litre", sizes: ["1L", "5L"] },
  ],
  "Hardware & Consumables": [
    { name: "Wire Nails", unit: "Kg", sizes: ["1in", "2in", "3in", "4in"] },
    { name: "Screws & Fasteners", unit: "Box", sizes: ["Assorted"] },
    { name: "Cutting Wheel", unit: "Nos", sizes: ["4in", "14in"] },
    { name: "Grinding Wheel", unit: "Nos", sizes: ["4in", "7in"] },
    { name: "HDPE Tarpaulin", unit: "Nos", sizes: ["12x15ft", "15x18ft", "18x24ft"] },
    { name: "Nylon Rope", unit: "Kg", sizes: ["6mm", "10mm"] },
    { name: "Measuring Tape", unit: "Nos", sizes: ["5m", "30m"] },
    { name: "Hacksaw Blade", unit: "Nos", sizes: ["Standard"] },
  ],
  "Safety & Site Setup": [
    { name: "Safety Helmet", unit: "Nos", sizes: ["Standard"] },
    { name: "Safety Shoes", unit: "Pair", sizes: ["Standard"] },
    { name: "Reflective Safety Jacket", unit: "Nos", sizes: ["Standard"] },
    { name: "Safety Gloves", unit: "Pair", sizes: ["Rubber", "Leather"] },
    { name: "Safety Goggles", unit: "Nos", sizes: ["Standard"] },
    { name: "Safety Net", unit: "Sqm", sizes: ["Standard"] },
    { name: "Barricading Tape", unit: "Roll", sizes: ["Standard"] },
    { name: "Traffic Cone", unit: "Nos", sizes: ["750mm"] },
    { name: "Barricade Sheet (Road Work)", unit: "Nos", sizes: ["Standard"] },
    { name: "Caution / Signage Board", unit: "Nos", sizes: ["Standard"] },
  ],
  RMC: [
    { name: "RMC M10", unit: "Cum", sizes: ["Standard"] },
    { name: "RMC M15", unit: "Cum", sizes: ["Standard"] },
    { name: "RMC M20", unit: "Cum", sizes: ["Standard"] },
    { name: "RMC M25", unit: "Cum", sizes: ["Standard"] },
    { name: "RMC M30", unit: "Cum", sizes: ["Standard"] },
    { name: "RMC M35", unit: "Cum", sizes: ["Standard"] },
  ],
};

// FR-15/FR-16: the machinery/vehicle fleet typical of road, drainage, and
// finishing work. Merges with seed.ts's day-one defaults via the same
// name upsert.
const MACHINERY_TYPES = [
  "JCB Backhoe Loader",
  "Road Roller",
  "Motor Grader",
  "Paver Finisher",
  "Transit Mixer",
  "Concrete Mixer",
  "Needle Vibrator",
  "Plate Compactor",
  "Water Pump",
  "DG Set",
  "Air Compressor",
  "Rock Breaker",
  "Bar Bending Machine",
  "Bar Cutting Machine",
  "Welding Machine",
];

const VEHICLE_TYPES = ["Tipper", "Water Tanker", "Tractor Trolley", "Pickup"];

// FR-41: tender-work heads beyond seed.ts's nine day-one categories.
const EXPENSE_CATEGORIES = [
  "Royalty & Government Fees",
  "Testing & Quality",
  "Rent & Hire Charges",
  "Food & Refreshments",
  "Safety & PPE",
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const unitIds = new Map<string, string>();
  for (const name of UNITS) {
    const unit = await prisma.unit.upsert({ where: { name }, update: {}, create: { name } });
    unitIds.set(name, unit.id);
  }

  let materialCount = 0;
  let sizeCount = 0;
  for (const [categoryName, materials] of Object.entries(CATALOG)) {
    const category = await prisma.materialCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    for (const item of materials) {
      const material = await prisma.material.upsert({
        where: { categoryId_name: { categoryId: category.id, name: item.name } },
        update: {},
        create: {
          categoryId: category.id,
          name: item.name,
          unitId: unitIds.get(item.unit)!,
        },
      });
      materialCount += 1;

      for (const label of item.sizes) {
        await prisma.materialSize.upsert({
          where: { materialId_label: { materialId: material.id, label } },
          update: {},
          create: { materialId: material.id, label },
        });
        sizeCount += 1;
      }
    }
  }

  for (const name of MACHINERY_TYPES) {
    await prisma.machineryType.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of VEHICLE_TYPES) {
    await prisma.vehicleType.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log(
    `Catalog seeded: ${UNITS.length} units, ${Object.keys(CATALOG).length} categories, ` +
      `${materialCount} materials, ${sizeCount} sizes, ${MACHINERY_TYPES.length} machinery types, ` +
      `${VEHICLE_TYPES.length} vehicle types, ${EXPENSE_CATEGORIES.length} expense categories.`,
  );

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
