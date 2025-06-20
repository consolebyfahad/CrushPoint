import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerificationStatus({ navigation }: any) {
  const [verificationState, setVerificationState] = useState({
    status: "failed", // "failed", "pending", "verified"
    lastAttempt: new Date(),
  });

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Go back");
    }
  };

  const handleTryAgain = () => {
    console.log("Starting verification process...");

    // Update status to pending
    setVerificationState((prev) => ({
      ...prev,
      status: "pending",
    }));

    // Simulate verification process
    Alert.alert(
      "Verification Started",
      "Please follow the camera instructions to verify your identity.",
      [
        {
          text: "OK",
          onPress: () => {
            // For demo, we'll simulate a random result after a delay
            setTimeout(() => {
              const success = Math.random() > 0.5;
              setVerificationState((prev) => ({
                ...prev,
                status: success ? "verified" : "failed",
                lastAttempt: new Date(),
              }));

              if (success) {
                Alert.alert(
                  "Verification Successful",
                  "Your account has been verified!"
                );
              } else {
                Alert.alert(
                  "Verification Failed",
                  "Please try again following the guidelines."
                );
              }
            }, 2000);
          },
        },
      ]
    );
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
          backgroundColor: "#ECFDF5",
          showTryAgain: false,
        };
      case "pending":
        return {
          title: "Verification Pending",
          description: "We're reviewing your submission",
          iconName: "time",
          iconColor: "#F59E0B",
          backgroundColor: "#FFFBEB",
          showTryAgain: false,
        };
      case "failed":
      default:
        return {
          title: "Verification Failed",
          description: "Please try verifying again",
          iconName: "warning",
          iconColor: "#EF4444",
          backgroundColor: "#E0F2FE",
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Verification Status</Text>
        <View style={styles.placeholder} />
      </View>

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
            color={color.gray400}
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
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={handleTryAgain}
            activeOpacity={0.8}
          >
            <Ionicons
              name="camera"
              size={18}
              color={color.white}
              style={styles.tryAgainIcon}
            />
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
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
    borderRadius: 30,
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
    color: color.gray400,
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
    backgroundColor: "#F9FAFB",
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
    color: color.gray400,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
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
