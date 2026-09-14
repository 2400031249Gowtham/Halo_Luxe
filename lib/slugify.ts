/**
 * Generate a clean, URL-safe slug from a string.
 * Example: "Swarovski® 2088 XIRIUS Rose" -> "swarovski-2088-xirius-rose"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // trim hyphens from start
    .replace(/-+$/, ""); // trim hyphens from end
}
