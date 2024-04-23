import { Colors } from '@api';
import { release, releaseTypeAliases, supportedReleaseTypes, supportedTagNames } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME } from '@shared';

import { ReleaseType } from 'semver';

export default class Release extends Command {
  static description =
    'Bumps the app version, commits, and pushes the app to the remote repository (Only for git users).';

  static examples = [
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git release`)}`,
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git release`)} patch`,
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git release`)} patch beta`,
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git release`)} minor stable`,
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git release`)} pre`,
  ];

  static flags = {
    yes: Flags.boolean({
      description: 'Automatically answer yes to all prompts.',
      char: 'y',
      default: false,
    }),
    'no-push': Flags.boolean({
      description: 'Do not automatically push all changes to the remote repository.',
      default: false,
    }),
    'no-deploy': Flags.boolean({
      description: 'Do not automatically run the preRelease script from the manifest file.',
      default: false,
    }),
    'no-check-release': Flags.boolean({
      description: 'Do not automatically check if the release is valid and does not have local changes.',
      default: false,
    }),
    'no-tag': Flags.boolean({
      description: 'Do not automatically tag the release.',
      default: false,
    }),
    'get-version': Flags.boolean({
      description: 'Only get the current version without performing any release actions.',
      default: false,
    }),
  };

  static args = {
    releaseType: Args.string({
      required: false,
      default: 'patch',
      options: [...Object.keys(releaseTypeAliases), ...Object.keys(supportedReleaseTypes)],
      description: 'The type of release. Defaults to "patch".',
    }),
    tagName: Args.string({
      required: false,
      default: 'beta',
      options: Object.keys(supportedTagNames),
      description: 'The name of the tag. Defaults to "beta".',
    }),
  };

  async run() {
    const {
      flags: { yes },
      flags,
      args: { releaseType, tagName },
    } = await this.parse(Release);

    await release(releaseType as ReleaseType, tagName, {
      yes,
      noDeploy: flags['no-deploy'],
      noPush: flags['no-push'],
      noCheckRelease: flags['no-check-release'],
      noTag: flags['no-tag'],
      getVersion: flags['get-version'],
    });
  }
}
