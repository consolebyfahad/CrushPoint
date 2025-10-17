import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityGuidelines() {
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const guidelines = [
    {
      title: t("communityGuidelines.guidelines.respectful.title"),
      content: t("communityGuidelines.guidelines.respectful.description"),
    },
    {
      title: t("communityGuidelines.guidelines.authentic.title"),
      content: t("communityGuidelines.guidelines.authentic.description"),
    },
    {
      title: t("communityGuidelines.guidelines.safety.title"),
      content: t("communityGuidelines.guidelines.safety.description"),
    },
    {
      title: t("communityGuidelines.guidelines.appropriate.title"),
      content: t("communityGuidelines.guidelines.appropriate.description"),
    },
    {
      title: t("communityGuidelines.guidelines.privacy.title"),
      content: t("communityGuidelines.guidelines.privacy.description"),
    },
    {
      title: t("communityGuidelines.guidelines.reporting.title"),
      content: t("communityGuidelines.guidelines.reporting.description"),
    },
  ];

  const safetyTips = t("communityGuidelines.safetyTipsList", {
    returnObjects: true,
  }) as string[];

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
        <Text style={styles.title}>{t("communityGuidelines.title")}</Text>
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
            <Text style={styles.introTitle}>
              {t("communityGuidelines.welcomeTitle")}
            </Text>
          </View>
          <Text style={styles.introText}>
            {t("communityGuidelines.welcomeDescription")}
          </Text>
        </View>

        {/* Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("communityGuidelines.title")}
          </Text>
          {guidelines.map((guideline, index) =>
            renderGuidelineItem(guideline, index)
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("communityGuidelines.safetyTips")}
          </Text>
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
            <Text style={styles.contactTitle}>
              {t("communityGuidelines.needHelp")}
            </Text>
          </View>
          <Text style={styles.contactText}>
            {t("communityGuidelines.helpDescription")}
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
