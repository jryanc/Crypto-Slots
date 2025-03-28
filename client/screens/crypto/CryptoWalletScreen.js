import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Clipboard
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import CryptoPriceChart from '../../components/crypto/CryptoPriceChart';
import CryptoTransactionItem from '../../components/crypto/CryptoTransactionItem';
import CryptoActionButton from '../../components/crypto/CryptoActionButton';

// API
import {
  fetchCryptoWallet,
  fetchCryptoPriceHistory,
  fetchCryptoTransactions,
  generateDepositAddress
} from '../../api/cryptoApi';

// Actions
import {
  FETCH_CRYPTO_WALLET_SUCCESS,
  FETCH_CRYPTO_PRICE_HISTORY_SUCCESS,
  FETCH_CRYPTO_TRANSACTIONS_SUCCESS
} from '../../store/reducers/cryptoReducer';

// Config
import { CRYPTO_CONFIG } from '../../config';

const CryptoWalletScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Get crypto type from route params
  const { cryptoType } = route.params || {};
  
  // Redux state
  const { wallets, priceHistory, transactions, loading } = useSelector(state => state.crypto);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState('1d'); // '1d', '1w', '1m', '3m', '1y'
  const [depositAddress, setDepositAddress] = useState('');
  const [generatingAddress, setGeneratingAddress] = useState(false);
  
  // Get current wallet
  const currentWallet = wallets.find(w => w.cryptoType.toLowerCase() === cryptoType.toLowerCase());
  
  // Load wallet data on mount
  useEffect(() => {
    if (cryptoType) {
      loadWalletData();
    }
  }, [cryptoType]);
  
  // Load wallet data
  const loadWalletData = async () => {
    try {
      await Promise.all([
        loadCryptoWallet(),
        loadPriceHistory(),
        loadTransactions()
      ]);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };
  
  // Load crypto wallet
  const loadCryptoWallet = async () => {
    try {
      const response = await fetchCryptoWallet(cryptoType);
      
      dispatch({
        type: FETCH_CRYPTO_WALLET_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching crypto wallet:', error);
    }
  };
  
  // Load price history
  const loadPriceHistory = async () => {
    try {
      const response = await fetchCryptoPriceHistory(cryptoType, timeFrame);
      
      dispatch({
        type: FETCH_CRYPTO_PRICE_HISTORY_SUCCESS,
        payload: {
          cryptoType,
          timeFrame,
          data: response.data
        }
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };
  
  // Load transactions
  const loadTransactions = async () => {
    try {
      const response = await fetchCryptoTransactions(cryptoType);
      
      dispatch({
        type: FETCH_CRYPTO_TRANSACTIONS_SUCCESS,
        payload: {
          cryptoType,
          transactions: response.data
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };
  
  // Handle time frame change
  const handleTimeFrameChange = async (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    
    try {
      const response = await fetchCryptoPriceHistory(cryptoType, newTimeFrame);
      
      dispatch({
        type: FETCH_CRYPTO_PRICE_HISTORY_SUCCESS,
        payload: {
          cryptoType,
          timeFrame: newTimeFrame,
          data: response.data
        }
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };
  
  // Handle generate deposit address
  const handleGenerateDepositAddress = async () => {
    try {
      setGeneratingAddress(true);
      
      const response = await generateDepositAddress(cryptoType);
      setDepositAddress(response.data.address);
      
      setGeneratingAddress(false);
    } catch (error) {
      console.error('Error generating deposit address:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate deposit address'
      );
      
      setGeneratingAddress(false);
    }
  };
  
  // Handle copy address
  const handleCopyAddress = () => {
    Clipboard.setString(depositAddress);
    Alert.alert('Copied', 'Deposit address copied to clipboard');
  };
  
  // Get crypto details
  const getCryptoDetails = () => {
    const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === cryptoType.toLowerCase()
    );
    
    return {
      name: crypto?.name || cryptoType,
      symbol: crypto?.symbol || cryptoType.toUpperCase(),
      icon: crypto?.icon || 'help-circle',
      color: crypto?.color || theme.colors.primary
    };
  };
  
  // Get crypto icon component
  const getCryptoIcon = () => {
    const crypto = getCryptoDetails();
    
    if (crypto.icon === 'bitcoin') {
      return <FontAwesome5 name="bitcoin" size={24} color={crypto.color} />;
    } else if (crypto.icon === 'ethereum') {
      return <FontAwesome5 name="ethereum" size={24} color={crypto.color} />;
    } else {
      return <Ionicons name={crypto.icon} size={24} color={crypto.color} />;
    }
  };
  
  // Calculate price change
  const calculatePriceChange = () => {
    if (!priceHistory || !priceHistory[cryptoType] || !priceHistory[cryptoType][timeFrame]) {
      return { value: 0, percentage: 0 };
    }
    
    const data = priceHistory[cryptoType][timeFrame];
    
    if (data.length < 2) {
      return { value: 0, percentage: 0 };
    }
    
    const currentPrice = data[data.length - 1].price;
    const previousPrice = data[0].price;
    
    const change = currentPrice - previousPrice;
    const percentage = (change / previousPrice) * 100;
    
    return { value: change, percentage };
  };
  
  // Get current price
  const getCurrentPrice = () => {
    if (!priceHistory || !priceHistory[cryptoType] || !priceHistory[cryptoType][timeFrame]) {
      return 0;
    }
    
    const data = priceHistory[cryptoType][timeFrame];
    
    if (data.length === 0) {
      return 0;
    }
    
    return data[data.length - 1].price;
  };
  
  // Render loading state
  if (loading && !refreshing && !currentWallet) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading wallet...
        </Text>
      </View>
    );
  }
  
  // Get crypto details
  const crypto = getCryptoDetails();
  const priceChange = calculatePriceChange();
  const currentPrice = getCurrentPrice();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{crypto.name} Wallet</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Wallet Balance */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <View style={styles.cryptoInfo}>
              {getCryptoIcon()}
              <Text style={styles.cryptoName}>{crypto.name}</Text>
            </View>
            <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
          </View>
          
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>
            {currentWallet ? currentWallet.balance.toFixed(8) : '0.00000000'} {crypto.symbol}
          </Text>
          
          <Text style={styles.usdValue}>
            ${currentWallet ? (currentWallet.balance * currentPrice).toFixed(2) : '0.00'} USD
          </Text>
        </LinearGradient>
        
        {/* Price Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.priceHeader}>
            <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            
            <Animatable.View
              animation={priceChange.percentage > 0 ? 'pulse' : undefined}
              iterationCount={priceChange.percentage > 0 ? 'infinite' : 1}
              style={[
                styles.priceChange,
                {
                  backgroundColor:
                    priceChange.percentage > 0
                      ? theme.colors.success
                      : priceChange.percentage < 0
                      ? theme.colors.error
                      : theme.colors.border
                }
              ]}
            >
              <Text style={styles.priceChangeText}>
                {priceChange.percentage > 0 ? '+' : ''}
                {priceChange.percentage.toFixed(2)}%
              </Text>
            </Animatable.View>
          </View>
          
          {/* Time Frame Selector */}
          <View style={styles.timeFrameSelector}>
            <TouchableOpacity
              style={[
                styles.timeFrameButton,
                timeFrame === '1d' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => handleTimeFrameChange('1d')}
            >
              <Text
                style={[
                  styles.timeFrameButtonText,
                  { color: timeFrame === '1d' ? theme.colors.primary : theme.colors.text }
                ]}
              >
                1D
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeFrameButton,
                timeFrame === '1w' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => handleTimeFrameChange('1w')}
            >
              <Text
                style={[
                  styles.timeFrameButtonText,
                  { color: timeFrame === '1w' ? theme.colors.primary : theme.colors.text }
                ]}
              >
                1W
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeFrameButton,
                timeFrame === '1m' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => handleTimeFrameChange('1m')}
            >
              <Text
                style={[
                  styles.timeFrameButtonText,
                  { color: timeFrame === '1m' ? theme.colors.primary : theme.colors.text }
                ]}
              >
                1M
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeFrameButton,
                timeFrame === '3m' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => handleTimeFrameChange('3m')}
            >
              <Text
                style={[
                  styles.timeFrameButtonText,
                  { color: timeFrame === '3m' ? theme.colors.primary : theme.colors.text }
                ]}
              >
                3M
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeFrameButton,
                timeFrame === '1y' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => handleTimeFrameChange('1y')}
            >
              <Text
                style={[
                  styles.timeFrameButtonText,
                  { color: timeFrame === '1y' ? theme.colors.primary : theme.colors.text }
                ]}
              >
                1Y
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Chart */}
          <View style={styles.chart}>
            {priceHistory && priceHistory[cryptoType] && priceHistory[cryptoType][timeFrame] ? (
              <CryptoPriceChart
                data={priceHistory[cryptoType][timeFrame]}
                color={priceChange.percentage >= 0 ? theme.colors.success : theme.colors.error}
              />
            ) : (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CryptoActionButton
            icon="arrow-down"
            label="Deposit"
            onPress={() => handleGenerateDepositAddress()}
            color={theme.colors.success}
          />
          
          <CryptoActionButton
            icon="arrow-up"
            label="Withdraw"
            onPress={() => navigation.navigate('CryptoExchange', { action: 'withdraw', cryptoType })}
            color={theme.colors.error}
          />
          
          <CryptoActionButton
            icon="swap-horizontal"
            label="Convert"
            onPress={() => navigation.navigate('CryptoExchange', { action: 'convert', cryptoType })}
            color={theme.colors.primary}
          />
          
          <CryptoActionButton
            icon="trending-up"
            label="Trade"
            onPress={() => navigation.navigate('CryptoExchange', { action: 'trade', cryptoType })}
            color={theme.colors.warning}
          />
        </View>
        
        {/* Deposit Address */}
        {depositAddress && (
          <View style={[styles.addressCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.addressHeader}>
              <Text style={[styles.addressTitle, { color: theme.colors.text }]}>Deposit Address</Text>
              <TouchableOpacity onPress={handleCopyAddress}>
                <Ionicons name="copy" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.addressText, { color: theme.colors.text }]}>
              {depositAddress}
            </Text>
            
            <Text style={[styles.addressWarning, { color: theme.colors.warning }]}>
              Only send {crypto.name} ({crypto.symbol}) to this address. Sending any other cryptocurrency may result in permanent loss.
            </Text>
          </View>
        )}
        
        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
          
          {transactions && transactions[cryptoType] && transactions[cryptoType].length > 0 ? (
            transactions[cryptoType].slice(0, 5).map((transaction) => (
              <CryptoTransactionItem
                key={transaction._id}
                transaction={transaction}
              />
            ))
          ) : (
            <Text style={[styles.noTransactionsText, { color: theme.colors.text }]}>
              No recent transactions.
            </Text>
          )}
          
          {transactions && transactions[cryptoType] && transactions[cryptoType].length > 5 && (
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CryptoTransactions', { cryptoType })}
            >
              <Text style={[styles.viewAllButtonText, { color: theme.colors.buttonText }]}>
                View All Transactions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoName: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cryptoSymbol: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  usdValue: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chartCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    marginTop: 0,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  priceChange: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  priceChangeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeFrameSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTimeFrameButton: {
    borderWidth: 1,
  },
  timeFrameButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chart: {
    height: 200,
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addressCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    marginTop: 0,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  addressWarning: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  transactionsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noTransactionsText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 16,
  },
  viewAllButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});

export default CryptoWalletScreen;