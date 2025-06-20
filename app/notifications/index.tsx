import NotificationCard from "@/components/notification_card";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications({ navigation }: any) {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "reaction",
      title: "New Reaction",
      message: "Emily sent you a reaction",
      timeAgo: "about 2 hours ago",
      isRead: false,
    },
    {
      id: "2",
      type: "match",
      title: "New Match!",
      message: "It's a match with David!",
      timeAgo: "1 day ago",
      isRead: false,
    },
    {
      id: "3",
      type: "profile_view",
      title: "Profile View",
      message: "Anna viewed your profile",
      timeAgo: "3 days ago",
      isRead: true,
    },
    {
      id: "4",
      type: "event",
      title: "Event Reminder",
      message: "Don't miss 'Sunset Meetup' today at 5:00 PM",
      timeAgo: "about 4 hours ago",
      isRead: true,
    },
  ]);

  const handleClose = () => {
    router.push("/(tabs)");
  };

  const handleNotificationPress = (notification: any) => {
    console.log("Notification pressed:", notification);
    // Mark as read and navigate based on type
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif
      )
    );

    // Navigate based on notification type
    switch (notification.type) {
      case "reaction":
        console.log("Navigate to reactions");
        break;
      case "match":
        console.log("Navigate to matches");
        break;
      case "profile_view":
        console.log("Navigate to profile views");
        break;
      case "event":
        console.log("Navigate to events");
        break;
    }
  };

  const handleDeleteNotification = (notification: any) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== notification.id)
    );
  };

  const renderNotificationCard = ({ item }: any) => (
    <NotificationCard
      notification={item}
      onPress={handleNotificationPress}
      onDelete={handleDeleteNotification}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="notifications-off-outline"
          size={64}
          color={color.gray400}
        />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyText}>
        {"You'll see your notifications here when they arrive"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray400,
    textAlign: "center",
    lineHeight: 24,
  },
});
