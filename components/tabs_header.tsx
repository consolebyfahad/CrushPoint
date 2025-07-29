// TabsHeader for Events
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EventsTabsHeader({ title, events }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.eventCount}>{events.length} Events</Text>
      </View>
    </View>
  );
}

// TabsHeader for Notifications
export function NotificationsTabsHeader({ title, notifications, close }: any) {
  const unreadCount = notifications.filter(
    (notif: any) => !notif.isRead
  ).length;

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {close ? (
          <Ionicons
            name="close"
            size={24}
            color={color.black}
            onPress={close}
          />
        ) : (
          <Text style={styles.eventCount}>
            {unreadCount > 0
              ? `${unreadCount} Unread`
              : `${notifications.length} Total`}
          </Text>
        )}
      </View>
    </View>
  );
}

// TabsHeader for Matches
export function MatchesTabsHeader({ title, matches }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.eventCount}>{matches.length} Matches</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: color.white,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontFamily: font.bold,
    color: color.black,
  },
  eventCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
  },
});
