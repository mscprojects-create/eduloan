import Link from "next/link";

export function Navbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">E</div>
          <span className="font-semibold tracking-tight">EduLoan</span>
          <span className="ml-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
            {role}
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-zinc-400 sm:inline">{name}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-white/5">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
