import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import * as Animatable from 'react-native-animatable';

const CryptoEarnings = ({ cryptoEarned }) => {
  const { theme } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Only show if crypto was earned
  if (!cryptoEarned || cryptoEarned <= 0) {
    return null;
  }
  
  // Start fade animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, [cryptoEarned, fadeAnim]);
  
  // Format crypto amount
  const formattedAmount = cryptoEarned.toFixed(8);
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(247, 147, 26, 0.2)', // Bitcoin orange with transparency
          opacity: fadeAnim
        }
      ]}
    >
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={1500}
        style={styles.iconContainer}
      >
        <FontAwesome5
          name="bitcoin"
          size={24}
          color={theme.colors.bitcoin}
        />
      </Animatable.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          CRYPTO EARNED
        </Text>
        <Text style={[styles.amount, { color: theme.colors.bitcoin }]}>
          {formattedAmount} BTC
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default CryptoEarnings;