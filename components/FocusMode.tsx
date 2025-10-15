import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

type FocusModeProps = {
  visible: boolean;
  onClose: () => void;
  onStart: (duration: number) => void;
};

const FOCUS_DURATIONS = [
  { label: '5 minutes', value: 5, emoji: '⚡' },
  { label: '10 minutes', value: 10, emoji: '🎯' },
  { label: '15 minutes', value: 15, emoji: '🚀' },
  { label: '20 minutes', value: 20, emoji: '💪' },
];

export default function FocusMode({ visible, onClose, onStart }: FocusModeProps) {
  const { difficulty } = useGameStore();
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setProgress(((selectedDuration - timeLeft + 1) / selectedDuration) * 100);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      completeFocus();
    }
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  const startFocus = () => {
    setIsActive(true);
    setTimeLeft(selectedDuration * 60);
    setProgress(0);
  };

  const completeFocus = () => {
    setIsActive(false);
    setTimeLeft(0);
    setProgress(100);
    // Add stars for completing focus session
    // This would be handled by the parent component
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEncouragement = () => {
    if (progress < 25) return "You've got this! 🌟";
    if (progress < 50) return "Keep going! You're doing great! 💪";
    if (progress < 75) return "Almost there! Stay focused! 🎯";
    if (progress < 100) return "Final stretch! You're amazing! 🚀";
    return "Congratulations! You did it! 🎉";
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Focus Mode 🎯</Text>
            {!isActive && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isActive && (
            <View style={styles.selectionArea}>
              <Text style={styles.instructionText}>
                Choose how long you want to focus for:
              </Text>
              
              <View style={styles.durationGrid}>
                {FOCUS_DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration.value}
                    style={[
                      styles.durationCard,
                      selectedDuration === duration.value && styles.selectedDuration
                    ]}
                    onPress={() => setSelectedDuration(duration.value)}
                  >
                    <Text style={styles.durationEmoji}>{duration.emoji}</Text>
                    <Text style={styles.durationLabel}>{duration.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.startButton} onPress={startFocus}>
                <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Start Focusing! 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <View style={styles.focusArea}>
              <Animated.View style={[styles.focusCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.encouragementText}>{getEncouragement()}</Text>
              </Animated.View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
              </View>

              <View style={styles.focusTips}>
                <Text style={styles.tipsTitle}>Focus Tips:</Text>
                <Text style={styles.tipText}>• Take deep breaths</Text>
                <Text style={styles.tipText}>• Keep your eyes on the screen</Text>
                <Text style={styles.tipText}>• Don't get distracted</Text>
              </View>
            </View>
          )}

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Focus Mode Helps! 🧠</Text>
            <Text style={styles.benefitsText}>
              Focus mode helps you concentrate better and learn more effectively!
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectionArea: {
    flex: 1,
    padding: 20,
  },
  instructionText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  durationCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  selectedDuration: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ scale: 1.05 }],
  },
  durationEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  focusCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  encouragementText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  focusTips: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
});