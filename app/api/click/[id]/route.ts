import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`SELECT destination_url FROM ads WHERE id = ${id}`;
  const ad = rows[0];

  if (!ad?.destination_url) {
    return new Response("Ad not found", { status: 404 });
  }

  const referrer = req.headers.get("referer") ?? "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
  const ua = req.headers.get("user-agent") ?? "";

  sql`INSERT INTO clicks (ad_id, referrer, ip_address, user_agent) VALUES (${id}, ${referrer}, ${ip}, ${ua})`.catch(() => {});

  return Response.redirect(String(ad.destination_url), 302);
}
