"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CheckCircleIcon,
  ComboboxField,
  DataTable,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StatTile,
  TextField,
  buttonVariants,
  cn,
  useToast,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

// Master-detail Materials taxonomy (FR-4/FR-5): left = Categories, right =
// the selected Category's Materials with an inline quick-add for the common
// case (name + Unit). Master data is edited in place and retired via
// isActive — never deleted — so historical transaction rows that reference
// a Material stay valid (EXPERIENCE.md Edit-vs-Correct distinction).
// Sizes, Custom Fields, and low-stock thresholds keep their richer flows on
// the per-Material edit page.

export interface TaxonomyCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface TaxonomyUnit {
  id: string;
  name: string;
}

export interface TaxonomyMaterial {
  id: string;
  name: string;
  isActive: boolean;
  category: { id: string; name: string };
  unit: { id: string; name: string };
  sizes: { id: string; label: string }[];
}

interface MaterialsTaxonomyProps {
  initialCategories: TaxonomyCategory[];
  initialMaterials: TaxonomyMaterial[];
  units: TaxonomyUnit[];
  /**
   * Pre-fills the Material search box — carried over from Story 16.2's
   * global search "See all N results" action (`/materials?q=...`). Reuses
   * this taxonomy's own existing client-side filter rather than building a
   * second, server-paginated Materials list: Materials is bounded catalog
   * master data, not transaction history, so it was deliberately left out
   * of Story 16.1's server-pagination rollout.
   */
  initialMaterialSearch?: string;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    return message || fallback;
  } catch {
    return fallback;
  }
}

