
import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import * as formatters from './formatters';
import { SuggestedLabels } from './types';

// Mock console.log para poder capturar la salida
const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();
console.log = mockConsoleLog;

// Restaurar console.log después de las pruebas
afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock de los módulos externos
vi.mock('@shared', () => ({
  log: { info: vi.fn() }
}));

// Mock del módulo @api con todas las funciones de colores y createTable
vi.mock('@api', () => ({
  Colors: {
    BLUE: (x: string) => `BLUE(${x})`,
    YELLOW: (x: string) => `YELLOW(${x})`,
    WHITE: (x: string) => `WHITE(${x})`,
    GREEN: (x: string) => `GREEN(${x})`,
    ERROR: (x: string) => `ERROR(${x})`
  },
  createTable: vi.fn(() => ({
    push: vi.fn(),
    toString: () => 'table output'
  }))
}));

const mockLabels = [
  {
    name: 'type:feature',
    color: '#00ff00',
    description: 'New feature',
    confidence: 90,
    evidenceCommit: {
      commitId: 'abc123',
      message: 'feat: add new feature',
      matchedPattern: 'feat:'
    }
  },
  {
    name: 'size:small',
    color: '#0000ff',
    description: 'Small change',
    confidence: 70
  },
  {
    name: 'release:major',
    color: '#ff0000',
    description: 'Major release',
    confidence: 85
  }
];

const baseSuggestions: SuggestedLabels = {
  size: mockLabels[1],
  type: [mockLabels[0]],
  release: [mockLabels[2]],
  breakingChange: true,
  dependencies: true,
  documentationNeeded: false,
  testsNeeded: true,
  readmeNeedUpdate: false
};

const emptySuggestions: SuggestedLabels = {
  size: null,
  type: [],
  release: [],
  breakingChange: false,
  dependencies: false,
  documentationNeeded: false,
  testsNeeded: false,
  readmeNeedUpdate: false
};

describe('formatters', () => {
  // Limpiar mocks después de cada prueba
  afterEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockReset();
  });

  describe('formatOutput', () => {
    it('handles json format', async () => {
      await formatters.formatOutput(baseSuggestions, 'json', false);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.any(String));
      
      const jsonOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(jsonOutput).toHaveProperty('labels');
      expect(jsonOutput).toHaveProperty('flags');
      expect(jsonOutput).toHaveProperty('summary');
    });

    it('handles table format', async () => {
      await formatters.formatOutput(baseSuggestions, 'table', false);
      expect(mockConsoleLog).toHaveBeenCalledWith('table output');
    });
    
    it('handles list format', async () => {
      await formatters.formatOutput(baseSuggestions, 'list', false);
      // Solo verificamos que la función completa sin errores
      expect(true).toBe(true);
    });
    
    it('handles txt format', async () => {
      await formatters.formatOutput(baseSuggestions, 'txt', false);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('SUGGESTED LABELS'));
    });
    
    it('handles csv format', async () => {
      await formatters.formatOutput(baseSuggestions, 'csv', false);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringMatching(/[\w-]+(,[\w-]+)*/));
    });
    
    it('defaults to json format for invalid format', async () => {
      await formatters.formatOutput(baseSuggestions, 'invalid' as any, false);
      const jsonOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(jsonOutput).toHaveProperty('labels');
    });
    
    it('handles empty suggestions with json format', async () => {
      await formatters.formatOutput(emptySuggestions, 'json', false);
      const jsonOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(jsonOutput.labels).toHaveLength(0);
      expect(jsonOutput.flags.breakingChange).toBe(false);
    });
    
    it('handles empty suggestions with table format', async () => {
      await formatters.formatOutput(emptySuggestions, 'table', false);
      expect(mockConsoleLog).not.toHaveBeenCalledWith('table output');
    });
    
    it('handles empty suggestions with txt format', async () => {
      await formatters.formatOutput(emptySuggestions, 'txt', false);
      expect(mockConsoleLog).toHaveBeenCalledWith('No labels suggested based on the analysis.');
    });
    
    it('handles empty suggestions with csv format', async () => {
      await formatters.formatOutput(emptySuggestions, 'csv', false);
      expect(mockConsoleLog).toHaveBeenCalledWith('');
    });
    
    it('adds verbose logging when verbose is true', async () => {
      await formatters.formatOutput(baseSuggestions, 'json', true);
      // Solo verificamos que la función completa sin errores
      expect(true).toBe(true);
    });
  });

  // Pruebas generales para verificar el formato correcto de la salida
  describe('output formatting', () => {
    it('formats json output correctly', async () => {
      await formatters.formatOutput(baseSuggestions, 'json', false);
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      
      // Verificar flags
      expect(output.flags.breakingChange).toBe(true);
      expect(output.flags.dependencies).toBe(true);
      expect(output.flags.testsNeeded).toBe(true);
      expect(output.flags.documentationNeeded).toBe(false);
      
      // Verificar labels
      expect(output.labels.length).toBe(3);
      expect(output.labels[0].confidence).toBeGreaterThanOrEqual(output.labels[1].confidence);
      
      // Verificar summary
      expect(output.summary.totalLabels).toBe(3);
      expect(output.summary.highConfidence).toBe(2); // 90% y 85%
      expect(output.summary.mediumConfidence).toBe(1); // 70%
      expect(output.summary.lowConfidence).toBe(0);
    });
    
    it('formats csv output with flags correctly', async () => {
      await formatters.formatOutput(baseSuggestions, 'csv', false);
      const output = mockConsoleLog.mock.calls[0][0];
      
      // Verificar que incluye nombres de etiquetas
      expect(output).toContain('type:feature');
      expect(output).toContain('size:small');
      expect(output).toContain('release:major');
      
      // Verificar que incluye flags
      expect(output).toContain('breaking-change');
      expect(output).toContain('dependencies-updated');
      expect(output).toContain('tests-needed');
      expect(output).not.toContain('documentation-needed');
    });
    
    it('formats txt output with all sections', async () => {
      await formatters.formatOutput(baseSuggestions, 'txt', false);
      const output = mockConsoleLog.mock.calls[0][0];
      
      // Verificar secciones del texto
      expect(output).toContain('SUGGESTED LABELS');
      expect(output).toContain('TYPE:');
      expect(output).toContain('SIZE:');
      expect(output).toContain('RELEASE:');
      expect(output).toContain('ADDITIONAL FLAGS:');
      expect(output).toContain('SUMMARY:');
      expect(output).toContain('Breaking Change');
      expect(output).toContain('Dependencies Updated');
      expect(output).toContain('Tests Needed');
      expect(output).toContain('Total Labels: 3');
    });
  });
});
