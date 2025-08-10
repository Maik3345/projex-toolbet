# Pull Request Labels Suggest

## Descripción

El comando `projex pull-request labels suggest` es una herramienta de análisis automático que examina cambios en git y sugiere labels apropiados para pull requests, ayudando a estandarizar la categorización y mejorar la organización del flujo de trabajo.

## Casos de Uso

Este comando es especialmente útil para:
- **Equipos de desarrollo** que buscan consistencia en el etiquetado de PRs
- **Pipelines de CI/CD** que necesitan categorización automática
- **Maintainers de proyectos** que revisan múltiples PRs diariamente
- **Automatización de GitHub Actions** para aplicar labels automáticamente

## Flujo de Análisis

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px
    classDef inicioClass fill:#059669,color:white,stroke:#047857,stroke-width:2px
    classDef finClass fill:#374151,color:white,stroke:#1f2937,stroke-width:2px
    classDef rejectClass fill:#dc2626,color:white,stroke:#b91c1c,stroke-width:2px

    inicio(("Iniciar Análisis")):::inicioClass
    validar["Validar entorno Git"]:::statementClass
    obtener["Obtener rama actual/especificada"]:::statementClass
    analizar["Construir contexto de análisis"]:::statementClass
    archivos["Obtener archivos modificados"]:::statementClass
    lineas["Calcular líneas agregadas/eliminadas"]:::statementClass
    commits["Extraer mensajes de commits"]:::statementClass
    
    size["Determinar tamaño del cambio"]:::statementClass
    type["Analizar tipo de cambio"]:::statementClass
    scope["Determinar scope del cambio"]:::statementClass
    flags["Evaluar flags especiales"]:::statementClass
    
    formato["Formatear salida"]:::statementClass
    fin(("Mostrar resultados")):::finClass
    
    error["Manejar error"]:::rejectClass

    inicio --> validar
    validar --> obtener
    obtener --> analizar
    analizar --> archivos
    archivos --> lineas
    lineas --> commits
    
    commits --> size
    commits --> type
    commits --> scope
    commits --> flags
    
    size --> formato
    type --> formato
    scope --> formato
    flags --> formato
    
    formato --> fin
    
    validar --> error
    obtener --> error
    analizar --> error
```

## Algoritmo de Detección

### Análisis de Tamaño

El algoritmo evalúa el tamaño basándose en dos métricas principales:

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px

    analisis["Analizar cambios"]:::statementClass
    lineas{"Total líneas < 50 AND archivos ≤ 3?"}:::conditionalClass
    medianas{"Total líneas < 200 AND archivos ≤ 10?"}:::conditionalClass
    
    small["size:small (85% confianza)"]:::statementClass
    medium["size:medium (75% confianza)"]:::statementClass
    large["size:large (90% confianza)"]:::statementClass

    analisis --> lineas
    lineas -->|Sí| small
    lineas -->|No| medianas
    medianas -->|Sí| medium
    medianas -->|No| large
```

### Análisis de Tipo

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef conditionalClass fill:#ea580c,color:white,stroke:#c2410c,stroke-width:2px

    commits["Analizar mensajes de commits"]:::statementClass
    
    bug["Patrones: fix, bug, hotfix → type:bug"]:::statementClass
    feature["Patrones: feat, feature, add → type:feature"]:::statementClass
    docs["Patrones: docs, documentation → type:docs"]:::statementClass
    refactor["Patrones: refactor, restructure → type:refactor"]:::statementClass
    test["Patrones: test, spec → type:test"]:::statementClass
    chore["Patrones: chore, maintenance → type:chore"]:::statementClass

    commits --> bug
    commits --> feature
    commits --> docs
    commits --> refactor
    commits --> test
    commits --> chore
```

## Arquitectura de Componentes

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } } }%%
flowchart TB
    classDef statementClass fill:#2563eb,color:white,stroke:#1d4ed8,stroke-width:2px
    classDef dbClass fill:#4338ca,color:white,stroke:#3730a3,stroke-width:2px

    subgraph "Command Layer"
        cmd["suggest.ts"]:::statementClass
    end

    subgraph "Core Logic"
        index["index.ts - Orchestrator"]:::statementClass
        utils["utils.ts - Git Operations"]:::statementClass
        analyzers["analyzers.ts - Label Logic"]:::statementClass
        formatters["formatters.ts - Output"]:::statementClass
    end

    subgraph "Data Layer"
        types["types.ts - Interfaces"]:::dbClass
        context["AnalysisContext"]:::dbClass
        suggestions["SuggestedLabels"]:::dbClass
    end

    cmd --> index
    index --> utils
    index --> analyzers
    index --> formatters
    
    utils --> types
    analyzers --> types
    formatters --> types
    
    types --> context
    types --> suggestions
```

## Formatos de Salida

### CSV (Automatización)
Ideal para scripts y pipelines:
```
size:large,type:feature,scope:api,dependencies-updated
```

### JSON (Análisis Detallado)
Proporciona información completa con confianza y metadatos:
```json
{
  "labels": [
    {
      "name": "size:medium",
      "confidence": 75,
      "description": "Medium change: 150 lines, 5 files"
    }
  ],
  "flags": {
    "breakingChange": false,
    "dependencies": true
  }
}
```

### Table (Revisión Visual)
Formato estructurado para revisión humana con códigos de color y organización clara.

## Integración con CI/CD

### GitHub Actions
```yaml
- name: Suggest PR Labels
  run: |
    LABELS=$(projex pull-request labels suggest --format csv)
    echo "suggested-labels=$LABELS" >> $GITHUB_OUTPUT
```

### Script de Automatización
```bash
#!/bin/bash
# Obtener labels sugeridos
LABELS=$(projex pull-request labels suggest --format csv)

# Convertir a array
IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"

# Aplicar labels (ejemplo con gh CLI)
for label in "${LABEL_ARRAY[@]}"; do
  gh pr edit --add-label "$label"
done
```

## Configuración y Personalización

El comando detecta automáticamente:
- **Rama actual** si no se especifica `--branch`
- **Rama objetivo** con auto-detección inteligente (busca `main`, `master`, `develop`, `dev` en ese orden) o configurable con `--target`
- **Formato de salida** personalizable según el caso de uso

### Auto-detección de Rama Principal

El comando utiliza un algoritmo inteligente para detectar la rama principal del repositorio:

1. **Búsqueda local**: Verifica si existen ramas comunes (`main`, `master`, `develop`, `dev`) localmente
2. **Búsqueda remota**: Si no encuentra localmente, busca en `origin` remoto
3. **HEAD remoto**: Intenta obtener la rama por defecto desde `refs/remotes/origin/HEAD`
4. **Fallback**: Usa `main` como último recurso

Esto asegura compatibilidad con diferentes convenciones de naming:
- Repositorios modernos que usan `main`
- Repositorios legacy que usan `master`
- Flujos de trabajo que usan `develop` como rama principal
- Configuraciones personalizadas

## Consideraciones de Rendimiento

- **Análisis local**: No requiere conexión a APIs externas
- **Cache de git**: Utiliza comandos git nativos optimizados
- **Procesamiento eficiente**: Análisis en memoria sin archivos temporales
- **Escalabilidad**: Funciona eficientemente con repositorios grandes

## Limitaciones Conocidas

1. **Dependencia de Git**: Requiere repositorio git válido
2. **Mensajes de commit**: La calidad del análisis depende de mensajes descriptivos
3. **Patrones de archivos**: Reconoce patrones comunes pero puede necesitar ajustes para proyectos específicos
4. **Idioma**: Optimizado para mensajes en inglés, soporte limitado para otros idiomas
