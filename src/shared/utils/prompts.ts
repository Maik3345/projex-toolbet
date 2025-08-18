const prompts = require('prompts');

/**
 * Utility class for handling user prompts in the command-line interface.
 *
 * @remarks
 * This class provides methods to interactively prompt users for confirmation or input,
 * and can be used to control process flow based on user responses.
 */
export class PromptsUtils {
  /**
   * Prompts the user with a confirmation message and exits the process if the user does not confirm.
   *
   * @param message - The message to display in the confirmation prompt.
   * @returns A promise that resolves when the prompt is completed. If the user does not confirm, the process exits.
   */
  continuePrompt = async (message: string) => {
    const questions = [
      {
        type: 'confirm',
        name: 'value',
        message: message,
        initial: false,
      },
    ];

    const prompt = await prompts(questions);

    if (!prompt.value) {
      process.exit();
    }
  };
}
