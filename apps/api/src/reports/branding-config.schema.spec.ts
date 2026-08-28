import { describe, expect, it } from 'vitest';
import { updateBrandingConfigSchema } from '@azentisfieldos/shared';

// Story 14.1 (FR-47): the shared updateBrandingConfigSchema (AD-7) — validated
// here in apps/api because packages/shared has no test runner of its own, and
// apps/api is the schema's source-of-truth consumer (the ZodValidationPipe on
// PATCH /branding-config uses this exact schema).
describe('updateBrandingConfigSchema (Story 14.1)', () => {
  it('accepts the full extended field set', () => {
    const parsed = updateBrandingConfigSchema.safeParse({
      tenantName: 'Azentis Construction Pvt. Ltd.',
      logoUrl: 'https://cdn.example.com/branding/logo/abc.png',
      primaryColor: '#0F5257',
      secondaryColor: '#16273E',
      accentColor: '#C7912B',
      registeredAddress: 'Plot 14, Industrial Estate Road, Nagpur 440016',
      contactPhone: '+91 98230 11245',
      gstin: '27AABCA1234M1Z5',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts an empty object — every field is optional (partial edit)', () => {
    expect(updateBrandingConfigSchema.safeParse({}).success).toBe(true);
  });

  it('applies the same 6-digit-hex rule to secondaryColor and accentColor', () => {
    expect(
      updateBrandingConfigSchema.safeParse({ secondaryColor: '#16273E' })
        .success,
    ).toBe(true);
    expect(
      updateBrandingConfigSchema.safeParse({ accentColor: '#C7912B' }).success,
    ).toBe(true);
    // Not a 6-digit hex → rejected, same as primaryColor.
    expect(
      updateBrandingConfigSchema.safeParse({ secondaryColor: 'navy' }).success,
    ).toBe(false);
    expect(
      updateBrandingConfigSchema.safeParse({ accentColor: '#FFF' }).success,
    ).toBe(false);
  });

  it('lets the optional free-text fields be cleared with an explicit null', () => {
    const parsed = updateBrandingConfigSchema.safeParse({
      logoUrl: null,
      registeredAddress: null,
      contactPhone: null,
      gstin: null,
    });
    expect(parsed.success).toBe(true);
  });

  it('does NOT validate GSTIN format beyond length — any string is accepted', () => {
    // No GST checksum enforcement (FR-47 does not require it): a non-canonical
    // value still passes.
    expect(
      updateBrandingConfigSchema.safeParse({ gstin: 'not-a-real-gstin' })
        .success,
    ).toBe(true);
    // But an over-length value is rejected (length is the only bound).
    expect(
      updateBrandingConfigSchema.safeParse({ gstin: 'x'.repeat(51) }).success,
    ).toBe(false);
  });

  it('rejects a logoUrl that is not a URL', () => {
    expect(
      updateBrandingConfigSchema.safeParse({ logoUrl: 'not a url' }).success,
    ).toBe(false);
  });
});
