import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import MachineCard from '../../components/shop/MachineCard';
import AttributeBar from '../../components/game/AttributeBar';

// API
import { fetchShopMachines, purchaseMachine } from '../../api/shopApi';

// Actions
import { SET_SHOP_MACHINES } from '../../store/reducers/shopReducer';
import { ADD_MACHINE, SET_SELECTED_MACHINE } from '../../store/reducers/machineReducer';

const MachineShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const { machines: userMachines } = useSelector(state => state.machines);
  const { shopMachines, loading } = useSelector(state => state.shop);
  
  // Local state
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'basic', 'premium', 'exclusive'
  
  // Load shop machines on mount
  useEffect(() => {
    loadShopMachines();
  }, []);
  
  // Load shop machines
  const loadShopMachines = async () => {
    try {
      const response = await fetchShopMachines();
      
      dispatch({
        type: SET_SHOP_MACHINES,
        payload: response.data
      });
      
      if (response.data.length > 0) {
        setSelectedMachine(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching shop machines:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load shop machines'
      );
    }
  };
  
  // Handle machine selection
  const handleSelectMachine = (machine) => {
    setSelectedMachine(machine);
  };
  
  // Handle purchase machine
  const handlePurchaseMachine = async () => {
    if (!selectedMachine) {
      return;
    }
    
    // Check if user already owns this machine
    const alreadyOwned = userMachines.some(m => m.machineId === selectedMachine._id);
    
    if (alreadyOwned) {
      Alert.alert('Already Owned', 'You already own this machine.');
      return;
    }
    
    // Check if user has enough coins
    if (user.gameBalance.coins < selectedMachine.price) {
      Alert.alert('Insufficient Coins', 'You don\'t have enough coins to purchase this machine.');
      return;
    }
    
    try {
      setPurchasing(true);
      
      const response = await purchaseMachine(selectedMachine._id);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Add machine to user's machines
      dispatch({
        type: ADD_MACHINE,
        payload: response.data.machine
      });
      
      // Set as selected machine
      dispatch({
        type: SET_SELECTED_MACHINE,
        payload: response.data.machine._id
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased the ${selectedMachine.name}!`,
        [
          {
            text: 'Play Now',
            onPress: () => navigation.navigate('GameTab')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing machine:', error);
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.message || 'Failed to purchase machine. Please try again.'
      );
      
      setPurchasing(false);
    }
  };
  
  // Get filtered machines
  const getFilteredMachines = () => {
    if (!shopMachines) {
      return [];
    }
    
    if (filter === 'all') {
      return shopMachines;
    }
    
    return shopMachines.filter(machine => machine.category === filter);
  };
  
  // Check if machine is owned
  const isMachineOwned = (machineId) => {
    return userMachines.some(m => m.machineId === machineId);
  };
  
  // Render machine item
  const renderMachineItem = ({ item }) => {
    const isOwned = isMachineOwned(item._id);
    const isSelected = selectedMachine && selectedMachine._id === item._id;
    
    return (
      <MachineCard
        machine={item}
        isOwned={isOwned}
        isSelected={isSelected}
        onPress={() => handleSelectMachine(item)}
      />
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Machine Shop</Text>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={20} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance?.coins?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
      
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'all' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'basic' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('basic')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'basic' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Basic
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'premium' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('premium')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'premium' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Premium
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'exclusive' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('exclusive')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'exclusive' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Exclusive
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading machines...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Machine List */}
          <FlatList
            data={getFilteredMachines()}
            keyExtractor={(item) => item._id}
            renderItem={renderMachineItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.machineList}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No machines available in this category.
              </Text>
            }
          />
          
          {/* Selected Machine Details */}
          {selectedMachine && (
            <View style={styles.detailsContainer}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.machineHeader}
              >
                <View style={styles.machineInfo}>
                  <MaterialCommunityIcons name="slot-machine" size={48} color="white" />
                  <View style={styles.machineNameContainer}>
                    <Text style={styles.machineName}>{selectedMachine.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                      <Text style={styles.categoryText}>
                        {selectedMachine.category.charAt(0).toUpperCase() + selectedMachine.category.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.priceValue}>
                    {selectedMachine.price.toLocaleString()} Coins
                  </Text>
                </View>
              </LinearGradient>
              
              <View style={[styles.machineDetails, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>Description</Text>
                <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                  {selectedMachine.description}
                </Text>
                
                <Text style={[styles.attributesTitle, { color: theme.colors.text }]}>Attributes</Text>
                <View style={styles.attributesContainer}>
                  <AttributeBar
                    label="Payout Rate"
                    value={selectedMachine.attributes.payoutRate}
                    maxValue={100}
                    color={theme.colors.success}
                  />
                  <AttributeBar
                    label="Jackpot Chance"
                    value={selectedMachine.attributes.jackpotChance}
                    maxValue={10}
                    color={theme.colors.warning}
                  />
                  <AttributeBar
                    label="Crypto Bonus"
                    value={selectedMachine.attributes.cryptoBonus}
                    maxValue={50}
                    color={theme.colors.info}
                  />
                  <AttributeBar
                    label="Max Bet"
                    value={selectedMachine.attributes.maxBet}
                    maxValue={1000}
                    color={theme.colors.primary}
                    showValue={true}
                  />
                </View>
                
                <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>Features</Text>
                <View style={styles.featuresContainer}>
                  {selectedMachine.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      <Text style={[styles.featureText, { color: theme.colors.text }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* Purchase Button */}
                {isMachineOwned(selectedMachine._id) ? (
                  <View style={[styles.ownedButton, { backgroundColor: theme.colors.success }]}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.ownedButtonText}>Owned</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.purchaseButton,
                      { backgroundColor: theme.colors.primary },
                      (purchasing || user.gameBalance.coins < selectedMachine.price) && { opacity: 0.7 }
                    ]}
                    onPress={handlePurchaseMachine}
                    disabled={purchasing || user.gameBalance.coins < selectedMachine.price}
                  >
                    {purchasing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="cart" size={20} color="white" />
                        <Text style={styles.purchaseButtonText}>
                          {user.gameBalance.coins < selectedMachine.price
                            ? 'Not Enough Coins'
                            : 'Purchase Machine'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
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
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeFilterTab: {
    borderBottomWidth: 2,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  machineList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  machineHeader: {
    padding: 16,
  },
  machineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  machineNameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  machineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  machineDetails: {
    flex: 1,
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  attributesContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ownedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  ownedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    width: 300,
  },
});

export default MachineShopScreen;