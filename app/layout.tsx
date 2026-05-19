import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { OrgDataProvider } from "@/components/org-data-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sigth-orgtal.vercel.app"),
  title: {
    default: "SIGTH_ORGTAL",
    template: "%s | SIGTH_ORGTAL"
  },
  applicationName: "SIGTH_ORGTAL",
  description: "Sistema institucional de talento humano, funciones, cargas laborales, alertas y reportes.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "SIGTH_ORGTAL",
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
