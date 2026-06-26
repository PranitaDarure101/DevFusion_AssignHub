// src/components/ui/Badge.jsx

const TONE_STYLES = {
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  const toneClass = TONE_STYLES[tone] || TONE_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
