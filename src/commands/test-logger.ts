import { Command, Flags } from '@oclif/core';
import { log } from '@shared';

export default class TestLogger extends Command {
  static readonly description = 'Prueba el sistema de logging';

  static readonly examples = [
    '$ projex test-logger',
  ];

  static readonly flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'ejecuta con modo verbose (muestra más logs)',
      default: false,
    }),
  };

  async run() {
    const { flags } = await this.parse(TestLogger);

    if (flags.verbose) {
      // Este modo mostrará también los logs de nivel debug
      this.log('Modo verbose activado');
    }

    this.log('\n========== PRUEBA DEL SISTEMA DE LOGGING ==========');

    // Probar diferentes niveles de log
    this.log('\n--- Niveles de log ---');
    log.info('Este es un mensaje informativo');
    log.warn('Este es una advertencia');
    log.error('Este es un mensaje de error');
    log.debug('Este es un mensaje de depuración (visible solo en modo verbose)');
    log.verbose('Este es un mensaje verboso (nivel más detallado)');

    // Probar logging de objetos
    this.log('\n--- Logging de objetos ---');
    log.info('Objeto JSON:', { usuario: 'admin', id: 123, permisos: ['read', 'write'] });

    // Probar logging de errores
    this.log('\n--- Logging de errores ---');
    try {
      throw new Error('Error de prueba');
    } catch (error) {
      log.error('Se produjo un error:', error);
    }

    // Probar formato avanzado
    this.log('\n--- Formato avanzado ---');
    log.info('Mensaje con %s y %d', 'texto formateado', 42);

    this.log('\n========== FIN DE LA PRUEBA ==========');
    this.log('Revisa el archivo de logs en ~/.config/projex/debug.json');
  }
}
