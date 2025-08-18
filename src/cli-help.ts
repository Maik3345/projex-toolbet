import { Help, Command } from '@oclif/core';
import type { Topic } from '@oclif/core/lib/interfaces/topic';
import { Colors } from '@api';

export default class CustomHelp extends Help {
  // Colorea los títulos de sección
  protected formatSectionTitle(title: string): string {
    switch (title) {
      case 'USAGE':
      case 'COMMANDS':
      case 'TOPICS':
      case 'VERSION':
      case 'DESCRIPTION':
      case 'ALIASES':
        return Colors.CYAN(title);
      case 'EXAMPLES':
        return Colors.PURPLE(title);
      default:
        return title;
    }
  }

  // Colorea los nombres de comando
  protected formatCommand(command: Command.Loadable): string {
    return Colors.BLUE(super.formatCommand(command));
  }

  // Colorea los nombres de topic
  protected formatTopic(topic: Topic): string {
    return Colors.BLUE(super.formatTopic(topic));
  }

  // Sobrescribe el método para colorear los títulos en la ayuda root
  protected formatRoot(): string {
    let help = super.formatRoot();
    help = help.replace(/^USAGE/m, this.formatSectionTitle('USAGE'));
    help = help.replace(/^COMMANDS/m, this.formatSectionTitle('COMMANDS'));
    help = help.replace(/^TOPICS/m, this.formatSectionTitle('TOPICS'));
    help = help.replace(/^VERSION/m, this.formatSectionTitle('VERSION'));
    help = help.replace(/^DESCRIPTION/m, this.formatSectionTitle('DESCRIPTION'));
    help = help.replace(/^ALIASES/m, this.formatSectionTitle('ALIASES'));
    help = help.replace(/^EXAMPLES/m, this.formatSectionTitle('EXAMPLES'));
    return help;
  }
}
