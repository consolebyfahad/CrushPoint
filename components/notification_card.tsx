import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
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
          library: "Ionicons",
          name: "chatbubble-outline",
          color: "#49adbe",
          backgroundColor: "#dbeff2",
        };
      case "match":
        return {
          library: "Ionicons",
          name: "heart-outline",
          color: "#e04134",
          backgroundColor: "#f9d9d6",
        };
      case "profile_view":
        return {
          library: "Feather",
          name: "user",
          color: "#A78BFA",
          backgroundColor: "#F3F4F6",
        };
      case "event":
        return {
          library: "Feather",
          name: "calendar",
          color: "#40AF53",
          backgroundColor: "#d9efdd",
        };
      default:
        return {
          library: "Ionicons",
          name: "notifications",
          color: "#40AF53",
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
        {iconConfig.library === "Feather" ? (
          <Feather name={iconConfig.name} size={20} color={iconConfig.color} />
        ) : (
          <Ionicons
            name={iconConfig.name as any}
            size={20}
            color={iconConfig.color}
          />
        )}
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
        <Feather name="trash-2" size={18} color={color.gray200} />
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
    shadowColor: color.gray300,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(230, 230, 230, 0.40)",
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
    color: color.gray300,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray200,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
});
