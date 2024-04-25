import { runCommand } from '@shared';

/* The `BashRunCommandUtils` class is a TypeScript class that provides a method for running a command
asynchronously on multiple folders. */
export class BashRunCommandUtils {
  private command: string;

  constructor(command: string) {
    this.command = command;
  }

  /* The `public run` method is an asynchronous function that takes an array of `IFile` objects as a
  parameter. */
  async run(root: string) {
    await runCommand(this.command, root, 'run command');
  }
}
