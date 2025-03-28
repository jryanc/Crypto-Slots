import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import CryptoTransactionItem from '../../components/crypto/CryptoTransactionItem';
import FilterChip from '../../components/common/FilterChip';

// API
import { fetchCryptoTransactions } from '../../api/cryptoApi';

// Actions
import { FETCH_CRYPTO_TRANSACTIONS_SUCCESS } from '../../store/reducers/cryptoReducer';

// Config
import { CRYPTO_CONFIG } from '../../config';

const CryptoTransactionsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  
  // Get crypto type from route params
  const { cryptoType } = route.params || {};
  
  // Redux state
  const { transactions, loading } = useSelector(state => state.crypto);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'deposit', 'withdraw', 'convert', 'reward'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [cryptoType]);
  
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
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load transactions'
      );
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };
  
  // Get filtered transactions
  const getFilteredTransactions = () => {
    if (!transactions || !transactions[cryptoType]) {
      return [];
    }
    
    let filtered = [...transactions[cryptoType]];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filter);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
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
  
  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <FilterChip
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label="Deposits"
          active={filter === 'deposit'}
          onPress={() => setFilter('deposit')}
        />
        <FilterChip
          label="Withdrawals"
          active={filter === 'withdraw'}
          onPress={() => setFilter('withdraw')}
        />
        <FilterChip
          label="Conversions"
          active={filter === 'convert'}
          onPress={() => setFilter('convert')}
        />
        <FilterChip
          label="Rewards"
          active={filter === 'reward'}
          onPress={() => setFilter('reward')}
        />
      </ScrollView>
      
      {/* Sort Order */}
      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: theme.colors.text }]}>Sort:</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={[styles.sortButtonText, { color: theme.colors.primary }]}>
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Text>
          <Ionicons
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Get crypto details
  const crypto = getCryptoDetails();
  
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {cryptoType ? `${crypto.name} Transactions` : 'All Transactions'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Transactions List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading transactions...
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredTransactions()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CryptoTransactionItem transaction={item} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.transactionsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {filter === 'all'
                ? 'No transactions found.'
                : `No ${filter} transactions found.`}
            </Text>
          }
        />
      )}
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
  headerContainer: {
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});

export default CryptoTransactionsScreen;