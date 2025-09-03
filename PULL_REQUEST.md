# refactor(utils): reorganizar estructura de utilidades y mejorar sistema de importación

## ¿Qué problema está resolviendo?

Esta PR reorganiza la estructura de archivos de utilidades en el directorio `shared/utils` para mejorar la mantenibilidad y seguir una organización más modular. Los cambios principales incluyen:

1. Migración de utilidades relacionadas con archivos al directorio `fileUtils`
2. Reorganización de comandos de ejecución al directorio `runner`
3. Mejora en la estructura de importaciones y exportaciones
4. Corrección de rutas relativas en archivos de prueba para garantizar su correcta ejecución

## ¿Cómo probarlo?

1. Ejecutar los tests unitarios con cobertura para verificar que todo funciona correctamente:
   ```bash
   npm run test:cov
   ```

2. Ejecutar algunos comandos CLI para asegurarse que la funcionalidad principal no se vea afectada:
   ```bash
   npm link
   projex --help
   ```

## Screenshots o ejemplos de uso

No aplica, ya que se trata de una refactorización interna sin cambios en la API pública.

## ¿Se consideraron alternativas?

Se consideró mantener la estructura plana actual, pero la organización por dominios permite una mejor escalabilidad y mantenibilidad a largo plazo.

## Related to / Depends on

No aplica.

## ¿Cómo te hace sentir este PR?

![refactor](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGh6bW1yM3BmN2JzcnlkcDZxZTN5c2kyZTJqbmpjZmI5aXh4a2VxcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XtydbjSSwkC7K2zBTH/giphy.gif)

## Etiquetas Sugeridas

- `refactor` - Ya que se trata principalmente de una reorganización de código sin cambiar la funcionalidad
- `no-changelog` - Los cambios son internos y no afectan al usuario final
- `maintenance` - Se mejora la estructura interna del proyecto
