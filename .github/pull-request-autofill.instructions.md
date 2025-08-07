# Copilot Customization: Pull Request Template Auto-fill

## Objective

Automatizar la generación del contenido de Pull Request (PR) usando GitHub Copilot, basándose en el template de PR y el historial de cambios de la rama actual.

## Instrucción para Copilot

1. **Lee el archivo de template de Pull Request**

   - Ubicación típica: `.github/pull_request_template/pull-request-template.md` o similar.
   - Extrae las secciones y los comentarios guía del template.

2. **Obtén el historial de cambios de la rama actual**

   - Usa comandos de git como `git diff` y `git log` para identificar los cambios realizados respecto a la rama base (por ejemplo, `master` o `main`).
   - Resume los cambios principales: archivos modificados, nuevas funcionalidades, refactorizaciones, tests agregados, etc.

3. **Rellena el template de PR automáticamente**

   - Para cada sección del template, utiliza la información del diff y los mensajes de commit para generar un resumen claro y conciso.
   - Ejemplo de correspondencia:
     - "What problem is this solving?": Resume el objetivo principal de los cambios detectados.
     - "How to test it?": Sugiere pasos de prueba basados en los archivos y funcionalidades modificadas.
     - "Screenshots or example usage": Indica si aplica o no, según el tipo de cambio.
     - "Describe alternatives you've considered": Si no hay alternativas en los commits, indica "No aplica".
     - "Related to / Depends on": Si hay referencias a issues o dependencias en los commits, inclúyelas.
     - "How does this PR make you feel?": Sugiere agregar un gif de Giphy.

4. **Formato de salida**
   - El contenido generado debe estar en markdown, siguiendo la estructura del template.
   - No incluir formato adicional fuera del markdown del template.

## Ejemplo de flujo automatizado

1. Detectar el template de PR.
2. Ejecutar `git diff origin/master...HEAD` para obtener los cambios.
3. Analizar los mensajes de commit recientes con `git log`.
4. Generar el contenido de cada sección del template usando la información anterior.
5. Presentar el resultado en markdown listo para copiar y pegar.

## Ejemplo de prompt para Copilot

"Lee el archivo de template de Pull Request y, usando el historial de cambios de la rama actual (usando git diff y git log), genera el contenido completo del PR en markdown, siguiendo la estructura y comentarios del template. Resume los cambios, explica cómo probarlos, y completa las secciones opcionales si hay información relevante."

---

Este archivo sirve como guía para personalizar Copilot y automatizar la generación de Pull Requests informativos y consistentes.
