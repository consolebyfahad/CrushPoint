import { color, font } from "@/utils/constants";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import CustomButton from "./custom_button";

interface AccessLocationProps {
  visible: boolean;
  onAllow: () => void;
}

export default function AccessLocation({
  visible,
  onAllow,
}: AccessLocationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Location Icon with Background */}
          <View style={styles.iconContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={48}
              color={color.white}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enable Location</Text>

          {/* Description */}
          <Text style={styles.description}>
            We need your location to show you people nearby and help you make
            meaningful connections in your area.
          </Text>

          {/* Allow Button */}
          <CustomButton title="Allow" onPress={onAllow} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(253, 253, 253, 0.8)",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray700,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
});
