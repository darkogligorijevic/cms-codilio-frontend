import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
    >
        <div className={roboto.className}>
        {children}
        </div>
    </ThemeProvider>
  );
}
