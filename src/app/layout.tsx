import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Copilot",
  description: "AI-powered job application copilot: CV updates, tailoring, cover letters, LinkedIn messages, and interview prep.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var dark = JSON.parse(localStorage.getItem('jc_dark_mode'));
                if (dark) document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}