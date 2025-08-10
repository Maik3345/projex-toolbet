import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

// Mock child_process spawn first
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

// Mock logger
vi.mock('../logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { runMultipleCommand } from './runMultipleCommand';
import { spawn } from 'child_process';
import { log } from '../logger';

// Mock process.exit
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

describe('runMultipleCommand', () => {
  let mockTask: EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
  };

  const mockSpawn = vi.mocked(spawn);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh EventEmitters for each test
    mockTask = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });

    mockSpawn.mockReturnValue(mockTask as any);
  });

  it('should execute command with correct parameters', async () => {
    const command = 'test-command';
    
    // Start the promise
    const promise = runMultipleCommand(command);
    
    // Trigger exit event
    mockTask.emit('exit');
    
    // Wait for promise to resolve
    const result = await promise;
    
    expect(mockSpawn).toHaveBeenCalledWith('test-command', [], { shell: true });
    expect(result).toBe('exit');
  });

  it('should log stdout data using log.info', async () => {
    const command = 'echo test';
    const testData = 'test output';
    
    const promise = runMultipleCommand(command);
    
    // Emit stdout data
    mockTask.stdout.emit('data', testData);
    
    // Trigger exit
    mockTask.emit('exit');
    
    await promise;
    
    expect(log.info).toHaveBeenCalledWith(testData);
  });

  it('should convert stdout data to string', async () => {
    const command = 'test-command';
    const bufferData = Buffer.from('buffer data');
    
    const promise = runMultipleCommand(command);
    
    // Emit buffer data
    mockTask.stdout.emit('data', bufferData);
    
    // Trigger exit
    mockTask.emit('exit');
    
    await promise;
    
    expect(log.info).toHaveBeenCalledWith('buffer data');
  });

  it('should log stderr data using log.warn', async () => {
    const command = 'test-command';
    const errorData = 'error message';
    
    const promise = runMultipleCommand(command);
    
    // Emit stderr data
    mockTask.stderr.emit('data', errorData);
    
    // Trigger exit
    mockTask.emit('exit');
    
    await promise;
    
    expect(log.warn).toHaveBeenCalledWith(errorData);
  });

  it('should convert stderr data to string', async () => {
    const command = 'test-command';
    const bufferError = Buffer.from('buffer error');
    
    const promise = runMultipleCommand(command);
    
    // Emit buffer error
    mockTask.stderr.emit('data', bufferError);
    
    // Trigger exit
    mockTask.emit('exit');
    
    await promise;
    
    expect(log.warn).toHaveBeenCalledWith('buffer error');
  });

  it('should exit process when stderr contains specific error', async () => {
    const command = 'test-command';
    const errorData = 'fatal error occurred';
    const errors = ['fatal error'];
    
    const promise = runMultipleCommand(command, errors);
    
    // Emit stderr data with error
    expect(() => {
      mockTask.stderr.emit('data', errorData);
    }).toThrow('process.exit called');
    
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should not exit process when stderr does not contain specific errors', async () => {
    const command = 'test-command';
    const errorData = 'warning message';
    const errors = ['fatal error', 'critical error'];
    
    const promise = runMultipleCommand(command, errors);
    
    // Emit stderr data without matching errors
    mockTask.stderr.emit('data', errorData);
    
    // Trigger exit
    mockTask.emit('exit');
    
    const result = await promise;
    
    expect(mockProcessExit).not.toHaveBeenCalled();
    expect(result).toBe('exit');
  });

  it('should handle multiple error patterns', async () => {
    const command = 'test-command';
    const errorData = 'critical system failure';
    const errors = ['fatal error', 'critical system', 'panic'];
    
    const promise = runMultipleCommand(command, errors);
    
    // Emit stderr data with one of the matching errors
    expect(() => {
      mockTask.stderr.emit('data', errorData);
    }).toThrow('process.exit called');
    
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should work without errors array', async () => {
    const command = 'test-command';
    const errorData = 'some error';
    
    const promise = runMultipleCommand(command);
    
    // Emit stderr data without errors array
    mockTask.stderr.emit('data', errorData);
    
    // Trigger exit
    mockTask.emit('exit');
    
    const result = await promise;
    
    expect(log.warn).toHaveBeenCalledWith(errorData);
    expect(mockProcessExit).not.toHaveBeenCalled();
    expect(result).toBe('exit');
  });

  it('should handle empty command string', async () => {
    const command = '';
    
    const promise = runMultipleCommand(command);
    
    // Trigger exit
    mockTask.emit('exit');
    
    const result = await promise;
    
    expect(mockSpawn).toHaveBeenCalledWith('', [], { shell: true });
    expect(result).toBe('exit');
  });

  it('should handle command with special characters', async () => {
    const command = 'echo "test & special | chars"';
    
    const promise = runMultipleCommand(command);
    
    // Trigger exit
    mockTask.emit('exit');
    
    const result = await promise;
    
    expect(mockSpawn).toHaveBeenCalledWith('echo "test & special | chars"', [], { shell: true });
    expect(result).toBe('exit');
  });
});
