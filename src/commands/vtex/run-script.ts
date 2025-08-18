import { Colors } from '@api';
import { vtexRunScript } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  static description = `Run a script defined in your package.json or manifest.json. Useful for automating build, test, deploy, or custom tasks. Shows clear output and actionable tips if the script is missing or fails.`;

  static examples = [
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'build'   # Run the build script`,
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'deploy'   # Run the deploy script`,
    `${Colors.PINK(CLI_NAME + ' vtex run-script')} 'prerelease'   # Run a custom prerelease script`,
  ];

  static flags = {
    ...globalFlags,
  };

  static args = {
    script: Args.string({
      description: `The script name to run (as defined in package.json or manifest.json). Example: ${Colors.GREEN('build')}`,
    }),
  };

  async run() {
    const {
      args: { script },
    } = await this.parse(Browse);
    await vtexRunScript(script);
  }
}
