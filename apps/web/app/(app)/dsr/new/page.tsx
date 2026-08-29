"use client";

import { Suspense, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AmountField,
  Badge,
  Button,
  CalendarIcon,
  CameraIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  MapPinIcon,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TextareaField,
  TruckIcon,
  UserIcon,
  WifiOffIcon,
} from "@azentisfieldos/ui";
import type { CreateDsrInput } from "@azentisfieldos/shared";
import { isQueued, localDsrKey, queueDsr, withClientGeneratedIds } from "../../../../lib/offline-db";
import { syncQueuedDsrs } from "../../../../lib/dsr-sync";
import { uploadPhoto } from "../../../../lib/photo-upload";
import { useAuthedFetch } from "../../../../lib/use-authed-fetch";
import { useDsrReferenceData } from "../../../../lib/use-dsr-reference-data";
import { stockStatus, useSiteStock, withStockMeta } from "../../../../lib/use-site-stock";

interface SiteOption {
  id: string;
  name: string;
}

interface CrewRow {
  teamMemberId: string;
  name?: string;
  attended: boolean;
}

interface ConsumptionRow {
  clientGeneratedId: string;
  materialSizeId: string | null;
  quantity: string;
  activityReference: string;
}

interface RmcRow {
  clientGeneratedId: string;
  vendorId: string | null;
  quantityM3: string;
  grade: string;
  ratePerM3: string;
}

interface ExpenseRow {
  clientGeneratedId: string;
  categoryId: string | null;
  amount: string;
  description: string;
}

interface EquipmentRow {
  type: "MACHINERY" | "VEHICLE";
  id: string;
  name: string;
}

