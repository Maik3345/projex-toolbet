/**
 * Extracts the sixth word from a given string, splitting by spaces and/or commas.
 *
 * @param text - The input string containing account information.
 * @returns The sixth word in the string, or `undefined` if there are fewer than six words.
 */
export const getAccountName = (text: string) => {
  return text.split(/[ ,]+/)[5];
};
