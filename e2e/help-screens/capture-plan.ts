import type { Locator, Page } from "@playwright/test";
import { TEAM_MEMBER_NAME } from "../fixtures/test-users";

// Fixture names are interpolated into a RegExp below (matching partial link
// text like "Ravi Kumar Mason" without hardcoding the trailing designation);
// escaping keeps a future fixture rename (e.g. to a name containing "."  or
// "(") from being silently misinterpreted as regex syntax.
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const TEAM_MEMBER_NAME_PATTERN = new RegExp(escapeRegExp(TEAM_MEMBER_NAME));

// Capture plan for the Help & Guides annotated-screenshot pipeline: one
// entry per guide step (same order/count as HELP_CONTENT.guides — the spec
// runner asserts the counts match), each naming the screen to drive to, any
// on-page preparation (open a fold, choose a destination, walk a drill-down)
// and the one element the accent-teal ring highlights for that step.
//
// Selector strategy (frozen in the spec): `getByLabel` /
// `getByRole("combobox"|"button"|"link", { name })` — never an `id` (React's
// useId output is nondeterministic across renders/builds). A step that
// genuinely can't be captured is `null` with a comment saying why.
// Combobox names MUST use `exact: true`: getByRole name-matching is
// substring by default, and packages/ui's ComboboxField renders a trigger
// button labelled "Open {label} options" right next to the input — a
// non-exact name can land the ring on that 32px chevron instead of the
// field (caught as a manifest diff between two otherwise-identical runs).
//
// This file lives with the e2e code on purpose: capture/selector knowledge
// stays presentation-side, never in packages/shared's content.

export type CaptureViewport = "mobile" | "desktop";

export interface StepCapturePlan {
  /** Path to open, or a click-through navigation for drill-down screens. */
  goto: string | ((page: Page, viewport: CaptureViewport) => Promise<void>);
  /** Optional on-page preparation before locating the target. */
  prepare?: (page: Page, viewport: CaptureViewport) => Promise<void>;
  /** Human-readable description used in failure messages. */
  targetDescription: string;
  target: (page: Page) => Locator;
}

export type CaptureRole = "owner" | "supervisor";

export interface GuideCapturePlan {
  guideId: string;
  /** Who the capture signs in as (default "owner"). submit-dsr is captured
   * as the seeded Supervisor per the Ask-First resolution of 2026-09-06:
   * that guide is written for Supervisors — its step 1 hero only exists on
   * the Supervisor Home, and the Supervisor mobile chrome (bottom quick-bar
   * with the Report tab the guide text references) is what its readers see. */
  role?: CaptureRole;
  steps: (StepCapturePlan | null)[];
}

// ————— shared helpers —————

// Below `lg` the sidebar lives behind the header hamburger — the "from the
// sidebar, open X" steps show the opened drawer with the link ringed, which
// is exactly the screen the reader will be looking at on a phone.
async function openMobileNavIfNeeded(page: Page, viewport: CaptureViewport) {
  if (viewport === "mobile") {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    // Two elements legitimately carry this label — the full-screen scrim
    // and the drawer's X button (both visible while the drawer is open).
    // This is only a drawer-is-open readiness wait, never a ring target,
    // so .first() is safe here.
    await page.getByRole("button", { name: "Close navigation menu" }).first().waitFor({ state: "visible" });
  }
}

// The desktop rail and the mobile drawer are both <aside> (role
// complementary) rendering the same nav content — exactly one of them is
// visible at any viewport, so filter to the visible one.
function sidebarNavLink(name: string) {
  return (page: Page) =>
    page.getByRole("complementary").filter({ visible: true }).getByRole("link", { name, exact: true });
}

function navStep(linkName: string, targetDescription: string): StepCapturePlan {
  return {
    goto: "/",
    prepare: openMobileNavIfNeeded,
    targetDescription,
    target: sidebarNavLink(linkName),
  };
}

// nav-config.ts labels this item differently per role ("Team & Labour" for
// Owner/Admin, "Team & Attendance" for Supervisor) — deriving the label from
// the same `role` a guide is captured under means a future role change (like
// submit-dsr's move to Supervisor, 2026-09-06) can't silently leave a stale
// hardcoded label behind for this one nav item; every other nav step's label
// is role-invariant and doesn't need this.
function teamNavStep(role: CaptureRole): StepCapturePlan {
  const linkName = role === "supervisor" ? "Team & Attendance" : "Team & Labour";
  return navStep(linkName, `sidebar link "${linkName}"`);
}

// packages/ui's DataTable renders both a desktop row and a mobile card for
// every entry (one CSS-hidden) — always filter to the visible copy.
function visibleLink(page: Page, name: string | RegExp) {
  return page.getByRole("link", { name }).filter({ visible: true }).first();
}

