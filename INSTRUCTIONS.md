# Crypto Slots - Setup and Running Instructions

This document provides instructions on how to set up and run the Crypto Slots application.

## Project Overview

Crypto Slots is a mobile application that combines slot machine gameplay with cryptocurrency integration. Users can play slot machines, upgrade their machines, and invest their earnings in cryptocurrency.

### Key Features

- Slot machine gameplay with random rewards
- Cryptocurrency integration (Bitcoin, Ethereum, etc.)
- User profile system with authentication
- Upgrades and rewards system
- Cloud server integration
- Monetization through in-app purchases and transaction fees

## Project Structure

The project is divided into two main parts:

1. **Server**: A Node.js backend with Express that handles game logic, user management, and cryptocurrency operations.
2. **Client**: A React Native mobile application that provides the user interface.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or cloud service)
- Expo CLI (for React Native development)

## Setup Instructions

### Server Setup

1. Navigate to the server directory:
   ```
   cd crypto-slots/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Add API keys for cryptocurrency services (Coinbase, Binance, etc.)

5. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd crypto-slots/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the `config.js` file with your server URL:
   ```javascript
   // Update API_URL to point to your server
   export const API_URL = 'http://localhost:5000';
   ```

4. Start the Expo development server:
   ```
   npm start
   ```

5. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator/simulator.

## Running the Application

### Development Mode

1. Start the server in development mode:
   ```
   cd crypto-slots/server
   npm run dev
   ```

2. Start the client in development mode:
   ```
   cd crypto-slots/client
   npm start
   ```

### Production Mode

For production deployment:

1. Build the server:
   ```
   cd crypto-slots/server
   npm run build
   ```

2. Start the server in production mode:
   ```
   npm start
   ```

3. Build the client for production:
   ```
   cd crypto-slots/client
   npm run build
   ```

## Testing the Application

### Server Tests

Run server tests:
```
cd crypto-slots/server
npm test
```

### Client Tests

Run client tests:
```
cd crypto-slots/client
npm test
```

## API Documentation

The server provides the following API endpoints:

- **Authentication**: `/api/auth/*` - User registration, login, and authentication
- **Game**: `/api/game/*` - Slot machine gameplay, machine management
- **Crypto**: `/api/crypto/*` - Cryptocurrency operations
- **Upgrades**: `/api/upgrades/*` - Slot machine upgrades

For detailed API documentation, refer to the server code and comments.

## Troubleshooting

- **Server Connection Issues**: Ensure MongoDB is running and the connection string is correct.
- **Client-Server Communication**: Check that the API_URL in the client config.js points to the correct server address.
- **Cryptocurrency API Issues**: Verify that your API keys for cryptocurrency services are valid and have the necessary permissions.

## Next Steps for Development

1. Implement real cryptocurrency transactions using actual wallet services
2. Add more slot machine types and themes
3. Enhance the upgrade system with more options
4. Implement social features like leaderboards and friend challenges
5. Add more analytics and tracking for user behavior

## License

This project is for demonstration purposes only and is not licensed for commercial use.