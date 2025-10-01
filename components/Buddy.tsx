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
    Speech.speak(message, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarEmoji}>🤖</Text></View>
        <LinearGradient colors={["#FFFFFF", "#F5F5F5"]} style={styles.bubble}>
          <Text style={styles.name}>Buddy</Text>
          <Text style={styles.text}>{message}</Text>
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
