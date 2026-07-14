import type { Metadata } from "next";
import "./globals.css";
import GlobalDefs from "@/components/GlobalDefs";

export const metadata: Metadata = {
  title: "Codex Monstrorum · An Illuminated Bestiary",
  description:
    "An illuminated almanac of the creatures of the kingdoms, drawn and annotated in the manner of the old bestiaries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalDefs />
        {children}
      </body>
    </html>
  );
}