interface PhotoItem {
  localId: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// Mobile Site Supervisor DSR entry (FR-28). Every reference field —
// Material, crew member, RMC Vendor, Expense Category, equipment — is a
// searchable picker over the real master-data list endpoints (Epics
// 4/6/8/9/11), so the Supervisor types a name fragment and selects; the
// internal id is carried, never shown or typed. Rows carry their
// clientGeneratedId from the moment they're added (AD-8), so a re-submit
// — online double-tap or offline-queue retry — upserts the same
// sub-records instead of duplicating them.
function NewDsrForm() {
  const authedFetch = useAuthedFetch();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<SiteOption[]>([]);
  // Site detail's "Today's DSR" action deep-links here with ?siteId= so
  // the Site arrives pre-selected (Site → Today's DSR → report).
  const [siteId, setSiteId] = useState(() => searchParams.get("siteId") ?? "");
  const [reportDate, setReportDate] = useState(todayDate());
  const [workCompleted, setWorkCompleted] = useState("");
  const [issuesBlockers, setIssuesBlockers] = useState("");

  const reference = useDsrReferenceData();
  // FR-14: what's actually on hand at the selected Site, shown inside the
  // Material picker and under each selected Material — the Supervisor
  // sees "80 Bags available" before the stock-safety check would reject.
  const siteStock = useSiteStock(siteId);
  const materialOptions = useMemo(
    () => (siteId ? withStockMeta(reference.materialOptions, siteStock) : reference.materialOptions),
    [reference.materialOptions, siteId, siteStock],
  );

  const [crew, setCrew] = useState<CrewRow[]>([]);
  const [newCrewId, setNewCrewId] = useState<string | null>(null);

  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>([]);
  const [rmcEntries, setRmcEntries] = useState<RmcRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentRow[]>([]);
  const [newEquipmentId, setNewEquipmentId] = useState<string | null>(null);

  // FR-30: photos are staged locally as they're captured (like every other
  // field) and uploaded once the DSR itself has synced and has a real id —
  // never eagerly against a not-yet-submitted DSR, since the sub-record
  // upsert loops (story 3.2) tolerate an empty array on re-submission but
  // the DSR's own `equipmentUsed` JSON column does not: an eager "ensure
  // this DSR exists" call with empty defaults would silently wipe an
  // already-synced report's equipment tags. Story 3.2's offline queue
  // doesn't carry photo bytes — if the submission itself queues offline,
  // staged photos stay pending until the Supervisor is back online and
  // resubmits with this page still open (see Completion Notes).
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dailySiteReportId, setDailySiteReportId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // A staged photo belongs to whichever Site/date it was captured under —
  // changing either invalidates the DSR id photos would otherwise upload
  // against, so start over rather than risk attaching a photo to the wrong
  // report. Adjusted during render (React's documented pattern for
  // resetting state when a derived key changes) rather than in an effect,
  // which would cause an extra visible render of the stale photo list.
  const [photoResetKey, setPhotoResetKey] = useState(() => localDsrKey(siteId, reportDate));
  const submissionKey = localDsrKey(siteId, reportDate);
  if (submissionKey !== photoResetKey) {
    setPhotoResetKey(submissionKey);
    setPhotos([]);
    setDailySiteReportId(null);
  }

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // AC #1/#2: "queued" = saved on device, waiting for connectivity;
  // "synced" = confirmed landed on the server. Never a single ambiguous
  // pending spinner (EXPERIENCE.md).
  const [syncState, setSyncState] = useState<"queued" | "synced" | null>(null);

  const currentKeyRef = useRef(localDsrKey(siteId, reportDate));

  useEffect(() => {
    authedFetch(`/sites`)
      .then((res) => res.json())
      .then((data: SiteOption[]) => setSites(data))
      .catch(() => setSites([]));
  }, [authedFetch]);

  // Reflect whether the currently-selected Site/date already has a queued
  // (not-yet-synced) local entry — covers the Supervisor reopening the app
  // before it's had a chance to sync (EXPERIENCE.md flow 1, step 6).
  useEffect(() => {
    currentKeyRef.current = localDsrKey(siteId, reportDate);
    if (!siteId || !reportDate) {
      return;
    }
    let cancelled = false;
    isQueued(siteId, reportDate).then((queued) => {
      if (!cancelled) setSyncState(queued ? "queued" : null);
    });
    return () => {
      cancelled = true;
    };
  }, [siteId, reportDate]);

  // Task 3: drain the local queue whenever connectivity returns, and poll
  // as a fallback since mobile browsers don't always fire `online`
  // reliably. Silent on success — no dialog, no navigation change.
  useEffect(() => {
    const trigger = () => {
      syncQueuedDsrs(authedFetch, (localKey) => {
        if (localKey === currentKeyRef.current) setSyncState("synced");
      });
    };

    trigger();
    window.addEventListener("online", trigger);
    const interval = setInterval(trigger, 20000);

    return () => {
      window.removeEventListener("online", trigger);
      clearInterval(interval);
    };
  }, [authedFetch]);

  // AC #1: crew checklist pre-populated from the Site's most recent prior
  // attendance ("yesterday" = last day this Site had any, not date - 1).
  useEffect(() => {
    if (!siteId || !reportDate) return;
    authedFetch(`/dsr/defaults?siteId=${siteId}&date=${reportDate}`)
      .then((res) => res.json())
      .then((defaults: { teamMemberId: string; name: string }[]) => {
        setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true })));
      })
      .catch(() => setCrew([]));
  }, [siteId, reportDate, authedFetch]);

  function toggleAttended(teamMemberId: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, attended: !r.attended } : r)));
  }

  function addCrewMember(teamMemberId: string | null) {
    setNewCrewId(teamMemberId);
    if (!teamMemberId) return;
    const option = reference.teamMemberOptions.find((o) => o.value === teamMemberId);
    setCrew((rows) =>
      rows.some((r) => r.teamMemberId === teamMemberId)
        ? rows
        : [...rows, { teamMemberId, name: option?.label, attended: true }],
    );
    // Selection consumed into the checklist — reset the picker for the
    // next crew member.
    setNewCrewId(null);
  }

  function addEquipment(optionValue: string | null) {
    setNewEquipmentId(optionValue);
    if (!optionValue) return;
    const option = reference.equipmentOptions.find((o) => o.value === optionValue);
    if (!option) return;
    const id = optionValue.split(":")[1] ?? optionValue;
    setEquipmentUsed((rows) =>
      rows.some((r) => r.id === id) ? rows : [...rows, { type: option.equipmentType, id, name: option.name }],
    );
    setNewEquipmentId(null);
  }

  async function uploadStagedPhoto(dsrId: string, localId: string, file: File) {
    setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "uploading" } : p)));
    try {
      await uploadPhoto(authedFetch, dsrId, file);
      setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "uploaded" } : p)));
    } catch {
      setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "failed" } : p)));
    }
  }

  function handlePhotoCapture(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const newPhotos: PhotoItem[] = Array.from(fileList).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));
    setPhotos((rows) => [...rows, ...newPhotos]);

    // Already-synced DSR (e.g. adding a photo after Submit) — upload right
    // away instead of waiting for another Submit click.
    if (dailySiteReportId) {
      for (const photo of newPhotos) {
        void uploadStagedPhoto(dailySiteReportId, photo.localId, photo.file);
      }
    }
  }

  function removePhoto(localId: string) {
    setPhotos((rows) => {
      const target = rows.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return rows.filter((p) => p.localId !== localId);
    });
  }

  function retryPhoto(localId: string) {
    const photo = photos.find((p) => p.localId === localId);
    if (!photo || !dailySiteReportId) return;
    void uploadStagedPhoto(dailySiteReportId, photo.localId, photo.file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateDsrInput = withClientGeneratedIds({
        siteId,
        reportDate,
        workCompleted: workCompleted || undefined,
        issuesBlockers: issuesBlockers || undefined,
        workRecords: crew.map((c) => ({ teamMemberId: c.teamMemberId, attended: c.attended })),
        consumptions: consumptions
          .filter((c) => c.materialSizeId && c.quantity)
          .map((c) => ({
            clientGeneratedId: c.clientGeneratedId,
            materialSizeId: c.materialSizeId!,
            quantity: Number(c.quantity),
            activityReference: c.activityReference || undefined,
          })),
        rmcEntries: rmcEntries
          .filter((r) => r.vendorId && r.quantityM3 && r.grade && r.ratePerM3)
          .map((r) => ({
            clientGeneratedId: r.clientGeneratedId,
            vendorId: r.vendorId!,
            quantityM3: Number(r.quantityM3),
            grade: r.grade,
            ratePerM3: Number(r.ratePerM3),
          })),
        expenses: expenses
          .filter((e) => e.categoryId && e.amount)
          .map((e) => ({
            clientGeneratedId: e.clientGeneratedId,
            categoryId: e.categoryId!,
            amount: Number(e.amount),
            description: e.description || undefined,
          })),
        equipmentUsed,
      });

      // Submitting never fails from the Supervisor's point of view (Task 1)
      // — a network failure, timeout, or 5xx falls back to the local queue
      // instead of surfacing an error.
      let res: Response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        res = await authedFetch(`/dsr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        await queueDsr(payload);
        setSyncState("queued");
        return;
      }

      if (res.status === 409) {
        const body = await res.json();
        setError(body.message ?? "This report could not be saved — a conflicting entry already exists.");
        return;
      }
      if (res.status >= 500) {
        await queueDsr(payload);
        setSyncState("queued");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const code = (body as { error?: { code?: string; message?: string } } | null)?.error;
        setError(
          code?.code === "INSUFFICIENT_STOCK"
            ? (code.message ?? "Not enough Site Stock for a Material on this report.")
            : "Something went wrong submitting this report. Please try again.",
        );
        return;
      }

      const dsr = (await res.json()) as { id: string };
      setDailySiteReportId(dsr.id);
      setSyncState("synced");
      for (const photo of photos) {
        if (photo.status !== "uploaded") {
          void uploadStagedPhoto(dsr.id, photo.localId, photo.file);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-160">
      <Link
        href="/daily-activity"
        className="mb-4 inline-block text-body-sm font-medium text-accent-teal-700 hover:underline"
      >
        ← Back to Daily Activity
      </Link>
      <h1 className="mb-1 text-page-title text-ink-900">Daily Site Report</h1>
      <p className="mb-6 text-body-sm text-ink-500">Log today&apos;s activity in under 5 minutes.</p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <SelectField
            label="Site"
            required
            icon={<MapPinIcon className="size-4" />}
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <TextField
            label="Date"
            type="date"
            required
            icon={<CalendarIcon className="size-4" />}
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
          {/* Multiline — a day's work summary is narrative text, not a
              one-line value (the shared TextareaField, per AD-5). */}
          <TextareaField
            label="Work completed"
            rows={3}
            value={workCompleted}
            onChange={(e) => setWorkCompleted(e.target.value)}
          />
          <TextareaField
            label="Issues / blockers"
            rows={2}
            hint="Optional"
            value={issuesBlockers}
            onChange={(e) => setIssuesBlockers(e.target.value)}
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Crew present today</h2>
          {crew.length === 0 ? (
            <p className="mb-3 text-body-sm text-ink-500">No prior attendance found — add crew members below.</p>
          ) : null}
          <ul className="mb-3 flex flex-col gap-2">
            {crew.map((row) => (
              <li key={row.teamMemberId} className="flex items-center gap-3">
                {/* size-5 box + a label that stretches the row: the whole
                    name is a ~44px-tall tap target (gloves-and-glare rule),
                    not just the checkbox square. */}
                <input
                  type="checkbox"
                  id={`crew-${row.teamMemberId}`}
                  checked={row.attended}
                  onChange={() => toggleAttended(row.teamMemberId)}
                  className="size-5 shrink-0 accent-accent-teal-700"
                />
                <label htmlFor={`crew-${row.teamMemberId}`} className="flex-1 py-2.5 text-body-sm text-ink-900">
                  {row.name ?? "Crew member"}
                </label>
                {row.attended ? <Badge variant="success">Present</Badge> : <Badge variant="neutral">Absent</Badge>}
              </li>
            ))}
          </ul>
          <ComboboxField
            label="Add crew member"
            icon={<UserIcon className="size-4" />}
            options={reference.teamMemberOptions}
            value={newCrewId}
            onValueChange={addCrewMember}
            loading={reference.loading}
            placeholder="Type a name…"
            emptyMessage={reference.loadFailed ? "Couldn't load Team Members — check your connection" : "No matching Team Member"}
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Materials consumed</h2>
          {consumptions.map((row, index) => {
            const stock = siteId
              ? stockStatus({ stock: siteStock, materialSizeId: row.materialSizeId, quantity: row.quantity, location: "this Site" })
              : undefined;
            // The unit is already on the picked option (its description) —
            // restate it on the quantity label so "50" is never ambiguous.
            const unit = materialOptions.find((option) => option.value === row.materialSizeId)?.description;
            return (
              <div
                key={row.clientGeneratedId}
                className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
              >
                <ComboboxField
                  label="Material"
                  className="sm:col-span-7"
                  options={materialOptions}
                  value={row.materialSizeId}
                  onValueChange={(value) =>
                    setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: value } : r)))
                  }
                  loading={reference.loading}
                  placeholder="Type a Material name…"
                  hint={stock?.text}
                  hintTone={stock?.tone}
                  emptyMessage={reference.loadFailed ? "Couldn't load Materials — check your connection" : "No matching Material"}
                />
                <div className="sm:col-span-3">
                  <TextField
                    label={unit ? `Quantity (${unit})` : "Quantity"}
                    type="number"
                    min={0}
                    step="any"
                    value={row.quantity}
                    onChange={(e) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)))}
                  />
                </div>
                <div className="sm:col-span-2 sm:mt-6 sm:justify-self-end">
                  <Button type="button" variant="ghost" onClick={() => setConsumptions((rows) => rows.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setConsumptions((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), materialSizeId: null, quantity: "", activityReference: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add material
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">RMC used</h2>
          {rmcEntries.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Vendor"
                className="sm:col-span-4"
                options={reference.vendorOptions}
                value={row.vendorId}
                onValueChange={(value) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Vendor name…"
                emptyMessage={reference.loadFailed ? "Couldn't load Vendors — check your connection" : "No matching Vendor"}
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Quantity (m³)"
                  type="number"
                  min={0}
                  step="any"
                  value={row.quantityM3}
                  onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, quantityM3: e.target.value } : r)))}
                />
              </div>
              {reference.rmcGradeOptions.length > 0 ? (
                <ComboboxField
                  label="Grade"
                  className="sm:col-span-2"
                  options={reference.rmcGradeOptions.map((g) => ({ value: g, label: g }))}
                  value={row.grade || null}
                  onValueChange={(value) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, grade: value ?? "" } : r)))}
                  placeholder="e.g. M25"
                  emptyMessage="No matching grade — add it under Materials → RMC"
                />
              ) : (
                <div className="sm:col-span-2">
                  <TextField
                    label="Grade"
                    placeholder="e.g. M20, M25"
                    value={row.grade}
                    onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, grade: e.target.value } : r)))}
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <AmountField
                  label="Rate per m³"
                  value={row.ratePerM3}
                  onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, ratePerM3: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-2 sm:mt-6 sm:justify-self-end">
                <Button type="button" variant="ghost" onClick={() => setRmcEntries((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRmcEntries((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), vendorId: null, quantityM3: "", grade: "", ratePerM3: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add RMC delivery
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Expenses</h2>
          {expenses.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Category"
                className="sm:col-span-4"
                options={reference.expenseCategoryOptions}
                value={row.categoryId}
                onValueChange={(value) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, categoryId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Category…"
                emptyMessage={reference.loadFailed ? "Couldn't load Categories — check your connection" : "No matching Category"}
              />
              <div className="sm:col-span-3">
                <AmountField
                  label="Amount"
                  value={row.amount}
                  onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-3">
                <TextField
                  label="Description"
                  hint="Optional"
                  value={row.description}
                  onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-2 sm:mt-6 sm:justify-self-end">
                <Button type="button" variant="ghost" onClick={() => setExpenses((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setExpenses((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), categoryId: null, amount: "", description: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add expense
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Equipment used today</h2>
          {equipmentUsed.length > 0 ? (
            <ul className="mb-3 flex flex-col gap-2">
              {equipmentUsed.map((row) => (
                <li key={row.id} className="flex items-center gap-2">
                  <TruckIcon className="size-4 text-ink-500" />
                  <span className="flex-1 text-body-sm text-ink-900">{row.name}</span>
                  <Badge variant="neutral">{row.type === "MACHINERY" ? "Machinery" : "Vehicle"}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEquipmentUsed((rows) => rows.filter((r) => r.id !== row.id))}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <ComboboxField
            label="Add machinery or vehicle"
            icon={<TruckIcon className="size-4" />}
            options={reference.equipmentOptions}
            value={newEquipmentId}
            onValueChange={addEquipment}
            loading={reference.loading}
            placeholder="Type a machine name or vehicle number…"
            emptyMessage={
              reference.loadFailed
                ? "Couldn't load the registers — check your connection"
                : "No matching Machinery or Vehicle in the registers"
            }
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Site Photos</h2>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.localId} className="flex w-16 flex-col items-center gap-1">
                <div className="relative size-16 overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local
                      blob: preview of a just-captured File, not an optimizable
                      remote/static asset. */}
                  <img src={photo.previewUrl} alt="" className="size-full object-cover" />
                  {photo.status === "uploading" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-0/70 text-caption text-ink-500">
                      Uploading…
                    </div>
                  ) : null}
                  {photo.status === "uploaded" ? (
                    <CheckCircleIcon className="absolute right-0.5 bottom-0.5 size-4 rounded-full bg-surface-1 text-success-700" />
                  ) : null}
                </div>
                {/* px/py padding widens the tap area well past the caption
                    text itself — these are field-thumb targets, not desktop
                    links. */}
                {photo.status === "failed" ? (
                  <button
                    type="button"
                    onClick={() => retryPhoto(photo.localId)}
                    className="flex min-h-8 items-center gap-1 px-2 py-1.5 text-caption text-danger-700 underline"
                  >
                    <RotateCcwIcon className="size-3" />
                    Retry
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.localId)}
                    className="min-h-8 px-2 py-1.5 text-caption text-ink-500 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoCapture(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              title="Add photo"
              aria-label="Add photo"
              onClick={() => photoInputRef.current?.click()}
              className="flex size-16 items-center justify-center rounded-md border border-dashed border-border-strong text-ink-500 hover:border-accent-teal-700 hover:text-accent-teal-700"
            >
              <CameraIcon className="size-5" />
            </button>
          </div>
        </Card>

        {syncState === "queued" ? (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-warning-100 p-3 text-body-sm text-warning-700">
            <WifiOffIcon className="size-5 shrink-0" />
            Saved on device — will sync when back online
          </p>
        ) : null}
        {syncState === "synced" ? (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-success-100 p-3 text-body-sm text-success-700">
            <CheckCircleIcon className="size-5 shrink-0" />
            Synced
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" isLoading={isSubmitting} disabled={!siteId} className="w-full justify-center">
          <CheckCircleIcon className="size-4" />
          Submit Daily Site Report
        </Button>
      </form>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary during prerendering —
// the fallback is never visible in practice (the params are synchronously
// available on the client).
export default function NewDsrPage() {
  return (
    <Suspense fallback={null}>
      <NewDsrForm />
    </Suspense>
  );
}
