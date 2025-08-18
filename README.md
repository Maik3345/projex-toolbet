
<h1 align="center">
  <img align="center" src="img/logo.png" width="200">
  <br><br>
  Projex CLI
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/projex-grey?style=for-the-badge&logo=oclif" alt="Projex"/>
  <img src="https://img.shields.io/npm/v/projex" alt="NPM Version"/>
</p>

---

## Descripción

**Projex CLI** es una herramienta de línea de comandos para gestionar flujos de trabajo de proyectos con comandos de Git, VTEX y Bash. Permite automatizar tareas comunes de desarrollo, versionado, despliegue y documentación, facilitando la colaboración y la estandarización en equipos.

---

## Tabla de Contenido

- [Descripción](#descripción)
- [Tabla de Contenido](#tabla-de-contenido)
- [Instalación](#instalación)
- [Comandos Principales](#comandos-principales)
- [Desarrollo Local](#desarrollo-local)
- [Publicación en npm](#publicación-en-npm)
- [Documentación Detallada](#documentación-detallada)
- [Autocompletado de Comandos](#autocompletado-de-comandos)
- [Estructura de Carpetas y Módulos](#estructura-de-carpetas-y-módulos)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Instalación

```bash
npm i projex
# o global
npm i -g projex
```

---

## Comandos Principales

Consulta todos los comandos disponibles con:

```bash
projex --help
```

Ejemplo de comandos destacados:

| Comando                              | Descripción                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `projex git init`                    | Inicializa archivos base para documentación y versionado en un repositorio Git |
| `projex git setup conventional`      | Configura commits convencionales con Husky y Commitlint                        |
| `projex git setup devops template`   | Añade archivos y carpetas necesarios para Azure DevOps                         |
| `projex git update changelog`        | Actualiza el changelog con los últimos cambios                                 |
| `projex git clone`                   | Clona los repositorios indicados                                               |
| `projex git release`                 | Bump de versión, commit y push automático                                      |
| `projex pull-request labels suggest` | Sugiere etiquetas para PRs según cambios detectados                            |
| `projex bash run`                    | Ejecuta un comando en uno o varios directorios                                 |
| `projex vtex login`                  | Login en VTEX usando API key/token                                             |
| `projex vtex cms backup`             | Descarga archivos de checkout VTEX                                             |
| `projex vtex cms deploy`             | Despliega archivos locales en checkout VTEX                                    |
| `projex vtex run`                    | Ejecuta comandos aceptando preguntas "Yes/No" automáticamente                  |
| `projex vtex run-script`             | Ejecuta scripts desde manifest.json o package.json                             |

---

## Desarrollo Local

```bash
npm run dev
# Para vincular el CLI localmente
sudo npm link
```

---

## Publicación en npm

```bash
npm run postrelease
```

---

## Documentación Detallada

La documentación completa se encuentra en la carpeta [`docs/`](docs/):

- [Arquitectura General](docs/architecture.md): Patrones de diseño y estructura del sistema
- [Etiquetas de Pull Request](docs/pull-request-labels.md): Sugerencia automática de etiquetas para PRs
- [Azure DevOps](docs/azure-devops-usage.md): Integración CI/CD y troubleshooting
- [Gestión de Releases Git](docs/git-release-management.md): Versionado y changelog automatizado
- [Workflows VTEX](docs/vtex-workflows.md): Automatización para la plataforma VTEX
- [Automatización Bash](docs/bash-automation.md): Ejecución de comandos en múltiples directorios
- [Setup Git & Commits Convencionales](docs/git-setup-conventional.md): Estándares de commits y configuración de repositorios
- [APIs y Utilidades Core](docs/core-apis-utilities.md): APIs internas y utilidades compartidas

---

## Autocompletado de Comandos

Projex CLI soporta autocompletado para bash, zsh y fish usando el plugin oficial de oclif.

Para habilitar el autocompletado, ejecuta:

```bash
projex autocomplete
```

Sigue las instrucciones específicas para tu shell.

---

## Estructura de Carpetas y Módulos

Los comandos se encuentran en `src/commands/` y la lógica en `src/modules/` y `src/shared/`. Consulta la documentación para detalles de arquitectura y patrones de diseño.

---

## Contribuir

¿Quieres contribuir? Lee la documentación y sigue los estándares de commits convencionales.

---

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.