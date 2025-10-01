import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

const MOVEMENT_ACTIVITIES = [
  { name: 'Jump like a frog', emoji: '🐸', instruction: 'Hop 5 times!', duration: 5 },
  { name: 'Stretch like a cat', emoji: '🐱', instruction: 'Stretch your arms up high!', duration: 8 },
  { name: 'Dance like nobody\'s watching', emoji: '💃', instruction: 'Move to the beat!', duration: 10 },
  { name: 'March in place', emoji: '🥾', instruction: 'Lift those knees up!', duration: 8 },
  { name: 'Spin like a helicopter', emoji: '🚁', instruction: 'Spin your arms!', duration: 6 },
  { name: 'Wiggle like a fish', emoji: '🐟', instruction: 'Wiggle your whole body!', duration: 7 },
];

export default function MovementScreen() {
  const { updateMovementBreak, addStars } = useGameStore();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MOVEMENT_ACTIVITIES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isActive) {
      completeActivity();
    }
  }, [timeLeft, isActive]);

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    );
    
    if (isActive) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [isActive]);

  const startActivity = () => {
    setIsActive(true);
    setTimeLeft(MOVEMENT_ACTIVITIES[currentActivity].duration);
  };

  const completeActivity = () => {
    setIsActive(false);
    
    if (currentActivity < MOVEMENT_ACTIVITIES.length - 1) {
      // Move to next activity
      setTimeout(() => {
        setCurrentActivity(currentActivity + 1);
        setTimeLeft(MOVEMENT_ACTIVITIES[currentActivity + 1].duration);
      }, 2000);
    } else {
      // All activities completed!
      setCompleted(true);
      updateMovementBreak();
      addStars(2);
      
      setTimeout(() => {
        router.back();
      }, 3000);
    }
  };

  const skipBreak = () => {
    updateMovementBreak();
    router.back();
  };

  if (completed) {
    return (
      <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.container}>
        <View style={styles.completedContainer}>
          <Animated.Text style={[styles.completedEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🎉
          </Animated.Text>
          <Text style={styles.completedTitle}>Awesome Work!</Text>
          <Text style={styles.completedText}>
            You completed all movement activities! Your brain is recharged and ready for more learning! 
            You earned 2 bonus stars! ⭐⭐
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const activity = MOVEMENT_ACTIVITIES[currentActivity];

  return (
    <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={skipBreak} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip Break</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Movement Time! 🏃‍♂️</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{currentActivity + 1}/{MOVEMENT_ACTIVITIES.length}</Text>
        </View>
      </View>

      <View style={styles.activityContainer}>
        <Animated.View style={[styles.emojiContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
        </Animated.View>
        
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityInstruction}>{activity.instruction}</Text>
        
        {timeLeft > 0 && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.timerLabel}>seconds</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startActivity}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🚀 Start Moving!</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeContainer}>
            <Text style={styles.encouragementText}>
              {timeLeft > 3 ? "You're doing great! Keep moving! 💪" : 
               timeLeft > 1 ? "Almost done! 🌟" : "Last second! 🎯"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Why movement helps? 🧠</Text>
        <Text style={styles.benefitsText}>
          Moving helps your brain focus better and makes learning more fun!
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
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emojiContainer: {
    backgroundColor: 'white',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  activityEmoji: {
    fontSize: 60,
  },
  activityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  activityInstruction: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeContainer: {
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    fontWeight: 'bold',
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
  },
  completedText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
});