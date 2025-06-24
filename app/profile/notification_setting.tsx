import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettings({ navigation }: any) {
  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    emojiReceived: true,
    nearbyMatches: true,
    nearbyUsers: false,
    profileVisits: false,
    newEventPosted: false,
    eventInvitationAccepted: false,
    eventReminder: true,
    offersPromotions: false,
  });

  const toggleNotification = (key: any) => {
    setNotificationSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationOptions = [
    {
      key: "newMatches",
      title: "New Matches",
      description: "When you get a new match",
      enabled: notificationSettings.newMatches,
    },
    {
      key: "emojiReceived",
      title: "Emoji Received",
      description: "When someone sends you an emoji",
      enabled: notificationSettings.emojiReceived,
    },
    {
      key: "nearbyMatches",
      title: "Nearby Matches",
      description: "When your matches are nearby",
      enabled: notificationSettings.nearbyMatches,
    },
    {
      key: "nearbyUsers",
      title: "Nearby Users",
      description: "When new users are in your area",
      enabled: notificationSettings.nearbyUsers,
    },
    {
      key: "profileVisits",
      title: "Profile Visits",
      description: "When someone views your profile",
      enabled: notificationSettings.profileVisits,
    },
    {
      key: "newEventPosted",
      title: "New Event Posted",
      description: "When a new event is posted in your area",
      enabled: notificationSettings.newEventPosted,
    },
    {
      key: "eventInvitationAccepted",
      title: "Event Invitation Accepted",
      description: "When someone accepts event invitation",
      enabled: notificationSettings.eventInvitationAccepted,
    },
    {
      key: "eventReminder",
      title: "Event Reminder",
      description: "Reminders for upcoming events",
      enabled: notificationSettings.eventReminder,
    },
    {
      key: "offersPromotions",
      title: "Offers & Promotions",
      description: "Special offers and promotions",
      enabled: notificationSettings.offersPromotions,
    },
  ];

  const renderNotificationItem = (item: any) => (
    <View key={item.key} style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>

      <Switch
        value={item.enabled}
        onValueChange={() => toggleNotification(item.key)}
        trackColor={{ false: "#DFDFDF", true: color.primary }}
        thumbColor={item.enabled ? "#FFFFFF" : "#FFFFFF"}
        ios_backgroundColor="#DFDFDF"
        style={styles.switch}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={"Notifications"} divider={true} />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notificationOptions.map(renderNotificationItem)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 18,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
    lineHeight: 18,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
