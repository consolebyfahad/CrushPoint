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

export default function TermsOfService() {
  const { t } = useTranslation();
  const handleBack = () => {
    router.back();
  };

  const sections = [
    {
      title: t("terms.sections.acceptance.title"),
      content: t("terms.sections.acceptance.content"),
    },
    {
      title: t("terms.sections.description.title"),
      content: t("terms.sections.description.content"),
    },
    {
      title: t("terms.sections.eligibility.title"),
      content: t("terms.sections.eligibility.content"),
    },
    {
      title: t("terms.sections.accounts.title"),
      content: t("terms.sections.accounts.content"),
    },
    {
      title: t("terms.sections.conduct.title"),
      content: t("terms.sections.conduct.content"),
    },
    {
      title: t("terms.sections.privacy.title"),
      content: t("terms.sections.privacy.content"),
    },
    {
      title: t("terms.sections.location.title"),
      content: t("terms.sections.location.content"),
    },
    {
      title: t("terms.sections.intellectual.title"),
      content: t("terms.sections.intellectual.content"),
    },
    {
      title: t("terms.sections.prohibitedContent.title"),
      content: t("terms.sections.prohibitedContent.content"),
    },
    {
      title: t("terms.sections.safety.title"),
      content: t("terms.sections.safety.content"),
    },
    {
      title: t("terms.sections.thirdParty.title"),
      content: t("terms.sections.thirdParty.content"),
    },
    {
      title: t("terms.sections.disclaimers.title"),
      content: t("terms.sections.disclaimers.content"),
    },
    {
      title: t("terms.sections.termination.title"),
      content: t("terms.sections.termination.content"),
    },
    {
      title: t("terms.sections.modifications.title"),
      content: t("terms.sections.modifications.content"),
    },
    {
      title: t("terms.sections.governing.title"),
      content: t("terms.sections.governing.content"),
    },
    {
      title: t("terms.sections.contact.title"),
      content: t("terms.sections.contact.content"),
    },
  ];

  const renderSection = (section: any, index: number) => (
    <View key={index} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
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
        <Text style={styles.title}>{t("terms.title")}</Text>
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
            <Ionicons name="document-text" size={32} color={color.primary} />
            <Text style={styles.introTitle}>{t("terms.title")}</Text>
          </View>
          <Text style={styles.lastUpdated}>{t("terms.lastUpdated")}</Text>
          <Text style={styles.introText}>{t("terms.intro")}</Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          {sections.map((section, index) => renderSection(section, index))}
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={color.primary}
            />
            <Text style={styles.noticeTitle}>{t("terms.notice.title")}</Text>
          </View>
          <Text style={styles.noticeText}>{t("terms.notice.content")}</Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={color.primary} />
            <Text style={styles.contactTitle}>{t("terms.contact.title")}</Text>
          </View>
          <Text style={styles.contactText}>{t("terms.contact.content")}</Text>
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
  termsContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
  },
  noticeSection: {
    backgroundColor: color.primary + "08",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.primary,
    marginLeft: 12,
  },
  noticeText: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
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
