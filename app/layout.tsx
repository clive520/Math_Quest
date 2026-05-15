import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Quest",
  description: "國小數學闖關與老師共備題庫平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
