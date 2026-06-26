// src/routes/ProtectedRoute.jsx
// Guards student-facing (and admin-accessible) routes. Waits for auth +
// profile to resolve before making any redirect decision, to avoid
// flicker/loop between /login and the destination route.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, role, status, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = role === "admin";
  const isApprovedStudent = role === "student" && status === "approved";

  if (isAdmin || isApprovedStudent) {
    return children;
  }

  // Pending or rejected students land on the pending screen, not back
  // through /login — keeps a single, non-looping redirect target.
  if (role === "student" && (status === "pending" || status === "rejected")) {
    return <Navigate to="/student/pending" replace />;
  }

  // Defensive fallback: authenticated but no resolvable role/status
  // (e.g. missing users/{uid} doc) — deny by default.
  return <Navigate to="/login" replace />;
}
