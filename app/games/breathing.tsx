import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Vibration } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATHING_PATTERNS = [
  { name: 'Calm Down', emoji: '😌', inhale: 4, hold: 4, exhale: 6, rest: 2, color: ['#4ECDC4', '#44A08D'] as const },
  { name: 'Focus', emoji: '🎯', inhale: 3, hold: 3, exhale: 3, rest: 1, color: ['#667eea', '#764ba2'] as const },
  { name: 'Energy', emoji: '⚡', inhale: 2, hold: 1, exhale: 2, rest: 1, color: ['#FFD93D', '#FF6B6B'] as const },
  { name: 'Sleep', emoji: '😴', inhale: 4, hold: 7, exhale: 8, rest: 0, color: ['#DDA0DD', '#C8A2C8'] as const },
];

export default function BreathingGame() {
  const { addStars, completeGame, soundEnabled } = useGameStore();
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [totalCycles, setTotalCycles] = useState(3);
  const [completed, setCompleted] = useState(false);
  
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const pattern = BREATHING_PATTERNS[selectedPattern];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      nextPhase();
    }
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      animateBreathing();
    }
  }, [isActive, currentPhase]);

  const animateBreathing = () => {
    const duration = timeLeft * 1000;
    
    if (currentPhase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: duration,
        useNativeDriver: true,
      }).start();
    } else if (currentPhase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: duration,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }

    // Pulse animation for hold phase
    if (currentPhase === 'hold') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  };

  const nextPhase = () => {
    switch (currentPhase) {
      case 'inhale':
        setCurrentPhase('hold');
        setTimeLeft(pattern.hold);
        break;
      case 'hold':
        setCurrentPhase('exhale');
        setTimeLeft(pattern.exhale);
        break;
      case 'exhale':
        if (pattern.rest > 0) {
          setCurrentPhase('rest');
          setTimeLeft(pattern.rest);
        } else {
          nextCycle();
        }
        break;
      case 'rest':
        nextCycle();
        break;
    }
  };

  const nextCycle = () => {
    if (cycle < totalCycles - 1) {
      setCycle(cycle + 1);
      setCurrentPhase('inhale');
      setTimeLeft(pattern.inhale);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsActive(false);
    setCompleted(true);
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    
    const stars = 2;
    addStars(stars);
    completeGame();
    
    setTimeout(() => {
      Alert.alert(
        '🎉 Great Job!', 
        `You completed ${totalCycles} breathing cycles!\nYou earned ${stars} stars!`,
        [{ text: 'Do Another', onPress: resetSession },
         { text: 'Go Home', onPress: () => router.back() }]
      );
    }, 2000);
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
    setCycle(0);
    setCompleted(false);
    Vibration.vibrate([0, 100]);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(0);
    setCycle(0);
    setCompleted(false);
    scaleAnim.setValue(1);
    fadeAnim.setValue(1);
    pulseAnim.setValue(1);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
      default: return 'Ready';
    }
  };

  const getPhaseEmoji = () => {
    switch (currentPhase) {
      case 'inhale': return '⬆️';
      case 'hold': return '⏸️';
      case 'exhale': return '⬇️';
      case 'rest': return '😌';
      default: return '🌬️';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return '#4ECDC4';
      case 'hold': return '#FFD93D';
      case 'exhale': return '#FF6B6B';
      case 'rest': return '#96CEB4';
      default: return '#E0E0E0';
    }
  };

  if (completed) {
    return (
      <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.container}>
        <View style={styles.completedContainer}>
          <Animated.Text style={[styles.completedEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🎉
          </Animated.Text>
          <Text style={styles.completedTitle}>Amazing Work!</Text>
          <Text style={styles.completedText}>
            You completed your breathing exercise! Your mind is calm and ready for anything! 🌟
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={pattern.color} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Breathe & Relax 🌬️</Text>
        <View style={styles.cycleContainer}>
          <Text style={styles.cycleText}>{cycle + 1}/{totalCycles}</Text>
        </View>
      </View>

      <Buddy message={
        isActive ? 
        `Follow the circle and ${getPhaseText().toLowerCase()}!` :
        "Choose a breathing pattern and let's start relaxing!"
      } />

      {!isActive && (
        <View style={styles.patternSelection}>
          <Text style={styles.selectionTitle}>Choose Your Breathing Pattern</Text>
          <View style={styles.patternsGrid}>
            {BREATHING_PATTERNS.map((p, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.patternCard,
                  selectedPattern === index && styles.selectedPattern
                ]}
                onPress={() => setSelectedPattern(index)}
              >
                <LinearGradient colors={p.color} style={styles.patternGradient}>
                  <Text style={styles.patternEmoji}>{p.emoji}</Text>
                  <Text style={styles.patternName}>{p.name}</Text>
                  <Text style={styles.patternDescription}>
                    {p.inhale}-{p.hold}-{p.exhale}-{p.rest}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <LinearGradient colors={['#4ECDC4', '#44A08D'] as const} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Start Breathing! 🌬️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {isActive && (
        <View style={styles.breathingArea}>
          <View style={styles.breathingCircle}>
            <Animated.View style={[
              styles.breathingCircleInner,
              { 
                transform: [{ scale: scaleAnim }],
                backgroundColor: getPhaseColor()
              }
            ]}>
              <Animated.View style={[
                styles.breathingCircleCenter,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <Text style={styles.phaseEmoji}>{getPhaseEmoji()}</Text>
                <Text style={styles.phaseText}>{getPhaseText()}</Text>
                <Text style={styles.timeText}>{timeLeft}</Text>
              </Animated.View>
            </Animated.View>
          </View>
          
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {currentPhase === 'inhale' && 'Breathe in slowly through your nose...'}
              {currentPhase === 'hold' && 'Hold your breath gently...'}
              {currentPhase === 'exhale' && 'Breathe out slowly through your mouth...'}
              {currentPhase === 'rest' && 'Take a moment to rest...'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Why Breathing Helps! 🧠</Text>
        <Text style={styles.benefitsText}>
          Deep breathing calms your nervous system and helps you focus better!
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
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  cycleContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cycleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  patternSelection: {
    flex: 1,
    padding: 20,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  patternsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  patternCard: {
    width: '45%',
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedPattern: {
    transform: [{ scale: 1.05 }],
    borderWidth: 3,
    borderColor: 'white',
  },
  patternGradient: {
    padding: 20,
    alignItems: 'center',
  },
  patternEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  patternName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  patternDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  breathingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  breathingCircle: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  breathingCircleInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  breathingCircleCenter: {
    alignItems: 'center',
  },
  phaseEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  benefitsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  benefitsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completedEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  completedText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});