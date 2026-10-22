@echo off
cd /d "%~dp0"
echo Open http://localhost:8000 in your browser.
echo Press Ctrl+C to stop the server.
py -3 -m http.server 8000 --bind 127.0.0.1 --directory dist
pause
