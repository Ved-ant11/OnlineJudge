import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavAuth from "@/components/NavAuth";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Execut.",
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
        className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0a0a] text-neutral-200`}
      >
        <ToastProvider />
        <nav className="sticky top-0 z-50 h-12 border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-lg font-bold text-neutral-100 tracking-tight"
              >
                Execut<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">.</span>
              </Link>
              <div className="h-4 w-px bg-neutral-800" />
              <Link
                href="/problems"
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Problems
              </Link>
              <Link
                href="/contribute"
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Contribute
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Leaderboard
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <NavAuth />
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
