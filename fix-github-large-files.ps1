param(
    [switch]$NoPush
)

$ErrorActionPreference = "Stop"

function Run-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)

    & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Falló: git $($Args -join ' ')"
    }
}

Write-Host ""
Write-Host "=== Limpiando archivos grandes del commit local ===" -ForegroundColor Cyan

# Debe ejecutarse desde la raíz del repo.
if (-not (Test-Path ".git")) {
    throw "No encuentro .git. Ejecutá este .ps1 desde la raíz del repositorio."
}

# Evita mezclar cambios locales no commiteados con la reescritura.
$status = (& git status --porcelain)
if ($LASTEXITCODE -ne 0) {
    throw "No pude leer el estado de Git."
}
if ($status) {
    Write-Host ""
    Write-Host "Hay cambios locales sin commitear:" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "  $_" }
    throw "Abortado para no mezclar cambios. Committeá o guardá esos cambios y volvé a ejecutar."
}

$branch = (& git branch --show-current).Trim()
if (-not $branch) {
    throw "No pude determinar la rama actual."
}

Write-Host "Rama actual: $branch"

Run-Git fetch origin

# Usa el upstream configurado; si no existe, asume origin/<rama>.
$upstream = (& git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $upstream) {
    $upstream = "origin/$branch"
} else {
    $upstream = $upstream.Trim()
}

$aheadText = (& git rev-list --count "$upstream..HEAD").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "No pude comparar HEAD con $upstream."
}

$ahead = [int]$aheadText

# Este script está pensado para el estado actual: 1 commit local todavía no pusheado.
# Así podemos enmendarlo y sacar los blobs >100 MB de su historia antes del push.
if ($ahead -ne 1) {
    throw "Esperaba exactamente 1 commit local por delante de $upstream, pero encontré $ahead. No toqué nada."
}

$largeFiles = @(
    "data/fuentes/tasas/bcra/tas1_ser.txt",
    "data/fuentes/tasas/bcra/tas2_ser.txt"
)

# Agrega las rutas exactas al .gitignore sin duplicarlas.
if (-not (Test-Path ".gitignore")) {
    New-Item -ItemType File -Path ".gitignore" | Out-Null
}

$existingLines = @(Get-Content ".gitignore" -ErrorAction SilentlyContinue)

$entriesToAdd = @()
foreach ($file in $largeFiles) {
    if ($existingLines -notcontains $file) {
        $entriesToAdd += $file
    }
}

if ($entriesToAdd.Count -gt 0) {
    Add-Content ".gitignore" ""
    Add-Content ".gitignore" "# Fuentes BCRA demasiado grandes para GitHub"
    foreach ($entry in $entriesToAdd) {
        Add-Content ".gitignore" $entry
        Write-Host "Ignorando: $entry" -ForegroundColor Green
    }
} else {
    Write-Host "Las rutas ya estaban en .gitignore." -ForegroundColor DarkGray
}

# Los deja físicamente en disco, pero los quita del índice de Git.
foreach ($file in $largeFiles) {
    & git rm --cached --ignore-unmatch -- $file
    if ($LASTEXITCODE -ne 0) {
        throw "No pude quitar '$file' del índice."
    }
}

Run-Git add .gitignore

Write-Host ""
Write-Host "Reescribiendo el último commit local para que los archivos grandes nunca formen parte del push..." -ForegroundColor Cyan
Run-Git commit --amend --no-edit

# Verificación: ninguno de los archivos debe seguir trackeado.
foreach ($file in $largeFiles) {
    & git ls-files --error-unmatch -- $file *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "Verificación fallida: '$file' todavía está trackeado."
    }
}

Write-Host ""
Write-Host "OK: los .txt grandes quedaron locales e ignorados por Git." -ForegroundColor Green
Write-Host "El commit fue corregido antes de llegar a GitHub." -ForegroundColor Green

if (-not $NoPush) {
    Write-Host ""
    Write-Host "Haciendo push a origin/$branch..." -ForegroundColor Cyan
    Run-Git push origin $branch
    Write-Host ""
    Write-Host "Listo. GitHub debería aceptar el push y Netlify podrá desplegar el commit nuevo." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push omitido por -NoPush." -ForegroundColor Yellow
    Write-Host "Cuando quieras: git push origin $branch"
}
