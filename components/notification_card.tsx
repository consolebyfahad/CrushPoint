import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationCard({
  notification,
  onPress,
  onDelete,
}: any) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reaction":
        return {
          name: "chatbubble",
          color: "#60A5FA",
          backgroundColor: "#EFF6FF",
        };
      case "match":
        return { name: "heart", color: "#F87171", backgroundColor: "#FEF2F2" };
      case "profile_view":
        return { name: "person", color: "#A78BFA", backgroundColor: "#F3F4F6" };
      case "event":
        return {
          name: "calendar",
          color: "#34D399",
          backgroundColor: "#ECFDF5",
        };
      default:
        return {
          name: "notifications",
          color: "#6B7280",
          backgroundColor: "#F9FAFB",
        };
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    } else {
      console.log("Notification pressed:", notification.title);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification);
    } else {
      console.log("Delete notification:", notification.title);
    }
  };

  const iconConfig = getNotificationIcon(notification.type);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconConfig.backgroundColor },
        ]}
      >
        <Ionicons
          name={iconConfig.name as any}
          size={20}
          color={iconConfig.color}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={18} color={color.gray400} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray400,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
});
