import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

export type BuddyProps = {
  message: string;
  autoSpeak?: boolean;
};

export default function Buddy({ message, autoSpeak = true }: BuddyProps) {
  const { soundEnabled } = useGameStore();
  const lastMessageRef = useRef<string>('');

  const speak = () => {
    if (!soundEnabled) return;
    Speech.stop();
    
    // Cross-platform speech settings
    const speechOptions = {
      language: 'en-US',
      pitch: 1.2, // Slightly higher pitch for friendlier sound
      rate: 0.85, // Slower rate for better comprehension
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <LinearGradient 
          colors={['#FF6B6B', '#4ECDC4']} 
          style={styles.avatar}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Text style={styles.avatarEmoji}>🧠</Text>
        </LinearGradient>
        <LinearGradient colors={["#FFFFFF", "#F8FDFF"]} style={styles.bubble}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>Buddy</Text>
            <Text style={styles.subtitle}>Your Focus Friend!</Text>
          </View>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={speak} 
              style={[styles.actionBtn, styles.speakBtn]}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.actionBtnGradient}>
                <Text style={styles.actionText}>🔊 Play</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Speech.stop()} 
              style={[styles.actionBtn, styles.stopBtn]}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.actionBtnGradient}>
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
