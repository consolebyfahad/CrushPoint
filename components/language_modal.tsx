import { color, font } from "@/utils/constants";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelect: (languageCode: string) => void;
  currentLanguage: string;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  onLanguageSelect,
  currentLanguage,
}) => {
  const { t } = useTranslation();

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

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageSelect(languageCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("language.selectLanguage")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t("language.chooseLanguage")}
          </Text>

          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageText}>
                    <Text
                      style={[
                        styles.languageName,
                        currentLanguage === language.code && styles.selectedText,
                      ]}
                    >
                      {language.name}
                    </Text>
                    <Text
                      style={[
                        styles.nativeName,
                        currentLanguage === language.code && styles.selectedText,
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                {currentLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.note}>
            {t("language.languageNote")}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: color.white,
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.gray600,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: color.gray55,
    fontFamily: font.medium,
  },
  subtitle: {
    fontSize: 16,
    color: color.gray55,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: font.regular,
  },
  languageList: {
    marginBottom: 20,
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

export default LanguageModal;
