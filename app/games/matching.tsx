import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

const CARD_EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦋', '🌟', '🎈'];

export default function MatchingGame() {
  const { addStars, completeGame, difficulty } = useGameStore();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [flipAnimations, setFlipAnimations] = useState({});

  const cardCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const selectedEmojis = CARD_EMOJIS.slice(0, cardCount / 2);
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameStarted(false);
    
    // Initialize flip animations
    const animations = {};
    gameCards.forEach(card => {
      animations[card.id] = new Animated.Value(0);
    });
    setFlipAnimations(animations);
  };

  const flipCard = (cardId) => {
    if (!gameStarted) setGameStarted(true);
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedPairs.some(pair => pair.includes(cardId))) return;

    // Animate card flip
    Animated.spring(flipAnimations[cardId], {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)
      );

      if (firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, newFlippedCards]);
          setFlippedCards([]);
          
          if (matchedPairs.length + 1 === cardCount / 2) {
            // Game complete!
            const stars = Math.max(1, 4 - Math.floor(moves / 5));
            addStars(stars);
            completeGame();
            
            Alert.alert(
              '🎉 Amazing!', 
              `You matched all pairs in ${moves + 1} moves!\nYou earned ${stars} stars!`,
              [{ text: 'Play Again', onPress: initializeGame },
               { text: 'Go Home', onPress: () => router.back() }]
            );
          }
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          newFlippedCards.forEach(id => {
            Animated.spring(flipAnimations[id], {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const Card = ({ card }) => {
    const isFlipped = flippedCards.includes(card.id) || 
                    matchedPairs.some(pair => pair.includes(card.id));
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => flipCard(card.id)}
        disabled={isFlipped}
      >
        <Animated.View
          style={[
            styles.cardInner,
            {
              transform: [{
                rotateY: flipAnimations[card.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                }) || '0deg'
              }]
            }
          ]}
        >
          <LinearGradient
            colors={isFlipped ? ['#4ECDC4', '#44A08D'] : ['#667eea', '#764ba2']}
            style={styles.cardGradient}
          >
            <Text style={styles.cardText}>
              {isFlipped ? card.emoji : '?'}
            </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#FF9A9E', '#FECFEF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Memory Match! 🧩</Text>
        <View style={styles.stats}>
          <Text style={styles.moveText}>Moves: {moves}</Text>
        </View>
      </View>

      <Buddy message="I'm Buddy! Tap two cards to find a matching pair." />

      <View style={styles.gameArea}>
        <View style={styles.cardsGrid}>
          {cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </View>
      </View>

      <View style={styles.mascotContainer}>
        <Text style={styles.mascotText}>
          {!gameStarted ? "Tap cards to find matching pairs! 🎯" : 
           flippedCards.length === 1 ? "Find the matching card! 🔍" :
           "Great job! Keep going! 🌟"}
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
  stats: {
    alignItems: 'center',
  },
  moveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: 80,
    height: 80,
    margin: 5,
  },
  cardInner: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  mascotContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mascotText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
