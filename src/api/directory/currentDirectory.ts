/**
 * The function getCurrentDirectory returns the root directory name of the current working directory.
 * @returns The function `getCurrentDirectory` returns the root directory name of the current working
 * directory.
 */
export const getCurrentDirectory = () => {
  if (process.env.OCLIF_COMPILATION) {
    return "";
  }

  return process.cwd();
};
