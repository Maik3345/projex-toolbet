import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { log, runOnlyCommand } from '../../../src/shared';

// Mock dependencies
vi.mock('../../../src/shared/logger', () => ({
  log: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

describe('runOnlyCommand', () => {
  let mockTask: any;
  let mockStdout: EventEmitter;
  let mockStderr: EventEmitter;
  let mockExit: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockStdout = new EventEmitter();
    mockStderr = new EventEmitter();
    mockTask = {
      stdout: mockStdout,
      stderr: mockStderr,
    };
    (spawn as any).mockReturnValue(mockTask);
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  it('should execute command and return stdout data', async () => {
    const command = 'echo "test output"';
    const expectedOutput = 'test output\n';

    const promise = runOnlyCommand(command);

    // Simulate stdout data
    mockStdout.emit('data', expectedOutput);

    const result = await promise;

    expect(spawn).toHaveBeenCalledWith(command, [], { shell: true });
    expect(log.debug).toHaveBeenCalledWith(expect.stringContaining(expectedOutput));
    expect(result).toBe(expectedOutput);
  });

  it('should call spawn with correct parameters', () => {
    const command = 'ls -la';

    runOnlyCommand(command);

    expect(spawn).toHaveBeenCalledWith(command, [], { shell: true });
  });

  it('should log debug message for stdout data', async () => {
    const command = 'test command';
    const outputData = 'command output';

    const promise = runOnlyCommand(command);

    mockStdout.emit('data', outputData);

    await promise;

    expect(log.debug).toHaveBeenCalledWith(expect.stringContaining(outputData));
  });

  it('should handle stderr data and exit process', () => {
    const command = 'failing command';
    const errorData = 'error message';

    runOnlyCommand(command);

    expect(() => {
      mockStderr.emit('data', errorData);
    }).toThrow();

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('❌ Error running the command: ' + command));
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining(errorData));
    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining('💡 Tip: Check the command syntax and your environment variables.'),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should convert data to string in stdout handler', async () => {
    const command = 'test';
    const bufferData = Buffer.from('buffer data');

    const promise = runOnlyCommand(command);

    mockStdout.emit('data', bufferData);

    const result = await promise;

    expect(log.debug).toHaveBeenCalledWith(expect.stringContaining('buffer data'));
    expect(result).toBe('buffer data');
  });

  it('should convert data to string in stderr handler', () => {
    const command = 'failing command';
    const bufferData = Buffer.from('error buffer');

    runOnlyCommand(command);

    expect(() => {
      mockStderr.emit('data', bufferData);
    }).toThrow();

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('error buffer'));
  });

  it('should resolve promise on first stdout data event', async () => {
    const command = 'test command';
    const outputData = 'test output';

    // Clear previous mock calls and create fresh mocks
    vi.clearAllMocks();

    mockStdout = new EventEmitter();
    mockStderr = new EventEmitter();

    mockTask = {
      stdout: mockStdout,
      stderr: mockStderr,
    };

    (spawn as any).mockReturnValue(mockTask);

    const promise = runOnlyCommand(command);

    // Emit stdout data
    mockStdout.emit('data', outputData);

    const result = await promise;

    expect(result).toBe(outputData);
    expect(log.debug).toHaveBeenCalledWith(expect.stringContaining(outputData));
  });

  it('should handle empty command string', () => {
    const command = '';

    runOnlyCommand(command);

    expect(spawn).toHaveBeenCalledWith('', [], { shell: true });
  });

  it('should handle command with special characters', () => {
    const command = 'echo "test with spaces and symbols!@#$"';

    runOnlyCommand(command);

    expect(spawn).toHaveBeenCalledWith(command, [], { shell: true });
  });
});
