import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Database, FlaskConical, ListFilter } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPK Kandungan Skincare",
  description: "Sistem pendukung keputusan rekomendasi kandungan skincare dengan Fuzzy Mamdani."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="font-semibold text-ink">
              SPK Kandungan Skincare
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint hover:text-sage" href="/rekomendasi">
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Rekomendasi
              </Link>
              <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint hover:text-sage" href="/ingredients">
                <ListFilter className="h-4 w-4" aria-hidden="true" />
                Ingredient
              </Link>
              <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint hover:text-sage" href="/admin/data">
                <Database className="h-4 w-4" aria-hidden="true" />
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
