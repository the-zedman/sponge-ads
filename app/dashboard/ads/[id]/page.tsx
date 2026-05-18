import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdWithStats } from "@/lib/types";
import EmbedCode from "@/components/EmbedCode";
import AdStatusToggle from "@/components/AdStatusToggle";

async function getAd(id: string): Promise<AdWithStats | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      a.*,
      COUNT(DISTINCT i.id)::int as impressions,
      COUNT(DISTINCT c.id)::int as clicks,
      COUNT(DISTINCT CASE WHEN i.created_at >= CURRENT_DATE THEN i.id END)::int as impressions_today,
      COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE THEN c.id END)::int as clicks_today
    FROM ads a
    LEFT JOIN impressions i ON i.ad_id = a.id
    LEFT JOIN clicks c ON c.ad_id = a.id
    WHERE a.id = ${id}
    GROUP BY a.id
  `;
  if (!rows[0]) return null;
  return rows[0] as unknown as AdWithStats & { impressions_today: number; clicks_today: number };
}

function ctr(impressions: number, clicks: number) {
  if (!impressions) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

export default async function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await getAd(id) as (AdWithStats & { impressions_today: number; clicks_today: number }) | null;
  if (!ad) notFound();

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard/ads" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Ads
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900">{ad.name}</h1>
            <span className={`badge badge-${ad.status}`}>{ad.status}</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">{ad.width}×{ad.height} · Created {new Date(ad.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <AdStatusToggle adId={ad.id} currentStatus={ad.status} />
          <Link href={`/dashboard/ads/${ad.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <StatCard label="Total Impressions" value={ad.impressions.toLocaleString()} sub={`${ad.impressions_today.toLocaleString()} today`} />
          <StatCard label="Total Clicks" value={ad.clicks.toLocaleString()} sub={`${ad.clicks_today.toLocaleString()} today`} />
          <StatCard label="CTR" value={ctr(ad.impressions, ad.clicks)} sub="click-through rate" />
          <StatCard label="Destination" value="→" sub={ad.destination_url} />
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Ad Preview</h2>
          <div
            style={{
              width: Math.min(ad.width, 400),
              height: Math.min(ad.height, 400) * (Math.min(ad.width, 400) / ad.width),
              background: ad.background_color,
              color: ad.text_color,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              flexDirection: ad.width > ad.height * 2 ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
            }}
          >
            {ad.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.image_url} alt="" style={{ maxWidth: "40%", maxHeight: "80%", objectFit: "cover", borderRadius: 4 }} />
            )}
            <div style={{ textAlign: "center", flex: 1 }}>
              {ad.headline && <div style={{ fontWeight: 700, marginBottom: 4 }}>{ad.headline}</div>}
              {ad.body_text && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{ad.body_text}</div>}
              {ad.cta_text && (
                <div style={{ display: "inline-block", background: ad.cta_color, color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                  {ad.cta_text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold text-slate-800 mb-2">Embed Code</h2>
        <p className="text-sm text-slate-500 mb-4">
          Copy this snippet and paste it into any web page where you want this ad to appear.
        </p>
        <EmbedCode adId={ad.id} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1 truncate" title={sub}>{sub}</p>
    </div>
  );
}
