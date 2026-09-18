import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

// spec-dsr-drafts (review, item 5): parameter-scoped Zod validation for
// @Query()/@Param() inputs — the query/path counterpart to ZodValidationPipe,
// which is deliberately body-only (it's applied method-wide, so it must skip
// non-body args). This pipe is meant to be bound at the PARAMETER level, e.g.
// `@Query(new ZodQueryValidationPipe(schema))` or
// `@Param('id', new ZodQueryValidationPipe(schema))`, so it only ever sees the
// single argument it's attached to and never the AuthUser/other params.
export class ZodQueryValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request input failed validation.',
          details: result.error.flatten(),
        },
      });
    }
    return result.data;
  }
}
