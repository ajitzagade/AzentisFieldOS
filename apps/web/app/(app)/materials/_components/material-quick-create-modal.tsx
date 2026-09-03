"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BoxIcon,
  ComboboxField,
  FilterIcon,
  HashIcon,
  LayersIcon,
  PlusIcon,
  QuickCreateModal,
  TextField,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { useClientValidation } from "@/lib/use-client-validation";
import { createMaterialQuickAction } from "../new/actions";
import { parseCreateMaterialQuickForm } from "../new/parse";

interface CategoryOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface UnitOption {
  id: string;
  name: string;
}

export interface MaterialQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Material is created — the caller prepends { id, name }
   * into its picker's local options and selects it. */
  onSuccess: (material: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the inline
// "+ Add Material" affordance every Material picker gets. Category and Unit
// stay plain, non-creatable ComboboxFields (same as new-material-form.tsx) —
// no "+ Add Category"/"+ Add Unit" nesting here (deferred, see
// deferred-work.md). When either list is empty, the same
// "create one first" guidance the full form shows appears in that field's
// place, scoped to the modal instead of blocking the whole page.
//
// Unlike the full /materials/new form, this modal also collects a Size —
// every Material/Size picker in the app (Purchase/Consumption/Movement/
// Return-Wastage/DSR) selects a materialSizeId, and a Material has zero
// Sizes until one is added via the separate edit-page section (FR-5). A
// quick-created Material with no Size wouldn't even appear as an option,
// so createMaterialQuickAction creates both in one step and resolves the
// new Size's { id, "Material — Size" } as what gets selected.
export function MaterialQuickCreateModal({ open, onOpenChange, onSuccess }: MaterialQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern) like
  // the DSR form's photoResetKey — no ref (refs can't be read/written during
  // render) and no extra visible render from an effect. The Category/Unit
  // selections live in this wrapper (outside the remount boundary), so they
  // reset here too rather than via the key bump alone.
  const [formKey, setFormKey] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFormKey((key) => key + 1);
      setCategoryId("");
      setUnitId("");
    }
  }

  const validation = useClientValidation(parseCreateMaterialQuickForm);
  const authedFetch = useAuthedFetch();
  const [referenceState, setReferenceState] = useState<{
    status: "loading" | "loaded" | "failed";
    categories: CategoryOption[];
    units: UnitOption[];
  }>({ status: "loading", categories: [], units: [] });

  const loadReference = useCallback(
    async (signal: AbortSignal) => {
      setReferenceState((prev) => ({ ...prev, status: "loading" }));
      try {
        const [categoriesRes, unitsRes] = await Promise.all([
          authedFetch("/material-categories", { signal }),
          authedFetch("/units", { signal }),
        ]);
        if (!categoriesRes.ok || !unitsRes.ok) throw new Error("Failed to load Categories/Units");
        const [categories, units]: [unknown, unknown] = await Promise.all([categoriesRes.json(), unitsRes.json()]);
        if (!Array.isArray(categories) || !Array.isArray(units)) throw new Error("Malformed Categories/Units response");
        if (!signal.aborted) {
          setReferenceState({ status: "loaded", categories: categories as CategoryOption[], units: units as UnitOption[] });
        }
      } catch {
        if (!signal.aborted) setReferenceState({ status: "failed", categories: [], units: [] });
      }
    },
    [authedFetch],
  );

  // Fetches only while the modal is open, aborts on close (matches
  // AdvanceQuickEntryTrigger's Team Member fetch precedent).
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    loadReference(controller.signal);
    return () => controller.abort();
  }, [open, loadReference]);

  // AC #3: a disabled Category is hidden here too — still valid for
  // Materials already assigned to it, just not offered on a new one.
  const activeCategories = referenceState.categories.filter((c) => c.isActive);
  const units = referenceState.units;
  const loaded = referenceState.status === "loaded";

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Material"
      description="Creates the same Material record as the full form — available in every Material picker immediately."
      action={createMaterialQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Material"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<LayersIcon className="size-4" />}
            placeholder="e.g. OPC 53 Cement"
            error={errorFor("name")}
          />
          <TextField
            label="Size / Specification"
            name="sizeLabel"
            required
            maxLength={50}
            icon={<HashIcon className="size-4" />}
            placeholder="e.g. 50kg, 12mm dia"
            hint="Every entry form picks a Material by its Size — this creates the first one"
            error={errorFor("sizeLabel")}
          />

          {loaded && activeCategories.length === 0 ? (
            <p className="mb-4 text-body-sm text-ink-500">
              No Categories yet —{" "}
              <Link href="/materials/categories" className="font-semibold text-accent-teal-700 underline">
                create one first
              </Link>
              .
            </p>
          ) : (
            <>
              <ComboboxField
                label="Category"
                required
                icon={<FilterIcon className="size-4" />}
                disabled={!loaded}
                loading={referenceState.status === "loading"}
                options={activeCategories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId || null}
                onValueChange={(value) => setCategoryId(value ?? "")}
                placeholder="Type a Category…"
                emptyMessage={referenceState.status === "failed" ? "Couldn't load Categories — try again" : "No matching Category"}
                error={errorFor("categoryId")}
              />
              <input type="hidden" name="categoryId" value={categoryId} />
            </>
          )}

          {loaded && units.length === 0 ? (
            <p className="mb-4 text-body-sm text-ink-500">
              No Units yet —{" "}
              <Link href="/materials/units" className="font-semibold text-accent-teal-700 underline">
                create one first
              </Link>
              .
            </p>
          ) : (
            <>
              <ComboboxField
                label="Unit"
                required
                icon={<BoxIcon className="size-4" />}
                hint="How this Material is counted — bags, tons, cubic metres..."
                disabled={!loaded}
                loading={referenceState.status === "loading"}
                options={units.map((u) => ({ value: u.id, label: u.name }))}
                value={unitId || null}
                onValueChange={(value) => setUnitId(value ?? "")}
                placeholder="Type a Unit…"
                emptyMessage={referenceState.status === "failed" ? "Couldn't load Units — try again" : "No matching Unit"}
                error={errorFor("unitId")}
              />
              <input type="hidden" name="unitId" value={unitId} />
            </>
          )}
        </>
      )}
    </QuickCreateModal>
  );
}
