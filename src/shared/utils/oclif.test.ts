import { describe, it, expect } from 'vitest';
import { globalFlags } from './oclif';
import { Flags } from '@oclif/core';

// Mock @oclif/core
vi.mock('@oclif/core', () => ({
  Flags: {
    boolean: vi.fn((options) => ({ type: 'boolean', ...options })),
    help: vi.fn((options) => ({ type: 'help', ...options }))
  }
}));

describe('oclif', () => {
  describe('globalFlags', () => {
    it('should export globalFlags object', () => {
      expect(globalFlags).toBeDefined();
      expect(typeof globalFlags).toBe('object');
    });

    it('should have verbose flag configuration', () => {
      expect(globalFlags.verbose).toBeDefined();
      expect(Flags.boolean).toHaveBeenCalledWith({
        char: 'v',
        description: 'Shows debug level logs.',
        default: false,
      });
    });

    it('should have help flag configuration', () => {
      expect(globalFlags.help).toBeDefined();
      expect(Flags.help).toHaveBeenCalledWith({
        char: 'h',
        description: 'Shows this help message.',
      });
    });

    it('should have exactly two flags defined', () => {
      const flagKeys = Object.keys(globalFlags);
      expect(flagKeys).toEqual(['verbose', 'help']);
      expect(flagKeys.length).toBe(2);
    });

    it('should configure verbose flag with correct properties', () => {
      // Verify the flag was created with the right configuration
      const verboseCall = (Flags.boolean as any).mock.calls.find((call: any) => 
        call[0]?.char === 'v'
      );
      
      expect(verboseCall).toBeDefined();
      expect(verboseCall[0]).toEqual({
        char: 'v',
        description: 'Shows debug level logs.',
        default: false,
      });
    });

    it('should configure help flag with correct properties', () => {
      // Verify the flag was created with the right configuration
      const helpCall = (Flags.help as any).mock.calls.find((call: any) => 
        call[0]?.char === 'h'
      );
      
      expect(helpCall).toBeDefined();
      expect(helpCall[0]).toEqual({
        char: 'h',
        description: 'Shows this help message.',
      });
    });
  });
});
