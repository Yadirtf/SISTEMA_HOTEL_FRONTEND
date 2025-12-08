# Script para crear .env.local con configuración HTTPS
# Uso: powershell -ExecutionPolicy Bypass -File scripts/create-env-local.ps1

$envContent = @"
# Configuración de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCym4qg8Usf2ZkqxrMQ__RzMdsgBfnXQ7k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hotelsesion.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hotelsesion
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hotelsesion.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=115348730814
NEXT_PUBLIC_FIREBASE_APP_ID=1:115348730814:web:448c5526370c9ae690ffef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K3XDG0Y1FC

# Configuración de API con HTTPS
NEXT_PUBLIC_API_BASE_URL=https://localhost:5000
"@

$envPath = Join-Path (Join-Path $PSScriptRoot "..") ".env.local"

if (Test-Path $envPath) {
    Write-Host "⚠️  El archivo .env.local ya existe" -ForegroundColor Yellow
    Write-Host "¿Deseas sobrescribirlo? (S/N): " -NoNewline
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ Archivo .env.local creado/actualizado exitosamente" -ForegroundColor Green
Write-Host "📁 Ubicación: $envPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Próximo paso: Reiniciar el servidor frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan

