# Pull Request Labels Suggest

Este comando analiza los cambios en una rama de git y sugiere labels automáticamente para pull requests.

## Uso

```bash
projex pull-request labels suggest
projex pull-request labels suggest --branch feature/my-feature
projex pull-request labels suggest --target main --format table
projex pull-request labels suggest --format list --verbose
projex pull-request labels suggest --format txt
projex pull-request labels suggest --format csv
```

## Opciones

- `--branch, -b`: Rama a analizar (por defecto: rama actual)
- `--target, -t`: Rama objetivo para comparar (por defecto: main)
- `--format, -f`: Formato de salida (json, table, list, txt, csv)
- `--verbose, -v`: Mostrar información detallada del análisis

## Labels Sugeridos

### Size
- `size:small`: Cambios pequeños (< 50 líneas, ≤ 3 archivos)
- `size:medium`: Cambios medianos (< 200 líneas, ≤ 10 archivos)
- `size:large`: Cambios grandes (≥ 200 líneas o > 10 archivos)

### Type
- `type:bug`: Corrección de errores
- `type:feature`: Nueva funcionalidad
- `type:docs`: Cambios en documentación
- `type:refactor`: Refactoring de código
- `type:test`: Cambios en pruebas
- `type:chore`: Mantenimiento y tareas administrativas

### Scope
- `scope:api`: Cambios en la API
- `scope:ui`: Cambios en la interfaz de usuario
- `scope:docs`: Cambios en documentación
- `scope:tests`: Cambios en pruebas
- `scope:ci`: Cambios en CI/CD

### Flags Adicionales
- `breaking-change`: Cambios que rompen compatibilidad
- `dependencies-updated`: Actualizaciones de dependencias
- `documentation-needed`: Se necesita documentación
- `tests-needed`: Se necesitan pruebas
- `readme-need-update`: Se necesita actualizar README

## Ejemplo de Salida

### JSON
```json
{
  "labels": [
    {
      "name": "size:medium",
      "color": "#fbca04",
      "description": "Medium change: 150 lines, 5 files",
      "confidence": 75
    },
    {
      "name": "type:feature",
      "color": "#0075ca", 
      "description": "New feature or enhancement",
      "confidence": 85
    }
  ],
  "flags": {
    "breakingChange": false,
    "dependencies": true,
    "documentationNeeded": true,
    "testsNeeded": false,
    "readmeNeedUpdate": false
  }
}
```

### Table
```
┌─────────────────┬─────────┬────────────┬─────────────────────────────────┐
│ Label           │ Type    │ Confidence │ Description                     │
├─────────────────┼─────────┼────────────┼─────────────────────────────────┤
│ type:feature    │ type    │ 85%        │ New feature or enhancement      │
│ size:medium     │ size    │ 75%        │ Medium change: 150 lines, 5... │
│ scope:api       │ scope   │ 70%        │ API related changes             │
└─────────────────┴─────────┴────────────┴─────────────────────────────────┘

Additional Flags:
  📦 Dependencies Updated
  📝 Documentation Needed
```

### TXT
```
SUGGESTED LABELS
================

TYPE:
  - type:feature (85%): New feature or enhancement

SIZE:
  - size:medium (75%): Medium change: 150 lines, 5 files

SCOPE:
  - scope:api (70%): API related changes

ADDITIONAL FLAGS:
  - Dependencies Updated
  - Documentation Needed

SUMMARY:
  Total Labels: 3
  High Confidence (≥80%): 1
  Medium Confidence (60-79%): 2
  Low Confidence (<60%): 0
```

### CSV
```
size:medium,type:feature,scope:api,dependencies-updated,documentation-needed
```

Este formato es ideal para:
- Scripts automatizados que necesitan procesar los labels
- Pipelines de CI/CD que crean labels automáticamente
- Conversión fácil a arrays o JSON en otros procesos
- Integración con herramientas que requieren listas simples

## Algoritmo de Análisis

### Tamaño (Size)
- Se basa en el número total de líneas cambiadas y archivos modificados
- Considera tanto adiciones como eliminaciones

### Tipo (Type)
- Analiza los mensajes de commit en busca de patrones como:
  - `fix`, `bug`, `hotfix` → `type:bug`
  - `feat`, `feature`, `add` → `type:feature`
  - `docs`, `documentation` → `type:docs`
  - `refactor`, `restructure` → `type:refactor`
  - `test`, `spec` → `type:test`
  - `chore`, `maintenance` → `type:chore`

### Scope
- Analiza las rutas de archivos modificados:
  - Archivos `.vue`, `.jsx`, `.css` → `scope:ui`
  - Archivos con `api`, `controller`, `service` → `scope:api`
  - Archivos `.md` → `scope:docs`
  - Archivos de test → `scope:tests`
  - Archivos de CI/CD → `scope:ci`

### Flags Especiales
- **Breaking Change**: Busca `BREAKING CHANGE` en commits
- **Dependencies**: Detecta cambios en `package.json`, `requirements.txt`, etc.
- **Documentation Needed**: Código modificado sin cambios en docs
- **Tests Needed**: Código modificado sin cambios en tests
- **README Update**: Nueva documentación sin actualizar README
