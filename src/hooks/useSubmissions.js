// src/hooks/useSubmissions.js

import { useEffect, useState } from "react";
import { subscribeToSubmissions } from "../lib/submissions";

function useSubmissionsSubscription(filter, dep) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dep) {
      setSubmissions([]);
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToSubmissions(
      filter,
      (subs) => {
        setSubmissions(subs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  return { submissions, loading, error };
}

/** Live submissions for one student, newest first. */
export function useStudentSubmissions(studentId) {
  return useSubmissionsSubscription({ studentId }, studentId);
}

/** Live submissions for one assignment, oldest first — admin tracker. */
export function useAssignmentSubmissions(assignmentId) {
  return useSubmissionsSubscription({ assignmentId }, assignmentId);
}
