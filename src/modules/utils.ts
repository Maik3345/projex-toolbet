// Return version and tag only
// Example: 2.115.0-beta.somehash   -> 2.115.0-beta
// Example: 2.115.0                 -> 2.115.0
export const getSimpleVersion = (version: string) => {
  const regex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+))?/g;
  return version.match(regex)[0];
};

// Return version tag
// Example: 2.115.0-beta.somehash   -> beta
// Example: 2.115.0                 -> latest
export const getDistTag = (version: string) => {
  const regex = /(?:-([0-9A-Za-z-]*))/g;
  const distTag = version.match(regex);
  return distTag ? distTag[0].substring(1) : "latest";
};
