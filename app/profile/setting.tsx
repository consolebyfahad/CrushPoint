import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { logout } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const userProfile = params.userProfile
    ? JSON.parse(params.userProfile as string)
    : null;
  const handleBack = () => {
    router.back();
  };

  const handleLogOut = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          const success = await logout();
          if (success) {
            router.replace("/welcome");
          } else {
            showToast("Error logging out. Please try again.", "error");
          }
        },
      },
    ]);
  };

  const handleEditPrivateSpot = () => {
    router.push({
      pathname: "./private_spots",
      params: {
        fromEdit: "true",
      },
    });
  };

  const handleAccountSettings = () => {
    router.push("/profile/account_setting");
  };

  const handleNotificationSettings = () => {
    router.push({
      pathname: "/profile/notification_setting",
      params: {
        userProfile: JSON.stringify(userProfile),
      },
    });
  };

  const handleVerificationStatus = () => {
    router.push({
      pathname: "/profile/verification_status",
      params: {
        userProfile: JSON.stringify(userProfile),
      },
    });
  };

  // Settings sections data
  const visibilitySettings = [
    {
      id: "private_spot",
      title: "Edit Private Spot",
      icon: "location-outline",
      hasChevron: true,
      onPress: handleEditPrivateSpot,
    },
  ];

  const accountSettings = [
    {
      id: "account_settings",
      title: "Account Settings",
      icon: "person-outline",
      hasChevron: true,
      onPress: handleAccountSettings,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications-outline",
      hasChevron: true,
      onPress: handleNotificationSettings,
    },
    {
      id: "verification",
      title: "Verification Status",
      icon: "shield-checkmark-outline",
      hasChevron: true,
      onPress: handleVerificationStatus,
    },
    {
      id: "blocked_users",
      title: "Blocked Users",
      icon: "ban-outline",
      hasChevron: true,
      onPress: () => {
        router.push("/profile/blocked_user");
      },
    },
  ];

  const connectSettings = [
    {
      id: "invite_friend",
      title: "Invite a friend",
      subtitle: "Last updated: 2023-12-01",
      icon: "gift-outline",
      hasChevron: true,
      onPress: () => console.log("Invite a friend"),
    },
    {
      id: "review",
      title: "Give us a review",
      subtitle: "Rate us on app store",
      icon: "star-outline",
      hasExternal: true,
      onPress: () => console.log("Give us a review"),
    },
    {
      id: "community",
      title: "Community Guidelines",
      subtitle: "Last updated: 2023-12-01",
      icon: "people-outline",
      hasExternal: true,
      onPress: () => console.log("Community Guidelines"),
    },
  ];

  const otherSettings = [
    {
      id: "terms",
      title: "Terms of Service",
      icon: "document-text-outline",
      hasExternal: true,
      onPress: () => console.log("Terms of Service"),
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: "shield-outline",
      hasExternal: true,
      onPress: () => console.log("Privacy Policy"),
    },
    {
      id: "support",
      title: "Contact Support",
      icon: "help-circle-outline",
      hasChevron: true,
      onPress: () => {
        router.push("/profile/contact_support");
      },
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={color.primary}
          style={styles.settingIcon}
        />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      {item.hasChevron && (
        <Ionicons name="chevron-forward" size={20} color={color.gray14} />
      )}
      {item.hasExternal && (
        <Ionicons name="open-outline" size={20} color={color.gray14} />
      )}
    </TouchableOpacity>
  );

  const renderSection = (title?: string, items?: any[]) => (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {title && <View style={styles.separator} />}
      <View>
        {items?.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
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
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visibility Section */}
        {renderSection("Visibility", visibilitySettings)}

        {/* Account Section */}
        {renderSection("Account", accountSettings)}

        {/* Connect Section */}
        {renderSection("Connect", connectSettings)}
        {renderSection(undefined, otherSettings)}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Log Out Button */}
      <View style={styles.logoutContainer}>
        <CustomButton
          title="Log Out"
          style={{ backgroundColor: color.gray94 }}
          fontstyle={{ color: color.black }}
          onPress={handleLogOut}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray87,
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
    padding: 16,
  },
  section: {
    marginBottom: 14,
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray14,
    padding: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: color.gray94,
  },
  bottomSpacing: {
    height: 20,
  },
  logoutContainer: {
    padding: 16,
  },
});
