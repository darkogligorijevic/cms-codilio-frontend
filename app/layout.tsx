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
    <html lang="sr" className="theme-transition">
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
        <AuthProvider>
          <SetupProvider>
            <SetupGuard>
              <SettingsProvider>
                <MaintenanceModeWrapper>
                  {/* Meta tags component that reads from settings */}
                  <MetaTags />
                  
                  {/* Dynamic font loader */}
                  <DynamicFontLoader />
                  
                  {/* Main app content */}
                  <div className="min-h-screen">
                    {children}
                  </div>
                  
                  {/* Toast notifications */}
                  <Toaster richColors position="top-center"/>
                </MaintenanceModeWrapper>
              </SettingsProvider>
            </SetupGuard>
          </SetupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}