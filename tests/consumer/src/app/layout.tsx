import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "Kashi consumer test" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
