import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"], display: "swap", variable: "--font-nunito" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Free 1:1 Class for Your Child | BrightCHAMPS",
  description: "Book a free live 1:1 math or coding class for your child. Pick a time in your time zone. No card needed, reschedule anytime.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1c0b43" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${nunito.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
