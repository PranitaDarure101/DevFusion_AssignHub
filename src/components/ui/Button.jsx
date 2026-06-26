// src/components/ui/Button.jsx

const VARIANT_STYLES = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
