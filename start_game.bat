@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 launch.py
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Please install Python 3, then run this file again.
  ) else (
      python launch.py
  )
)
pause
