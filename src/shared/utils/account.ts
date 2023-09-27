/**
 * The function `getAccountName` takes a string as input and returns the 6th word in the string.
 * @param {string} text - A string that contains multiple words separated by spaces or commas.
 * @returns The function `getAccountName` returns the 6th element (index 5) after splitting the input
 * `text` by spaces and commas.
 */
export const getAccountName = (text: string) => {
  return text.split(/[ ,]+/)[5];
};
