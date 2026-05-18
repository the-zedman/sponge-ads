import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import AdForm from "@/components/AdForm";
import Link from "next/link";
import { Ad } from "@/lib/types";

async function getAd(id: string): Promise<Ad | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM ads WHERE id = ${id}`;
  if (!rows[0]) return null;
  return rows[0] as unknown as Ad;
}

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await getAd(id);
  if (!ad) notFound();

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/dashboard/ads/${ad.id}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to Ad
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Edit: {ad.name}</h1>
      </div>
      <AdForm ad={ad} />
    </div>
  );
}
