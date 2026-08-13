"use client";

import { type DragEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CameraIcon, PlusIcon, RotateCcwIcon, SelectField, TextField } from "@azentisfieldos/ui";
import type { CreateDsrInput } from "@azentisfieldos/shared";
import { uploadPhoto } from "../../../../lib/photo-upload";

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
  materialSizeId: string;
  quantity: string;
  activityReference: string;
}

interface RmcRow {
  vendorId: string;
  quantityM3: string;
  grade: string;
  ratePerM3: string;
}

interface ExpenseRow {
  categoryId: string;
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
  consumptions: ConsumptionRow[];
  rmcEntries: RmcRow[];
  expenses: ExpenseRow[];
  equipmentUsed: EquipmentRow[];
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

  const [sites, setSites] = useState<SiteOption[]>([]);
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  const [reportDate, setReportDate] = useState(initial?.reportDate ?? todayDate());
  const [workCompleted, setWorkCompleted] = useState(initial?.workCompleted ?? "");
  const [issuesBlockers, setIssuesBlockers] = useState(initial?.issuesBlockers ?? "");
  const [reason, setReason] = useState("");

  const [crew, setCrew] = useState<CrewRow[]>(initial?.workRecords ?? []);
  const [newCrewId, setNewCrewId] = useState("");

  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>(initial?.consumptions ?? []);
  const [rmcEntries, setRmcEntries] = useState<RmcRow[]>(initial?.rmcEntries ?? []);
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initial?.expenses ?? []);
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentRow[]>(initial?.equipmentUsed ?? []);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sites`)
      .then((res) => res.json())
      .then((data: SiteOption[]) => setSites(data))
      .catch(() => setSites([]));
  }, []);

  // AC #1: crew checklist pre-populated from the Site's most recent prior
  // attendance — same behavior as the mobile flow. Not applicable in
  // "correct" mode, which pre-fills from the report being corrected instead.
  useEffect(() => {
    if (mode !== "new" || !siteId || !reportDate) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dsr/defaults?siteId=${siteId}&date=${reportDate}`)
      .then((res) => res.json())
      .then((defaults: { teamMemberId: string; name: string }[]) => {
        setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true })));
      })
      .catch(() => setCrew([]));
  }, [mode, siteId, reportDate]);

  function toggleAttended(teamMemberId: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, attended: !r.attended } : r)));
  }

  function addCrewMember() {
    if (!newCrewId.trim()) return;
    setCrew((rows) => [...rows, { teamMemberId: newCrewId.trim(), attended: true }]);
    setNewCrewId("");
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
        await uploadPhoto(process.env.NEXT_PUBLIC_API_URL ?? "", dailySiteReportId, photo.file);
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
            materialSizeId: c.materialSizeId,
            quantity: Number(c.quantity),
            activityReference: c.activityReference || undefined,
          })),
        rmcEntries: rmcEntries
          .filter((r) => r.vendorId && r.quantityM3 && r.grade && r.ratePerM3)
          .map((r) => ({
            vendorId: r.vendorId,
            quantityM3: Number(r.quantityM3),
            grade: r.grade,
            ratePerM3: Number(r.ratePerM3),
          })),
        expenses: expenses
          .filter((e) => e.categoryId && e.amount)
          .map((e) => ({ categoryId: e.categoryId, amount: Number(e.amount), description: e.description || undefined })),
        equipmentUsed,
      };

      const url =
        mode === "correct" ? `${process.env.NEXT_PUBLIC_API_URL}/dsr/${originalId}/correct` : `${process.env.NEXT_PUBLIC_API_URL}/dsr`;
      const body = mode === "correct" ? { ...payload, reason } : payload;

      const res = await fetch(url, {
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
        setError("Something went wrong submitting this report. Please try again.");
        return;
      }

      const dsr = (await res.json()) as { id: string };
      if (photos.length > 0) {
        await uploadAllPhotos(dsr.id, photos);
      }
      router.push(`/daily-activity/${dsr.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
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
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Site"
          required
          disabled={mode === "correct"}
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <TextField
          label="Date"
          type="date"
          required
          disabled={mode === "correct"}
          hint={mode === "correct" ? "A correction keeps the same Site and date as the report it corrects." : undefined}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
        />
        <TextField label="Work completed" value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} />
        <TextField label="Issues / blockers" hint="Optional" value={issuesBlockers} onChange={(e) => setIssuesBlockers(e.target.value)} />
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
                {row.name ?? row.teamMemberId}
              </label>
              {row.attended ? <Badge variant="success">Present</Badge> : <Badge variant="neutral">Absent</Badge>}
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <TextField label="Add crew member (Team Member ID)" value={newCrewId} onChange={(e) => setNewCrewId(e.target.value)} className="flex-1" />
          <Button type="button" variant="secondary" onClick={addCrewMember}>
            <PlusIcon className="size-4" />
            Add
          </Button>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Materials consumed</h2>
        {consumptions.map((row, index) => (
          <div key={index} className="mb-3 flex flex-wrap items-end gap-2 border-b border-border-hairline pb-3">
            <TextField
              label="Material Size ID"
              value={row.materialSizeId}
              onChange={(e) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: e.target.value } : r)))}
            />
            <TextField
              label="Quantity"
              type="number"
              value={row.quantity}
              onChange={(e) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)))}
            />
            <Button type="button" variant="ghost" onClick={() => setConsumptions((rows) => rows.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConsumptions((rows) => [...rows, { materialSizeId: "", quantity: "", activityReference: "" }])}
        >
          <PlusIcon className="size-4" />
          Add material
        </Button>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">RMC used</h2>
        {rmcEntries.map((row, index) => (
          <div key={index} className="mb-3 flex flex-wrap items-end gap-2 border-b border-border-hairline pb-3">
            <TextField label="Vendor ID" value={row.vendorId} onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: e.target.value } : r)))} />
            <TextField
              label="Quantity (m³)"
              type="number"
              value={row.quantityM3}
              onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, quantityM3: e.target.value } : r)))}
            />
            <TextField label="Grade" value={row.grade} onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, grade: e.target.value } : r)))} />
            <TextField
              label="Rate per m³"
              type="number"
              value={row.ratePerM3}
              onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, ratePerM3: e.target.value } : r)))}
            />
            <Button type="button" variant="ghost" onClick={() => setRmcEntries((rows) => rows.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setRmcEntries((rows) => [...rows, { vendorId: "", quantityM3: "", grade: "", ratePerM3: "" }])}
        >
          <PlusIcon className="size-4" />
          Add RMC delivery
        </Button>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Expenses</h2>
        {expenses.map((row, index) => (
          <div key={index} className="mb-3 flex flex-wrap items-end gap-2 border-b border-border-hairline pb-3">
            <TextField label="Expense Category ID" value={row.categoryId} onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, categoryId: e.target.value } : r)))} />
            <TextField label="Amount" type="number" value={row.amount} onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r)))} />
            <TextField
              label="Description"
              hint="Optional"
              value={row.description}
              onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)))}
            />
            <Button type="button" variant="ghost" onClick={() => setExpenses((rows) => rows.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setExpenses((rows) => [...rows, { categoryId: "", amount: "", description: "" }])}>
          <PlusIcon className="size-4" />
          Add expense
        </Button>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Equipment used</h2>
        {equipmentUsed.map((row, index) => (
          <div key={index} className="mb-3 flex flex-wrap items-end gap-2 border-b border-border-hairline pb-3">
            <SelectField
              label="Type"
              value={row.type}
              onChange={(e) => setEquipmentUsed((rows) => rows.map((r, i) => (i === index ? { ...r, type: e.target.value as "MACHINERY" | "VEHICLE" } : r)))}
              options={[
                { value: "MACHINERY", label: "Machinery" },
                { value: "VEHICLE", label: "Vehicle" },
              ]}
            />
            <TextField
              label="Name"
              hint="e.g. JCB 3DX"
              value={row.name}
              onChange={(e) => setEquipmentUsed((rows) => rows.map((r, i) => (i === index ? { ...r, name: e.target.value } : r)))}
            />
            <Button type="button" variant="ghost" onClick={() => setEquipmentUsed((rows) => rows.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setEquipmentUsed((rows) => [...rows, { type: "MACHINERY", id: crypto.randomUUID(), name: "" }])}>
          <PlusIcon className="size-4" />
          Add equipment
        </Button>
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
        {mode === "correct" ? "Submit Correction" : "Submit Daily Activity"}
      </Button>
    </form>
  );
}
