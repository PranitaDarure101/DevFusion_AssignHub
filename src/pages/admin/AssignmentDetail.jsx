// src/pages/admin/AssignmentDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Badge from "../../components/ui/Badge";
import { getAssignment } from "../../lib/assignments";
import { useAssignmentSubmissions } from "../../hooks/useSubmissions";
import { getUserProfile } from "../../lib/users";
import { getSignedSubmissionUrl } from "../../services/storage";

const CONTENT_TYPE_LABEL = { pdf: "PDF", link: "Link", text: "Text" };
const STATUS_TONE = { on_time: "approved", late: "rejected" };
const STATUS_LABEL = { on_time: "On time", late: "Late" };

function formatDeadline(ts) {
  if (!ts?.toDate) return "No deadline";
  return ts.toDate().toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimestamp(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SubmissionFileLink({ submission }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!submission.submissionFilePath) {
    if (submission.textSubmission) {
      return <span className="text-slate-400">Text submission</span>;
    }
    return <span className="text-slate-300">—</span>;
  }

  async function handleOpen() {
    setLoading(true);
    setError("");
    try {
      const url = await getSignedSubmissionUrl(submission.submissionFilePath);
      window.open(url, "_blank", "noreferrer");
    } catch (err) {
      console.error("[AssignmentDetail] Signed URL error:", err);
      setError("Could not open file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={handleOpen}
        disabled={loading}
        className="text-primary hover:text-primary-700 font-medium disabled:opacity-50"
      >
        {loading ? "Opening…" : "View file"}
      </button>
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
    </span>
  );
}

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [assignmentError, setAssignmentError] = useState(null);
  const [studentMap, setStudentMap] = useState({});

  const {
    submissions,
    loading: loadingSubmissions,
    error: submissionsError,
  } = useAssignmentSubmissions(id);

  useEffect(() => {
    if (!id) return;
    setLoadingAssignment(true);
    getAssignment(id)
      .then((a) => {
        setAssignment(a);
        setAssignmentError(null);
      })
      .catch((err) => {
        console.error("[AssignmentDetail] Load error:", err);
        setAssignmentError(err.message || "Failed to load assignment.");
      })
      .finally(() => setLoadingAssignment(false));
  }, [id]);

  useEffect(() => {
    if (submissions.length === 0) return;
    const ids = [...new Set(submissions.map((s) => s.studentId))];
    Promise.all(ids.map((uid) => getUserProfile(uid)))
      .then((results) => {
        const map = {};
        for (const u of results) {
          if (u) map[u.uid] = u;
        }
        setStudentMap(map);
      })
      .catch((err) =>
        console.error("[AssignmentDetail] Failed to load student profiles:", err)
      );
  }, [submissions]);

  const total = submissions.length;
  const onTime = submissions.filter((s) => s.status === "on_time").length;
  const late = submissions.filter((s) => s.status === "late").length;

  if (loadingAssignment) {
    return (
      <AdminLayout title="Assignment">
        <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
      </AdminLayout>
    );
  }

  if (assignmentError) {
    return (
      <AdminLayout title="Assignment">
        <div role="alert" className="card p-8 text-center text-sm text-red-600">
          {assignmentError}
        </div>
      </AdminLayout>
    );
  }

  if (!assignment) {
    return (
      <AdminLayout title="Assignment">
        <div className="card p-8 text-center text-sm text-slate-400">Assignment not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={assignment.title}>
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{assignment.title}</h2>
          <Badge tone="neutral">{CONTENT_TYPE_LABEL[assignment.contentType] || "—"}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Deadline: {formatDeadline(assignment.deadline)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1.5">{total}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">On time</p>
          <p className="text-3xl font-semibold text-emerald-600 mt-1.5">{onTime}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Late</p>
          <p className="text-3xl font-semibold text-red-500 mt-1.5">{late}</p>
        </div>
      </div>

      {submissionsError && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
        >
          {submissionsError.message || "Failed to load submissions."}
        </div>
      )}

      {loadingSubmissions ? (
        <div className="card p-8 text-center text-sm text-slate-400">Loading submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No submissions yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Submissions will appear here as students submit.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Student</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Status</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Submitted at</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Submission</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const student = studentMap[sub.studentId];
                  return (
                    <tr key={sub.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {student?.name || "Loading…"}
                        {student?.rollNumber && (
                          <span className="ml-1.5 text-xs font-normal text-slate-400">
                            ({student.rollNumber})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={STATUS_TONE[sub.status] || "neutral"}>
                          {STATUS_LABEL[sub.status] || "Submitted"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatTimestamp(sub.submittedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <SubmissionFileLink submission={sub} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {submissions.map((sub) => {
              const student = studentMap[sub.studentId];
              return (
                <div key={sub.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {student?.name || "Loading…"}
                      </p>
                      {student?.rollNumber && (
                        <p className="text-xs text-slate-400">{student.rollNumber}</p>
                      )}
                    </div>
                    <Badge tone={STATUS_TONE[sub.status] || "neutral"}>
                      {STATUS_LABEL[sub.status] || "Submitted"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatTimestamp(sub.submittedAt)}</p>
                  <div className="mt-1">
                    <SubmissionFileLink submission={sub} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
