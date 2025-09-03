/**
 * API authentication utilities.
 *
 * @remarks
 * This module provides utilities for handling API authentication,
 * including account name extraction and token management.
 */

/**
 * Extracts the account name from API response text.
 *
 * @param text - The response text containing account information.
 * @returns The extracted account name, or `undefined` if not found.
 */
export const extractAccountName = (text: string): string | undefined => {
  return text.split(/[ ,]+/)[5];
};
