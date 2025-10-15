import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

type Mood = 'happy' | 'calm' | 'frustrated' | 'excited' | 'tired';

const MOODS = [
  { 
    id: 'happy' as Mood, 
    emoji: '😊', 
    label: 'Happy', 
    color: ['#4ECDC4', '#44A08D'],
    description: 'Feeling great and positive!'
  },
  { 
    id: 'calm' as Mood, 
    emoji: '😌', 
    label: 'Calm', 
    color: ['#96CEB4', '#85C1A3'],
    description: 'Peaceful and relaxed'
  },
  { 
    id: 'frustrated' as Mood, 
    emoji: '😤', 
    label: 'Frustrated', 
    color: ['#FF6B6B', '#FF8E53'],
    description: 'Feeling a bit stuck'
  },
  { 
    id: 'excited' as Mood, 
    emoji: '🤩', 
    label: 'Excited', 
    color: ['#FFD93D', '#FF6B6B'],
    description: 'Full of energy!'
  },
  { 
    id: 'tired' as Mood, 
    emoji: '😴', 
    label: 'Tired', 
    color: ['#DDA0DD', '#C8A2C8'],
    description: 'Need some rest'
  },
];

type MoodTrackerProps = {
  visible: boolean;
  onClose: () => void;
  onMoodSelected?: (mood: Mood) => void;
};

export default function MoodTracker({ visible, onClose, onMoodSelected }: MoodTrackerProps) {
  const { currentMood, setMood } = useGameStore();
  const [selectedMood, setSelectedMood] = useState<Mood>(currentMood);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleConfirm = () => {
    setMood(selectedMood);
    onMoodSelected?.(selectedMood);
    onClose();
  };

  const getMoodSuggestions = (mood: Mood) => {
    switch (mood) {
      case 'happy':
        return ['Keep playing games!', 'Share your joy with others!', 'Try something new!'];
      case 'calm':
        return ['Try breathing exercises', 'Do some gentle tracing', 'Take your time'];
      case 'frustrated':
        return ['Take a break', 'Try breathing exercises', 'Ask for help'];
      case 'excited':
        return ['Channel that energy!', 'Try the tapping game!', 'Set a new goal!'];
      case 'tired':
        return ['Take a rest', 'Try gentle activities', 'Get some sleep'];
      default:
        return [];
    }
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
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
            <View style={styles.header}>
              <Text style={styles.title}>How are you feeling? 😊</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.moodsContainer}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodCard,
                    selectedMood === mood.id && styles.selectedMood
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <LinearGradient
                    colors={selectedMood === mood.id ? mood.color : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.moodGradient}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      selectedMood === mood.id && styles.selectedMoodText
                    ]}>
                      {mood.label}
                    </Text>
                    <Text style={[
                      styles.moodDescription,
                      selectedMood === mood.id && styles.selectedMoodText
                    ]}>
                      {mood.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {selectedMood && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions for you:</Text>
                {getMoodSuggestions(selectedMood).map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionText}>
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>I'm feeling {selectedMood}! ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  moodCard: {
    width: '45%',
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedMood: {
    transform: [{ scale: 1.05 }],
  },
  moodGradient: {
    padding: 15,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  selectedMoodText: {
    color: 'white',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  confirmButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});