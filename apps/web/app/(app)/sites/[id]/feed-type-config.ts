import {
  ArrowsIcon,
  BoxIcon,
  ClipboardIcon,
  DropletIcon,
  GearIcon,
  ReceiptIcon,
  TruckIcon,
  UsersIcon,
} from "@azentisfieldos/ui";
import type { FeedItemType } from "@azentisfieldos/shared";
import type { ComponentType, SVGProps } from "react";

// mockups/03-site-detail.html shows type-badges for exactly three of the
// ten feed item types (DSR/Movement = neutral, Expense = gold); the other
// seven aren't pictured in any mockup. Extending the same rule DESIGN.md
// states for gold ("reserved strictly for money... Expense totals, KPI
// currency figures") to every other money-moving record type (Purchase,
// RMC) is the most faithful, non-arbitrary extrapolation — everything
// else stays neutral, matching the mockup's own DSR/Movement precedent.
export const FEED_TYPE_CONFIG: Record<
  FeedItemType,
  { label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; badgeVariant: "gold" | "neutral" }
> = {
  DSR: { label: "DSR", icon: ClipboardIcon, badgeVariant: "neutral" },
  MOVEMENT: { label: "Movement", icon: ArrowsIcon, badgeVariant: "neutral" },
  PURCHASE: { label: "Purchase", icon: BoxIcon, badgeVariant: "gold" },
  CONSUMPTION: { label: "Consumption", icon: BoxIcon, badgeVariant: "neutral" },
  RETURN_WASTAGE: { label: "Return/Wastage", icon: ArrowsIcon, badgeVariant: "neutral" },
  WORK_RECORD: { label: "Work Record", icon: UsersIcon, badgeVariant: "neutral" },
  EXPENSE: { label: "Expense", icon: ReceiptIcon, badgeVariant: "gold" },
  RMC: { label: "RMC", icon: DropletIcon, badgeVariant: "gold" },
  MACHINERY_MOVEMENT: { label: "Machinery", icon: GearIcon, badgeVariant: "neutral" },
  VEHICLE_MOVEMENT: { label: "Vehicle", icon: TruckIcon, badgeVariant: "neutral" },
  // Money-moving (per-trip disposal cost) — gold, same rule as Purchase/RMC.
  WASTE_DISPOSAL: { label: "Waste Disposal", icon: TruckIcon, badgeVariant: "gold" },
};
