"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { calculateEMI } from "@/lib/emi";
import { formatINR } from "@/lib/utils";
import { ANNUAL_INTEREST_RATE } from "@/lib/constants";

const STEPS = ["Personal", "Academic", "Financial", "Documents", "Review"];

export function ApplyWizard() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<{ name: string; type: string }[]>([]);

  const [f, setF] = useState({
    applicant_name: "", phone: "", address: "",
    prev_qualification: "", prev_score: "", university: "",
    course_name: "", course_duration_months: 24,
    requested_amount: 100000, tenure_months: 60,
    guarantor_name: "", guarantor_relation: "", guarantor_income: 0,
  });
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  // Load any existing draft
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const { data: draft } = await supabase
        .from("applications").select("*").eq("student_id", user.id).eq("status", "Draft")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (draft) {
        setDraftId(draft.id);
        const { data: det } = await supabase.from("application_details").select("*").eq("application_id", draft.id).maybeSingle();
        setF((p) => ({
          ...p,
          applicant_name: draft.applicant_name ?? profile?.full_name ?? "",
          university: draft.university ?? "", course_name: draft.course_name ?? "",
          course_duration_months: draft.course_duration_months ?? 24,
          requested_amount: draft.requested_amount ?? 100000,
          tenure_months: draft.tenure_months ?? 60,
          phone: det?.phone ?? "", address: det?.address ?? "",
          prev_qualification: det?.prev_qualification ?? "", prev_score: det?.prev_score ?? "",
          guarantor_name: det?.guarantor_name ?? "", guarantor_relation: det?.guarantor_relation ?? "",
          guarantor_income: det?.guarantor_income ?? 0,
        }));
        const { data: d } = await supabase.from("documents").select("doc_type,file_path").eq("application_id", draft.id);
        if (d) setDocs(d.map((x) => ({ type: x.doc_type, name: x.file_path.split("/").pop() ?? "file" })));
      } else if (profile?.full_name) {
        set("applicant_name", profile.full_name);
      }
    })();
  }, []);

  async function saveDraft(): Promise<string | null> {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return null; }
    const payload = {
      student_id: user.id, applicant_name: f.applicant_name, applicant_email: user.email,
      university: f.university, course_name: f.course_name,
      course_duration_months: Number(f.course_duration_months),
      requested_amount: Number(f.requested_amount), tenure_months: Number(f.tenure_months),
      status: "Draft" as const, updated_at: new Date().toISOString(),
    };
    let id = draftId;
    if (id) {
      await supabase.from("applications").update(payload).eq("id", id);
    } else {
      const { data } = await supabase.from("applications").insert(payload).select("id").single();
      id = data?.id ?? null;
      setDraftId(id);
    }
    if (id) {
      await supabase.from("application_details").upsert({
        application_id: id, phone: f.phone || null, address: f.address || null,
        prev_qualification: f.prev_qualification || null, prev_score: f.prev_score || null,
        guarantor_name: f.guarantor_name || null, guarantor_relation: f.guarantor_relation || null,
        guarantor_income: f.guarantor_income ? Number(f.guarantor_income) : null,
      });
    }
    setSaving(false);
    return id;
  }

  async function next() {
    if (step === 2 && !draftId) await saveDraft();   // ensure id before uploads
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>, docType: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    let id = draftId ?? (await saveDraft());
    if (!id) return alert("Could not create draft.");
    setBusy(true);
    const path = `${id}/${docType}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("loan-documents").upload(path, file, { upsert: true });
    if (error) { setBusy(false); return alert(error.message); }
    await supabase.from("documents").insert({ application_id: id, doc_type: docType, file_path: path });
    setDocs((d) => [...d.filter((x) => x.type !== docType), { type: docType, name: file.name }]);
    setBusy(false);
  }

  async function submit() {
    setBusy(true);
    const id = await saveDraft();
    if (!id) { setBusy(false); return; }
    await supabase.from("applications")
      .update({ status: "Submitted", submitted_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(false);
    router.push("/student");
    router.refresh();
  }

  const emi = calculateEMI(Number(f.requested_amount), ANNUAL_INTEREST_RATE, Number(f.tenure_months));

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <Stepper step={step} />

      <div className="mt-7 space-y-4">
        {step === 0 && (
          <>
            <Field label="Full name"><Input value={f.applicant_name} onChange={(e) => set("applicant_name", e.target.value)} /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" /></Field>
            <Field label="Address"><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Previous qualification"><Input value={f.prev_qualification} onChange={(e) => set("prev_qualification", e.target.value)} placeholder="B.Tech CSE" /></Field>
            <Field label="Score / CGPA"><Input value={f.prev_score} onChange={(e) => set("prev_score", e.target.value)} placeholder="8.5 CGPA" /></Field>
            <Field label="Target university"><Input value={f.university} onChange={(e) => set("university", e.target.value)} /></Field>
            <Field label="Course name"><Input value={f.course_name} onChange={(e) => set("course_name", e.target.value)} placeholder="MS in Computer Science" /></Field>
            <Field label="Course duration (months)"><Input type="number" value={f.course_duration_months} onChange={(e) => set("course_duration_months", e.target.value)} /></Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Requested amount (INR)"><Input type="number" value={f.requested_amount} onChange={(e) => set("requested_amount", e.target.value)} /></Field>
            <Field label="Preferred tenure (months)"><Input type="number" value={f.tenure_months} onChange={(e) => set("tenure_months", e.target.value)} /></Field>
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-indigo-200">
              Estimated EMI at {ANNUAL_INTEREST_RATE}% p.a.: <b>{formatINR(emi)}</b> / month
            </div>
            <Field label="Guarantor / co-applicant name"><Input value={f.guarantor_name} onChange={(e) => set("guarantor_name", e.target.value)} /></Field>
            <Field label="Relationship"><Input value={f.guarantor_relation} onChange={(e) => set("guarantor_relation", e.target.value)} placeholder="Father" /></Field>
            <Field label="Guarantor annual income (INR)"><Input type="number" value={f.guarantor_income} onChange={(e) => set("guarantor_income", e.target.value)} /></Field>
          </>
        )}
        {step === 3 && (
          <div className="space-y-3">
            {["ID proof", "Admission letter", "Fee structure", "Marksheet"].map((t) => {
              const done = docs.find((d) => d.type === t);
              return (
                <label key={t} className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20">
                  <div>
                    <div className="text-sm font-medium">{t}</div>
                    <div className="text-xs text-zinc-500">{done ? `Uploaded: ${done.name}` : "PDF, JPG or PNG · max 5 MB"}</div>
                  </div>
                  <span className={`text-xs ${done ? "text-emerald-400" : "text-indigo-400"}`}>{done ? "Replace" : "Upload"}</span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onUpload(e, t)} />
                </label>
              );
            })}
            {busy && <p className="text-xs text-zinc-500">Uploading…</p>}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-2 text-sm">
            <Review k="Applicant" v={f.applicant_name} />
            <Review k="Course" v={`${f.course_name} · ${f.university}`} />
            <Review k="Requested" v={formatINR(Number(f.requested_amount))} />
            <Review k="Tenure" v={`${f.tenure_months} months`} />
            <Review k="Est. EMI" v={formatINR(emi)} />
            <Review k="Documents" v={`${docs.length} uploaded`} />
            <p className="pt-3 text-xs text-zinc-500">By submitting you confirm the information is accurate. This is a demo — no real funds are involved.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save draft"}</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit application"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className={`h-1 w-full rounded-full ${i <= step ? "bg-accent" : "bg-white/10"}`} />
          <span className={`text-[11px] ${i === step ? "text-zinc-100" : "text-zinc-500"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}
function Review({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2">
      <span className="text-zinc-500">{k}</span><span className="font-medium">{v}</span>
    </div>
  );
}
