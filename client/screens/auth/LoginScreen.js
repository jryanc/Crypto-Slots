import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import SocialLoginButton from '../../components/auth/SocialLoginButton';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const LoginScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { login, error } = useContext(AuthContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Handle login
  const handleLogin = async (values) => {
    setIsLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.requiresTwoFactor) {
        // Navigate to 2FA screen
        navigation.navigate('TwoFactorAuth', {
          tempToken: result.tempToken,
          email: values.email
        });
      } else if (!result.success) {
        // Show error
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle social login
  const handleSocialLogin = (provider) => {
    // In a real app, this would integrate with the social provider's SDK
    Alert.alert('Social Login', `${provider} login not implemented in this demo`);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/crypto-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Crypto Slots
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Play, Upgrade, Invest
            </Text>
          </View>
          
          {/* Login Form */}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        color: theme.colors.inputText,
                        borderColor: theme.colors.inputBorder
                      }
                    ]}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.text + '80'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </Text>
                )}
                
                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        color: theme.colors.inputText,
                        borderColor: theme.colors.inputBorder
                      }
                    ]}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.text + '80'}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.password}
                  </Text>
                )}
                
                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
                
                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.buttonText} />
                  ) : (
                    <Text style={[styles.loginButtonText, { color: theme.colors.buttonText }]}>
                      Login
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
          
          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={[styles.socialText, { color: theme.colors.text }]}>
              Or login with
            </Text>
            <View style={styles.socialButtons}>
              <SocialLoginButton
                provider="Google"
                icon="logo-google"
                onPress={() => handleSocialLogin('Google')}
              />
              <SocialLoginButton
                provider="Facebook"
                icon="logo-facebook"
                onPress={() => handleSocialLogin('Facebook')}
              />
              <SocialLoginButton
                provider="Apple"
                icon="logo-apple"
                onPress={() => handleSocialLogin('Apple')}
              />
            </View>
          </View>
          
          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: theme.colors.text }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flexGrow: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 8,
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialText: {
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;