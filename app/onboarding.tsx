import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../src/store/gameStore';

const HAIR_OPTIONS = ['brown', 'blonde', 'black', 'red', 'blue', 'purple'];
const CLOTHES_OPTIONS = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
const SKIN_OPTIONS = ['light', 'medium', 'dark'];

export default function OnboardingScreen() {
  const { setAvatar, setOnboarded } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState({
    hair: 'brown',
    clothes: 'blue',
    color: 'light',
    accessories: []
  });

  const slideAnim = new Animated.Value(0);

  const nextStep = () => {
    if (currentStep < 3) {
      Animated.spring(slideAnim, {
        toValue: -(currentStep + 1) * 400,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    } else {
      setAvatar(selectedAvatar);
      setOnboarded();
      router.replace('/home');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.mascotText}>👋 Hi there, superstar!</Text>
            <Text style={styles.instructionText}>
              I'm Buddy, your learning companion! Let's create your awesome avatar!
            </Text>
          </View>
        );
      
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Your Hair! 💇‍♀️</Text>
            <View style={styles.optionsContainer}>
              {HAIR_OPTIONS.map((hair) => (
                <TouchableOpacity
                  key={hair}
                  style={[
                    styles.optionButton,
                    selectedAvatar.hair === hair && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAvatar({...selectedAvatar, hair})}
                >
                  <Text style={styles.optionText}>{hair}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pick Your Outfit! 👕</Text>
            <View style={styles.optionsContainer}>
              {CLOTHES_OPTIONS.map((clothes) => (
                <TouchableOpacity
                  key={clothes}
                  style={[
                    styles.optionButton,
                    selectedAvatar.clothes === clothes && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAvatar({...selectedAvatar, clothes})}
                >
                  <Text style={styles.optionText}>{clothes}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Skin Tone! 🎨</Text>
            <View style={styles.optionsContainer}>
              {SKIN_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.optionButton,
                    selectedAvatar.color === color && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAvatar({...selectedAvatar, color})}
                >
                  <Text style={styles.optionText}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#FF9A9E', '#FECFEF', '#FECFEF']} style={styles.container}>
      <View style={styles.avatarPreview}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
          <Text style={styles.avatarDetails}>
            Hair: {selectedAvatar.hair} | Clothes: {selectedAvatar.clothes} | Skin: {selectedAvatar.color}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.stepsContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {renderStep()}
      </Animated.View>

      <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
        <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>
            {currentStep === 3 ? "Let's Start! 🚀" : "Next! ➡️"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.progressBar}>
        {[0, 1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  avatarPreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  avatarDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '400%',
  },
  stepContainer: {
    width: '25%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    margin: 8,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedOption: {
    backgroundColor: '#4ECDC4',
    transform: [{ scale: 1.1 }],
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  nextButton: {
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
});
