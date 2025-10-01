import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

const SHAPES = [
  { name: 'Circle', path: 'M 50 100 A 50 50 0 1 1 50 99', points: [[50, 50]] },
  { name: 'Square', path: 'M 25 25 L 75 25 L 75 75 L 25 75 Z', points: [[25, 25], [75, 25], [75, 75], [25, 75]] },
  { name: 'Triangle', path: 'M 50 20 L 80 70 L 20 70 Z', points: [[50, 20], [80, 70], [20, 70]] },
  { name: 'Star', path: 'M 50 10 L 60 35 L 85 35 L 67 55 L 75 80 L 50 65 L 25 80 L 33 55 L 15 35 L 40 35 Z', points: [] },
];

export default function TracingGame() {
  const { addStars, completeGame, difficulty } = useGameStore();
  const [currentShape, setCurrentShape] = useState(0);
  const [userPath, setUserPath] = useState('');
  const [isTracing, setIsTracing] = useState(false);
  const [completedShapes, setCompletedShapes] = useState(0);
  const [traceAccuracy, setTraceAccuracy] = useState(0);

  const onGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    
    if (!isTracing) {
      setIsTracing(true);
      setUserPath(`M ${x} ${y}`);
    } else {
      setUserPath(prev => `${prev} L ${x} ${y}`);
    }
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) { // END
      setIsTracing(false);
      checkTraceAccuracy();
    }
  };

  const checkTraceAccuracy = () => {
    // Simple accuracy check - in a real app, this would be more sophisticated
    const accuracy = Math.random() * 40 + 60; // 60-100% for demo
    setTraceAccuracy(accuracy);

    if (accuracy > 70) {
      const newCompleted = completedShapes + 1;
      setCompletedShapes(newCompleted);
      
      setTimeout(() => {
        if (newCompleted >= SHAPES.length) {
          // Game complete!
          const stars = Math.floor(accuracy / 25);
          addStars(stars);
          completeGame();
          
          Alert.alert(
            '🎉 Fantastic!', 
            `You traced all shapes! Accuracy: ${Math.round(accuracy)}%\nYou earned ${stars} stars!`,
            [{ text: 'Play Again', onPress: resetGame },
             { text: 'Go Home', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Great job! 🌟', 'Next shape!', [
            { text: 'Continue', onPress: nextShape }
          ]);
        }
      }, 1000);
    } else {
      Alert.alert('Try Again! 💪', 'Trace more carefully along the dotted line!', [
        { text: 'Retry', onPress: resetCurrentShape }
      ]);
    }
  };

  const nextShape = () => {
    setCurrentShape((currentShape + 1) % SHAPES.length);
    resetCurrentShape();
  };

  const resetCurrentShape = () => {
    setUserPath('');
    setIsTracing(false);
    setTraceAccuracy(0);
  };

  const resetGame = () => {
    setCurrentShape(0);
    setCompletedShapes(0);
    resetCurrentShape();
  };

  return (
    <LinearGradient colors={['#A8E6CF', '#88D8A3']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shape Tracer! ✏️</Text>
        <View style={styles.progress}>
          <Text style={styles.progressText}>{completedShapes}/{SHAPES.length}</Text>
        </View>
      </View>

      <Buddy message="I'm Buddy! Start from the green dot and trace along the dotted line." />

      <View style={styles.shapeContainer}>
        <Text style={styles.shapeName}>Trace the {SHAPES[currentShape].name}!</Text>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View style={styles.tracingArea}>
            <Svg height="200" width="200" viewBox="0 0 100 100">
              {/* Target shape (dotted outline) */}
              <Path
                d={SHAPES[currentShape].path}
                stroke="#666"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
              
              {/* User's trace */}
              <Path
                d={userPath}
                stroke="#FF6B6B"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Starting point indicator */}
              <Circle cx="50" cy="20" r="3" fill="#4ECDC4" />
            </Svg>
          </View>
        </PanGestureHandler>

        {traceAccuracy > 0 && (
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyText}>
              Accuracy: {Math.round(traceAccuracy)}% 
              {traceAccuracy > 90 ? ' 🌟' : traceAccuracy > 70 ? ' 👍' : ' 💪'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.mascotContainer}>
        <Text style={styles.mascotText}>
          {!isTracing ? "Start from the green dot and trace the dotted line! ✨" : 
           "Keep tracing! You're doing great! 🎨"}
        </Text>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetCurrentShape}>
        <LinearGradient colors={['#FFD93D', '#FF6B6B']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>🔄 Try Again</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  progress: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  shapeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  shapeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  tracingArea: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accuracyContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  mascotContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mascotText: {
    fontSize: 16,
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
  resetButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
