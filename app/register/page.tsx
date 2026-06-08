import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="grid-bg grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">E</div>
          <span className="text-lg font-semibold">EduLoan</span>
        </Link>
        <div className="glass rounded-2xl p-7">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mb-6 mt-1 text-sm text-zinc-500">Start your loan application in minutes.</p>
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
