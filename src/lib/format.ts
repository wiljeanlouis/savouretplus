export function formatCurrency(cents) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format((cents || 0) / 100);
}
