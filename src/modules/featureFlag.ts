import Configstore from 'configstore';
import { PathConstants } from '@shared';
const { join } = require('path');

export class FeatureFlag {
  public static readonly FEATURE_FLAG_STORE_FILENAME = 'feature-flag.json';
  private static singleton: FeatureFlag;

  public static getSingleton(): FeatureFlag {
    if (FeatureFlag.singleton) {
      return FeatureFlag.singleton;
    }

    const filePath: string = join(PathConstants.PRETASKS_FOLDER, FeatureFlag.FEATURE_FLAG_STORE_FILENAME);
    FeatureFlag.singleton = new FeatureFlag(filePath);
    return FeatureFlag.singleton;
  }

  private store: Configstore;

  constructor(public storeFilePath: string) {
    this.store = new Configstore('', null, { configPath: storeFilePath });
  }

  getLastFeatureFlagUpdate() {
    return (this.store.get('lastFeatureFlagCheck') as number) ?? 0;
  }

  getAllFeatureFlagInfo() {
    return (this.store.get('featureFlagInfo') as Record<string, any> | null) ?? {};
  }

  getFeatureFlagInfo<T>(flagName: string): T {
    return this.store.get(`featureFlagInfo.${flagName}`) as T;
  }

  setLastFeatureFlagUpdate(date: number) {
    this.store.set('lastFeatureFlagCheck', date);
  }

  setFeatureFlagInfo(versionFeatureFlagInfo: Record<string, any>) {
    this.store.set('featureFlagInfo', versionFeatureFlagInfo);
  }
}
