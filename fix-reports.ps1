# Script PowerShell para corregir Reports.js
$filePath = "C:\Users\USUARIO\proyectos\big-arte\frontend\src\pages\Reports.js"

Write-Host "Corrigiendo archivo Reports.js..." -ForegroundColor Yellow

# Crear backup
$backupPath = $filePath -replace "\.js$", "_backup.js"
Copy-Item $filePath $backupPath
Write-Host "Backup creado: $backupPath" -ForegroundColor Green

# Leer contenido
$content = Get-Content $filePath -Raw

# Buscar y corregir la línea problemática
$correctedContent = $content -replace 'export default Reports;\.profit\?\?\.profit_margin.*', 'export default Reports;'

# Verificar si se hizo algún cambio
if ($content -ne $correctedContent) {
    # Guardar archivo corregido
    $correctedContent | Set-Content $filePath -Encoding UTF8
    Write-Host "Archivo corregido exitosamente!" -ForegroundColor Green
} else {
    Write-Host "No se encontró el problema específico." -ForegroundColor Yellow
}

Write-Host "Proceso completado." -ForegroundColor Cyan
