import Link from "next/link";

function CapIcon(props: any) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2 2 6 2s6-1 6-2v-5" /></svg>);
}
function ShieldIcon(props: any) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>);
}
function TrendIcon(props: any) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 17l6-6 4 4 7-7" /><path d="M14 7h7v7" /></svg>);
}

const ROLES = [
  { key: "student", title: "Student", desc: "Apply for a loan, upload documents, track status and repay EMIs.", href: "/login?as=student", Icon: CapIcon, color: "text-indigo-300", ring: "hover:border-indigo-400/40" },
  { key: "admin", title: "Loan Officer", desc: "Verify documents and forward vetted applications for funding.", href: "/login?as=admin", Icon: ShieldIcon, color: "text-amber-300", ring: "hover:border-amber-400/40" },
  { key: "investor", title: "Investor", desc: "Approve & disburse loans and track the portfolio analytics.", href: "/login?as=investor", Icon: TrendIcon, color: "text-emerald-300", ring: "hover:border-emerald-400/40" },
];

export function RoleCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">Choose your portal</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ROLES.map(({ key, title, desc, href, Icon, color, ring }) => (
          <Link key={key} href={href}
            className={`glass group rounded-2xl border border-white/10 p-6 transition-all duration-200 hover:scale-[1.02] ${ring}`}>
            <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">{desc}</p>
            <div className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${color}`}>
              Sign in <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
