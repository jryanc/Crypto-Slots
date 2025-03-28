import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Vibration,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Components
import SlotReel from '../components/game/SlotReel';
import BetControls from '../components/game/BetControls';
import WinDisplay from '../components/game/WinDisplay';
import MachineSelector from '../components/game/MachineSelector';
import CryptoEarnings from '../components/game/CryptoEarnings';
import GameStats from '../components/game/GameStats';
import AchievementNotification from '../components/achievements/AchievementNotification';

// Context
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// Config
import { GAME_CONFIG, SYMBOL_SETS } from '../config';

// API
import { spinSlotMachine, startAutoSpin, stopAutoSpin } from '../api/gameApi';

// Actions
import {
  SPIN_START,
  SPIN_SUCCESS,
  SPIN_FAILURE,
  AUTO_SPIN_START,
  AUTO_SPIN_STOP,
  SET_BET_AMOUNT,
  GAME_SESSION_START
} from '../store/reducers/gameReducer';
import { UPDATE_CRYPTO_BALANCE } from '../store/reducers/cryptoReducer';

const { width, height } = Dimensions.get('window');

const SlotMachineScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  
  // Redux state
  const {
    isSpinning,
    spinResult,
    winAmount,
    isWin,
    isJackpot,
    betAmount,
    autoSpin,
    error
  } = useSelector(state => state.game);
  
  const { selectedMachine, machines } = useSelector(state => state.machines);
  
  // Local state
  const [sounds, setSounds] = useState({
    spin: null,
    win: null,
    jackpot: null,
    coin: null
  });
  const [showMachineSelector, setShowMachineSelector] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Animations
  const jackpotAnimation = useRef(new Animated.Value(0)).current;
  const coinAnimation = useRef(new Animated.Value(0)).current;
  
  // Get current machine
  const currentMachine = machines.find(m => m._id === selectedMachine) || null;
  
  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const spinSound = new Audio.Sound();
        await spinSound.loadAsync(require('../assets/sounds/spin.mp3'));
        
        const winSound = new Audio.Sound();
        await winSound.loadAsync(require('../assets/sounds/win.mp3'));
        
        const jackpotSound = new Audio.Sound();
        await jackpotSound.loadAsync(require('../assets/sounds/jackpot.mp3'));
        
        const coinSound = new Audio.Sound();
        await coinSound.loadAsync(require('../assets/sounds/coin.mp3'));
        
        setSounds({
          spin: spinSound,
          win: winSound,
          jackpot: jackpotSound,
          coin: coinSound
        });
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };
    
    loadSounds();
    
    // Cleanup sounds on unmount
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.unloadAsync();
        }
      });
    };
  }, []);
  
  // Start game session when component mounts
  useEffect(() => {
    if (currentMachine) {
      dispatch({
        type: GAME_SESSION_START,
        payload: {
          id: Date.now().toString(),
          startTime: new Date()
        }
      });
    }
  }, [currentMachine, dispatch]);
  
  // Handle auto-spin
  useEffect(() => {
    if (autoSpin.active && !isSpinning && currentMachine) {
      // Small delay between auto-spins
      const timeout = setTimeout(() => {
        handleSpin();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [autoSpin.active, isSpinning, currentMachine]);
  
  // Play sounds based on game state
  useEffect(() => {
    const playSounds = async () => {
      if (isSpinning && sounds.spin) {
        await sounds.spin.replayAsync();
      } else if (isWin && !isSpinning) {
        if (isJackpot && sounds.jackpot) {
          await sounds.jackpot.replayAsync();
          Vibration.vibrate([100, 200, 300, 400, 500]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (sounds.win) {
          await sounds.win.replayAsync();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    };
    
    playSounds();
  }, [isSpinning, isWin, isJackpot, sounds]);
  
  // Jackpot animation
  useEffect(() => {
    if (isJackpot && !isSpinning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(jackpotAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(jackpotAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ]),
        { iterations: 5 }
      ).start();
    } else {
      jackpotAnimation.setValue(0);
    }
  }, [isJackpot, isSpinning, jackpotAnimation]);
  
  // Handle spin
  const handleSpin = async () => {
    if (isSpinning || !currentMachine) return;
    
    // Check if user has enough coins
    if (user.gameBalance.coins < betAmount) {
      Alert.alert('Insufficient Coins', 'You don\'t have enough coins to place this bet.');
      return;
    }
    
    // Start spin animation
    dispatch({ type: SPIN_START });
    
    try {
      // Call API to spin
      const response = await spinSlotMachine(selectedMachine, betAmount);
      
      // Update user balance
      updateUser({
        gameBalance: response.data.currentBalance
      });
      
      // Dispatch success action
      dispatch({
        type: SPIN_SUCCESS,
        payload: response.data
      });
      
      // If crypto was earned, update crypto balance
      if (response.data.cryptoEarned > 0) {
        dispatch({
          type: UPDATE_CRYPTO_BALANCE,
          payload: {
            cryptoType: 'bitcoin',
            amount: response.data.cryptoEarned
          }
        });
      }
      
      // Check for new achievements
      if (response.data.newAchievements && response.data.newAchievements.length > 0) {
        // Handle achievements
        response.data.newAchievements.forEach(achievement => {
          Alert.alert(
            'Achievement Unlocked!',
            `${achievement.name}: ${achievement.description}`,
            [{ text: 'OK' }]
          );
        });
      }
    } catch (error) {
      console.error('Spin error:', error);
      dispatch({
        type: SPIN_FAILURE,
        payload: error.response?.data?.message || 'Failed to spin. Please try again.'
      });
      
      Alert.alert('Spin Error', error.response?.data?.message || 'Failed to spin. Please try again.');
    }
  };
  
  // Handle auto-spin
  const handleAutoSpin = async (spins) => {
    if (isSpinning || !currentMachine) return;
    
    // Check if user has enough coins for all spins
    if (user.gameBalance.coins < betAmount * spins) {
      Alert.alert('Insufficient Coins', `You need at least ${betAmount * spins} coins for ${spins} auto-spins.`);
      return;
    }
    
    // Start auto-spin
    dispatch({
      type: AUTO_SPIN_START,
      payload: {
        spins,
        stopOnJackpot: true,
        stopOnBigWin: false,
        bigWinThreshold: 0
      }
    });
    
    // Start first spin
    handleSpin();
  };
  
  // Handle stop auto-spin
  const handleStopAutoSpin = async () => {
    dispatch({ type: AUTO_SPIN_STOP });
    
    try {
      await stopAutoSpin();
    } catch (error) {
      console.error('Stop auto-spin error:', error);
    }
  };
  
  // Handle bet amount change
  const handleBetChange = (amount) => {
    dispatch({
      type: SET_BET_AMOUNT,
      payload: amount
    });
  };
  
  // Handle machine selection
  const handleMachineSelect = (machineId) => {
    navigation.navigate('GameTab', {
      screen: 'SlotMachine',
      params: { machineId }
    });
    setShowMachineSelector(false);
  };
  
  // Render loading state if no machine is selected
  if (!currentMachine) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>Loading machine...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMachineSelector(true)}
        >
          <Ionicons name="apps" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>
            Machines
          </Text>
        </TouchableOpacity>
        
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={24} color={theme.colors.primary} />
          <Text style={[styles.balanceText, { color: theme.colors.text }]}>
            {user.gameBalance.coins.toLocaleString()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowStats(!showStats)}
        >
          <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>
            Stats
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Machine Name */}
      <Text style={[styles.machineName, { color: theme.colors.text }]}>
        {currentMachine.name} (Level {currentMachine.level})
      </Text>
      
      {/* Slot Machine */}
      <View style={styles.machineContainer}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.machineGradient}
        >
          {/* Reels Container */}
          <View style={styles.reelsContainer}>
            {spinResult ? (
              // Show spin result
              spinResult.map((symbol, index) => (
                <SlotReel
                  key={index}
                  symbol={symbol}
                  isSpinning={isSpinning}
                  symbolSet={currentMachine.symbolSet || 'classic'}
                  delay={index * 300} // Stagger the reel stops
                />
              ))
            ) : (
              // Show default symbols
              Array(currentMachine.attributes.reels || 3).fill(0).map((_, index) => (
                <SlotReel
                  key={index}
                  symbol="7"
                  isSpinning={isSpinning}
                  symbolSet={currentMachine.symbolSet || 'classic'}
                  delay={0}
                />
              ))
            )}
          </View>
          
          {/* Win Display */}
          {isWin && !isSpinning && (
            <WinDisplay
              amount={winAmount}
              isJackpot={isJackpot}
              animation={jackpotAnimation}
            />
          )}
          
          {/* Crypto Earnings */}
          {spinResult && !isSpinning && (
            <CryptoEarnings cryptoEarned={spinResult.cryptoEarned} />
          )}
        </LinearGradient>
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetChange}
          minBet={currentMachine.attributes.minBet || GAME_CONFIG.MIN_BET}
          maxBet={currentMachine.attributes.maxBet || GAME_CONFIG.MAX_BET}
          increment={GAME_CONFIG.BET_INCREMENT}
          disabled={isSpinning || autoSpin.active}
        />
        
        <View style={styles.spinButtonsContainer}>
          {/* Auto Spin Button */}
          {!autoSpin.active ? (
            <TouchableOpacity
              style={[
                styles.autoSpinButton,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }
              ]}
              onPress={() => handleAutoSpin(10)}
              disabled={isSpinning}
            >
              <Text style={[styles.autoSpinText, { color: theme.colors.primary }]}>
                AUTO (10)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.stopAutoSpinButton,
                { backgroundColor: theme.colors.error }
              ]}
              onPress={handleStopAutoSpin}
            >
              <Text style={[styles.autoSpinText, { color: theme.colors.buttonText }]}>
                STOP ({autoSpin.remaining})
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Spin Button */}
          <TouchableOpacity
            style={[
              styles.spinButton,
              { backgroundColor: isSpinning ? theme.colors.border : theme.colors.primary }
            ]}
            onPress={handleSpin}
            disabled={isSpinning || autoSpin.active}
          >
            <Text style={[styles.spinText, { color: theme.colors.buttonText }]}>
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </Text>
          </TouchableOpacity>
          
          {/* Max Bet Button */}
          <TouchableOpacity
            style={[
              styles.maxBetButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }
            ]}
            onPress={() => handleBetChange(currentMachine.attributes.maxBet || GAME_CONFIG.MAX_BET)}
            disabled={isSpinning || autoSpin.active}
          >
            <Text style={[styles.maxBetText, { color: theme.colors.primary }]}>
              MAX BET
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Machine Selector Modal */}
      <MachineSelector
        visible={showMachineSelector}
        machines={machines}
        selectedMachine={selectedMachine}
        onSelect={handleMachineSelect}
        onClose={() => setShowMachineSelector(false)}
      />
      
      {/* Stats Modal */}
      <GameStats
        visible={showStats}
        onClose={() => setShowStats(false)}
        machine={currentMachine}
        gameStats={user.gameStats}
      />
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
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  machineName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  machineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  machineGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    height: 200,
  },
  controlsContainer: {
    padding: 16,
  },
  spinButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  spinButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  spinText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  autoSpinButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stopAutoSpinButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoSpinText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  maxBetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  maxBetText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
  },
});

export default SlotMachineScreen;