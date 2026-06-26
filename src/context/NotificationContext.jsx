// src/context/NotificationContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 3500;

/** @type {Record<string, { bg: string; border: string; icon: JSX.Element }>} */
const TONE = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    title: "text-emerald-800",
    body: "text-emerald-700",
    progress: "bg-emerald-400",
    icon: (
      <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    title: "text-red-800",
    body: "text-red-700",
    progress: "bg-red-400",
    icon: (
      <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "text-amber-800",
    body: "text-amber-700",
    progress: "bg-amber-400",
    icon: (
      <svg className="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "text-blue-800",
    body: "text-blue-700",
    progress: "bg-blue-400",
    icon: (
      <svg className="h-5 w-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext(null);

// ─── Toast component ──────────────────────────────────────────────────────────

/**
 * Individual toast. Renders its own dismiss button and the auto-dismiss
 * progress bar. Animation is pure CSS via a keyframe injected once into
 * the document head — no external animation library required.
 */
function Toast({ id, message, variant, onDismiss }) {
  const t = TONE[variant] ?? TONE.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lg
        ${t.bg} ${t.border}
        animate-[toastSlideIn_0.2s_ease-out]
      `}
    >
      {/* Content row */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {t.icon}
        <p className={`flex-1 text-sm font-medium leading-snug ${t.body}`}>
          {message}
        </p>
        {/* Dismiss button */}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(id)}
          className={`
            shrink-0 rounded-md p-0.5 transition-colors
            hover:bg-black/10 focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 ${t.title}
          `}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div
        className={`h-0.5 ${t.progress} origin-left`}
        style={{
          animation: `toastProgress ${AUTO_DISMISS_MS}ms linear forwards`,
        }}
      />
    </div>
  );
}

// Inject keyframes once — avoids a Tailwind arbitrary-value dependency and
// keeps animation logic self-contained in this file.
const KEYFRAMES = `
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%) scale(0.96); }
  to   { opacity: 1; transform: translateX(0)   scale(1);    }
}
@keyframes toastProgress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
`;

if (typeof document !== "undefined") {
  const styleId = "__assignhub_toast_keyframes__";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

let _seq = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  /** @type {React.MutableRefObject<Record<number, ReturnType<typeof setTimeout>>>} */
  const timers = useRef({});

  // Dismiss a single toast by id and clear its timer.
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  // Core enqueue function. All public helpers delegate here.
  const notify = useCallback(
    (message, variant = "info", durationMs = AUTO_DISMISS_MS) => {
      if (!message) return;
      const id = ++_seq;

      setToasts((prev) => [
        ...prev,
        { id, message: String(message), variant },
      ]);

      timers.current[id] = setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss]
  );

  // Clear all pending timers on provider unmount.
  // Also handles React StrictMode's double-mount: the second mount picks up
  // a fresh `timers.current` ref, so no double-fire occurs.
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────
  const api = {
    // Named variant helpers (used by AssignmentView and other pages)
    notifySuccess: useCallback((msg, ms) => notify(msg, "success", ms), [notify]),
    notifyError:   useCallback((msg, ms) => notify(msg, "error",   ms), [notify]),
    notifyWarning: useCallback((msg, ms) => notify(msg, "warning", ms), [notify]),
    notifyInfo:    useCallback((msg, ms) => notify(msg, "info",    ms), [notify]),

    // Short aliases — full backward compatibility
    success: useCallback((msg, ms) => notify(msg, "success", ms), [notify]),
    error:   useCallback((msg, ms) => notify(msg, "error",   ms), [notify]),
    warning: useCallback((msg, ms) => notify(msg, "warning", ms), [notify]),
    info:    useCallback((msg, ms) => notify(msg, "info",    ms), [notify]),

    // Generic escape hatch
    notify,
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}

      {/* Toast portal — fixed bottom-right, survives all route changes */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm">
            <Toast
              id={t.id}
              message={t.message}
              variant={t.variant}
              onDismiss={dismiss}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the notification API from the nearest NotificationProvider.
 *
 * Graceful fallback: if called outside a provider (e.g. during a test or
 * a misplaced component), it logs a console warning and returns no-op
 * functions instead of crashing the React tree.
 */
export function useNotification() {
  const ctx = useContext(NotificationContext);

  if (ctx === null) {
    console.warn(
      "[AssignHub] useNotification() was called outside <NotificationProvider>. " +
      "Wrap your application root with <NotificationProvider> in main.jsx. " +
      "Notification calls will be silently ignored until then."
    );

    // No-op fallback — application keeps running, calls are swallowed.
    const noop = () => {};
    return {
      notify:         noop,
      notifySuccess:  noop,
      notifyError:    noop,
      notifyWarning:  noop,
      notifyInfo:     noop,
      success:        noop,
      error:          noop,
      warning:        noop,
      info:           noop,
    };
  }

  return ctx;
}