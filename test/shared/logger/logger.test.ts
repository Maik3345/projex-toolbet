import { log } from '../../../src/shared/logger';
import { LOG_LEVELS, LogLevelName } from '../../../src/shared/logger/levels';
import { setLogLevel } from '../../../src/shared/logger/index';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Logger', () => {
  beforeEach(() => {
    // Silenciar logs reales durante los tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should have all required log levels', () => {
    // Verificar que el logger tenga todos los niveles requeridos
    const expectedLevels: LogLevelName[] = ['error', 'warn', 'info', 'debug', 'verbose', 'silly'];
    
    expectedLevels.forEach(level => {
      expect(typeof log[level]).toBe('function');
    });
  });

  it('should handle string messages', () => {
    const logSpy = vi.spyOn(log, 'log');
    
    log.info('Test message');
    
    expect(logSpy).toHaveBeenCalledWith('info', 'Test message');
  });

  it('should handle object messages', () => {
    const logSpy = vi.spyOn(log, 'log');
    const testObj = { foo: 'bar' };
    
    log.info(testObj);
    
    expect(logSpy).toHaveBeenCalledWith('info', '', testObj);
  });

  it('should handle error objects', () => {
    const logSpy = vi.spyOn(log, 'log');
    const testError = new Error('Test error');
    
    log.error('Failed:', testError);
    
    expect(logSpy).toHaveBeenCalledWith('error', 'Failed:', testError);
  });

  it('should change log level with setLogLevel', () => {
    // Capturar el estado original de los transportes
    const originalLevels = log.transports.map(t => t.level);
    
    // Cambiar el nivel
    setLogLevel('error');
    
    // Verificar que todos los transportes cambiaron
    log.transports.forEach(transport => {
      expect(transport.level).toBe('error');
    });
    
    // Restaurar niveles originales
    originalLevels.forEach((level, index) => {
      log.transports[index].level = level;
    });
  });

  it('should have expected log level metadata', () => {
    Object.entries(LOG_LEVELS).forEach(([levelName, metadata]) => {
      expect(metadata).toHaveProperty('priority');
      expect(metadata).toHaveProperty('color');
      expect(metadata).toHaveProperty('icon');
    });
  });
});
