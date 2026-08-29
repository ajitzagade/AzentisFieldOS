import {
  BadRequestException,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';
import type { ZodType } from 'zod';

// Validates a request body against a @azentisfieldos/shared Zod schema —
// the same schema apps/web uses client-side (AD-7). Never hand-roll a
// second validator for a shape that already has one.
//
// Scoped to the `body` parameter: a method-level @UsePipes runs its pipe
// against EVERY parameter, so on a handler like
// `create(@CurrentUser() user, @Body() body)` this pipe used to validate
// the AuthUser object (and @Param strings) against the body schema and
// 400 every real HTTP request — a break service-level integration tests
// and direct controller unit tests could never see.
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  // metadata defaults to body for direct unit-test invocation.
  transform(value: unknown, metadata: ArgumentMetadata = { type: 'body' }) {
    if (metadata.type !== 'body') {
      return value;
    }
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
