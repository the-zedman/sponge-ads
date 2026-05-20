"use client";

import { useState } from "react";

const PROXY_PATH = "/sponge-proxy";

const PROXY_CONFIGS: Record<string, string> = {
  "Next.js": `// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '${PROXY_PATH}/:path*',
        destination: 'https://ads.sponge.net/:path*',
      },
    ];
  },
};
export default nextConfig;`,

  Nginx: `# nginx.conf
location ${PROXY_PATH}/ {
    proxy_pass https://ads.sponge.net/;
    proxy_ssl_server_name on;
    proxy_set_header Host ads.sponge.net;
}`,

  Apache: `# .htaccess or VirtualHost config
SSLProxyEngine on
ProxyPass /sponge-proxy/ https://ads.sponge.net/
ProxyPassReverse /sponge-proxy/ https://ads.sponge.net/`,

  Cloudflare: `// Cloudflare Pages _worker.js or Pages Function
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('${PROXY_PATH}/')) {
    const upstream = new URL(
      url.pathname.replace('${PROXY_PATH}', '') + url.search,
      'https://ads.sponge.net'
    );
    return fetch(upstream, request);
  }
  return next();
}`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button className="btn btn-secondary" onClick={copy}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function EmbedCode({ adId }: { adId: string }) {
  const [mode, setMode] = useState<"standard" | "bypass">("standard");
  const [platform, setPlatform] = useState<string>("Next.js");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ads.sponge.net";

  const standardSnippet = `<!-- Sponge Ad: ${adId} -->\n<div id="sponge-ad-${adId}"></div>\n<script async src="${baseUrl}/api/serve/${adId}"></script>`;

  const bypassSnippet = `<!-- Sponge Ad: ${adId} -->\n<div id="sponge-ad-${adId}"></div>\n<script async src="${PROXY_PATH}/api/serve/${adId}"></script>`;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className={`btn ${mode === "standard" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("standard")}
        >
          Standard
        </button>
        <button
          className={`btn ${mode === "bypass" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("bypass")}
        >
          Ad-block bypass
        </button>
      </div>

      {mode === "standard" && (
        <div>
          <p className="text-sm text-slate-500 mb-3">
            Paste this into any page where you want the ad to appear.
          </p>
          <div className="code-block mb-3">{standardSnippet}</div>
          <CopyButton text={standardSnippet} />
        </div>
      )}

      {mode === "bypass" && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            Publishers add a one-line proxy to their server so the ad loads from their own domain, bypassing ad blockers. Choose your platform:
          </p>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Step 1 — Add proxy to your server
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {Object.keys(PROXY_CONFIGS).map((p) => (
              <button
                key={p}
                className={`btn ${platform === p ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                onClick={() => setPlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="code-block mb-2">{PROXY_CONFIGS[platform]}</div>
          <CopyButton text={PROXY_CONFIGS[platform]} />

          <div style={{ borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Step 2 — Paste embed code
          </p>
          <p className="text-sm text-slate-500 mb-3">
            Use this snippet on your page. The script loads through your own domain.
          </p>
          <div className="code-block mb-3">{bypassSnippet}</div>
          <CopyButton text={bypassSnippet} />
        </div>
      )}
    </div>
  );
}
