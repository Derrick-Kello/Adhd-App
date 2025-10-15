import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';
import type { Difficulty } from '../types/game';
import Buddy from '../components/Buddy';

export default function ParentScreen() {
  const { stats, difficulty, setDifficulty, soundEnabled, toggleSound, focusSessions, totalFocusTime, currentMood } = useGameStore();
  const [showPinEntry, setShowPinEntry] = useState(true);
  const [pin, setPin] = useState('');

  const PARENT_PIN = '1234'; // Simple PIN for demo

  const handlePinEntry = (digit) => {
    const newPin = pin + digit;
    setPin(newPin);
    
    if (newPin.length === 4) {
      if (newPin === PARENT_PIN) {
        setShowPinEntry(false);
      } else {
        Alert.alert('Incorrect PIN', 'Please try again.');
        setPin('');
      }
    }
  };

  const clearPin = () => {
    setPin('');
  };

  if (showPinEntry) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>Parent Access 👨‍👩‍👧‍👦</Text>
          <Text style={styles.pinSubtitle}>Enter PIN to continue</Text>
          <Buddy message="Hi, I'm Buddy! Ask a parent to enter the PIN so we can check your progress." />
          
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={styles.pinDot}>
                <Text style={styles.pinDotText}>
                  {pin.length > index ? '●' : '○'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.keypadButton}
                onPress={() => handlePinEntry(digit.toString())}
              >
                <Text style={styles.keypadText}>{digit}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.keypadButton} />
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handlePinEntry('0')}
            >
              <Text style={styles.keypadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={clearPin}>
              <Text style={styles.keypadText}>⌫</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.backToGameButton}>
            <Text style={styles.backToGameText}>← Back to Game</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Parent Dashboard</Text>
        <TouchableOpacity onPress={() => setShowPinEntry(true)} style={styles.lockButton}>
          <Text style={styles.lockText}>🔒</Text>
        </TouchableOpacity>
      </View>

      <Buddy message="Hi, I'm Buddy! Here you can adjust settings and see progress." />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Progress Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalStars}</Text>
              <Text style={styles.statLabel}>Stars Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.currentLevel}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.badges.length}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{focusSessions}</Text>
              <Text style={styles.statLabel}>Focus Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{Math.floor(totalFocusTime / 60)}m</Text>
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Difficulty Level</Text>
              <Text style={styles.settingDescription}>Adjust game difficulty</Text>
            </View>
            <View style={styles.difficultyButtons}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.activeDifficulty
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[
                    styles.difficultyText,
                    difficulty === level && styles.activeDifficultyText
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDescription}>Enable game sounds</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#CCC', true: '#4ECDC4' }}
              thumbColor={soundEnabled ? '#FFF' : '#FFF'}
            />
          </View>
        </View>

        {/* Mood Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 Mood Insights</Text>
          <View style={styles.moodCard}>
            <Text style={styles.moodTitle}>Current Mood</Text>
            <View style={styles.moodDisplay}>
              <Text style={styles.moodEmoji}>
                {currentMood === 'happy' ? '😊' : 
                 currentMood === 'calm' ? '😌' : 
                 currentMood === 'frustrated' ? '😤' : 
                 currentMood === 'excited' ? '🤩' : '😴'}
              </Text>
              <Text style={styles.moodLabel}>
                {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
              </Text>
            </View>
            <Text style={styles.moodDescription}>
              {currentMood === 'happy' && 'Your child is feeling great and positive!'}
              {currentMood === 'calm' && 'Your child is peaceful and relaxed.'}
              {currentMood === 'frustrated' && 'Your child might need some support or a break.'}
              {currentMood === 'excited' && 'Your child is full of energy and enthusiasm!'}
              {currentMood === 'tired' && 'Your child might need some rest or gentle activities.'}
            </Text>
          </View>
        </View>

        {/* Tips for Parents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips for Parents</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🎯 Focus & ADHD</Text>
            <Text style={styles.tipText}>
              Short, engaging activities help children with ADHD maintain focus and build confidence.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⏰ Screen Time Balance</Text>
            <Text style={styles.tipText}>
              Use movement breaks every 15-20 minutes to help reset attention and energy levels.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🏆 Positive Reinforcement</Text>
            <Text style={styles.tipText}>
              Celebrate small wins! Every star earned is progress worth acknowledging.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>😊 Mood Awareness</Text>
            <Text style={styles.tipText}>
              Check your child's mood regularly and adjust activities accordingly. Frustrated? Try breathing exercises. Excited? Channel that energy!
            </Text>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Support</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportText}>View Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  // PIN Entry Styles
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  pinSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  pinDot: {
    marginHorizontal: 10,
  },
  pinDotText: {
    fontSize: 30,
    color: 'white',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 240,
    marginBottom: 40,
  },
  keypadButton: {
    width: 60,
    height: 60,
    margin: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backToGameButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToGameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Main Dashboard Styles
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
  lockButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  lockText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  difficultyButtons: {
    flexDirection: 'row',
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 5,
    backgroundColor: '#F0F0F0',
  },
  activeDifficulty: {
    backgroundColor: '#4ECDC4',
  },
  difficultyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeDifficultyText: {
    color: 'white',
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  moodCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  moodEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  moodLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  moodDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});