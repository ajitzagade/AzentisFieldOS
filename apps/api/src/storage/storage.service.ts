import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ConfirmPhotoUploadInput,
  PresignPhotoUploadInput,
} from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';
import {
  cloudinary,
  cloudinaryUrl,
  cloudinaryThumbnailUrl,
} from './cloudinary-client';

// FR-30 (AD-3): apps/api never sits in the data path for photo bytes — it
// only issues a short-lived, scoped signature (api_key + timestamp +
// signature) for the client to POST directly to Cloudinary's upload endpoint.
// Presign (Task 1) mints that signature; confirm (Task 2) is the point a photo
// actually becomes attached to a DSR in the database — the two are deliberately
// separate so a browser that never finishes the upload never leaves a dangling
// Photo row. `storageKey` carries Cloudinary's `public_id`.
@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  // Sign a direct-upload request for a chosen public_id. Signature is produced
  // by the Cloudinary SDK (`api_sign_request`) — never a hand-rolled SHA-1.
  // `allowed_formats` is part of the signed payload, so the client cannot
  // widen it without invalidating the signature — this restricts every
  // signed upload to real image formats matching what each caller's <input
  // accept=...> already promises, regardless of a tampered client request.
  // Max file size is enforced via the Cloudinary account/upload-preset
  // settings (not a signable per-request param) — confirm that's configured
  // on the Cloudinary dashboard before relying on this alone.
  private signUpload(publicId: string, allowedFormats: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    const signature = cloudinary.utils.api_sign_request(
      { public_id: publicId, timestamp, allowed_formats: allowedFormats },
      api_secret ?? '',
    );
    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name ?? ''}/image/upload`,
      apiKey: api_key ?? '',
      timestamp,
      signature,
      publicId,
      storageKey: publicId,
      allowedFormats,
    };
  }

  async presignUpload(input: PresignPhotoUploadInput) {
    const dsr = await this.prisma.dailySiteReport.findUnique({
      where: { id: input.dailySiteReportId },
    });
    if (!dsr) {
      throw new NotFoundException(
        `Daily Site Report ${input.dailySiteReportId} not found`,
      );
    }

    const publicId = `dsr/${input.dailySiteReportId}/${crypto.randomUUID()}`;
    // Matches dsr/new/page.tsx & dsr-desktop-form.tsx's accept="image/*" —
    // heic/heif included since field photos are commonly taken on iPhones.
    return this.signUpload(publicId, 'jpg,jpeg,png,webp,heic,heif');
  }

  // Story 14.1 (FR-47): the exact same sign→POST→store-URL flow the DSR photo
  // upload uses (AD-3 — apps/api never touches the bytes), only the destination
  // differs: the branding logo lands under a `branding/` public_id and its
  // durable public URL is stored on BrandingConfig.logoUrl (via the plain PATCH
  // /branding-config save) rather than creating a Photo row. Because we set the
  // public_id, `logoUrl` is deterministic and returned up-front.
  presignBrandingLogoUpload() {
    const publicId = `branding/logo/${crypto.randomUUID()}`;
    // Matches branding-form.tsx's accept="image/png,image/svg+xml,image/jpeg".
    return {
      ...this.signUpload(publicId, 'jpg,jpeg,png,svg'),
      logoUrl: cloudinaryUrl(publicId),
    };
  }

  // Same sign→POST→store-URL flow as presignBrandingLogoUpload — a photo of
  // the physical Invoice/Challan attached to a Purchase or RMC delivery,
  // alongside the existing free-text invoiceOrChallanNo field. No Photo row:
  // the durable URL is stored directly on Purchase.challanPhotoUrl /
  // RmcEntry.challanPhotoUrl by the same create() call that saves the rest
  // of the entry.
  presignChallanUpload() {
    const publicId = `challan/${crypto.randomUUID()}`;
    // Matches challan-photo-field.tsx's accept="image/png,image/jpeg,image/webp".
    return {
      ...this.signUpload(publicId, 'jpg,jpeg,png,webp'),
      challanPhotoUrl: cloudinaryUrl(publicId),
    };
  }

  // Story 1.8 (AC #1): `uploadedByUserId` is the real authenticated user,
  // threaded in from the controller (req.user, set by ClerkAuthGuard) — no
  // longer a placeholder resolved inside the service.
  async confirmUpload(
    input: ConfirmPhotoUploadInput,
    uploadedByUserId: string,
  ) {
    const dsr = await this.prisma.dailySiteReport.findUnique({
      where: { id: input.dailySiteReportId },
    });
    if (!dsr) {
      throw new NotFoundException(
        `Daily Site Report ${input.dailySiteReportId} not found`,
      );
    }

    return this.prisma.photo.create({
      data: {
        dailySiteReportId: input.dailySiteReportId,
        storageKey: input.storageKey,
        uploadedByUserId,
      },
    });
  }

  // Read access: Cloudinary delivery URLs are public CDN URLs — durable, no
  // presign/expiry needed. `storageKey` is the stored public_id. No actual
  // I/O happens here (cloudinaryUrl is pure string-building), so this isn't
  // `async` — the Promise-returning signature is kept because every caller
  // already `await`s it and because a future delivery provider swap could
  // reasonably need to be async.
  getReadUrl(storageKey: string): Promise<string> {
    return Promise.resolve(cloudinaryUrl(storageKey));
  }

  // Same durability contract as getReadUrl, downsized + format-negotiated
  // for grid/thumbnail contexts (DSR/Site photo galleries) — see
  // cloudinaryThumbnailUrl's comment for why this is a distinct method
  // rather than a parameter on getReadUrl.
  getThumbnailUrl(storageKey: string): Promise<string> {
    return Promise.resolve(cloudinaryThumbnailUrl(storageKey));
  }
}
