# Read all lines from the file
$lines = Get-Content ".\Automate\Employeed.csv"

# Process each line except the header
$newLines = @($lines[0])  # Add header to new array
$newLines += $lines[1..$lines.Length] | ForEach-Object {
    # Remove space and dot just before the first comma
    $_ -replace "^([^,]+)\s*\.,", '$1,'
}

# Write back to file
$newLines | Set-Content ".\Automate\Employeed.csv"
