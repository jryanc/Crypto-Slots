import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Context
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import TwoFactorAuthScreen from '../screens/auth/TwoFactorAuthScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import SlotMachineScreen from '../screens/SlotMachineScreen';
import CryptoScreen from '../screens/CryptoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ShopScreen from '../screens/ShopScreen';

// Game Screens
import GameSessionScreen from '../screens/game/GameSessionScreen';
import MachineUpgradeScreen from '../screens/game/MachineUpgradeScreen';
import LeaderboardScreen from '../screens/game/LeaderboardScreen';
import AchievementsScreen from '../screens/game/AchievementsScreen';

// Crypto Screens
import CryptoWalletScreen from '../screens/crypto/CryptoWalletScreen';
import CryptoTransactionsScreen from '../screens/crypto/CryptoTransactionsScreen';
import CryptoPortfolioScreen from '../screens/crypto/CryptoPortfolioScreen';
import CryptoExchangeScreen from '../screens/crypto/CryptoExchangeScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

// Shop Screens
import MachineShopScreen from '../screens/shop/MachineShopScreen';
import UpgradeShopScreen from '../screens/shop/UpgradeShopScreen';
import TokenShopScreen from '../screens/shop/TokenShopScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
  </Stack.Navigator>
);

// Home Stack Navigator
const HomeStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="GameSession" component={GameSessionScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
  </Stack.Navigator>
);

// Game Stack Navigator
const GameStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="SlotMachine" component={SlotMachineScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MachineUpgrade" component={MachineUpgradeScreen} />
  </Stack.Navigator>
);

// Crypto Stack Navigator
const CryptoStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="CryptoMain" component={CryptoScreen} options={{ headerShown: false, title: 'Crypto' }} />
    <Stack.Screen name="CryptoWallet" component={CryptoWalletScreen} />
    <Stack.Screen name="CryptoTransactions" component={CryptoTransactionsScreen} />
    <Stack.Screen name="CryptoPortfolio" component={CryptoPortfolioScreen} />
    <Stack.Screen name="CryptoExchange" component={CryptoExchangeScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false, title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

// Shop Stack Navigator
const ShopStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ShopMain" component={ShopScreen} options={{ headerShown: false, title: 'Shop' }} />
    <Stack.Screen name="MachineShop" component={MachineShopScreen} />
    <Stack.Screen name="UpgradeShop" component={UpgradeShopScreen} />
    <Stack.Screen name="TokenShop" component={TokenShopScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="GameTab"
        component={GameStackNavigator}
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="slot-machine" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CryptoTab"
        component={CryptoStackNavigator}
        options={{
          tabBarLabel: 'Crypto',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="bitcoin" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStackNavigator}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;