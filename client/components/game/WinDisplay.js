import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import * as Animatable from 'react-native-animatable';

const WinDisplay = ({ amount, isJackpot, animation }) => {
  const { theme } = useContext(ThemeContext);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  // Start scale animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, [amount, scaleAnim]);
  
  // Determine text color based on win amount
  const getTextColor = () => {
    if (isJackpot) {
      return theme.colors.jackpot;
    }
    
    if (amount >= 1000) {
      return theme.colors.success;
    }
    
    return theme.colors.win;
  };
  
  // Format win amount
  const formattedAmount = amount.toLocaleString();
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isJackpot ? 
            'rgba(0, 0, 0, 0.7)' : 
            'rgba(0, 0, 0, 0.5)',
          transform: [
            { scale: scaleAnim },
            { translateY: animation ? animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10]
            }) : 0 }
          ]
        }
      ]}
    >
      {isJackpot ? (
        <>
          <Animatable.Text
            animation="flash"
            iterationCount="infinite"
            duration={500}
            style={[styles.jackpotText, { color: theme.colors.jackpot }]}
          >
            JACKPOT!
          </Animatable.Text>
          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
            style={[styles.amountText, { color: getTextColor() }]}
          >
            {formattedAmount} COINS
          </Animatable.Text>
        </>
      ) : (
        <>
          <Text style={[styles.winText, { color: theme.colors.buttonText }]}>
            YOU WIN!
          </Text>
          <Text style={[styles.amountText, { color: getTextColor() }]}>
            {formattedAmount} COINS
          </Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  jackpotText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});

export default WinDisplay;