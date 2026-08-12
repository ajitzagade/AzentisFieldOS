import {
  BarChartIcon,
  BoxIcon,
  BuildingIcon,
  ClipboardIcon,
  DropletIcon,
  GearIcon,
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

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Materials",
    items: [
      { href: "/inventory", label: "Inventory", icon: BoxIcon },
      { href: "/materials", label: "Materials", icon: LayersIcon },
      { href: "/movements", label: "Movements", icon: ArrowsIcon },
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
    label: "Assets",
    items: [
      { href: "/machinery-vehicles", label: "Machinery & Vehicles", icon: TruckIcon },
      { href: "/vendors", label: "Vendors", icon: BuildingIcon },
      { href: "/rmc", label: "RMC", icon: DropletIcon },
      { href: "/expenses", label: "Expenses", icon: ReceiptIcon },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/reports", label: "Reports", icon: BarChartIcon }],
  },
];

export const SETTINGS_NAV_ITEM: NavItem = { href: "/settings", label: "Settings", icon: GearIcon };
