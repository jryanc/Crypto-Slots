import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// API
import { fetchAchievements } from '../../api/achievementApi';

// Progress bar component based on platform
const ProgressBar = ({ progress, color }) => {
  return Platform.OS === 'ios' ? (
    <ProgressViewIOS progress={progress} progressTintColor={color} />
  ) : (
    <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={progress} color={color} />
  );
};

const AchievementsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Local state
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'inProgress'
  
  // Load achievements data
  useEffect(() => {
    loadAchievements();
  }, []);
  
  // Load achievements data
  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetchAchievements();
      setAchievements(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError(error.response?.data?.message || 'Failed to load achievements data');
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };
  
  // Filter achievements
  const filteredAchievements = () => {
    if (filter === 'all') {
      return achievements;
    } else if (filter === 'completed') {
      return achievements.filter(achievement => achievement.completed);
    } else if (filter === 'inProgress') {
      return achievements.filter(achievement => !achievement.completed && achievement.progress > 0);
    }
    return achievements;
  };
  
  // Get achievement icon
  const getAchievementIcon = (category) => {
    switch (category) {
      case 'game':
        return <MaterialCommunityIcons name="slot-machine" size={24} color={theme.colors.primary} />;
      case 'crypto':
        return <FontAwesome5 name="bitcoin" size={24} color="#F7931A" />;
      case 'social':
        return <Ionicons name="people" size={24} color={theme.colors.success} />;
      case 'special':
        return <Ionicons name="star" size={24} color={theme.colors.warning} />;
      default:
        return <Ionicons name="trophy" size={24} color={theme.colors.primary} />;
    }
  };
  
  // Render achievement item
  const renderAchievementItem = ({ item }) => {
    const isCompleted = item.completed;
    const progress = item.progress / item.target;
    
    return (
      <Animatable.View
        animation={isCompleted ? 'pulse' : undefined}
        iterationCount={isCompleted ? 1 : undefined}
        style={[
          styles.achievementItem,
          {
            backgroundColor: theme.colors.card,
            opacity: isCompleted ? 1 : 0.8
          }
        ]}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIconContainer}>
            {getAchievementIcon(item.category)}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.achievementCategory, { color: theme.colors.text }]}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
        
        <Text style={[styles.achievementDescription, { color: theme.colors.text }]}>
          {item.description}
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={isCompleted ? theme.colors.success : theme.colors.primary}
          />
          
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {item.progress} / {item.target} ({Math.round(progress * 100)}%)
          </Text>
        </View>
        
        {isCompleted && (
          <View style={styles.rewardContainer}>
            <Text style={[styles.rewardLabel, { color: theme.colors.text }]}>Reward:</Text>
            <Text style={[styles.rewardValue, { color: theme.colors.primary }]}>
              {item.reward.type === 'coins' && `${item.reward.amount} Coins`}
              {item.reward.type === 'crypto' && `${item.reward.amount} ${item.reward.cryptoType}`}
              {item.reward.type === 'item' && item.reward.itemName}
            </Text>
          </View>
        )}
        
        {isCompleted && (
          <Text style={[styles.completedDate, { color: theme.colors.text }]}>
            Completed on {new Date(item.completedDate).toLocaleDateString()}
          </Text>
        )}
      </Animatable.View>
    );
  };
  
  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Achievement Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {achievements.filter(a => a.completed).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Completed</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {achievements.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Total</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100) || 0}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Completion</Text>
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
              styles.filterText,
              { color: filter === 'all' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'completed' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'inProgress' && [styles.activeFilterTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilter('inProgress')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'inProgress' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Achievements List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading achievements...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadAchievements}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.buttonText }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAchievements()}
          keyExtractor={(item) => item._id}
          renderItem={renderAchievementItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.achievementsList}
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
              {filter === 'all'
                ? 'No achievements available.'
                : filter === 'completed'
                ? 'No completed achievements yet. Keep playing to earn achievements!'
                : 'No achievements in progress. Start playing to work towards achievements!'}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsList: {
    paddingBottom: 16,
  },
  achievementItem: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementCategory: {
    fontSize: 12,
    opacity: 0.7,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedDate: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
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
    paddingHorizontal: 32,
  },
});

export default AchievementsScreen;