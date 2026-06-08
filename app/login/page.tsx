import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

const ROLE_LABELS: Record<string, string> = { student: "Student", admin: "Loan Officer", investor: "Investor" };

export default function LoginPage({ searchParams }: { searchParams: { as?: string } }) {
  const roleLabel = searchParams?.as ? ROLE_LABELS[searchParams.as] : undefined;
  return (
    <main className="grid-bg grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">E</div>
          <span className="text-lg font-semibold">EduLoan</span>
        </Link>
        <div className="glass rounded-2xl p-7">
          <h1 className="text-xl font-semibold">{roleLabel ? `Sign in as ${roleLabel}` : "Welcome back"}</h1>
          <p className="mb-6 mt-1 text-sm text-zinc-500">
            {roleLabel ? `Access your ${roleLabel.toLowerCase()} portal.` : "Sign in to continue."}
          </p>
          <AuthForm mode="login" />
          {roleLabel && (
            <p className="mt-4 text-center text-xs text-zinc-600">Wrong portal? <Link href="/" className="text-indigo-400 hover:underline">Choose another role</Link></p>
          )}
        </div>
      </div>
    </main>
  );
}
