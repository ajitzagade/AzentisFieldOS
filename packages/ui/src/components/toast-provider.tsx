"use client";

import type { ReactNode } from "react";
import { Toast } from "@base-ui-components/react/toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <Toast.Provider>{children}</Toast.Provider>;
}
