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

export default function CommunityGuidelines() {
  const handleBack = () => {
    router.back();
  };

  const guidelines = [
    {
      title: "Be Respectful",
      content:
        "Treat everyone with kindness and respect. We're all here to make meaningful connections, so please be courteous in your interactions.",
    },
    {
      title: "Authentic Profiles",
      content:
        "Use real photos of yourself and accurate information. Catfishing or misleading profiles are not allowed and will result in account suspension.",
    },
    {
      title: "Safe Interactions",
      content:
        "Meet in public places for your first few dates. Always prioritize your safety and trust your instincts when meeting someone new.",
    },
    {
      title: "No Harassment",
      content:
        "Harassment, bullying, or any form of abuse will not be tolerated. This includes unwanted messages, inappropriate comments, or persistent contact after someone has expressed disinterest.",
    },
    {
      title: "Respect Privacy",
      content:
        "Don't share personal information about others without their consent. Respect boundaries and privacy settings.",
    },
    {
      title: "No Spam or Scams",
      content:
        "Don't use Andra for commercial purposes, spam, or fraudulent activities. This includes promoting other services, selling products, or soliciting money.",
    },
    {
      title: "Age Verification",
      content:
        "You must be at least 18 years old to use Andra. Providing false age information will result in immediate account termination.",
    },
    {
      title: "Report Inappropriate Behavior",
      content:
        "If you encounter someone who violates these guidelines, please report them immediately. We take all reports seriously and will investigate promptly.",
    },
    {
      title: "Content Guidelines",
      content:
        "Keep your photos and messages appropriate. Explicit content, violence, or offensive material is prohibited and will result in content removal and potential account suspension.",
    },
    {
      title: "Location Respect",
      content:
        "Respect others' private spots and location preferences. Don't share someone's location without permission or show up uninvited to their private spaces.",
    },
  ];

  const safetyTips = [
    "Always meet in public places for first dates",
    "Tell a friend or family member about your plans",
    "Don't share personal financial information",
    "Trust your instincts - if something feels wrong, it probably is",
    "Use the in-app messaging system initially",
    "Don't feel pressured to share personal details too quickly",
  ];

  const renderGuidelineItem = (item: any, index: number) => (
    <View key={index} style={styles.guidelineItem}>
      <View style={styles.guidelineHeader}>
        <View style={styles.guidelineNumber}>
          <Text style={styles.guidelineNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.guidelineTitle}>{item.title}</Text>
      </View>
      <Text style={styles.guidelineContent}>{item.content}</Text>
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
        <Text style={styles.title}>Community Guidelines</Text>
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
            <Ionicons name="heart" size={32} color={color.primary} />
            <Text style={styles.introTitle}>Welcome to Andra</Text>
          </View>
          <Text style={styles.introText}>
            Andra is designed to help you make meaningful connections with
            people nearby. To ensure a safe and enjoyable experience for
            everyone, we've established these community guidelines.
          </Text>
        </View>

        {/* Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Guidelines</Text>
          {guidelines.map((guideline, index) =>
            renderGuidelineItem(guideline, index)
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyTipsContainer}>
            {safetyTips.map((tip, index) => (
              <View key={index} style={styles.safetyTipItem}>
                <View style={styles.safetyTipBullet}>
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={color.primary}
                  />
                </View>
                <Text style={styles.safetyTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={color.primary} />
            <Text style={styles.contactTitle}>Need Help?</Text>
          </View>
          <Text style={styles.contactText}>
            If you have any questions about these guidelines or need to report a
            violation, please contact our support team through the app settings.
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
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.primary,
    marginLeft: 12,
  },
  introText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 16,
  },
  guidelineItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  guidelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  guidelineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guidelineNumberText: {
    fontSize: 14,
    fontFamily: font.bold,
    color: color.white,
  },
  guidelineTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
  },
  guidelineContent: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
    marginLeft: 40,
  },
  safetyTipsContainer: {
    backgroundColor: color.gray95,
    borderRadius: 12,
    padding: 16,
  },
  safetyTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  safetyTipBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  safetyTipText: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
    flex: 1,
  },
  contactSection: {
    backgroundColor: color.primary + "08",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
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
