"use client";

import { useMemo } from "react";
import { Toast } from "@base-ui-components/react/toast";
import { cn } from "../lib/cn";
import { CheckCircleIcon } from "../icons/check-circle-icon";
import { AlertTriangleIcon } from "../icons/alert-triangle-icon";
import { XIcon } from "../icons/x-icon";

// The single toast system (AD-5): success/error acknowledgements for
// operations whose form has navigated away (a Server Action redirect) or
// that have no form at all (mark-paid). Field/validation problems stay as
// inline `role="alert"` text beside the field — a toast for those would
// double-report and vanish before the user can act on it.
//
// Mount once per shell: <ToastProvider> around the app, <Toaster /> inside
// it. Fire with `useToast().success("Payment recorded")` / `.error(...)`.
export { ToastProvider } from "./toast-provider";

export type ToastVariant = "success" | "error";

const VARIANT_STYLES: Record<ToastVariant, { container: string; icon: typeof CheckCircleIcon }> = {
  success: { container: "border-success-700/30 text-success-700", icon: CheckCircleIcon },
  error: { container: "border-danger-700/30 text-danger-700", icon: AlertTriangleIcon },
};

export function useToast() {
  const manager = Toast.useToastManager();
  // Referentially stable so consumers can list it as an effect dependency
  // without re-firing on every render.
  return useMemo(
    () => ({
      success: (message: string) => manager.add({ title: message, type: "success" }),
      error: (message: string) => manager.add({ title: message, type: "error", priority: "high", timeout: 8000 }),
    }),
    [manager],
  );
}

export function Toaster() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed top-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-90 flex-col gap-2">
        {toasts.map((toast) => {
          const variant: ToastVariant = toast.type === "error" ? "error" : "success";
          const { container, icon: Icon } = VARIANT_STYLES[variant];
          return (
            <Toast.Root
              key={toast.id}
              toast={toast}
              className={cn(
                "flex items-start gap-2 rounded-md border bg-surface-1 p-3 shadow-3",
                "data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
                "data-[ending-style]:opacity-0 transition-[opacity,transform] duration-(--default-transition-duration) ease-(--ease-standard)",
                container,
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-body-sm font-medium">{toast.title}</Toast.Title>
                {toast.description ? (
                  <Toast.Description className="text-caption text-ink-500">{toast.description}</Toast.Description>
                ) : null}
              </div>
              <Toast.Close aria-label="Dismiss notification" className="rounded-sm text-ink-500 hover:text-ink-900">
                <XIcon className="size-4" />
              </Toast.Close>
            </Toast.Root>
          );
        })}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
