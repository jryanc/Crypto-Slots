import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../../contexts/ThemeContext';

const MachineSelector = ({ visible, machines, selectedMachine, onSelect, onClose }) => {
  const { theme } = useContext(ThemeContext);
  
  // Get machine image based on type
  const getMachineImage = (type) => {
    // In a real app, this would load actual images
    switch (type) {
      case 'basic':
        return require('../../assets/images/basic-machine.png');
      case 'premium':
        return require('../../assets/images/premium-machine.png');
      case 'deluxe':
        return require('../../assets/images/deluxe-machine.png');
      case 'crypto':
        return require('../../assets/images/crypto-machine.png');
      case 'jackpot':
        return require('../../assets/images/jackpot-machine.png');
      default:
        return require('../../assets/images/basic-machine.png');
    }
  };
  
  // Render machine item
  const renderMachineItem = ({ item }) => {
    const isSelected = item._id === selectedMachine;
    
    return (
      <TouchableOpacity
        style={[
          styles.machineItem,
          {
            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border
          }
        ]}
        onPress={() => onSelect(item._id)}
      >
        <View style={styles.machineImageContainer}>
          <Image
            source={getMachineImage(item.type)}
            style={styles.machineImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.machineInfo}>
          <Text style={[styles.machineName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          
          <Text style={[styles.machineType, { color: theme.colors.text }]}>
            Type: {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          
          <Text style={[styles.machineLevel, { color: theme.colors.text }]}>
            Level: {item.level}
          </Text>
          
          <View style={styles.machineStats}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.attributes?.spinSpeed || 1}x
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="cash" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.attributes?.payoutMultiplier || 1}x
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="apps" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.attributes?.reels || 3}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="logo-bitcoin" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {(item.attributes?.cryptoEarningRate || 0.01) * 100}%
              </Text>
            </View>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Machine
            </Text>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={machines}
            renderItem={renderMachineItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.machineList}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              onClose();
              // In a real app, this would navigate to the shop
              // navigation.navigate('ShopTab', { screen: 'MachineShop' });
            }}
          >
            <Ionicons name="cart" size={20} color={theme.colors.buttonText} />
            <Text style={[styles.shopButtonText, { color: theme.colors.buttonText }]}>
              Shop for New Machines
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  machineList: {
    paddingBottom: 16,
  },
  machineItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    position: 'relative',
  },
  machineImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  machineImage: {
    width: 70,
    height: 70,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  machineType: {
    fontSize: 14,
    marginBottom: 2,
  },
  machineLevel: {
    fontSize: 14,
    marginBottom: 8,
  },
  machineStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  shopButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default MachineSelector;