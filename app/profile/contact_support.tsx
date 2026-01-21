import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactSupport() {
  const { t } = useTranslation();
  const { user, userData } = useAppContext();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const subjectOptions = [
    t("contactSupport.subjects.accountIssue"),
    t("contactSupport.subjects.bugReport"),
    t("contactSupport.subjects.featureRequest"),
    t("contactSupport.subjects.safetyConcern"),
    t("contactSupport.subjects.billingQuestion"),
    t("contactSupport.subjects.other"),
  ];

  // Pre-populate user data from context
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: userData?.name || user?.name || "",
      email: userData?.email || user?.email || "",
    }));
  }, [user, userData]);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubjectSelect = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: subject,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast(t("contactSupport.validation.nameRequired"), "error");
      return false;
    }

    if (!formData.email.trim()) {
      showToast(t("contactSupport.validation.emailRequired"), "error");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast(t("contactSupport.validation.validEmail"), "error");
      return false;
    }

    if (!formData.subject) {
      showToast(t("contactSupport.validation.subjectRequired"), "error");
      return false;
    }

    if (!formData.message.trim()) {
      showToast(t("contactSupport.validation.messageRequired"), "error");
      return false;
    }

    return true;
  };

  const handleSendMessage = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.user_id) {
      showToast(t("contactSupport.validation.sessionExpired"), "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append("type", "add_data");
      submissionData.append("table_name", "contact_us");
      submissionData.append("user_id", user.user_id);
      submissionData.append("subject", formData.subject);
      submissionData.append("message", formData.message.trim());
console.log("submissionData", submissionData)
      const response = await apiCall(submissionData);

      if (response.result) {
        // Show success confirmation message
        showToast(
          t("contactSupport.success.messageSent"),
          "success"
        );

        // Reset form (keep name and email)
        setFormData((prev) => ({
          ...prev,
          subject: "",
          message: "",
        }));

        // Navigate back after showing success message
        setTimeout(() => {
          router.back();
        }, 2000); // Increased to 2000ms to give user time to see the success message
      } else {
        showToast(
          response.message || t("contactSupport.validation.sendFailed"),
          "error"
        );
      }
    } catch (error) {

      showToast(t("contactSupport.validation.somethingWrong"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubjectOption = (option: string) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.subjectOption,
        formData.subject === option && styles.selectedSubjectOption,
      ]}
      onPress={() => handleSubjectSelect(option)}
      activeOpacity={0.7}
      disabled={isSubmitting}
    >
      <Text
        style={[
          styles.subjectOptionText,
          formData.subject === option && styles.selectedSubjectOptionText,
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  );

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject &&
    formData.message.trim();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={t("contactSupport.title")} divider />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.helpIcon}>
              <Ionicons name="help-circle-outline" size={32} color="#5FB3D4" />
            </View>
            <Text style={styles.helpTitle}>{t("contactSupport.subtitle")}</Text>
            <Text style={styles.helpDescription}>
              {t("contactSupport.description")}
            </Text>
          </View>

          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {t("contactSupport.nameLabel")}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder={t("contactSupport.namePlaceholder")}
              placeholderTextColor={color.gray14}
              editable={!isSubmitting}
              returnKeyType="next"
            />
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {t("contactSupport.emailLabel")}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder={t("contactSupport.emailPlaceholder")}
              placeholderTextColor={color.gray14}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
              returnKeyType="next"
            />
          </View>

          {/* Subject Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {t("contactSupport.subjectLabel")}
            </Text>
            <View style={styles.subjectGrid}>
              {subjectOptions.map(renderSubjectOption)}
            </View>
          </View>

          {/* Message Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {t("contactSupport.messageLabel")}
            </Text>
            <TextInput
              style={styles.messageInput}
              value={formData.message}
              onChangeText={(value) => handleInputChange("message", value)}
              placeholder={t("contactSupport.messagePlaceholder")}
              placeholderTextColor={color.gray14}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
              editable={!isSubmitting}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <Text style={styles.characterCount}>
              {t("contactSupport.characterCount", {
                count: formData.message.length,
              })}
            </Text>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.sendContainer}>
          <CustomButton
            title={
              isSubmitting
                ? t("contactSupport.sending")
                : t("contactSupport.sendMessage")
            }
            onPress={handleSendMessage}
            isDisabled={!isFormValid || isSubmitting}
            icon={<Feather name="send" size={18} color="white" />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerCard: {
    backgroundColor: color.primary100,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  helpIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  subjectOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: color.white,
    minWidth: "48%",
    alignItems: "center",
  },
  selectedSubjectOption: {
    borderColor: "#5FB3D4",
    backgroundColor: "#F0F9FF",
  },
  subjectOptionText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  selectedSubjectOptionText: {
    color: "#5FB3D4",
  },
  messageInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 120,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray69,
    textAlign: "right",
    marginTop: 8,
  },
  sendContainer: {
    padding: 16,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
});
