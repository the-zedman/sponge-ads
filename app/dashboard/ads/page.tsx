import { getDb } from "@/lib/db";
import Link from "next/link";
import { AdWithStats } from "@/lib/types";

async function getAds(): Promise<AdWithStats[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      a.*,
      COUNT(DISTINCT i.id)::int as impressions,
      COUNT(DISTINCT c.id)::int as clicks
    FROM ads a
    LEFT JOIN impressions i ON i.ad_id = a.id
    LEFT JOIN clicks c ON c.ad_id = a.id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  return rows as unknown as AdWithStats[];
}

function ctr(impressions: number, clicks: number) {
  if (!impressions) return "—";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

export default async function AdsPage() {
  const ads = await getAds();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ads</h1>
          <p className="text-slate-500 text-sm mt-1">{ads.length} ad{ads.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/dashboard/ads/new" className="btn btn-primary">
          + New Ad
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {ads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="mb-4">No ads yet. Create your first one!</p>
            <Link href="/dashboard/ads/new" className="btn btn-primary">
              Create Ad
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Status</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td>
                    <Link href={`/dashboard/ads/${ad.id}`} className="font-medium text-blue-600 hover:underline">
                      {ad.name}
                    </Link>
                    {ad.headline && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-48">{ad.headline}</p>
                    )}
                  </td>
                  <td className="text-slate-500">{ad.width}×{ad.height}</td>
                  <td>
                    <span className={`badge badge-${ad.status}`}>{ad.status}</span>
                  </td>
                  <td>{ad.impressions.toLocaleString()}</td>
                  <td>{ad.clicks.toLocaleString()}</td>
                  <td>{ctr(ad.impressions, ad.clicks)}</td>
                  <td className="text-slate-400">{new Date(ad.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/dashboard/ads/${ad.id}/edit`} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem" }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
