// Site detail activity feed (FR-1, story 2.3). A plain exported type, not
// a Zod schema — this is a read/response shape apps/web renders, not an
// input to validate, so it doesn't need AD-7's shared-validator treatment.
export type FeedItemType =
  | "DSR"
  | "PURCHASE"
  | "MOVEMENT"
  | "CONSUMPTION"
  | "RETURN_WASTAGE"
  | "WORK_RECORD"
  | "EXPENSE"
  | "RMC"
  | "MACHINERY_MOVEMENT"
  | "VEHICLE_MOVEMENT"
  | "WASTE_DISPOSAL"
  | "SITE_CONTRACT"
  | "WORK_ENTRY"
  | "SUBCONTRACTOR_PAYMENT";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  /** ISO-8601 — the record's own business date, not its createdAt. */
  occurredAt: string;
  summary: string;
  /** Integer rupees, only for money-moving record types (Purchase, RMC,
   * Expense) — null for everything else. */
  amount: number | null;
}
