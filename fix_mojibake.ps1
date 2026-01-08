
$files = Get-ChildItem -Path "c:\Users\hp\Desktop\workspace\adminRole\frontend\sheildsupport" -Recurse -Filter *.html

foreach ($file in $files) {
    # Read as UTF8 to capture the multi-byte chars correctly if possible, or Default if it was saved that way.
    # Since my previous script saved as UTF8, I should read as UTF8.
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Replace Mojibake copyright
    if ($content -match 'Â©') {
        $content = $content -replace 'Â©', '&copy;'
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed Mojibake in: $($file.Name)"
    }
}
