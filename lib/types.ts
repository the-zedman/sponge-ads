export type AdStatus = "active" | "paused" | "archived";

export type AdSize = {
  label: string;
  width: number;
  height: number;
};

export const AD_SIZES: AdSize[] = [
  { label: "Medium Rectangle", width: 300, height: 250 },
  { label: "Leaderboard", width: 728, height: 90 },
  { label: "Half Page", width: 300, height: 600 },
  { label: "Wide Skyscraper", width: 160, height: 600 },
  { label: "Mobile Banner", width: 320, height: 50 },
  { label: "Banner", width: 468, height: 60 },
  { label: "Large Rectangle", width: 336, height: 280 },
];

export type Ad = {
  id: string;
  name: string;
  headline: string | null;
  body_text: string | null;
  cta_text: string | null;
  destination_url: string;
  image_url: string | null;
  background_color: string;
  text_color: string;
  cta_color: string;
  width: number;
  height: number;
  status: AdStatus;
  created_at: string;
  updated_at: string;
};

export type AdWithStats = Ad & {
  impressions: number;
  clicks: number;
};
