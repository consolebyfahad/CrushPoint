import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { FemaleIcon, MaleIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Gender() {
  const { updateUserData, user } = useAppContext();
  console.log("isLoggedIn", user);

  const [selectedGender, setSelectedGender] = useState("male");

  // Animated values for both options
  const maleScaleAnim = useRef(new Animated.Value(1)).current;
  const femaleScaleAnim = useRef(new Animated.Value(1)).current;
  const maleOpacityAnim = useRef(new Animated.Value(1)).current;
  const femaleOpacityAnim = useRef(new Animated.Value(0.7)).current;

  // Animate selection changes
  useEffect(() => {
    if (selectedGender === "male") {
      // Animate male to selected state
      Animated.parallel([
        Animated.spring(maleScaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(maleOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Animate female to unselected state
        Animated.spring(femaleScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(femaleOpacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate female to selected state
      Animated.parallel([
        Animated.spring(femaleScaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(femaleOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Animate male to unselected state
        Animated.spring(maleScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(maleOpacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedGender]);

  const handleGenderSelect = (gender: any) => {
    // Add a quick press animation
    const scaleAnim = gender === "male" ? maleScaleAnim : femaleScaleAnim;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: gender === selectedGender ? 1.02 : 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedGender(gender);
  };

  const handleContinue = () => {
    updateUserData({ gender: selectedGender });
    router.push("/auth/intrested");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{"What's your gender?"}</Text>
          <Text style={styles.subtitle}>
            <Octicons name="info" size={14} color={color.gray55} /> This helps
            us create a better experience for you
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            onPress={() => handleGenderSelect("male")}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.genderOption,
                selectedGender === "male"
                  ? styles.selectedOption
                  : styles.unselectedOption,
                {
                  transform: [{ scale: maleScaleAnim }],
                  opacity: maleOpacityAnim,
                },
              ]}
            >
              <MaleIcon />
              <Text
                style={[
                  styles.genderText,
                  selectedGender === "male"
                    ? styles.selectedText
                    : styles.unselectedText,
                ]}
              >
                Male
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenderSelect("female")}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.genderOption,
                selectedGender === "female"
                  ? styles.selectedOption
                  : styles.unselectedOption,
                {
                  transform: [{ scale: femaleScaleAnim }],
                  opacity: femaleOpacityAnim,
                },
              ]}
            >
              <FemaleIcon />
              <Text
                style={[
                  styles.genderText,
                  selectedGender === "female"
                    ? styles.selectedText
                    : styles.unselectedText,
                ]}
              >
                Female
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    paddingTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  genderOption: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  selectedOption: {
    backgroundColor: color.gray95,
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray87,
  },
  genderText: {
    fontSize: 18,
    fontFamily: font.medium,
  },
  selectedText: {
    color: color.primary,
  },
  unselectedText: {
    color: color.black,
  },
  buttonContainer: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray95,
  },
});
