import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Vibration, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import Buddy from '../../components/Buddy';

const { width: screenWidth } = Dimensions.get('window');

type Task = {
  id: number;
  name: string;
  emoji: string;
  category: 'morning' | 'school' | 'afternoon' | 'evening';
  completed: boolean;
  order: number;
};

const MORNING_TASKS = [
  { name: 'Brush Teeth', emoji: '🦷', category: 'morning' as const },
  { name: 'Get Dressed', emoji: '👕', category: 'morning' as const },
  { name: 'Eat Breakfast', emoji: '🥞', category: 'morning' as const },
  { name: 'Pack Backpack', emoji: '🎒', category: 'morning' as const },
  { name: 'Put on Shoes', emoji: '👟', category: 'morning' as const },
];

const SCHOOL_TASKS = [
  { name: 'Listen to Teacher', emoji: '👩‍🏫', category: 'school' as const },
  { name: 'Do Math Work', emoji: '🔢', category: 'school' as const },
  { name: 'Read a Book', emoji: '📚', category: 'school' as const },
  { name: 'Play at Recess', emoji: '🏃‍♂️', category: 'school' as const },
  { name: 'Eat Lunch', emoji: '🍎', category: 'school' as const },
];

const AFTERNOON_TASKS = [
  { name: 'Do Homework', emoji: '✏️', category: 'afternoon' as const },
  { name: 'Play Outside', emoji: '🌳', category: 'afternoon' as const },
  { name: 'Help with Chores', emoji: '🧹', category: 'afternoon' as const },
  { name: 'Practice Piano', emoji: '🎹', category: 'afternoon' as const },
  { name: 'Call Grandma', emoji: '📞', category: 'afternoon' as const },
];

const EVENING_TASKS = [
  { name: 'Eat Dinner', emoji: '🍽️', category: 'evening' as const },
  { name: 'Take Bath', emoji: '🛁', category: 'evening' as const },
  { name: 'Put on Pajamas', emoji: '🩱', category: 'evening' as const },
  { name: 'Read Bedtime Story', emoji: '📖', category: 'evening' as const },
  { name: 'Go to Sleep', emoji: '😴', category: 'evening' as const },
];

const ALL_TASKS = [...MORNING_TASKS, ...SCHOOL_TASKS, ...AFTERNOON_TASKS, ...EVENING_TASKS];

