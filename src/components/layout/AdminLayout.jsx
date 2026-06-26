// src/components/layout/AdminLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { subscribeToPendingStudents } from "../../lib/users";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/approvals", label: "Approvals", badge: true },
  { to: "/admin/assignments", label: "Assignments" },
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToPendingStudents(
      (students) => setPendingCount(students.length),
      (err) => console.error("[AdminLayout] Pending count error:", err)
    );
    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col border-r border-slate-200 bg-white px-4 py-6">
        <p className="px-2 text-lg font-semibold text-slate-900 mb-8">AssignHub</p>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span>{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5">
          <div>
            <p className="lg:hidden text-sm font-semibold text-slate-900">AssignHub</p>
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">{profile?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Nav (mobile) */}
        <nav className="lg:hidden flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-slate-500"
                }`
              }
            >
              {item.label}
              {item.badge && pendingCount > 0 ? ` (${pendingCount})` : ""}
            </NavLink>
          ))}
        </nav>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
