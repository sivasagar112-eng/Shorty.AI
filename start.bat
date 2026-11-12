@echo off
title Shorty.AI - Viral Video Clipper
echo ===================================================
echo           Starting Shorty.AI Server...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Python packages...
python -m pip install -q -r requirements.txt

echo [2/2] Launching server at http://localhost:5000...
start "" "http://localhost:5000"
if exist server.py (
    python server.py
) else (
    python Shorty.AI\server.py
)

pause

