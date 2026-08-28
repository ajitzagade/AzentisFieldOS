"use client";

import { useEffect, useState } from "react";
import type { ComboboxFieldOption } from "@azentisfieldos/ui";
import { useAuthedFetch } from "./use-authed-fetch";

// One load of every reference list the DSR entry surfaces need for their
// pickers (FR-28: "every list-selection field uses search/dropdown, never
// free-typing"). Lists are full dumps by API design (no server-side
// search), so the ComboboxField filters client-side. Shared by the mobile
// and desktop DSR forms so both stay option-for-option identical.
export interface EquipmentOption extends ComboboxFieldOption {
  equipmentType: "MACHINERY" | "VEHICLE";
  name: string;
}

export interface DsrReferenceData {
  materialOptions: ComboboxFieldOption[];
  teamMemberOptions: ComboboxFieldOption[];
  vendorOptions: ComboboxFieldOption[];
  expenseCategoryOptions: ComboboxFieldOption[];
  equipmentOptions: EquipmentOption[];
  loading: boolean;
  /** True when any list failed to load (e.g. offline) — pickers stay
   * usable-empty rather than looking broken. */
  loadFailed: boolean;
}

interface MaterialListItem {
  id: string;
  name: string;
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

const EMPTY: Omit<DsrReferenceData, "loading" | "loadFailed"> = {
  materialOptions: [],
  teamMemberOptions: [],
  vendorOptions: [],
  expenseCategoryOptions: [],
  equipmentOptions: [],
};

export function useDsrReferenceData(): DsrReferenceData {
  const authedFetch = useAuthedFetch();
  const [data, setData] = useState<DsrReferenceData>({
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
    ])
      .then(([materials, teamMembers, vendors, categories, machinery, vehicles]) => {
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
          ],
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

  return data;
}
