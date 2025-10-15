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
    
    const speechOptions = {
      language: 'en-US',
      pitch: pitch,
      rate: rate,
      onDone: () => {},
      onError: (error) => {
        console.log('Speech error:', error);
        // Fallback to basic settings if enhanced options fail
        Speech.speak(message, {
          language: 'en-US',
          pitch: 1.1,
          rate: 0.9,
        });
      },
    };
    
    Speech.speak(message, speechOptions);
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
        <LinearGradient colors={currentMood.color as const} style={styles.bubble}>
          <Text style={styles.name}>Buddy</Text>
          <Text style={styles.text}>{getPersonalizedMessage()}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={speak} 
              style={[styles.actionBtn, styles.speakBtn]}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#4ECDC4', '#44A08D'] as const} style={styles.actionBtnGradient}>
                <Text style={styles.actionText}>🔊 Play</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Speech.stop()} 
              style={[styles.actionBtn, styles.stopBtn]}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#FF6B6B', '#FF8E53'] as const} style={styles.actionBtnGradient}>
                <Text style={styles.actionText}>⏹ Stop</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    paddingHorizontal: 16, 
    marginTop: 12, 
    marginBottom: 12 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarEmoji: { 
    fontSize: 26,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bubble: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.1)',
  },
  nameContainer: {
    marginBottom: 8,
  },
  name: { 
    fontWeight: '800', 
    color: '#2C3E50', 
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#7F8C8D',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  text: { 
    color: '#34495E',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
  },
  actions: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  actionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionBtnGradient: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakBtn: {
    minWidth: 70,
  },
  stopBtn: {
    minWidth: 70,
  },
  actionText: { 
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
});
