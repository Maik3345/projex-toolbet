import { ColorifyConstants } from "../../api/constants/colors";
import { FeatureFlag } from "../../modules/featureFlag";
import { TOOLBET_NAME } from "./commands";

export const Messages = {
  UPDATE_TOOLBELT: () =>
    `To update, you must use the same method you used to install. As the following examples:` +
    `\n\n` +
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `yarn`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `yarn global add ${TOOLBET_NAME}`
    )}.` +
    `\n\n` +
    `• If you installed using our new method there is in alpha-version, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} autoupdate`
    )}.\n`,
  UPDATE_TOOLBELT_NPM: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `yarn`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `yarn global add ${TOOLBET_NAME}`
    )}.`,
  UPDATE_TOOLBELT_BREW: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `brew`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `brew upgrade ${TOOLBET_NAME}/${TOOLBET_NAME}`
    )}.`,
  UPDATE_TOOLBELT_STANDALONE: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `AWS Standalone`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} autoupdate`
    )}.`,
  UPDATE_TOOLBELT_CHOCOLATEY: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `chocolatey`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `choco upgrade ${TOOLBET_NAME}`
    )}.`,
  UPDATE_FROM_DEPRECATED_BREW: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `brew`
    )}, update running ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `brew unlink ${TOOLBET_NAME} && brew install ${TOOLBET_NAME}/${TOOLBET_NAME}`
    )}.`,
  UPDATE_FROM_DEPRECATED_CHOCOLATEY: () =>
    `• If you installed using ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `chocolatey`
    )}, update running:
    ${ColorifyConstants.COMMAND_OR_RELEASE_REF(`choco uninstall vtex`)}.
    ${ColorifyConstants.COMMAND_OR_RELEASE_REF(`choco install vtex`)}.`,
};

export function updateMessageSwitch() {
  const allMessages: string[] = [];
  allMessages.push(Messages.UPDATE_TOOLBELT_NPM());

  const flagOSVersionMessage: boolean =
    FeatureFlag.getSingleton().getFeatureFlagInfo<boolean>(
      "FEATURE_FLAG_OS_VERSION_MESSAGE"
    );

  if (flagOSVersionMessage) {
    switch (process.platform) {
      case "darwin":
        allMessages.push(Messages.UPDATE_TOOLBELT_BREW());
        break;
      case "linux":
        allMessages.push(Messages.UPDATE_TOOLBELT_STANDALONE());
        break;
      case "win32":
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

  const flagOSVersionMessage: boolean =
    FeatureFlag.getSingleton().getFeatureFlagInfo<boolean>(
      "FEATURE_FLAG_OS_VERSION_MESSAGE"
    );

  if (flagOSVersionMessage) {
    switch (process.platform) {
      case "darwin":
        allMessages.push(Messages.UPDATE_FROM_DEPRECATED_BREW());
        break;
      case "linux":
        allMessages.push(Messages.UPDATE_TOOLBELT_STANDALONE());
        break;
      case "win32":
        allMessages.push(Messages.UPDATE_FROM_DEPRECATED_CHOCOLATEY());
        break;
      default:
        break;
    }
  }

  return allMessages;
}
