$files = Get-ChildItem -Path src -Filter *.tsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Replace common low-contrast styles
    # Replace var(--secondary) as a color with var(--foreground)
    $content = $content -replace "color: 'var\(--secondary\)'", "color: 'var(--foreground)'"
    $content = $content -replace "color: `"var\(--secondary\)`"", "color: 'var(--foreground)'"
    
    # Replace secondary-foreground if it was used anywhere (it shouldn't be now but just in case)
    $content = $content -replace "color: 'var\(--secondary-foreground\)'", "color: 'var(--foreground)'"
    
    # Replace #ccc and other greys used in inline styles
    $content = $content -replace "color: '#ccc'", "color: 'var(--foreground)'"
    $content = $content -replace "color: '#888'", "color: 'var(--foreground)'"
    $content = $content -replace "color: '#999'", "color: 'var(--foreground)'"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
}

Write-Host "Replaced all low-contrast grey colors with var(--foreground)!"
