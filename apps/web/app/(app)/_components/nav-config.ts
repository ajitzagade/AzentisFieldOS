import {
  AlertTriangleIcon,
  BarChartIcon,
  BoxIcon,
  BuildingIcon,
  CalendarIcon,
  CameraIcon,
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
  /** When set, SidebarNav renders this as a button that opens the named
   * modal in place instead of navigating (href is an inert "#" for these —
   * only "measurement" exists today). */
  modalId?: "measurement";
}

// Measurement (2026-09-21): a persistent side-menu entry (not just the
// Quick Add sheet / global search) per the explicit ask — opens the same
// MeasurementQuickEntryPanel those two also share (app-shell.tsx).
export const MEASUREMENT_NAV_ITEM: NavItem = {
  href: "#measurement",
  label: "Measurement",
  icon: CameraIcon,
  modalId: "measurement",
};

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
      { href: "/waste-disposal", label: "Waste Material", icon: AlertTriangleIcon },
      MEASUREMENT_NAV_ITEM,
    ],
  },
  {
    label: "People",
    items: [
      { href: "/team", label: "Team & Labour", icon: UsersIcon },
      // Renamed from "Payments" (2026-09-19): this surface is Team-Member
      // pay only — the cross-source feed lives at /all-payments (Money).
      { href: "/payments", label: "Employee Payments", icon: WalletIcon },
      // Labour Payment (2026-09-21): a separate, decoupled system for
      // daily-wage labour paid weekly — deliberately not merged with the
      // Team Member/Employee Payments surfaces above.
      { href: "/labour-payments", label: "Labour Payment", icon: CalendarIcon },
    ],
  },
  {
    label: "Money",
    items: [
      // The unified cross-source payments feed (2026-09-19) — Employee,
      // Subcontractor, Vendor, RMC, Waste Disposal and Expense money-out
      // in one list with paid/unpaid/pending filters.
      { href: "/all-payments", label: "All Payments", icon: WalletIcon },
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
      { href: "/waste-disposal", label: "Waste Material", icon: AlertTriangleIcon },
      MEASUREMENT_NAV_ITEM,
    ],
  },
  {
    label: "People",
    items: [
      { href: "/team", label: "Team & Attendance", icon: UsersIcon },
      { href: "/labour-payments", label: "Labour Payment", icon: CalendarIcon },
    ],
  },
  // Extended (2026-09-22): a Site Engineer records Purchases/RMC deliveries
  // against a Vendor and logs Subcontractor work day-to-day — these four
  // were de-emphasized as "Owner surfaces" by the original 2026-09-01 trim,
  // but that assumption didn't hold up against real daily use. Create/edit
  // on Subcontractor itself stays Owner-gated (FR-55, enforced both at the
  // API and by /subcontractors' own page); every other create/list/find
  // action here was already open to both roles server-side.
  {
    label: "Money",
    items: [
      { href: "/vendors", label: "Vendors", icon: BuildingIcon },
      { href: "/subcontractors", label: "Subcontractors", icon: UserIcon },
      { href: "/expenses", label: "Expenses", icon: ReceiptIcon },
      { href: "/rmc", label: "RMC", icon: DropletIcon },
    ],
  },
];

// The Supervisor's mobile bottom quick-bar's two plain-link slots — mirrors
// OWNER_QUICK_BAR_LINKS's shape (2 links + "+" + Search + More, the "+" and
// remaining slots rendered inline in SupervisorQuickBar, same reasoning as
// OwnerQuickBar). "Report" goes straight to the entry form (the #1 daily
// task), not the log. Materials and Help — previously two of this bar's
// four fixed slots — moved into the hamburger drawer (SUPERVISOR_NAV_GROUPS
// / HELP_NAV_ITEM below) to make room for "+", matching Owner's layout;
// both stay one tap further away, never removed.
export const SUPERVISOR_QUICK_BAR_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/dsr/new", label: "Report", icon: ClipboardIcon },
];

// The Owner mobile quick-bar's two plain-link slots (Story 19.4) — Dashboard
// and Sites, the only two of its five slots that are plain navigations. The
// remaining three ("+", Search, More) are actions against existing
// app-shell state, not routes, so they're rendered inline in OwnerQuickBar
// rather than folded into this array (Design Notes: not worth generalizing
// NavItem for a five-slot, non-reused widget).
export const OWNER_QUICK_BAR_LINKS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/sites", label: "Sites", icon: MapPinIcon },
];

// Pinned above Settings, same reasoning as Settings itself (EXPERIENCE.md's
// Help & Guides addition): a utility surface reached when needed, not part
// of daily work. Unlike Settings, Help is visible to BOTH roles — the
// Supervisor is the persona who most needs to learn the app unsupervised.
export const HELP_NAV_ITEM: NavItem = { href: "/help", label: "Help & Guides", icon: HelpCircleIcon };

export const SETTINGS_NAV_ITEM: NavItem = { href: "/settings", label: "Settings", icon: GearIcon };
