import type { Metadata } from "next";
import { Toaster } from "sonner";

import { env } from "@/lib/config/env";
import "./globals.css";

export const metadata: Metadata = {
  title: `${env.appName} | Embedded Banking Demo`,
  description: "Northstar BaaS Cloud is a demo-ready embedded banking platform powered by Next.js and Supabase-first architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
