import { Colors } from '@api';
import { FeatureFlag } from '@modules';
import { CLI_NAME } from './commands';

export const Messages = {
  UPDATE_TOOLBELT: () =>
    `To update, you must use the same method you used to install. Here are some examples:` +
    `\n\n` +
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `yarn`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(`yarn global add ${CLI_NAME}`)}.` +
    `\n\n` +
    `• If you installed using our new alpha version, update by running ${Colors.COMMAND_OR_RELEASE_REF(
      `${CLI_NAME} autoupdate`,
    )}.\n`,
  UPDATE_TOOLBELT_NPM: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `yarn`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(`yarn global add ${CLI_NAME}`)}.`,
  UPDATE_TOOLBELT_BREW: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `brew`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(`brew upgrade ${CLI_NAME}/${CLI_NAME}`)}.`,
  UPDATE_TOOLBELT_STANDALONE: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `AWS Standalone`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} autoupdate`)}.`,
  UPDATE_TOOLBELT_CHOCOLATEY: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `chocolatey`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(`choco upgrade ${CLI_NAME}`)}.`,
  UPDATE_FROM_DEPRECATED_BREW: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(
      `brew`,
    )}, update by running ${Colors.COMMAND_OR_RELEASE_REF(
      `brew unlink ${CLI_NAME} && brew install ${CLI_NAME}/${CLI_NAME}`,
    )}.`,
  UPDATE_FROM_DEPRECATED_CHOCOLATEY: () =>
    `• If you installed using ${Colors.COMMAND_OR_RELEASE_REF(`chocolatey`)}, update by running the following commands:
    ${Colors.COMMAND_OR_RELEASE_REF(`choco uninstall vtex`)}.
    ${Colors.COMMAND_OR_RELEASE_REF(`choco install vtex`)}.`,
};

export function updateMessageSwitch() {
  const allMessages: string[] = [];
  allMessages.push(Messages.UPDATE_TOOLBELT_NPM());

  const flagOSVersionMessage: boolean = FeatureFlag.getSingleton().getFeatureFlagInfo<boolean>(
    'FEATURE_FLAG_OS_VERSION_MESSAGE',
  );

  if (flagOSVersionMessage) {
    switch (process.platform) {
      case 'darwin':
        allMessages.push(Messages.UPDATE_TOOLBELT_BREW());
        break;
      case 'linux':
        allMessages.push(Messages.UPDATE_TOOLBELT_STANDALONE());
        break;
      case 'win32':
        allMessages.push(Messages.UPDATE_TOOLBELT_CHOCOLATEY());
        break;
      default:
        break;
    }
  }

  return allMessages;
}

export function updateFromDeprecatedMessageSwitch() {
  const allMessages: string[] = [];
  allMessages.push(Messages.UPDATE_TOOLBELT_NPM());

  const flagOSVersionMessage: boolean = FeatureFlag.getSingleton().getFeatureFlagInfo<boolean>(
    'FEATURE_FLAG_OS_VERSION_MESSAGE',
  );

  if (flagOSVersionMessage) {
    switch (process.platform) {
      case 'darwin':
        allMessages.push(Messages.UPDATE_FROM_DEPRECATED_BREW());
        break;
      case 'linux':
        allMessages.push(Messages.UPDATE_TOOLBELT_STANDALONE());
        break;
      case 'win32':
        allMessages.push(Messages.UPDATE_FROM_DEPRECATED_CHOCOLATEY());
        break;
      default:
        break;
    }
  }

  return allMessages;
}
