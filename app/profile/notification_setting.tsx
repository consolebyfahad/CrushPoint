import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettings({ navigation }: any) {
  const { t } = useTranslation();
  const { user, userData, updateUserData } = useAppContext();

  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    newMeetup: true,
    meetupRespondReceived: true,
    emojiReceived: true,
    nearbyMatches: true,
    nearbyUsers: true,
    profileVisits: true,
    newEventPosted: true,
    eventInvitationAccepted: true,
    eventReminder: true,
    offersPromotions: true,
  });

  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing notification settings when component mounts
  useEffect(() => {
    if (userData?.notification_settings) {
      try {
        // If notification_settings is a string, parse it
        const settings =
          typeof userData.notification_settings === "string"
            ? JSON.parse(userData.notification_settings)
            : userData.notification_settings;

        // Convert array format back to object format
        if (Array.isArray(settings)) {
          const settingsObj = { ...notificationSettings };
          settings.forEach((setting) => {
            if (setting.key && typeof setting.enabled === "boolean") {
              settingsObj[setting.key as keyof typeof settingsObj] =
                setting.enabled;
            }
          });
          setNotificationSettings(settingsObj);
        } else if (typeof settings === "object") {
          // Direct object format
          setNotificationSettings((prev) => ({ ...prev, ...settings }));
        }
      } catch (error) {
        console.error("Error parsing notification settings:", error);
      }
    }
  }, [userData?.notification_settings]);

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setIsChanged(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("common.userSessionExpired"));
      return;
    }

    setIsLoading(true);
    try {
      // Convert notification settings object to array format for API
      const notificationArray = Object.entries(notificationSettings).map(
        ([key, enabled]) => ({
          key,
          enabled,
          title:
            notificationOptions.find((opt) => opt.key === key)?.title || key,
          description:
            notificationOptions.find((opt) => opt.key === key)?.description ||
            "",
        })
      );

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append(
        "notification_settings",
        JSON.stringify(notificationArray)
      );

      console.log("Updating notification settings:", notificationArray);

      const response = await apiCall(formData);

      if (response.result) {
        // Update context with new notification settings
        updateUserData({
          notification_settings: notificationArray,
        });

        setIsChanged(false);

        // Navigate back without success message
        if (navigation) {
          navigation.goBack();
        } else {
          router.back();
        }
      } else {
        throw new Error(
          response.message || t("common.failedToUpdateNotifications")
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert(t("common.error"), t("common.failedToUpdateNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: "newMatches",
      title: t("common.newMatches"),
      description: t("common.newMatchesDesc"),
      enabled: notificationSettings.newMatches,
    },
    {
      key: "newMeetup",
      title: t("common.meetupRequests"),
      description: t("common.meetupRequestsDesc"),
      enabled: notificationSettings.newMeetup,
    },
    {
      key: "meetupRespondReceived",
      title: t("common.meetupRespondReceived"),
      description: t("common.meetupRespondReceivedDesc"),
      enabled: notificationSettings.meetupRespondReceived,
    },
    {
      key: "emojiReceived",
      title: t("common.emojiReceived"),
      description: t("common.emojiReceivedDesc"),
      enabled: notificationSettings.emojiReceived,
    },
    {
      key: "nearbyMatches",
      title: t("common.nearbyMatches"),
      description: t("common.nearbyMatchesDesc"),
      enabled: notificationSettings.nearbyMatches,
    },
    {
      key: "nearbyUsers",
      title: t("common.nearbyUsers"),
      description: t("common.nearbyUsersDesc"),
      enabled: notificationSettings.nearbyUsers,
    },
    {
      key: "profileVisits",
      title: t("common.profileVisits"),
      description: t("common.profileVisitsDesc"),
      enabled: notificationSettings.profileVisits,
    },
    {
      key: "newEventPosted",
      title: t("common.newEventPosted"),
      description: t("common.newEventPostedDesc"),
      enabled: notificationSettings.newEventPosted,
    },
    {
      key: "eventInvitationAccepted",
      title: t("common.eventInvitationAccepted"),
      description: t("common.eventInvitationAcceptedDesc"),
      enabled: notificationSettings.eventInvitationAccepted,
    },
    {
      key: "eventReminder",
      title: t("common.eventReminder"),
      description: t("common.eventReminderDesc"),
      enabled: notificationSettings.eventReminder,
    },
    {
      key: "offersPromotions",
      title: t("common.offersPromotions"),
      description: t("common.offersPromotionsDesc"),
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
        // ios_backgroundColor="#DFDFDF"
        // style={[styles.switch]}
        disabled={isLoading}
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

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={isLoading ? "Saving..." : "Save Changes"}
          onPress={handleSaveChanges}
          isDisabled={!isChanged || isLoading}
          isLoading={isLoading}
        />
      </View>
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
  bottomSpacing: {
    height: 100,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray87,
  },
});
