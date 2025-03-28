import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';

const SocialLoginButton = ({ provider, icon, onPress }) => {
  const { theme } = useContext(ThemeContext);
  
  // Get provider color
  const getProviderColor = () => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '#DB4437';
      case 'facebook':
        return '#4267B2';
      case 'apple':
        return '#000000';
      case 'twitter':
        return '#1DA1F2';
      default:
        return theme.colors.primary;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.card,
          borderColor: getProviderColor()
        }
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={24}
        color={getProviderColor()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
  }
});

export default SocialLoginButton;