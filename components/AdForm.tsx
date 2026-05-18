"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AD_SIZES } from "@/lib/types";
import type { Ad } from "@/lib/types";

type FormData = {
  name: string;
  headline: string;
  body_text: string;
  cta_text: string;
  destination_url: string;
  background_color: string;
  text_color: string;
  cta_color: string;
  width: number;
  height: number;
  status: string;
};

const defaults: FormData = {
  name: "",
  headline: "",
  body_text: "",
  cta_text: "Learn More",
  destination_url: "",
  background_color: "#ffffff",
  text_color: "#000000",
  cta_color: "#3b82f6",
  width: 300,
  height: 250,
  status: "active",
};

export default function AdForm({ ad }: { ad?: Ad }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!ad;

  const [form, setForm] = useState<FormData>(
    ad
      ? {
          name: ad.name,
          headline: ad.headline ?? "",
          body_text: ad.body_text ?? "",
          cta_text: ad.cta_text ?? "",
          destination_url: ad.destination_url,
          background_color: ad.background_color,
          text_color: ad.text_color,
          cta_color: ad.cta_color,
          width: ad.width,
          height: ad.height,
          status: ad.status,
        }
      : defaults
  );

  const [imageUrl, setImageUrl] = useState<string>(ad?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof FormData, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [w, h] = e.target.value.split("x").map(Number);
    setForm((f) => ({ ...f, width: w, height: h }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setImageUrl(json.url);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form, image_url: imageUrl };
      const res = await fetch(isEdit ? `/api/ads/${ad.id}` : "/api/ads", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Save failed");
      }
      const json = await res.json();
      router.push(`/dashboard/ads/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const currentSize = `${form.width}x${form.height}`;
  const sizeLabel = AD_SIZES.find(
    (s) => s.width === form.width && s.height === form.height
  )?.label ?? "Custom";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Basic Info</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Ad Name <span className="text-red-500">*</span></label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Summer Sale Banner"
              required
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Destination URL <span className="text-red-500">*</span></label>
            <input
              className="form-input"
              type="url"
              value={form.destination_url}
              onChange={(e) => set("destination_url", e.target.value)}
              placeholder="https://example.com/landing-page"
              required
            />
          </div>

          <div>
            <label className="form-label">Ad Size</label>
            <select
              className="form-input"
              value={currentSize}
              onChange={handleSizeChange}
            >
              {AD_SIZES.map((s) => (
                <option key={`${s.width}x${s.height}`} value={`${s.width}x${s.height}`}>
                  {s.label} ({s.width}×{s.height})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">{sizeLabel} — {form.width}×{form.height}px</p>
          </div>

          {isEdit && (
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Creative Content</h2>
        <div className="grid gap-4">
          <div>
            <label className="form-label">Headline</label>
            <input
              className="form-input"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="e.g. Get 50% off today"
              maxLength={100}
            />
          </div>

          <div>
            <label className="form-label">Body Text</label>
            <textarea
              className="form-input"
              value={form.body_text}
              onChange={(e) => set("body_text", e.target.value)}
              placeholder="Supporting copy for your ad"
              rows={2}
              maxLength={200}
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label className="form-label">CTA Button Text</label>
            <input
              className="form-input"
              value={form.cta_text}
              onChange={(e) => set("cta_text", e.target.value)}
              placeholder="Learn More"
              maxLength={30}
            />
          </div>

          <div>
            <label className="form-label">Ad Image</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Image"}
              </button>
              {imageUrl && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Ad preview" className="h-10 w-16 object-cover rounded border" />
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => setImageUrl("")}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF, WebP — recommended size matches your ad dimensions</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Colors</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div>
            <label className="form-label">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.background_color}
                onChange={(e) => set("background_color", e.target.value)}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <input
                className="form-input"
                value={form.background_color}
                onChange={(e) => set("background_color", e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.text_color}
                onChange={(e) => set("text_color", e.target.value)}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <input
                className="form-input"
                value={form.text_color}
                onChange={(e) => set("text_color", e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="form-label">CTA Button Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.cta_color}
                onChange={(e) => set("cta_color", e.target.value)}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <input
                className="form-input"
                value={form.cta_color}
                onChange={(e) => set("cta_color", e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Live Preview</h2>
        <p className="text-xs text-slate-400 mb-4">Approximate preview — final rendering may vary slightly</p>
        <AdPreview
          headline={form.headline}
          bodyText={form.body_text}
          ctaText={form.cta_text}
          imageUrl={imageUrl}
          bgColor={form.background_color}
          textColor={form.text_color}
          ctaColor={form.cta_color}
          width={form.width}
          height={form.height}
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Ad"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdPreview({
  headline,
  bodyText,
  ctaText,
  imageUrl,
  bgColor,
  textColor,
  ctaColor,
  width,
  height,
}: {
  headline: string;
  bodyText: string;
  ctaText: string;
  imageUrl: string;
  bgColor: string;
  textColor: string;
  ctaColor: string;
  width: number;
  height: number;
}) {
  const isWide = width > height * 2;
  const scale = Math.min(1, 560 / width);

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          width: width * scale,
          height: height * scale,
          background: bgColor,
          color: textColor,
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          overflow: "hidden",
          display: "flex",
          flexDirection: isWide ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px",
          boxSizing: "border-box",
          fontSize: `${14 * scale}px`,
          position: "relative",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              maxWidth: isWide ? "40%" : "100%",
              maxHeight: isWide ? "100%" : "50%",
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        )}
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          {headline && (
            <div style={{ fontWeight: 700, fontSize: `${16 * scale}px`, lineHeight: 1.3, marginBottom: 4 }}>
              {headline}
            </div>
          )}
          {bodyText && (
            <div style={{ fontSize: `${12 * scale}px`, opacity: 0.8, marginBottom: 8, lineHeight: 1.4 }}>
              {bodyText}
            </div>
          )}
          {ctaText && (
            <div
              style={{
                display: "inline-block",
                background: ctaColor,
                color: "#fff",
                padding: `${4 * scale}px ${12 * scale}px`,
                borderRadius: 4,
                fontSize: `${12 * scale}px`,
                fontWeight: 600,
              }}
            >
              {ctaText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
