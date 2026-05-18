import { getDb } from "@/lib/db";
import Link from "next/link";

async function getStats() {
  const sql = getDb();

  const [totals, today, topAds] = await Promise.all([
    sql`
      SELECT
        COUNT(DISTINCT a.id) as total_ads,
        COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_ads,
        COUNT(DISTINCT i.id) as total_impressions,
        COUNT(DISTINCT c.id) as total_clicks
      FROM ads a
      LEFT JOIN impressions i ON i.ad_id = a.id
      LEFT JOIN clicks c ON c.ad_id = a.id
    `,
    sql`
      SELECT
        COUNT(DISTINCT i.id) as impressions_today,
        COUNT(DISTINCT c.id) as clicks_today
      FROM ads a
      LEFT JOIN impressions i ON i.ad_id = a.id AND i.created_at >= CURRENT_DATE
      LEFT JOIN clicks c ON c.ad_id = a.id AND c.created_at >= CURRENT_DATE
    `,
    sql`
      SELECT
        a.id, a.name, a.status,
        COUNT(DISTINCT i.id) as impressions,
        COUNT(DISTINCT c.id) as clicks
      FROM ads a
      LEFT JOIN impressions i ON i.ad_id = a.id
      LEFT JOIN clicks c ON c.ad_id = a.id
      GROUP BY a.id, a.name, a.status
      ORDER BY impressions DESC
      LIMIT 5
    `,
  ]);

  return {
    totalAds: Number(totals[0]?.total_ads ?? 0),
    activeAds: Number(totals[0]?.active_ads ?? 0),
    totalImpressions: Number(totals[0]?.total_impressions ?? 0),
    totalClicks: Number(totals[0]?.total_clicks ?? 0),
    impressionsToday: Number(today[0]?.impressions_today ?? 0),
    clicksToday: Number(today[0]?.clicks_today ?? 0),
    topAds,
  };
}

function ctr(impressions: number, clicks: number) {
  if (!impressions) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Your ad performance at a glance</p>
        </div>
        <Link href="/dashboard/ads/new" className="btn btn-primary">
          + New Ad
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard label="Total Ads" value={stats.totalAds} sub={`${stats.activeAds} active`} />
        <StatCard label="Total Impressions" value={stats.totalImpressions.toLocaleString()} sub={`${stats.impressionsToday.toLocaleString()} today`} />
        <StatCard label="Total Clicks" value={stats.totalClicks.toLocaleString()} sub={`${stats.clicksToday.toLocaleString()} today`} />
        <StatCard label="Overall CTR" value={ctr(stats.totalImpressions, stats.totalClicks)} sub="click-through rate" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Top Performing Ads</h2>
          <Link href="/dashboard/ads" className="text-blue-500 text-sm hover:underline">
            View all →
          </Link>
        </div>
        {stats.topAds.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="mb-3">No ads yet.</p>
            <Link href="/dashboard/ads/new" className="btn btn-primary">
              Create your first ad
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad Name</th>
                <th>Status</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAds.map((ad: Record<string, unknown>) => (
                <tr key={String(ad.id)}>
                  <td>
                    <Link href={`/dashboard/ads/${ad.id}`} className="font-medium text-blue-600 hover:underline">
                      {String(ad.name)}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${ad.status}`}>{String(ad.status)}</span>
                  </td>
                  <td>{Number(ad.impressions).toLocaleString()}</td>
                  <td>{Number(ad.clicks).toLocaleString()}</td>
                  <td>{ctr(Number(ad.impressions), Number(ad.clicks))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
