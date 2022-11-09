export function truncateText(text: string, numOfChars: number) {
  return text.substring(0, numOfChars).concat('...');
}
