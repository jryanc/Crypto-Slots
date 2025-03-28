import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// API
import { fetchLeaderboard } from '../../api/leaderboardApi';

const LeaderboardScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Local state
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('coins'); // 'coins', 'crypto', 'wins'
  const [timeFrame, setTimeFrame] = useState('weekly'); // 'daily', 'weekly', 'allTime'
  
  // Load leaderboard data
  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType, timeFrame]);
  
  // Load leaderboard data
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetchLeaderboard(leaderboardType, timeFrame);
      setLeaderboard(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.response?.data?.message || 'Failed to load leaderboard data');
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };
  
  // Get user rank
  const getUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.userId === user._id);
    return userEntry ? userEntry.rank : 'N/A';
  };
  
  // Render leaderboard item
  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.userId === user._id;
    const rankColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.colors.text;
    
    return (
      <View
        style={[
          styles.leaderboardItem,
          { backgroundColor: isCurrentUser ? theme.colors.card : 'transparent' },
          isCurrentUser && { borderColor: theme.colors.primary, borderWidth: 1 }
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: rankColor }]}>#{item.rank}</Text>
        </View>
        
        <View style={styles.userContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.username,
                { color: isCurrentUser ? theme.colors.primary : theme.colors.text }
              ]}
            >
              {item.username}
              {isCurrentUser && ' (You)'}
            </Text>
            <Text style={[styles.userLevel, { color: theme.colors.text }]}>
              Level {item.level}
            </Text>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          {leaderboardType === 'coins' && (
            <View style={styles.scoreWrapper}>
              <Ionicons name="wallet" size={16} color={theme.colors.primary} />
              <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                {item.score.toLocaleString()}
              </Text>
            </View>
          )}
          
          {leaderboardType === 'crypto' && (
            <View style={styles.scoreWrapper}>
              <FontAwesome5 name="bitcoin" size={16} color="#F7931A" />
              <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                {item.score.toFixed(8)}
              </Text>
            </View>
          )}
          
          {leaderboardType === 'wins' && (
            <View style={styles.scoreWrapper}>
              <Ionicons name="trophy" size={16} color={theme.colors.primary} />
              <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                {item.score}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* User Rank */}
      <View style={[styles.userRankContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.userRankLabel, { color: theme.colors.text }]}>Your Rank</Text>
        <Text style={[styles.userRankValue, { color: theme.colors.primary }]}>
          #{getUserRank()}
        </Text>
      </View>
      
      {/* Leaderboard Type Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            leaderboardType === 'coins' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setLeaderboardType('coins')}
        >
          <Ionicons
            name="wallet"
            size={20}
            color={leaderboardType === 'coins' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: leaderboardType === 'coins' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Coins
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            leaderboardType === 'crypto' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setLeaderboardType('crypto')}
        >
          <FontAwesome5
            name="bitcoin"
            size={20}
            color={leaderboardType === 'crypto' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: leaderboardType === 'crypto' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Crypto
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            leaderboardType === 'wins' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setLeaderboardType('wins')}
        >
          <Ionicons
            name="trophy"
            size={20}
            color={leaderboardType === 'wins' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: leaderboardType === 'wins' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Wins
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Time Frame Tabs */}
      <View style={[styles.timeFrameContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.timeFrameTab,
            timeFrame === 'daily' && [styles.activeTimeFrameTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setTimeFrame('daily')}
        >
          <Text
            style={[
              styles.timeFrameText,
              { color: timeFrame === 'daily' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFrameTab,
            timeFrame === 'weekly' && [styles.activeTimeFrameTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setTimeFrame('weekly')}
        >
          <Text
            style={[
              styles.timeFrameText,
              { color: timeFrame === 'weekly' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFrameTab,
            timeFrame === 'allTime' && [styles.activeTimeFrameTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setTimeFrame('allTime')}
        >
          <Text
            style={[
              styles.timeFrameText,
              { color: timeFrame === 'allTime' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Leaderboard Header */}
      <View style={styles.leaderboardHeader}>
        <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
          {timeFrame === 'daily' ? 'Daily' : timeFrame === 'weekly' ? 'Weekly' : 'All Time'} Leaderboard
        </Text>
        <Text style={[styles.leaderboardSubtitle, { color: theme.colors.text }]}>
          {leaderboardType === 'coins'
            ? 'Top players by coins earned'
            : leaderboardType === 'crypto'
            ? 'Top players by crypto earned'
            : 'Top players by wins'}
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Leaderboard */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading leaderboard...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadLeaderboard}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.buttonText }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={renderLeaderboardItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.leaderboardList}
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
              No leaderboard data available.
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
  navigationHeader: {
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
  userRankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  userRankLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  userRankValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  timeFrameContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeFrameTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTimeFrameTab: {
    borderBottomWidth: 2,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  leaderboardList: {
    paddingBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
  },
  scoreContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
});

export default LeaderboardScreen;