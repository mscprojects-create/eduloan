"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { formatINR, formatDate } from "@/lib/utils";
import { STATUSES } from "@/lib/constants";

type App = {
  id: string; applicant_name: string | null; course_name: string | null;
  university: string | null; requested_amount: number | null; status: string; created_at: string;
};

export function AdminQueue({ apps, basePath = "/admin/applications" }: { apps: App[]; basePath?: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    let r = apps.filter((a) =>
      (filter === "All" || a.status === filter) &&
      [a.applicant_name, a.course_name, a.university].join(" ").toLowerCase().includes(q.toLowerCase()));
    r = r.sort((a, b) => sortDesc ? +new Date(b.created_at) - +new Date(a.created_at) : +new Date(a.created_at) - +new Date(b.created_at));
    return r;
  }, [apps, q, filter, sortDesc]);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicant, course, university…" className="max-w-xs" />
        <div className="flex gap-1">
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filter === s ? "bg-accent text-white" : "text-zinc-400 hover:bg-white/5"}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setSortDesc((v) => !v)} className="ml-auto text-xs text-zinc-400 hover:text-zinc-200">Date {sortDesc ? "↓" : "↑"}</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-zinc-500">
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 font-medium">Applicant</th>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-medium">{a.applicant_name ?? "—"}</td>
              <td className="px-4 py-3 text-zinc-400">{a.course_name ?? "—"}<div className="text-xs text-zinc-600">{a.university}</div></td>
              <td className="px-4 py-3">{a.requested_amount ? formatINR(a.requested_amount) : "—"}</td>
              <td className="px-4 py-3 text-zinc-400">{formatDate(a.created_at)}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-right"><Link href={`${basePath}/${a.id}`} className="text-indigo-400 hover:underline">Review</Link></td>
            </tr>
          ))}
          {rows.length === 0 && (<tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No applications match.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
