# Requires admin
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Warning "⚠️  Please run this script as Administrator!"
    pause
    exit
}

Write-Host "🚀 Cleaning traces, refreshing IP, and randomizing MAC..." -ForegroundColor Cyan

# ===============================
# 1. Clear Browser Cache (Chrome)
# ===============================
# $chromePaths = @(
#     "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache",
#     "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cookies",
#     "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\History"
# )

# foreach ($path in $chromePaths) {
#     if (Test-Path $path) {
#         Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
#         Write-Host "🧹 Deleted: $path"
#     }
# }

# ===============================
# 2. Clear Firefox Cache
# ===============================
$firefoxProfiles = Get-ChildItem "$env:APPDATA\Mozilla\Firefox\Profiles\" -Directory | Where-Object { $_.Name -like "*.default*" }

foreach ($profile in $firefoxProfiles) {
    $cachePath = Join-Path $profile.FullName "cache2"
    $cookieFile = Join-Path $profile.FullName "cookies.sqlite"
    if (Test-Path $cachePath) { Remove-Item $cachePath -Recurse -Force }
    if (Test-Path $cookieFile) { Remove-Item $cookieFile -Force }
    Write-Host "🧹 Cleaned Firefox profile: $($profile.Name)"
}

# ===============================
# 3. Flush DNS
# ===============================
Write-Host "🧹 Flushing DNS..."
ipconfig /flushdns

# ===============================
# 4. List network adapters
# ===============================
Write-Host "`nAvailable Network Adapters:"
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
$adapters | ForEach-Object { Write-Host "  [$($_.InterfaceIndex)] $($_.Name)" }

$choice = Read-Host "`nEnter the Interface Index of the adapter you want to spoof (e.g., 4)"
$adapter = Get-NetAdapter | Where-Object { $_.InterfaceIndex -eq $choice }

if (-not $adapter) {
    Write-Warning "❌ No adapter found with that index. Exiting."
    exit
}

# ===============================
# 5. Generate Random MAC
# ===============================
Function Generate-MAC {
    $rand = -join ((0..5) | ForEach-Object { '{0:X2}' -f (Get-Random -Minimum 0 -Maximum 256) })
    return "02" + $rand.Substring(2)
}

$newMAC = Generate-MAC
Write-Host "🎭 Spoofing MAC address for $($adapter.Name)..."
Write-Host "   ➤ New MAC: $newMAC"

Set-NetAdapter -Name $adapter.Name -MacAddress $newMAC -Confirm:$false

# Restart adapter to apply MAC
Disable-NetAdapter -Name $adapter.Name -Confirm:$false
Start-Sleep -Seconds 3
Enable-NetAdapter -Name $adapter.Name -Confirm:$false

Start-Sleep -Seconds 3
ipconfig /renew

# Show new MAC & IP
$updatedAdapter = Get-NetAdapter | Where-Object { $_.Name -eq $adapter.Name }
$ip = (Get-NetIPAddress -InterfaceIndex $updatedAdapter.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress

Write-Host "`n✅ Done!"
Write-Host "   Adapter : $($updatedAdapter.Name)"
Write-Host "   New MAC : $($updatedAdapter.MacAddress)"
Write-Host "   New IP  : $ip"
pause
