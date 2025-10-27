"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/**
* Renders a toast notification provider along with all active toasts.
* @example
* Toaster()
* <ToastProvider>…</ToastProvider>
* @returns {{JSX.Element}} The rendered toaster component.
**/
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right" duration={3000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-center text-center">
              <div className="flex flex-col items-center gap-0.5 flex-1">
                {title && <ToastTitle className="text-center">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-center">{description}</ToastDescription>
                )}
              </div>
              {action && <div className="flex-shrink-0">{action}</div>}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
