import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HP1 Traffic Command",
  description: "نظام القيادة والإدارة المرورية — HP1"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
