"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@/components/ui/Toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, ...toast }) {
        return (
          <Toast key={id} variant={toast.variant}>
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            <ToastClose />
            {toast.action && (
              <ToastAction
                altText={toast.action.altText || "Action"}
                onClick={toast.action.onClick}
              >
                {toast.action.label}
              </ToastAction>
            )}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}