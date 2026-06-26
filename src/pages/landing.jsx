// src/pages/Landing.jsx
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Admin-gated access",
    description:
      "Every student account is reviewed by an admin before gaining access. No open links, no unauthorised viewing.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-9 4h12a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H8.621a1.5 1.5 0 00-1.06.44L4.94 7.56a1.5 1.5 0 00-.44 1.06V19.5A1.5 1.5 0 006 21z" />
      </svg>
    ),
    title: "Structured assignments",
    description:
      "Create assignments with PDFs, external links, or rich text. Set deadlines and assign to all students or specific ones.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5L21 3.75M3 21h18" />
      </svg>
    ),
    title: "Real-time tracking",
    description:
      "Watch submission status update live. See who submitted on time, who is late, and who hasn't submitted yet.",
  },
];

const STEPS = [
  { step: "01", label: "Student registers", detail: "Fills name, roll number, and email." },
  { step: "02", label: "Admin approves", detail: "Admin reviews and grants access with one click." },
  { step: "03", label: "Assignments distributed", detail: "Students see only their assigned work." },
  { step: "04", label: "Submissions tracked", detail: "Live dashboard shows progress in real time." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-900">AssignHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 inline-block" />
            Built for educators, coaches &amp; departments
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Assignment management
            <br />
            <span className="text-primary-600">with real access control</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed">
            Stop sharing assignments over WhatsApp or open Google Classroom links.
            AssignHub puts an admin approval gate between registration and access —
            so only verified students see your content.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary w-full sm:w-auto px-6 py-3 text-base">
              Register as a student
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sign in to your account
            </Link>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────── */}
        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold text-slate-900 mb-12">
              Everything a teacher needs. Nothing students shouldn&apos;t see.
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-slate-900 mb-12">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-slate-200 z-0" />
                )}
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-semibold">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{s.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Ready to replace the WhatsApp group?
            </h2>
            <p className="mt-4 text-slate-500">
              Set up AssignHub in minutes. Your first admin account is one command.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary w-full sm:w-auto px-6 py-3 text-base">
                Create student account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Admin login
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-600">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">AssignHub</span>
        </div>
        <p className="text-xs text-slate-400">
          Built for DevFusion 3.0 · Problem Statement #26ENAH1
        </p>
      </footer>
    </div>
  );
}