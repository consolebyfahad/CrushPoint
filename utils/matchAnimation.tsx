import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const FloatingBubbleAnimation = ({
  visible,
  svgEmoji,
  color,
  onComplete,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      // Quick flash animation - 100ms total
      Animated.sequence([
        // Quick scale up
        Animated.timing(scaleAnim, {
          toValue: 5,
          duration: 200,
          useNativeDriver: true,
        }),
        // Quick scale down and fade out
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });

      // Fade in immediately
      Animated.timing(opacityAnim, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.centerContainer}>
      <Animated.View
        style={[
          styles.centerEmoji,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View
          style={[styles.emojiBackground, { backgroundColor: color + "08" }]}
        >
          {svgEmoji}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  centerEmoji: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiBackground: {
    width: 50,
    height: 50,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
});
