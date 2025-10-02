import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

const { width } = Dimensions.get('window');

const BREATHING_EXERCISES = [
  {
    name: 'Square Breathing',
    description: 'Breathe in a square pattern to feel calm',
    pattern: [4, 4, 4, 4], // breathe in, hold, breathe out, hold
    emoji: '⏹️',
    color: ['#4ECDC4', '#44A08D'],
  },
  {
    name: 'Triangle Breathing',
    description: 'Simple 3-step breathing for quick calm',
    pattern: [3, 3, 3], // breathe in, hold, breathe out
    emoji: '🔺',
    color: ['#FFD93D', '#FF6B6B'],
  },
  {
    name: 'Star Breathing',
    description: 'Extended breathing like tracing a star',
    pattern: [5, 2, 5, 2, 5], // in, hold, out, hold, rest
    emoji: '⭐',
    color: ['#A8E6CF', '#88D8A3'],
  },
];

const BREATHING_PHASES = {
  0: { text: 'Breathe In', color: '#4ECDC4', icon: '⬆️' },
  1: { text: 'Hold', color: '#FFD93D', icon: '⏸️' },
  2: { text: 'Breathe Out', color: '#FF6B6B', icon: '⬇️' },
  3: { text: 'Hold', color: '#A8E6CF', icon: '⏸️' },
  4: { text: 'Rest', color: '#DDA0DD', icon: '💤' },
};

export default function BreathingGame() {
  const { addStars, completeGame } = useGameStore();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalCycles] = useState(3);
  
  const circleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && selectedExercise) {
      startBreathingCycle();
    }
  }, [isActive, selectedExercise, currentPhase, completedCycles]);

  const startBreathingCycle = () => {
    const pattern = selectedExercise.pattern;
    const phaseIndex = currentPhase % pattern.length;
    const phaseDuration = pattern[phaseIndex];
    
    setCountdown(phaseDuration);
    
    // Animate circle based on breathing phase
    const isInhaling = phaseIndex === 0;
    const isExhaling = phaseIndex === 2;
    
    if (isInhaling) {
      Animated.timing(circleAnim, {
        toValue: 1.2,
        duration: phaseDuration * 1000,
        useNativeDriver: true,
      }).start();
    } else if (isExhaling) {
      Animated.timing(circleAnim, {
        toValue: 0.6,
        duration: phaseDuration * 1000,
        useNativeDriver: true,
      }).start();
    }

    // Background color animation
    Animated.timing(backgroundAnim, {
      toValue: phaseIndex / pattern.length,
      duration: phaseDuration * 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for hold phases
    if (phaseIndex === 1 || phaseIndex === 3) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
      
      setTimeout(() => pulseLoop.stop(), phaseDuration * 1000);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // Move to next phase
          const nextPhase = (currentPhase + 1) % pattern.length;
          if (nextPhase === 0) {
            // Completed a full cycle
            const newCompletedCycles = completedCycles + 1;
            setCompletedCycles(newCompletedCycles);
            
            if (newCompletedCycles >= totalCycles) {
              completeExercise();
              return prev;
            }
          }
          
          setCurrentPhase(nextPhase);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setIsActive(true);
    setCurrentPhase(0);
    setCompletedCycles(0);
    
    // Reset animations
    circleAnim.setValue(0.8);
    pulseAnim.setValue(1);
    backgroundAnim.setValue(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setSelectedExercise(null);
    setCurrentPhase(0);
    setCompletedCycles(0);
    
    // Reset animations
    Animated.spring(circleAnim, { toValue: 0.8, useNativeDriver: true }).start();
    Animated.timing(backgroundAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
  };

  const completeExercise = () => {
    setIsActive(false);
    addStars(3);
    completeGame();
    
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const currentPhaseInfo = selectedExercise ? 
    BREATHING_PHASES[currentPhase % selectedExercise.pattern.length] : 
    null;

  const backgroundColorInterpolation = backgroundAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#667eea', '#4ECDC4', '#FFD93D', '#FF6B6B', '#A8E6CF'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: backgroundColorInterpolation }]}>
      <LinearGradient 
        colors={isActive ? ['transparent', 'rgba(0,0,0,0.1)'] : ['#667eea', '#764ba2']} 
        style={styles.overlay}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mindful Breathing 🧘‍♀️</Text>
          {isActive && (
            <TouchableOpacity onPress={stopExercise} style={styles.stopButton}>
              <Text style={styles.stopText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        <Buddy message={
          !isActive ? 
            "Hi! I'm Buddy! Let's learn some breathing exercises to help you feel calm and focused!" :
            `${currentPhaseInfo?.text} ${currentPhaseInfo?.icon} - ${countdown} seconds`
        } />

        {!isActive ? (
          <View style={styles.exerciseSelection}>
            <Text style={styles.selectionTitle}>Choose Your Breathing Exercise</Text>
            <Text style={styles.selectionSubtitle}>
              Breathing exercises help calm your mind and improve focus!
            </Text>
            
            {BREATHING_EXERCISES.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exerciseCard}
                onPress={() => startExercise(exercise)}
              >
                <LinearGradient colors={exercise.color} style={styles.exerciseGradient}>
                  <Text style={styles.exerciseEmoji}>{exercise.emoji}</Text>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                    <Text style={styles.exercisePattern}>
                      Pattern: {exercise.pattern.join('-')} seconds
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Why breathing helps:</Text>
              <Text style={styles.benefitItem}>🧠 Calms your mind</Text>
              <Text style={styles.benefitItem}>❤️ Slows your heart rate</Text>
              <Text style={styles.benefitItem}>😌 Reduces anxiety</Text>
              <Text style={styles.benefitItem}>🎯 Improves focus</Text>
            </View>
          </View>
        ) : (
          <View style={styles.breathingArea}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Cycle {completedCycles + 1} of {totalCycles}
              </Text>
              <View style={styles.progressBar}>
                {Array.from({ length: totalCycles }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index < completedCycles && styles.completedDot,
                      index === completedCycles && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.breathingCircleContainer}>
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [
                      { scale: Animated.multiply(circleAnim, pulseAnim) }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={selectedExercise.color}
                  style={styles.circleGradient}
                >
                  <Text style={styles.phaseEmoji}>{currentPhaseInfo?.icon}</Text>
                  <Text style={styles.phaseText}>{currentPhaseInfo?.text}</Text>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                {selectedExercise.name} - {selectedExercise.description}
              </Text>
              <Text style={styles.guidanceText}>
                {currentPhase === 0 ? 'Fill your lungs slowly...' :
                 currentPhase === 1 ? 'Hold it steady...' :
                 currentPhase === 2 ? 'Let it all out slowly...' :
                 'Pause and relax...'}
              </Text>
            </View>
          </View>
        )}

        {completedCycles >= totalCycles && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>🌟 Well Done!</Text>
            <Text style={styles.completionText}>
              You completed all breathing cycles! You should feel more calm and focused now.
              You earned 3 stars! ⭐⭐⭐
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
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
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stopText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseSelection: {
    flex: 1,
    padding: 20,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  exerciseCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  exerciseGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  exerciseEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  exercisePattern: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
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
  breathingArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 15,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
  },
  completedDot: {
    backgroundColor: '#4ECDC4',
  },
  activeDot: {
    backgroundColor: '#FF6B6B',
  },
  breathingCircleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  circleGradient: {
    flex: 1,
    borderRadius: width * 0.3,
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    width: '100%',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  guidanceText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  completionContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});
