/**
 * Returns public URL for a Trickcal character image
 * @param {string} characterName - e.g. "비비", "네르(빡침)"
 */
export function getCharacterImageUrl(characterName) {
  if (!characterName) return '';
  return `/imgs/${encodeURIComponent(characterName.trim())}.webp`;
}
