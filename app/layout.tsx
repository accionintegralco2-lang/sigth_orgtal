import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { OrgDataProvider } from "@/components/org-data-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sigth-orgtal.vercel.app"),
  title: {
    default: "ORGTAL",
    template: "%s | ORGTAL"
  },
  applicationName: "ORGTAL",
  description: "Modelo Organizacional Automatizado para la Gestion Estrategica del Talento Humano.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "ORGTAL",
    statusBarStyle: "default"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#17605a"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <OrgDataProvider>{children}</OrgDataProvider>
      </body>
    </html>
  );
}
