import { renderTenantIcon } from "../../../lib/pwa-icon";

// Stable, statically-prebuilt URLs for the manifest's icon set. The manifest
// (app/manifest.ts) references these fixed paths; the Next metadata-file
// convention (app/icon.tsx) would instead emit hash-suffixed URLs that a
// hand-written manifest can't predict, so the manifest's any/maskable 192 &
// 512 entries are served from here where the paths are known and constant.
const ICONS = {
  "icon-192": { size: 192, maskable: false },
  "icon-512": { size: 512, maskable: false },
  "maskable-192": { size: 192, maskable: true },
  "maskable-512": { size: 512, maskable: true },
} as const;

type IconKey = keyof typeof ICONS;

// Prebuild all four at build time; reject anything else (no arbitrary sizes).
export const dynamicParams = false;

export function generateStaticParams(): { icon: IconKey }[] {
  return (Object.keys(ICONS) as IconKey[]).map((icon) => ({ icon }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ icon: string }> },
): Promise<Response> {
  const { icon } = await params;
  const spec = ICONS[icon as IconKey];
  if (!spec) {
    return new Response("Not found", { status: 404 });
  }
  return renderTenantIcon(spec);
}
