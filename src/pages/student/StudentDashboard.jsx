// src/pages/student/StudentDashboard.jsx
// Assignment list for approved students. Shows deadline countdown,
// submission status per assignment, and navigates to the detail/submit view.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { useStudentAssignments } from "../../hooks/useAssignments";
import { getSubmissionsForStudent } from "../../lib/submissions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deadlineLabel(deadlineTimestamp) {
  if (!deadlineTimestamp?.toDate) return { text: "No deadline", urgent: false };
  const deadline = deadlineTimestamp.toDate();
  const now = new Date();
  if (deadline < now) return { text: "Overdue", urgent: true, overdue: true };

  const diffMs = deadline - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffHrs < 24) return { text: `Due in ${diffHrs}h`, urgent: true };
  if (diffDays === 1) return { text: "Due tomorrow", urgent: false };
  return {
    text: deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    urgent: false,
  };
}

const CONTENT_TYPE_ICON = {
  pdf: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  link: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
  text: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
};

const STATUS_TONE = { on_time: "approved", late: "rejected" };
const STATUS_LABEL = { on_time: "Submitted", late: "Submitted late" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const { assignments, loading: loadingAssignments } = useStudentAssignments(user?.uid);
  const [submissionMap, setSubmissionMap] = useState({}); // assignmentId -> submission

  // Load the student's submission history once to know which assignments
  // are already submitted without requiring a per-assignment fetch.
  useEffect(() => {
    if (!user?.uid) return;
    getSubmissionsForStudent(user.uid)
      .then((subs) => {
        const map = {};
        for (const s of subs) map[s.assignmentId] = s;
        setSubmissionMap(map);
      })
      .catch((err) =>
        console.error("[StudentDashboard] Failed to load submissions:", err)
      );
  }, [user?.uid]);

  const pending = assignments.filter((a) => !submissionMap[a.id]);
  const submitted = assignments.filter((a) => submissionMap[a.id]);

  return (
    <StudentLayout title="Assignments">
      {/* Welcome strip */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Welcome back,{" "}
            <span className="font-medium text-slate-700">
              {profile?.name?.split(" ")[0]}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Roll no. {profile?.rollNumber}</p>
        </div>
        <div className="flex gap-2 text-xs text-slate-500">
          <span className="card px-3 py-1.5">
            {pending.length} pending
          </span>
          <span className="card px-3 py-1.5">
            {submitted.length} submitted
          </span>
        </div>
      </div>

      {loadingAssignments ? (
        <div className="card p-8 text-center text-sm text-slate-400">
          Loading your assignments…
        </div>
      ) : assignments.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No assignments yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Your admin hasn&apos;t created any assignments for you yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending section */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                To submit · {pending.length}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pending.map((a) => {
                  const dl = deadlineLabel(a.deadline);
                  return (
                    <Link
                      key={a.id}
                      to={`/student/assignments/${a.id}`}
                      className="card p-5 hover:shadow-card-hover transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-400 min-w-0">
                          {CONTENT_TYPE_ICON[a.contentType]}
                          <h3 className="font-medium text-slate-900 text-sm truncate">
                            {a.title}
                          </h3>
                        </div>
                        <Badge
                          tone={dl.overdue ? "rejected" : dl.urgent ? "pending" : "neutral"}
                          className="shrink-0"
                        >
                          {dl.text}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                        {a.description}
                      </p>
                      <p className="mt-3 text-xs font-medium text-primary">
                        View &amp; submit →
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Submitted section */}
          {submitted.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Submitted · {submitted.length}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {submitted.map((a) => {
                  const sub = submissionMap[a.id];
                  return (
                    <Link
                      key={a.id}
                      to={`/student/assignments/${a.id}`}
                      className="card p-5 opacity-80 hover:opacity-100 hover:shadow-card-hover transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-400 min-w-0">
                          {CONTENT_TYPE_ICON[a.contentType]}
                          <h3 className="font-medium text-slate-700 text-sm truncate">
                            {a.title}
                          </h3>
                        </div>
                        <Badge tone={STATUS_TONE[sub.status] || "approved"}>
                          {STATUS_LABEL[sub.status] || "Submitted"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                        {a.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </StudentLayout>
  );
}
