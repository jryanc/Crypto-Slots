import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Context
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// Components
import DailyRewardCard from '../components/home/DailyRewardCard';
import GameStatsCard from '../components/home/GameStatsCard';
import MachineCard from '../components/home/MachineCard';
import CryptoSummaryCard from '../components/home/CryptoSummaryCard';
import NewsCard from '../components/home/NewsCard';

// API
import { fetchUserStats, claimDailyReward } from '../api/userApi';
import { fetchMachines } from '../api/machineApi';
import { fetchCryptoSummary } from '../api/cryptoApi';
import { fetchNews } from '../api/newsApi';

// Actions
import { UPDATE_USER_STATS } from '../store/reducers/userReducer';
import { SET_MACHINES } from '../store/reducers/machineReducer';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const { machines, selectedMachine } = useSelector(state => state.machines);
  const { balances, totalUsdValue } = useSelector(state => state.crypto);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [news, setNews] = useState([]);
  const [showAllMachines, setShowAllMachines] = useState(false);
  
  // Load data on mount
  useEffect(() => {
    loadHomeData();
    checkDailyReward();
  }, []);
  
  // Load all home data
  const loadHomeData = async () => {
    try {
      await Promise.all([
        loadUserStats(),
        loadMachines(),
        loadCryptoSummary(),
        loadNews()
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };
  
  // Check if daily reward is available
  const checkDailyReward = () => {
    const lastRewardDate = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
    const now = new Date();
    
    // If no last reward or last reward was yesterday or earlier
    if (!lastRewardDate || 
        lastRewardDate.getDate() !== now.getDate() || 
        lastRewardDate.getMonth() !== now.getMonth() || 
        lastRewardDate.getFullYear() !== now.getFullYear()) {
      
      // Calculate reward amount based on user level and streak
      const baseAmount = 100;
      const levelBonus = user.level * 10;
      const streakBonus = user.dailyRewardStreak * 5;
      const rewardAmount = baseAmount + levelBonus + streakBonus;
      
      setDailyRewardAvailable(true);
      setDailyRewardAmount(rewardAmount);
    } else {
      setDailyRewardAvailable(false);
    }
  };
  
  // Load user stats
  const loadUserStats = async () => {
    try {
      const response = await fetchUserStats();
      
      dispatch({
        type: UPDATE_USER_STATS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  // Load machines
  const loadMachines = async () => {
    try {
      const response = await fetchMachines();
      
      dispatch({
        type: SET_MACHINES,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };
  
  // Load crypto summary
  const loadCryptoSummary = async () => {
    try {
      await fetchCryptoSummary();
    } catch (error) {
      console.error('Error fetching crypto summary:', error);
    }
  };
  
  // Load news
  const loadNews = async () => {
    try {
      const response = await fetchNews();
      setNews(response.data.slice(0, 3)); // Show only 3 news items
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    checkDailyReward();
    setRefreshing(false);
  };
  
  // Handle daily reward claim
  const handleClaimDailyReward = async () => {
    try {
      const response = await claimDailyReward();
      
      // Update user data
      updateUser({
        gameBalance: response.data.currentBalance,
        lastDailyReward: new Date(),
        dailyRewardStreak: response.data.newStreak
      });
      
      // Show success message
      Alert.alert(
        'Daily Reward Claimed!',
        `You received ${dailyRewardAmount} coins. Come back tomorrow for more rewards!`,
        [{ text: 'OK' }]
      );
      
      // Update state
      setDailyRewardAvailable(false);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to claim daily reward. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Navigate to slot machine
  const navigateToSlotMachine = (machineId) => {
    navigation.navigate('GameTab', {
      screen: 'SlotMachine',
      params: { machineId }
    });
  };
  
  // Get current machine
  const currentMachine = machines.find(m => m._id === selectedMachine) || null;
  
  // Get machines to display
  const displayMachines = showAllMachines ? machines : machines.slice(0, 3);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {user.username || 'User'}
            </Text>
            <Text style={[styles.level, { color: theme.colors.text }]}>
              Level {user.level || 1}
            </Text>
          </View>
        </View>
        
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={24} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance?.coins?.toLocaleString() || 0}
          </Text>
        </View>
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
        {/* Daily Reward */}
        {dailyRewardAvailable && (
          <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
            <DailyRewardCard
              amount={dailyRewardAmount}
              streak={user.dailyRewardStreak || 0}
              onClaim={handleClaimDailyReward}
            />
          </Animatable.View>
        )}
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('GameTab')}
          >
            <MaterialCommunityIcons name="slot-machine" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Play</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Ionicons name="cart" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Shop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('CryptoTab')}
          >
            <FontAwesome5 name="bitcoin" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Crypto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Ranks</Text>
          </TouchableOpacity>
        </View>
        
        {/* Game Stats */}
        <GameStatsCard
          stats={user.gameStats || {}}
          onPress={() => navigation.navigate('Achievements')}
        />
        
        {/* Your Machines */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Machines</Text>
            <TouchableOpacity onPress={() => setShowAllMachines(!showAllMachines)}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                {showAllMachines ? 'Show Less' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.machinesContainer}>
            {displayMachines.length > 0 ? (
              displayMachines.map((machine) => (
                <MachineCard
                  key={machine._id}
                  machine={machine}
                  isSelected={machine._id === selectedMachine}
                  onPress={() => navigateToSlotMachine(machine._id)}
                />
              ))
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No machines available. Visit the shop to purchase your first machine!
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('ShopTab', { screen: 'MachineShop' })}
          >
            <Text style={[styles.shopButtonText, { color: theme.colors.buttonText }]}>
              Visit Machine Shop
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Crypto Summary */}
        <CryptoSummaryCard
          balances={balances}
          totalValue={totalUsdValue}
          onPress={() => navigation.navigate('CryptoTab')}
        />
        
        {/* News */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Latest News</Text>
          </View>
          
          <View style={styles.newsContainer}>
            {news.length > 0 ? (
              news.map((item, index) => (
                <NewsCard
                  key={index}
                  title={item.title}
                  summary={item.summary}
                  date={item.date}
                  imageUrl={item.imageUrl}
                />
              ))
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No news available at the moment.
              </Text>
            )}
          </View>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  level: {
    fontSize: 14,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionButton: {
    width: (width - 48) / 4,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  quickActionText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  machinesContainer: {
    marginBottom: 16,
  },
  shopButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newsContainer: {
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 24,
  },
});

export default HomeScreen;