import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

const { width, height } = Dimensions.get('window');

const FOCUS_PATTERNS = [
  { shape: '⭐', color: '#FFD93D', targetCount: 3 },
  { shape: '💎', color: '#4ECDC4', targetCount: 2 },
  { shape: '🌙', color: '#A8E6CF', targetCount: 4 },
  { shape: '☀️', color: '#FF6B6B', targetCount: 3 },
  { shape: '🔷', color: '#667eea', targetCount: 2 },
];

export default function FocusGame() {
  const { addStars, completeGame, difficulty } = useGameStore();
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState([]);
  const [currentPattern, setCurrentPattern] = useState(FOCUS_PATTERNS[0]);
  const [foundTargets, setFoundTargets] = useState(0);
  const [distractors, setDistractors] = useState([]);
  
  const animatedValues = useRef({}).current;
  const roundTime = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 12;
  const totalRounds = difficulty === 'easy' ? 3 : 5;
  const state = useGameStore();

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      checkRoundCompletion();
    }
  }, [timeLeft, gameActive]);

  const startGame = () => {
    setGameActive(true);
    setCurrentRound(0);
    setScore(0);
    startNewRound();
  };

  const startNewRound = () => {
    const pattern = FOCUS_PATTERNS[Math.floor(Math.random() * FOCUS_PATTERNS.length)];
    setCurrentPattern(pattern);
    setTimeLeft(roundTime);
    setFoundTargets(0);
    generateItems(pattern);
  };

  const generateItems = (pattern) => {
    const newTargets = [];
    const newDistractors = [];
    const totalItems = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;
    
    // Generate target items
    for (let i = 0; i < pattern.targetCount; i++) {
      const id = `target-${i}`;
      const animValue = new Animated.Value(0);
      animatedValues[id] = animValue;
      
      newTargets.push({
        id,
        shape: pattern.shape,
        isTarget: true,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height * 0.5) + 200,
        found: false,
      });

      // Animate appearance
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }

    // Generate distractor items
    const otherPatterns = FOCUS_PATTERNS.filter(p => p.shape !== pattern.shape);
    for (let i = 0; i < totalItems - pattern.targetCount; i++) {
      const randomPattern = otherPatterns[Math.floor(Math.random() * otherPatterns.length)];
      const id = `distractor-${i}`;
      const animValue = new Animated.Value(0);
      animatedValues[id] = animValue;
      
      newDistractors.push({
        id,
        shape: randomPattern.shape,
        isTarget: false,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height * 0.5) + 200,
      });

      // Animate appearance
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }

    setTargets(newTargets);
    setDistractors(newDistractors);
  };

  const handleItemPress = (item) => {
    const animValue = animatedValues[item.id];
    
    if (item.isTarget && !item.found) {
      // Correct target found
      setFoundTargets(prev => prev + 1);
      setScore(prev => prev + 10);
      
      // Update target as found
      setTargets(prev => prev.map(t => 
        t.id === item.id ? { ...t, found: true } : t
      ));

      // Success animation
      Animated.sequence([
        Animated.spring(animValue, { toValue: 1.5, useNativeDriver: true }),
        Animated.spring(animValue, { toValue: 0, useNativeDriver: true })
      ]).start();

      // Check if all targets found
      if (foundTargets + 1 >= currentPattern.targetCount) {
        setTimeout(() => {
          if (currentRound + 1 < totalRounds) {
            setCurrentRound(prev => prev + 1);
            startNewRound();
          } else {
            endGame();
          }
        }, 1000);
      }
    } else if (!item.isTarget) {
      // Wrong item selected
      setScore(prev => Math.max(0, prev - 5));
      
      // Error animation
      Animated.sequence([
        Animated.timing(animValue, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.spring(animValue, { toValue: 1, useNativeDriver: true })
      ]).start();
    }
  };

  const checkRoundCompletion = () => {
    if (foundTargets >= currentPattern.targetCount) {
      // Round completed successfully
      if (currentRound + 1 < totalRounds) {
        setCurrentRound(prev => prev + 1);
        startNewRound();
      } else {
        endGame();
      }
    } else {
      // Time's up, but not all targets found
      Alert.alert(
        'Time\'s Up! ⏰',
        `You found ${foundTargets}/${currentPattern.targetCount} targets. Try again!`,
        [{ text: 'Next Round', onPress: () => {
          if (currentRound + 1 < totalRounds) {
            setCurrentRound(prev => prev + 1);
            startNewRound();
          } else {
            endGame();
          }
        }}]
      );
    }
  };

  const endGame = () => {
    setGameActive(false);
    const stars = Math.max(1, Math.floor(score / 50) + 1);
    addStars(stars);
    completeGame();
    
    Alert.alert(
      '🎯 Focus Challenge Complete!',
      `Great job! You completed ${currentRound + 1} rounds!\nFinal Score: ${score} points\nYou earned ${stars} stars!`,
      [
        { text: 'Play Again', onPress: startGame },
        { text: 'Go Home', onPress: () => router.back() }
      ]
    );
  };

  const renderItem = (item) => (
    <Animated.View
      key={item.id}
      style={[
        styles.gameItem,
        {
          left: item.x,
          top: item.y,
          transform: [{ scale: animatedValues[item.id] || 1 }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={[
          styles.itemButton,
          item.found && styles.foundItem
        ]}
        disabled={item.found}
      >
        <Text style={styles.itemEmoji}>{item.shape}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Focus Training! 🎯</Text>
        <View style={styles.stats}>
          {gameActive && (
            <>
              <Text style={styles.statText}>⏰ {timeLeft}s</Text>
              <Text style={styles.statText}>🎯 {score}</Text>
            </>
          )}
        </View>
      </View>

      <Buddy message={
        !gameActive ? 
          "Hi! I'm Buddy! Let's train your focus! Find all the matching shapes as quickly as you can!" :
          `Find all ${currentPattern.targetCount} ${currentPattern.shape} shapes! You've found ${foundTargets} so far.`
      } />

      {!gameActive ? (
        <View style={styles.startScreen}>
          <Text style={styles.instructionTitle}>Focus Training Challenge! 🧠</Text>
          <Text style={styles.instructionText}>
            Train your attention by finding specific shapes among distractors. 
            This helps improve focus and concentration skills!
          </Text>
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>This game helps with:</Text>
            <Text style={styles.benefitItem}>🎯 Selective attention</Text>
            <Text style={styles.benefitItem}>👁️ Visual scanning</Text>
            <Text style={styles.benefitItem}>⚡ Processing speed</Text>
            <Text style={styles.benefitItem}>🧠 Working memory</Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🚀 Start Training!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.targetInfo}>
            <Text style={styles.targetText}>
              Find all {currentPattern.targetCount} {currentPattern.shape} shapes!
            </Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Round {currentRound + 1}/{totalRounds} | Found: {foundTargets}/{currentPattern.targetCount}
              </Text>
            </View>
          </View>

          <View style={styles.playArea}>
            {targets.map(renderItem)}
            {distractors.map(renderItem)}
          </View>
        </View>
      )}

      <View style={styles.encouragementContainer}>
        <Text style={styles.encouragementText}>
          {!gameActive ? 
            "Ready to boost your focus power? 💪" :
            foundTargets === currentPattern.targetCount ?
              "Perfect! All targets found! 🌟" :
              timeLeft < 5 ? 
                "Hurry up! You can do it! ⚡" :
                "Keep looking! Focus on the target shape! 👀"
          }
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    width: '90%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    padding: 20,
  },
  targetInfo: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  targetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  gameItem: {
    position: 'absolute',
  },
  itemButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  foundItem: {
    backgroundColor: '#4ECDC4',
    opacity: 0.7,
  },
  itemEmoji: {
    fontSize: 24,
  },
  encouragementContainer: {
    padding: 20,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    fontWeight: 'bold',
  },
});
