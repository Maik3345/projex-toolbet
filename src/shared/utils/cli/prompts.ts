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

/**
 * Default instance of PromptsUtils for convenience.
 */
export const promptsUtils = new PromptsUtils();

/**
 * Prompts the user with a yes/no question.
 *
 * @param message - The message to display to the user.
 * @param defaultValue - The default value (true for yes, false for no).
 * @returns A promise that resolves with the user's response.
 */
export const confirmPrompt = async (message: string, defaultValue = false): Promise<boolean> => {
  const prompts = require('prompts');
  
  const question = {
    type: 'confirm',
    name: 'value',
    message,
    initial: defaultValue,
  };

  const response = await prompts(question);
  return response.value;
};

/**
 * Additional prompt utilities can be added here.
 */
