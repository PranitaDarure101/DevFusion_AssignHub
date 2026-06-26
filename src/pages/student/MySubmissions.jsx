// src/pages/student/MySubmissions.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { useStudentSubmissions } from "../../hooks/useSubmissions";
import { getAssignment } from "../../lib/assignments";
import { getSignedSubmissionUrl } from "../../services/storage";

const STATUS_TONE = { on_time: "approved", late: "rejected" };
const STATUS_LABEL = { on_time: "On time", late: "Late" };

function formatTimestamp(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function FileLink({ submission }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!submission.submissionFilePath) {
    return <span className="text-slate-400">Text</span>;
  }

  async function handleOpen() {
    setLoading(true);
    setError("");
    try {
      const url = await getSignedSubmissionUrl(submission.submissionFilePath);
      window.open(url, "_blank", "noreferrer");
    } catch (err) {
      console.error("[MySubmissions] Signed URL error:", err);
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
        className="text-primary hover:text-primary-700 font-medium text-sm disabled:opacity-50"
      >
        {loading ? "Opening…" : "View file"}
      </button>
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
    </span>
  );
}

export default function MySubmissions() {
  const { user } = useAuth();
  const { submissions, loading } = useStudentSubmissions(user?.uid);
  const [assignmentTitles, setAssignmentTitles] = useState({});

  useEffect(() => {
    if (submissions.length === 0) return;
    const ids = [...new Set(submissions.map((s) => s.assignmentId))];
    Promise.all(ids.map((id) => getAssignment(id)))
      .then((results) => {
        const map = {};
        for (const a of results) {
          if (a) map[a.id] = a.title;
        }
        setAssignmentTitles(map);
      })
      .catch((err) =>
        console.error("[MySubmissions] Failed to fetch assignment titles:", err)
      );
  }, [submissions]);

  return (
    <StudentLayout title="My submissions">
      <p className="text-sm text-slate-500 mb-5">
        {submissions.length} submission{submissions.length === 1 ? "" : "s"} total
      </p>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">
          Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No submissions yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Submit your first assignment and it&apos;ll appear here.
          </p>
          <Link to="/student/dashboard" className="btn-primary inline-flex">
            View assignments
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="text-left font-medium text-slate-500 px-5 py-3">
                  Assignment
                </th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">
                  Status
                </th>
                <th className="text-left font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">
                  Submitted at
                </th>
                <th className="text-left font-medium text-slate-500 px-5 py-3 hidden md:table-cell">
                  File
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/student/assignments/${sub.assignmentId}`}
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {assignmentTitles[sub.assignmentId] || (
                        <span className="text-slate-400">Loading…</span>
                      )}
                    </Link>
                    <p className="text-xs text-slate-400 sm:hidden mt-0.5">
                      {formatTimestamp(sub.submittedAt)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={STATUS_TONE[sub.status] || "neutral"}>
                      {STATUS_LABEL[sub.status] || "Submitted"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                    {formatTimestamp(sub.submittedAt)}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <FileLink submission={sub} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StudentLayout>
  );
}
