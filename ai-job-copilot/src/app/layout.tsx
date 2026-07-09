import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Copilot",
  description: "AI-powered job application copilot: CV updates, tailoring, cover letters, LinkedIn messages, and interview prep.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
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
