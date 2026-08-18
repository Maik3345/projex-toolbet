# AGENTS.md — Guía para Agentes IA

Este documento contiene información esencial para que agentes de IA (Copilot, GitHub Copilot, etc.) puedan trabajar eficazmente con este proyecto.

---

## Proyecto

**Projex CLI** es una herramienta de línea de comandos construida sobre [oclif](https://oclif.io/) para gestionar flujos de trabajo de proyectos con automatización Git, VTEX y Bash.

### Stack Tecnológico

- **Lenguaje**: TypeScript 5.x
- **Framework CLI**: oclif v4
- **Test runner**: Vitest v3
- **Logger**: Winston v3
- **Dependencias clave**: axios, semver, prompts, cli-table, fs-extra, winston
- **Dev tools**: Husky v9 + Commitlint v19 (conventional commits)

### Requisitos del Sistema

```json
{ "node": ">=18.0.0" }
```

---

## Estructura del Proyecto

### Layout Principal

```
projex-toolbet/
├── bin/                  # Entry point ejecutable (bin/run, bin/run.cmd)
├── src/                 # Código fuente TypeScript
│   ├── commands/        # Comandos CLI por dominio
│   │   ├── bash/
│   │   ├── git/
│   │   ├── pull-request/
│   │   └── vtex/
│   ├── modules/         # Lógica de negocio y utilidades
│   │   ├── apps/        # Módulos por dominio (git, vtex, bash, pr)
│   │   └── utils.ts     # Utilidades compartidas top-level
│   ├── api/             # APIs core y utilidades
│   │   ├── constants/   # Constantes globales (colors, index)
│   │   ├── directory/   # Manejo de directorios
│   │   ├── manifest/    # Lectura de archivos manifest
│   │   ├── modules/     # Módulos de API core
│   │   └── table/       # Renderizado de tablas (cli-table)
│   └── shared/         # Utilidades compartidas
│       ├── constants/   # Constantes y paths
│       ├── models/      # Definiciones de tipos
│       └── utils/       # Debounce, git helpers, versioning, file ops, CLI utils
├── test/                # Suite de tests Vitest
│   ├── api/
│   ├── commands/        # Tests por dominio
│   └── modules/         # Tests de lógica de negocio y shared
├── docs/                # Documentación técnica con Mermaid diagrams
├── CHANGELOG.md         # Changelog (Keep a Changelog)
├── commitlint.config.js # Configuración de conventional commits
├── nodemon.json         # Config nodemon para desarrollo
├── tsconfig.json        # TypeScript config principal
├── tsconfig.test.json   # TypeScript config para tests
└── vitest.config.ts     # Vitest config con coverage thresholds (87%)
```

### Path Aliases (vitest.config.ts)

| Alias | Mapea a |
|-------|---------|
| `@shared` | `src/shared/` |
| `@api` | `src/api/` |
| `@modules` | `src/modules/` |
| `@commands` | `src/commands/` |

---

## Convenciones de Código

### 1. Comandos CLI (oclif)

Cada comando es un archivo TypeScript en `src/commands/<domain>/<command>.ts`:

```typescript
// Ejemplo: src/commands/git/release.ts
import { Command, Flags } from '@oclif/core'

export default class ReleaseCommand extends Command {
  static description = 'Release management command';
  
  async run(): Promise<void> {
    const { args, flags } = await this.parse(ReleaseCommand);
    await this.execute(args, flags);
  }

  private async execute(args: any, flags: any): Promise<void> {
    // Lógica de ejecución del comando
  }
}
```

**Patrones oclif**:
- Cada comando extiende `Command` de `@oclif/core`
- Definir `static description`, `static examples`, etc.
- Usar `this.parse(Command)` para obtener args/flags
- Soporte nativo para `--help`, autocompletado, hooks

### 2. Módulos de Negocio

Lógica organizada en subcarpetas por dominio:

```
src/modules/apps/<domain>/
├── index.ts              # Exportación principal del módulo
└── <command-name>/       # Lógica específica del comando
    └── ...               # Utilidades, helpers, types
```

### 3. Sistema de Logging (Winston)

- Logger configurado con niveles: debug, info, warn, error
- Soporte para output verbose (--verbose flag en muchos comandos)
- Formateo consistente con colores ANSI
- Transporte configurable (console + archivo opcional)

**Ubicación**: `src/shared/logger/` — includes constants, formatters, levels, transports

### 4. Conventional Commits

El proyecto usa Husky v9 + Commitlint v19:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 200],
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always']
  }
};
```

**Formato requerido**: `type(scope): description`
- Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Scope opcional (git, vtex, bash, pr)

### 5. Pruebas (Vitest)

Framework de testing con cobertura configurada:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          statements: 87,
          branches: 87,
          functions: 87,
          lines: 87,
        },
      },
    },
  },
});
```

**Comandos de test**:
- `npm run test` — ejecutar tests sin watcher
- `npm run test:cov` — con reporte de cobertura (objetivo: ≥87%)
- Tests ubicados junto a la lógica en `test/modules/<domain>/`

### 6. Build & Compilación

```bash
npm run build       # Limpia dist/ → compila TypeScript → tsc-alias
npm run dev         # Desarrollo con nodemon (reinicio automático)
npm run lint        # Linter estático con eslint-config-oclif + prettier
npm run test:run    # Tests sin watcher
```

---

## Comandos Principales del CLI

### Git Commands (`projex git`)

