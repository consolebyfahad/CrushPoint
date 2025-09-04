import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const FloatingBubbleAnimation = ({
  visible,
  svgEmoji,
  onComplete,
}: any) => {
  const bubbles = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      floatAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0),
      opacityAnim: new Animated.Value(0),
      horizontalOffset: (Math.random() - 0.5) * 100,
      delay: i * 200,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all bubble animations
      bubbles.forEach((bubble) => {
        bubble.floatAnim.setValue(0);
        bubble.scaleAnim.setValue(0);
        bubble.opacityAnim.setValue(1);
      });

      // Start staggered bubble animations
      const bubbleAnimations = bubbles.map((bubble, index) => {
        return Animated.sequence([
          Animated.delay(bubble.delay),
          Animated.parallel([
            Animated.timing(bubble.floatAnim, {
              toValue: -250 - Math.random() * 500,
              duration: 2000 + Math.random() * 500,
              useNativeDriver: true,
            }),
            // Scale animation
            Animated.sequence([
              Animated.timing(bubble.scaleAnim, {
                toValue: 1.2 + Math.random() * 0.8,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(bubble.scaleAnim, {
                toValue: 0.8 + Math.random() * 0.2,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
            // Fade out
            Animated.timing(bubble.opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      // Start all animations
      Animated.parallel(bubbleAnimations).start(() => {
        onComplete?.();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.floatingContainer}>
      {bubbles.map((bubble, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingBubble,
            {
              transform: [
                { translateY: bubble.floatAnim },
                { translateX: bubble.horizontalOffset },
                { scale: bubble.scaleAnim },
              ],
              opacity: bubble.opacityAnim,
            },
          ]}
        >
          {svgEmoji}
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.45,
    left: SCREEN_WIDTH * 0.5 - 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  floatingBubble: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
