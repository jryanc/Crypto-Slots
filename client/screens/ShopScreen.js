import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// Components
import ShopCategoryCard from '../components/shop/ShopCategoryCard';
import ShopItemCard from '../components/shop/ShopItemCard';
import CoinPackCard from '../components/shop/CoinPackCard';

// API
import { fetchShopItems, purchaseShopItem } from '../api/shopApi';
import { purchaseCoinPack } from '../api/paymentApi';

// Actions
import { SET_SHOP_ITEMS } from '../store/reducers/shopReducer';

const ShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const { items, featuredItems, loading, error } = useSelector(state => state.shop);
  
  // Local state
  const [activeCategory, setActiveCategory] = useState('featured');
  const [purchasing, setPurchasing] = useState(false);
  
  // Load shop items on mount
  useEffect(() => {
    loadShopItems();
  }, []);
  
  // Load shop items
  const loadShopItems = async () => {
    try {
      const response = await fetchShopItems();
      
      dispatch({
        type: SET_SHOP_ITEMS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching shop items:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load shop items'
      );
    }
  };
  
  // Handle purchase item
  const handlePurchaseItem = async (itemId) => {
    try {
      setPurchasing(true);
      
      // Find the item
      const item = [...items, ...featuredItems].find(i => i._id === itemId);
      
      // Check if user has enough coins
      if (user.gameBalance.coins < item.price) {
        Alert.alert('Insufficient Coins', 'You don\'t have enough coins to purchase this item.');
        setPurchasing(false);
        return;
      }
      
      // Purchase the item
      const response = await purchaseShopItem(itemId);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance,
        inventory: response.data.inventory
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased ${item.name}.`,
        [{ text: 'OK' }]
      );
      
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing item:', error);
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.message || 'Failed to purchase item. Please try again.'
      );
      
      setPurchasing(false);
    }
  };
  
  // Handle purchase coin pack
  const handlePurchaseCoinPack = async (packId) => {
    try {
      setPurchasing(true);
      
      // Purchase the coin pack
      const response = await purchaseCoinPack(packId);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased the coin pack.`,
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
  
  // Get filtered items based on active category
  const getFilteredItems = () => {
    if (activeCategory === 'featured') {
      return featuredItems;
    } else {
      return items.filter(item => item.category === activeCategory);
    }
  };
  
  // Render shop categories
  const renderShopCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === 'featured' && [styles.activeCategoryButton, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('featured')}
      >
        <Ionicons
          name="star"
          size={24}
          color={activeCategory === 'featured' ? theme.colors.primary : theme.colors.text}
        />
        <Text
          style={[
            styles.categoryButtonText,
            { color: activeCategory === 'featured' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Featured
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === 'machine' && [styles.activeCategoryButton, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('machine')}
      >
        <MaterialCommunityIcons
          name="slot-machine"
          size={24}
          color={activeCategory === 'machine' ? theme.colors.primary : theme.colors.text}
        />
        <Text
          style={[
            styles.categoryButtonText,
            { color: activeCategory === 'machine' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Machines
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === 'upgrade' && [styles.activeCategoryButton, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('upgrade')}
      >
        <Ionicons
          name="flash"
          size={24}
          color={activeCategory === 'upgrade' ? theme.colors.primary : theme.colors.text}
        />
        <Text
          style={[
            styles.categoryButtonText,
            { color: activeCategory === 'upgrade' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Upgrades
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === 'coins' && [styles.activeCategoryButton, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('coins')}
      >
        <Ionicons
          name="wallet"
          size={24}
          color={activeCategory === 'coins' ? theme.colors.primary : theme.colors.text}
        />
        <Text
          style={[
            styles.categoryButtonText,
            { color: activeCategory === 'coins' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Coins
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === 'special' && [styles.activeCategoryButton, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('special')}
      >
        <Ionicons
          name="gift"
          size={24}
          color={activeCategory === 'special' ? theme.colors.primary : theme.colors.text}
        />
        <Text
          style={[
            styles.categoryButtonText,
            { color: activeCategory === 'special' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Special
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  // Render shop items
  const renderShopItems = () => {
    const filteredItems = getFilteredItems();
    
    if (activeCategory === 'coins') {
      // Render coin packs
      const coinPacks = [
        { id: 'pack1', name: 'Small Pack', coins: 1000, price: 0.99, bonus: 0 },
        { id: 'pack2', name: 'Medium Pack', coins: 5000, price: 4.99, bonus: 500 },
        { id: 'pack3', name: 'Large Pack', coins: 10000, price: 9.99, bonus: 1500 },
        { id: 'pack4', name: 'Mega Pack', coins: 25000, price: 19.99, bonus: 5000 },
        { id: 'pack5', name: 'Ultra Pack', coins: 50000, price: 39.99, bonus: 15000 },
      ];
      
      return (
        <View style={styles.coinPacksContainer}>
          {coinPacks.map((pack) => (
            <CoinPackCard
              key={pack.id}
              pack={pack}
              onPurchase={() => handlePurchaseCoinPack(pack.id)}
              disabled={purchasing}
            />
          ))}
        </View>
      );
    }
    
    return (
      <View style={styles.itemsContainer}>
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={({ item }) => (
              <ShopItemCard
                item={item}
                onPurchase={() => handlePurchaseItem(item._id)}
                disabled={purchasing || user.gameBalance.coins < item.price}
              />
            )}
            contentContainerStyle={styles.itemsList}
          />
        ) : (
          <Text style={[styles.noItemsText, { color: theme.colors.text }]}>
            No items available in this category.
          </Text>
        )}
      </View>
    );
  };
  
  // Render shop categories section
  const renderCategoriesSection = () => (
    <View style={styles.categoriesSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
      
      <View style={styles.categoryCardsContainer}>
        <ShopCategoryCard
          title="Machines"
          icon="slot-machine"
          iconType="material-community"
          onPress={() => navigation.navigate('MachineShop')}
        />
        
        <ShopCategoryCard
          title="Upgrades"
          icon="flash"
          iconType="ionicon"
          onPress={() => navigation.navigate('UpgradeShop')}
        />
        
        <ShopCategoryCard
          title="Tokens"
          icon="wallet"
          iconType="ionicon"
          onPress={() => navigation.navigate('TokenShop')}
        />
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shop</Text>
        
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={24} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance?.coins?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Featured Banner */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.featuredBanner}
        >
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Special Offer!</Text>
            <Text style={styles.featuredSubtitle}>Get 50% extra coins on all purchases today!</Text>
            <TouchableOpacity
              style={styles.featuredButton}
              onPress={() => setActiveCategory('coins')}
            >
              <Text style={styles.featuredButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="slot-machine" size={100} color="rgba(255, 255, 255, 0.2)" style={styles.featuredIcon} />
        </LinearGradient>
        
        {/* Categories Section */}
        {renderCategoriesSection()}
        
        {/* Shop Items */}
        <View style={styles.shopSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Shop Items</Text>
          
          {/* Categories Tabs */}
          {renderShopCategories()}
          
          {/* Items Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Loading shop items...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={loadShopItems}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.buttonText }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderShopItems()
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
  headerTitle: {
    fontSize: 24,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  featuredBanner: {
    height: 150,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
    padding: 16,
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
    marginBottom: 16,
  },
  featuredButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  featuredIcon: {
    marginRight: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  shopSection: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCategoryButton: {
    borderWidth: 1,
  },
  categoryButtonText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  itemsList: {
    paddingBottom: 16,
  },
  coinPacksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
});

export default ShopScreen;