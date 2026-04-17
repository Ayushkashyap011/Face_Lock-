#!/usr/bin/env bash
# setup_backend.sh — Install Python deps and start FastAPI server

set -e

echo "═══════════════════════════════════════"
echo "  FaceLock Backend Setup"
echo "═══════════════════════════════════════"

cd "$(dirname "$0")"

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

echo "→ Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo ""
echo "→ Starting FastAPI server on http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
