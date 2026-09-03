---
title: 'Click-to-preview lightbox for the Site photo gallery'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '6a16682e5d141546511b816d3eb8a713eab979d5'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Clicking a photo thumbnail anywhere in the app (Site detail page's Recent Photos, the full Site Photos gallery page, or a Site's Report page) does nothing — `PhotoGalleryGrid` renders plain non-interactive `<figure>`s, and no full-size preview exists anywhere.

**Approach:** Make `PhotoGalleryGrid`'s thumbnails clickable, opening a full-size lightbox overlay (built on the same Base UI `Dialog` primitive `QuickCreateModal` already uses) with Next/Previous navigation across the same photo array and Close (backdrop/Escape/button). Add a larger `previewUrl` field to the existing photo-gallery read path (via the already-parameterized `getThumbnailUrl(storageKey, width)` helper — no new Cloudinary/API surface) so the lightbox isn't just the 480px grid thumbnail stretched up.

## Boundaries & Constraints

**Always:** All three existing `PhotoGalleryGrid` callers (Site detail page, Site Photos page, Site Report page) get the lightbox automatically — no per-caller wiring, since the grid owns its own open/selected state internally. Keyboard: Escape closes, arrow keys move Next/Previous when the lightbox is open. Never fetch anything new on open — reuse the photos array the grid was already given.

**Ask First:** None — mechanical: match `QuickCreateModal`'s exact `Dialog.Root/Portal/Backdrop/Popup` chrome/classes, and extend `getSitePhotoGallery`'s existing per-photo mapping with one more field computed via the existing `getThumbnailUrl` helper (just a larger `width` argument), matching how `url` is already computed there.

**Never:** Don't add a new upload/edit/delete affordance inside the lightbox — view-only. Don't change `PhotoGalleryItem.url` (the grid thumbnail) — add `previewUrl` alongside it, additive only. Don't touch the Photo data model, presign/confirm flow, or DSR-required upload path — out of scope (tracked separately in `deferred-work.md`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Click a thumbnail | Any photo in any gallery | Lightbox opens showing that photo at `previewUrl` size, with caption (date · uploader) | N/A |
| Click Next/Previous (or press → / ←) | Lightbox open, photo not at array boundary | Advances to the adjacent photo in the same array | N/A |
| At the first/last photo | Lightbox open | Previous/Next is disabled (or hidden) at the respective boundary — no wraparound | N/A |
| Close (Escape, backdrop click, close button) | Lightbox open | Closes, returns focus to the thumbnail that opened it | N/A |
| Gallery has exactly one photo | Single-photo array | Lightbox opens with no Next/Previous controls shown | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/photo-gallery-grid.tsx` -- `"use client"` (currently a server-renderable pure function — becomes a Client Component since it now owns `openIndex` state and a Dialog). Each `<figure>`'s `<img>` wraps in a `<button type="button">` (`onClick={() => setOpenIndex(i)}`, `aria-label` e.g. "View photo from {date}"). Add the lightbox `Dialog.Root/Portal/Backdrop/Popup` (mirror `packages/ui/src/components/quick-create-modal.tsx:101-142`'s exact classes) rendered once at the bottom, `open={openIndex !== null}`, showing `photos[openIndex].previewUrl` full-size (`object-contain`, capped to viewport), caption below, Previous/Next buttons (disabled at bounds per the matrix), a Close button, and an `onKeyDown`/global keydown for ArrowLeft/ArrowRight while open.
- `packages/shared/src/types/photo-gallery.ts:4-15` -- add `previewUrl: string` to `PhotoGalleryItem`
- `apps/api/src/sites/site-photo-gallery.ts:16-45` (`getSitePhotoGallery`'s per-photo mapping) -- add `previewUrl: await storage.getThumbnailUrl(photo.storageKey, 1600)` alongside the existing `url: await storage.getThumbnailUrl(photo.storageKey)` (default width) call — same helper, just a second call with a larger `width` argument, per `apps/api/src/storage/cloudinary-client.ts:48-54`'s `cloudinaryThumbnailUrl(publicId, width=480)` signature
- Callers needing zero changes (confirmed identical `PhotoGalleryItem` shape, additive field only): `apps/web/app/(app)/sites/[id]/page.tsx:462`, `apps/web/app/(app)/sites/[id]/photos/page.tsx:52`, `apps/web/app/(app)/reports/page.tsx:676`
- Reference for Dialog chrome/classes to mirror: `packages/ui/src/components/quick-create-modal.tsx` (plain `Dialog`, not `AlertDialog` — this isn't a confirmation)

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/sites/site-photo-gallery.ts` -- add `previewUrl` to the per-photo mapping -- feeds the lightbox a non-blurry image
- [x] `packages/shared/src/types/photo-gallery.ts` -- add `previewUrl: string` to `PhotoGalleryItem`
- [x] `apps/web/app/(app)/_components/photo-gallery-grid.tsx` -- make thumbnails clickable, add the lightbox Dialog with Next/Previous/Close/keyboard nav per the I/O matrix
- [x] `apps/api/src/sites/site-photo-gallery.spec.ts` (or its integration sibling) -- extend to assert `previewUrl` is present and derived from the same `storageKey` at a larger width
- [x] New `apps/web/app/(app)/_components/photo-gallery-grid.test.tsx` -- click opens the lightbox on the right photo, Next/Previous move correctly and disable at bounds, Escape/backdrop/close-button all close it, single-photo array hides Next/Previous
- [x] Scope extension (mechanical, required to satisfy the Code Map's own premise): `apps/api/src/storage/storage.service.ts`'s `getThumbnailUrl` did not actually accept a `width` parameter yet (only `cloudinaryThumbnailUrl` did) — added `width?: number` to `getThumbnailUrl` and threaded it through, plus a `storage.service.spec.ts` case for the explicit-width path. `apps/web/package.json` also gained a direct `@base-ui-components/react` dependency (previously only a transitive dependency of `packages/ui`, unresolvable from `apps/web` under pnpm's strict linking) since `photo-gallery-grid.tsx` imports `Dialog` directly, matching how `quick-create-modal.tsx`/`search-palette.tsx` already do it inside `packages/ui`.

**Acceptance Criteria:**
- Given any of the three existing `PhotoGalleryGrid` call sites, when a thumbnail is clicked, then a full-size preview opens showing that exact photo.
- Given the lightbox is open on a gallery with more than one photo, when the user navigates Next/Previous, then it never goes out of bounds and never wraps.
- Given the lightbox is open, when closed by any method, then the page underneath is exactly as it was before opening (no scroll jump, no lost gallery state).

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test` -- all existing + new tests pass
- `pnpm --filter @azentisfieldos/api test` -- `site-photo-gallery` tests pass with `previewUrl` assertions
- `pnpm --filter @azentisfieldos/web typecheck` && `pnpm --filter @azentisfieldos/api typecheck` -- no errors
- `pnpm --filter @azentisfieldos/web lint` -- no new errors

**Manual checks:**
- Dev server: open a Site with several DSR photos, click a thumbnail on the Site detail page's Recent Photos, confirm the lightbox opens, Next/Previous cycle through, Escape closes; repeat on the full Site Photos page.
