// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { subscribeToPendingStudents, getApprovedStudents } from "../../lib/users";
import { useAdminAssignments } from "../../hooks/useAssignments";

function MetricCard({ label, value, sublabel, accent }) {
  return (
    <div className={`card p-5 ${accent ? "border-primary/20 bg-primary-50/40" : ""}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-1.5">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const { assignments, loading: loadingAssignments } = useAdminAssignments();

  // Live pending count
  useEffect(() => {
    const unsubscribe = subscribeToPendingStudents(
      (students) => {
        setPendingCount(students.length);
        setLoadingCounts(false);
      },
      (err) => {
        console.error("[AdminDashboard] Pending count error:", err);
        setLoadingCounts(false);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    getApprovedStudents()
      .then((s) => setApprovedCount(s.length))
      .catch((err) => console.error("[AdminDashboard] Approved count error:", err));
  }, []);

  const now = new Date();
  const activeAssignments = assignments.filter(
    (a) => a.deadline?.toDate?.() > now
  );
  const recentAssignments = assignments.slice(0, 5);

  return (
    <AdminLayout title="Dashboard">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Pending approvals"
          value={loadingCounts ? "—" : pendingCount}
          sublabel="Awaiting review"
          accent={pendingCount > 0}
        />
        <MetricCard
          label="Approved students"
          value={loadingCounts ? "—" : approvedCount}
          sublabel="Active accounts"
        />
        <MetricCard
          label="Total assignments"
          value={loadingAssignments ? "—" : assignments.length}
          sublabel="All time"
        />
        <MetricCard
          label="Active assignments"
          value={loadingAssignments ? "—" : activeAssignments.length}
          sublabel="Deadline not yet passed"
        />
      </div>

      {/* Pending approvals banner */}
      {pendingCount > 0 && (
        <Link
          to="/admin/approvals"
          className="flex items-center justify-between card p-4 mb-6 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-amber-900">
                {pendingCount} student{pendingCount === 1 ? "" : "s"} waiting for approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Click to review pending registrations</p>
            </div>
          </div>
          <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}

      {/* Recent assignments */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Recent assignments</h2>
        <Link
          to="/admin/assignments"
          className="text-sm text-primary hover:text-primary-700 font-medium"
        >
          View all →
        </Link>
      </div>

      {loadingAssignments ? (
        <div className="card p-6 text-center text-sm text-slate-400">Loading assignments…</div>
      ) : recentAssignments.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No assignments yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Create your first assignment for students.
          </p>
          <Link
            to="/admin/assignments/new"
            className="btn-primary inline-flex"
          >
            New assignment
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="text-left font-medium text-slate-500 px-5 py-3">Title</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">
                  Assigned to
                </th>
                <th className="text-left font-medium text-slate-500 px-5 py-3 hidden md:table-cell">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.map((a) => {
                const overdue = a.deadline?.toDate?.() < now;
                return (
                  <tr
                    key={a.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/admin/assignments/${a.id}`)}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">{a.title}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                      {a.assignedStudents?.[0] === "ALL"
                        ? "All students"
                        : `${a.assignedStudents?.length || 0} students`}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={overdue ? "text-red-500 font-medium" : "text-slate-500"}>
                        {formatDate(a.deadline)}
                        {overdue && " · Overdue"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
