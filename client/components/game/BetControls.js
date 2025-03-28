import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';

const BetControls = ({
  betAmount,
  onBetChange,
  minBet,
  maxBet,
  increment,
  disabled
}) => {
  const { theme } = useContext(ThemeContext);
  
  // Decrease bet amount
  const decreaseBet = () => {
    if (betAmount - increment >= minBet) {
      onBetChange(betAmount - increment);
    } else {
      onBetChange(minBet);
    }
  };
  
  // Increase bet amount
  const increaseBet = () => {
    if (betAmount + increment <= maxBet) {
      onBetChange(betAmount + increment);
    } else {
      onBetChange(maxBet);
    }
  };
  
  // Calculate bet percentage of max
  const betPercentage = ((betAmount - minBet) / (maxBet - minBet)) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>BET AMOUNT</Text>
        <Text style={[styles.betAmount, { color: theme.colors.text }]}>
          {betAmount.toLocaleString()} COINS
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: disabled ? theme.colors.border : theme.colors.card,
              borderColor: theme.colors.primary
            }
          ]}
          onPress={decreaseBet}
          disabled={disabled || betAmount <= minBet}
        >
          <Ionicons
            name="remove"
            size={24}
            color={disabled || betAmount <= minBet ? theme.colors.border : theme.colors.primary}
          />
        </TouchableOpacity>
        
        <View style={[styles.sliderContainer, { backgroundColor: theme.colors.card }]}>
          <View
            style={[
              styles.sliderFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${betPercentage}%`
              }
            ]}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
              {minBet}
            </Text>
            <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
              {maxBet}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: disabled ? theme.colors.border : theme.colors.card,
              borderColor: theme.colors.primary
            }
          ]}
          onPress={increaseBet}
          disabled={disabled || betAmount >= maxBet}
        >
          <Ionicons
            name="add"
            size={24}
            color={disabled || betAmount >= maxBet ? theme.colors.border : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  betAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  sliderContainer: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 10,
  },
  sliderLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default BetControls;