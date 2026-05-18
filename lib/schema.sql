CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  headline VARCHAR(500),
  body_text TEXT,
  cta_text VARCHAR(100),
  destination_url TEXT NOT NULL,
  image_url TEXT,
  background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  text_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  cta_color VARCHAR(7) NOT NULL DEFAULT '#0070f3',
  width INTEGER NOT NULL DEFAULT 300,
  height INTEGER NOT NULL DEFAULT 250,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impressions_ad_id ON impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_impressions_created_at ON impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_ad_id ON clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at);
