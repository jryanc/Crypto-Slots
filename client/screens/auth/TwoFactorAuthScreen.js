import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Validation schema
const TwoFactorSchema = Yup.object().shape({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^[0-9]{6}$/, 'Code must be 6 digits')
});

const TwoFactorAuthScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { verify2FA } = useContext(AuthContext);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get temp token from route params
  const { tempToken, email } = route.params || {};
  
  // Handle verification
  const handleVerify = async (values) => {
    if (!tempToken) {
      Alert.alert('Error', 'Authentication token is missing. Please try logging in again.');
      navigation.navigate('Login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await verify2FA(tempToken, values.code);
      
      if (!result.success) {
        Alert.alert('Verification Failed', result.error || 'Invalid verification code');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      Alert.alert('Verification Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/crypto-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Two-Factor Authentication
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Enter the verification code from your authenticator app
            </Text>
          </View>
          
          {/* Email Display */}
          {email && (
            <View style={[styles.emailContainer, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="mail" size={20} color={theme.colors.primary} />
              <Text style={[styles.emailText, { color: theme.colors.text }]}>
                {email}
              </Text>
            </View>
          )}
          
          {/* Verification Form */}
          <Formik
            initialValues={{ code: '' }}
            validationSchema={TwoFactorSchema}
            onSubmit={handleVerify}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                {/* Code Input */}
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder
                  }
                ]}>
                  <TextInput
                    style={[styles.input, { color: theme.colors.inputText }]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={theme.colors.text + '80'}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    value={values.code}
                  />
                </View>
                {touched.code && errors.code && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.code}
                  </Text>
                )}
                
                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.buttonText} />
                  ) : (
                    <Text style={[styles.verifyButtonText, { color: theme.colors.buttonText }]}>
                      Verify
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
          
          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  emailText: {
    marginLeft: 8,
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  input: {
    height: 50,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  verifyButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  }
});

export default TwoFactorAuthScreen;