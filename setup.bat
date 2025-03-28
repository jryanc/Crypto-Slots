@echo off
echo ===================================
echo Installing Crypto Slots Dependencies
echo ===================================
echo.

echo Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo Setup complete! You can now run the application using start-dev.bat
echo.
pause