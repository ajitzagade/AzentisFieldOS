import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ConfirmPhotoUploadInput,
  PresignPhotoUploadInput,
} from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { cloudinary, cloudinaryUrl } from './cloudinary-client';

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
  private signUpload(publicId: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    const signature = cloudinary.utils.api_sign_request(
      { public_id: publicId, timestamp },
      api_secret ?? '',
    );
    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name ?? ''}/image/upload`,
      apiKey: api_key ?? '',
      timestamp,
      signature,
      publicId,
      storageKey: publicId,
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
    return this.signUpload(publicId);
  }

  // Story 14.1 (FR-47): the exact same sign→POST→store-URL flow the DSR photo
  // upload uses (AD-3 — apps/api never touches the bytes), only the destination
  // differs: the branding logo lands under a `branding/` public_id and its
  // durable public URL is stored on BrandingConfig.logoUrl (via the plain PATCH
  // /branding-config save) rather than creating a Photo row. Because we set the
  // public_id, `logoUrl` is deterministic and returned up-front.
  presignBrandingLogoUpload() {
    const publicId = `branding/logo/${crypto.randomUUID()}`;
    return {
      ...this.signUpload(publicId),
      logoUrl: cloudinaryUrl(publicId),
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
  // presign/expiry needed. `storageKey` is the stored public_id.
  async getReadUrl(storageKey: string): Promise<string> {
    return cloudinaryUrl(storageKey);
  }
}
