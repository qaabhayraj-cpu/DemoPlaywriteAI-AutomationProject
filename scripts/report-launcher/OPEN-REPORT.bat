@echo off
REM Double-click this file to view the Allure report correctly.
REM
REM Why you can't just open index.html: Allure loads its test data via
REM fetch(), and every browser blocks fetch() against the file:// protocol.
REM Opening index.html directly always shows a "data could not be loaded"
REM error -- this script serves the report over a real local HTTP server
REM instead, which is the only way Allure reports work when downloaded.

cd /d "%~dp0"

set PORT=8080

echo Starting local report server at http://localhost:%PORT%
echo Leave this window open while viewing the report.
echo Press Ctrl+C here to stop the server when you're done.
echo.

start "" "http://localhost:%PORT%"

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server %PORT%
    goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
    npx --yes http-server . -p %PORT%
    goto :eof
)

echo Neither python nor npx/node was found on this machine.
echo Install one of them, then double-click this file again.
pause
