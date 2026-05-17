import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OrgDataProvider } from "@/components/org-data-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGTH_ORGTAL",
  description: "Sistema institucional de talento humano, funciones y cargas laborales"
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
