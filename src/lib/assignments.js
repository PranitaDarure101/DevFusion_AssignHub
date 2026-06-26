// src/lib/assignments.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "assignments";
const VALID_CONTENT_TYPES = ["pdf", "link", "text"];

function toTimestamp(value) {
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  throw new Error("[assignments] deadline must be a Date or Firestore Timestamp.");
}

function validateContentFields({ contentType, pdfUrl, linkUrl, richText }) {
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new Error(
      `[assignments] Invalid contentType "${contentType}". Must be one of: ${VALID_CONTENT_TYPES.join(", ")}.`
    );
  }
  if (contentType === "pdf" && !pdfUrl) {
    throw new Error('[assignments] contentType is "pdf" but pdfUrl is missing.');
  }
  if (contentType === "link" && !linkUrl) {
    throw new Error('[assignments] contentType is "link" but linkUrl is missing.');
  }
  if (contentType === "text" && !richText) {
    throw new Error('[assignments] contentType is "text" but richText is missing.');
  }
}

function mapDoc(snap) {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createAssignment({
  title,
  description,
  contentType,
  pdfUrl = null,
  linkUrl = null,
  richText = null,
  deadline,
  assignedStudents,
  createdBy,
}) {
  if (!title?.trim()) throw new Error("[assignments] title is required.");
  if (!createdBy) throw new Error("[assignments] createdBy (admin uid) is required.");
  if (!Array.isArray(assignedStudents) || assignedStudents.length === 0) {
    throw new Error("[assignments] assignedStudents must be a non-empty array.");
  }
  validateContentFields({ contentType, pdfUrl, linkUrl, richText });

  const payload = {
    title: title.trim(),
    description: description?.trim() || "",
    contentType,
    // pdfUrl is the public Supabase Storage URL for the assignments bucket
    pdfUrl: contentType === "pdf" ? pdfUrl : null,
    linkUrl: contentType === "link" ? linkUrl : null,
    richText: contentType === "text" ? richText : null,
    deadline: toTimestamp(deadline),
    assignedStudents,
    createdBy,
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, COLLECTION), payload);
    return ref.id;
  } catch (err) {
    console.error("[assignments] createAssignment failed:", err);
    throw err;
  }
}

export async function getAssignment(id) {
  if (!id) throw new Error("[assignments] getAssignment requires an id.");
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return mapDoc(snap);
  } catch (err) {
    console.error("[assignments] getAssignment failed:", err);
    throw err;
  }
}

export async function updateAssignment(id, updates) {
  if (!id) throw new Error("[assignments] updateAssignment requires an id.");

  const payload = { ...updates };

  if (payload.deadline !== undefined) {
    payload.deadline = toTimestamp(payload.deadline);
  }
  if (payload.contentType !== undefined) {
    validateContentFields({
      contentType: payload.contentType,
      pdfUrl: payload.pdfUrl,
      linkUrl: payload.linkUrl,
      richText: payload.richText,
    });
  }

  try {
    await updateDoc(doc(db, COLLECTION, id), payload);
  } catch (err) {
    console.error("[assignments] updateAssignment failed:", err);
    throw err;
  }
}

export async function deleteAssignment(id) {
  if (!id) throw new Error("[assignments] deleteAssignment requires an id.");
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (err) {
    console.error("[assignments] deleteAssignment failed:", err);
    throw err;
  }
}

export function subscribeToAssignments(onChange, onError) {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(mapDoc)),
    (err) => {
      console.error("[assignments] subscribeToAssignments error:", err);
      onError?.(err);
    }
  );
}

export function subscribeToStudentAssignments(studentUid, onChange, onError) {
  if (!studentUid) {
    const err = new Error("[assignments] subscribeToStudentAssignments requires a studentUid.");
    console.error(err);
    onError?.(err);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where("assignedStudents", "array-contains-any", [studentUid, "ALL"]),
    orderBy("deadline", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(mapDoc)),
    (err) => {
      console.error("[assignments] subscribeToStudentAssignments error:", err);
      onError?.(err);
    }
  );
}

export async function getAssignmentsForStudent(studentUid) {
  if (!studentUid) {
    throw new Error("[assignments] getAssignmentsForStudent requires a studentUid.");
  }
  try {
    const q = query(
      collection(db, COLLECTION),
      where("assignedStudents", "array-contains-any", [studentUid, "ALL"]),
      orderBy("deadline", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  } catch (err) {
    console.error("[assignments] getAssignmentsForStudent failed:", err);
    throw err;
  }
}

export async function getAssignmentsForAdmin() {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  } catch (err) {
    console.error("[assignments] getAssignmentsForAdmin failed:", err);
    throw err;
  }
}
