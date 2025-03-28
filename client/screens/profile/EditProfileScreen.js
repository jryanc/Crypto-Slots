import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// API
import { updateUserProfile, uploadProfileImage } from '../../api/userApi';

// Actions
import { UPDATE_USER_PROFILE } from '../../store/reducers/userReducer';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Local state
  const [username, setUsername] = useState(user.username || '');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
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
      
      // Update local state
      setProfileImage(response.data.profileImage);
      
      // Update user data
      updateUser({
        profileImage: response.data.profileImage
      });
      
      setUploadingImage(false);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setUploadingImage(false);
      
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload profile image'
      );
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const profileData = {
        username,
        displayName,
        bio,
        email,
        phone
      };
      
      const response = await updateUserProfile(profileData);
      
      // Update redux state
      dispatch({
        type: UPDATE_USER_PROFILE,
        payload: response.data
      });
      
      // Update context
      updateUser(response.data);
      
      setSaving(false);
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert(
          'Update Failed',
          error.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      }
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImageWrapper}
              onPress={handleSelectProfileImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.editImageButton, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.changePhotoText, { color: theme.colors.text }]}>
              Tap to change profile photo
            </Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                  errors.username && { borderColor: theme.colors.error, borderWidth: 1 }
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={theme.colors.border}
              />
              {errors.username && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.username}
                </Text>
              )}
            </View>
            
            {/* Display Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Display Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text }
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter display name"
                placeholderTextColor={theme.colors.border}
              />
            </View>
            
            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Bio</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: theme.colors.card, color: theme.colors.text }
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                  errors.email && { borderColor: theme.colors.error, borderWidth: 1 }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor={theme.colors.border}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>
            
            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Phone</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text }
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.border}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default EditProfileScreen;