// Prep interactions/waits below use .first() deliberately: they are
// navigation aids, never ring targets, and dev-mode hydration can make a
// unique element transiently match twice (see capture.spec.ts's
// waitForSingleVisibleMatch note) — a strict-mode throw inside prep would
// fail the step for a duplicate that no longer exists by capture time.

// give-advance drill-down: Team & Labour → the seeded worker's profile.
async function gotoTeamMemberProfile(page: Page) {
  await page.goto("/team");
  await visibleLink(page, TEAM_MEMBER_NAME_PATTERN).click();
  await page.getByRole("link", { name: "Record Advance" }).first().waitFor({ state: "visible" });
}

// …and one level further: the profile's Record Advance form.
async function gotoAdvanceForm(page: Page) {
  await gotoTeamMemberProfile(page);
  await page.getByRole("link", { name: "Record Advance" }).first().click();
  await page.getByLabel("Amount").first().waitFor({ state: "visible" });
}

// Purchase form: reveal the optional-paperwork fold (D5 DetailsDisclosure)
// so fold-hidden fields are visible and ringed in their shots.
async function openPurchaseMoreDetails(page: Page) {
  await page.getByText("More details — challan no., photo, vehicle, receiver, notes").first().click();
  await page.getByLabel("Invoice / Challan No.").first().waitFor({ state: "visible" });
}

// Purchase form: the Site picker only exists once Destination = Site.
async function choosePurchaseDestinationSite(page: Page) {
  await page.getByLabel("Destination").first().selectOption("SITE");
  await page.getByRole("combobox", { name: "Site", exact: true }).first().waitFor({ state: "visible" });
}

// ————— the plan, one entry per HELP_CONTENT guide step —————

