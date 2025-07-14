import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationStatus({ navigation }: any) {
  const [verificationState, setVerificationState] = useState({
    status: "faild", // "failed", "pending", "verified"
    lastAttempt: new Date(),
  });

  const handleTryAgain = () => {
    console.log("Starting verification process...");
    router.push("/auth/verification");
  };

  const handleWhyVerify = () => {
    Alert.alert(
      "Why Verify?",
      "Verification helps:\n\n• Build trust in the community\n• Reduce fake profiles\n• Increase your match potential\n• Ensure a safer dating experience",
      [{ text: "Got it" }]
    );
  };

  const getStatusInfo = () => {
    switch (verificationState.status) {
      case "verified":
        return {
          title: "Verification Successful",
          description: "Your account is verified",
          iconName: "checkmark-circle",
          iconColor: "#10B981",
          backgroundColor: color.primary100,
          showTryAgain: false,
        };
      case "pending":
        return {
          title: "Verification Pending",
          description: "We're reviewing your submission",
          iconName: "time",
          iconColor: "#F59E0B",
          backgroundColor: color.primary100,
          showTryAgain: false,
        };
      case "failed":
      default:
        return {
          title: "Verification Failed",
          description: "Please try verifying again",
          iconName: "warning-outline",
          iconColor: "#EF4444",
          backgroundColor: color.primary100,
          showTryAgain: true,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const verificationIssues = [
    {
      title: "Poor lighting",
      description: "Ensure your face is well-lit and clearly visible",
    },
    {
      title: "Face not centered",
      description: "Position your face within the guide frame",
    },
    {
      title: "Multiple faces detected",
      description: "Make sure you're alone in the frame",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={"Verification Status"} divider={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: statusInfo.backgroundColor },
          ]}
        >
          <View style={styles.statusIcon}>
            <Ionicons
              name={statusInfo.iconName as any}
              size={32}
              color={statusInfo.iconColor}
            />
          </View>
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        </View>

        {/* Why Verify Section */}
        <TouchableOpacity
          style={styles.whyVerifySection}
          onPress={handleWhyVerify}
          activeOpacity={0.7}
        >
          <Text style={styles.whyVerifyTitle}>Why verify?</Text>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={color.gray14}
          />
        </TouchableOpacity>

        {/* Common Issues Section - Only show if verification failed */}
        {verificationState.status === "failed" && (
          <View style={styles.issuesSection}>
            <Text style={styles.issuesTitle}>Common verification issues:</Text>

            {verificationIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Success Message - Only show if verified */}
        {verificationState.status === "verified" && (
          <View style={styles.successSection}>
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successDescription}>
              Your verified badge will now appear on your profile, helping you
              build trust with potential matches.
            </Text>
          </View>
        )}

        {/* Pending Message - Only show if pending */}
        {verificationState.status === "pending" && (
          <View style={styles.pendingSection}>
            <Text style={styles.pendingTitle}>Review in Progress</Text>
            <Text style={styles.pendingDescription}>
              {
                "Our team is reviewing your verification submission. This usually takes 24-48 hours. We'll notify you once it's complete."
              }
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Try Again Button - Only show if verification failed */}
      {statusInfo.showTryAgain && (
        <View style={styles.tryAgainContainer}>
          <CustomButton
            title="Try Again"
            onPress={handleTryAgain}
            icon={<Feather name="camera" size={18} color="white" />}
          />
        </View>
      )}
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
    paddingHorizontal: 20,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    textAlign: "center",
  },
  whyVerifySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 24,
  },
  whyVerifyTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  issuesSection: {
    marginBottom: 24,
  },
  issuesTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 16,
  },
  issueItem: {
    backgroundColor: color.gray97,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 18,
  },
  successSection: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: "#065F46",
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: "#047857",
    lineHeight: 20,
  },
  pendingSection: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  pendingTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: "#92400E",
    marginBottom: 8,
  },
  pendingDescription: {
    fontSize: 14,
    fontFamily: font.regular,
    color: "#B45309",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  tryAgainContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray95,
  },
  tryAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
  },
  tryAgainIcon: {
    marginRight: 8,
  },
  tryAgainText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
