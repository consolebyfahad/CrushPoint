import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
interface header {
  onPress?: () => void;
}

const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
  }
};

export default function Header({ onPress }: header) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 24,
    height: 24,
  },
});
