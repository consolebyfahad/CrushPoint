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

  const NOTIFICATION_KEYS = [
    "event_invite",
    "event_invite_accepted",
    "event_reminder",
    "nearby_users",
    "new_event",
    "new_match",
    "new_message",
    "profile_like",
    "profile_visit",
  ] as const;

  const defaultSettings = NOTIFICATION_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<(typeof NOTIFICATION_KEYS)[number], boolean>,
  );
  const [notificationSettings, setNotificationSettings] =
    useState<Record<(typeof NOTIFICATION_KEYS)[number], boolean>>(
      defaultSettings,
    );

  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing notification settings when component mounts
  useEffect(() => {
    if (userData?.notification_settings) {
      try {
        const settings =
          typeof userData.notification_settings === "string"
            ? JSON.parse(userData.notification_settings)
            : userData.notification_settings;

        if (Array.isArray(settings)) {
          const settingsObj = { ...defaultSettings };
          settings.forEach((setting: { key?: string; enabled?: boolean }) => {
            if (setting.key && typeof setting.enabled === "boolean") {
              const key = setting.key as (typeof NOTIFICATION_KEYS)[number];
              if (NOTIFICATION_KEYS.includes(key)) {
                settingsObj[key] = setting.enabled;
              }
            }
          });
          setNotificationSettings(settingsObj);
        } else if (typeof settings === "object") {
          const merged = { ...defaultSettings };
          NOTIFICATION_KEYS.forEach((key) => {
            if (settings[key] !== undefined) merged[key] = !!settings[key];
          });
          setNotificationSettings(merged);
        }
      } catch (error) {}
    }
  }, [userData?.notification_settings]);

  const toggleNotification = (key: (typeof NOTIFICATION_KEYS)[number]) => {
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
      // Convert to array format for API (keys match backend: event_invite, new_match, etc.)
      const notificationArray = NOTIFICATION_KEYS.map((key) => ({
        key,
        enabled: notificationSettings[key],
        title: t(`common.${key}`),
        description: t(`common.${key}Desc`),
      }));

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append(
        "notification_settings",
        JSON.stringify(notificationArray),
      );
      console.log("formData", formData);
      const response = await apiCall(formData);
      console.log("response", response);

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
          response.message || t("common.failedToUpdateNotifications"),
        );
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.failedToUpdateNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = NOTIFICATION_KEYS.map((key) => ({
    key,
    title: t(`common.${key}`),
    description: t(`common.${key}Desc`),
    enabled: notificationSettings[key],
  }));

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
      <Header title={t("common.notifications")} divider={true} />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notificationOptions.map(renderNotificationItem)}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={isLoading ? t("common.saving") : t("common.saveChanges")}
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
