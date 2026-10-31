@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo ERROR: Node.js 20 or newer is required. Install from https://nodejs.org/
 pause
 exit /b 1
)
for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set NODE_MAJOR=%%V
if %NODE_MAJOR% LSS 20 (
 echo ERROR: Node.js 20 or newer is required. Found:
 node --version
 pause
 exit /b 1
)
echo SARKSH FOODS V28 - preflight and tests
call npm run check
if errorlevel 1 goto :error
call npm test
if errorlevel 1 goto :error
call npm run doctor
if errorlevel 1 goto :error
echo Opening V28 server. The address is printed below.
echo Stop the server with Ctrl+C when finished.
call npm run dev
endlocal
exit /b 0
:error
echo ERROR: Verification failed. Correct the issue before running the server.
pause
endlocal
exit /b 1
