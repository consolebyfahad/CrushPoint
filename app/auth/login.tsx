import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { formatPhoneNumber } from "@/utils/formatPhone";
import { EmailIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (params.tab === "email") {
      setActiveTab("email");
    } else if (params.tab === "phone") {
      setActiveTab("phone");
    }
  }, [params.tab]);

  const handleContinue = async () => {
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
      console.log("🚀 API Success:", response);

      router.push("/auth/verify");

      setPhoneNumber("+");
      setEmail("");
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  const isFormValid = () => {
    if (activeTab === "phone") {
      // Minimum 10 digits after +
      const digits = phoneNumber.replace(/\D/g, "");
      return phoneNumber.startsWith("+") && digits.length >= 11;
    } else {
      return email.includes("@") && email.includes(".");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
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
            <PhoneIcon />
            <Text style={styles.tabText}>Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "email" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("email")}
          >
            <EmailIcon />
            <Text style={styles.tabText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {activeTab === "phone" ? "Phone Number" : "Email Address"}
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
                  const raw = text.replace(/\s/g, ""); // remove all spaces
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
          title="Continue"
          onPress={handleContinue}
          isDisabled={!isFormValid()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    padding: 16,
  },
  content: {
    flex: 1,
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
});
