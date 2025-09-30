import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const handleBack = () => {
    router.back();
  };

  const sections = [
    {
      title: "Information We Collect",
      icon: "information-circle",
      content: "We collect information you provide directly (profile details, photos, interests), automatically (location, device info, app usage), and from third parties (social media when you sign in with Google/Apple).",
    },
    {
      title: "How We Use Your Information",
      icon: "settings",
      content: "Your information helps us show you relevant matches, improve our services, send important updates, ensure safety, and provide customer support. We never sell your personal data to third parties.",
    },
    {
      title: "Location Data",
      icon: "location",
      content: "We use your location to show nearby users and events. You can control location sharing in your device settings. Location data is encrypted and stored securely on our servers.",
    },
    {
      title: "Photo and Profile Information",
      icon: "camera",
      content: "Your photos and profile details are used to create your profile and show you to potential matches. You can edit or delete your information anytime in your profile settings.",
    },
    {
      title: "Data Sharing",
      icon: "share",
      content: "We only share your information with other users as intended by our app features (showing profiles to matches). We may share data with service providers who help us operate the app, but they're bound by strict confidentiality agreements.",
    },
    {
      title: "Data Security",
      icon: "shield-checkmark",
      content: "We use industry-standard encryption to protect your data. All information is stored on secure servers with restricted access. We regularly update our security measures to keep your data safe.",
    },
    {
      title: "Your Rights",
      icon: "person",
      content: "You can access, update, or delete your account anytime. You can opt out of certain data collection, control who sees your profile, and request a copy of your data. Contact us for assistance.",
    },
    {
      title: "Data Retention",
      icon: "time",
      content: "We keep your data only as long as needed to provide our services. When you delete your account, we remove your personal information within 30 days, though some data may be retained for legal compliance.",
    },
    {
      title: "Children's Privacy",
      icon: "people",
      content: "CrushPoint is not intended for users under 18. We do not knowingly collect information from minors. If we discover a minor has provided us with information, we will delete it immediately.",
    },
    {
      title: "Changes to This Policy",
      icon: "refresh",
      content: "We may update this Privacy Policy occasionally. We'll notify you of significant changes through the app or email. Continued use of the app after changes means you accept the updated policy.",
    },
  ];

  const dataTypes = [
    { type: "Profile Information", examples: "Name, age, photos, interests, preferences" },
    { type: "Location Data", examples: "GPS coordinates, nearby places, location history" },
    { type: "Usage Information", examples: "App interactions, matches, messages, events attended" },
    { type: "Device Information", examples: "Device type, operating system, app version" },
    { type: "Contact Information", examples: "Email, phone number (for verification only)" },
  ];

  const renderSection = (section: any, index: number) => (
    <View key={index} style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name={section.icon as any} size={20} color={color.primary} />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  const renderDataType = (dataType: any, index: number) => (
    <View key={index} style={styles.dataTypeItem}>
      <Text style={styles.dataTypeTitle}>{dataType.type}</Text>
      <Text style={styles.dataTypeExamples}>{dataType.examples}</Text>
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
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Ionicons name="shield" size={32} color={color.primary} />
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
          </View>
          <Text style={styles.lastUpdated}>
            Last updated: December 2023
          </Text>
          <Text style={styles.introText}>
            We're committed to protecting your privacy and being transparent about 
            how we collect, use, and share your information on CrushPoint.
          </Text>
        </View>

        {/* Data We Collect */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionMainTitle}>What Information We Collect</Text>
          <View style={styles.dataTypesContainer}>
            {dataTypes.map((dataType, index) => renderDataType(dataType, index))}
          </View>
        </View>

        {/* Privacy Sections */}
        <View style={styles.privacyContainer}>
          <Text style={styles.sectionMainTitle}>How We Protect Your Privacy</Text>
          {sections.map((section, index) => renderSection(section, index))}
        </View>

        {/* Key Principles */}
        <View style={styles.principlesSection}>
          <Text style={styles.sectionMainTitle}>Our Privacy Principles</Text>
          <View style={styles.principlesContainer}>
            <View style={styles.principleItem}>
              <Ionicons name="lock-closed" size={20} color={color.primary} />
              <Text style={styles.principleText}>We never sell your personal data</Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="eye-off" size={20} color={color.primary} />
              <Text style={styles.principleText}>You control who sees your information</Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="trash" size={20} color={color.primary} />
              <Text style={styles.principleText}>You can delete your data anytime</Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="shield-checkmark" size={20} color={color.primary} />
              <Text style={styles.principleText}>We use industry-standard security</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={color.primary} />
            <Text style={styles.contactTitle}>Questions About Privacy?</Text>
          </View>
          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy or want to exercise 
            your privacy rights, contact us through the app settings or reach out 
            to our support team.
          </Text>
        </View>

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
  },
  scrollContent: {
    padding: 16,
  },
  introSection: {
    backgroundColor: color.primary + "10",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: color.primary + "20",
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.primary,
    marginLeft: 12,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
    marginBottom: 12,
    marginLeft: 44,
  },
  introText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 24,
  },
  sectionMainTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 16,
  },
  dataSection: {
    marginBottom: 24,
  },
  dataTypesContainer: {
    backgroundColor: color.gray95,
    borderRadius: 12,
    padding: 16,
  },
  dataTypeItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.gray87,
  },
  dataTypeTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  dataTypeExamples: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  privacyContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginLeft: 12,
    flex: 1,
  },
  sectionContent: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
    marginLeft: 32,
  },
  principlesSection: {
    marginBottom: 24,
  },
  principlesContainer: {
    backgroundColor: color.primary + "08",
    borderRadius: 12,
    padding: 16,
  },
  principleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  principleText: {
    fontSize: 15,
    fontFamily: font.medium,
    color: color.gray14,
    marginLeft: 12,
    flex: 1,
  },
  contactSection: {
    backgroundColor: color.gray95,
    borderRadius: 16,
    padding: 20,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.primary,
    marginLeft: 12,
  },
  contactText: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});
