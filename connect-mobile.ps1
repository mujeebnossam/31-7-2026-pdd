# SpendWise AI - USB Mobile Auto-Display Bridge
# Automatically forwards web ports (5173 & 3001) over USB and launches the website on Android

$adbPath = (Get-Command adb -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
if (-not $adbPath) {
    $fallbackAdb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $fallbackAdb) {
        $adbPath = $fallbackAdb
    } else {
        Write-Host "Error: adb.exe could not be found." -ForegroundColor Red
        exit 1
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SpendWise AI - USB Mobile Auto-Display Bridge" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Using ADB: $adbPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Connect your Android phone to this laptop with a USB cable." -ForegroundColor Yellow
Write-Host "2. Enable 'USB Debugging' on the phone (Settings -> Developer Options -> USB Debugging)." -ForegroundColor Yellow
Write-Host "3. Unlock your phone and tap 'Allow' when the USB debugging prompt appears." -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting for Android mobile device to connect over USB..." -ForegroundColor DarkYellow

while ($true) {
    # Check for connected devices using adb devices
    $rawDevices = & $adbPath devices
    $deviceLines = @($rawDevices | Where-Object { 
        $_ -and ($_ -notmatch "List of devices attached") -and ($_ -notmatch "^\*")
    })

    $authorizedDevice = $null
    $unauthorizedFound = $false

    foreach ($line in $deviceLines) {
        if ($line -match "^([^\s]+)\s+device$") {
            $authorizedDevice = $matches[1]
            break
        } elseif ($line -match "^([^\s]+)\s+unauthorized$") {
            $unauthorizedFound = $true
        }
    }

    if ($authorizedDevice) {
        $model = (& $adbPath -s $authorizedDevice shell getprop ro.product.model).Trim()
        Write-Host ""
        Write-Host "[+] Android device connected: $model ($authorizedDevice)" -ForegroundColor Green
        Write-Host "[*] Configuring reverse port forwarding for 5173 and 3001..." -ForegroundColor Cyan

        & $adbPath -s $authorizedDevice reverse tcp:5173 tcp:5173
        & $adbPath -s $authorizedDevice reverse tcp:3001 tcp:3001

        Write-Host "[*] Launching SpendWise AI in mobile browser..." -ForegroundColor Green
        & $adbPath -s $authorizedDevice shell am start -a android.intent.action.VIEW -d "http://localhost:5173"

        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host " [SUCCESS] Web app is now displayed on your mobile phone! " -ForegroundColor Green
        Write-Host " URL on mobile: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Keep this running. If you disconnect and reconnect, it will auto-reopen." -ForegroundColor Gray

        # Wait while this device stays connected
        while ($true) {
            Start-Sleep -Seconds 3
            $state = (& $adbPath -s $authorizedDevice get-state 2>&1)
            if ($state -ne "device") {
                Write-Host "[-] Device disconnected. Waiting for connection..." -ForegroundColor DarkYellow
                break
            }
        }
    } elseif ($unauthorizedFound) {
        Write-Host "[!] Phone is connected via USB, but USB Debugging is not authorized yet." -ForegroundColor Yellow
        Write-Host "    -> Please UNLOCK your phone and tap 'Allow' on the USB Debugging pop-up." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    } else {
        Start-Sleep -Seconds 2
    }
}
