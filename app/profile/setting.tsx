import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings({ navigation }: any) {
  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Go back");
    }
  };

  const handleLogOut = () => {
    console.log("Log out");
    // Handle logout functionality
  };

  // Settings sections data
  const visibilitySettings = [
    {
      id: "private_spot",
      title: "Edit Private Spot",
      icon: "location-outline",
      hasChevron: true,
      onPress: () => console.log("Edit Private Spot"),
    },
  ];

  const accountSettings = [
    {
      id: "account_settings",
      title: "Account Settings",
      icon: "person-outline",
      hasChevron: true,
      onPress: () => {
        if (navigation) {
          navigation.navigate("AccountSettings");
        } else {
          console.log("Account Settings");
        }
      },
    },
    {
      id: "change_password",
      title: "Change Password",
      icon: "lock-closed-outline",
      hasChevron: true,
      onPress: () => console.log("Change Password"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications-outline",
      hasChevron: true,
      onPress: () => {
        if (navigation) {
          navigation.navigate("NotificationSettings");
        } else {
          console.log("Notifications");
        }
      },
    },
    {
      id: "verification",
      title: "Verification Status",
      icon: "shield-checkmark-outline",
      hasChevron: true,
      onPress: () => {
        if (navigation) {
          navigation.navigate("VerificationStatus");
        } else {
          console.log("Verification Status");
        }
      },
    },
    {
      id: "blocked_users",
      title: "Blocked Users",
      icon: "ban-outline",
      hasChevron: true,
      onPress: () => {
        if (navigation) {
          navigation.navigate("BlockedUsers");
        } else {
          console.log("Blocked Users");
        }
      },
    },
    {
      id: "app_language",
      title: "App Language",
      icon: "globe-outline",
      hasChevron: true,
      onPress: () => console.log("App Language"),
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
        if (navigation) {
          navigation.navigate("ContactSupport");
        } else {
          console.log("Contact Support");
        }
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
          color="#5FB3D4"
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
        <Ionicons name="chevron-forward" size={20} color={color.gray400} />
      )}
      {item.hasExternal && (
        <Ionicons name="open-outline" size={20} color={color.gray400} />
      )}
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
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

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Log Out Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: color.white,
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
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.gray400,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: color.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    fontFamily: font.medium,
    color: color.black,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 52, // Aligns with text after icon
  },
  bottomSpacing: {
    height: 100,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  logoutButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: "#EF4444",
  },
});
