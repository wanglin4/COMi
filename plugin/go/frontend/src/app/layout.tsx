import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";
import { DriftBanner } from "@/components/DriftBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COMi — Gated RWA Asset Engine",
  description: "RWA, bonds and cUSD on Canopy: gated registry, vaults, order book, oracle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <NavBar />
          <DriftBanner />
          {children}
          <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/40 backdrop-blur-xl">
            <p className="mx-auto max-w-3xl px-4 py-2 text-[11px] text-gray-500">
              Privacy-first: all reads are client-side against public RPC. Keys never leave this device.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
