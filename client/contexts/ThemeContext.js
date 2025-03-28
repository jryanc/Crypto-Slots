import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define themes
const lightTheme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    background: '#f2f2f2',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#ff3b30',
    error: '#B00020',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    
    // Game specific colors
    jackpot: '#FFD700',
    win: '#4CAF50',
    loss: '#f44336',
    
    // Crypto specific colors
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    litecoin: '#BFBBBB',
    dogecoin: '#C2A633',
    ripple: '#0085C0',
    
    // UI elements
    button: '#6200ee',
    buttonText: '#ffffff',
    inputBackground: '#f5f5f5',
    inputText: '#000000',
    inputBorder: '#e0e0e0',
    
    // Gradients
    gradientStart: '#6200ee',
    gradientEnd: '#9c27b0',
  }
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#BB86FC',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#2c2c2c',
    notification: '#ff453a',
    error: '#CF6679',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    
    // Game specific colors
    jackpot: '#FFD700',
    win: '#4CAF50',
    loss: '#f44336',
    
    // Crypto specific colors
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    litecoin: '#BFBBBB',
    dogecoin: '#C2A633',
    ripple: '#0085C0',
    
    // UI elements
    button: '#BB86FC',
    buttonText: '#000000',
    inputBackground: '#2c2c2c',
    inputText: '#ffffff',
    inputBorder: '#3c3c3c',
    
    // Gradients
    gradientStart: '#BB86FC',
    gradientEnd: '#3700B3',
  }
};

// Neon theme for a casino feel
const neonTheme = {
  dark: true,
  colors: {
    primary: '#00ffff',
    background: '#0a0a0a',
    card: '#1a1a1a',
    text: '#ffffff',
    border: '#333333',
    notification: '#ff00ff',
    error: '#ff0000',
    success: '#00ff00',
    warning: '#ffff00',
    info: '#00ffff',
    
    // Game specific colors
    jackpot: '#ffff00',
    win: '#00ff00',
    loss: '#ff0000',
    
    // Crypto specific colors
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    litecoin: '#BFBBBB',
    dogecoin: '#C2A633',
    ripple: '#0085C0',
    
    // UI elements
    button: '#00ffff',
    buttonText: '#000000',
    inputBackground: '#1a1a1a',
    inputText: '#ffffff',
    inputBorder: '#00ffff',
    
    // Gradients
    gradientStart: '#ff00ff',
    gradientEnd: '#00ffff',
  }
};

// Create context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeType, setThemeType] = useState('system');
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? darkTheme : lightTheme);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeType = await AsyncStorage.getItem('themeType');
        if (savedThemeType) {
          setThemeType(savedThemeType);
          updateTheme(savedThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Update theme when device theme changes
  useEffect(() => {
    if (themeType === 'system') {
      setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [deviceTheme, themeType]);

  // Update theme based on preference
  const updateTheme = (type) => {
    switch (type) {
      case 'light':
        setTheme(lightTheme);
        break;
      case 'dark':
        setTheme(darkTheme);
        break;
      case 'neon':
        setTheme(neonTheme);
        break;
      case 'system':
      default:
        setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
        break;
    }
  };

  // Set theme preference
  const setThemePreference = async (type) => {
    try {
      await AsyncStorage.setItem('themeType', type);
      setThemeType(type);
      updateTheme(type);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Context value
  const value = {
    theme,
    themeType,
    setThemePreference,
    isDark: theme.dark,
    themes: {
      light: lightTheme,
      dark: darkTheme,
      neon: neonTheme
    }
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};