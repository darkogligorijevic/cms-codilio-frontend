import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { SettingsProvider } from "../lib/settings-context";
import { SetupProvider } from "../lib/setup-context";
import { Toaster } from "@/components/ui/sonner";
import { SetupGuard } from "@/components/setup-guard";
import { MaintenanceModeWrapper } from "@/components/maintenance-mode";
import { MetaTags, DynamicFontLoader } from "@/components/meta-tags";
import { ThemeProvider } from "next-themes";

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
    <html lang="sr" suppressHydrationWarning>
      <head>
        {/* Preload default font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Default Inter font */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.className} theme-transition`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SetupProvider>
              <SetupGuard>
                <SettingsProvider>
                  <MaintenanceModeWrapper>
                    <MetaTags />
                    <DynamicFontLoader />
                      <div className="min-h-screen">{children}</div>
                    <Toaster richColors position="top-center" />
                  </MaintenanceModeWrapper>
                </SettingsProvider>
              </SetupGuard>
            </SetupProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}