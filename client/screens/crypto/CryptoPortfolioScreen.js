import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import PortfolioItem from '../../components/crypto/PortfolioItem';

// API
import { fetchCryptoPortfolio } from '../../api/cryptoApi';

// Actions
import { FETCH_CRYPTO_PORTFOLIO_SUCCESS } from '../../store/reducers/cryptoReducer';

// Config
import { CRYPTO_CONFIG } from '../../config';

const { width } = Dimensions.get('window');

const CryptoPortfolioScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  
  // Redux state
  const { portfolio, portfolioSummary, loading } = useSelector(state => state.crypto);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState('1w'); // '1d', '1w', '1m', '3m', '1y', 'all'
  
  // Load portfolio data on mount
  useEffect(() => {
    loadPortfolio();
  }, []);
  
  // Load portfolio data
  const loadPortfolio = async () => {
    try {
      const response = await fetchCryptoPortfolio(timeFrame);
      
      dispatch({
        type: FETCH_CRYPTO_PORTFOLIO_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load portfolio data'
      );
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };
  
  // Handle time frame change
  const handleTimeFrameChange = async (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    
    try {
      const response = await fetchCryptoPortfolio(newTimeFrame);
      
      dispatch({
        type: FETCH_CRYPTO_PORTFOLIO_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };
  
  // Get chart data
  const getChartData = () => {
    if (!portfolio || portfolio.length === 0) {
      return [];
    }
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC054', '#5D9CEC', '#F06292', '#26A69A'
    ];
    
    return portfolio.map((item, index) => ({
      name: item.cryptoType,
      value: item.currentValue,
      color: colors[index % colors.length],
      legendFontColor: theme.colors.text,
      legendFontSize: 12
    }));
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading portfolio...
        </Text>
      </View>
    );
  }
  
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Portfolio</Text>
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
        {/* Portfolio Summary */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>Portfolio Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>
                ${portfolioSummary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invested</Text>
              <Text style={styles.summaryValue}>
                ${portfolioSummary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Profit/Loss</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      portfolioSummary.profitLoss > 0
                        ? '#4CD964'
                        : portfolioSummary.profitLoss < 0
                        ? '#FF3B30'
                        : 'white'
                  }
                ]}
              >
                ${portfolioSummary.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Profit/Loss %</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      portfolioSummary.profitLossPercentage > 0
                        ? '#4CD964'
                        : portfolioSummary.profitLossPercentage < 0
                        ? '#FF3B30'
                        : 'white'
                  }
                ]}
              >
                {portfolioSummary.profitLossPercentage > 0 ? '+' : ''}
                {portfolioSummary.profitLossPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* Time Frame Selector */}
        <View style={[styles.timeFrameContainer, { backgroundColor: theme.colors.card }]}>
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
          
          <TouchableOpacity
            style={[
              styles.timeFrameButton,
              timeFrame === 'all' && [styles.activeTimeFrameButton, { borderColor: theme.colors.primary }]
            ]}
            onPress={() => handleTimeFrameChange('all')}
          >
            <Text
              style={[
                styles.timeFrameButtonText,
                { color: timeFrame === 'all' ? theme.colors.primary : theme.colors.text }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Portfolio Allocation Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Portfolio Allocation</Text>
          
          {portfolio && portfolio.length > 0 ? (
            <View style={styles.chartWrapper}>
              <PieChart
                data={getChartData()}
                width={width - 32}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              No portfolio data available.
            </Text>
          )}
        </View>
        
        {/* Portfolio Items */}
        <View style={styles.portfolioItems}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Assets</Text>
          
          {portfolio && portfolio.length > 0 ? (
            portfolio.map((item) => (
              <PortfolioItem
                key={item.cryptoType}
                item={item}
                onPress={() => navigation.navigate('CryptoWallet', { cryptoType: item.cryptoType })}
              />
            ))
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              No assets in your portfolio yet.
            </Text>
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
  summaryCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeFrameButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTimeFrameButton: {
    borderBottomWidth: 2,
  },
  timeFrameButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  portfolioItems: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 24,
  },
});

export default CryptoPortfolioScreen;