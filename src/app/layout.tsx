import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/i18n/LangProvider";
import CreatorInvite from "@/components/CreatorInvite";

export const metadata: Metadata = {
  title: "Ifiok Design | Design and print with verified printers",
  description:
    "Design business cards, flyers, ID cards and posters at real print size, then send them to a verified printer near you and compare prices in naira.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint so a saved light or dark choice never flashes the other theme.
const themeBoot = `try{var t=localStorage.getItem('ifiok.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <LangProvider>{children}<CreatorInvite /></LangProvider>
      </body>
    </html>
  );
}
