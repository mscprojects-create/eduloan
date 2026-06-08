import Link from "next/link";

const LINKS: Record<string, { href: string; label: string }[]> = {
  student: [
    { href: "/student", label: "Dashboard" },
    { href: "/student/apply", label: "Apply" },
    { href: "/student/calculator", label: "EMI Calculator" },
  ],
  admin: [
    { href: "/admin", label: "Review Queue" },
  ],
  investor: [
    { href: "/investor", label: "Funding Queue" },
    { href: "/investor/analytics", label: "Analytics" },
  ],
};
const LABELS: Record<string, string> = { student: "Student", admin: "Loan Officer", investor: "Investor" };
const HOME: Record<string, string> = { student: "/student", admin: "/admin", investor: "/investor" };

export function Navbar({ name, role }: { name: string; role: string }) {
  const links = LINKS[role] ?? LINKS.student;
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href={HOME[role] ?? "/student"} className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">E</div>
            <span className="font-semibold tracking-tight">EduLoan</span>
            <span className="ml-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">{LABELS[role] ?? role}</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100">{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-zinc-400 md:inline">{name}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-white/5">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
