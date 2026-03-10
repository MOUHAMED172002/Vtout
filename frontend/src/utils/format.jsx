export function formatCurrency(value, currency = "XOF", locale = "fr-FR") {
  if (value == null) return "—";
  const n = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}