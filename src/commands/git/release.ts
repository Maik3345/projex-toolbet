import { Colors } from '@api';
import { release, supportedTagNames } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Release extends Command {
  static description =
    'Automate your release process: bump version, update changelog, commit, tag, and push in one step. Supports pre/post scripts, dry-run, and custom tagging. Shows clear output and actionable tips.';

  static examples = [
    `${Colors.PINK(CLI_NAME + ' git release')}   # Standard release (patch, beta tag by default)`,
    `${Colors.PINK(CLI_NAME + ' git release minor stable')}   # Minor release with stable tag`,
    `${Colors.PINK(CLI_NAME + ' git release major --no-push')}   # Major release, do not push automatically`,
    `${Colors.PINK(CLI_NAME + ' git release --get-version')}   # Show current version only`,
  ];

  static flags = {
    ...globalFlags,
    yes: Flags.boolean({
      description: 'Skip all confirmation prompts and run non-interactively.',
      char: 'y',
      default: false,
    }),
    'no-push': Flags.boolean({
      description: 'Do not push changes or tags to the remote repository automatically.',
      default: false,
    }),
    'no-deploy': Flags.boolean({
      description: 'Skip running any deployment or pre-release scripts.',
      default: false,
    }),
    'no-check-release': Flags.boolean({
      description: 'Skip validation for uncommitted changes before releasing.',
      default: false,
    }),
    'no-pre-release': Flags.boolean({
      description: 'Skip running pre-release scripts.',
      default: false,
    }),
    'no-post-release': Flags.boolean({
      description: 'Skip running post-release scripts.',
      default: false,
    }),
    'no-tag': Flags.boolean({
      description: 'Do not create a git tag for this release.',
      default: false,
    }),
    'get-version': Flags.boolean({
      description: 'Show the current version and exit (no release performed).',
      default: false,
    }),
    'get-release-type': Flags.boolean({
      description: 'Show the release type (major, minor, patch, etc.) of the current version.',
      default: false,
    }),
    'get-only-version-number': Flags.boolean({
      description: 'Show only the version number (no extra output).',
      default: false,
    }),
  };

  static args = {
    tagName: Args.string({
      required: false,
      default: '',
      options: Object.keys(supportedTagNames),
      description: 'Release tag to use (e.g. beta, stable). Defaults to "beta".',
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
