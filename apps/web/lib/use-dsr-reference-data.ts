"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComboboxFieldOption } from "@azentisfieldos/ui";
import { rmcGradeOptions } from "./rmc-grades";
import { useAuthedFetch } from "./use-authed-fetch";

// One load of every reference list the DSR entry surfaces need for their
// pickers (FR-28: "every list-selection field uses search/dropdown, never
// free-typing"). Lists are full dumps by API design (no server-side
// search), so the ComboboxField filters client-side. Shared by the mobile
// and desktop DSR forms so both stay option-for-option identical.
export interface EquipmentOption extends ComboboxFieldOption {
  equipmentType: "MACHINERY" | "VEHICLE" | "OTHER";
  name: string;
}

// Client-readiness batch (goal 2): a synthetic, always-present option for a
// vehicle that isn't in either register — picking it reveals a free-text
// description field instead of resolving to a Machinery/Vehicle id. Never
// looked up against either register, so it can never create/update a
// Vehicle row (the boundary the spec requires).
export const OTHER_VEHICLE_OPTION_VALUE = "other:other-vehicle";

const OTHER_VEHICLE_OPTION: EquipmentOption = {
  value: OTHER_VEHICLE_OPTION_VALUE,
  label: "Other Vehicle (not in register)",
  description: "Type a description — plate number, hired dumper, etc.",
  equipmentType: "OTHER",
  name: "Other Vehicle",
};

export interface DsrReferenceData {
  materialOptions: ComboboxFieldOption[];
  teamMemberOptions: ComboboxFieldOption[];
  vendorOptions: ComboboxFieldOption[];
  expenseCategoryOptions: ComboboxFieldOption[];
  equipmentOptions: EquipmentOption[];
  /** Existing Subcontractor register (goal 5) — same `onCreateNew` combobox
   * pattern as Vendor. */
  subcontractorOptions: ComboboxFieldOption[];
  /** Vehicle Types, needed only to render VehicleQuickCreateModal's own
   * Type field — not itself a picker option list. */
  vehicleTypeOptions: NamedListItem[];
  /** Grade names from the "RMC" Material Category — empty when the tenant
   * hasn't configured one, in which case Grade stays free text. */
  rmcGradeOptions: string[];
  loading: boolean;
  /** True when any list failed to load (e.g. offline) — pickers stay
   * usable-empty rather than looking broken. */
  loadFailed: boolean;
  /** Inline "+ Add" quick-create support: prepend a just-created record into
   * the relevant list without a re-fetch, so it's immediately selectable
   * (the picker's own options array is the single source of truth for both
   * the initial fetch and any quick-created addition). */
  addMaterialOption: (option: ComboboxFieldOption) => void;
  addVendorOption: (option: ComboboxFieldOption) => void;
  addTeamMemberOption: (option: ComboboxFieldOption) => void;
  addSubcontractorOption: (option: ComboboxFieldOption) => void;
  /** Prepends a just-created Vehicle into equipmentOptions (before the
   * always-last Other Vehicle option) so it's immediately selectable. */
  addVehicleOption: (option: { id: string; name: string }) => void;
}

interface MaterialListItem {
  id: string;
  name: string;
  isActive: boolean;
  category: { name: string };
  unit: { name: string } | null;
  sizes: { id: string; label: string }[];
}

interface TeamMemberListItem {
  id: string;
  name: string;
  designation?: string | null;
  employmentType?: { name: string } | null;
}

interface NamedListItem {
  id: string;
  name: string;
}

interface MachineryListItem {
  id: string;
  name: string;
  assetNumber?: string | null;
  type?: { name: string } | null;
}

interface VehicleListItem {
  id: string;
  number: string;
  type?: { name: string } | null;
}

type DsrReferenceListData = Omit<
  DsrReferenceData,
  "addMaterialOption" | "addVendorOption" | "addTeamMemberOption" | "addSubcontractorOption" | "addVehicleOption"
>;

const EMPTY: Omit<DsrReferenceListData, "loading" | "loadFailed"> = {
  materialOptions: [],
  teamMemberOptions: [],
  vendorOptions: [],
  expenseCategoryOptions: [],
  equipmentOptions: [OTHER_VEHICLE_OPTION],
  subcontractorOptions: [],
  vehicleTypeOptions: [],
  rmcGradeOptions: [],
};

