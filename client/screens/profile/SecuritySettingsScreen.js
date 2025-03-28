import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// API
import {
  updateSecuritySettings,
  changePassword,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  verifyTwoFactorAuth
} from '../../api/userApi';

// Actions
import { UPDATE_SECURITY_SETTINGS } from '../../store/reducers/userReducer';

const SecuritySettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Local state
  const [biometricEnabled, setBiometricEnabled] = useState(
    user.securitySettings?.biometricEnabled || false
  );
  const [pinEnabled, setPinEnabled] = useState(
    user.securitySettings?.pinEnabled || false
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user.securitySettings?.twoFactorEnabled || false
  );
  const [transactionConfirmation, setTransactionConfirmation] = useState(
    user.securitySettings?.transactionConfirmation || false
  );
  const [loginNotifications, setLoginNotifications] = useState(
    user.securitySettings?.loginNotifications || false
  );
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [configuringTwoFactor, setConfiguringTwoFactor] = useState(false);
  
  // Handle toggle biometric
  const handleToggleBiometric = async (value) => {
    setBiometricEnabled(value);
    await updateSetting('biometricEnabled', value);
  };
  
  // Handle toggle PIN
  const handleTogglePin = async (value) => {
    setPinEnabled(value);
    
    if (value) {
      navigation.navigate('SetupPIN');
    } else {
      await updateSetting('pinEnabled', false);
    }
  };
  
  // Handle toggle two-factor
  const handleToggleTwoFactor = async (value) => {
    if (value) {
      // Enable 2FA
      try {
        setLoading(true);
        
        const response = await enableTwoFactorAuth();
        
        setTwoFactorQrCode(response.data.qrCode);
        setTwoFactorSecret(response.data.secret);
        setConfiguringTwoFactor(true);
        
        setLoading(false);
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        setLoading(false);
        
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to enable two-factor authentication'
        );
      }
    } else {
      // Disable 2FA
      try {
        setLoading(true);
        
        await disableTwoFactorAuth();
        
        // Update user data
        updateUser({
          securitySettings: {
            ...user.securitySettings,
            twoFactorEnabled: false
          }
        });
        
        // Update redux state
        dispatch({
          type: UPDATE_SECURITY_SETTINGS,
          payload: {
            twoFactorEnabled: false
          }
        });
        
        setTwoFactorEnabled(false);
        setLoading(false);
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        setLoading(false);
        
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to disable two-factor authentication'
        );
      }
    }
  };
  
  // Handle toggle transaction confirmation
  const handleToggleTransactionConfirmation = async (value) => {
    setTransactionConfirmation(value);
    await updateSetting('transactionConfirmation', value);
  };
  
  // Handle toggle login notifications
  const handleToggleLoginNotifications = async (value) => {
    setLoginNotifications(value);
    await updateSetting('loginNotifications', value);
  };
  
  // Update security setting
  const updateSetting = async (key, value) => {
    try {
      setLoading(true);
      
      const settings = {
        [key]: value
      };
      
      const response = await updateSecuritySettings(settings);
      
      // Update user data
      updateUser({
        securitySettings: response.data
      });
      
      // Update redux state
      dispatch({
        type: UPDATE_SECURITY_SETTINGS,
        payload: response.data
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating security setting:', error);
      setLoading(false);
      
      // Revert the toggle if update fails
      if (key === 'biometricEnabled') setBiometricEnabled(!value);
      if (key === 'pinEnabled') setPinEnabled(!value);
      if (key === 'transactionConfirmation') setTransactionConfirmation(!value);
      if (key === 'loginNotifications') setLoginNotifications(!value);
      
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Failed to update security setting'
      );
    }
  };
  
  // Handle change password
  const handleChangePassword = async () => {
    // Validate passwords
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      await changePassword(currentPassword, newPassword);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setChangingPassword(false);
      
      Alert.alert('Success', 'Your password has been changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      setChangingPassword(false);
      
      Alert.alert(
        'Change Failed',
        error.response?.data?.message || 'Failed to change password'
      );
    }
  };
  
  // Handle verify two-factor
  const handleVerifyTwoFactor = async () => {
    if (!twoFactorCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      await verifyTwoFactorAuth(twoFactorCode);
      
      // Update user data
      updateUser({
        securitySettings: {
          ...user.securitySettings,
          twoFactorEnabled: true
        }
      });
      
      // Update redux state
      dispatch({
        type: UPDATE_SECURITY_SETTINGS,
        payload: {
          twoFactorEnabled: true
        }
      });
      
      setTwoFactorEnabled(true);
      setConfiguringTwoFactor(false);
      setTwoFactorCode('');
      
      setLoading(false);
      
      Alert.alert('Success', 'Two-factor authentication has been enabled');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setLoading(false);
      
      Alert.alert(
        'Verification Failed',
        error.response?.data?.message || 'Failed to verify two-factor authentication'
      );
    }
  };
  
  // Handle cancel two-factor setup
  const handleCancelTwoFactorSetup = () => {
    setConfiguringTwoFactor(false);
    setTwoFactorCode('');
    setTwoFactorQrCode('');
    setTwoFactorSecret('');
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Security Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security Options</Text>
          
          {/* Biometric Authentication */}
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={24} color={theme.colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Biometric Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                  Use fingerprint or face recognition to log in
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          {/* PIN Authentication */}
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="keypad" size={24} color={theme.colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  PIN Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                  Use a 6-digit PIN to log in
                </Text>
              </View>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handleTogglePin}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          {/* Two-Factor Authentication */}
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Two-Factor Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                  Require a verification code when logging in
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading || configuringTwoFactor}
            />
          </View>
          
          {/* Transaction Confirmation */}
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Transaction Confirmation
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                  Require confirmation for all transactions
                </Text>
              </View>
            </View>
            <Switch
              value={transactionConfirmation}
              onValueChange={handleToggleTransactionConfirmation}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
          
          {/* Login Notifications */}
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={theme.colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Login Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                  Receive notifications for new login attempts
                </Text>
              </View>
            </View>
            <Switch
              value={loginNotifications}
              onValueChange={handleToggleLoginNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="white"
              disabled={loading}
            />
          </View>
        </View>
        
        {/* Two-Factor Setup */}
        {configuringTwoFactor && (
          <View style={[styles.twoFactorSetup, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.twoFactorTitle, { color: theme.colors.text }]}>
              Set Up Two-Factor Authentication
            </Text>
            
            <Text style={[styles.twoFactorInstructions, { color: theme.colors.text }]}>
              1. Download an authenticator app like Google Authenticator or Authy
            </Text>
            <Text style={[styles.twoFactorInstructions, { color: theme.colors.text }]}>
              2. Scan the QR code or enter the secret key manually
            </Text>
            <Text style={[styles.twoFactorInstructions, { color: theme.colors.text }]}>
              3. Enter the verification code from the app
            </Text>
            
            {twoFactorQrCode && (
              <View style={styles.qrCodeContainer}>
                <Image
                  source={{ uri: twoFactorQrCode }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
            )}
            
            {twoFactorSecret && (
              <View style={styles.secretContainer}>
                <Text style={[styles.secretLabel, { color: theme.colors.text }]}>
                  Secret Key:
                </Text>
                <Text style={[styles.secretValue, { color: theme.colors.primary }]}>
                  {twoFactorSecret}
                </Text>
              </View>
            )}
            
            <View style={styles.verificationContainer}>
              <Text style={[styles.verificationLabel, { color: theme.colors.text }]}>
                Verification Code:
              </Text>
              <TextInput
                style={[
                  styles.verificationInput,
                  { backgroundColor: theme.colors.background, color: theme.colors.text }
                ]}
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor={theme.colors.border}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            
            <View style={styles.twoFactorButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={handleCancelTwoFactorSetup}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: theme.colors.primary },
                  loading && { opacity: 0.7 }
                ]}
                onPress={handleVerifyTwoFactor}
                disabled={loading || twoFactorCode.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Change Password */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Change Password</Text>
          
          <View style={[styles.passwordContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.passwordField}>
              <Text style={[styles.passwordLabel, { color: theme.colors.text }]}>
                Current Password
              </Text>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: theme.colors.background, color: theme.colors.text }
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.border}
                secureTextEntry
              />
            </View>
            
            <View style={styles.passwordField}>
              <Text style={[styles.passwordLabel, { color: theme.colors.text }]}>
                New Password
              </Text>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: theme.colors.background, color: theme.colors.text }
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.border}
                secureTextEntry
              />
            </View>
            
            <View style={styles.passwordField}>
              <Text style={[styles.passwordLabel, { color: theme.colors.text }]}>
                Confirm New Password
              </Text>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: theme.colors.background, color: theme.colors.text }
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.border}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.changePasswordButton,
                { backgroundColor: theme.colors.primary },
                changingPassword && { opacity: 0.7 }
              ]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Account Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Security</Text>
          
          <TouchableOpacity
            style={[styles.securityOption, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('LoginHistory')}
          >
            <Ionicons name="time" size={24} color={theme.colors.primary} />
            <Text style={[styles.securityOptionText, { color: theme.colors.text }]}>
              Login History
            </Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.securityOption, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('DeviceManagement')}
          >
            <Ionicons name="phone-portrait" size={24} color={theme.colors.primary} />
            <Text style={[styles.securityOptionText, { color: theme.colors.text }]}>
              Device Management
            </Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.securityOption, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
            <Text style={[styles.securityOptionText, { color: theme.colors.text }]}>
              Account Recovery Options
            </Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
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
  content: {
    flex: 1,
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
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  twoFactorSetup: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  twoFactorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  twoFactorInstructions: {
    fontSize: 14,
    marginBottom: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secretLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  secretValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationContainer: {
    marginBottom: 16,
  },
  verificationLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  verificationInput: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 8,
  },
  twoFactorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  passwordField: {
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  passwordInput: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  changePasswordButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  securityOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
});

export default SecuritySettingsScreen;