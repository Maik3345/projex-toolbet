import { Colors } from '@api';
import { release, releaseTypeAliases, supportedReleaseTypes, supportedTagNames } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

import { ReleaseType } from 'semver';

export default class Release extends Command {
  static description =
    'Bumps the app version, commits, and pushes the app to the remote repository (Only for git users).';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} git release`)}`,
    `${Colors.PINK(`${CLI_NAME} git release`)} beta`,
    `${Colors.PINK(`${CLI_NAME} git release`)} stable`,
  ];

  static flags = {
    ...globalFlags,
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
    'no-pre-release': Flags.boolean({
      description: 'Do not automatically run the preRelease script from the manifest file.',
      default: false,
    }),
    'no-post-release': Flags.boolean({
      description: 'Do not automatically run the postRelease script from the manifest file.',
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
    'get-release-type': Flags.boolean({
      description: 'Get the release type of the current version.',
      default: false,
    }),
    'get-only-version-number': Flags.boolean({
      description: 'Get the version number only.',
      default: false,
    }),
  };

  static args = {
    tagName: Args.string({
      required: false,
      default: '',
      options: Object.keys(supportedTagNames),
      description: 'The name of the tag. Defaults to "beta".',
    }),
  };

  async run() {
    const {
      flags: { yes },
      flags,
      args: { tagName },
    } = await this.parse(Release);

    await release(
      {
        yes,
        noDeploy: flags['no-deploy'],
        noPush: flags['no-push'],
        noCheckRelease: flags['no-check-release'],
        noTag: flags['no-tag'],
        getVersion: flags['get-version'],
        noPreRelease: flags['no-pre-release'],
        noPostRelease: flags['no-post-release'],
        getReleaseType: flags['get-release-type'],
        getOnlyVersionNumber: flags['get-only-version-number'],
      },
      tagName,
    );
  }
}
