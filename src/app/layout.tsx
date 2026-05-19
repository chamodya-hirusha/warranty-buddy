import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WarrantyOps — Laptop & Parts Warranty Manager",
  description: "Offline-first PWA to manage laptop and computer part warranties for your shop. Track customers, products and expiry dates.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0a0c10",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WarrantyOps",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
