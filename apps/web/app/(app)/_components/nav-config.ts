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
  UserIcon,
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
// that table (see story 1.6 Dev Notes). "Daily Report" routes to the log
// surface, not the mobile DSR entry (_shared-kit.html's href for this item
// is stale). Label unified from "Daily Activity" to "Daily Report" by the
// 2026-09-01 simplicity review — one user-facing name for the concept
// everywhere (the /daily-activity route itself is unchanged: no URL churn).
export const UNGROUPED_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/sites", label: "Sites", icon: MapPinIcon },
  { href: "/daily-activity", label: "Daily Report", icon: ClipboardIcon },
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
      { href: "/subcontractors", label: "Subcontractors", icon: UserIcon },
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

// ————— Site Supervisor nav (simplicity review 2026-09-01) —————
// The Supervisor's sidebar is a task-first trim of the full rail: the six
// surfaces their daily work actually lands on, nothing else. Owner surfaces
// (Vendors, Payments, Expenses, RMC, Reports, Machinery, Materials catalog)
// are de-emphasized, NOT removed: the entry forms a Supervisor legitimately
// uses (RMC delivery, expense, wastage) stay one tap away on the Supervisor
// Home's "More" list, and every owner surface stays reachable by URL —
// hiding here only reduces top-level noise for a low-tech field user. Direct URLs keep working;
// server-side @Roles guards remain the real access boundary (AD-11).
export const SUPERVISOR_UNGROUPED_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/sites", label: "Sites", icon: MapPinIcon },
  { href: "/daily-activity", label: "Daily Report", icon: ClipboardIcon },
];

export const SUPERVISOR_NAV_GROUPS: NavGroup[] = [
  {
    label: "Stock",
    items: [
      { href: "/inventory", label: "Inventory", icon: BoxIcon },
      { href: "/movements", label: "Movements", icon: ArrowsIcon },
      { href: "/waste-disposal", label: "Waste & Disposal", icon: AlertTriangleIcon },
    ],
  },
  {
    label: "People",
    items: [{ href: "/team", label: "Team & Attendance", icon: UsersIcon }],
  },
];

// The Supervisor's mobile bottom quick-bar: the persistent one-tap layer the
// hamburger drawer can't provide. Four items max — thumb-reachable, no
// scrolling, no overflow menu. "Report" goes straight to the entry form
// (the #1 daily task), not the log.
export const SUPERVISOR_QUICK_BAR_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/dsr/new", label: "Report", icon: ClipboardIcon },
  { href: "/movements", label: "Materials", icon: BoxIcon },
  { href: "/help", label: "Help", icon: HelpCircleIcon },
];

// Pinned above Settings, same reasoning as Settings itself (EXPERIENCE.md's
// Help & Guides addition): a utility surface reached when needed, not part
// of daily work. Unlike Settings, Help is visible to BOTH roles — the
// Supervisor is the persona who most needs to learn the app unsupervised.
export const HELP_NAV_ITEM: NavItem = { href: "/help", label: "Help & Guides", icon: HelpCircleIcon };

export const SETTINGS_NAV_ITEM: NavItem = { href: "/settings", label: "Settings", icon: GearIcon };
