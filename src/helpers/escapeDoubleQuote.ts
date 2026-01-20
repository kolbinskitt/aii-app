export function escapeDoubleQuote(text: string) {
  return text.replaceAll(/"/g, '\\"');
}
