import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import UpgradeCard from '../../components/game/UpgradeCard';
import AttributeBar from '../../components/game/AttributeBar';

// API
import { fetchMachineUpgrades, purchaseUpgrade } from '../../api/upgradeApi';

// Actions
import { UPDATE_MACHINE } from '../../store/reducers/machineReducer';

const MachineUpgradeScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Get machine ID from route params or use selected machine
  const { machineId } = route.params || {};
  const { machines, selectedMachine } = useSelector(state => state.machines);
  const currentMachineId = machineId || selectedMachine;
  
  // Get current machine
  const currentMachine = machines.find(m => m._id === currentMachineId);
  
  // Local state
  const [upgrades, setUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load upgrades on mount
  useEffect(() => {
    if (currentMachine) {
      loadUpgrades();
    } else {
      setError('Machine not found');
      setLoading(false);
    }
  }, [currentMachine]);
  
  // Load available upgrades
  const loadUpgrades = async () => {
    try {
      setLoading(true);
      const response = await fetchMachineUpgrades(currentMachineId);
      setUpgrades(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machine upgrades:', error);
      setError(error.response?.data?.message || 'Failed to load upgrades');
      setLoading(false);
    }
  };
  
  // Handle upgrade purchase
  const handlePurchaseUpgrade = async (upgradeId) => {
    try {
      setPurchasing(true);
      
      // Find the upgrade
      const upgrade = upgrades.find(u => u._id === upgradeId);
      
      // Check if user has enough coins
      if (user.gameBalance.coins < upgrade.cost) {
        Alert.alert('Insufficient Coins', 'You don\'t have enough coins to purchase this upgrade.');
        setPurchasing(false);
        return;
      }
      
      // Purchase the upgrade
      const response = await purchaseUpgrade(currentMachineId, upgradeId);
      
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
        'Upgrade Purchased!',
        `You have successfully upgraded your ${currentMachine.name} with ${upgrade.name}.`,
        [{ text: 'OK' }]
      );
      
      // Reload upgrades
      loadUpgrades();
      
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
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading upgrades...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render no machine state
  if (!currentMachine) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Machine not found</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Go Back</Text>
        </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Machine Upgrades</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Machine Info */}
      <View style={[styles.machineInfo, { backgroundColor: theme.colors.card }]}>
        <View style={styles.machineHeader}>
          <MaterialCommunityIcons
            name="slot-machine"
            size={48}
            color={theme.colors.primary}
          />
          <View style={styles.machineDetails}>
            <Text style={[styles.machineName, { color: theme.colors.text }]}>
              {currentMachine.name}
            </Text>
            <Text style={[styles.machineLevel, { color: theme.colors.text }]}>
              Level {currentMachine.level}
            </Text>
          </View>
        </View>
        
        {/* Machine Attributes */}
        <View style={styles.attributesContainer}>
          <AttributeBar
            label="Payout Rate"
            value={currentMachine.attributes.payoutRate}
            maxValue={100}
            color={theme.colors.success}
          />
          <AttributeBar
            label="Jackpot Chance"
            value={currentMachine.attributes.jackpotChance}
            maxValue={10}
            color={theme.colors.warning}
          />
          <AttributeBar
            label="Crypto Bonus"
            value={currentMachine.attributes.cryptoBonus}
            maxValue={50}
            color={theme.colors.info}
          />
          <AttributeBar
            label="Max Bet"
            value={currentMachine.attributes.maxBet}
            maxValue={1000}
            color={theme.colors.primary}
            showValue={true}
          />
        </View>
      </View>
      
      {/* Available Upgrades */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Upgrades</Text>
      
      <ScrollView style={styles.upgradesContainer}>
        {upgrades.length > 0 ? (
          upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade._id}
              upgrade={upgrade}
              onPurchase={() => handlePurchaseUpgrade(upgrade._id)}
              disabled={purchasing || user.gameBalance.coins < upgrade.cost}
            />
          ))
        ) : (
          <Text style={[styles.noUpgradesText, { color: theme.colors.text }]}>
            No upgrades available for this machine. Check back later or level up your machine by playing more.
          </Text>
        )}
      </ScrollView>
      
      {/* User Balance */}
      <View style={[styles.balanceContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.balanceLabel, { color: theme.colors.text }]}>Your Balance:</Text>
        <View style={styles.balanceValue}>
          <Ionicons name="wallet" size={24} color={theme.colors.primary} />
          <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
            {user.gameBalance.coins.toLocaleString()}
          </Text>
        </View>
      </View>
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
  machineInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  machineLevel: {
    fontSize: 16,
  },
  attributesContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  upgradesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noUpgradesText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});

export default MachineUpgradeScreen;