export const releaseTypeAliases = {
  pre: "prerelease",
};
export const supportedReleaseTypes = {
  major: "major",
  minor: "minor",
  patch: "patch",
  prerelease: "prerelease",
};

export const supportedTagNames = {
  stable: "stable",
  beta: "beta",
  hkignore: "hkignore",
};
export const releaseTypesToUpdateChangelog = {
  major: "major",
  minor: "minor",
  patch: "patch",
};

export const supportedReleaseTypesList = Object.values(supportedReleaseTypes);

export const supportedTagNamesList = Object.values(supportedTagNames);
export const releaseTypesToUpdateChangelogList = Object.values(
  releaseTypesToUpdateChangelog
);
export const tagNamesToUpdateChangelog = ["stable"];
