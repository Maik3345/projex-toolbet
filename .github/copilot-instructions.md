# Copilot Instructions for projex-toolbet

## Project Overview
- **Projex CLI** is a Node.js-based command-line tool for managing project workflows, focusing on Git, VTEX, and Bash automation.
- The CLI is built with [oclif](https://oclif.io/) conventions. Commands are modular and grouped by domain: `git`, `vtex`, and `bash`.
- Source code is organized under `src/commands` (entry points) and `src/modules` (logic, utilities, helpers).

## Key Architectural Patterns
- **Command Structure:** Each CLI command is a file in `src/commands/<domain>/<command>.ts`. Flags, args, and examples are defined per oclif standards.
- **Modules:** Shared logic is in `src/modules` and `src/shared`. Utilities for each domain (e.g., `git`, `vtex`) are further split into subfolders for maintainability.
- **Release Automation:** The `projex git release` command automates version bumps, changelog updates, tagging, and pushes. It reads and updates `package.json` and optionally other files listed in `projex.releaseFiles`.
- **Changelog Format:** Follows [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](http://semver.org/spec/v2.0.0.html). See `CHANGELOG.md` for structure.

## Developer Workflows
- **Local Development:**
  - Start with `npm run dev`.
  - Use `sudo npm link` to link the CLI locally.
- **Testing:**
  - Tests are located alongside logic in `src/modules/<domain>/<command>/`. Use `jest` for running tests (`jest.config.js`).
- **Release & Publish:**
  - Use `npm run postrelease` to publish to npm.
  - The release process is automated via CLI commands and changelog conventions.

## Project-Specific Conventions
- **Command Help:** All commands support `--help` for usage and options.
- **Versioning:** Multiple files can be versioned by listing them in `projex.releaseFiles` in `package.json`.
- **Verbose Logging:** Many commands support `--verbose` for debug output.
- **Non-interactive Mode:** Use `--yes` to auto-confirm prompts.
- **Custom Scripts:** Release commands can trigger pre/post scripts from `manifest.json` if present.

## Integration Points
- **Git:** Extensive automation for repo setup, conventional commits, changelog, and releases. See `src/commands/git/` and `src/modules/apps/git/`.
- **VTEX:** Auth, backup, deploy, and run-script commands. See `src/commands/vtex/` and `src/modules/apps/vtex/`.
- **Bash:** Batch command execution across directories. See `src/commands/bash/`.

## Examples
- To add a new command: create a file in `src/commands/<domain>/`, export the command, and follow oclif patterns.
- To extend release automation: update logic in `src/modules/apps/git/release/` and reference `projex.releaseFiles`.

## References
- [README.md](../README.md) for command documentation and workflow details.
- [CHANGELOG.md](../CHANGELOG.md) for changelog conventions.
- `src/commands/` and `src/modules/` for code structure and patterns.

---
**Feedback:** If any section is unclear or missing, please specify which workflows, conventions, or architectural details need further documentation.


## 🎯 Palabras Clave que Activan los Flujos de Trabajo

Cuando el usuario escriba cualquiera de estas frases, Copilot debe activar automáticamente las instrucciones correspondientes:

### 📋 Pull Request y Control de Versiones
- **"pr"** | **"pull request"** | **"crear pr"**  
  → Usar instrucciones: [pull-request-autofill.instructions.md](./pull-request/pull-request-autofill.instructions.md)  
  *Automatiza la generación del contenido de Pull Request basándose en el template y el historial de cambios de la rama actual, incluyendo título con Conventional Commits*

- **"commit"** | **"conventional commit"** | **"formato commit"**  
  → Usar instrucciones: [conventional-commit.instructions.md](./pull-request/conventional-commit.instructions.md)  
  *Aplica las reglas de Conventional Commits 1.0.0 para estructurar mensajes de commit consistentes*

### 📚 Documentación General
- **"doc"** | **"documentación"** | **"generar docs"**  
  → Usar instrucciones: [documentation.instructions.md](./documentation/documentation.instructions.md)  
  *Genera documentación detallada en la carpeta docs con diagramas Mermaid, actualiza README.md y crea enlaces de navegación*

### 🏪 Documentación VTEX IO
- **"doc vtex"** | **"doc vtex io"** | **"vtex documentation"**  
  → Usar instrucciones: [documentation-vtex-io.instructions.md](./documentation/documentation-vtex-io.instructions.md)  
  *Especializada en documentación para proyectos VTEX IO, incluyendo componentes, props, configuración, APIs y rutas admin*

### 🧪 QA y Testing
- **"qa"** | **"qa-hu"** | **"resumen qa"** | **"testing guide"**  
  → Usar instrucciones: [qa-hu-guide.instructions.md](./backlog/qa-hu-guide.instructions.md)  
  *Genera resumen estructurado para QA con casos de prueba, puntos críticos y regresiones a verificar*

- **"coverage"** | **"test-coverage"** | **"cobertura"** | **"sonar quality gate"**  
  → Usar instrucciones: [test-coverage.instructions.md](./unit-testing/test-coverage.instructions.md)  
  *Mejora sistemáticamente la cobertura de tests hasta alcanzar el 87% requerido por SonarQube Quality Gate B-2*

### 🔍 Palabras Clave Adicionales Sugeridas

Para futuras mejoras del sistema, considera agregar estos flujos:

- **"review"** | **"code review"** → Para instrucciones de revisión de código
- **"deploy"** | **"deployment"** → Para instrucciones de despliegue
- **"refactor"** | **"clean code"** → Para instrucciones de refactorización
- **"api"** | **"swagger"** | **"openapi"** → Para documentación de APIs
- **"security"** | **"sec check"** → Para validaciones de seguridad
- **"performance"** | **"perf"** → Para optimizaciones de rendimiento
