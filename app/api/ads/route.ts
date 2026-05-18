import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const ads = await sql`
    SELECT a.*, COUNT(DISTINCT i.id)::int as impressions, COUNT(DISTINCT c.id)::int as clicks
    FROM ads a
    LEFT JOIN impressions i ON i.ad_id = a.id
    LEFT JOIN clicks c ON c.ad_id = a.id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json(ads);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, headline, body_text, cta_text, destination_url,
    image_url, background_color, text_color, cta_color, width, height,
  } = body;

  if (!name || !destination_url) {
    return NextResponse.json({ error: "Name and destination URL are required" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    INSERT INTO ads (name, headline, body_text, cta_text, destination_url, image_url,
      background_color, text_color, cta_color, width, height)
    VALUES (${name}, ${headline || null}, ${body_text || null}, ${cta_text || null},
      ${destination_url}, ${image_url || null},
      ${background_color || "#ffffff"}, ${text_color || "#000000"}, ${cta_color || "#3b82f6"},
      ${width || 300}, ${height || 250})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
