"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "rgb(17 24 39)",
          "--normal-border": "rgb(229 231 235)",
          "--success-bg": "rgb(34 197 94)",
          "--success-text": "white",
          "--error-bg": "rgb(239 68 68)",
          "--error-text": "white",
          "--warning-bg": "rgb(245 158 11)",
          "--warning-text": "white",
          "--info-bg": "rgb(59 130 246)",
          "--info-text": "white",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid rgb(229 231 235)",
          color: "rgb(17 24 39)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        className: "toast-override",
      }}
      {...props}
    />
  )
}

export { Toaster }