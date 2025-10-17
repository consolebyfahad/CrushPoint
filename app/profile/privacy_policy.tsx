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

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const handleBack = () => {
    router.back();
  };

  const sections = [
    {
      title: t("privacy.sections.collect.title"),
      icon: "information-circle",
      content: t("privacy.sections.collect.content"),
    },
    {
      title: t("privacy.sections.use.title"),
      icon: "settings",
      content: t("privacy.sections.use.content"),
    },
    {
      title: t("privacy.sections.location.title"),
      icon: "location",
      content: t("privacy.sections.location.content"),
    },
    {
      title: t("privacy.sections.photos.title"),
      icon: "camera",
      content: t("privacy.sections.photos.content"),
    },
    {
      title: t("privacy.sections.sharing.title"),
      icon: "share",
      content: t("privacy.sections.sharing.content"),
    },
    {
      title: t("privacy.sections.security.title"),
      icon: "shield-checkmark",
      content: t("privacy.sections.security.content"),
    },
    {
      title: t("privacy.sections.rights.title"),
      icon: "person",
      content: t("privacy.sections.rights.content"),
    },
    {
      title: t("privacy.sections.retention.title"),
      icon: "time",
      content: t("privacy.sections.retention.content"),
    },
    {
      title: t("privacy.sections.children.title"),
      icon: "people",
      content: t("privacy.sections.children.content"),
    },
    {
      title: t("privacy.sections.changes.title"),
      icon: "refresh",
      content: t("privacy.sections.changes.content"),
    },
  ];

  const dataTypes = [
    {
      type: t("privacy.dataTypes.profile.type"),
      examples: t("privacy.dataTypes.profile.examples"),
    },
    {
      type: t("privacy.dataTypes.location.type"),
      examples: t("privacy.dataTypes.location.examples"),
    },
    {
      type: t("privacy.dataTypes.usage.type"),
      examples: t("privacy.dataTypes.usage.examples"),
    },
    {
      type: t("privacy.dataTypes.device.type"),
      examples: t("privacy.dataTypes.device.examples"),
    },
    {
      type: t("privacy.dataTypes.contact.type"),
      examples: t("privacy.dataTypes.contact.examples"),
    },
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
        <Text style={styles.title}>{t("privacy.title")}</Text>
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
            <Text style={styles.introTitle}>{t("privacy.intro.title")}</Text>
          </View>
          <Text style={styles.lastUpdated}>{t("privacy.lastUpdated")}</Text>
          <Text style={styles.introText}>{t("privacy.intro.content")}</Text>
        </View>

        {/* Data We Collect */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionMainTitle}>
            {t("privacy.dataCollect.title")}
          </Text>
          <View style={styles.dataTypesContainer}>
            {dataTypes.map((dataType, index) =>
              renderDataType(dataType, index)
            )}
          </View>
        </View>

        {/* Privacy Sections */}
        <View style={styles.privacyContainer}>
          <Text style={styles.sectionMainTitle}>
            {t("privacy.protection.title")}
          </Text>
          {sections.map((section, index) => renderSection(section, index))}
        </View>

        {/* Key Principles */}
        <View style={styles.principlesSection}>
          <Text style={styles.sectionMainTitle}>
            {t("privacy.principles.title")}
          </Text>
          <View style={styles.principlesContainer}>
            <View style={styles.principleItem}>
              <Ionicons name="lock-closed" size={20} color={color.primary} />
              <Text style={styles.principleText}>
                {t("privacy.principles.noSell")}
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="eye-off" size={20} color={color.primary} />
              <Text style={styles.principleText}>
                {t("privacy.principles.control")}
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="trash" size={20} color={color.primary} />
              <Text style={styles.principleText}>
                {t("privacy.principles.delete")}
              </Text>
            </View>
            <View style={styles.principleItem}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={color.primary}
              />
              <Text style={styles.principleText}>
                {t("privacy.principles.security")}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={color.primary} />
            <Text style={styles.contactTitle}>
              {t("privacy.contact.title")}
            </Text>
          </View>
          <Text style={styles.contactText}>{t("privacy.contact.content")}</Text>
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
