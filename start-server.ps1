# Local server for the portfolio. Started by the .bat file next to it.
# ASCII only on purpose: PowerShell 5.1 reads BOM-less .ps1 files in the system codepage.
param([switch]$NoBrowser)   # -NoBrowser: start the server without opening a browser window

$Root = $PSScriptRoot
$Port = 8080

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="application/javascript; charset=utf-8"; ".json"="application/json; charset=utf-8";
  ".webmanifest"="application/manifest+json; charset=utf-8"; ".svg"="image/svg+xml";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp";
  ".gif"="image/gif"; ".ico"="image/x-icon"; ".woff"="font/woff"; ".woff2"="font/woff2";
  ".pdf"="application/pdf"; ".txt"="text/plain; charset=utf-8"; ".md"="text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "  Port $Port is busy - the portfolio is probably already running." -ForegroundColor Yellow
  Write-Host "  Open in browser:  http://localhost:$Port/" -ForegroundColor Yellow
  Write-Host ""
  Start-Sleep 5
  exit
}

Write-Host ""
Write-Host "  PORTFOLIO IS RUNNING" -ForegroundColor Green
Write-Host "  Open in browser:  http://localhost:$Port/" -ForegroundColor Green
Write-Host ""
Write-Host "  To stop: close this black window." -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
    $path = Join-Path $Root $rel
    if (Test-Path $path -PathType Container) { $path = Join-Path $path "index.html" }

    if (Test-Path $path -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.OutputStream.Close()
  } catch { }
}
