#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
printf '%s\n' 'Open http://localhost:8000 in your browser.' 'Press Ctrl+C to stop the server.'
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