export default function PlanningGame() {
  const { addStars, completeGame, difficulty } = useGameStore();
  const [currentCategory, setCurrentCategory] = useState<'morning' | 'school' | 'afternoon' | 'evening'>('morning');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [gamePhase, setGamePhase] = useState<'select' | 'organize' | 'complete'>('select');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [dragAnimations, setDragAnimations] = useState<Record<number, Animated.Value>>({});

  const taskCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const initializeGame = () => {
    const categoryTasks = ALL_TASKS.filter(task => task.category === currentCategory);
    const shuffled = categoryTasks.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, taskCount).map((task, index) => ({
      ...task,
      id: index,
      completed: false,
      order: -1
    }));
    
    setTasks(selected);
    setSelectedTasks([]);
    setGamePhase('select');
    setScore(0);
    setTimeLeft(60);
    setGameActive(false);
    
    // Initialize drag animations
    const animations: Record<number, Animated.Value> = {};
    selected.forEach(task => {
      animations[task.id] = new Animated.Value(1);
    });
    setDragAnimations(animations);
  };

  const startGame = () => {
    setGameActive(true);
    setGamePhase('organize');
  };

  const selectTask = (task: Task) => {
    if (gamePhase !== 'select') return;
    
    Vibration.vibrate([0, 50]);
    setSelectedTasks(prev => [...prev, task]);
    
    if (selectedTasks.length + 1 === taskCount) {
      setTimeout(() => {
        setGamePhase('organize');
        setGameActive(true);
      }, 500);
    }
  };

  const organizeTask = (task: Task, newOrder: number) => {
    if (gamePhase !== 'organize') return;
    
    Vibration.vibrate([0, 30]);
    setSelectedTasks(prev => 
      prev.map(t => 
        t.id === task.id ? { ...t, order: newOrder } : t
      )
    );
  };

  const completeTask = (task: Task) => {
    if (gamePhase !== 'complete') return;
    
    Vibration.vibrate([0, 100, 50, 100]);
    setSelectedTasks(prev => 
      prev.map(t => 
        t.id === task.id ? { ...t, completed: true } : t
      )
    );
    
    setScore(score + 10);
    
    // Animate completion
    const animValue = dragAnimations[task.id];
    if (animValue) {
      Animated.sequence([
        Animated.spring(animValue, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(animValue, { toValue: 1, useNativeDriver: true })
      ]).start();
    }
    
    // Check if all tasks completed
    const allCompleted = selectedTasks.every(t => t.id === task.id ? true : t.completed);
    if (allCompleted) {
      setTimeout(() => {
        endGame();
      }, 1000);
    }
  };

  const endGame = () => {
    setGameActive(false);
    const stars = Math.floor(score / 20) + 1;
    addStars(stars);
    completeGame();
    
    Alert.alert(
      '🎉 Great Planning!', 
      `You organized and completed your tasks!\nScore: ${score} points\nYou earned ${stars} stars!`,
      [{ text: 'Play Again', onPress: initializeGame },
       { text: 'Go Home', onPress: () => router.back() }]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning': return ['#FFE066', '#FFB84D'];
      case 'school': return ['#4ECDC4', '#44A08D'];
      case 'afternoon': return ['#96CEB4', '#85C1A3'];
      case 'evening': return ['#DDA0DD', '#C8A2C8'];
      default: return ['#E0E0E0', '#BDBDBD'];
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'morning': return '🌅';
      case 'school': return '🏫';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '📋';
    }
  };

  const TaskCard = ({ task, onPress, style, showOrder = false }: { 
    task: Task; 
    onPress: () => void; 
    style?: any;
    showOrder?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.taskCard, style, task.completed && styles.completedTask]}
      onPress={onPress}
      disabled={task.completed}
    >
      <Animated.View style={[
        styles.taskContent,
        { transform: [{ scale: dragAnimations[task.id] || 1 }] }
      ]}>
        {showOrder && task.order >= 0 && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{task.order + 1}</Text>
          </View>
        )}
        <Text style={styles.taskEmoji}>{task.emoji}</Text>
        <Text style={[styles.taskName, task.completed && styles.completedText]}>
          {task.name}
        </Text>
        {task.completed && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={getCategoryColor(currentCategory)} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {getCategoryEmoji(currentCategory)} Plan Your Day!
        </Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>⏰ {timeLeft}s</Text>
          <Text style={styles.statText}>⭐ {score}</Text>
        </View>
      </View>

      <Buddy message={
        gamePhase === 'select' ? "Choose the tasks you need to do today!" :
        gamePhase === 'organize' ? "Drag them in the order you want to do them!" :
        "Now complete them one by one!"
      } />

      {gamePhase === 'select' && (
        <View style={styles.selectPhase}>
          <Text style={styles.phaseTitle}>Step 1: Choose Your Tasks</Text>
          <View style={styles.tasksGrid}>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => selectTask(task)}
                style={selectedTasks.includes(task) && styles.selectedTask}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={startGame}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Next: Organize! ➡️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {gamePhase === 'organize' && (
        <View style={styles.organizePhase}>
          <Text style={styles.phaseTitle}>Step 2: Put Them in Order</Text>
          <View style={styles.organizeArea}>
            {[0, 1, 2, 3, 4].slice(0, taskCount).map(order => {
              const task = selectedTasks.find(t => t.order === order);
              return (
                <View key={order} style={styles.orderSlot}>
                  <Text style={styles.orderLabel}>Step {order + 1}</Text>
                  {task ? (
                    <TaskCard
                      task={task}
                      onPress={() => organizeTask(task, -1)}
                      showOrder={true}
                    />
                  ) : (
                    <View style={styles.emptySlot}>
                      <Text style={styles.emptyText}>Drop task here</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.availableTasks}>
            <Text style={styles.availableTitle}>Available Tasks:</Text>
            <View style={styles.availableGrid}>
              {selectedTasks.filter(t => t.order < 0).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => {
                    const nextOrder = selectedTasks.filter(t => t.order >= 0).length;
                    organizeTask(task, nextOrder);
                  }}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => setGamePhase('complete')}
            disabled={selectedTasks.some(t => t.order < 0)}
          >
            <LinearGradient 
              colors={selectedTasks.some(t => t.order < 0) ? ['#CCC', '#999'] : ['#4ECDC4', '#44A08D']} 
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Doing! 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {gamePhase === 'complete' && (
        <View style={styles.completePhase}>
          <Text style={styles.phaseTitle}>Step 3: Complete Your Tasks!</Text>
          <View style={styles.completeArea}>
            {selectedTasks
              .filter(t => t.order >= 0)
              .sort((a, b) => a.order - b.order)
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => completeTask(task)}
                  showOrder={true}
                />
              ))}
          </View>
        </View>
      )}
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
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectPhase: {
    flex: 1,
    padding: 20,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 8,
    width: (screenWidth - 80) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedTask: {
    backgroundColor: '#4ECDC4',
    transform: [{ scale: 1.05 }],
  },
  completedTask: {
    backgroundColor: '#E8F8F5',
    opacity: 0.8,
  },
  taskContent: {
    alignItems: 'center',
    position: 'relative',
  },
  orderBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkmark: {
    fontSize: 24,
    color: '#4ECDC4',
    marginTop: 5,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  organizePhase: {
    flex: 1,
    padding: 20,
  },
  organizeArea: {
    flex: 1,
    marginBottom: 20,
  },
  orderSlot: {
    marginBottom: 15,
  },
  orderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptySlot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
  },
  availableTasks: {
    marginBottom: 20,
  },
  availableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  availableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  completePhase: {
    flex: 1,
    padding: 20,
  },
  completeArea: {
    flex: 1,
  },
});