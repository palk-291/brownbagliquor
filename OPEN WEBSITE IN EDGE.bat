@echo off
setlocal
cd /d "%~dp0"
set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" "%~dp0index.html"
) else (
  echo Microsoft Edge was not found in its standard install location.
  echo Opening the website in your default browser instead...
  start "" "%~dp0index.html"
)
endlocal
