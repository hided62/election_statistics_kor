export function 기호제거(text: string): string {
  return text.trim().replace(/\||{|}|_|-|\[|\]|\(|\)|·|!|\?|,| |\t|/gi, "").replace('\n', '_');
}
