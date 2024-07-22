const prompts = require('prompts');

export class PromptsUtils {
  /* The `continuePrompt` function is a method of the `PromptsUtils` class. It takes a `message`
  parameter of type string. */
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
