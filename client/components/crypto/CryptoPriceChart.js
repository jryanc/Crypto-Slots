import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemeContext } from '../../contexts/ThemeContext';
import { CRYPTO_CONFIG } from '../../config';

const CryptoPriceChart = ({ portfolio }) => {
  const { theme } = useContext(ThemeContext);
  const screenWidth = Dimensions.get('window').width - 64; // Account for padding
  
  // If no portfolio data, show empty state
  if (!portfolio || portfolio.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No portfolio data available
        </Text>
      </View>
    );
  }
  
  // Prepare chart data
  const chartData = portfolio.map(item => {
    // Get crypto color from config
    const cryptoConfig = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === item.cryptoType.toLowerCase()
    );
    
    return {
      name: item.cryptoType.toUpperCase(),
      value: item.currentValue,
      color: cryptoConfig ? cryptoConfig.color : theme.colors.primary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12
    };
  });
  
  // Chart configuration
  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };
  
  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={screenWidth}
        height={200}
        chartConfig={chartConfig}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  }
});

export default CryptoPriceChart;