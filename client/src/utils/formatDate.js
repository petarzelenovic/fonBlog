export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("sr-Latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
