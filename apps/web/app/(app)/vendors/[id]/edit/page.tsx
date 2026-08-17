import { notFound } from "next/navigation";
import { EditVendorForm } from "./edit-vendor-form";
import type { Vendor } from "../../page";

async function getVendor(id: string): Promise<Vendor | null> {
  const res = await fetch(`${process.env.API_URL}/vendors/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vendor (${res.status})`);
  }
  return res.json();
}

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Vendor</h1>
      <EditVendorForm vendor={vendor} />
    </div>
  );
}
