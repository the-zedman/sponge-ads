import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  const rows = await sql`SELECT * FROM ads WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    name, headline, body_text, cta_text, destination_url,
    image_url, background_color, text_color, cta_color, width, height, status,
  } = body;

  const sql = getDb();
  const rows = await sql`
    UPDATE ads SET
      name = COALESCE(${name ?? null}, name),
      headline = COALESCE(${headline ?? null}, headline),
      body_text = COALESCE(${body_text ?? null}, body_text),
      cta_text = COALESCE(${cta_text ?? null}, cta_text),
      destination_url = COALESCE(${destination_url ?? null}, destination_url),
      image_url = COALESCE(${image_url ?? null}, image_url),
      background_color = COALESCE(${background_color ?? null}, background_color),
      text_color = COALESCE(${text_color ?? null}, text_color),
      cta_color = COALESCE(${cta_color ?? null}, cta_color),
      width = COALESCE(${width ?? null}, width),
      height = COALESCE(${height ?? null}, height),
      status = COALESCE(${status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM ads WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
