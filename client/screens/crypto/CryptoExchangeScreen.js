import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
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
import CryptoSelector from '../../components/crypto/CryptoSelector';

// API
import {
  fetchCryptoExchangeRate,
  executeCryptoExchange,
  withdrawCrypto,
  depositCrypto
} from '../../api/cryptoApi';

// Actions
import { UPDATE_CRYPTO_BALANCE } from '../../store/reducers/cryptoReducer';

// Config
import { CRYPTO_CONFIG } from '../../config';

const CryptoExchangeScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Get action and crypto type from route params
  const { action, cryptoType } = route.params || {};
  
  // Redux state
  const { balances, prices } = useSelector(state => state.crypto);
  
  // Local state
  const [amount, setAmount] = useState('');
  const [selectedFromCrypto, setSelectedFromCrypto] = useState(cryptoType || 'bitcoin');
  const [selectedToCrypto, setSelectedToCrypto] = useState('ethereum');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);
  const [selectorType, setSelectorType] = useState('from'); // 'from' or 'to'
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  
  // Get current action title
  const getActionTitle = () => {
    switch (action) {
      case 'buy':
        return 'Buy Crypto';
      case 'sell':
        return 'Sell Crypto';
      case 'convert':
        return 'Convert Crypto';
      case 'withdraw':
        return 'Withdraw Crypto';
      case 'deposit':
        return 'Deposit Crypto';
      case 'trade':
        return 'Trade Crypto';
      default:
        return 'Exchange';
    }
  };
  
  // Load exchange rate on mount and when crypto selection changes
  useEffect(() => {
    if (action === 'convert' || action === 'trade') {
      loadExchangeRate();
    }
  }, [selectedFromCrypto, selectedToCrypto, action]);
  
  // Update estimated receive amount when amount changes
  useEffect(() => {
    if (exchangeRate && amount) {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount)) {
        const estimated = parsedAmount * exchangeRate;
        setEstimatedReceiveAmount(estimated);
        
        // Calculate fee (0.5% for conversion)
        const feeAmount = estimated * 0.005;
        setFee(feeAmount);
      } else {
        setEstimatedReceiveAmount(0);
        setFee(0);
      }
    } else {
      setEstimatedReceiveAmount(0);
      setFee(0);
    }
  }, [amount, exchangeRate]);
  
  // Load exchange rate
  const loadExchangeRate = async () => {
    try {
      setLoading(true);
      
      const response = await fetchCryptoExchangeRate(selectedFromCrypto, selectedToCrypto);
      setExchangeRate(response.data.rate);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load exchange rate'
      );
      
      setLoading(false);
    }
  };
  
  // Handle crypto selection
  const handleCryptoSelect = (crypto) => {
    if (selectorType === 'from') {
      setSelectedFromCrypto(crypto);
      
      // If same crypto selected for both, switch the to crypto
      if (crypto === selectedToCrypto) {
        setSelectedToCrypto(selectedFromCrypto);
      }
    } else {
      setSelectedToCrypto(crypto);
      
      // If same crypto selected for both, switch the from crypto
      if (crypto === selectedFromCrypto) {
        setSelectedFromCrypto(selectedToCrypto);
      }
    }
    
    setShowCryptoSelector(false);
  };
  
  // Handle amount change
  const handleAmountChange = (text) => {
    // Allow only numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(text) || text === '') {
      setAmount(text);
    }
  };
  
  // Handle max amount
  const handleMaxAmount = () => {
    const balance = getBalanceForCrypto(selectedFromCrypto);
    setAmount(balance.toString());
  };
  
  // Get balance for crypto
  const getBalanceForCrypto = (crypto) => {
    const balance = balances.find(b => b.cryptoType.toLowerCase() === crypto.toLowerCase());
    return balance ? balance.amount : 0;
  };
  
  // Get crypto details
  const getCryptoDetails = (crypto) => {
    const cryptoConfig = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(
      c => c.id === crypto.toLowerCase()
    );
    
    return {
      name: cryptoConfig?.name || crypto,
      symbol: cryptoConfig?.symbol || crypto.toUpperCase(),
      icon: cryptoConfig?.icon || 'help-circle',
      color: cryptoConfig?.color || theme.colors.primary
    };
  };
  
  // Get crypto icon component
  const getCryptoIcon = (crypto) => {
    const details = getCryptoDetails(crypto);
    
    if (details.icon === 'bitcoin') {
      return <FontAwesome5 name="bitcoin" size={24} color={details.color} />;
    } else if (details.icon === 'ethereum') {
      return <FontAwesome5 name="ethereum" size={24} color={details.color} />;
    } else {
      return <Ionicons name={details.icon} size={24} color={details.color} />;
    }
  };
  
  // Validate transaction
  const validateTransaction = () => {
    const parsedAmount = parseFloat(amount);
    
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    
    const balance = getBalanceForCrypto(selectedFromCrypto);
    
    if (parsedAmount > balance) {
      Alert.alert('Insufficient Balance', `You don't have enough ${getCryptoDetails(selectedFromCrypto).name}`);
      return false;
    }
    
    if (action === 'withdraw' && !withdrawalAddress) {
      Alert.alert('Missing Address', 'Please enter a withdrawal address');
      return false;
    }
    
    return true;
  };
  
  // Handle execute transaction
  const handleExecuteTransaction = async () => {
    if (!validateTransaction()) {
      return;
    }
    
    try {
      setProcessingTransaction(true);
      
      const parsedAmount = parseFloat(amount);
      
      let response;
      
      if (action === 'convert' || action === 'trade') {
        response = await executeCryptoExchange(
          selectedFromCrypto,
          selectedToCrypto,
          parsedAmount
        );
      } else if (action === 'withdraw') {
        response = await withdrawCrypto(
          selectedFromCrypto,
          parsedAmount,
          withdrawalAddress
        );
      } else if (action === 'deposit') {
        response = await depositCrypto(
          selectedFromCrypto,
          parsedAmount
        );
      }
      
      // Update balances
      dispatch({
        type: UPDATE_CRYPTO_BALANCE,
        payload: response.data.balances
      });
      
      // Show success message
      Alert.alert(
        'Transaction Successful',
        response.data.message || 'Your transaction has been processed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
      setProcessingTransaction(false);
    } catch (error) {
      console.error('Error executing transaction:', error);
      
      Alert.alert(
        'Transaction Failed',
        error.response?.data?.message || 'Failed to process transaction. Please try again.'
      );
      
      setProcessingTransaction(false);
    }
  };
  
  // Render convert form
  const renderConvertForm = () => (
    <View style={styles.formContainer}>
      {/* From Crypto */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>From</Text>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity
            style={styles.cryptoSelector}
            onPress={() => {
              setSelectorType('from');
              setShowCryptoSelector(true);
            }}
          >
            {getCryptoIcon(selectedFromCrypto)}
            <Text style={[styles.cryptoSelectorText, { color: theme.colors.text }]}>
              {getCryptoDetails(selectedFromCrypto).symbol}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.amountInput, { color: theme.colors.text }]}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            placeholderTextColor={theme.colors.border}
            keyboardType="decimal-pad"
          />
          
          <TouchableOpacity
            style={[styles.maxButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleMaxAmount}
          >
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.balanceText, { color: theme.colors.text }]}>
          Balance: {getBalanceForCrypto(selectedFromCrypto).toFixed(8)} {getCryptoDetails(selectedFromCrypto).symbol}
        </Text>
      </View>
      
      {/* Exchange Icon */}
      <View style={styles.exchangeIconContainer}>
        <Ionicons name="swap-vertical" size={24} color={theme.colors.primary} />
      </View>
      
      {/* To Crypto */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>To</Text>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity
            style={styles.cryptoSelector}
            onPress={() => {
              setSelectorType('to');
              setShowCryptoSelector(true);
            }}
          >
            {getCryptoIcon(selectedToCrypto)}
            <Text style={[styles.cryptoSelectorText, { color: theme.colors.text }]}>
              {getCryptoDetails(selectedToCrypto).symbol}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.estimatedContainer}>
            <Text style={[styles.estimatedAmount, { color: theme.colors.text }]}>
              {estimatedReceiveAmount.toFixed(8)}
            </Text>
            <Text style={[styles.estimatedLabel, { color: theme.colors.text }]}>
              Estimated
            </Text>
          </View>
        </View>
        
        <Text style={[styles.balanceText, { color: theme.colors.text }]}>
          Balance: {getBalanceForCrypto(selectedToCrypto).toFixed(8)} {getCryptoDetails(selectedToCrypto).symbol}
        </Text>
      </View>
      
      {/* Exchange Rate */}
      {loading ? (
        <View style={styles.loadingRateContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingRateText, { color: theme.colors.text }]}>
            Loading exchange rate...
          </Text>
        </View>
      ) : exchangeRate ? (
        <View style={styles.rateContainer}>
          <Text style={[styles.rateText, { color: theme.colors.text }]}>
            1 {getCryptoDetails(selectedFromCrypto).symbol} = {exchangeRate.toFixed(8)} {getCryptoDetails(selectedToCrypto).symbol}
          </Text>
          <Text style={[styles.feeText, { color: theme.colors.text }]}>
            Fee: {fee.toFixed(8)} {getCryptoDetails(selectedToCrypto).symbol} (0.5%)
          </Text>
        </View>
      ) : null}
    </View>
  );
  
  // Render withdraw form
  const renderWithdrawForm = () => (
    <View style={styles.formContainer}>
      {/* Crypto Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Cryptocurrency</Text>
        
        <TouchableOpacity
          style={[styles.cryptoSelectorFull, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            setSelectorType('from');
            setShowCryptoSelector(true);
          }}
        >
          {getCryptoIcon(selectedFromCrypto)}
          <Text style={[styles.cryptoSelectorText, { color: theme.colors.text }]}>
            {getCryptoDetails(selectedFromCrypto).name} ({getCryptoDetails(selectedFromCrypto).symbol})
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.balanceText, { color: theme.colors.text }]}>
          Balance: {getBalanceForCrypto(selectedFromCrypto).toFixed(8)} {getCryptoDetails(selectedFromCrypto).symbol}
        </Text>
      </View>
      
      {/* Amount */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Amount</Text>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.amountPrefix, { color: theme.colors.text }]}>
            {getCryptoDetails(selectedFromCrypto).symbol}
          </Text>
          
          <TextInput
            style={[styles.amountInput, { color: theme.colors.text }]}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            placeholderTextColor={theme.colors.border}
            keyboardType="decimal-pad"
          />
          
          <TouchableOpacity
            style={[styles.maxButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleMaxAmount}
          >
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.valueText, { color: theme.colors.text }]}>
          ≈ ${(parseFloat(amount || 0) * (prices[selectedFromCrypto] || 0)).toFixed(2)} USD
        </Text>
      </View>
      
      {/* Withdrawal Address */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Withdrawal Address</Text>
        
        <TextInput
          style={[styles.addressInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={withdrawalAddress}
          onChangeText={setWithdrawalAddress}
          placeholder={`Enter ${getCryptoDetails(selectedFromCrypto).name} address`}
          placeholderTextColor={theme.colors.border}
          multiline
        />
        
        <Text style={[styles.addressWarning, { color: theme.colors.warning }]}>
          Make sure to enter the correct address. Transactions cannot be reversed.
        </Text>
      </View>
      
      {/* Fee */}
      <View style={[styles.feeContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.feeTitle, { color: theme.colors.text }]}>Transaction Fee</Text>
        <Text style={[styles.feeAmount, { color: theme.colors.text }]}>
          0.0001 {getCryptoDetails(selectedFromCrypto).symbol}
        </Text>
      </View>
    </View>
  );
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{getActionTitle()}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content}>
          {/* Form */}
          {action === 'convert' || action === 'trade' ? renderConvertForm() : renderWithdrawForm()}
          
          {/* Execute Button */}
          <TouchableOpacity
            style={[
              styles.executeButton,
              { backgroundColor: theme.colors.primary },
              processingTransaction && { opacity: 0.7 }
            ]}
            onPress={handleExecuteTransaction}
            disabled={processingTransaction}
          >
            {processingTransaction ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.executeButtonText}>
                {action === 'convert' || action === 'trade'
                  ? 'Convert Now'
                  : action === 'withdraw'
                  ? 'Withdraw Now'
                  : 'Deposit Now'}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: theme.colors.text }]}>
            By proceeding, you agree to our terms and conditions. Cryptocurrency transactions are irreversible.
          </Text>
        </ScrollView>
        
        {/* Crypto Selector Modal */}
        <CryptoSelector
          visible={showCryptoSelector}
          onClose={() => setShowCryptoSelector(false)}
          onSelect={handleCryptoSelect}
          selectedCrypto={selectorType === 'from' ? selectedFromCrypto : selectedToCrypto}
          cryptos={CRYPTO_CONFIG.SUPPORTED_CRYPTOS}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cryptoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cryptoSelectorText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  maxButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  maxButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceText: {
    marginTop: 8,
    fontSize: 14,
  },
  exchangeIconContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  estimatedContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  estimatedAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  estimatedLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingRateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  rateContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  rateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  feeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  cryptoSelectorFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  amountPrefix: {
    paddingLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    marginTop: 8,
    fontSize: 14,
  },
  addressInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addressWarning: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  feeAmount: {
    fontSize: 16,
  },
  executeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  executeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 24,
  },
});

export default CryptoExchangeScreen;