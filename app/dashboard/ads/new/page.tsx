import AdForm from "@/components/AdForm";
import Link from "next/link";

export default function NewAdPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/ads" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to Ads
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Create New Ad</h1>
      </div>
      <AdForm />
    </div>
  );
}
