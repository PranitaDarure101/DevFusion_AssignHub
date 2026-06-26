// src/routes/AdminRoute.jsx
// Guards admin-only routes. Only role === "admin" passes through.
// Any other resolved state (no user, student role, missing/unknown
// role) is denied — fails closed rather than open.

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return children;
  }

  // Authenticated students are sent to their own dashboard rather than
  // /login — that route is guarded separately by ProtectedRoute, so
  // this cannot loop back here.
  if (role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Fail closed: role missing/unknown (e.g. no users/{uid} doc, or a
  // role value outside "admin"/"student") — deny by default.
  return <Navigate to="/login" replace />;
}
