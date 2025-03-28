import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import SessionStatCard from '../../components/game/SessionStatCard';
import SpinHistoryItem from '../../components/game/SpinHistoryItem';

// API
import { fetchGameSession, endGameSession } from '../../api/gameApi';

// Actions
import { END_GAME_SESSION } from '../../store/reducers/gameReducer';

const GameSessionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Get session ID from route params
  const { sessionId } = route.params || {};
  
  // Local state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);
  
  // Load session data
  const loadSessionData = async () => {
    try {
      setLoading(true);
      const response = await fetchGameSession(sessionId);
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game session:', error);
      setError(error.response?.data?.message || 'Failed to load session data');
      setLoading(false);
    }
  };
  
  // Handle end session
  const handleEndSession = async () => {
    try {
      await endGameSession(sessionId);
      
      dispatch({
        type: END_GAME_SESSION,
        payload: sessionId
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error ending game session:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to end session. Please try again.'
      );
    }
  };
  
  // Calculate session stats
  const calculateStats = () => {
    if (!session) return null;
    
    const totalSpins = session.spins.length;
    const totalWins = session.spins.filter(spin => spin.isWin).length;
    const totalLosses = totalSpins - totalWins;
    const winRate = totalSpins > 0 ? (totalWins / totalSpins) * 100 : 0;
    
    const totalBet = session.spins.reduce((sum, spin) => sum + spin.betAmount, 0);
    const totalWinAmount = session.spins.reduce((sum, spin) => sum + (spin.winAmount || 0), 0);
    const netProfit = totalWinAmount - totalBet;
    
    const biggestWin = Math.max(...session.spins.map(spin => spin.winAmount || 0));
    
    return {
      totalSpins,
      totalWins,
      totalLosses,
      winRate,
      totalBet,
      totalWinAmount,
      netProfit,
      biggestWin
    };
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading session data...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Get session stats
  const stats = calculateStats();
  
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Game Session</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Session Info */}
      <View style={[styles.sessionInfo, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>
          {session.machine.name} (Level {session.machine.level})
        </Text>
        <Text style={[styles.sessionDate, { color: theme.colors.text }]}>
          {new Date(session.startTime).toLocaleString()}
        </Text>
        <Text style={[styles.sessionDuration, { color: theme.colors.text }]}>
          Duration: {formatDuration(session.duration || 0)}
        </Text>
      </View>
      
      {/* Session Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <SessionStatCard
            title="Total Spins"
            value={stats.totalSpins}
            icon="refresh"
            color={theme.colors.primary}
          />
          <SessionStatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon="stats-chart"
            color={theme.colors.success}
          />
        </View>
        
        <View style={styles.statsRow}>
          <SessionStatCard
            title="Total Bet"
            value={stats.totalBet}
            icon="cash"
            color={theme.colors.warning}
          />
          <SessionStatCard
            title="Total Won"
            value={stats.totalWinAmount}
            icon="trophy"
            color={theme.colors.success}
          />
        </View>
        
        <View style={styles.statsRow}>
          <SessionStatCard
            title="Net Profit"
            value={stats.netProfit}
            icon="trending-up"
            color={stats.netProfit >= 0 ? theme.colors.success : theme.colors.error}
          />
          <SessionStatCard
            title="Biggest Win"
            value={stats.biggestWin}
            icon="flame"
            color={theme.colors.primary}
          />
        </View>
      </View>
      
      {/* Spin History */}
      <View style={styles.spinHistoryContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spin History</Text>
        
        {session.spins.length > 0 ? (
          <FlatList
            data={session.spins}
            keyExtractor={(item, index) => `spin-${index}`}
            renderItem={({ item }) => (
              <SpinHistoryItem spin={item} />
            )}
            contentContainerStyle={styles.spinHistoryList}
          />
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.text }]}>
            No spins recorded in this session yet.
          </Text>
        )}
      </View>
      
      {/* End Session Button */}
      <TouchableOpacity
        style={[styles.endSessionButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleEndSession}
      >
        <Text style={[styles.endSessionButtonText, { color: theme.colors.buttonText }]}>
          End Session
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Helper function to format duration
const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (remainingMinutes > 0 || hours > 0) {
    result += `${remainingMinutes}m `;
  }
  
  result += `${remainingSeconds}s`;
  
  return result;
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
  sessionInfo: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spinHistoryContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  spinHistoryList: {
    paddingBottom: 16,
  },
  endSessionButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  endSessionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});

export default GameSessionScreen;