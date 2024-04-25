/**
 * Retorna la versión simple sin el hash.
 * Ejemplo: 2.115.0-beta.somehash   -> 2.115.0-beta
 * Ejemplo: 2.115.0                 -> 2.115.0
 */
export const getSimpleVersion = (version: string) => {
  const regex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+))?/g;
  const match = version.match(regex);
  return match ? match[0] : "";
};

/**
 * Retorna la etiqueta de la versión.
 * Ejemplo: 2.115.0-beta.somehash   -> beta
 * Ejemplo: 2.115.0                 -> latest
 */
export const getDistTag = (version: string) => {
  const regex = /(?:-([0-9A-Za-z-]*))/g;
  const distTag = version.match(regex);
  return distTag ? distTag[0].substring(1) : "latest";
};
