// src/routes/AppRoutes.jsx
// Complete Phase 2 route table — all admin assignment routes and
// student assignment/submission routes wired to ProtectedRoute/AdminRoute.

import { Routes, Route } from "react-router-dom";

// Public
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Student
import StudentPending from "../pages/student/StudentPending";
import StudentDashboard from "../pages/student/StudentDashboard";
import AssignmentView from "../pages/student/AssignmentView";
import MySubmissions from "../pages/student/MySubmissions";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import Approvals from "../pages/admin/Approvals";
import Assignments from "../pages/admin/Assignments";
import NewAssignment from "../pages/admin/NewAssignment";
import AssignmentDetail from "../pages/admin/AssignmentDetail";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pending is reachable regardless of status — it's where
          ProtectedRoute redirects unapproved students to */}
      <Route path="/student/pending" element={<StudentPending />} />

      {/* ── Student ────────────────────────────────────── */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/:id"
        element={
          <ProtectedRoute>
            <AssignmentView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/submissions"
        element={
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        }
      />

      {/* ── Admin ──────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <AdminRoute>
            <Approvals />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <AdminRoute>
            <Assignments />
          </AdminRoute>
        }
      />
      {/* /new must come before /:id — React Router matches top-down */}
      <Route
        path="/admin/assignments/new"
        element={
          <AdminRoute>
            <NewAssignment />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/assignments/:id"
        element={
          <AdminRoute>
            <AssignmentDetail />
          </AdminRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
