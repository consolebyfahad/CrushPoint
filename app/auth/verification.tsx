import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { CameraView } from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getGlobalFaceService,
  initGlobalFaceService,
} from "./FaceVerificationService";

const { width } = Dimensions.get("window");

// Face++ Configuration
const FACE_PLUS_PLUS_CONFIG = {
  API_KEY: "p-kmeDYiAJfe2K3vOoShCPQ4LNmAbVvB",
  API_SECRET: "1MRi6hRagROVPEG9r7wYyu9bLJBZEMgl",
  CONFIDENCE_THRESHOLD: 75,
};

export default function FaceVerification() {
  const { userData, user, userImages } = useAppContext();
  const defaultImage =
    userImages.length > 0
      ? `https://7tracking.com/crushpoint/images/${userImages[0]}`
      : null;
  const { showToast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<any>(null);

  // Initialize Face Verification Service
  useEffect(() => {
    initGlobalFaceService(
      FACE_PLUS_PLUS_CONFIG.API_KEY,
      FACE_PLUS_PLUS_CONFIG.API_SECRET,
      {
        confidenceThreshold: FACE_PLUS_PLUS_CONFIG.CONFIDENCE_THRESHOLD,
        cacheEnabled: true,
        maxRetries: 2,
      }
    );
  }, []);

  // Simplified face comparison using the service
  const compareFaces = async (
    capturedImageUri: any,
    referenceImageAsset: any
  ) => {
    try {
      setIsProcessing(true);

      const faceService = getGlobalFaceService();

      // Use the service's complete verification workflow
      const result = await faceService.verifyFaces(
        capturedImageUri,
        referenceImageAsset,
        {
          cacheKey: "fahad_reference",
          skipQualityCheck: false,
          requireHighConfidence: false,
        }
      );

      return result;
    } catch (error) {
      console.error("Face verification error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log("Photo captured:", photo.uri);
      setCapturedImage(photo.uri);
      //   setShowCamera(false);

      // Compare with reference image using Face++
      const verificationResult = await compareFaces(photo.uri, defaultImage);

      console.log("Verification result:", verificationResult);

      // Show detailed result to user
      const title = verificationResult.verified
        ? "✅ Verification Successful!"
        : "❌ Verification Failed!";

      const message = verificationResult.verified
        ? `Face verified with ${verificationResult.confidence.toFixed(
            1
          )}% confidence.\n\nMatch Level: ${
            verificationResult.matchLevel
          }\nProcessing Time: ${verificationResult.processingTime}ms`
        : `${
            verificationResult.analysis.description
          }\n\nConfidence: ${verificationResult.confidence.toFixed(
            1
          )}%\nRecommendation: ${verificationResult.analysis.recommendation}`;

      setTimeout(() => {
        Alert.alert(title, message, [
          {
            text: "Try Again",
            onPress: () => {
              setCapturedImage(null);
              // setShowCamera(true);
            },
          },
          {
            text: "OK",
            style: "default",
            onPress: () => {
              if (verificationResult.verified) {
                submitAllData();
              }
            },
          },
        ]);
      }, 100);
    } catch (error: any) {
      console.error("Error in face verification:", error);

      Alert.alert(
        "Verification Error",
        error.userFriendlyMessage ||
          error.message ||
          "Failed to verify face. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setCapturedImage(null);
              //   setShowCamera(true);
            },
          },
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const submitAllData = async () => {
    if (!user?.user_id) {
      showToast("User session expired. Please login again.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = new FormData();
      submissionData.append("type", "update_data");
      submissionData.append("id", user.user_id);
      submissionData.append("table_name", "users");
      submissionData.append("gender", userData.gender);
      submissionData.append("gender_interest", userData.gender_interest);
      submissionData.append("interests", JSON.stringify(userData.interests));
      submissionData.append("name", userData.name);
      submissionData.append("dob", userData.dob);
      submissionData.append("images", JSON.stringify(userImages));
      submissionData.append(
        "looking_for",
        JSON.stringify(userData.looking_for)
      );
      submissionData.append("radius", userData.radius.toString());
      submissionData.append("lat", userData.lat.toString());
      submissionData.append("l", userData.lng.toString());

      // Optional fields - only add if they have values
      if (userData.height) submissionData.append("height", userData.height);
      if (userData.nationality)
        submissionData.append("nationality", userData.nationality);
      if (userData.religion)
        submissionData.append("religion", userData.religion);
      if (userData.zodiac) submissionData.append("zodiac", userData.zodiac);

      console.log("Submitting profile data:", submissionData);

      const response = await apiCall(submissionData);

      if (response.result) {
        router.push("/(tabs)");
      } else {
        showToast(response.message || "Failed to create profile", "error");
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateData = () => {
    const requiredFields = {
      gender: userData.gender,
      gender_interest: userData.gender_interest,
      name: userData.name,
      dob: userData.dob,
      interests: userData.interests.length > 0,
      looking_for: userData.looking_for.length > 0,
      images: userImages.length >= 2,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      showToast(
        `Missing required fields: ${missingFields.join(", ")}`,
        "error"
      );
      return false;
    }

    return true;
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.instructionText}>
          <Octicons name="info" size={14} color={color.gray55} /> Position your
          face in the frame and ensure good lighting
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.cameraContainer}>
          <View style={styles.cameraFrame}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front">
              {/* Face guide overlay */}
              <View style={styles.faceGuide} />

              {/* Processing overlay */}
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <Text style={styles.processingOverlayText}>
                    Processing...
                  </Text>
                </View>
              )}
            </CameraView>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={
            isSubmitting
              ? "Creating Profile..."
              : isProcessing
              ? "Scanning..."
              : "Start Scan"
          }
          onPress={takePicture}
          isDisabled={isProcessing || isCapturing}
          isLoading={isProcessing || isCapturing}
          icon={<Feather name="camera" size={20} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  titleContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: font.bold,
    color: color.black,
  },
  instructionText: {
    fontSize: 16,
    color: color.gray55,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
  },
  cameraFrame: {
    aspectRatio: 4 / 5,
    backgroundColor: "#E5E5EA",
    borderRadius: 12,
    overflow: "hidden",
    // maxHeight: 600,
  },
  camera: {
    flex: 1,
  },
  faceGuide: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: 200,
    height: 260,
    marginTop: -130,
    marginLeft: -100,
    borderWidth: 2,
    borderColor: color.primary,
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingOverlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  previewImage: {
    width: width - 32,
    height: ((width - 32) * 4) / 3,
    borderRadius: 12,
    maxHeight: 400,
  },
  referenceContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  referenceImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  buttonContainer: {
    padding: 16,
  },
  captureButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
