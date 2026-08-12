import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

// Validates a request body against a @azentisfieldos/shared Zod schema —
// the same schema apps/web uses client-side (AD-7). Never hand-roll a
// second validator for a shape that already has one.
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request body failed validation.',
          details: result.error.flatten(),
        },
      });
    }
    return result.data;
  }
}
