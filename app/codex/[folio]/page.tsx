import { notFound } from "next/navigation";
import CodexShell from "@/components/CodexShell";
import { pages, getSpecies } from "@/lib/data";

export function generateStaticParams() {
  return pages.map((p) => ({ folio: String(p.folio) }));
}

export async function generateMetadata({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const page = pages[Number(folio) - 1];
  if (!page) return {};
  const names = page.members.map((m) => getSpecies(m.id).name).join(", ");
  return {
    title: `${names} · Codex Monstrorum`,
    description: `Folio ${folio} of the Kanto bestiary: ${names}.`,
  };
}

export default async function FolioRoute({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const n = Number(folio);
  if (!Number.isInteger(n) || n < 1 || n > pages.length) notFound();
  return <CodexShell initialFolio={n} />;
}
