import { image } from "@/utils/constants";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image } from "react-native";

interface AnimatedLogoProps {}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enhanced entrance animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2, // Slightly bigger first
        duration: 400,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Then settle to normal size
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, scaleAnim, bounceAnim]);

  const scale = scaleAnim;
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "9deg"],
  });

  // Gentle vertical bounce
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return React.createElement(
    Animated.View,
    {
      style: {
        transform: [{ scale }, { rotate: rotation }, { translateY }],
      },
    },
    React.createElement(Image, {
      source: image.splash,
      style: {
        resizeMode: "cover" as const,
        marginBottom: 0,
      },
    })
  );
};
