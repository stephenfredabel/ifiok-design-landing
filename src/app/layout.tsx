import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ifiok Design | Design smarter. Print faster.",
  description:
    "Create brand assets, marketing materials, and print-ready designs with Ifiok Design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
