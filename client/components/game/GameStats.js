import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';

const GameStats = ({ visible, onClose, machine, gameStats }) => {
  const { theme } = useContext(ThemeContext);
  
  // Calculate win rate
  const calculateWinRate = () => {
    if (!gameStats || gameStats.totalSpins === 0) return 0;
    return ((gameStats.totalWins / gameStats.totalSpins) * 100).toFixed(1);
  };
  
  // Calculate return on investment
  const calculateROI = () => {
    if (!gameStats || gameStats.totalBets === 0) return 0;
    return ((gameStats.totalWinnings / gameStats.totalBets) * 100).toFixed(1);
  };
  
  // Format large numbers
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
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
              Game Statistics
            </Text>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.statsContainer}>
            {/* Machine Stats */}
            {machine && (
              <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  {machine.name} Stats
                </Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Total Spins
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {formatNumber(machine.stats?.totalSpins)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Total Wins
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {formatNumber(machine.stats?.totalWins)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Win Rate
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {machine.stats?.totalSpins > 0
                        ? ((machine.stats.totalWins / machine.stats.totalSpins) * 100).toFixed(1)
                        : '0'}%
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Biggest Win
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {formatNumber(machine.stats?.biggestWin)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Jackpots Won
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {formatNumber(machine.stats?.jackpotsWon)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      Machine Level
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {machine.level}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* Overall Stats */}
            <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Overall Stats
              </Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Total Spins
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.totalSpins)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Total Wins
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.totalWins)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Total Losses
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.totalLosses)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Win Rate
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {calculateWinRate()}%
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Biggest Win
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.biggestWin)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Jackpots Won
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.jackpotsWon)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Financial Stats */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Financial Stats
              </Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Total Bets
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.totalBets)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Total Winnings
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatNumber(gameStats?.totalWinnings)}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Net Profit
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          gameStats?.totalWinnings - gameStats?.totalBets > 0
                            ? theme.colors.success
                            : gameStats?.totalWinnings - gameStats?.totalBets < 0
                            ? theme.colors.error
                            : theme.colors.text
                      }
                    ]}
                  >
                    {formatNumber(
                      (gameStats?.totalWinnings || 0) - (gameStats?.totalBets || 0)
                    )}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    Return on Investment
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          calculateROI() > 100
                            ? theme.colors.success
                            : calculateROI() < 100
                            ? theme.colors.error
                            : theme.colors.text
                      }
                    ]}
                  >
                    {calculateROI()}%
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.closeModalButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeModalButtonText, { color: theme.colors.buttonText }]}>
              Close
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
  statsContainer: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeModalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default GameStats;