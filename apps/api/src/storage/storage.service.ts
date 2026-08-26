import { Injectable, NotFoundException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  ConfirmPhotoUploadInput,
  PresignPhotoUploadInput,
} from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { getPlaceholderUserId } from '../common/get-placeholder-user-id';
import { r2BucketName, r2Client, r2PublicUrl } from './r2-client';

const PRESIGN_EXPIRY_SECONDS = 3600;

// FR-30 (AD-3): apps/api never sits in the data path for photo bytes — it
// only grants short-lived, scoped permission (a presigned URL) for the
// client to talk to R2 directly. Presign (Task 1) grants upload access;
// confirm (Task 2) is the point a photo actually becomes attached to a DSR
// in the database — the two are deliberately separate so a browser that
// never finishes the PUT never leaves a dangling Photo row.
@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async presignUpload(input: PresignPhotoUploadInput) {
    const dsr = await this.prisma.dailySiteReport.findUnique({
      where: { id: input.dailySiteReportId },
    });
    if (!dsr) {
      throw new NotFoundException(
        `Daily Site Report ${input.dailySiteReportId} not found`,
      );
    }

    const storageKey = `dsr/${input.dailySiteReportId}/${crypto.randomUUID()}.jpg`;
    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: r2BucketName, Key: storageKey }),
      { expiresIn: PRESIGN_EXPIRY_SECONDS },
    );

    return { uploadUrl, storageKey };
  }

  // Story 14.1 (FR-47): the exact same presign→PUT→store-URL flow the DSR
  // photo upload uses (AD-3 — apps/api never touches the bytes), only the
  // destination differs: the branding logo lands under a `branding/` key and
  // its durable public URL is stored on BrandingConfig.logoUrl (via the plain
  // PATCH /branding-config save) rather than creating a Photo row. No second
  // upload mechanism — this reuses r2Client / getSignedUrl exactly as
  // presignUpload above does.
  presignBrandingLogoUpload() {
    const storageKey = `branding/logo/${crypto.randomUUID()}`;
    return getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: r2BucketName, Key: storageKey }),
      { expiresIn: PRESIGN_EXPIRY_SECONDS },
    ).then((uploadUrl) => ({
      uploadUrl,
      storageKey,
      logoUrl: r2PublicUrl(storageKey),
    }));
  }

  async confirmUpload(input: ConfirmPhotoUploadInput) {
    const dsr = await this.prisma.dailySiteReport.findUnique({
      where: { id: input.dailySiteReportId },
    });
    if (!dsr) {
      throw new NotFoundException(
        `Daily Site Report ${input.dailySiteReportId} not found`,
      );
    }

    const uploadedByUserId = await getPlaceholderUserId(this.prisma);

    return this.prisma.photo.create({
      data: {
        dailySiteReportId: input.dailySiteReportId,
        storageKey: input.storageKey,
        uploadedByUserId,
      },
    });
  }

  // Read access: the bucket's visibility isn't decided by this codebase
  // (an infra/provisioning concern) — a presigned GET works regardless of
  // whether the bucket ends up public or private, so it's the strictly
  // correct default even if a public bucket would need slightly less code.
  async getReadUrl(storageKey: string): Promise<string> {
    return getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: r2BucketName, Key: storageKey }),
      {
        expiresIn: PRESIGN_EXPIRY_SECONDS,
      },
    );
  }
}
