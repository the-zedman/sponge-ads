"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdStatusToggle({
  adId,
  currentStatus,
}: {
  adId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isActive = currentStatus === "active";

  async function toggle() {
    setLoading(true);
    await fetch(`/api/ads/${adId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isActive ? "paused" : "active" }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      className={`btn ${isActive ? "btn-danger" : "btn-primary"}`}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "…" : isActive ? "Pause" : "Activate"}
    </button>
  );
}
