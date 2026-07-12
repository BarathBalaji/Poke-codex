import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codex Monstrorum · A Kanto Bestiary",
  description:
    "An illuminated almanac of the creatures of Kanto, drawn and annotated in the manner of the old bestiaries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
