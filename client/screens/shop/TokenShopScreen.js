import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import CoinPackCard from '../../components/shop/CoinPackCard';
import SpecialOfferCard from '../../components/shop/SpecialOfferCard';

// API
import { fetchCoinPacks, purchaseCoinPack, fetchSpecialOffers, purchaseSpecialOffer } from '../../api/shopApi';

// Actions
import { SET_COIN_PACKS, SET_SPECIAL_OFFERS } from '../../store/reducers/shopReducer';

const TokenShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const { coinPacks, specialOffers, loading } = useSelector(state => state.shop);
  
  // Local state
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState('coins'); // 'coins', 'special'
  
  // Load shop data on mount
  useEffect(() => {
    loadShopData();
  }, []);
  
  // Load shop data
  const loadShopData = async () => {
    try {
      await Promise.all([
        loadCoinPacks(),
        loadSpecialOffers()
      ]);
    } catch (error) {
      console.error('Error loading shop data:', error);
    }
  };
  
  // Load coin packs
  const loadCoinPacks = async () => {
    try {
      const response = await fetchCoinPacks();
      
      dispatch({
        type: SET_COIN_PACKS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching coin packs:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load coin packs'
      );
    }
  };
  
  // Load special offers
  const loadSpecialOffers = async () => {
    try {
      const response = await fetchSpecialOffers();
      
      dispatch({
        type: SET_SPECIAL_OFFERS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching special offers:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load special offers'
      );
    }
  };
  
  // Handle purchase coin pack
  const handlePurchaseCoinPack = async (packId) => {
    try {
      setPurchasing(true);
      
      const response = await purchaseCoinPack(packId);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased the coin pack!`,
        [{ text: 'OK' }]
      );
      
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing coin pack:', error);
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.message || 'Failed to purchase coin pack. Please try again.'
      );
      
      setPurchasing(false);
    }
  };
  
  // Handle purchase special offer
  const handlePurchaseSpecialOffer = async (offerId) => {
    try {
      setPurchasing(true);
      
      const response = await purchaseSpecialOffer(offerId);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased the special offer!`,
        [{ text: 'OK' }]
      );
      
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing special offer:', error);
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.message || 'Failed to purchase special offer. Please try again.'
      );
      
      setPurchasing(false);
    }
  };
  
  // Render coin packs
  const renderCoinPacks = () => {
    if (!coinPacks || coinPacks.length === 0) {
      return (
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No coin packs available at the moment.
        </Text>
      );
    }
    
    return (
      <View style={styles.coinPacksContainer}>
        {coinPacks.map((pack) => (
          <CoinPackCard
            key={pack._id}
            pack={pack}
            onPurchase={() => handlePurchaseCoinPack(pack._id)}
            disabled={purchasing}
          />
        ))}
      </View>
    );
  };
  
  // Render special offers
  const renderSpecialOffers = () => {
    if (!specialOffers || specialOffers.length === 0) {
      return (
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No special offers available at the moment.
        </Text>
      );
    }
    
    return (
      <View style={styles.specialOffersContainer}>
        {specialOffers.map((offer) => (
          <SpecialOfferCard
            key={offer._id}
            offer={offer}
            onPurchase={() => handlePurchaseSpecialOffer(offer._id)}
            disabled={purchasing}
          />
        ))}
      </View>
    );
  };
  
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Token Shop</Text>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={20} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance?.coins?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
      
      {/* Featured Banner */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.featuredBanner}
      >
        <View style={styles.featuredContent}>
          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            style={styles.featuredTitle}
          >
            Special Offer!
          </Animatable.Text>
          <Text style={styles.featuredSubtitle}>Get 50% extra coins on all purchases today!</Text>
        </View>
        <Image
          source={require('../../assets/images/coins.png')}
          style={styles.featuredImage}
          resizeMode="contain"
        />
      </LinearGradient>
      
      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'coins' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('coins')}
        >
          <Ionicons
            name="wallet"
            size={20}
            color={activeTab === 'coins' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'coins' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Coin Packs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'special' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('special')}
        >
          <Ionicons
            name="gift"
            size={20}
            color={activeTab === 'special' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'special' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Special Offers
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading shop items...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'coins' ? renderCoinPacks() : renderSpecialOffers()}
          
          {/* Payment Methods */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={[styles.paymentMethodsTitle, { color: theme.colors.text }]}>
              Payment Methods
            </Text>
            <View style={styles.paymentMethodsIcons}>
              <Image
                source={require('../../assets/images/payment/visa.png')}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/payment/mastercard.png')}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/payment/paypal.png')}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/payment/applepay.png')}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/payment/googlepay.png')}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
            </View>
          </View>
          
          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: theme.colors.text }]}>
            All purchases are final. Coins are virtual currency that can only be used within the Crypto Slots app and have no real-world value. By making a purchase, you agree to our Terms of Service.
          </Text>
        </ScrollView>
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredBanner: {
    height: 120,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredImage: {
    width: 80,
    height: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  coinPacksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  specialOffersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentMethodsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentMethodsIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 50,
    height: 30,
    opacity: 0.7,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 24,
  },
});

export default TokenShopScreen;