import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "../locales/de.json";
import en from "../locales/en.json";

const LANGUAGE_PREFERENCE = "user-language";

const resources = {
  en: { translation: en },
  de: { translation: de },
};

// Initialize i18n with a simple configuration first
i18n.use(initReactI18next).init({
  lng: Localization.getLocales()[0]?.languageCode?.startsWith("de")
    ? "de"
    : "en",
  fallbackLng: "en",
  compatibilityJSON: "v4",
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // This is important for React Native
  },
});

// Load saved language preference after initialization
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PREFERENCE);
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (e) {
    console.error("Failed to load saved language:", e);
  }
};

// Load saved language
loadSavedLanguage();

// Function to save language preference
export const saveLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE, language);
    await i18n.changeLanguage(language);
  } catch (e) {
    console.error("Failed to save language:", e);
  }
};

export default i18n;
