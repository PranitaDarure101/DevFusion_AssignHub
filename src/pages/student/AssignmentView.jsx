// src/pages/student/AssignmentView.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../context/NotificationContext";
import { getAssignment } from "../../lib/assignments";
import {
  createSubmission,
  getSubmissionForAssignment,
} from "../../lib/submissions";
import {
  uploadSubmissionFile,
  getSignedSubmissionUrl,
  MAX_FILE_SIZE_MB,
} from "../../services/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isOverdue(ts) {
  if (!ts?.toDate) return false;
  return ts.toDate() < new Date();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssignmentContent({ assignment }) {
  if (assignment.contentType === "link") {
    return (
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Assignment link
        </p>
        <a
          href={assignment.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-700 font-medium"
        >
          Open assignment
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    );
  }

  if (assignment.contentType === "pdf" && assignment.pdfUrl) {
    return (
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Assignment PDF
        </p>
        <a
          href={assignment.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-700 font-medium"
        >
          View / download PDF
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </a>
      </div>
    );
  }

  if (assignment.contentType === "text" && assignment.richText) {
    return (
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Assignment
        </p>
        <div className="prose prose-sm max-w-none rounded-lg bg-slate-50 p-4 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
          {assignment.richText}
        </div>
      </div>
    );
  }

  return (
    <p className="mt-4 text-sm text-slate-400">
      Assignment content not available yet.
    </p>
  );
}

function AlreadySubmitted({ submission }) {
  const STATUS_TONE = { on_time: "approved", late: "rejected" };
  const STATUS_LABEL = { on_time: "Submitted on time", late: "Submitted late" };

  const [signedUrl, setSignedUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  function formatTimestamp(ts) {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function handleViewFile() {
    if (!submission.submissionFilePath) return;
    setLoadingUrl(true);
    setUrlError("");
    try {
      const url = await getSignedSubmissionUrl(submission.submissionFilePath);
      window.open(url, "_blank", "noreferrer");
    } catch (err) {
      console.error("[AlreadySubmitted] Failed to get signed URL:", err);
      setUrlError("Could not open file. Please try again.");
    } finally {
      setLoadingUrl(false);
    }
  }

  const hasFile = Boolean(submission.submissionFilePath);

  return (
    <Card className="mt-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">Assignment submitted</p>
            <Badge tone={STATUS_TONE[submission.status] || "approved"}>
              {STATUS_LABEL[submission.status] || "Submitted"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted at {formatTimestamp(submission.submittedAt)}
          </p>
          {submission.textSubmission && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
              {submission.textSubmission}
            </div>
          )}
          {hasFile && (
            <button
              type="button"
              onClick={handleViewFile}
              disabled={loadingUrl}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-700 disabled:opacity-50"
            >
              {loadingUrl ? "Opening…" : "View submitted file"}
              {submission.filename && (
                <span className="text-slate-400 text-xs">({submission.filename})</span>
              )}
            </button>
          )}
          {urlError && (
            <p className="mt-1 text-xs text-red-500">{urlError}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function UploadProgressBar({ progress }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">Uploading to storage…</span>
        <span className="text-xs font-medium text-primary-700">{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AssignmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [assignment, setAssignment] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submitMode, setSubmitMode] = useState("file");
  const [file, setFile] = useState(null);
  const [textSubmission, setTextSubmission] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user?.uid) return;
    setLoading(true);
    Promise.all([
      getAssignment(id),
      getSubmissionForAssignment(id, user.uid),
    ])
      .then(([a, sub]) => {
        setAssignment(a);
        setExistingSubmission(sub);
      })
      .catch((err) => console.error("[AssignmentView] Load error:", err))
      .finally(() => setLoading(false));
  }, [id, user?.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (submitMode === "file" && !file) {
      setSubmitError("Choose a file to upload.");
      return;
    }
    if (submitMode === "text" && !textSubmission.trim()) {
      setSubmitError("Write your submission before submitting.");
      return;
    }

    setSubmitting(true);
    let submissionFilePath = null;
    let submissionFileUrl = null;
    let filename = null;
    let fileSize = null;
    let mimeType = null;

    try {
      if (submitMode === "file" && file) {
        setUploading(true);
        setUploadProgress(0);
        try {
          const result = await uploadSubmissionFile(
            file,
            user.uid,
            (pct) => setUploadProgress(pct)
          );
          submissionFilePath = result.path;
          submissionFileUrl = result.url; // null for private bucket
          filename = result.filename;
          fileSize = result.size;
          mimeType = result.mimeType;
        } finally {
          setUploading(false);
        }
      }

      const result = await createSubmission({
        assignmentId: id,
        studentId: user.uid,
        submissionFileUrl,
        submissionFilePath,
        filename,
        fileSize,
        mimeType,
        originalFileName: file?.name || null,
        textSubmission: submitMode === "text" ? textSubmission.trim() : null,
        deadline: assignment.deadline,
      });

      setExistingSubmission({
        assignmentId: id,
        studentId: user.uid,
        submissionFileUrl,
        submissionFilePath,
        filename,
        textSubmission: submitMode === "text" ? textSubmission.trim() : null,
        submittedAt: { toDate: () => new Date() },
        status: result.status,
      });

      notifySuccess(
        result.status === "late"
          ? "Submitted (marked as late)"
          : "Assignment submitted on time!"
      );
    } catch (err) {
      console.error("[AssignmentView] Submission error:", err);
      const msg =
        err.message?.includes("too large") || err.message?.includes("File type")
          ? err.message
          : "Submission failed. Please try again.";
      setSubmitError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  const busy = submitting || uploading;

  if (loading) {
    return (
      <StudentLayout title="Assignment">
        <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
      </StudentLayout>
    );
  }

  if (!assignment) {
    return (
      <StudentLayout title="Assignment">
        <div className="card p-8 text-center text-sm text-slate-400">
          Assignment not found.
        </div>
      </StudentLayout>
    );
  }

  const overdue = isOverdue(assignment.deadline);

  return (
    <StudentLayout title={assignment.title}>
      <button
        type="button"
        onClick={() => navigate("/student/dashboard")}
        className="text-sm text-primary hover:text-primary-700 mb-4 inline-block"
      >
        ← Back to assignments
      </button>

      <Card className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{assignment.title}</h2>
          {overdue && !existingSubmission && (
            <Badge tone="rejected">Overdue</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
        <AssignmentContent assignment={assignment} />
        <p className={`mt-4 text-xs font-medium ${overdue ? "text-red-500" : "text-slate-400"}`}>
          Deadline: {formatDeadline(assignment.deadline)}
        </p>
      </Card>

      {existingSubmission ? (
        <AlreadySubmitted submission={existingSubmission} />
      ) : (
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Your submission
            {overdue && (
              <span className="ml-2 text-xs font-normal text-red-500">
                (deadline passed — will be marked late)
              </span>
            )}
          </h3>

          <div className="flex gap-2 mb-5">
            {["file", "text"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setSubmitMode(mode); setSubmitError(""); }}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  submitMode === mode
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {mode === "file" ? "Upload file" : "Write text"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}

            {submitMode === "file" ? (
              <div>
                <label htmlFor="subFile" className="label">
                  Upload your work (max {MAX_FILE_SIZE_MB} MB · PDF, DOC, DOCX, PPT, PPTX, ZIP)
                </label>
                <input
                  id="subFile"
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setSubmitError("");
                    setUploadProgress(0);
                  }}
                  disabled={busy}
                  className="block w-full text-sm text-slate-600
                    file:mr-4 file:rounded-lg file:border-0
                    file:bg-primary-50 file:px-4 file:py-2
                    file:text-sm file:font-medium file:text-primary-700
                    hover:file:bg-primary-100
                    disabled:opacity-50"
                />
                {file && !uploading && (
                  <p className="mt-1.5 text-xs text-slate-500">{file.name}</p>
                )}
                {uploading && <UploadProgressBar progress={uploadProgress} />}
              </div>
            ) : (
              <div>
                <label htmlFor="subText" className="label">Your answer</label>
                <textarea
                  id="subText"
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Write your submission here…"
                  value={textSubmission}
                  onChange={(e) => { setTextSubmission(e.target.value); setSubmitError(""); }}
                  disabled={busy}
                />
              </div>
            )}

            <Button type="submit" loading={busy} disabled={busy} className="w-full mt-4">
              {uploading
                ? `Uploading… ${uploadProgress}%`
                : submitting
                ? "Submitting…"
                : "Submit assignment"}
            </Button>
          </form>
        </Card>
      )}
    </StudentLayout>
  );
}
