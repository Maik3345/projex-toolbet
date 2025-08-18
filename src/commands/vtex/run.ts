import { Colors } from '@api';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  public static readonly description = `Run any VTEX CLI command and automatically answer all Yes/No prompts with 'Yes'. Perfect for CI/CD, automation, and scripting. Shows clear output and actionable tips if something fails.`;

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' vtex run')} 'vtex release minor stable'   # Release with auto-confirmation`,
    `${Colors.PINK(CLI_NAME + ' vtex run')} 'vtex publish'   # Publish with all prompts auto-accepted`,
    `${Colors.PINK(CLI_NAME + ' vtex run')} 'vtex deploy'   # Deploy with no manual intervention`,
  ];

  public static readonly flags = {
    ...globalFlags,
  };

  public static readonly args = {
    command: Args.string({
      description: `The VTEX CLI command to execute. All Yes/No prompts will be answered with 'Yes' automatically. Example: ${Colors.GREEN(
        'vtex publish',
      )}`,
    }),
  };

  async run() {
    const {
      args: { command },
    } = await this.parse(Browse);
    const { vtexRunCommand } = await import('@modules');
    await vtexRunCommand(command);
  }
}
