"use client";

import { useState } from "react";

export default function EmbedCode({ adId }: { adId: string }) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://sponge.net";
  const snippet = `<!-- Sponge Ad: ${adId} -->\n<div id="sponge-ad-${adId}"></div>\n<script async src="${baseUrl}/api/serve/${adId}"></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="code-block mb-3">{snippet}</div>
      <button className="btn btn-secondary" onClick={copy}>
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </div>
  );
}
