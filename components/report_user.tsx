import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReportUser({
  visible,
  onClose,
  onBack,
  onSubmit,
  userName = "User",
}: any) {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const reportReasons = [
    {
      id: "fake_profile",
      title: "Fake Profile",
      description: "This profile appears to be fake photos or info.",
    },
    {
      id: "inappropriate_photos",
      title: "Inappropriate Photos",
      description: "Profile contains inappropriate or explicit content",
    },
    {
      id: "harassment",
      title: "Harassment or Threats",
      description: "This person is sending threatening or harassing.",
    },
    {
      id: "spam",
      title: "Spam or Scams",
      description: "Profile is promoting products, services, or scam.",
    },
    {
      id: "underage",
      title: "Underage User",
      description: "This person appears to be under 18 years old",
    },
    {
      id: "other",
      title: "Other",
      description: "Other concerns not listed above",
    },
  ];

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleSubmitReport = () => {
    if (!selectedReason) {
      // Show error or alert
      console.log("Please select a reason");
      return;
    }

    const reportData = {
      reason: selectedReason,
      additionalDetails: additionalDetails,
      userName: userName,
    };

    if (onSubmit) {
      onSubmit(reportData);
    } else {
      console.log("Report submitted:", reportData);
    }

    // Reset form and close
    setSelectedReason("");
    setAdditionalDetails("");
    onClose();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={color.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Report User</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={color.black} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Question */}
            <Text style={styles.questionText}>
              {" What's wrong with this profile?"}
            </Text>

            {/* Report Reasons */}
            <View style={styles.reasonsContainer}>
              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.selectedReasonItem,
                    index === reportReasons.length - 1 && styles.lastReasonItem,
                  ]}
                  onPress={() => handleReasonSelect(reason.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reasonContent}>
                    <Text style={styles.reasonTitle}>{reason.title}</Text>
                    <Text style={styles.reasonDescription}>
                      {reason.description}
                    </Text>
                  </View>
                  {selectedReason === reason.id && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={color.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Details */}
            <View style={styles.additionalDetailsSection}>
              <Text style={styles.additionalDetailsLabel}>
                Additional Details
              </Text>
              <TextInput
                style={styles.additionalDetailsInput}
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                placeholder="Please provide more information..."
                placeholderTextColor={color.gray14}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedReason && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReport}
              activeOpacity={0.8}
              disabled={!selectedReason}
            >
              <Ionicons
                name="flag"
                size={18}
                color={color.white}
                style={styles.submitIcon}
              />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginTop: 24,
    marginBottom: 20,
  },
  reasonsContainer: {
    marginBottom: 24,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: color.white,
  },
  selectedReasonItem: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 3,
    borderLeftColor: color.primary,
  },
  lastReasonItem: {
    borderBottomWidth: 0,
  },
  reasonContent: {
    flex: 1,
    marginRight: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.primary,
  },
  additionalDetailsSection: {
    marginBottom: 24,
  },
  additionalDetailsLabel: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
  },
  additionalDetailsInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    backgroundColor: color.white,
    height: 100,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: color.gray14,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
