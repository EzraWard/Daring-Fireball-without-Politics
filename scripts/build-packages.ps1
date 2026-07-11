param(
  [string]$FirefoxExtensionId = "daring-fireball-without-politics@example.com",
  [string]$FirefoxMinVersion = "126.0"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceDir = Join-Path $repoRoot "src\daring-fireball-without-politics"
$distDir = Join-Path $repoRoot "dist"
$utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false

if (Test-Path $distDir) {
  Remove-Item $distDir -Recurse -Force
}

New-Item -ItemType Directory -Path $distDir | Out-Null

$browsers = @("chrome", "edge", "firefox")

foreach ($browser in $browsers) {
  $targetDir = Join-Path $distDir $browser
  New-Item -ItemType Directory -Path $targetDir | Out-Null
  Copy-Item -Path (Join-Path $sourceDir "*") -Destination $targetDir -Recurse

  if ($browser -eq "firefox") {
    $manifestPath = Join-Path $targetDir "manifest.json"
    $manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json

    $manifest.background = @{
      scripts = @("shared.js", "background.js")
    }

    $manifest | Add-Member -NotePropertyName browser_specific_settings -NotePropertyValue @{
      gecko = @{
        id = $FirefoxExtensionId
        strict_min_version = $FirefoxMinVersion
        data_collection_permissions = @{
          required = @("none")
        }
      }
      gecko_android = @{
        strict_min_version = $FirefoxMinVersion
      }
    } -Force

    [System.IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 10), $utf8NoBom)
  }

  $zipPath = Join-Path $distDir ("daring-fireball-without-politics-{0}.zip" -f $browser)
  Compress-Archive -Path (Join-Path $targetDir "*") -DestinationPath $zipPath -CompressionLevel Optimal
}

Write-Host "Created browser packages in $distDir"
