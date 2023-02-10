function Exit-Script {
    param ([int]$ExitCode, [string]$Message)

    Pop-Location

    [console]::beep(500, 300)

    Write-Output "$Message - Total Time Elapsed: ($($timerAll.Elapsed.ToString().Substring(0,12))"
    exit $ExitCode
}

function Write-Time {
    Write-Output "Completed - Time Elapsed: $($timer.Elapsed.ToString().Substring(0,12))"
}

Push-Location $PSScriptRoot

$timerAll = [System.Diagnostics.Stopwatch]::StartNew()
$timer = [System.Diagnostics.Stopwatch]::StartNew()

Push-Location .\geekrankerweb

$timer.Restart()

npm run build

Write-Time

Pop-Location

if ($LASTEXITCODE -ne 0) {
    Exit-Script $LASTEXITCODE "Failed"
}

$timer.Restart()

gcloud app deploy --quiet .\geekrankerweb\app.yaml

Write-Time

if ($LASTEXITCODE -ne 0) {
    Exit-Script $LASTEXITCODE "Failed"
}

Exit-Script 0 "Succeeded"
