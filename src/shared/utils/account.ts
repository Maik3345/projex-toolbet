export const getAccountName = (text: string) => {
  return text.split(/[ ,]+/)[5];
};
