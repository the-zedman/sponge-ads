import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Sponge Ads</h1>
          <p className="text-slate-400 mt-1 text-sm">Ad Management Platform</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
