/**
 * Extracts the major, minor, and patch version numbers (and optional pre-release tag)
 * from a semantic version string.
 *
 * @param version - The version string to parse (e.g., "1.2.3", "1.2.3-beta").
 * @returns The matched version string in the format "X.Y.Z" or "X.Y.Z-tag", or an empty string if no match is found.
 */
export const getSimpleVersion = (version: string) => {
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+))?/g;
  const match = version.match(regex);
  return match ? match[0] : '';
};

/**
 * Extracts the distribution tag (dist-tag) from a given semantic version string.
 *
 * If the version string contains a pre-release tag (e.g., "1.0.0-beta"), this function returns the tag (e.g., "beta").
 * If no pre-release tag is present, it returns "latest".
 *
 * @param version - The semantic version string to extract the dist-tag from.
 * @returns The extracted dist-tag, or "latest" if none is found.
 */
export const getDistTag = (version: string) => {
  const regex = /(?:-([\dA-Za-z-]*))/g;
  const distTag = version.match(regex);
  return distTag ? distTag[0].substring(1) : 'latest';
};
