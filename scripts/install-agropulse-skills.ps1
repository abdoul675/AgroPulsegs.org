param(
    [string]$InstallRoot = ''
)

$ErrorActionPreference = 'Stop'
$taskProjectRoot = Split-Path -Parent $PSScriptRoot
$taskSourceRoot = Join-Path $taskProjectRoot 'skills'
if ([string]::IsNullOrWhiteSpace($InstallRoot)) {
    if (-not [string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
        $InstallRoot = Join-Path $env:CODEX_HOME 'skills'
    } else {
        $InstallRoot = Join-Path $env:USERPROFILE '.codex/skills'
    }
}
$taskInstallRoot = [System.IO.Path]::GetFullPath($InstallRoot)
$taskSkills = @(Get-ChildItem -LiteralPath $taskSourceRoot -Directory | Where-Object { $_.Name -like 'agropulse-*' })
if ($taskSkills.Count -eq 0) { throw 'Aucun skill AgroPulse trouvé dans le projet.' }

# Check every destination before writing; preserve any locally customized skill.
foreach ($taskSkill in $taskSkills) {
    $taskSourceFile = Join-Path $taskSkill.FullName 'SKILL.md'
    if (-not (Test-Path -LiteralPath $taskSourceFile -PathType Leaf)) { throw "SKILL.md absent : $($taskSkill.Name)" }
    $taskTargetDir = Join-Path $taskInstallRoot $taskSkill.Name
    $taskTargetFile = Join-Path $taskTargetDir 'SKILL.md'
    if (Test-Path -LiteralPath $taskTargetDir) {
        if (-not (Test-Path -LiteralPath $taskTargetFile -PathType Leaf)) { throw "Destination existante incomplète : $taskTargetDir" }
        if ((Get-FileHash -LiteralPath $taskSourceFile -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $taskTargetFile -Algorithm SHA256).Hash) {
            throw "Skill local différent : $taskTargetDir. Aucun remplacement automatique."
        }
    }
}

foreach ($taskSkill in $taskSkills) {
    $taskTargetDir = Join-Path $taskInstallRoot $taskSkill.Name
    $taskTargetFile = Join-Path $taskTargetDir 'SKILL.md'
    if (-not (Test-Path -LiteralPath $taskTargetDir)) {
        New-Item -ItemType Directory -Path $taskTargetDir -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $taskSkill.FullName 'SKILL.md') -Destination $taskTargetFile
    }
    if ((Get-FileHash -LiteralPath (Join-Path $taskSkill.FullName 'SKILL.md') -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $taskTargetFile -Algorithm SHA256).Hash) {
        throw "Échec de vérification : $($taskSkill.Name)"
    }
    Write-Output "Présent et identique : $($taskSkill.Name)"
}
Write-Output "$($taskSkills.Count) skills AgroPulse installés et vérifiés dans $taskInstallRoot"
