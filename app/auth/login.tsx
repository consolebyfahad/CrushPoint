import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { formatPhoneNumber } from "@/utils/formatPhone";
import SocialAuth from "@/utils/social_auth";
import { EmailIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { setUser } = useAppContext();

  const [activeTab, setActiveTab] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [email, setEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [otherMethodsLoading, setOtherMethodsLoading] = useState(false);
  useEffect(() => {
    if (params.tab === "email") {
      setActiveTab("email");
    } else if (params.tab === "phone") {
      setActiveTab("phone");
    }
  }, [params.tab]);

  const handleContinue = async () => {
    setLoginLoading(true);
    const formData = new FormData();
    formData.append("type", "register");
    formData.append("reg_type", activeTab);

    if (activeTab === "phone") {
      const cleanedPhone = phoneNumber.replace(/\s/g, "");
      formData.append("phone", cleanedPhone);
    } else {
      formData.append("email", email);
    }

    try {
      const response = await apiCall(formData);
      const userData = {
        user_id: response?.user_id,
        email: response?.email,
        name: response?.name,
        image: response?.image,
        created: response?.created,
        new: response?.new,
      };
      setUser(userData);

      router.push({
        pathname: "/auth/verify",
        params: {
          type: activeTab,
          contact: activeTab === "phone" ? phoneNumber : email,
        },
      });

      setPhoneNumber("+");
      setEmail("");
    } catch (error) {
      console.error("❌ API Error:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  const isFormValid = () => {
    if (activeTab === "phone") {
      const digits = phoneNumber.replace(/\D/g, "");
      return phoneNumber.startsWith("+") && digits.length >= 11;
    } else {
      return email.includes("@") && email.includes(".");
    }
  };

  // Handle successful social authentication
  const handleSocialAuthSuccess = (
    userData: any,
    provider: "apple" | "google"
  ) => {
    setOtherMethodsLoading(true);
    setUser(userData);

    router.push({
      pathname: "/auth/verify",
      params: {
        type: `${provider} account`,
        contact: `${provider} account`,
      },
    });
  };

  // Handle social authentication errors
  const handleSocialAuthError = (message: string) => {
    // showToast(message, "error");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {activeTab === "phone"
              ? t("auth.enterPhone")
              : t("auth.enterEmail")}
          </Text>
          <Text style={styles.subtitle}>
            {activeTab === "phone"
              ? t("auth.phoneVerification")
              : t("auth.emailVerification")}
          </Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "phone" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("phone")}
          >
            <PhoneIcon />
            <Text style={styles.tabText}>{t("auth.phone")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "email" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("email")}
          >
            <EmailIcon />
            <Text style={styles.tabText}>{t("auth.email")}</Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {activeTab === "phone"
              ? t("auth.phoneNumber")
              : t("auth.emailAddress")}
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              {activeTab === "phone" ? <PhoneIcon /> : <EmailIcon />}
            </View>

            <TextInput
              style={[
                styles.textInput,
                Platform.OS === "ios" && { paddingVertical: 16 },
              ]}
              placeholder={
                activeTab === "phone" ? "+92 300 1234567" : "you@example.com"
              }
              placeholderTextColor={color.gray69}
              value={activeTab === "phone" ? phoneNumber : email}
              onChangeText={(text) => {
                if (activeTab === "phone") {
                  const digitsOnly = text.replace(/\D/g, "");

                  if (digitsOnly.length > 13) {
                    return;
                  }
                  const raw = text.replace(/\s/g, "");
                  const withPlus = raw.startsWith("+")
                    ? raw
                    : "+" + raw.replace(/^\+?/, "");
                  const formatted = formatPhoneNumber(withPlus);
                  setPhoneNumber(formatted);
                } else {
                  setEmail(text);
                }
              }}
              keyboardType={
                activeTab === "phone" ? "phone-pad" : "email-address"
              }
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Continue Button */}
        <CustomButton
          title={t("continue")}
          onPress={handleContinue}
          isDisabled={!isFormValid()}
          isLoading={loginLoading}
        />
        <Text style={styles.orText}>OR</Text>
        <SocialAuth
          onAuthSuccess={handleSocialAuthSuccess}
          onAuthError={handleSocialAuthError}
          isDisabled={otherMethodsLoading}
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
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: color.gray87,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: color.white,
    shadowColor: color.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    color: color.black,
    fontFamily: font.medium,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray14,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: color.white,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  orText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
    textAlign: "center",
    marginVertical: 16,
  },
});
