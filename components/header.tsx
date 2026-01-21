import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface header {
  onPress?: () => void;
  title?: any;
  closeButton?: any;
  divider?: any;
  userImage?: string;
  onImagePress?: () => void;
}

const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
  }
};

export default function Header({
  onPress,
  title,
  closeButton,
  divider,
  userImage,
  onImagePress,
}: header) {
  return (
    <View
      style={[
        styles.header,
        divider && { borderBottomWidth: 1, borderColor: color.gray94 },
      ]}
    >
      <TouchableOpacity onPress={onPress || handleBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>

      <View
        style={[
          styles.titleContainer,
          closeButton ? { alignItems: "center" } : { marginLeft: 8 },
        ]}
      >
        {userImage && onImagePress ? (
          <TouchableOpacity
            onPress={onImagePress}
            style={styles.titleWithImage}
            activeOpacity={0.7}
          >
            <Image source={{ uri: userImage }} style={styles.userImage} />
            {title && <Text style={styles.title}>{title}</Text>}
          </TouchableOpacity>
        ) : (
          title && <Text style={styles.title}>{title}</Text>
        )}
      </View>

      {closeButton && (
        <TouchableOpacity onPress={onPress} style={styles.close}>
          <MaterialCommunityIcons name="window-close" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithImage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.gray94,
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  close: {
    width: 24,
    height: 24,
    alignItems: "flex-end",
  },
});
