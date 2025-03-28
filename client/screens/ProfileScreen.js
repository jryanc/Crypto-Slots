import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Context
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// API
import { fetchUserProfile, updateUserProfile, uploadProfileImage } from '../api/userApi';

// Actions
import { UPDATE_USER_PROFILE } from '../store/reducers/userReducer';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout, updateUser } = useContext(AuthContext);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.preferences?.notifications || false
  );
  const [soundEnabled, setSoundEnabled] = useState(
    user.preferences?.sound || true
  );
  const [vibrationEnabled, setVibrationEnabled] = useState(
    user.preferences?.vibration || true
  );
  const [darkMode, setDarkMode] = useState(theme.dark);
  
  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);
  
  // Load user profile
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchUserProfile();
      
      dispatch({
        type: UPDATE_USER_PROFILE,
        payload: response.data
      });
      
      // Update local state
      setNotificationsEnabled(response.data.preferences?.notifications || false);
      setSoundEnabled(response.data.preferences?.sound || true);
      setVibrationEnabled(response.data.preferences?.vibration || true);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load profile data'
      );
    }
  };
  
  // Handle profile image selection
  const handleSelectProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting profile image:', error);
      Alert.alert('Error', 'Failed to select profile image');
    }
  };
  
  // Upload profile image
  const uploadImage = async (uri) => {
    try {
      setUploadingImage(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        name: 'profile-image.jpg',
        type: 'image/jpeg',
      });
      
      // Upload image
      const response = await uploadProfileImage(formData);
      
      // Update user data
      updateUser({
        profileImage: response.data.profileImage
      });
      
      setUploadingImage(false);
      
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setUploadingImage(false);
      
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload profile image'
      );
    }
  };
  
  // Handle toggle notifications
  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await updatePreference('notifications', value);
  };
  
  // Handle toggle sound
  const handleToggleSound = async (value) => {
    setSoundEnabled(value);
    await updatePreference('sound', value);
  };
  
  // Handle toggle vibration
  const handleToggleVibration = async (value) => {
    setVibrationEnabled(value);
    await updatePreference('vibration', value);
  };
  
  // Handle toggle dark mode
  const handleToggleDarkMode = (value) => {
    setDarkMode(value);
    toggleTheme();
  };
  
  // Update user preference
  const updatePreference = async (key, value) => {
    try {
      const preferences = {
        ...user.preferences,
        [key]: value
      };
      
      await updateUserProfile({ preferences });
      
      updateUser({
        preferences
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      
      // Revert the toggle if update fails
      if (key === 'notifications') setNotificationsEnabled(!value);
      if (key === 'sound') setSoundEnabled(!value);
      if (key === 'vibration') setVibrationEnabled(!value);
      
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Failed to update preference'
      );
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading profile...
        </Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.profileCard}
        >
          {/* Profile Image */}
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleSelectProfileImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="white" />
            ) : user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          {/* User Info */}
          <Text style={styles.username}>{user.username || 'User'}</Text>
          <Text style={styles.email}>{user.email || 'No email'}</Text>
          
          {/* User Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.level || 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.gameStats?.totalWins || 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.gameBalance?.coins?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="person" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <Ionicons name="shield" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Security Settings</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Vibration</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleToggleVibration}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>
        
        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.text }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 24,
    opacity: 0.5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});

export default ProfileScreen;