import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';
import Buddy from '../components/Buddy';
import FocusMode from '../components/FocusMode';
import MoodTracker from '../components/MoodTracker';

type GameCardProps = {
  title: string;
  emoji: string;
  description: string;
  route: string;
  color: string[];
};

export default function HomeScreen() {
  const { stats, avatar, lastMovementBreak, focusSessions, totalFocusTime, currentMood, dailyStreak, updateDailyStreak } = useGameStore();
  const [bounceAnim] = useState(new Animated.Value(1));
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);

  const shouldShowMovementBreak = () => {
    return stats.gamesPlayed > 0 && (stats.gamesPlayed % 3 === 0) && 
           Date.now() - lastMovementBreak > 5 * 60 * 1000; // 5 minutes
  };

  const startBounceAnimation = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.1, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };
  useEffect(() => {
    const interval = setInterval(startBounceAnimation, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update daily streak when component mounts
    updateDailyStreak();
  }, []);

  const GameCard = ({ title, emoji, description, route, color }: GameCardProps) => (
    <TouchableOpacity
      onPress={() => router.push(route)}
      style={styles.gameCard}
    >
      <LinearGradient colors={[color[0], color[1]]} style={styles.gameCardGradient}>
        <Text style={styles.gameEmoji}>{emoji}</Text>
        <Text style={styles.gameTitle}>{title}</Text>
        <Text style={styles.gameDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.welcomeText}>Hey Champion! 🌟</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalStars}</Text>
                <Text style={styles.statLabel}>⭐ Stars</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.currentLevel}</Text>
                <Text style={styles.statLabel}>📈 Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dailyStreak}</Text>
                <Text style={styles.statLabel}>🔥 Streak</Text>
              </View>
            </View>
            <View style={styles.additionalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{focusSessions}</Text>
                <Text style={styles.statLabel}>🎯 Focus</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{Math.floor(totalFocusTime / 60)}m</Text>
                <Text style={styles.statLabel}>⏱️ Time</Text>
              </View>
              <TouchableOpacity 
                style={styles.moodButton}
                onPress={() => setShowMoodTracker(true)}
              >
                <Text style={styles.moodEmoji}>
                  {currentMood === 'happy' ? '😊' : 
                   currentMood === 'calm' ? '😌' : 
                   currentMood === 'frustrated' ? '😤' : 
                   currentMood === 'excited' ? '🤩' : '😴'}
                </Text>
                <Text style={styles.moodLabel}>Mood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buddy Assistant */}
        <Buddy 
          message="Hi, I'm Buddy! What would you like to do today?" 
          mood="happy"
          showAnimation={true}
        />

        {/* Movement Break Alert */}
        {shouldShowMovementBreak() && (
          <Animated.View style={[styles.movementAlert, { transform: [{ scale: bounceAnim }] }]}>
            <TouchableOpacity
              onPress={() => router.push('/movement')}
              style={styles.movementButton}
            >
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.movementGradient}>
                <Text style={styles.movementEmoji}>🏃‍♂️</Text>
                <Text style={styles.movementText}>Time for a Movement Break!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Focus Mode Button */}
        <View style={styles.focusSection}>
          <TouchableOpacity 
            style={styles.focusButton}
            onPress={() => setShowFocusMode(true)}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.focusGradient}>
              <Text style={styles.focusEmoji}>🎯</Text>
              <Text style={styles.focusTitle}>Focus</Text>
              <Text style={styles.focusDescription}>Focus without distractions!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Games Section */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>🎮 Choose Your Adventure!</Text>
          
          <View style={styles.gamesGrid}>
            <GameCard
              title="Memory Match"
              emoji="🧩"
              description="Match the cards!"
              route="/games/matching"
              color={['#FF9A9E', '#FECFEF']}
            />
            <GameCard
              title="Shape Tracer"
              emoji="✏️"
              description="Trace with your finger!"
              route="/games/tracing"
              color={['#A8E6CF', '#88D8A3']}
            />
            <GameCard
              title="Quick Tap"
              emoji="⚡"
              description="Tap the right colors!"
              route="/games/tapping"
              color={['#FFD93D', '#FF6B6B']}
            />
            <GameCard
              title="Plan Your Day"
              emoji="📋"
              description="Organize your tasks!"
              route="/games/planning"
              color={['#FFE066', '#FFB84D']}
            />
            <GameCard
              title="Breathe & Relax"
              emoji="🌬️"
              description="Calm breathing exercises!"
              route="/games/breathing"
              color={['#4ECDC4', '#44A08D']}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/rewards')}
          >
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.actionGradient}>
              <Text style={styles.actionEmoji}>🎁</Text>
              <Text style={styles.actionText}>My Rewards</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/parent')}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.actionGradient}>
              <Text style={styles.actionEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.actionText}>Parent Zone</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Focus Mode Modal */}
      <FocusMode
        visible={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        onStart={(duration) => {
          setShowFocusMode(false);
          // Handle focus session start
        }}
      />

      {/* Mood Tracker Modal */}
      <MoodTracker
        visible={showMoodTracker}
        onClose={() => setShowMoodTracker(false)}
        onMoodSelected={(mood) => {
          console.log('Mood selected:', mood);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  statsContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  movementAlert: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  movementButton: {
    borderRadius: 15,
  },
  movementGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  movementEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  movementText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusSection: {
    padding: 20,
  },
  focusButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  focusGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  focusEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  focusDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  gamesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  gamesGrid: {
    gap: 15,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gameCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  gameEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 15,
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});