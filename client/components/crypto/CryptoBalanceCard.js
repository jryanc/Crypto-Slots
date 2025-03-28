import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import { CRYPTO_CONFIG } from '../../config';

const CryptoBalanceCard = ({ cryptoType, amount, usdValue, price, onPress }) => {
  const { theme } = useContext(ThemeContext);
  
  // Get crypto data from config
  const getCryptoData = () => {
    return CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      crypto => crypto.id === cryptoType.toLowerCase()
    ) || {
      name: cryptoType,
      symbol: cryptoType.toUpperCase(),
      icon: 'question',
      color: theme.colors.text
    };
  };
  
  const cryptoData = getCryptoData();
  
  // Format crypto amount
  const formattedAmount = amount.toFixed(8);
  
  // Format USD value
  const formattedUsdValue = usdValue
    ? usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : (amount * (price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5
          name={cryptoData.icon}
          size={24}
          color={cryptoData.color}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.cryptoName, { color: theme.colors.text }]}>
          {cryptoData.name}
        </Text>
        
        <Text style={[styles.cryptoAmount, { color: theme.colors.text }]}>
          {formattedAmount} {cryptoData.symbol}
        </Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.usdValue, { color: theme.colors.text }]}>
          ${formattedUsdValue}
        </Text>
        
        {price && (
          <Text style={[styles.price, { color: theme.colors.text + '80' }]}>
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cryptoAmount: {
    fontSize: 14,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  usdValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
  }
});

export default CryptoBalanceCard;