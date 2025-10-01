import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
const COLOR_NAMES = ['red', 'teal', 'blue', 'green', 'yellow', 'pink'];

export default function TappingGame() {
  const { addStars, completeGame, difficulty } = useGameStore();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetColor, setTargetColor] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState([]);
  const [animatedValues, setAnimatedValues] = useState({});

  const gameSpeed = difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000;

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(spawnTarget, gameSpeed);
      return () => clearInterval(interval);
    }
  }, [gameActive, gameSpeed]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setTargets([]);
    setTargetColor(Math.floor(Math.random() * COLORS.length));
  };

  const endGame = () => {
    setGameActive(false);
    const stars = Math.floor(score / 10) + 1;
    addStars(stars);
    completeGame();
    
    Alert.alert(
      '🎉 Time\'s Up!', 
      `Final Score: ${score} points!\nYou earned ${stars} stars!`,
      [{ text: 'Play Again', onPress: startGame },
       { text: 'Go Home', onPress: () => router.back() }]
    );
  };

  const spawnTarget = () => {
    const id = Date.now();
    const isCorrect = Math.random() > 0.3; // 70% chance of correct color
    const colorIndex = isCorrect ? targetColor : 
      Math.floor(Math.random() * COLORS.length);
    
    const newTarget = {
      id,
      color: COLORS[colorIndex],
      colorIndex,
      isCorrect,
      x: Math.random() * 250 + 50, // Random position
      y: Math.random() * 400 + 200,
    };

    const animValue = new Animated.Value(0);
    setAnimatedValues(prev => ({ ...prev, [id]: animValue }));

    setTargets(prev => [...prev, newTarget]);

    // Animate target appearance and auto-removal
    Animated.sequence([
      Animated.spring(animValue, { toValue: 1, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      removeTarget(id);
    });
  };

  const removeTarget = (targetId) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    setAnimatedValues(prev => {
      const newValues = { ...prev };
      delete newValues[targetId];
      return newValues;
    });
  };

  const tapTarget = (target) => {
    const animValue = animatedValues[target.id];
    
    if (target.isCorrect) {
      setScore(score + 10);
      // Success animation
      Animated.sequence([
        Animated.spring(animValue, { toValue: 1.5, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start(() => removeTarget(target.id));
      
      // Change target color
      setTargetColor(Math.floor(Math.random() * COLORS.length));
    } else {
      setScore(Math.max(0, score - 5));
      // Error animation
      Animated.sequence([
        Animated.timing(animValue, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.spring(animValue, { toValue: 1, useNativeDriver: true })
      ]).start();
    }
  };

  return (
    <LinearGradient colors={['#FFD93D', '#FF6B6B']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Tap! ⚡</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>⏰ {timeLeft}s</Text>
          <Text style={styles.statText}>🎯 {score}</Text>
        </View>
      </View>

      {!gameActive && timeLeft === 30 ? (
        <View style={styles.startScreen}>
          <Text style={styles.instructionTitle}>Ready to Play? 🎮</Text>
          <Text style={styles.instructionText}>
            Tap only the {COLOR_NAMES[targetColor]} circles as fast as you can!
          </Text>
          <View style={styles.colorPreview}>
            <View style={[styles.previewCircle, { backgroundColor: COLORS[targetColor] }]} />
            <Text style={styles.colorLabel}>Tap this color!</Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🚀 Start Game!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.targetInfo}>
            <Text style={styles.targetText}>Tap the {COLOR_NAMES[targetColor]} circles!</Text>
            <View style={[styles.targetCircle, { backgroundColor: COLORS[targetColor] }]} />
          </View>

          <View style={styles.playArea}>
            {targets.map(target => (
              <Animated.View
                key={target.id}
                style={[
                  styles.target,
                  {
                    left: target.x,
                    top: target.y,
                    backgroundColor: target.color,
                    transform: [
                      { scale: animatedValues[target.id] || 0 }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.targetTouchable}
                  onPress={() => tapTarget(target)}
                />
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.mascotContainer}>
        <Text style={styles.mascotText}>
          {!gameActive ? "Get ready to test your reflexes! 🏃‍♂️" : 
           score > 50 ? "You're on fire! 🔥" : "Keep tapping the right colors! 💪"}
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
  colorPreview: {
    alignItems: 'center',
    marginBottom: 40,
  },
  previewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 25,
  },
  targetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
  },
  targetCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  targetTouchable: {
    flex: 1,
    borderRadius: 30,
  },
  mascotContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mascotText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
});