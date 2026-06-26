// src/pages/admin/NewAssignment.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../context/NotificationContext";
import { createAssignment } from "../../lib/assignments";
import { getApprovedStudents } from "../../lib/users";
import { uploadAssignmentFile, MAX_FILE_SIZE_MB } from "../../services/storage";

export default function NewAssignment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contentType, setContentType] = useState("pdf");
  const [pdfFile, setPdfFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [richText, setRichText] = useState("");

  const [audience, setAudience] = useState("all");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getApprovedStudents()
      .then(setStudents)
      .catch((err) => console.error("[NewAssignment] Failed to load students:", err))
      .finally(() => setLoadingStudents(false));
  }, []);

  function toggleStudent(uid) {
    setSelectedStudentIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Title is required."); return; }
    if (!deadline) { setError("Deadline is required."); return; }
    if (contentType === "pdf" && !pdfFile) { setError("Choose a PDF file to upload."); return; }
    if (contentType === "link" && !linkUrl.trim()) { setError("Enter a link URL."); return; }
    if (contentType === "text" && !richText.trim()) { setError("Enter the assignment text."); return; }
    if (audience === "selected" && selectedStudentIds.length === 0) {
      setError("Select at least one student.");
      return;
    }

    setSubmitting(true);
    try {
      let pdfUrl = null;

      if (contentType === "pdf" && pdfFile) {
        setUploading(true);
        setUploadProgress(0);
        try {
          const result = await uploadAssignmentFile(pdfFile, (pct) => setUploadProgress(pct));
          pdfUrl = result.url;
        } finally {
          setUploading(false);
        }
      }

      const assignedStudents = audience === "all" ? ["ALL"] : selectedStudentIds;

      await createAssignment({
        title: title.trim(),
        description: description.trim(),
        contentType,
        pdfUrl,
        linkUrl: contentType === "link" ? linkUrl.trim() : null,
        richText: contentType === "text" ? richText.trim() : null,
        deadline: new Date(deadline),
        assignedStudents,
        createdBy: user.uid,
      });

      notifySuccess("Assignment created successfully.");
      navigate("/admin/assignments");
    } catch (err) {
      console.error("[NewAssignment] Create failed:", err);
      const msg = err.message || "Failed to create assignment.";
      setError(msg);
      notifyError(msg);
      setSubmitting(false);
    }
  }

  const busy = submitting || uploading;

  return (
    <AdminLayout title="New assignment">
      <form onSubmit={handleSubmit} noValidate className="card p-6 max-w-2xl space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input
            id="title"
            type="text"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            rows={3}
            className="input-field resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="deadline" className="label">Deadline</label>
          <input
            id="deadline"
            type="datetime-local"
            className="input-field"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div>
          <p className="label">Content type</p>
          <div className="flex gap-2">
            {["pdf", "link", "text"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  contentType === type
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type === "pdf" ? "PDF" : type === "link" ? "Link" : "Text"}
              </button>
            ))}
          </div>
        </div>

        {contentType === "pdf" && (
          <div>
            <label htmlFor="pdfFile" className="label">
              PDF file (max {MAX_FILE_SIZE_MB} MB)
            </label>
            <input
              id="pdfFile"
              type="file"
              accept="application/pdf"
              onChange={(e) => { setPdfFile(e.target.files?.[0] || null); setUploadProgress(0); }}
              className="block w-full text-sm text-slate-600
                file:mr-4 file:rounded-lg file:border-0
                file:bg-primary-50 file:px-4 file:py-2
                file:text-sm file:font-medium file:text-primary-700
                hover:file:bg-primary-100"
            />
            {pdfFile && (
              <p className="mt-1.5 text-xs text-slate-500">{pdfFile.name}</p>
            )}
            {uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Uploading…</span>
                  <span className="text-xs font-medium text-primary-700">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {contentType === "link" && (
          <div>
            <label htmlFor="linkUrl" className="label">Assignment link</label>
            <input
              id="linkUrl"
              type="url"
              placeholder="https://…"
              className="input-field"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
        )}

        {contentType === "text" && (
          <div>
            <label htmlFor="richText" className="label">Assignment text</label>
            <textarea
              id="richText"
              rows={6}
              className="input-field resize-none"
              value={richText}
              onChange={(e) => setRichText(e.target.value)}
            />
          </div>
        )}

        <div>
          <p className="label">Assign to</p>
          <div className="flex gap-2 mb-3">
            {[
              { value: "all", display: "All students" },
              { value: "selected", display: "Selected students" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudience(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  audience === opt.value
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.display}
              </button>
            ))}
          </div>

          {audience === "selected" && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {loadingStudents ? (
                <p className="p-4 text-sm text-slate-400">Loading students…</p>
              ) : students.length === 0 ? (
                <p className="p-4 text-sm text-slate-400">No approved students yet.</p>
              ) : (
                students.map((s) => (
                  <label
                    key={s.uid}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.uid)}
                      onChange={() => toggleStudent(s.uid)}
                      className="h-4 w-4 rounded border-slate-300 text-primary"
                    />
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-slate-400 text-xs">{s.rollNumber}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full justify-center disabled:opacity-60 gap-2"
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Uploading PDF… {uploadProgress}%
            </>
          ) : submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating…
            </>
          ) : (
            "Create assignment"
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
