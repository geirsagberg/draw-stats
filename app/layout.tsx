import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draw Stats",
  description: "Trello checklist burndown tracking for shared boards"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
