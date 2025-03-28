import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';

const CryptoActionButton = ({ icon, label, onPress, color }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: color || theme.colors.primary
        }
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: color || theme.colors.primary }
        ]}
      >
        <FontAwesome5
          name={icon}
          size={20}
          color={theme.colors.buttonText}
        />
      </View>
      
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default CryptoActionButton;