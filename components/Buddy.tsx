import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

export type BuddyProps = {
  message: string;
  autoSpeak?: boolean;
  mood?: 'happy' | 'excited' | 'calm' | 'encouraging' | 'celebrating';
  showAnimation?: boolean;
};

const BUDDY_MOODS = {
  happy: { emoji: '😊', color: ['#4ECDC4', '#44A08D'] },
  excited: { emoji: '🤩', color: ['#FFD93D', '#FF6B6B'] },
  calm: { emoji: '😌', color: ['#96CEB4', '#85C1A3'] },
  encouraging: { emoji: '💪', color: ['#667eea', '#764ba2'] },
  celebrating: { emoji: '🎉', color: ['#FF9A9E', '#FECFEF'] },
};

export default function Buddy({ message, autoSpeak = true, mood = 'happy', showAnimation = true }: BuddyProps) {
  const { soundEnabled, stats } = useGameStore();
  const lastMessageRef = useRef<string>('');
  const [bounceAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const currentMood = BUDDY_MOODS[mood];

  const speak = () => {
    if (!soundEnabled) return;
    Speech.stop();
    
    // Adjust speech based on mood
    const pitch = mood === 'excited' ? 1.2 : mood === 'calm' ? 0.8 : 1.0;
    const rate = mood === 'excited' ? 1.1 : mood === 'calm' ? 0.9 : 1.0;
    
    Speech.speak(message, {
      language: 'en-US',
      pitch: pitch,
      rate: rate,
      onDone: () => {},
    });
  };

  useEffect(() => {
    if (autoSpeak && soundEnabled && lastMessageRef.current !== message) {
      lastMessageRef.current = message;
      speak();
    }
    return () => {
      Speech.stop();
    };
  }, [message, autoSpeak, soundEnabled]);

  useEffect(() => {
    if (showAnimation) {
      // Bounce animation
      const bounce = Animated.sequence([
        Animated.spring(bounceAnim, { toValue: 1.1, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
      ]);
      
      // Pulse animation for excited mood
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      );

      bounce.start();
      if (mood === 'excited' || mood === 'celebrating') {
        pulse.start();
      }

      return () => {
        bounce.stop();
        pulse.stop();
      };
    }
  }, [message, mood, showAnimation]);

  const getPersonalizedMessage = () => {
    // Add personalized touches based on user stats
    if (stats.gamesPlayed > 10) {
      return `🌟 ${message} (You're doing amazing!)`;
    } else if (stats.totalStars > 50) {
      return `⭐ ${message} (Look at all those stars!)`;
    }
    return message;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Animated.View style={[
          styles.avatar, 
          { 
            transform: [
              { scale: bounceAnim },
              { scale: pulseAnim }
            ]
          }
        ]}>
          <Text style={styles.avatarEmoji}>{currentMood.emoji}</Text>
        </Animated.View>
        <LinearGradient colors={currentMood.color} style={styles.bubble}>
          <Text style={styles.name}>Buddy</Text>
          <Text style={styles.text}>{getPersonalizedMessage()}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={speak} style={styles.actionBtn}>
              <Text style={styles.actionText}>🔊</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Speech.stop()} style={styles.actionBtn}>
              <Text style={styles.actionText}>⏹</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarEmoji: { fontSize: 24 },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: { fontWeight: '700', color: '#444', marginBottom: 2 },
  text: { color: '#333' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 14 },
});
