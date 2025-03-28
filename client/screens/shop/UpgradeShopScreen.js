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

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import UpgradeCard from '../../components/shop/UpgradeCard';
import AttributeBar from '../../components/game/AttributeBar';

// API
import { fetchShopUpgrades, purchaseUpgrade } from '../../api/shopApi';

// Actions
import { SET_SHOP_UPGRADES } from '../../store/reducers/shopReducer';
import { UPDATE_MACHINE } from '../../store/reducers/machineReducer';

const UpgradeShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const { machines, selectedMachine } = useSelector(state => state.machines);
  const { shopUpgrades, loading } = useSelector(state => state.shop);
  
  // Local state
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'payoutRate', 'jackpotChance', 'cryptoBonus', 'maxBet'
  
  // Get current machine
  const currentMachine = machines.find(m => m._id === selectedMachine);
  
  // Load shop upgrades on mount
  useEffect(() => {
    if (currentMachine) {
      loadShopUpgrades();
    }
  }, [currentMachine]);
  
  // Load shop upgrades
  const loadShopUpgrades = async () => {
    try {
      const response = await fetchShopUpgrades(currentMachine._id);
      
      dispatch({
        type: SET_SHOP_UPGRADES,
        payload: response.data
      });
      
      if (response.data.length > 0) {
        setSelectedUpgrade(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching shop upgrades:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load shop upgrades'
      );
    }
  };
  
  // Handle upgrade selection
  const handleSelectUpgrade = (upgrade) => {
    setSelectedUpgrade(upgrade);
  };
  
  // Handle purchase upgrade
  const handlePurchaseUpgrade = async () => {
    if (!selectedUpgrade || !currentMachine) {
      return;
    }
    
    // Check if user has enough coins
    if (user.gameBalance.coins < selectedUpgrade.price) {
      Alert.alert('Insufficient Coins', 'You don\'t have enough coins to purchase this upgrade.');
      return;
    }
    
    try {
      setPurchasing(true);
      
      const response = await purchaseUpgrade(currentMachine._id, selectedUpgrade._id);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Update machine in store
      dispatch({
        type: UPDATE_MACHINE,
        payload: response.data.machine
      });
      
      // Show success message
      Alert.alert(
        'Purchase Successful',
        `You have successfully purchased the ${selectedUpgrade.name} upgrade!`,
        [
          {
            text: 'OK',
            onPress: () => loadShopUpgrades() // Reload upgrades after purchase
          }
        ]
      );
      
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.message || 'Failed to purchase upgrade. Please try again.'
      );
      
      setPurchasing(false);
    }
  };
  
  // Get filtered upgrades
  const getFilteredUpgrades = () => {
    if (!shopUpgrades) {
      return [];
    }
    
    if (filter === 'all') {
      return shopUpgrades;
    }
    
    return shopUpgrades.filter(upgrade => upgrade.attribute === filter);
  };
  
  // Get attribute name
  const getAttributeName = (attribute) => {
    switch (attribute) {
      case 'payoutRate':
        return 'Payout Rate';
      case 'jackpotChance':
        return 'Jackpot Chance';
      case 'cryptoBonus':
        return 'Crypto Bonus';
      case 'maxBet':
        return 'Max Bet';
      default:
        return attribute;
    }
  };
  
  // Get attribute color
  const getAttributeColor = (attribute) => {
    switch (attribute) {
      case 'payoutRate':
        return theme.colors.success;
      case 'jackpotChance':
        return theme.colors.warning;
      case 'cryptoBonus':
        return theme.colors.info;
      case 'maxBet':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };
  
  // Render upgrade item
  const renderUpgradeItem = ({ item }) => {
    const isSelected = selectedUpgrade && selectedUpgrade._id === item._id;
    
    return (
      <UpgradeCard
        upgrade={item}
        isSelected={isSelected}
        onPress={() => handleSelectUpgrade(item)}
      />
    );
  };
  
  // Render no machine selected
  if (!currentMachine) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upgrade Shop</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.noMachineContainer}>
          <MaterialCommunityIcons name="slot-machine" size={64} color={theme.colors.border} />
          <Text style={[styles.noMachineText, { color: theme.colors.text }]}>
            No machine selected. Please select a machine first.
          </Text>
          <TouchableOpacity
            style={[styles.selectMachineButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('MachineShop')}
          >
            <Text style={styles.selectMachineButtonText}>Go to Machine Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upgrade Shop</Text>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={20} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance?.coins?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
      
      {/* Machine Info */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.machineInfo}
      >
        <View style={styles.machineHeader}>
          <MaterialCommunityIcons name="slot-machine" size={36} color="white" />
          <View style={styles.machineDetails}>
            <Text style={styles.machineName}>{currentMachine.name}</Text>
            <Text style={styles.machineLevel}>Level {currentMachine.level}</Text>
          </View>
        </View>
        
        <View style={styles.attributesContainer}>
          <AttributeBar
            label="Payout Rate"
            value={currentMachine.attributes.payoutRate}
            maxValue={100}
            color="rgba(255, 255, 255, 0.8)"
            labelColor="white"
            valueColor="white"
          />
          <AttributeBar
            label="Jackpot Chance"
            value={currentMachine.attributes.jackpotChance}
            maxValue={10}
            color="rgba(255, 255, 255, 0.8)"
            labelColor="white"
            valueColor="white"
          />
          <AttributeBar
            label="Crypto Bonus"
            value={currentMachine.attributes.cryptoBonus}
            maxValue={50}
            color="rgba(255, 255, 255, 0.8)"
            labelColor="white"
            valueColor="white"
          />
          <AttributeBar
            label="Max Bet"
            value={currentMachine.attributes.maxBet}
            maxValue={1000}
            color="rgba(255, 255, 255, 0.8)"
            labelColor="white"
            valueColor="white"
            showValue={true}
          />
        </View>
      </LinearGradient>
      
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
            filter === 'payoutRate' && [styles.activeFilterTab, { borderColor: theme.colors.success }]
          ]}
          onPress={() => setFilter('payoutRate')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'payoutRate' ? theme.colors.success : theme.colors.text }
            ]}
          >
            Payout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'jackpotChance' && [styles.activeFilterTab, { borderColor: theme.colors.warning }]
          ]}
          onPress={() => setFilter('jackpotChance')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'jackpotChance' ? theme.colors.warning : theme.colors.text }
            ]}
          >
            Jackpot
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'cryptoBonus' && [styles.activeFilterTab, { borderColor: theme.colors.info }]
          ]}
          onPress={() => setFilter('cryptoBonus')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'cryptoBonus' ? theme.colors.info : theme.colors.text }
            ]}
          >
            Crypto
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'maxBet' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('maxBet')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'maxBet' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Max Bet
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading upgrades...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Upgrades List */}
          <FlatList
            data={getFilteredUpgrades()}
            keyExtractor={(item) => item._id}
            renderItem={renderUpgradeItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upgradesList}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No upgrades available in this category.
              </Text>
            }
          />
          
          {/* Selected Upgrade Details */}
          {selectedUpgrade && (
            <View style={[styles.upgradeDetails, { backgroundColor: theme.colors.card }]}>
              <View style={styles.upgradeHeader}>
                <View style={styles.upgradeInfo}>
                  <View
                    style={[
                      styles.upgradeIcon,
                      { backgroundColor: getAttributeColor(selectedUpgrade.attribute) }
                    ]}
                  >
                    <Ionicons name="flash" size={24} color="white" />
                  </View>
                  <View style={styles.upgradeNameContainer}>
                    <Text style={[styles.upgradeName, { color: theme.colors.text }]}>
                      {selectedUpgrade.name}
                    </Text>
                    <Text style={[styles.upgradeAttribute, { color: getAttributeColor(selectedUpgrade.attribute) }]}>
                      {getAttributeName(selectedUpgrade.attribute)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceLabel, { color: theme.colors.text }]}>Price</Text>
                  <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
                    {selectedUpgrade.price.toLocaleString()} Coins
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.upgradeDescription, { color: theme.colors.text }]}>
                {selectedUpgrade.description}
              </Text>
              
              <View style={styles.effectContainer}>
                <Text style={[styles.effectTitle, { color: theme.colors.text }]}>Effect</Text>
                <View style={styles.effectDetails}>
                  <View style={styles.effectItem}>
                    <Text style={[styles.effectLabel, { color: theme.colors.text }]}>Current</Text>
                    <Text style={[styles.effectValue, { color: theme.colors.text }]}>
                      {currentMachine.attributes[selectedUpgrade.attribute]}
                      {selectedUpgrade.attribute === 'maxBet' ? '' : '%'}
                    </Text>
                  </View>
                  
                  <View style={styles.effectArrow}>
                    <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
                  </View>
                  
                  <View style={styles.effectItem}>
                    <Text style={[styles.effectLabel, { color: theme.colors.text }]}>After Upgrade</Text>
                    <Text style={[styles.effectValue, { color: getAttributeColor(selectedUpgrade.attribute) }]}>
                      {currentMachine.attributes[selectedUpgrade.attribute] + selectedUpgrade.value}
                      {selectedUpgrade.attribute === 'maxBet' ? '' : '%'}
                    </Text>
                  </View>
                  
                  <View style={styles.effectChange}>
                    <Ionicons name="add-circle" size={16} color={theme.colors.success} />
                    <Text style={[styles.effectChangeText, { color: theme.colors.success }]}>
                      {selectedUpgrade.value}
                      {selectedUpgrade.attribute === 'maxBet' ? '' : '%'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Purchase Button */}
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  { backgroundColor: theme.colors.primary },
                  (purchasing || user.gameBalance.coins < selectedUpgrade.price) && { opacity: 0.7 }
                ]}
                onPress={handlePurchaseUpgrade}
                disabled={purchasing || user.gameBalance.coins < selectedUpgrade.price}
              >
                {purchasing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color="white" />
                    <Text style={styles.purchaseButtonText}>
                      {user.gameBalance.coins < selectedUpgrade.price
                        ? 'Not Enough Coins'
                        : 'Purchase Upgrade'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
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
  machineInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  machineDetails: {
    marginLeft: 16,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  machineLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  attributesContainer: {
    marginTop: 8,
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
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  upgradesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  upgradeDetails: {
    flex: 1,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    marginTop: 0,
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeNameContainer: {
    marginLeft: 16,
  },
  upgradeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upgradeAttribute: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  effectContainer: {
    marginBottom: 16,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  effectDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  effectItem: {
    alignItems: 'center',
  },
  effectLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  effectValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  effectArrow: {
    marginHorizontal: 8,
  },
  effectChange: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: -20,
    right: 0,
  },
  effectChangeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  purchaseButtonText: {
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
  noMachineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noMachineText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  selectMachineButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  selectMachineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpgradeShopScreen;