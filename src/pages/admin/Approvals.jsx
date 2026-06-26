import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { subscribeToPendingStudents, approveStudent, rejectStudent } from "../../lib/users";

export default function Approvals() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeToPendingStudents(
      (list) => {
        setStudents(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load pending students.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function handleApprove(studentUid) {
    setActioningId(studentUid);
    setRowErrors((prev) => ({ ...prev, [studentUid]: null }));
    try {
      await approveStudent(studentUid, user.uid);
    } catch (err) {
      setRowErrors((prev) => ({ ...prev, [studentUid]: err.message || "Approval failed." }));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(studentUid) {
    setActioningId(studentUid);
    setRowErrors((prev) => ({ ...prev, [studentUid]: null }));
    try {
      await rejectStudent(studentUid, user.uid);
    } catch (err) {
      setRowErrors((prev) => ({ ...prev, [studentUid]: err.message || "Rejection failed." }));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <AdminLayout title="Approvals">
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">Loading pending students…</div>
      ) : students.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No pending students</p>
          <p className="text-sm text-slate-400 mt-1">New registrations will appear here for review.</p>
        </div>
      ) : (
        <>
          <div className="hidden sm:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Name</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Email</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Roll number</th>
                  <th className="text-left font-medium text-slate-500 px-5 py-3">Status</th>
                  <th className="text-right font-medium text-slate-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.uid} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{student.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{student.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{student.rollNumber}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone="pending">Pending</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(student.uid)}
                          disabled={actioningId === student.uid}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(student.uid)}
                          disabled={actioningId === student.uid}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                      {rowErrors[student.uid] && (
                        <p className="mt-1.5 text-right text-xs text-red-500">{rowErrors[student.uid]}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3">
            {students.map((student) => (
              <div key={student.uid} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{student.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Roll no. {student.rollNumber}</p>
                  </div>
                  <Badge tone="pending">Pending</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(student.uid)}
                    disabled={actioningId === student.uid}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(student.uid)}
                    disabled={actioningId === student.uid}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
                {rowErrors[student.uid] && (
                  <p className="mt-2 text-xs text-red-500">{rowErrors[student.uid]}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
