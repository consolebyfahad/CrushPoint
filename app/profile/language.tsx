import { color, font } from "@/utils/constants";
import { saveLanguagePreference } from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LanguageSettings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const languages: Language[] = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
    },
    {
      code: "de",
      name: "Deutsch",
      nativeName: "Deutsch",
      flag: "🇩🇪",
    },
  ];

  const changeLanguage = async (languageCode: string): Promise<void> => {
    if (i18n.language === languageCode) {
      return;
    }

    try {
      await saveLanguagePreference(languageCode);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const LanguageOption: React.FC<{
    language: Language;
    isSelected: boolean;
    onPress: () => void;
  }> = ({ language, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.languageOption, isSelected && styles.selectedOption]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.languageContent}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageText}>
          <Text
            style={[
              styles.languageName,
              isSelected && styles.selectedText,
            ]}
          >
            {language.name}
          </Text>
          <Text
            style={[
              styles.nativeName,
              isSelected && styles.selectedText,
            ]}
          >
            {language.nativeName}
          </Text>
        </View>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={color.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("language.selectLanguage")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t("language.chooseLanguage")}
        </Text>
        <View style={styles.languageList}>
          {languages.map((language: Language) => (
            <LanguageOption
              key={language.code}
              language={language}
              isSelected={i18n.language === language.code}
              onPress={() => changeLanguage(language.code)}
            />
          ))}
        </View>
        <Text style={styles.note}>
          {t("language.languageNote")}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.gray100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.gray600,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: font.bold,
    color: color.black,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: color.gray55,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: font.regular,
  },
  languageList: {
    marginBottom: 30,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.gray600,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: color.primary100,
    borderColor: color.primary,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
    width: 36,
    textAlign: "center",
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  selectedText: {
    color: color.primary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkIcon: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.bold,
  },
  note: {
    fontSize: 12,
    color: color.gray55,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 16,
    fontFamily: font.regular,
  },
});

export default LanguageSettings;
