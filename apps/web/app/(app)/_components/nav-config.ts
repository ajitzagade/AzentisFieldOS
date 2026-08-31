import {
  AlertTriangleIcon,
  BarChartIcon,
  BoxIcon,
  BuildingIcon,
  ClipboardIcon,
  DropletIcon,
  GearIcon,
  HelpCircleIcon,
  HomeIcon,
  LayersIcon,
  MapPinIcon,
  ReceiptIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  ArrowsIcon,
} from "@azentisfieldos/ui";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// The 14 sidebar-linked top-level surfaces per EXPERIENCE.md's Information
// Architecture table ("Reached from: Sidebar") — not the epic brief's "15
// routed surfaces" summary figure, which doesn't match a literal count of
// that table (see story 1.6 Dev Notes). "Daily Activity" routes to the log
// surface, not the mobile DSR entry (_shared-kit.html's href for this item
// is stale).
export const UNGROUPED_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/sites", label: "Sites", icon: MapPinIcon },
  { href: "/daily-activity", label: "Daily Activity", icon: ClipboardIcon },
];

// Story 16.4: regrouped by what the user is trying to do (Stock/People/
// Money), not by raw entity name — per the 2026-08-29 product review's
// proposed IA (Appendix A). Every href/icon/label is unchanged from
// before this story; only each item's group label and grouping changed.
// `/waste-disposal` isn't mentioned in that review's proposed IA (it
// shipped later, in Epic 15) — placed in Stock as the closest semantic
// fit (an inventory-outflow concept, like Movements), not silently
// dropped from the sidebar.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Stock",
    items: [
      { href: "/inventory", label: "Inventory", icon: BoxIcon },
      { href: "/movements", label: "Movements", icon: ArrowsIcon },
      { href: "/materials", label: "Materials", icon: LayersIcon },
      { href: "/waste-disposal", label: "Waste & Disposal", icon: AlertTriangleIcon },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/team", label: "Team & Labour", icon: UsersIcon },
      { href: "/payments", label: "Payments", icon: WalletIcon },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/vendors", label: "Vendors", icon: BuildingIcon },
      { href: "/expenses", label: "Expenses", icon: ReceiptIcon },
      { href: "/rmc", label: "RMC", icon: DropletIcon },
    ],
  },
  {
    label: "Machinery & Vehicles",
    items: [{ href: "/machinery-vehicles", label: "Machinery & Vehicles", icon: TruckIcon }],
  },
  {
    label: "Reports",
    items: [{ href: "/reports", label: "Reports", icon: BarChartIcon }],
  },
];

// Pinned above Settings, same reasoning as Settings itself (EXPERIENCE.md's
// Help & Guides addition): a utility surface reached when needed, not part
// of daily work. Unlike Settings, Help is visible to BOTH roles — the
// Supervisor is the persona who most needs to learn the app unsupervised.
export const HELP_NAV_ITEM: NavItem = { href: "/help", label: "Help & Guides", icon: HelpCircleIcon };

export const SETTINGS_NAV_ITEM: NavItem = { href: "/settings", label: "Settings", icon: GearIcon };