| Comando | Descripción |
|---------|-------------|
| `git init` | Inicializa archivos base (README, .gitignore, etc.) para un repo Git |
| `git setup conventional` | Configura Husky + Commitlint en hooks pre-commit y commit-msg |
| `git setup devops template` | Añade plantillas y carpetas para Azure DevOps CI/CD |
| `git update changelog` | Genera/update CHANGELOG.md con el último release (semver) |
| `git clone` | Clona repositorios usando los parámetros de CLI |
| `git release` | Automatiza: version bump → commit → tag → push (usa semver y conventional commits) |

### VTEX Commands (`projex vtex`)

| Comando | Descripción |
|---------|-------------|
| `vtex login` | Autenticación en VTEX con API key/token |
| `vtex run-script` | Ejecuta scripts desde manifest.json o package.json |
| `vtex cms backup` | Descarga archivos del checkout VTEX localmente |
| `vtex cms deploy` | Despliega archivos locales al checkout VTEX |
| `vtex run` | Ejecuta comandos con prompts Yes/No automáticos |

### Bash Commands (`projex bash`)

| Comando | Descripción |
|---------|-------------|
| `bash run` | Ejecuta un comando en múltiples directorios (batch execution) |

### Pull Request Commands (`projex pull-request`)

| Comando | Descripción |
|---------|-------------|
| `pull-request labels suggest` | Sugiere etiquetas para PRs basadas en análisis de cambios detectados |

---

## Hooks y Eventos

### Hook Init (oclif)

Se ejecuta al inicio del CLI. Muestra un banner con ASCII art cuando se usan `--help` o sin argumentos:

```typescript
// src/hooks/init.ts
const banner = `
██████╗ ██████╗  ██████╗      ██╗███████╗██╗  ██╗
... (ASCII art)
`;

export default async function init() {
  const argv = process.argv.join(' ');
  if (argv.includes('help') || process.argv.length <= 2) {
    console.log(Colors.CYAN(banner));
  }
};
```

---

## Documentación Técnica

La documentación detallada se encuentra en `docs/` con diagramas Mermaid:

- **architecture.md** — Diagramas de arquitectura, flujos de datos y patrones de diseño
- **core-apis-utilities.md** — APIs internas, logging, tablas renderizadas, utilidades compartidas
- **bash-automation.md** — Ejecución batch en múltiples directorios con diagramas de flujo
- **git-release-management.md** — Versionado semver y changelog automatizado
- **vtex-workflows.md** — Automatización para la plataforma VTEX (login, backup, deploy)
- **azure-devops-usage.md** — Integración CI/CD y troubleshooting con Azure DevOps
- **pull-request-labels.md** — Sugerencia automática de etiquetas para PRs
- **git-setup-conventional.md** — Estándares de commits con Husky y Commitlint

---

## Scripts del package.json

```json
{
  "scripts": {
    "dev": "npx nodemon",
    "clean": "shx rm -f oclif.manifest.json npm-shrinkwrap.json",
    "build": "tsc -b && tsc-alias",
    "test:run": "vitest run",
    "test:cov": "vitest run --coverage"
  }
}
```

---

## Plugins oclif Activos

| Plugin | Función |
|--------|---------|
| `@oclif/plugin-help` | Comando --help mejorado |
| `@oclif/plugin-warn-if-update-available` | Notifica si hay versión nueva disponible |
| `@oclif/plugin-autocomplete` | Autocompletado para bash, zsh, fish |
| `@oclif/plugin-update` | Actualización automática del CLI |

---

## Mejores Prácticas para Agentes IA

### Para entender el proyecto:

1. **Comienza con la documentación** en `docs/` para comprender la arquitectura
2. **Lee CHANGELOG.md** para ver el historial de cambios recientes
3. **Revisa AGENTS.md** (este archivo) como guía rápida de convenciones y estructura
4. **Consulta README.md** para una visión general del proyecto

### Para implementar nuevas funcionalidades:

1. **Nuevo comando CLI**: Crea un archivo en `src/commands/<domain>/<name>.ts` siguiendo el patrón oclif
2. **Nueva lógica de negocio**: Añade a `src/modules/apps/<domain>/`, exportando desde `index.ts`
3. **Nuevas utilidades compartidas**: Añade a `src/shared/utils/` y exporta desde `src/shared/index.ts`
4. **APIs core**: Añade a `src/api/` con las constantes en `src/api/constants/`

### Para ejecutar tests:

1. Ejecutar todos los tests: `npm test` o `pnpm test`
2. Con cobertura: `npm run test:cov` (objetivo ≥87%)
3. Tests están ubicados junto a la lógica en carpetas paralelas (`test/modules/`, `test/api/`)

### Para releases y versionado:

1. Seguir Conventional Commits (feat, fix, docs, etc.)
2. El comando `git release` automatiza el proceso completo de release
3. Consultar `docs/git-release-management.md` para detalles del flujo de release

---

## Variables de Entorno y Configuración

- **Node.js**: >=18.0.0
- **Shell scripts**: bin/run (Windows/macOS/Linux)
- **Alias TypeScript**: @shared, @api, @modules, @commands

---

## Referencias Externas

- [oclif](https://oclif.io/) — Framework CLI oficial de Node.js
- [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) — Formato del changelog
- [Semantic Versioning](http://semver.org/spec/v2.0.0.html) — Sistema de versionado semver

---

## Contribución

El proyecto sigue Conventional Commits 1.0.0 y SemVer. Para contribuir:

1. Clonar el repositorio con `projex git clone <url>`
2. Setup del entorno con `npm install` o `pnpm install`
3. Configurar commits convencionales: `projex git setup conventional`
4. Desarrollar cambios con `npm run dev`
5. Ejecutar tests: `npm test`
6. Crear un PR y usar `projex pull-request labels suggest`

---

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
