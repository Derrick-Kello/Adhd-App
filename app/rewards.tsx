import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';
import type { Accessory, Badge } from '../types/rewards';

const AVATAR_ACCESSORIES: Accessory[] = [
  { name: 'Cool Sunglasses', emoji: '🕶️', cost: 10, type: 'glasses' },
  { name: 'Magic Hat', emoji: '🎩', cost: 15, type: 'hat' },
  { name: 'Super Cape', emoji: '🦸', cost: 20, type: 'cape' },
  { name: 'Crown', emoji: '👑', cost: 25, type: 'crown' },
  { name: 'Rainbow Hair', emoji: '🌈', cost: 30, type: 'hair' },
  { name: 'Wings', emoji: '🦋', cost: 35, type: 'wings' },
];

const BADGES: Badge[] = [
  { name: 'First Game', emoji: '🎮', description: 'Played your first game!' },
  { name: 'Star Collector', emoji: '⭐', description: 'Collected 50 stars!' },
  { name: 'Memory Master', emoji: '🧠', description: 'Won 5 memory games!' },
  { name: 'Tracing Pro', emoji: '✏️', description: 'Perfect tracing score!' },
  { name: 'Speed Demon', emoji: '⚡', description: 'Lightning fast reflexes!' },
  { name: 'Movement Champion', emoji: '🏃', description: 'Completed movement breaks!' },
];

export default function RewardsScreen() {
  const { stats, avatar, setAvatar, addStars } = useGameStore();
  const [selectedTab, setSelectedTab] = useState('accessories');

  const buyAccessory = (accessory: Accessory) => {
    if (stats.totalStars >= accessory.cost) {
      Alert.alert(
        '🎉 Purchase Successful!',
        `You got the ${accessory.name}! It looks amazing on you!`,
        [
          {
            text: 'Wear It!',
            onPress: () => {
              const newAccessories = [...avatar.accessories];
              if (!newAccessories.includes(accessory.name)) {
                newAccessories.push(accessory.name);
              }
              setAvatar({ ...avatar, accessories: newAccessories });
              addStars(-accessory.cost); // Subtract stars
            }
          }
        ]
      );
    } else {
      Alert.alert(
        '⭐ Not Enough Stars',
        `You need ${accessory.cost - stats.totalStars} more stars to buy this item!`,
        [{ text: 'Keep Playing!', onPress: () => router.back() }]
      );
    }
  };

  type AccessoryCardProps = { accessory: Accessory };
  const AccessoryCard = ({ accessory }: AccessoryCardProps) => {
    const owned = avatar.accessories.includes(accessory.name);
    const canAfford = stats.totalStars >= accessory.cost;

    return (
      <View style={[styles.card, owned && styles.ownedCard]}>
        <Text style={styles.cardEmoji}>{accessory.emoji}</Text>
        <Text style={styles.cardTitle}>{accessory.name}</Text>
        <Text style={styles.cardCost}>{accessory.cost} ⭐</Text>
        
        {owned ? (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>✓ Owned</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, !canAfford && styles.disabledButton]}
            onPress={() => buyAccessory(accessory)}
            disabled={!canAfford}
          >
            <LinearGradient
              colors={canAfford ? ['#4ECDC4', '#44A08D'] : ['#CCC', '#999']}
              style={styles.buyButtonGradient}
            >
              <Text style={styles.buyButtonText}>
                {canAfford ? 'Buy' : 'Need More ⭐'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  type BadgeCardProps = { badge: Badge };
  const BadgeCard = ({ badge }: BadgeCardProps) => {
    const earned = stats.badges.includes(badge.name);

    return (
      <View style={[styles.badgeCard, earned && styles.earnedBadge]}>
        <Text style={[styles.badgeEmoji, !earned && styles.lockedEmoji]}>
          {earned ? badge.emoji : '🔒'}
        </Text>
        <Text style={[styles.badgeTitle, !earned && styles.lockedText]}>
          {badge.name}
        </Text>
        <Text style={[styles.badgeDescription, !earned && styles.lockedText]}>
          {badge.description}
        </Text>
        {earned && (
          <View style={styles.earnedLabel}>
            <Text style={styles.earnedText}>✨ Earned!</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Rewards! 🎁</Text>
        <View style={styles.starsContainer}>
          <Text style={styles.starsText}>{stats.totalStars} ⭐</Text>
        </View>
      </View>

      <View style={styles.avatarPreview}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
          <View style={styles.accessoriesDisplay}>
            {avatar.accessories.map((accessory, index) => {
              const item = AVATAR_ACCESSORIES.find(a => a.name === accessory);
              return (
                <Text key={index} style={styles.accessoryEmoji}>
                  {item?.emoji}
                </Text>
              );
            })}
          </View>
        </View>
        <Text style={styles.avatarLabel}>Your Avatar</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'accessories' && styles.activeTab]}
          onPress={() => setSelectedTab('accessories')}
        >
          <Text style={[styles.tabText, selectedTab === 'accessories' && styles.activeTabText]}>
            🛍️ Shop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'badges' && styles.activeTab]}
          onPress={() => setSelectedTab('badges')}
        >
          <Text style={[styles.tabText, selectedTab === 'badges' && styles.activeTabText]}>
            🏆 Badges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'accessories' ? (
          <View style={styles.grid}>
            {AVATAR_ACCESSORIES.map((accessory, index) => (
              <AccessoryCard key={index} accessory={accessory} />
            ))}
          </View>
        ) : (
          <View style={styles.badgesGrid}>
            {BADGES.map((badge, index) => (
              <BadgeCard key={index} badge={badge} />
            ))}
          </View>
        )}
      </ScrollView>
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
  starsContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  starsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarPreview: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  accessoriesDisplay: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  accessoryEmoji: {
    fontSize: 20,
    margin: 2,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ownedCard: {
    backgroundColor: '#E8F8F5',
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  cardEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardCost: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  buyButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buyButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownedBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ownedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgesGrid: {
    paddingBottom: 20,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  earnedBadge: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FFD93D',
    borderWidth: 2,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  lockedEmoji: {
    opacity: 0.3,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  lockedText: {
    opacity: 0.5,
  },
  earnedLabel: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  earnedText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
