# Uso en Azure DevOps y CI/CD

## Problema Común en Azure DevOps

Cuando se ejecuta `projex pull-request labels suggest` en Azure DevOps como parte de un build validation de PR, es común encontrar el error:

```bash
✖ Failed to get changed files between master and develop  
✖ Make sure both branches exist and are accessible  
✖ Failed to suggest labels
```

Esto ocurre porque Azure DevOps por defecto solo hace checkout de la rama de origen (feature branch), sin traer información de la rama principal (main/master).

## Solución Automática

### Opción 1: Fetch Automático (Recomendado)

La versión más reciente del comando incluye **fetch automático inteligente**:

```bash
# Funciona automáticamente - detecta y fetch la rama principal
projex pull-request labels suggest --format csv --verbose
```

El comando:
1. **Auto-detecta** la rama principal (`main`, `master`, `develop`, `dev`)
2. **Verifica** si está disponible localmente
3. **Fetch automático** desde el remote si no está disponible
4. **Manejo robusto** de referencias remotas

### Opción 2: Pipeline Configuration

Si prefieres controlar el fetch manualmente en tu pipeline:

#### Azure DevOps YAML:

```yaml
steps:
- checkout: self
  fetchDepth: 0  # Importante: fetch full history
  
- script: |
    git fetch origin main:main  # O master:master según tu repo
    projex pull-request labels suggest --format csv --no-fetch
  displayName: 'Get PR Labels'
```

#### GitHub Actions:

```yaml
steps:
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Importante: fetch full history
    
- run: |
    git fetch origin main:main
    projex pull-request labels suggest --format csv --no-fetch
```

## Opciones del Comando

### Flags Útiles para CI/CD

- `--no-fetch`: Deshabilita el fetch automático
- `--target <branch>`: Especifica rama principal explícitamente
- `--format csv`: Formato ideal para procesamiento en pipelines
- `--verbose`: Muestra información detallada para debugging

### Ejemplos de Uso

```bash
# Auto-detección completa (recomendado)
projex pull-request labels suggest --format csv

# Especificar rama principal explícitamente
projex pull-request labels suggest --target master --format csv

# Sin fetch automático (requiere setup manual)
projex pull-request labels suggest --format csv --no-fetch

# Con verbose para debugging
projex pull-request labels suggest --format csv --verbose
```

## Automatización en Pipelines

### Aplicar Labels Automáticamente

```bash
# Obtener labels sugeridos
LABELS=$(projex pull-request labels suggest --format csv)

# Aplicar via GitHub CLI
echo $LABELS | tr ',' '\n' | while read label; do
  gh pr edit $PR_NUMBER --add-label "$label"
done

# Aplicar via Azure DevOps REST API
curl -X PATCH "$SYSTEM_TEAMFOUNDATIONCOLLECTIONURI$SYSTEM_TEAMPROJECT/_apis/git/repositories/$BUILD_REPOSITORY_ID/pullRequests/$SYSTEM_PULLREQUEST_PULLREQUESTID/labels" \
  -H "Authorization: Bearer $SYSTEM_ACCESSTOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"value\": [\"$LABELS\"]}"
```

### Variables de Pipeline

Puedes usar variables de entorno para configurar el comportamiento:

```bash
# En tu pipeline
export PROJEX_TARGET_BRANCH=${SYSTEM_PULLREQUEST_TARGETBRANCH:-main}
projex pull-request labels suggest --target $PROJEX_TARGET_BRANCH --format csv
```

## Troubleshooting

### Error: "Branch not found"

```bash
# Verificar branches disponibles
git branch -a

# Fetch manual si es necesario
git fetch origin

# Usar verbose para más información
projex pull-request labels suggest --verbose
```

### Error: "No network access"

```bash
# Usar --no-fetch y setup manual
git fetch origin main:main
projex pull-request labels suggest --no-fetch
```

### Shallow Clone Issues

Algunos runners de CI usan shallow clones que pueden causar problemas:

```yaml
# Azure DevOps
- checkout: self
  fetchDepth: 0  # Resuelve shallow clone issues

# GitHub Actions  
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

## Best Practices

1. **Usar fetch automático**: Simplifica la configuración del pipeline
2. **Formato CSV para automation**: Más fácil de procesar programáticamente
3. **Verbose para debugging**: Ayuda a identificar problemas de configuración
4. **Cache de git objects**: Mejora performance en pipelines repetitivos
5. **Error handling**: Siempre incluir manejo de errores en scripts de pipeline

## Ejemplo Completo - Azure DevOps

```yaml
trigger:
  branches:
    include:
    - main
    - develop

pr:
  branches:
    include:
    - main
    - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
- checkout: self
  fetchDepth: 0
  persistCredentials: true

- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

- script: |
    npm install -g projex
  displayName: 'Install Projex CLI'

- script: |
    echo "Getting suggested labels from projex..."
    LABELS=$(projex pull-request labels suggest --format csv --verbose)
    echo "Suggested labels: $LABELS"
    echo "##vso[task.setvariable variable=suggestedLabels]$LABELS"
  displayName: 'Get PR Labels'
  condition: and(succeeded(), eq(variables['Build.Reason'], 'PullRequest'))

- script: |
    echo "Labels to apply: $(suggestedLabels)"
    # Aquí puedes agregar lógica para aplicar los labels
  displayName: 'Apply Labels'
  condition: and(succeeded(), ne(variables['suggestedLabels'], ''))
```
