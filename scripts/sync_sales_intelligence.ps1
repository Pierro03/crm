$ErrorActionPreference = "Stop"
$repository = Split-Path -Parent $PSScriptRoot

Push-Location $repository
try {
    & bun.cmd run db:import-sales-intelligence
    if ($LASTEXITCODE -ne 0) {
        throw "SalesIntelligence import failed."
    }
} finally {
    Pop-Location
}
