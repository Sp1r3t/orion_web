/** #rrggbb → «r, g, b»: цвета берём из токенов темы, а рисуем через rgba(). */
export function channels(hex: string, fallback: string): string {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim())
  if (!match) return fallback
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`
}
