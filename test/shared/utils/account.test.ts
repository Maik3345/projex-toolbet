import { describe, it, expect } from 'vitest';
import { extractAccountName } from '../../../src/shared/utils/api/auth';

describe('account', () => {
	describe('extractAccountName', () => {
		it('should return the 6th element when split by spaces', () => {
			const text = 'first second third fourth fifth sixth seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth');
		});

		it('should return the 6th element when split by commas', () => {
			const text = 'first,second,third,fourth,fifth,sixth,seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth');
		});

		it('should return the 6th element when split by mixed spaces and commas', () => {
			const text = 'first, second third, fourth fifth, sixth seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth');
		});

		it('should handle multiple consecutive spaces', () => {
			const text = 'first  second   third    fourth     fifth      sixth seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth');
		});

		it('should handle multiple consecutive commas', () => {
			const text = 'first,,second,,,third,,,,fourth,,,,,fifth,,,,,,sixth,seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth');
		});

		it('should return undefined when there are fewer than 6 elements', () => {
			const text = 'first second third fourth fifth';
			const result = extractAccountName(text);
			expect(result).toBeUndefined();
		});

		it('should return undefined when input has only 5 elements', () => {
			const text = 'one two three four five';
			const result = extractAccountName(text);
			expect(result).toBeUndefined();
		});

		it('should handle empty string', () => {
			const text = '';
			const result = extractAccountName(text);
			expect(result).toBeUndefined();
		});

		it('should handle string with only spaces', () => {
			const text = '   ';
			const result = extractAccountName(text);
			expect(result).toBeUndefined();
		});

		it('should handle string with only commas', () => {
			const text = ',,,';
			const result = extractAccountName(text);
			expect(result).toBeUndefined();
		});

		it('should return exact 6th element when there are exactly 6 elements', () => {
			const text = 'alpha beta gamma delta epsilon zeta';
			const result = extractAccountName(text);
			expect(result).toBe('zeta');
		});

		it('should work with numbers as strings', () => {
			const text = '1 2 3 4 5 6 7 8 9';
			const result = extractAccountName(text);
			expect(result).toBe('6');
		});

		it('should work with special characters in elements', () => {
			const text = 'first@ second# third$ fourth% fifth& sixth* seventh';
			const result = extractAccountName(text);
			expect(result).toBe('sixth*');
		});
	});
});
