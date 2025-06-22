import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const handleBack = () => {
    router.back();
  };

  const toggleNotification = (key: string) => {
    setNotificationSettings((prev) => ({
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
        trackColor={{ false: "#E5E7EB", true: color.primary }}
        thumbColor={item.enabled ? "#FFFFFF" : "#FFFFFF"}
        ios_backgroundColor="#E5E7EB"
        style={styles.switch}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notificationOptions.map(renderNotificationItem)}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    lineHeight: 18,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  bottomSpacing: {
    height: 20,
  },
});
