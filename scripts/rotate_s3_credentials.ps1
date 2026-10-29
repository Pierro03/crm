$ErrorActionPreference = "Stop"
$profile = "etg-crm-s3"
$userName = "etg-crm-storage"
$oldAccessKey = (aws configure get aws_access_key_id --profile $profile).Trim()
$oldSecretKey = (aws configure get aws_secret_access_key --profile $profile).Trim()
$newAccessKey = $null
$newSecretKey = $null

if (-not $oldAccessKey -or -not $oldSecretKey) {
    throw "The etg-crm-s3 profile has no access key."
}

try {
    $createdJson = & aws iam create-access-key --user-name $userName --profile $profile
    if ($LASTEXITCODE -ne 0) {
        throw "AWS failed to create a replacement access key."
    }

    $created = $createdJson | ConvertFrom-Json
    $newAccessKey = $created.AccessKey.AccessKeyId
    $newSecretKey = $created.AccessKey.SecretAccessKey
    if (-not $newAccessKey -or -not $newSecretKey) {
        throw "AWS returned an incomplete replacement access key."
    }

    & aws configure set aws_access_key_id $newAccessKey --profile $profile
    if ($LASTEXITCODE -ne 0) {
        throw "AWS failed to store the replacement access key."
    }

    & aws configure set aws_secret_access_key $newSecretKey --profile $profile
    if ($LASTEXITCODE -ne 0) {
        throw "AWS failed to store the replacement secret key."
    }

    $verified = $false
    for ($attempt = 1; $attempt -le 6; $attempt++) {
        cmd.exe /c "aws sts get-caller-identity --profile etg-crm-s3 1>nul 2>nul"
        if ($LASTEXITCODE -eq 0) {
            $verified = $true
            break
        }
        Start-Sleep -Seconds 5
    }
    if (-not $verified) {
        throw "The replacement access key did not become active."
    }

    & aws iam delete-access-key --user-name $userName --access-key-id $oldAccessKey --profile $profile
    if ($LASTEXITCODE -ne 0) {
        throw "AWS failed to remove the previous access key."
    }

    Write-Output "Rotated etg-crm-s3 credentials at $([DateTimeOffset]::UtcNow.ToString('O'))."
} catch {
    & aws configure set aws_access_key_id $oldAccessKey --profile $profile
    & aws configure set aws_secret_access_key $oldSecretKey --profile $profile
    if ($newAccessKey) {
        & aws iam delete-access-key --user-name $userName --access-key-id $newAccessKey --profile $profile 2>$null
    }
    throw
} finally {
    Remove-Variable oldSecretKey, newSecretKey
}
