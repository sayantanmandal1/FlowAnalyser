@echo off
echo ========================================
echo Database Initialization Script
echo ========================================
echo.

echo Step 1: Checking database status...
curl https://flowanalyser2.onrender.com/api/seed/status
echo.
echo.

echo Step 2: Initializing database...
curl -X POST https://flowanalyser2.onrender.com/api/seed/initialize
echo.
echo.

echo Step 3: Verifying analytics endpoint...
curl https://flowanalyser2.onrender.com/api/analytics/stats
echo.
echo.

echo ========================================
echo Done! Check the output above.
echo ========================================
pause
