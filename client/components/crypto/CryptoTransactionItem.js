import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import moment from 'moment';

const CryptoTransactionItem = ({ transaction }) => {
  const { theme } = useContext(ThemeContext);
  
  // Get transaction icon
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'crypto_purchase':
        return { name: 'arrow-down', family: 'FontAwesome5', color: theme.colors.success };
      case 'crypto_sale':
        return { name: 'arrow-up', family: 'FontAwesome5', color: theme.colors.error };
      case 'crypto_deposit':
        return { name: 'wallet', family: 'Ionicons', color: theme.colors.success };
      case 'crypto_withdrawal':
        return { name: 'wallet', family: 'Ionicons', color: theme.colors.error };
      case 'crypto_conversion':
        return { name: 'swap-horizontal', family: 'Ionicons', color: theme.colors.primary };
      case 'game_win':
        return { name: 'game-controller', family: 'Ionicons', color: theme.colors.success };
      default:
        return { name: 'circle', family: 'FontAwesome5', color: theme.colors.text };
    }
  };
  
  // Get transaction title
  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'crypto_purchase':
        return 'Purchased Crypto';
      case 'crypto_sale':
        return 'Sold Crypto';
      case 'crypto_deposit':
        return 'Deposited Crypto';
      case 'crypto_withdrawal':
        return 'Withdrew Crypto';
      case 'crypto_conversion':
        return 'Converted Crypto';
      case 'game_win':
        return 'Game Earnings';
      default:
        return 'Transaction';
    }
  };
  
  // Format amount with sign
  const formatAmount = () => {
    const isNegative = ['crypto_sale', 'crypto_withdrawal'].includes(transaction.type);
    return `${isNegative ? '-' : '+'} ${transaction.amount} ${transaction.currency.toUpperCase()}`;
  };
  
  // Format date
  const formatDate = () => {
    return moment(transaction.createdAt).format('MMM D, YYYY h:mm A');
  };
  
  // Get amount color
  const getAmountColor = () => {
    if (['crypto_purchase', 'crypto_deposit', 'game_win'].includes(transaction.type)) {
      return theme.colors.success;
    } else if (['crypto_sale', 'crypto_withdrawal'].includes(transaction.type)) {
      return theme.colors.error;
    }
    return theme.colors.text;
  };
  
  const icon = getTransactionIcon();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: icon.color + '20' }
        ]}
      >
        {icon.family === 'FontAwesome5' ? (
          <FontAwesome5
            name={icon.name}
            size={16}
            color={icon.color}
          />
        ) : (
          <Ionicons
            name={icon.name}
            size={16}
            color={icon.color}
          />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {getTransactionTitle()}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.text + '80' }]}>
          {transaction.description}
        </Text>
        
        <Text style={[styles.date, { color: theme.colors.text + '60' }]}>
          {formatDate()}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {formatAmount()}
        </Text>
        
        {transaction.status !== 'completed' && (
          <View style={[styles.statusContainer, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text style={[styles.status, { color: theme.colors.warning }]}>
              {transaction.status}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  status: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});

export default CryptoTransactionItem;