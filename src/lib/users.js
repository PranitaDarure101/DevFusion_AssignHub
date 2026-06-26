// src/lib/users.js
// Firestore "users" collection access layer.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "users";

function mapDoc(snap) {
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

/**
 * Create a new student profile at registration time. Always writes
 * role: "student" and status: "pending", matching the create
 * constraint enforced in firestore.rules.
 */
export async function createStudentProfile(uid, { name, email, rollNumber }) {
  if (!uid) throw new Error("[users] createStudentProfile requires a uid.");
  if (!name?.trim()) throw new Error("[users] name is required.");
  if (!email?.trim()) throw new Error("[users] email is required.");
  if (!rollNumber?.trim()) throw new Error("[users] rollNumber is required.");

  try {
    await setDoc(doc(db, COLLECTION, uid), {
      uid,
      name: name.trim(),
      email: email.trim(),
      rollNumber: rollNumber.trim(),
      role: "student",
      status: "pending",
      createdAt: serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
    });
  } catch (err) {
    console.error("[users] createStudentProfile failed:", err);
    throw err;
  }
}

/** Fetch a single user profile by uid. Returns null if it doesn't exist. */
export async function getUserProfile(uid) {
  if (!uid) throw new Error("[users] getUserProfile requires a uid.");
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    return mapDoc(snap);
  } catch (err) {
    console.error("[users] getUserProfile failed:", err);
    throw err;
  }
}

/**
 * Partial update to a user's own editable profile fields. Role/status
 * protection is enforced in firestore.rules, not here.
 */
export async function updateUserProfile(uid, updates) {
  if (!uid) throw new Error("[users] updateUserProfile requires a uid.");
  try {
    await updateDoc(doc(db, COLLECTION, uid), updates);
  } catch (err) {
    console.error("[users] updateUserProfile failed:", err);
    throw err;
  }
}

/** Admin approves a pending (or previously rejected) student. */
export async function approveStudent(studentUid, adminUid) {
  if (!studentUid) throw new Error("[users] approveStudent requires a studentUid.");
  if (!adminUid) throw new Error("[users] approveStudent requires an adminUid.");
  try {
    await updateDoc(doc(db, COLLECTION, studentUid), {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
    });
  } catch (err) {
    console.error("[users] approveStudent failed:", err);
    throw err;
  }
}

/** Admin rejects a pending student. */
export async function rejectStudent(studentUid, adminUid) {
  if (!studentUid) throw new Error("[users] rejectStudent requires a studentUid.");
  if (!adminUid) throw new Error("[users] rejectStudent requires an adminUid.");
  try {
    await updateDoc(doc(db, COLLECTION, studentUid), {
      status: "rejected",
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
    });
  } catch (err) {
    console.error("[users] rejectStudent failed:", err);
    throw err;
  }
}

/**
 * Live subscription to students awaiting approval — backs the admin
 * dashboard pending-count badge and the approvals queue.
 */
export function subscribeToPendingStudents(onChange, onError) {
  const q = query(
    collection(db, COLLECTION),
    where("role", "==", "student"),
    where("status", "==", "pending")
  );
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(mapDoc)),
    (err) => {
      console.error("[users] subscribeToPendingStudents error:", err);
      onError?.(err);
    }
  );
}

/** One-time fetch of every approved student. */
export async function getApprovedStudents() {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("role", "==", "student"),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  } catch (err) {
    console.error("[users] getApprovedStudents failed:", err);
    throw err;
  }
}
