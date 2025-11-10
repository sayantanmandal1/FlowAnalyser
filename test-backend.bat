@echo off
echo ========================================
echo Backend Health Check
echo ========================================
echo.

echo Testing basic health...
curl https://flowanalyser2.onrender.com/health
echo.
echo.

echo Testing database connection...
curl https://flowanalyser2.onrender.com/db-health
echo.
echo.

echo Testing analytics stats...
curl https://flowanalyser2.onrender.com/api/analytics/stats
echo.
echo.

pause
