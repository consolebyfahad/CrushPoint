import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactSupport({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: "Julia Williams",
    email: "Email@example.com",
    subject: "",
    message: "",
  });

  const subjectOptions = [
    "Account Issue",
    "Bug Report",
    "Feature Request",
    "Safety Concern",
    "Billing Question",
    "Other",
  ];

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

  const handleSendMessage = () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!formData.subject) {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    console.log("Sending support message:", formData);

    // Show success message
    Alert.alert(
      "Message Sent",
      "Thank you for contacting us! Our support team will get back to you as soon as possible.",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData((prev) => ({
              ...prev,
              subject: "",
              message: "",
            }));
          },
        },
      ]
    );
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
        <Text style={styles.title}>Contact Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.helpIcon}>
            <Ionicons name="help-circle-outline" size={32} color="#5FB3D4" />
          </View>
          <Text style={styles.helpTitle}>{"We're here to help"}</Text>
          <Text style={styles.helpDescription}>
            Our support team will get back to you as soon as possible.
          </Text>
        </View>

        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter your name"
            placeholderTextColor={color.gray400}
          />
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email"
            placeholderTextColor={color.gray400}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Subject Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Subject</Text>
          <View style={styles.subjectGrid}>
            {subjectOptions.map(renderSubjectOption)}
          </View>
        </View>

        {/* Message Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput
            style={styles.messageInput}
            value={formData.message}
            onChangeText={(value) => handleInputChange("message", value)}
            placeholder="How can we help?"
            placeholderTextColor={color.gray400}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {formData.message.length}/500
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Send Button */}
      <View style={styles.sendContainer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!formData.name.trim() ||
              !formData.email.trim() ||
              !formData.subject ||
              !formData.message.trim()) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          activeOpacity={0.8}
          disabled={
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.subject ||
            !formData.message.trim()
          }
        >
          <Ionicons
            name="send"
            size={18}
            color={color.white}
            style={styles.sendIcon}
          />
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
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
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    alignItems: "center",
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
    color: color.gray400,
    textAlign: "center",
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
    color: color.gray400,
    textAlign: "right",
    marginTop: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  sendContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: color.gray400,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
