#!/bin/bash

# ============================================================================
# Setup Supabase para ClubSenior
# Ejecución: bash scripts/setup-supabase.sh
# ============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 SETUP SUPABASE - ClubSenior                               ║"
echo "║  Tardes de Café, Mente & Saberes                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local no encontrado"
    echo ""
    echo "Por favor, sigue estos pasos:"
    echo "1. Ve a: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api"
    echo "2. Copia 'Project URL' y pégalo en .env.local"
    echo "3. Copia 'anon' key (Publishable) y pégalo en .env.local"
    echo "4. Copia 'service_role' key (Secret) y pégalo en .env.local"
    echo "5. Ejecuta este script nuevamente"
    echo ""
    exit 1
fi

# Verify that env vars are set
if grep -q "YOUR_.*_HERE" .env.local; then
    echo "⚠️  Warning: Encontré placeholders en .env.local"
    echo ""
    echo "Pasos para completar la configuración:"
    echo "1. Ve a: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api"
    echo "2. Reemplaza los valores en .env.local"
    echo "3. Ejecuta: npm run dev"
    echo ""
    echo "Por ahora, crearé la estructura del proyecto..."
fi

echo ""
echo "✅ .env.local encontrado"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js v$(node --version) encontrado"
echo ""

# Install dependencies
echo "📦 Instalando dependencias..."
npm install --silent

# Run type check
echo ""
echo "🔍 Verificando TypeScript..."
npm run typecheck

# Run linter
echo ""
echo "📋 Ejecutando ESLint..."
npm run lint

# Build project
echo ""
echo "🏗️  Construyendo proyecto..."
npm run build

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ SETUP COMPLETADO EXITOSAMENTE                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Pasos finales:"
echo ""
echo "1. Si aún no has configurado .env.local:"
echo "   - Ve a: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api"
echo "   - Copia las credenciales a .env.local"
echo ""
echo "2. Ejecuta las migraciones en Supabase:"
echo "   - Ve a: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql"
echo "   - Haz click en 'New query'"
echo "   - Copia el contenido de: supabase/migrations/001_init_schema.sql"
echo "   - Ejecuta el SQL"
echo ""
echo "3. Inicia el servidor local:"
echo "   npm run dev"
echo ""
echo "4. Abre en tu navegador:"
echo "   http://localhost:3000"
echo ""
