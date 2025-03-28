import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import NotificationItem from '../../components/profile/NotificationItem';

// API
import { updateNotificationSettings, fetchNotifications, markNotificationAsRead } from '../../api/userApi';

// Actions
import { UPDATE_NOTIFICATION_SETTINGS, SET_NOTIFICATIONS, MARK_NOTIFICATION_READ } from '../../store/reducers/userReducer';

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Redux state
  const { notifications } = useSelector(state => state.user);
  
  // Local state
  const [pushEnabled, setPushEnabled] = useState(
    user.notificationSettings?.push || false
  );
  const [emailEnabled, setEmailEnabled] = useState(
    user.notificationSettings?.email || false
  );
  const [gameUpdatesEnabled, setGameUpdatesEnabled] = useState(
    user.notificationSettings?.gameUpdates || false
  );
  const [promotionsEnabled, setPromotionsEnabled] = useState(
    user.notificationSettings?.promotions || false
  );
  const [achievementsEnabled, setAchievementsEnabled] = useState(
    user.notificationSettings?.achievements || false
  );
  const [friendActivityEnabled, setFriendActivityEnabled] = useState(
    user.notificationSettings?.friendActivity || false
  );
  
  const [loading, setLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread'
  
  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      
      const response = await fetchNotifications();
      
      dispatch({
        type: SET_NOTIFICATIONS,
        payload: response.data
      });
      
      setLoadingNotifications(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoadingNotifications(false);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load notifications'
      );
    }
  };
  
  // Handle toggle push notifications
  const handleTogglePush = async (value) => {
    setPushEnabled(value);
    await updateSetting('push', value);
  };
  
  // Handle toggle email notifications
  const handleToggleEmail = async (value) => {
    setEmailEnabled(value);
    await updateSetting('email', value);
  };
  
  // Handle toggle game updates
  const handleToggleGameUpdates = async (value) => {
    setGameUpdatesEnabled(value);
    await updateSetting('gameUpdates', value);
  };
  
  // Handle toggle promotions
  const handleTogglePromotions = async (value) => {
    setPromotionsEnabled(value);
    await updateSetting('promotions', value);
  };
  
  // Handle toggle achievements
  const handleToggleAchievements = async (value) => {
    setAchievementsEnabled(value);
    await updateSetting('achievements', value);
  };
  
  // Handle toggle friend activity
  const handleToggleFriendActivity = async (value) => {
    setFriendActivityEnabled(value);
    await updateSetting('friendActivity', value);
  };
  
  // Update notification setting
  const updateSetting = async (key, value) => {
    try {
      setLoading(true);
      
      const settings = {
        [key]: value
      };
      
      const response = await updateNotificationSettings(settings);
      
      dispatch({
        type: UPDATE_NOTIFICATION_SETTINGS,
        payload: response.data
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating notification setting:', error);
      setLoading(false);
      
      // Revert the toggle if update fails
      if (key === 'push') setPushEnabled(!value);
      if (key === 'email') setEmailEnabled(!value);
      if (key === 'gameUpdates') setGameUpdatesEnabled(!value);
      if (key === 'promotions') setPromotionsEnabled(!value);
      if (key === 'achievements') setAchievementsEnabled(!value);
      if (key === 'friendActivity') setFriendActivityEnabled(!value);
      
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Failed to update notification setting'
      );
    }
  };
  
  // Handle notification press
  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        
        dispatch({
          type: MARK_NOTIFICATION_READ,
          payload: notification._id
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    if (notification.type === 'achievement') {
      navigation.navigate('Achievements');
    } else if (notification.type === 'game_update') {
      navigation.navigate('HomeTab');
    } else if (notification.type === 'promotion') {
      navigation.navigate('ShopTab');
    } else if (notification.type === 'friend_activity') {
      navigation.navigate('Friends');
    }
  };
  
  // Get filtered notifications
  const getFilteredNotifications = () => {
    if (!notifications) {
      return [];
    }
    
    if (activeTab === 'all') {
      return notifications;
    } else {
      return notifications.filter(notification => !notification.read);
    }
  };
  
  // Render notification item
  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );
  
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'unread' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('unread')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'unread' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Notifications List */}
      {loadingNotifications ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredNotifications()}
          keyExtractor={(item) => item._id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.notificationsList}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {activeTab === 'all'
                ? 'No notifications yet.'
                : 'No unread notifications.'}
            </Text>
          }
        />
      )}
      
      {/* Settings */}
      <ScrollView style={styles.settingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notification Settings</Text>
        
        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Channels</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Email Notifications
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={handleToggleEmail}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
        </View>
        
        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Types</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="game-controller" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Game Updates
              </Text>
            </View>
            <Switch
              value={gameUpdatesEnabled}
              onValueChange={handleToggleGameUpdates}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="gift" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Promotions & Offers
              </Text>
            </View>
            <Switch
              value={promotionsEnabled}
              onValueChange={handleTogglePromotions}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="trophy" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Achievements
              </Text>
            </View>
            <Switch
              value={achievementsEnabled}
              onValueChange={handleToggleAchievements}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="people" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Friend Activity
              </Text>
            </View>
            <Switch
              value={friendActivityEnabled}
              onValueChange={handleToggleFriendActivity}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  },
  settingsContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 16,
    fontSize: 16,
  },
});

export default NotificationsScreen;