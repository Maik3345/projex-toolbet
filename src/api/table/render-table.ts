import { Colors, createTable } from '@api';

/**
 * Renders a formatted table of commit messages to the console.
 *
 * @param params - The parameters for rendering the table.
 * @param params.title - The title to display as the table header.
 * @param params.emptyMessage - The message to display if the list is empty.
 * @param params.listArray - The array of commit messages to display in the table.
 *
 * @remarks
 * If the `listArray` is empty, an error message and a tip are displayed instead of the table.
 * Each commit message is displayed with its index in a colored table format.
 */
export const renderTableOfCommits = ({
  title,
  emptyMessage,
  listArray,
}: {
  title: string;
  emptyMessage: string;
  listArray: any;
}): void => {
  if (listArray.length === 0) {
    return console.log(
      `${Colors.ERROR('❌ ' + emptyMessage)}\n${Colors.YELLOW('💡 Tip: Make a commit to see it listed here.')}`,
    );
  }

  const table = createTable({
    head: [Colors.GREEN('🔢 #'), Colors.GREEN(title)],
  });

  listArray.forEach((text: string, index: number) => {
    table.push([`${index + 1}`, `${Colors.BLUE(text)}`]);
  });
  console.log(`${table.toString()}\n`);
};

/**
 * Renders a table displaying release versions and their corresponding values to the console.
 *
 * If the provided list is empty, displays an error message and a helpful tip.
 * Otherwise, prints a formatted table with version information and a success message.
 *
 * @param params - The parameters for rendering the table.
 * @param params.emptyMessage - The message to display if the list is empty.
 * @param params.listArray - An array of objects containing the version text and value to display in the table.
 *
 * @returns void
 */
export const renderTableOfReleaseVersions = ({
  emptyMessage,
  listArray,
}: {
  emptyMessage: string;
  listArray: { text: string; value: string }[];
}): void => {
  if (listArray.length === 0) {
    return console.log(
      `${Colors.ERROR('❌ ' + emptyMessage)}\n${Colors.YELLOW('💡 Tip: Run a release to generate a version entry.')}`,
    );
  }

  const table = createTable({
    head: [Colors.GREEN('🏷️ Version'), Colors.GREEN('Value')],
  });

  listArray.forEach((item) => {
    table.push([item.text, item.value]);
  });

  console.log(`${table.toString()}\n`);
};
