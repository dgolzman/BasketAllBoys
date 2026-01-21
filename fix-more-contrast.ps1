$files = Get-ChildItem -Path src -Filter *.tsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Replace hardcoded dark-only card styles
    $content = $content -replace "background: '#111'", "background: 'var(--card-bg)'"
    $content = $content -replace 'background: "#111"', "background: 'var(--card-bg)'"
    
    $content = $content -replace "background: '#222'", "background: 'var(--secondary)'"
    $content = $content -replace "background: '#000'", "background: 'var(--background)'"
    $content = $content -replace "background: '#1a1a1a'", "background: 'var(--secondary)'"
    
    $content = $content -replace "border: '1px solid #333'", "border: '1px solid var(--border)'"
    $content = $content -replace "borderBottom: '1px solid #444'", "borderBottom: '1px solid var(--border)'"
    $content = $content -replace "borderBottom: '1px solid #333'", "borderBottom: '1px solid var(--border)'"
    
    $content = $content -replace "color: '#aaa'", "color: 'var(--foreground)'"
    $content = $content -replace "color: '#666'", "color: 'var(--foreground)'"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
}

Write-Host "Replaced more hardcoded dark colors!"
