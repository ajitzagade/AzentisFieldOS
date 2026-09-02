"use client";

import { type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AmountField,
  Badge,
  Button,
  CalendarIcon,
  Card,
  CameraIcon,
  CheckCircleIcon,
  ComboboxField,
  ConfirmDialog,
  ConfirmDialogRow,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TruckIcon,
  UserIcon,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import type { CreateDsrInput } from "@azentisfieldos/shared";
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

export interface DsrFormInitialValues {
  siteId: string;
  reportDate: string;
  workCompleted: string;
  issuesBlockers: string;
  workRecords: CrewRow[];
  consumptions: Omit<ConsumptionRow, "clientGeneratedId">[];
  rmcEntries: Omit<RmcRow, "clientGeneratedId">[];
  expenses: Omit<ExpenseRow, "clientGeneratedId">[];
  equipmentUsed: EquipmentRow[];
}

// Rows carry a client-generated id from the moment they exist in the form
// (AD-8) so a re-submit upserts the same sub-records instead of
// duplicating them. Pre-filled correction rows get fresh ids — a
// correction always inserts brand-new rows server-side (AD-9).
function withRowIds<T>(rows: T[] | undefined): (T & { clientGeneratedId: string })[] {
  return (rows ?? []).map((row) => ({ ...row, clientGeneratedId: crypto.randomUUID() }));
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// AC #1/#2/#3: the desktop counterpart to Story 3.1's mobile DSR form —
// same fields, same underlying endpoints (POST /dsr, POST /dsr/:id/correct
// from Story 3.5), same photo upload flow (Story 3.3) — only the platform-
// appropriate input methods differ (drag-drop dropzone here vs. mobile's
// camera tap; no offline queue here, since a desktop Owner/Admin session is
// not the field-connectivity scenario Story 3.2 was built for).
export function DsrDesktopForm({
  mode,
  originalId,
  initial,
}: {
  mode: "new" | "correct";
  originalId?: string;
  initial?: DsrFormInitialValues;
}) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  // Distinguish "still fetching" from "fetch failed" so the Site picker can
  // say which one is happening instead of silently offering an empty list
  // (AD-6).
  const [sitesState, setSitesState] = useState<{ status: "loading" | "loaded" | "failed"; sites: SiteOption[] }>({
    status: "loading",
    sites: [],
  });
  const sites = sitesState.sites;
  const reference = useDsrReferenceData();
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  // FR-14: current availability at the selected Site, inside the Material
  // picker options and under each selected Material.
  const siteStock = useSiteStock(siteId);
  const materialOptions = useMemo(
    () => (siteId ? withStockMeta(reference.materialOptions, siteStock) : reference.materialOptions),
    [reference.materialOptions, siteId, siteStock],
  );
  const [reportDate, setReportDate] = useState(initial?.reportDate ?? todayDate());
  const [workCompleted, setWorkCompleted] = useState(initial?.workCompleted ?? "");
  const [issuesBlockers, setIssuesBlockers] = useState(initial?.issuesBlockers ?? "");
  const [reason, setReason] = useState("");

  const [crew, setCrew] = useState<CrewRow[]>(initial?.workRecords ?? []);
  const [newCrewId, setNewCrewId] = useState<string | null>(null);

  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>(() => withRowIds(initial?.consumptions));
  const [rmcEntries, setRmcEntries] = useState<RmcRow[]>(() => withRowIds(initial?.rmcEntries));
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() => withRowIds(initial?.expenses));
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentRow[]>(initial?.equipmentUsed ?? []);
  const [newEquipmentId, setNewEquipmentId] = useState<string | null>(null);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A DSR correction supersedes the whole report and adjusts Site Stock —
  // held for re-verification before it goes to the ledger (FR-54).
  const confirmation = useSubmitConfirmation();

  useEffect(() => {
    authedFetch(`/sites`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((data: SiteOption[]) =>
        setSitesState({ status: "loaded", sites: Array.isArray(data) ? data : [] }),
      )
      .catch(() => setSitesState({ status: "failed", sites: [] }));
  }, [authedFetch]);

  // AC #1: crew checklist pre-populated from the Site's most recent prior
  // attendance — same behavior as the mobile flow. Not applicable in
  // "correct" mode, which pre-fills from the report being corrected instead.
  useEffect(() => {
    if (mode !== "new" || !siteId || !reportDate) return;
    authedFetch(`/dsr/defaults?siteId=${siteId}&date=${reportDate}`)
      .then((res) => res.json())
      .then((defaults: { teamMemberId: string; name: string }[]) => {
        setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true })));
      })
      .catch(() => setCrew([]));
  }, [mode, siteId, reportDate, authedFetch]);

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

  function addPhotoFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const newPhotos: PhotoItem[] = Array.from(fileList).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));
    setPhotos((rows) => [...rows, ...newPhotos]);
  }

  function removePhoto(localId: string) {
    setPhotos((rows) => rows.filter((p) => p.localId !== localId));
  }

  async function uploadAllPhotos(dailySiteReportId: string, items: PhotoItem[]) {
    for (const photo of items) {
      setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "uploading" } : p)));
      try {
        await uploadPhoto(authedFetch, dailySiteReportId, photo.file);
        setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "uploaded" } : p)));
      } catch {
        setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "failed" } : p)));
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateDsrInput = {
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
      };

      const path = mode === "correct" ? `/dsr/${originalId}/correct` : `/dsr`;
      const body = mode === "correct" ? { ...payload, reason } : payload;

      const res = await authedFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const responseBody = await res.json();
        setError(responseBody.message ?? "This report could not be saved — a conflicting entry already exists.");
        return;
      }
      if (!res.ok) {
        const responseBody = (await res.json().catch(() => null)) as {
          error?: { code?: string; message?: string };
        } | null;
        setError(
          responseBody?.error?.code === "INSUFFICIENT_STOCK"
            ? (responseBody.error.message ?? "Not enough Site Stock for a Material on this report.")
            : "Something went wrong submitting this report. Please try again.",
        );
        return;
      }

      const dsr = (await res.json()) as { id: string };
      if (photos.length > 0) {
        await uploadAllPhotos(dsr.id, photos);
      }
      router.push(
        `/daily-activity/${dsr.id}?flash=${encodeURIComponent(mode === "correct" ? "Correction submitted" : "Daily Report submitted")}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={mode === "correct" ? confirmation.guard(handleSubmit) : handleSubmit}
      className="mx-auto max-w-3xl"
    >
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original report is never edited or deleted (AD-9).
          </p>
          <TextField
            label="Reason for this correction"
            required
            icon={<PencilIcon className="size-4" />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Site"
          required
          icon={<MapPinIcon className="size-4" />}
          disabled={mode === "correct" || sitesState.status === "loading"}
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          options={[
            { value: "", label: sitesState.status === "loading" ? "Loading Sites…" : "Select a Site" },
            ...sites.map((s) => ({ value: s.id, label: s.name })),
          ]}
          error={sitesState.status === "failed" ? "Couldn't load Sites — reload the page to try again" : undefined}
        />
        <TextField
          label="Date"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          disabled={mode === "correct"}
          hint={mode === "correct" ? "A correction keeps the same Site and date as the report it corrects." : undefined}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
        />
        <TextField label="Work completed" icon={<PencilIcon className="size-4" />} value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} />
        <TextField label="Issues / blockers" icon={<PencilIcon className="size-4" />} hint="Optional" value={issuesBlockers} onChange={(e) => setIssuesBlockers(e.target.value)} />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Crew present</h2>
        {crew.length === 0 ? <p className="mb-3 text-body-sm text-ink-500">No crew added yet.</p> : null}
        <ul className="mb-3 flex flex-col gap-2">
          {crew.map((row) => (
            <li key={row.teamMemberId} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`crew-${row.teamMemberId}`}
                checked={row.attended}
                onChange={() => toggleAttended(row.teamMemberId)}
                className="size-4 accent-accent-teal-700"
              />
              <label htmlFor={`crew-${row.teamMemberId}`} className="text-body-sm text-ink-900">
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
          emptyMessage={reference.loadFailed ? "Couldn't load Team Members — try reloading" : "No matching Team Member"}
        />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Materials consumed</h2>
        {consumptions.map((row, index) => {
          const stock = siteId
            ? stockStatus({ stock: siteStock, materialSizeId: row.materialSizeId, quantity: row.quantity, location: "this Site" })
            : undefined;
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
                onValueChange={(value) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Material name…"
                hint={stock?.text}
                hintTone={stock?.tone}
                emptyMessage={reference.loadFailed ? "Couldn't load Materials — try reloading" : "No matching Material"}
              />
              <div className="sm:col-span-3">
                <TextField
                  label="Quantity"
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
        <h2 className="mb-3 text-card-title text-ink-900">RMC (ready-mix concrete) used</h2>
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
              emptyMessage={reference.loadFailed ? "Couldn't load Vendors — try reloading" : "No matching Vendor"}
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
              emptyMessage={reference.loadFailed ? "Couldn't load Categories — try reloading" : "No matching Category"}
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
        <h2 className="mb-3 text-card-title text-ink-900">Equipment used</h2>
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
              ? "Couldn't load the registers — try reloading"
              : "No matching Machinery or Vehicle in the registers"
          }
        />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Site Photos</h2>
        {/* AC #3: drag-drop dropzone — desktop's platform-appropriate input
            method, same underlying presign/upload/confirm flow as mobile's
            camera tap (apps/web/lib/photo-upload.ts, story 3.3). */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(e: DragEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e: DragEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsDraggingOver(false);
            addPhotoFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-body-sm text-ink-500 transition-colors ${
            isDraggingOver ? "border-accent-teal-700 bg-accent-teal-100 text-accent-teal-700" : "border-border-strong"
          }`}
        >
          <CameraIcon className="size-6" />
          Drag and drop photos here, or click to select
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotoFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {photos.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.localId} className="flex w-16 flex-col items-center gap-1">
                <div className="relative size-16 overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local
                      blob: preview of a just-selected/dropped File. */}
                  <img src={photo.previewUrl} alt="" className="size-full object-cover" />
                  {photo.status === "uploading" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-0/70 text-caption text-ink-500">…</div>
                  ) : null}
                </div>
                <button type="button" onClick={() => removePhoto(photo.localId)} className="text-caption text-ink-500 underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {error ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} disabled={!siteId || (mode === "correct" && !reason)} className="w-full justify-center">
        {mode === "correct" ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
        {mode === "correct" ? "Submit Correction" : "Submit Daily Report"}
      </Button>

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Submit this correction?"
        description="This supersedes the original report with the restated details below — the original stays on record (AD-9)."
        confirmLabel="Submit Correction"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Crew present" value={crew.filter((c) => c.attended).length} />
        <ConfirmDialogRow label="Materials consumed" value={consumptions.filter((c) => c.materialSizeId && c.quantity).length} />
        <ConfirmDialogRow label="RMC deliveries" value={rmcEntries.filter((r) => r.vendorId && r.quantityM3).length} />
        <ConfirmDialogRow label="Expenses" value={expenses.filter((e) => e.categoryId && e.amount).length} />
        <ConfirmDialogRow label="Reason" value={reason || "—"} />
      </ConfirmDialog>
    </form>
  );
}
