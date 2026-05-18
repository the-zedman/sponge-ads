import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`SELECT * FROM ads WHERE id = ${id} AND status = 'active'`;
  const ad = rows[0];

  const origin = new URL(req.url).origin;
  const referrer = req.headers.get("referer") ?? "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
  const ua = req.headers.get("user-agent") ?? "";

  if (!ad) {
    return new Response(`(function(){})();`, {
      headers: { "Content-Type": "application/javascript", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Log impression (fire and forget)
  sql`INSERT INTO impressions (ad_id, referrer, ip_address, user_agent) VALUES (${id}, ${referrer}, ${ip}, ${ua})`.catch(() => {});

  const clickUrl = `${origin}/api/click/${id}`;
  const isWide = Number(ad.width) > Number(ad.height) * 2;

  const adHtml = `
<a href="${clickUrl}" target="_blank" rel="noopener" style="display:block;text-decoration:none;width:${ad.width}px;height:${ad.height}px;overflow:hidden;box-sizing:border-box;">
  <div style="width:${ad.width}px;height:${ad.height}px;background:${ad.background_color};color:${ad.text_color};display:flex;flex-direction:${isWide ? "row" : "column"};align-items:center;justify-content:center;gap:8px;padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;border:1px solid #e2e8f0;border-radius:6px;">
    ${ad.image_url ? `<img src="${ad.image_url}" alt="" style="max-width:${isWide ? "40%" : "100%"};max-height:${isWide ? "100%" : "50%"};object-fit:cover;border-radius:4px;" />` : ""}
    <div style="flex:1;text-align:center;min-width:0;">
      ${ad.headline ? `<div style="font-weight:700;font-size:16px;line-height:1.3;margin-bottom:4px;">${ad.headline}</div>` : ""}
      ${ad.body_text ? `<div style="font-size:12px;opacity:0.8;margin-bottom:8px;line-height:1.4;">${ad.body_text}</div>` : ""}
      ${ad.cta_text ? `<div style="display:inline-block;background:${ad.cta_color};color:#fff;padding:5px 14px;border-radius:4px;font-size:13px;font-weight:600;">${ad.cta_text}</div>` : ""}
    </div>
  </div>
</a>`.trim().replace(/`/g, "\\`");

  const js = `(function(){
  var el = document.getElementById('sponge-ad-${id}');
  if(el){ el.innerHTML = \`${adHtml}\`; }
})();`;

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
