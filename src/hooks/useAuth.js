// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Access the current auth state: { user, profile, role, status, loading }.
 * Throws if called outside an <AuthProvider> tree.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("[useAuth] useAuth() must be used within an <AuthProvider>.");
  }
  return context;
}
