// src/services/storage.js
// Supabase Storage service — replaces Cloudinary.
// Firebase Auth and Firestore are untouched.
//
// Buckets:
//   assignments  — public   — stores admin-uploaded PDFs / docs
//   submissions  — private  — stores student-uploaded files
//
// Public files  → permanent public URL via getPublicUrl()
// Private files → short-lived signed URL via createSignedUrl()

import { supabase } from "../lib/supabase";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const BUCKETS = {
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
};

export const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
]);

// Signed URL expiry in seconds (1 hour)
const SIGNED_URL_EXPIRY = 3600;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a UUID-based unique filename while preserving the original extension.
 * @param {File} file
 * @returns {string}
 */
function generateFilename(file) {
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const uuid = crypto.randomUUID();
  return `${uuid}${ext}`;
}

/**
 * Extract MIME type extension for a storage path prefix.
 * e.g. "application/pdf" → "pdf"
 * @param {string} mimeType
 * @returns {string}
 */
function mimeToFolder(mimeType) {
  const map = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/zip": "zip",
  };
  return map[mimeType] || "misc";
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Validate file size and MIME type.
 * @param {File} file
 * @throws {Error} user-readable message on failure
 */
export function validateFile(file) {
  if (!file) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File is too large (${sizeMb} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      `File type "${file.type || "unknown"}" is not allowed. ` +
        "Accepted formats: PDF, DOC, DOCX, PPT, PPTX, ZIP."
    );
  }
}

// ─── Core upload (with progress) ───────────────────────────────────────────────

/**
 * Upload a file to a Supabase Storage bucket with optional progress reporting.
 *
 * The Supabase JS v2 SDK exposes upload progress via the `onUploadProgress`
 * option on the storage.from().upload() call.
 *
 * @param {object} params
 * @param {string}                       params.bucket
 * @param {string}                       params.path       Full storage path including filename
 * @param {File}                         params.file
 * @param {(progress: number) => void}  [params.onProgress]  0–100
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function uploadToSupabase({ bucket, path, file, onProgress }) {
  const options = {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  };

  if (typeof onProgress === "function") {
    // onUploadProgress is supported in @supabase/storage-js >= 2.5.0
    // which ships with @supabase/supabase-js >= 2.39.0
    options.onUploadProgress = (progressEvent) => {
      if (progressEvent.total && progressEvent.total > 0) {
        const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(Math.min(pct, 100));
      }
    };
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) {
    throw new Error(`[storage] Upload failed: ${error.message}`);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload an assignment file to the public "assignments" bucket.
 * Returns the permanent public URL stored in Firestore as `pdfUrl`.
 *
 * @param {File}                        file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{
 *   url: string,
 *   path: string,
 *   bucket: string,
 *   filename: string,
 *   size: number,
 *   mimeType: string,
 * }>}
 */
export async function uploadAssignmentFile(file, onProgress) {
  validateFile(file);

  const filename = generateFilename(file);
  const folder = mimeToFolder(file.type);
  const path = `${folder}/${filename}`;
  const bucket = BUCKETS.ASSIGNMENTS;

  await uploadToSupabase({ bucket, path, file, onProgress });

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("[storage] Failed to retrieve public URL after upload.");
  }

  return {
    url: data.publicUrl,
    path,
    bucket,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Upload a student submission file to the private "submissions" bucket.
 * Returns the storage path (not a URL) — call getSignedSubmissionUrl()
 * whenever the file needs to be opened.
 *
 * @param {File}                        file
 * @param {string}                      studentId   Used as a path prefix for organisation
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{
 *   url: null,
 *   path: string,
 *   bucket: string,
 *   filename: string,
 *   size: number,
 *   mimeType: string,
 * }>}
 */
export async function uploadSubmissionFile(file, studentId, onProgress) {
  validateFile(file);

  const filename = generateFilename(file);
  const folder = mimeToFolder(file.type);
  const path = `${studentId}/${folder}/${filename}`;
  const bucket = BUCKETS.SUBMISSIONS;

  await uploadToSupabase({ bucket, path, file, onProgress });

  return {
    url: null, // private bucket — never a permanent public URL
    path,
    bucket,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Generate a short-lived signed URL for a private submission file.
 *
 * @param {string} path    The `path` value returned by uploadSubmissionFile()
 * @param {number} [expiresIn]  Seconds until expiry (default 3600)
 * @returns {Promise<string>}  Signed URL
 */
export async function getSignedSubmissionUrl(path, expiresIn = SIGNED_URL_EXPIRY) {
  if (!path) throw new Error("[storage] getSignedSubmissionUrl requires a path.");

  const { data, error } = await supabase.storage
    .from(BUCKETS.SUBMISSIONS)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(
      `[storage] Failed to create signed URL: ${error?.message ?? "unknown error"}`
    );
  }

  return data.signedUrl;
}

/**
 * Get the permanent public URL for a file in the public assignments bucket.
 *
 * @param {string} path
 * @returns {string}
 */
export function getPublicFileUrl(path) {
  if (!path) throw new Error("[storage] getPublicFileUrl requires a path.");
  const { data } = supabase.storage.from(BUCKETS.ASSIGNMENTS).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from any bucket.
 *
 * @param {string} bucket  e.g. "assignments" | "submissions"
 * @param {string} path
 * @returns {Promise<void>}
 */
export async function deleteFile(bucket, path) {
  if (!bucket || !path) {
    throw new Error("[storage] deleteFile requires bucket and path.");
  }
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`[storage] deleteFile failed: ${error.message}`);
  }
}
