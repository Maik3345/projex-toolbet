import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SuggestLabelsOptions, suggestLabels } from '../../../../../../src/modules/apps/pull-request/labels';

describe('suggestLabels', () => {
  // Define reusable test options
  const mockOptions: SuggestLabelsOptions = {
    branch: 'feature/test-branch',
    target: 'main',
    format: 'json',
    verbose: false,
  };

  const mockOptionsTxt: SuggestLabelsOptions = {
    branch: 'feature/test-branch',
    target: 'main',
    format: 'txt',
    verbose: false,
  };

  beforeEach(() => {
    // Mock console.log to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(suggestLabels).toBeDefined();
  });

  it('should accept valid options', () => {
    expect(() => {
      // Test JSON format options
      suggestLabels(mockOptions);
      
      // Test TXT format options
      suggestLabels(mockOptionsTxt);
    }).not.toThrow();
  });
});
