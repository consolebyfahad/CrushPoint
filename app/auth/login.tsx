import { color, font } from "@/utils/constants";
import { EmailIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Back Arrow Icon Component
const BackArrowIcon = () => (
  <View style={styles.backIcon}>
    <Text style={styles.backArrowText}>←</Text>
  </View>
);

export default function Login() {
  const [activeTab, setActiveTab] = useState("phone"); // "phone" or "email"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
    // Alternative: router.push("/welcome");
  };

  const handleContinue = () => {
    if (activeTab === "phone") {
      router.push("/auth/verify");
      console.log("Continue with phone:", phoneNumber);
      // router.push("/auth/verify-phone");
    } else {
      console.log("Continue with email:", email);
      // router.push("/auth/verify-email");
    }
  };

  const isFormValid = () => {
    if (activeTab === "phone") {
      return phoneNumber.length >= 10;
    } else {
      return email.includes("@") && email.includes(".");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {activeTab === "phone"
              ? "Enter your phone number"
              : "Enter your email"}
          </Text>
          <Text style={styles.subtitle}>
            {activeTab === "phone"
              ? "We'll send you a code to verify your number"
              : "We'll send you a code to verify your email"}
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
            <PhoneIcon
              width={20}
              height={20}
              fill={activeTab === "phone" ? color.black : color.gray300}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "phone"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "email" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("email")}
          >
            <EmailIcon
              width={20}
              height={20}
              fill={activeTab === "email" ? color.black : color.gray300}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "email"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {activeTab === "phone" ? "Phone Number" : "Email Address"}
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              {activeTab === "phone" ? (
                <PhoneIcon width={20} height={20} fill={color.gray300} />
              ) : (
                <EmailIcon width={20} height={20} fill={color.gray300} />
              )}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder={
                activeTab === "phone" ? "+1 (555) 000-0000" : "you@example.com"
              }
              placeholderTextColor={color.gray200}
              value={activeTab === "phone" ? phoneNumber : email}
              onChangeText={activeTab === "phone" ? setPhoneNumber : setEmail}
              keyboardType={
                activeTab === "phone" ? "phone-pad" : "email-address"
              }
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            isFormValid()
              ? styles.continueButtonActive
              : styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid()}
        >
          <Text
            style={[
              styles.continueButtonText,
              isFormValid()
                ? styles.continueButtonTextActive
                : styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.gray100,
    borderRadius: 22,
  },
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrowText: {
    fontSize: 20,
    color: color.black,
    fontFamily: font.medium,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 40,
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
    color: color.gray300,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: color.gray100,
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
    fontFamily: font.medium,
  },
  activeTabText: {
    color: color.black,
  },
  inactiveTabText: {
    color: color.gray300,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray400,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.gray100,
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
    paddingVertical: 16,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonActive: {
    backgroundColor: color.primary,
  },
  continueButtonDisabled: {
    backgroundColor: color.gray100,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
  },
  continueButtonTextActive: {
    color: color.white,
  },
  continueButtonTextDisabled: {
    color: color.gray300,
  },
});
