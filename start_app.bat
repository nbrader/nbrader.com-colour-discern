@echo off

REM Check if port 3000 is in use using PowerShell
powershell -Command "$portInUse = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet; if ($portInUse) { exit 1 } else { exit 0 }"

if %errorlevel% == 1 (
    echo Port 3000 is already in use. Please close any processes using port 3000 and try again.
    pause
) else (
    REM Port is free, start the server
    start cmd /k "yarn node server.js & echo. & echo Press any key to close this window... & pause > nul"

    REM Wait for a short delay to allow the server to start
    timeout /t 10

    REM Open a browser with the correct URL
    start http://localhost:3000
)

exit