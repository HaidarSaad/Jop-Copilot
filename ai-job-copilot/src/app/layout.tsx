import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Copilot",
  description: "AI-powered job application copilot: CV updates, tailoring, cover letters, LinkedIn messages, and interview prep.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`} suppressHydrationWarning>
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
      </body>
    </html>
  );
}
