/**
 * Turns "Acme Corp" into "acme-corp". Appends a short random suffix when a
 * caller needs to guarantee uniqueness (see workspace.service.ts).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function randomSuffix(length = 5): string {
  return Math.random().toString(36).slice(2, 2 + length);
}