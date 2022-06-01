export function 기호제거(text: string): string {
  return text.replace(/\||{|}|_|-|\[|\]|\(|\)|·|!|\?|,| |/gi, "");
}
