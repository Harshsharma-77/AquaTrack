@echo off
echo =========================================
echo       Starting Alakh Kirpa Server...
echo =========================================
start cmd /k "cd server && node server.js"

echo =========================================
echo       Starting Alakh Kirpa Frontend...
echo =========================================
start cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo If you get an error that "node" is not recognized, please restart your computer so Node.js can finish installing.
echo.
pause
