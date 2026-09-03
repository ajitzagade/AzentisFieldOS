// Canonical implementation moved to packages/ui (AD-5) once
// packages/ui/src/components/advance-quick-entry-modal.tsx needed the same
// fix — packages/ui can't import from apps/web, so this now just re-exports
// to keep every existing apps/web import site unchanged.
export { usePreventFormResetOnError } from "@azentisfieldos/ui";