export function useDsrReferenceData(): DsrReferenceData {
  const authedFetch = useAuthedFetch();
  const [data, setData] = useState<DsrReferenceListData>({
    ...EMPTY,
    loading: true,
    loadFailed: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchList<T>(path: string): Promise<T[]> {
      const res = await authedFetch(path);
      if (!res.ok) throw new Error(`GET ${path} failed`);
      return (await res.json()) as T[];
    }

    Promise.all([
      fetchList<MaterialListItem>("/materials"),
      fetchList<TeamMemberListItem>("/team-members"),
      fetchList<NamedListItem>("/vendors"),
      fetchList<NamedListItem>("/expense-categories"),
      fetchList<MachineryListItem>("/machinery"),
      fetchList<VehicleListItem>("/vehicles"),
      fetchList<NamedListItem>("/subcontractors"),
      fetchList<NamedListItem>("/vehicle-types"),
    ])
      .then(([materials, teamMembers, vendors, categories, machinery, vehicles, subcontractors, vehicleTypes]) => {
        if (cancelled) return;
        setData({
          // Consumption is recorded per Material Size, so each size is its
          // own option: "RCC Pipe — 300mm", with the unit as context.
          materialOptions: materials.flatMap((material) =>
            material.sizes.map((size) => ({
              value: size.id,
              label: `${material.name} — ${size.label}`,
              description: material.unit?.name,
            })),
          ),
          teamMemberOptions: teamMembers.map((member) => ({
            value: member.id,
            label: member.name,
            description: member.designation ?? member.employmentType?.name ?? undefined,
          })),
          vendorOptions: vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
          rmcGradeOptions: rmcGradeOptions(materials),
          expenseCategoryOptions: categories.map((category) => ({ value: category.id, label: category.name })),
          equipmentOptions: [
            ...machinery.map(
              (machine): EquipmentOption => ({
                value: `machinery:${machine.id}`,
                label: machine.name,
                description: [machine.type?.name, machine.assetNumber].filter(Boolean).join(" · ") || "Machinery",
                equipmentType: "MACHINERY",
                name: machine.name,
              }),
            ),
            ...vehicles.map(
              (vehicle): EquipmentOption => ({
                value: `vehicle:${vehicle.id}`,
                label: vehicle.number,
                description: vehicle.type?.name ?? "Vehicle",
                equipmentType: "VEHICLE",
                name: vehicle.number,
              }),
            ),
            // Goal 2: always offered, even when the registers are empty —
            // never resolved against either register.
            OTHER_VEHICLE_OPTION,
          ],
          subcontractorOptions: subcontractors.map((s) => ({ value: s.id, label: s.name })),
          vehicleTypeOptions: vehicleTypes,
          loading: false,
          loadFailed: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setData({ ...EMPTY, loading: false, loadFailed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [authedFetch]);

  // Inline quick-create (Vendor/Material/Team Member) prepends into these
  // same lists rather than triggering a re-fetch — the newly created record
  // must be selectable in the very same render its modal closes in.
  const addMaterialOption = useCallback((option: ComboboxFieldOption) => {
    setData((prev) => ({ ...prev, materialOptions: [option, ...prev.materialOptions] }));
  }, []);
  const addVendorOption = useCallback((option: ComboboxFieldOption) => {
    setData((prev) => ({ ...prev, vendorOptions: [option, ...prev.vendorOptions] }));
  }, []);
  const addTeamMemberOption = useCallback((option: ComboboxFieldOption) => {
    setData((prev) => ({ ...prev, teamMemberOptions: [option, ...prev.teamMemberOptions] }));
  }, []);
  const addSubcontractorOption = useCallback((option: ComboboxFieldOption) => {
    setData((prev) => ({ ...prev, subcontractorOptions: [option, ...prev.subcontractorOptions] }));
  }, []);
  // Inserted before the always-last Other Vehicle entry (never after it) so
  // the dropdown order stays List -> Other Vehicle -> "+ Add Vehicle" trigger.
  const addVehicleOption = useCallback((option: { id: string; name: string }) => {
    setData((prev) => ({
      ...prev,
      equipmentOptions: [
        { value: `vehicle:${option.id}`, label: option.name, description: "Vehicle", equipmentType: "VEHICLE", name: option.name },
        ...prev.equipmentOptions.filter((o) => o.value !== OTHER_VEHICLE_OPTION_VALUE),
        OTHER_VEHICLE_OPTION,
      ],
    }));
  }, []);

  return {
    ...data,
    addMaterialOption,
    addVendorOption,
    addTeamMemberOption,
    addSubcontractorOption,
    addVehicleOption,
  };
}
