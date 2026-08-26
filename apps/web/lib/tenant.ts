// This deployment's display name — a stand-in for Epic 14's Branding
// Configuration screen, which doesn't exist yet. Every place the tenant's
// name renders (sidebar, minimal top bar, sign-in card, page title) reads
// this single constant rather than a hardcoded literal, so the eventual
// admin-configurable version only has to change this one binding, not
// hunt every call site. Not env-driven (yet) since nothing outside this
// running process needs to know it.
export const APP_DISPLAY_NAME = "Sandeep Enterprises";

// One source for the app's tagline/description, shared by the root metadata
// (layout.tsx) and the web manifest (manifest.ts) so the two can't drift.
export const APP_DESCRIPTION =
  "Construction contractor operations: sites, inventory, labour, and daily reporting in one place.";

// The one literal brand color shared by the web manifest and the viewport
// theme color. A manifest is static JSON config — it can't read the CSS
// design-token var — so this mirrors `--accent-teal-700`
// (packages/ui/src/styles/theme.css) / the `BrandingConfig.primaryColor`
// default. Config, not component styling, so AD-4's "no literal hex in
// component code" rule is unaffected. Per-tenant-ready alongside
// APP_DISPLAY_NAME: Epic 14 branding only has to change this one binding.
// Manifest/viewport config is static JSON that cannot read a CSS design-token
// var; deliberate AD-4 carve-out mirroring --accent-teal-700 /
// BrandingConfig.primaryColor default.
// eslint-disable-next-line no-restricted-syntax -- see note above (AD-4 carve-out)
export const BRAND_THEME_COLOR = "#0F5257";
