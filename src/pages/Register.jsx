// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createStudentProfile } from "../lib/users";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rollNumber.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      await createStudentProfile(uid, {
        name: name.trim(),
        email: email.trim(),
        rollNumber: rollNumber.trim(),
      });

      navigate("/student/pending", { replace: true });
    } catch (err) {
      console.error("[Register] Registration failed:", err);
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : "Registration failed. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">
          Registration requires admin approval before you can view assignments.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            className="input-field mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="rollNumber" className="label">
            Roll number
          </label>
          <input
            id="rollNumber"
            type="text"
            className="input-field mb-4"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
          />

          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-field mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input-field mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input-field mb-6"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
