import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import CryptoBalanceCard from '../components/crypto/CryptoBalanceCard';
import CryptoPriceChart from '../components/crypto/CryptoPriceChart';
import CryptoActionButton from '../components/crypto/CryptoActionButton';
import CryptoTransactionItem from '../components/crypto/CryptoTransactionItem';

// Context
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// Config
import { CRYPTO_CONFIG } from '../config';

// API
import {
  fetchCryptoBalance,
  fetchCryptoPrices,
  fetchCryptoTransactions,
  fetchCryptoPortfolio
} from '../api/cryptoApi';

// Actions
import {
  FETCH_CRYPTO_BALANCE_START,
  FETCH_CRYPTO_BALANCE_SUCCESS,
  FETCH_CRYPTO_BALANCE_FAILURE,
  FETCH_CRYPTO_PRICES_START,
  FETCH_CRYPTO_PRICES_SUCCESS,
  FETCH_CRYPTO_PRICES_FAILURE,
  FETCH_CRYPTO_TRANSACTIONS_SUCCESS,
  FETCH_CRYPTO_PORTFOLIO_SUCCESS
} from '../store/reducers/cryptoReducer';

const CryptoScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Redux state
  const {
    balances,
    totalUsdValue,
    prices,
    portfolio,
    portfolioSummary,
    transactions,
    loading,
    error,
    lastUpdated
  } = useSelector(state => state.crypto);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('balance'); // 'balance', 'portfolio', 'transactions'
  
  // Load data on mount
  useEffect(() => {
    loadCryptoData();
    
    // Set up refresh interval for prices
    const interval = setInterval(() => {
      loadCryptoPrices();
    }, CRYPTO_CONFIG.PRICE_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  // Load all crypto data
  const loadCryptoData = async () => {
    await Promise.all([
      loadCryptoBalance(),
      loadCryptoPrices(),
      loadCryptoTransactions(),
      loadCryptoPortfolio()
    ]);
  };
  
  // Load crypto balance
  const loadCryptoBalance = async () => {
    dispatch({ type: FETCH_CRYPTO_BALANCE_START });
    
    try {
      const response = await fetchCryptoBalance();
      
      dispatch({
        type: FETCH_CRYPTO_BALANCE_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching crypto balance:', error);
      
      dispatch({
        type: FETCH_CRYPTO_BALANCE_FAILURE,
        payload: error.response?.data?.message || 'Failed to load crypto balance'
      });
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load crypto balance'
      );
    }
  };
  
  // Load crypto prices
  const loadCryptoPrices = async () => {
    dispatch({ type: FETCH_CRYPTO_PRICES_START });
    
    try {
      const response = await fetchCryptoPrices();
      
      dispatch({
        type: FETCH_CRYPTO_PRICES_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      
      dispatch({
        type: FETCH_CRYPTO_PRICES_FAILURE,
        payload: error.response?.data?.message || 'Failed to load crypto prices'
      });
    }
  };
  
  // Load crypto transactions
  const loadCryptoTransactions = async () => {
    try {
      const response = await fetchCryptoTransactions();
      
      dispatch({
        type: FETCH_CRYPTO_TRANSACTIONS_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
    }
  };
  
  // Load crypto portfolio
  const loadCryptoPortfolio = async () => {
    try {
      const response = await fetchCryptoPortfolio();
      
      dispatch({
        type: FETCH_CRYPTO_PORTFOLIO_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching crypto portfolio:', error);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCryptoData();
    setRefreshing(false);
  };
  
  // Navigate to crypto detail screen
  const navigateToCryptoDetail = (cryptoType) => {
    navigation.navigate('CryptoWallet', { cryptoType });
  };
  
  // Render balance tab
  const renderBalanceTab = () => (
    <View style={styles.tabContent}>
      {/* Total Balance Card */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.totalBalanceCard}
      >
        <Text style={styles.totalBalanceLabel}>Total Balance (USD)</Text>
        <Text style={styles.totalBalanceValue}>
          ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.lastUpdatedText}>
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
        </Text>
      </LinearGradient>
      
      {/* Crypto Balance Cards */}
      <View style={styles.cryptoBalanceCards}>
        {balances.length > 0 ? (
          balances.map((balance) => (
            <CryptoBalanceCard
              key={balance.cryptoType}
              cryptoType={balance.cryptoType}
              amount={balance.amount}
              usdValue={balance.usdValue}
              price={prices[balance.cryptoType.toLowerCase()]}
              onPress={() => navigateToCryptoDetail(balance.cryptoType)}
            />
          ))
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.text }]}>
            No cryptocurrencies in your wallet yet.
          </Text>
        )}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <CryptoActionButton
          icon="arrow-down"
          label="Buy"
          onPress={() => navigation.navigate('CryptoExchange', { action: 'buy' })}
          color={theme.colors.success}
        />
        <CryptoActionButton
          icon="arrow-up"
          label="Sell"
          onPress={() => navigation.navigate('CryptoExchange', { action: 'sell' })}
          color={theme.colors.error}
        />
        <CryptoActionButton
          icon="swap-horizontal"
          label="Convert"
          onPress={() => navigation.navigate('CryptoExchange', { action: 'convert' })}
          color={theme.colors.primary}
        />
        <CryptoActionButton
          icon="wallet"
          label="Withdraw"
          onPress={() => navigation.navigate('CryptoExchange', { action: 'withdraw' })}
          color={theme.colors.warning}
        />
      </View>
    </View>
  );
  
  // Render portfolio tab
  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      {/* Portfolio Summary */}
      <View style={[styles.portfolioSummary, { backgroundColor: theme.colors.card }]}>
        <View style={styles.portfolioSummaryItem}>
          <Text style={[styles.portfolioSummaryLabel, { color: theme.colors.text }]}>
            Total Invested
          </Text>
          <Text style={[styles.portfolioSummaryValue, { color: theme.colors.text }]}>
            ${portfolioSummary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.portfolioSummaryItem}>
          <Text style={[styles.portfolioSummaryLabel, { color: theme.colors.text }]}>
            Current Value
          </Text>
          <Text style={[styles.portfolioSummaryValue, { color: theme.colors.text }]}>
            ${portfolioSummary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.portfolioSummaryItem}>
          <Text style={[styles.portfolioSummaryLabel, { color: theme.colors.text }]}>
            Profit/Loss
          </Text>
          <Text
            style={[
              styles.portfolioSummaryValue,
              {
                color:
                  portfolioSummary.profitLoss > 0
                    ? theme.colors.success
                    : portfolioSummary.profitLoss < 0
                    ? theme.colors.error
                    : theme.colors.text
              }
            ]}
          >
            ${portfolioSummary.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {' '}
            ({portfolioSummary.profitLossPercentage.toFixed(2)}%)
          </Text>
        </View>
      </View>
      
      {/* Portfolio Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Portfolio Allocation
        </Text>
        <CryptoPriceChart portfolio={portfolio} />
      </View>
      
      {/* Portfolio Items */}
      <View style={styles.portfolioItems}>
        {portfolio.length > 0 ? (
          portfolio.map((item) => (
            <TouchableOpacity
              key={item.cryptoType}
              style={[styles.portfolioItem, { backgroundColor: theme.colors.card }]}
              onPress={() => navigateToCryptoDetail(item.cryptoType)}
            >
              <View style={styles.portfolioItemHeader}>
                <View style={styles.portfolioItemCrypto}>
                  <FontAwesome5
                    name={getCryptoIcon(item.cryptoType)}
                    size={24}
                    color={getCryptoColor(item.cryptoType)}
                  />
                  <Text style={[styles.portfolioItemCryptoName, { color: theme.colors.text }]}>
                    {getCryptoName(item.cryptoType)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.portfolioItemProfitLoss,
                    {
                      color:
                        item.profitLoss > 0
                          ? theme.colors.success
                          : item.profitLoss < 0
                          ? theme.colors.error
                          : theme.colors.text
                    }
                  ]}
                >
                  {item.profitLoss > 0 ? '+' : ''}
                  {item.profitLossPercentage.toFixed(2)}%
                </Text>
              </View>
              
              <View style={styles.portfolioItemDetails}>
                <View style={styles.portfolioItemDetail}>
                  <Text style={[styles.portfolioItemDetailLabel, { color: theme.colors.text }]}>
                    Amount
                  </Text>
                  <Text style={[styles.portfolioItemDetailValue, { color: theme.colors.text }]}>
                    {item.amount.toFixed(8)} {item.cryptoType.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.portfolioItemDetail}>
                  <Text style={[styles.portfolioItemDetailLabel, { color: theme.colors.text }]}>
                    Avg. Price
                  </Text>
                  <Text style={[styles.portfolioItemDetailValue, { color: theme.colors.text }]}>
                    ${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                
                <View style={styles.portfolioItemDetail}>
                  <Text style={[styles.portfolioItemDetailLabel, { color: theme.colors.text }]}>
                    Current Price
                  </Text>
                  <Text style={[styles.portfolioItemDetailValue, { color: theme.colors.text }]}>
                    ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                
                <View style={styles.portfolioItemDetail}>
                  <Text style={[styles.portfolioItemDetailLabel, { color: theme.colors.text }]}>
                    Value
                  </Text>
                  <Text style={[styles.portfolioItemDetailValue, { color: theme.colors.text }]}>
                    ${item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.text }]}>
            No investments in your portfolio yet.
          </Text>
        )}
      </View>
    </View>
  );
  
  // Render transactions tab
  const renderTransactionsTab = () => (
    <View style={styles.tabContent}>
      {/* Transactions List */}
      <View style={styles.transactionsList}>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <CryptoTransactionItem
              key={transaction._id}
              transaction={transaction}
            />
          ))
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.text }]}>
            No transactions yet.
          </Text>
        )}
      </View>
      
      {/* View All Button */}
      {transactions.length > 0 && (
        <TouchableOpacity
          style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CryptoTransactions')}
        >
          <Text style={[styles.viewAllButtonText, { color: theme.colors.buttonText }]}>
            View All Transactions
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Helper functions for crypto data
  const getCryptoIcon = (cryptoType) => {
    const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === cryptoType.toLowerCase()
    );
    return crypto ? crypto.icon : 'question';
  };
  
  const getCryptoColor = (cryptoType) => {
    const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === cryptoType.toLowerCase()
    );
    return crypto ? crypto.color : theme.colors.text;
  };
  
  const getCryptoName = (cryptoType) => {
    const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === cryptoType.toLowerCase()
    );
    return crypto ? crypto.name : cryptoType;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Crypto Wallet</Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'balance' && [styles.activeTabButton, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('balance')}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'balance' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Balance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'portfolio' && [styles.activeTabButton, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'portfolio' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Portfolio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'transactions' && [styles.activeTabButton, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'transactions' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
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
        {activeTab === 'balance' && renderBalanceTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  totalBalanceCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalBalanceLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginBottom: 8,
  },
  totalBalanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.6,
    marginTop: 8,
  },
  cryptoBalanceCards: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  portfolioSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  portfolioSummaryItem: {
    alignItems: 'center',
  },
  portfolioSummaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  portfolioSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  portfolioItems: {
    marginBottom: 16,
  },
  portfolioItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  portfolioItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioItemCrypto: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioItemCryptoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  portfolioItemProfitLoss: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItemDetail: {
    width: '48%',
    marginBottom: 8,
  },
  portfolioItemDetailLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  portfolioItemDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    marginBottom: 16,
  },
  viewAllButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 24,
  },
});

export default CryptoScreen;