// src/pages/student/StudentPending.jsx
// Reachable regardless of auth status (see AppRoutes) — handles its
// own redirect logic for approved students, and renders a distinct
// state for rejected students rather than a dead end.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function StudentPending() {
  const navigate = useNavigate();
  const { user, role, status, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (role === "student" && status === "approved") {
      navigate("/student/dashboard", { replace: true });
    }
  }, [user, role, status, loading, navigate]);

  async function handleSignOut() {
    await signOut(auth);
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  const rejected = status === "rejected";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            rejected ? "bg-red-50" : "bg-amber-50"
          }`}
        >
          {rejected ? (
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-7 w-7 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
          )}
        </span>

        <h1 className="mt-5 text-lg font-semibold text-slate-900">
          {rejected ? "Registration not approved" : "Your account is pending approval"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {rejected
            ? "Your admin has declined this registration. Contact them directly if you believe this is a mistake."
            : "An admin needs to review and approve your registration before you can see assignments. This usually doesn't take long — check back soon."}
        </p>

        {!rejected && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-4 text-left">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
              Once approved, you&apos;ll be able to
            </p>
            <ul className="space-y-1.5 text-sm text-slate-500">
              <li>• View assignments created for you</li>
              <li>• Submit your work before each deadline</li>
              <li>• Track your submission history</li>
            </ul>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