export const CAPTURE_PLANS: GuideCapturePlan[] = [
  {
    guideId: "record-consumption",
    steps: [
      // "Open Movements, then Record Consumption" — the decision point the
      // reader must find is the Record Consumption action on Movements.
      {
        goto: "/movements",
        targetDescription: 'link "Record Consumption" on Movements',
        target: (page) => page.getByRole("link", { name: "Record Consumption" }).filter({ visible: true }),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'combobox "Site"',
        target: (page) => page.getByRole("combobox", { name: "Site", exact: true }),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'combobox "Material / Size"',
        target: (page) => page.getByRole("combobox", { name: "Material / Size", exact: true }),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'field "Quantity"',
        target: (page) => page.getByLabel(/^Quantity/),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'field "Consumption Date"',
        target: (page) => page.getByLabel("Consumption Date"),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'field "Activity Reference"',
        target: (page) => page.getByLabel("Activity Reference"),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'field "Notes"',
        target: (page) => page.getByLabel("Notes"),
      },
      {
        goto: "/movements/consumption/new",
        targetDescription: 'button "Record Consumption"',
        target: (page) => page.getByRole("button", { name: "Record Consumption" }),
      },
    ],
  },
  {
    guideId: "create-site",
    steps: [
      navStep("Sites", 'sidebar link "Sites"'),
      {
        goto: "/sites",
        targetDescription: 'link "Add Site"',
        target: (page) => page.getByRole("link", { name: "Add Site" }).filter({ visible: true }),
      },
      {
        goto: "/sites/new",
        targetDescription: 'field "Name"',
        target: (page) => page.getByLabel("Name", { exact: true }),
      },
      {
        goto: "/sites/new",
        targetDescription: 'field "Location"',
        target: (page) => page.getByLabel("Location", { exact: true }),
      },
      {
        goto: "/sites/new",
        targetDescription: 'select "Status"',
        target: (page) => page.getByLabel("Status", { exact: true }),
      },
      {
        goto: "/sites/new",
        targetDescription: 'field "Contract reference"',
        target: (page) => page.getByLabel("Contract reference"),
      },
      {
        goto: "/sites/new",
        targetDescription: 'field "Description"',
        target: (page) => page.getByLabel("Description"),
      },
      {
        goto: "/sites/new",
        targetDescription: 'button "Create Site"',
        target: (page) => page.getByRole("button", { name: "Create Site" }),
      },
    ],
  },
  {
    guideId: "record-purchase",
    steps: [
      navStep("Movements", 'sidebar link "Movements"'),
      {
        goto: "/movements",
        targetDescription: 'link "Record Purchase" on Movements',
        target: (page) => page.getByRole("link", { name: "Record Purchase" }).filter({ visible: true }),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'combobox "Vendor"',
        target: (page) => page.getByRole("combobox", { name: "Vendor", exact: true }),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'combobox "Material / Size"',
        target: (page) => page.getByRole("combobox", { name: "Material / Size", exact: true }),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'select "Destination"',
        target: (page) => page.getByLabel("Destination"),
      },
      {
        // "This box appears only if you chose Site as the destination" —
        // prep makes it appear, exactly as the step describes.
        goto: "/movements/purchases/new",
        prepare: choosePurchaseDestinationSite,
        targetDescription: 'combobox "Site" (Destination = Site)',
        target: (page) => page.getByRole("combobox", { name: "Site", exact: true }),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'field "Quantity"',
        target: (page) => page.getByLabel(/^Quantity/),
      },
      // Captured as the seeded Owner (spec Boundaries), so the D7 pricing
      // card (Rate / Total Amount / Payment Status) is rendered — the same
      // three steps tell Supervisors these boxes are absent for them.
      {
        goto: "/movements/purchases/new",
        targetDescription: 'field "Rate"',
        target: (page) => page.getByLabel("Rate", { exact: true }),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'field "Total Amount"',
        target: (page) => page.getByLabel("Total Amount"),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'select "Payment Status"',
        target: (page) => page.getByLabel("Payment Status"),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'field "Purchase Date"',
        target: (page) => page.getByLabel("Purchase Date"),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: '"More details" disclosure toggle',
        target: (page) => page.getByText("More details — challan no., photo, vehicle, receiver, notes"),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'field "Invoice / Challan No."',
        target: (page) => page.getByLabel("Invoice / Challan No."),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'button "Attach challan photo"',
        target: (page) => page.getByRole("button", { name: "Attach challan photo" }),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'field "Delivery Location"',
        target: (page) => page.getByLabel("Delivery Location"),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'field "Vehicle Details"',
        target: (page) => page.getByLabel("Vehicle Details"),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'field "Receiver Name"',
        target: (page) => page.getByLabel("Receiver Name"),
      },
      {
        goto: "/movements/purchases/new",
        prepare: openPurchaseMoreDetails,
        targetDescription: 'field "Notes" (inside More details)',
        target: (page) => page.getByLabel("Notes"),
      },
      {
        goto: "/movements/purchases/new",
        targetDescription: 'button "Record Purchase"',
        target: (page) => page.getByRole("button", { name: "Record Purchase" }),
      },
    ],
  },
  {
    guideId: "give-advance",
    role: "owner",
    steps: [
      teamNavStep("owner"),
      {
        goto: "/team",
        targetDescription: `link "${TEAM_MEMBER_NAME}" in the Team list`,
        target: (page) => visibleLink(page, TEAM_MEMBER_NAME_PATTERN),
      },
      {
        goto: gotoTeamMemberProfile,
        targetDescription: 'link "Record Advance" on the worker profile',
        target: (page) => page.getByRole("link", { name: "Record Advance" }),
      },
      {
        goto: gotoAdvanceForm,
        targetDescription: 'field "Amount"',
        target: (page) => page.getByLabel("Amount"),
      },
      {
        goto: gotoAdvanceForm,
        targetDescription: 'field "Date"',
        target: (page) => page.getByLabel("Date", { exact: true }),
      },
      {
        goto: gotoAdvanceForm,
        targetDescription: 'field "Reason"',
        target: (page) => page.getByLabel("Reason", { exact: true }),
      },
      {
        goto: gotoAdvanceForm,
        targetDescription: 'field "Payment Method"',
        target: (page) => page.getByLabel("Payment Method"),
      },
      {
        goto: gotoAdvanceForm,
        targetDescription: 'button "Record Advance"',
        target: (page) => page.getByRole("button", { name: "Record Advance" }),
      },
    ],
  },
  {
    guideId: "submit-dsr",
    role: "supervisor",
    steps: [
      {
        // The Supervisor Home's full-width hero card. Its accessible name
        // includes the hint line, which also disambiguates it from the
        // per-Site "Start Daily Report" GapFlag links above the grid.
        goto: "/",
        targetDescription: 'hero link "Start Daily Report" on the Supervisor Home',
        target: (page) =>
          page.getByRole("link", { name: "Start Daily Report Today's work, crew, materials & photos" }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'combobox "Site"',
        target: (page) => page.getByRole("combobox", { name: "Site", exact: true }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'field "Date"',
        target: (page) => page.getByLabel("Date", { exact: true }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'field "Work completed"',
        target: (page) => page.getByLabel("Work completed"),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'field "Issues / blockers"',
        target: (page) => page.getByLabel("Issues / blockers"),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'combobox "Add crew member"',
        target: (page) => page.getByRole("combobox", { name: "Add crew member", exact: true }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'button "Add material"',
        target: (page) => page.getByRole("button", { name: "Add material" }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'button "Add RMC delivery"',
        target: (page) => page.getByRole("button", { name: "Add RMC delivery" }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'button "Add expense"',
        target: (page) => page.getByRole("button", { name: "Add expense" }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'combobox "Add machinery or vehicle"',
        target: (page) => page.getByRole("combobox", { name: "Add machinery or vehicle", exact: true }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'button "Add photo"',
        target: (page) => page.getByRole("button", { name: "Add photo" }),
      },
      {
        goto: "/dsr/new",
        targetDescription: 'button "Submit Daily Report"',
        target: (page) => page.getByRole("button", { name: "Submit Daily Report" }),
      },
    ],
  },
];
