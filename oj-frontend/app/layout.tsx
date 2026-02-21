import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online Judge",
  description: "Practice coding problems and test your solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-neutral-200`}
      >
        <nav className="sticky top-0 z-50 h-12 border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-semibold text-neutral-100 tracking-tight"
              >
                Online Judge
              </Link>
              <div className="h-4 w-px bg-neutral-800" />
              <Link
                href="/problems"
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Problems
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
