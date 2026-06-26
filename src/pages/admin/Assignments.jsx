// src/pages/admin/Assignments.jsx
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAdminAssignments } from "../../hooks/useAssignments";

const CONTENT_TYPE_LABEL = { pdf: "PDF", link: "Link", text: "Text" };

function formatDeadline(ts) {
  if (!ts?.toDate) return "No deadline";
  return ts.toDate().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function studentCountLabel(assignedStudents) {
  if (!Array.isArray(assignedStudents) || assignedStudents.length === 0) return "0 students";
  if (assignedStudents.includes("ALL")) return "All students";
  return `${assignedStudents.length} student${assignedStudents.length === 1 ? "" : "s"}`;
}

export default function Assignments() {
  const navigate = useNavigate();
  const { assignments, loading, error } = useAdminAssignments();

  return (
    <AdminLayout title="Assignments">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          {loading
            ? "Loading…"
            : `${assignments.length} assignment${assignments.length === 1 ? "" : "s"} total`}
        </p>
        <Link to="/admin/assignments/new" className="btn-primary inline-flex">
          New assignment
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error.message || "Failed to load assignments."}
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No assignments yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Create your first assignment for students.</p>
          <Link to="/admin/assignments/new" className="btn-primary inline-flex">
            New assignment
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden sm:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Title</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Type</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Assigned to</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/admin/assignments/${a.id}`)}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">{a.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {CONTENT_TYPE_LABEL[a.contentType] || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{studentCountLabel(a.assignedStudents)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDeadline(a.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3">
            {assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/admin/assignments/${a.id}`)}
                className="card w-full p-4 text-left"
              >
                <p className="font-medium text-slate-900 text-sm">{a.title}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>{CONTENT_TYPE_LABEL[a.contentType] || "—"}</span>
                  <span>·</span>
                  <span>{studentCountLabel(a.assignedStudents)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{formatDeadline(a.deadline)}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
