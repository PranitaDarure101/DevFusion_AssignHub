// src/hooks/useAssignments.js

import { useEffect, useState } from "react";
import {
  subscribeToAssignments,
  subscribeToStudentAssignments,
} from "../lib/assignments";

/**
 * Live, student-scoped assignment list.
 * Delegates directly to subscribeToStudentAssignments() which issues a
 * Firestore query filtered by the student's uid and the "ALL" sentinel —
 * no in-memory filtering, no permission errors.
 */
export function useStudentAssignments(studentId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToStudentAssignments(
      studentId,
      (data) => {
        setAssignments(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { assignments, loading, error };
}

/** Live, unfiltered assignment list — admin dashboard and list views only. */
export function useAdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAssignments(
      (all) => {
        setAssignments(all);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { assignments, loading, error };
}