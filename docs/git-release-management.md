# Git Release Management

## Descripción

El sistema de release management de projex-toolbet automatiza completamente el proceso de versionado, desde el bump de versión hasta la actualización del changelog y la publicación, siguiendo las mejores prácticas de [Semantic Versioning](https://semver.org/) y [Keep a Changelog](https://keepachangelog.com/).

## Casos de Uso

- **Releases automatizados** para proyectos con múltiples desarrolladores
- **Versionado consistente** siguiendo semantic versioning
- **Changelog automático** basado en commits convencionales
- **CI/CD integration** para publicación automática
- **Múltiples archivos de versión** sincronizados automáticamente

## Flujo de Release

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px
    classDef inicioClass fill:#059669,color:white,stroke:#047857,stroke-width:2px
    classDef finClass fill:#374151,color:white,stroke:#1f2937,stroke-width:2px
    classDef rejectClass fill:#dc2626,color:white,stroke:#b91c1c,stroke-width:2px

    inicio(("Iniciar Release")):::inicioClass
    validar["Validar estado del repositorio"]:::statementClass
    version_check{"¿Cambios locales no commiteados?"}:::conditionalClass
    pre_script["Ejecutar preRelease script"]:::statementClass
    determinar["Determinar tipo de release"]:::statementClass
    bump["Actualizar versión en archivos"]:::statementClass
    changelog["Generar entrada de changelog"]:::statementClass
    commit["Crear commit de release"]:::statementClass
    tag["Crear tag de versión"]:::statementClass
    push["Push cambios y tags"]:::statementClass
    post_script["Ejecutar postRelease script"]:::statementClass
    fin(("Release Completado")):::finClass
    
    error["Detener: cambios pendientes"]:::rejectClass

    inicio --> validar
    validar --> version_check
    version_check -->|Sí| error
    version_check -->|No| pre_script
    pre_script --> determinar
    determinar --> bump
    bump --> changelog
    changelog --> commit
    commit --> tag
    tag --> push
    push --> post_script
    post_script --> fin
```

## Algoritmo de Determinación de Versión

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px

    commits["Analizar commits desde último release"]:::statementClass
    breaking{"¿Breaking changes?"}:::conditionalClass
    features{"¿Nuevas features?"}:::conditionalClass
    fixes{"¿Bug fixes?"}:::conditionalClass
    
    major["MAJOR (x.0.0)"]:::statementClass
    minor["MINOR (0.x.0)"]:::statementClass
    patch["PATCH (0.0.x)"]:::statementClass

    commits --> breaking
    breaking -->|Sí| major
    breaking -->|No| features
    features -->|Sí| minor
    features -->|No| fixes
    fixes -->|Sí| patch
    fixes -->|No| patch
```

## Estructura de Archivos de Versión

### Configuración en package.json
```json
{
  "version": "1.43.1",
  "projex": {
    "releaseFiles": [
      "library/package.json",
      "react/package.json", 
      "node/package.json"
    ]
  }
}
```

### Detección de Archivos de Versión
```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px
    classDef dbClass fill:#4338ca,color:white,stroke:#3730a3,stroke-width:2px

    inicio["Detectar archivos de versión"]:::statementClass
    manifest{"¿Existe manifest.json?"}:::conditionalClass
    package{"¿Existe package.json?"}:::conditionalClass
    release_files{"¿Configurado projex.releaseFiles?"}:::conditionalClass
    
    usar_manifest["Usar manifest.json como principal"]:::statementClass
    usar_package["Usar package.json como principal"]:::statementClass
    actualizar_adicionales["Actualizar archivos en releaseFiles"]:::statementClass
    
    manifest_db[(manifest.json)]:::dbClass
    package_db[(package.json)]:::dbClass
    adicionales_db[(Archivos adicionales)]:::dbClass

    inicio --> manifest
    manifest -->|Sí| usar_manifest
    manifest -->|No| package
    package -->|Sí| usar_package
    package -->|No| usar_package
    
    usar_manifest --> release_files
    usar_package --> release_files
    release_files -->|Sí| actualizar_adicionales
    
    usar_manifest --> manifest_db
    usar_package --> package_db
    actualizar_adicionales --> adicionales_db
```

## Generación de Changelog

### Formato del Changelog
Siguiendo [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [Unreleased]

## [1.43.1](https://github.com/user/repo/compare/v1.43.0...v1.43.1) - (2025-06-12)

### Bug Fixes
* fix the build version ([e14dca1c](https://github.com/user/repo/commit/e14dca1c))

### Features  
* add new feature ([5ef6405f](https://github.com/user/repo/commit/5ef6405f))
```

### Procesamiento de Commits
```mermaid
sequenceDiagram
    participant CLI as projex CLI
    participant Git as Git Repository
    participant Parser as Commit Parser
    participant Generator as Changelog Generator
    participant File as CHANGELOG.md

    CLI->>Git: git rev-list HEAD --not origin/main
    Git-->>CLI: Lista de commits
    CLI->>Parser: Procesar commits
    Parser->>Parser: Extraer tipo y mensaje
    Parser->>Parser: Generar enlaces a commits
    Parser-->>CLI: Commits procesados
    CLI->>Generator: Generar entrada de changelog
    Generator->>File: Escribir nueva versión
    File-->>CLI: Changelog actualizado
```

## Integración con Scripts

### Pre/Post Release Scripts
En `manifest.json`:
```json
{
  "scripts": {
    "preRelease": "npm run test && npm run build",
    "postRelease": "npm publish && git push --follow-tags"
  }
}
```

### Flujo de Ejecución de Scripts
```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart LR
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px

    pre["preRelease Script"]:::statementClass
    release["Core Release Process"]:::statementClass
    post["postRelease Script"]:::statementClass
    
    validation{"¿Script exitoso?"}:::conditionalClass
    abort["Abortar Release"]:::rejectClass

    pre --> validation
    validation -->|Sí| release
    validation -->|No| abort
    release --> post
```

## Configuración de Tags

### Estrategias de Tagging
- **stable**: Para releases de producción
- **beta**: Para releases de prueba
- **hkignore**: Para releases internos/desarrollo

### Formato de Tags
```
v1.43.1-beta
v1.43.1-stable
v1.43.1-hkignore
```

## Casos de Uso Avanzados

### Release Automático en CI/CD
```yaml
# GitHub Actions
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Release
        run: projex git release --yes --no-check-release
```

### Release Manual con Validación
```bash
# Release interactivo con todas las validaciones
projex git release

# Release específico
projex git release minor stable

# Release sin push (para revisión)
projex git release --no-push
```

## Troubleshooting

### Problemas Comunes

1. **Cambios no commiteados**: Use `--no-check-release` o haga commit antes
2. **Archivos de versión no encontrados**: Verifique rutas en `projex.releaseFiles`
3. **Scripts fallando**: Use `--no-pre-release` o `--no-post-release` para omitir
4. **Conflictos de merge**: Resuelva antes de hacer release

### Debugging
```bash
# Ver información de versión actual
projex git release --get-version

# Solo obtener número de versión
projex git release --get-only-version-number

# Verbose para debugging
projex git release --verbose
```

## Mejores Prácticas

1. **Commits Convencionales**: Use conventional commits para mejor detección automática
2. **Testing**: Configure preRelease scripts para ejecutar tests
3. **Changelog Manual**: Mantenga sección [Unreleased] actualizada
4. **Backup**: Siempre haga backup antes de releases importantes
5. **Staging**: Use tags beta para validar antes de stable
