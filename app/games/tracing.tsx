import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Vibration } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const [svgLayout, setSvgLayout] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 1, height: 1 });
  const [showDemo, setShowDemo] = useState(true);
  const pathRef = useRef<any>(null);
  const [pathLength, setPathLength] = useState(0);
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null);
  const [dashOffset, setDashOffset] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  const onGestureEvent = (event: { nativeEvent: { x: number; y: number; }; }) => {
    if (showDemo) return; // ignore gestures during demo
    const { x, y } = event.nativeEvent;
    // Convert touch coordinates (relative to handler) to SVG viewBox coordinates (0-100)
    const localX = ((x - svgLayout.x) / svgLayout.width) * 100;
    const localY = ((y - svgLayout.y) / svgLayout.height) * 100;
    
    if (!isTracing) {
      setIsTracing(true);
      setUserPath(`M ${localX} ${localY}`);
      Vibration.vibrate([0, 50]); // Start tracing haptic feedback
    } else {
      setUserPath(prev => `${prev} L ${localX} ${localY}`);
      Vibration.vibrate([0, 20]); // Continuous tracing haptic feedback
    }
  };

  const onHandlerStateChange = (event: { nativeEvent: { state: number; }; }) => {
    if (showDemo) return;
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
      Vibration.vibrate([0, 100, 50, 100]); // Success haptic feedback
      
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
      Vibration.vibrate([0, 200]); // Error haptic feedback
      Alert.alert('Try Again! 💪', 'Trace more carefully along the dotted line!', [
        { text: 'Retry', onPress: resetCurrentShape }
      ]);
    }
  };

  const nextShape = () => {
    setCurrentShape((currentShape + 1) % SHAPES.length);
    resetCurrentShape();
    setShowDemo(true);
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
    setShowDemo(true);
  };

  useEffect(() => {
    if (!showDemo) return;
    // ensure we have a path length
    try {
      if (pathRef.current && typeof pathRef.current.getTotalLength === 'function') {
        const len = pathRef.current.getTotalLength();
        if (len && len !== pathLength) setPathLength(len);
      }
    } catch {}
    const start = Date.now();
    const durationMs = 2000;
    const animate = () => {
      const elapsed = (Date.now() - start) % durationMs;
      const t = elapsed / durationMs; // 0..1
      setDashOffset(t * 12);
      if (pathRef.current && pathLength) {
        try {
          const l = t * pathLength;
          const p = pathRef.current.getPointAtLength(l);
          if (p && typeof p.x === 'number' && typeof p.y === 'number') {
            setFingerPos({ x: p.x, y: p.y });
          }
        } catch {}
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };
    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };
  }, [showDemo, pathLength, currentShape]);

  useEffect(() => {
    if (!showDemo) setFingerPos(null);
  }, [showDemo]);

  const startPoint = SHAPES[currentShape].points?.[0] || [50, 20];
  const svgSize = Math.min(Math.round(Dimensions.get('window').width - 60), 400);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

      <Buddy 
        message="I'm Buddy! Start from the green dot and trace along the dotted line." 
        mood="encouraging"
        showAnimation={true}
      />

      <View style={styles.shapeContainer}>
        <Text style={styles.shapeName}>Trace the {SHAPES[currentShape].name}!</Text>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          minDist={1}
          shouldCancelWhenOutside={false}
        >
          <View style={styles.tracingArea}>
            <Svg
              height={svgSize}
              width={svgSize}
              viewBox="0 0 100 100"
              onLayout={(e) => setSvgLayout(e.nativeEvent.layout)}
            >
              {/* Target shape (dotted outline) */}
              <Path
                ref={pathRef}
                d={SHAPES[currentShape].path}
                stroke="#666"
                strokeWidth="2.5"
                strokeDasharray="5,5"
                fill="none"
              />

              {/* Demo animated stroke (visible only during demo) */}
              {showDemo && (
                <Path
                  d={SHAPES[currentShape].path}
                  stroke="#4ECDC4"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="6,6"
                  strokeDashoffset={dashOffset}
                />
              )}

              {/* Demo finger following the path */}
              {showDemo && fingerPos && (
                <Circle cx={String(fingerPos.x)} cy={String(fingerPos.y)} r="3.5" fill="#333" />
              )}
              
              {/* User's trace */}
              <Path
                d={userPath}
                stroke="#FF6B6B"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Starting point indicator */}
              <Circle cx={String(startPoint[0])} cy={String(startPoint[1])} r="4" fill="#4ECDC4" />
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
          {showDemo
            ? "Watch the demo, then tap Start Tracing. ✨"
            : (!isTracing ? "Start from the green dot and trace the dotted line! ✨" : "Keep tracing! You're doing great! 🎨")}
        </Text>
      </View>

      {showDemo ? (
        <TouchableOpacity style={styles.resetButton} onPress={() => { setShowDemo(false); resetCurrentShape(); }}>
          <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>▶️ Start Tracing</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.resetButton} onPress={resetCurrentShape}>
          <LinearGradient colors={['#FFD93D', '#FF6B6B']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>🔄 Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
    </GestureHandlerRootView>
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
