// src/components/layout/StudentLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/student/dashboard", label: "Assignments" },
  { to: "/student/submissions", label: "My submissions" },
];

export default function StudentLayout({ title, children }) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">AssignHub</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">{profile?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-slate-500 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold text-slate-900 mb-5">{title}</h1>
        {children}
      </main>
    </div>
  );
}