export function MaterialsTaxonomy({
  initialCategories,
  initialMaterials,
  units,
  initialMaterialSearch,
}: MaterialsTaxonomyProps) {
  const authedFetch = useAuthedFetch();
  const toast = useToast();

  const [categories, setCategories] = useState(initialCategories);
  const [materials, setMaterials] = useState(initialMaterials);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    // Landing here with a carried-over search term should show a match, not
    // the default Category's (likely unrelated) Materials — so the first
    // Material matching that term picks its own Category as the starting
    // selection instead of the usual "first active Category" default.
    const search = initialMaterialSearch?.trim().toLowerCase();
    if (search) {
      const match = initialMaterials.find((m) => m.name.toLowerCase().includes(search));
      if (match) return match.category.id;
    }
    return initialCategories.find((c) => c.isActive)?.id ?? initialCategories[0]?.id ?? null;
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState(initialMaterialSearch ?? "");

  // Inline add-category row, toggled by the panel-header + button.
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Inline rename of the selected Category.
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  // Quick-add Material row (the 90% action — no page navigation).
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialUnitId, setNewMaterialUnitId] = useState<string | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [savingMaterial, setSavingMaterial] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  // One refetch after every mutation keeps this screen and the counts in
  // sync with the server instead of hand-patching local state.
  async function loadAll() {
    const [categoriesRes, materialsRes] = await Promise.all([
      authedFetch("/material-categories"),
      authedFetch("/materials"),
    ]);
    if (categoriesRes.ok) setCategories((await categoriesRes.json()) as TaxonomyCategory[]);
    if (materialsRes.ok) setMaterials((await materialsRes.json()) as TaxonomyMaterial[]);
  }

  const materialsByCategory = useMemo(() => {
    const map = new Map<string, TaxonomyMaterial[]>();
    for (const material of materials) {
      const list = map.get(material.category.id) ?? [];
      list.push(material);
      map.set(material.category.id, list);
    }
    return map;
  }, [materials]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;
  const selectedMaterials = selectedCategory ? (materialsByCategory.get(selectedCategory.id) ?? []) : [];

  const visibleCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );
  const visibleMaterials = selectedMaterials.filter((m) =>
    m.name.toLowerCase().includes(materialSearch.trim().toLowerCase()),
  );

  const activeCategories = categories.filter((c) => c.isActive).length;
  const activeMaterials = materials.filter((m) => m.isActive).length;

  async function handleAddCategory(event: FormEvent) {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError("Enter a Category name");
      return;
    }
    setSavingCategory(true);
    setCategoryError(null);
    try {
      const res = await authedFetch("/material-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        setCategoryError(await readErrorMessage(res, "Couldn't add the Category. Please try again."));
        return;
      }
      const created = (await res.json()) as TaxonomyCategory;
      setNewCategoryName("");
      setAddingCategory(false);
      toast.success(`Category "${created.name}" added`);
      await loadAll();
      setSelectedCategoryId(created.id);
    } catch {
      setCategoryError("Couldn't add the Category. Please try again.");
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleRenameCategory(event: FormEvent) {
    event.preventDefault();
    if (!selectedCategory) return;
    const name = renameValue.trim();
    if (!name) {
      setRenameError("Enter a Category name");
      return;
    }
    try {
      const res = await authedFetch(`/material-categories/${selectedCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        setRenameError(await readErrorMessage(res, "Couldn't rename the Category. Please try again."));
        return;
      }
      setRenaming(false);
      setRenameError(null);
      toast.success("Category renamed");
      await loadAll();
    } catch {
      setRenameError("Couldn't rename the Category. Please try again.");
    }
  }

  async function handleToggleCategory() {
    if (!selectedCategory) return;
    try {
      const res = await authedFetch(`/material-categories/${selectedCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !selectedCategory.isActive }),
      });
      if (!res.ok) {
        toast.error(await readErrorMessage(res, "Couldn't update the Category. Please try again."));
        return;
      }
      toast.success(selectedCategory.isActive ? "Category disabled" : "Category enabled");
      await loadAll();
    } catch {
      toast.error("Couldn't update the Category. Please try again.");
    }
  }

  async function handleQuickAddMaterial(event: FormEvent) {
    event.preventDefault();
    if (!selectedCategory) return;
    const name = newMaterialName.trim();
    if (!name) {
      setMaterialError("Enter a Material name");
      return;
    }
    if (!newMaterialUnitId) {
      setMaterialError("Pick a Unit");
      return;
    }
    setSavingMaterial(true);
    setMaterialError(null);
    try {
      const res = await authedFetch("/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryId: selectedCategory.id, unitId: newMaterialUnitId }),
      });
      if (!res.ok) {
        setMaterialError(await readErrorMessage(res, "Couldn't add the Material. Please try again."));
        return;
      }
      setNewMaterialName("");
      setNewMaterialUnitId(null);
      toast.success(`Material "${name}" added to ${selectedCategory.name}`);
      await loadAll();
    } catch {
      setMaterialError("Couldn't add the Material. Please try again.");
    } finally {
      setSavingMaterial(false);
    }
  }

  async function handleToggleMaterial(material: TaxonomyMaterial) {
    setTogglingId(material.id);
    try {
      const res = await authedFetch(`/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !material.isActive }),
      });
      if (!res.ok) {
        toast.error(await readErrorMessage(res, "Couldn't update the Material. Please try again."));
        return;
      }
      toast.success(material.isActive ? `"${material.name}" disabled` : `"${material.name}" enabled`);
      await loadAll();
    } catch {
      toast.error("Couldn't update the Material. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  const materialColumns: DataTableColumn<TaxonomyMaterial>[] = [
    {
      header: "Material",
      cell: (m) => (
        <span className="flex items-center gap-2 font-semibold">
          {m.name}
          {!m.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
        </span>
      ),
    },
    {
      header: "Unit",
      cell: (m) => (
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-caption font-semibold text-ink-700">{m.unit.name}</span>
      ),
    },
    {
      header: "Sizes / Specifications",
      cell: (m) =>
        m.sizes.length === 0 ? (
          <span className="text-ink-500">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {m.sizes.map((size) => (
              <span key={size.id} className="rounded-full bg-surface-3 px-2 py-0.5 text-caption font-semibold text-ink-700">
                {size.label}
              </span>
            ))}
          </div>
        ),
    },
    {
      header: "Status",
      cell: (m) => (m.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Disabled</Badge>),
    },
    {
      header: "",
      align: "right",
      cell: (m) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/materials/${m.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <PencilIcon className="size-4" />
            Edit
          </Link>
          <Button variant="ghost" size="sm" isLoading={togglingId === m.id} onClick={() => handleToggleMaterial(m)}>
            {m.isActive ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  const materialMobileCard: DataTableMobileCard<TaxonomyMaterial> = {
    primary: (m) => (
      <span className="flex items-center gap-2">
        {m.name}
        {!m.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
    omitHeaders: ["Material", "Status"],
    action: (m) => (
      <>
        <Link href={`/materials/${m.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <PencilIcon className="size-4" />
          Edit
        </Link>
        <Button variant="ghost" size="sm" isLoading={togglingId === m.id} onClick={() => handleToggleMaterial(m)}>
          {m.isActive ? "Disable" : "Enable"}
        </Button>
      </>
    ),
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<LayersIcon />} value={categories.length} label="Categories" />
        <StatTile icon={<CheckCircleIcon />} value={activeCategories} label="Active Categories" tint="success" />
        <StatTile icon={<LayersIcon />} value={materials.length} label="Total Materials" />
        <StatTile icon={<CheckCircleIcon />} value={activeMaterials} label="Active Materials" tint="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        {/* Master: Categories */}
        <Card className="lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-card-title text-ink-900">Categories</h2>
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={addingCategory}
              onClick={() => {
                setAddingCategory((open) => !open);
                setCategoryError(null);
              }}
            >
              <PlusIcon className="size-4" />
              Add Category
            </Button>
          </div>

          {addingCategory ? (
            <form onSubmit={handleAddCategory} noValidate className="mb-2 flex items-start gap-2">
              <div className="flex-1">
                <TextField
                  label="New Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Cement, Electrical"
                  error={categoryError ?? undefined}
                />
              </div>
              <Button type="submit" isLoading={savingCategory} className="mt-6">
                Add
              </Button>
            </form>
          ) : null}

          <TextField
            label="Search Categories"
            icon={<SearchIcon className="size-4" />}
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search Categories…"
          />

          {visibleCategories.length === 0 ? (
            <p className="text-body-sm text-ink-500">
              {categories.length === 0 ? "No Categories yet — add your first one above." : "No matching Category."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {visibleCategories.map((category) => {
                const list = materialsByCategory.get(category.id) ?? [];
                const activeCount = list.filter((m) => m.isActive).length;
                const selected = category.id === selectedCategoryId;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setMaterialSearch("");
                        setRenaming(false);
                        setMaterialError(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors duration-(--default-transition-duration) ease-(--ease-standard)",
                        selected ? "bg-surface-3" : "hover:bg-surface-2",
                      )}
                    >
                      <span className="min-w-0">
                        <span className={cn("block truncate text-body-sm text-ink-900", selected && "font-semibold")}>
                          {category.name}
                        </span>
                        <span className="block text-eyebrow text-ink-500">
                          {activeCount} active {activeCount === 1 ? "Material" : "Materials"}
                        </span>
                      </span>
                      {!category.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Detail: the selected Category's Materials */}
        <Card className="lg:col-span-8">
          {!selectedCategory ? (
            <p className="text-body-sm text-ink-500">Select a Category to see its Materials.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                {renaming ? (
                  <form onSubmit={handleRenameCategory} noValidate className="flex flex-1 items-start gap-2">
                    <div className="min-w-40 flex-1">
                      <TextField
                        label="Category name"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={100}
                        error={renameError ?? undefined}
                      />
                    </div>
                    <Button type="submit" size="sm" className="mt-6">
                      Save
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="mt-6" onClick={() => setRenaming(false)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div>
                    <h2 className="flex items-center gap-2 text-card-title text-ink-900">
                      {selectedCategory.name}
                      {selectedCategory.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Disabled</Badge>
                      )}
                    </h2>
                    <p className="text-body-sm text-ink-500">
                      {selectedMaterials.filter((m) => m.isActive).length} active{" "}
                      {selectedMaterials.filter((m) => m.isActive).length === 1 ? "Material" : "Materials"}
                    </p>
                  </div>
                )}
                {!renaming ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRenaming(true);
                        setRenameValue(selectedCategory.name);
                        setRenameError(null);
                      }}
                    >
                      <PencilIcon className="size-4" />
                      Rename
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleToggleCategory}>
                      {selectedCategory.isActive ? "Disable Category" : "Enable Category"}
                    </Button>
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={handleQuickAddMaterial}
                noValidate
                className="mb-4 grid grid-cols-1 gap-x-3 rounded-md bg-surface-2 p-3 sm:grid-cols-12 sm:items-start"
              >
                <div className="sm:col-span-6">
                  <TextField
                    label="Add a Material to this Category"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    maxLength={200}
                    placeholder="e.g. OPC 53 Grade, 12mm TMT Bar"
                    error={materialError ?? undefined}
                  />
                </div>
                <ComboboxField
                  label="Unit"
                  className="sm:col-span-4"
                  options={units.map((u) => ({ value: u.id, label: u.name }))}
                  value={newMaterialUnitId}
                  onValueChange={setNewMaterialUnitId}
                  placeholder="Type a Unit…"
                  emptyMessage="No matching Unit — add it under Units"
                />
                <div className="sm:col-span-2 sm:mt-6">
                  <Button type="submit" isLoading={savingMaterial}>
                    <PlusIcon className="size-4" />
                    Add
                  </Button>
                </div>
              </form>

              <TextField
                label={`Search in ${selectedCategory.name}`}
                icon={<SearchIcon className="size-4" />}
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder={`Search in ${selectedCategory.name}…`}
              />

              <DataTable
                columns={materialColumns}
                mobileCard={materialMobileCard}
                rowKey={(m) => m.id}
                state={
                  visibleMaterials.length === 0
                    ? {
                        status: "empty",
                        icon: <LayersIcon />,
                        message:
                          selectedMaterials.length === 0
                            ? "No Materials in this Category yet — add the first one above."
                            : "No matching Material.",
                      }
                    : { status: "success", rows: visibleMaterials }
                }
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
