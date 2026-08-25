// This deployment's display name — a stand-in for Epic 14's Branding
// Configuration screen, which doesn't exist yet. Every place the tenant's
// name renders (sidebar, minimal top bar, sign-in card, page title) reads
// this single constant rather than a hardcoded literal, so the eventual
// admin-configurable version only has to change this one binding, not
// hunt every call site. Not env-driven (yet) since nothing outside this
// running process needs to know it.
export const APP_DISPLAY_NAME = "Sandeep Enterprises";
