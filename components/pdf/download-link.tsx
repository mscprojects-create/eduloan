"use client";

import dynamic from "next/dynamic";

// Load client-side only — @react-pdf must not run during SSR.
export const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink as any),
  { ssr: false, loading: () => <span className="text-xs text-zinc-500">Preparing…</span> }
) as any;
