"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button, PhotoThumbnail, PlusIcon, ReceiptIcon } from "@azentisfieldos/ui";
import { formatDate } from "../../../../../../lib/format";
import { uploadPurchaseBill } from "../../../../../../lib/bill-upload";
import { useAuthedFetch } from "../../../../../../lib/use-authed-fetch";

export interface BillItem {
  id: string;
  url: string | null;
  uploadedByName: string;
  createdAt: string;
}

// Attach Bill (2026-09-22): purely additive — each upload creates a new,
// independent PurchaseBill row (never edits/replaces an earlier one, same
// append-only reasoning as every other record in this app), so re-attaching
// a better scan later just adds another entry to the list below rather than
// overwriting anything.
export function AttachBillForm({
  purchaseId,
  initialBills,
}: {
  purchaseId: string;
  initialBills: BillItem[];
}) {
  const authedFetch = useAuthedFetch();
  const [bills, setBills] = useState<BillItem[]>(initialBills);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const bill = await uploadPurchaseBill(authedFetch, purchaseId, file);
      setBills((rows) => [bill, ...rows]);
    } catch {
      setError("Could not upload that bill. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-caption font-semibold text-ink-700">
          {bills.length === 0 ? "No bills attached yet" : `${bills.length} bill${bills.length === 1 ? "" : "s"} attached`}
        </span>
        <Button type="button" variant="secondary" size="sm" isLoading={uploading} onClick={() => fileInputRef.current?.click()}>
          <PlusIcon className="size-4" />
          Attach a bill
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload bill photo"
          onChange={handleChange}
        />
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {error}
        </p>
      ) : null}

      {bills.length === 0 ? (
        <p className="flex items-center gap-2 text-body-sm text-ink-500">
          <ReceiptIcon className="size-4 shrink-0" />
          Attach one whenever the vendor's bill arrives — this Purchase is already complete without it.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bills.map((bill) => (
            <li key={bill.id} className="flex flex-col gap-1">
              <a
                href={bill.url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden rounded-md border border-border-hairline bg-surface-2"
              >
                {bill.url ? (
                  <PhotoThumbnail src={bill.url} alt="Bill" className="size-full object-cover" />
                ) : null}
              </a>
              <span className="text-caption text-ink-500">
                {bill.uploadedByName} · {formatDate(bill.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
