#!/usr/bin/env bash
# setup_frontend.sh — Install Node deps and start React dev server

set -e

echo "═══════════════════════════════════════"
echo "  FaceLock Frontend Setup"
echo "═══════════════════════════════════════"

cd "$(dirname "$0")"

echo "→ Installing Node dependencies..."
npm install

echo ""
echo "→ Starting React dev server on http://localhost:3000"
echo ""
npm run dev
