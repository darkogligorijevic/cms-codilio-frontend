// app/layout.tsx - Updated with SettingsProvider
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { SettingsProvider } from "../lib/settings-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CMS Codilio",
  description: "Content Management System za lokalne institucije",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <AuthProvider>
          <SettingsProvider>
            {children}
            <Toaster richColors position="top-center"/>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}