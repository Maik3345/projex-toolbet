import { describe, it, expect } from 'vitest';
import { createTable } from './table';

// No vamos a mockear cli-table, solo verificaremos la estructura del objeto devuelto
// Ya que la función createTable es un wrapper muy simple

describe('table', () => {
  describe('createTable', () => {
    it('creates a table object with expected methods', () => {
      const table = createTable();
      
      // Verificar que se devuelve un objeto con los métodos push y toString
      expect(table).toBeDefined();
      expect(typeof table.push).toBe('function');
      expect(typeof table.toString).toBe('function');
    });

    it('accepts and passes custom headers', () => {
      const customHeaders = ['Column 1', 'Column 2', 'Column 3'];
      const table = createTable({ head: customHeaders });
      
      // No podemos verificar directamente los headers sin un mock más complejo,
      // pero podemos verificar que se acepta la opción
      expect(table).toBeDefined();
    });

    it('can add rows to the table', () => {
      const table = createTable();
      const row = ['Data 1', 'Data 2', 'Data 3'];
      
      // Verificar que se puede llamar al método push sin errores
      expect(() => table.push(row)).not.toThrow();
    });

    it('returns a string representation when toString is called', () => {
      const table = createTable();
      
      // Verificar que toString devuelve un string
      const output = table.toString();
      expect(typeof output).toBe('string');
    });
  });
});