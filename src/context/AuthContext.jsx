// src/context/AuthContext.jsx
// Global auth context: tracks the Firebase Auth user and the matching
// Firestore users/{uid} profile (role + approval status) in real time.

import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  status: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Tear down any previous profile listener before attaching a new
      // one (handles sign-out → sign-in as a different user cleanly).
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setLoading(true);

      // Live-subscribe to users/{uid} so role/status changes — most
      // importantly an admin approving/rejecting this student — are
      // reflected immediately without requiring a re-login or refresh.
      const profileRef = doc(db, "users", firebaseUser.uid);
      unsubscribeProfile = onSnapshot(
        profileRef,
        (snap) => {
          setProfile(snap.exists() ? { uid: snap.id, ...snap.data() } : null);
          setLoading(false);
        },
        (err) => {
          console.error("[AuthContext] Profile listener error:", err);
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    status: profile?.status ?? null,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
