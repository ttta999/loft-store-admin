import { slugify } from './categories'

/** Identifiers stay internal; repeated names get a free suffix automatically. */
export function newCategoryIdentifier(name: string, existingIds: string[]) {
  const base = slugify(name) || 'category'
  const existing = new Set(existingIds)
  let id = base, suffix = 2
  while (existing.has(id)) id = `${base}-${suffix++}`
  return id
}
