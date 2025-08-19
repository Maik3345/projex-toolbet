import { Colors } from '@api';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  public static readonly description = `Run a script defined in your package.json or manifest.json. Useful for automating build, test, deploy, or custom tasks. Shows clear output and actionable tips if the script is missing or fails.`;

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'build'   # Run the build script`,
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'deploy'   # Run the deploy script`,
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'prerelease'   # Run a custom prerelease script`,
  ];

  public static readonly flags = {
    ...globalFlags,
  };

  public static readonly args = {
    script: Args.string({
      description: `The script name to run (as defined in package.json or manifest.json). Example: ${Colors.GREEN(
        'build',
      )}`,
    }),
  };

  async run() {
    const {
      args: { script },
    } = await this.parse(Browse);
    const { vtexRunScript } = await import('@modules');
    await vtexRunScript(script);
  }
}
