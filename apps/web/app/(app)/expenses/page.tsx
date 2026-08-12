import { EmptyState, ReceiptIcon } from "@azentisfieldos/ui";

export default function Page() {
  return <EmptyState icon={<ReceiptIcon />} message="Expenses will appear here once Expense Tracking ships." />;
}
