@echo off

:: Step 1: Set up the server
echo Setting up the server...
cd C:\Users\jryan\Desktop\crypto-slots\server

:: Install dependencies
echo Installing server dependencies...
npm install

:: Create .env file from .env.example (without using sed)
echo Creating .env file...
copy .env.example .env

:: Replace API_URL in .env file using PowerShell (native Windows way)
echo Updating .env file with correct API_URL...
powershell -Command "(Get-Content .env) -replace 'API_URL=.*', 'API_URL=http://localhost:5000' | Set-Content .env"

:: Step 2: Start the server in development mode
echo Starting the server...
npm run dev

:: Step 3: Set up the client
echo Setting up the client...
cd C:\Users\jryan\Desktop\crypto-slots\client

:: Install client dependencies
echo Installing client dependencies...
npm install

:: Update the config.js file (set API_URL)
echo Updating config.js file with server URL...
powershell -Command "(Get-Content config.js) -replace 'API_URL=.*', 'API_URL=http://localhost:5000' | Set-Content config.js"

:: Step 4: Start the client in development mode
echo Starting the client...
npm start

echo Setup Complete!
pause
