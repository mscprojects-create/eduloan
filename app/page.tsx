import Link from "next/link";
import { EmiCalculator } from "@/components/emi-calculator";
import { RoleCards } from "@/components/role-cards";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="grid-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">E</div>
          <span className="text-lg font-semibold tracking-tight">EduLoan</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link href="/register"><Button>Get started</Button></Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Demo platform · Education financing, reimagined
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Fund your education<br />without the paperwork.
          </h1>
          <p className="mt-5 max-w-md text-zinc-400">
            Apply for an educational loan, upload documents, and track every step
            in real time. A single portal for students, loan officers, and investors.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register"><Button className="px-6">Apply now</Button></Link>
            <Link href="/login"><Button variant="outline" className="px-6">I have an account</Button></Link>
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            <div><div className="text-2xl font-bold">10.5%</div><div className="text-zinc-500">from p.a.</div></div>
            <div><div className="text-2xl font-bold">120 mo</div><div className="text-zinc-500">max tenure</div></div>
            <div><div className="text-2xl font-bold">24h</div><div className="text-zinc-500">avg review</div></div>
          </div>
        </div>
        <EmiCalculator />
      </section>

      <RoleCards />

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-zinc-600">
        EduLoan is a demonstration project. No real money, accounts, or financial
        products are involved. All figures and documents are simulated.
      </footer>
    </main>
  );
}
