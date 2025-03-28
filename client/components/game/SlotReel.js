import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SYMBOL_SETS } from '../../config';

const SlotReel = ({ symbol, isSpinning, symbolSet = 'classic', delay = 0 }) => {
  const { theme } = useContext(ThemeContext);
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  // Get symbol data
  const getSymbolData = () => {
    const set = SYMBOL_SETS[symbolSet] || SYMBOL_SETS.classic;
    return set.find(s => s.symbol === symbol) || set[0];
  };
  
  // Get symbol color
  const getSymbolColor = () => {
    const symbolData = getSymbolData();
    if (symbolData.isJackpot) {
      return theme.colors.jackpot;
    }
    return theme.colors.text;
  };
  
  // Start spinning animation
  useEffect(() => {
    if (isSpinning) {
      // Reset animation
      spinAnim.setValue(0);
      
      // Start spinning after delay
      const timeout = setTimeout(() => {
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        }).start();
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [isSpinning, delay, spinAnim]);
  
  // Calculate spin animation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'] // Spin 3 times
  });
  
  // Calculate blur animation
  const blur = spinAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 5, 0]
  });
  
  // Calculate scale animation
  const scale = spinAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1]
  });
  
  // Render symbol image if available
  const renderSymbolImage = () => {
    const symbolData = getSymbolData();
    
    if (symbolData.image) {
      try {
        // Try to load image from assets
        const imageSource = getSymbolImageSource(symbolData.image);
        
        return (
          <Image
            source={imageSource}
            style={styles.symbolImage}
            resizeMode="contain"
          />
        );
      } catch (error) {
        console.error('Error loading symbol image:', error);
        // Fallback to text
        return (
          <Text style={[styles.symbolText, { color: getSymbolColor() }]}>
            {symbol}
          </Text>
        );
      }
    }
    
    // Default to text
    return (
      <Text style={[styles.symbolText, { color: getSymbolColor() }]}>
        {symbol}
      </Text>
    );
  };
  
  // Get symbol image source
  const getSymbolImageSource = (imageName) => {
    // Map image names to require statements
    // In a real app, this would be more dynamic
    const imageMap = {
      'seven.png': require('../../assets/images/symbols/seven.png'),
      'bar.png': require('../../assets/images/symbols/bar.png'),
      'cherry.png': require('../../assets/images/symbols/cherry.png'),
      'lemon.png': require('../../assets/images/symbols/lemon.png'),
      'orange.png': require('../../assets/images/symbols/orange.png'),
      'bitcoin.png': require('../../assets/images/symbols/bitcoin.png'),
      'ethereum.png': require('../../assets/images/symbols/ethereum.png'),
      'litecoin.png': require('../../assets/images/symbols/litecoin.png'),
      'dogecoin.png': require('../../assets/images/symbols/dogecoin.png'),
      'ripple.png': require('../../assets/images/symbols/ripple.png')
    };
    
    return imageMap[imageName] || null;
  };
  
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.symbolContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            transform: [
              { rotateX: spin },
              { scale }
            ]
          }
        ]}
      >
        {renderSymbolImage()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  symbolContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  symbolText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  symbolImage: {
    width: 60,
    height: 60,
  }
});

export default SlotReel;