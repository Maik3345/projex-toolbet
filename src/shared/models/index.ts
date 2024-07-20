export interface IFile {
  name: string;
  path: string;
}

export interface Folders {
  folders: Array<string>;
}

export interface ConfigVtexJson {
  login: string;
  token: string;
  account: string;
  workspace: string;
  env: string;
}

export interface ContentManifest {
  vendor: string;
  name: string;
  path: string;
  dependencies: ContentDependencies;
  version: string;
  changelog?: {
    version: string;
    dependencies: object;
  };
}

export interface ContentDependencies {
  value: string;
  level: number;
}

export enum ReleaseTypeEnums {
  Major = 'major',
  Premajor = 'premajor',
  Minor = 'minor',
  Preminor = 'preminor',
  Patch = 'patch',
  Prepatch = 'prepatch',
  Prerelease = 'prerelease',
}
