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
import React, { useCallback, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { compareSimpleFaces } from "../../utils/FaceVerificationService";

type VerificationState =
  | "idle"
  | "capturing"
  | "processing"
  | "uploading"
  | "submitting";

export default function FaceVerification() {
  const { userData, user, userImages } = useAppContext();
  const defaultImage =
    userImages.length > 0
      ? `https://7tracking.com/crushpoint/images/${userImages[0]}`
      : null;
  const { showToast } = useToast();

  const [verificationState, setVerificationState] =
    useState<VerificationState>("idle");
  const [uploadedSelfieFileName, setUploadedSelfieFileName] = useState<
    string | null
  >(null);
  const cameraRef = useRef<any>(null);

  // Centralized state check
  const isProcessing = verificationState !== "idle";

  // Handle verification result separately from UI
  const handleVerificationResult = useCallback(
    async (isVerified: boolean, message: string, photoUri: string) => {
      const title = isVerified
        ? "✅ Verification Successful!"
        : "❌ Verification Failed!";

      return new Promise<void>((resolve) => {
        Alert.alert(title, message, [
          {
            text: "Try Again",
            onPress: () => resolve(),
          },
          {
            text: isVerified ? "Continue" : "Skip",
            style: "default",
            onPress: () => {
              // Don't do async work here - just resolve and handle outside
              if (isVerified) {
                processVerifiedPhoto(photoUri);
              } else {
                skipVerificationAndSubmit();
              }
              resolve();
            },
          },
        ]);
      });
    },
    []
  );

  // Process verified photo upload
  const processVerifiedPhoto = useCallback(async (photoUri: string) => {
    try {
      setVerificationState("uploading");
      const fileName = await uploadImageToServer(photoUri);
      setUploadedSelfieFileName(fileName);
      showToast("Selfie uploaded successfully!", "success");

      // Small delay to ensure state is updated
      setTimeout(() => {
        submitAllData(fileName);
      }, 100);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload selfie", "error");
      // Continue with submission without selfie
      setTimeout(() => {
        submitAllData(null);
      }, 100);
    }
  }, []);

  // Skip verification and submit
  const skipVerificationAndSubmit = useCallback(() => {
    setTimeout(() => {
      submitAllData(null);
    }, 100);
  }, []);

  // Simplified face comparison
  const compareFaces = async (
    capturedImageUri: string,
    referenceImageUri: string
  ) => {
    try {
      if (!referenceImageUri) {
        throw new Error("No reference image available");
      }

      const result = await compareSimpleFaces(
        capturedImageUri,
        referenceImageUri
      );
      return result;
    } catch (error) {
      console.error("Face verification error:", error);
      throw error;
    }
  };

  // Fixed image upload for iOS
  const uploadImageToServer = async (imageUri: string): Promise<string> => {
    if (!user?.user_id) {
      throw new Error("User ID not found. Please login again.");
    }

    try {
      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", user.user_id);

      // Handle iOS photo URI properly
      const photoData: any = {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        type: "image/jpeg",
        name: "selfie.jpg",
      };

      formData.append("file", photoData);

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        return response.file_name;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // Main photo capture function
  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    if (!defaultImage) {
      Alert.alert("Error", "No reference image available for comparison.");
      return;
    }

    try {
      setVerificationState("capturing");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      setVerificationState("processing");

      let verificationResult;

      if (Platform.OS === "ios") {
        // Skip actual verification on iOS to avoid crashes
        verificationResult = await compareFaces(photo.uri, defaultImage);
        // verificationResult = {
        //   verified: true,
        //   confidence: 100,
        //   message: "✅ Identity verification completed!",
        // };
      } else {
        verificationResult = await compareFaces(photo.uri, defaultImage);
      }

      // Reset state before showing alert
      setVerificationState("idle");

      // Handle result with delay to ensure UI is stable
      setTimeout(() => {
        handleVerificationResult(
          verificationResult.verified,
          verificationResult.message,
          photo.uri
        );
      }, 100);
    } catch (error: any) {
      console.error("Camera/Verification error:", error);
      setVerificationState("idle");

      showToast("Error in face verification", "error");

      setTimeout(() => {
        Alert.alert(
          "Verification Error",
          error.message || "Failed to verify face. Please try again.",
          [
            {
              text: "Try Again",
              onPress: () => {},
            },
            {
              text: "Skip",
              style: "destructive",
              onPress: () => skipVerificationAndSubmit(),
            },
          ]
        );
      }, 100);
    }
  };

  // Improved data submission with better error handling
  const submitAllData = async (selfieFileName?: string | null) => {
    if (!user?.user_id) {
      showToast("User session expired. Please login again.", "error");
      return;
    }

    if (verificationState === "submitting") {
      return; // Prevent double submission
    }

    setVerificationState("submitting");

    try {
      const submissionData = new FormData();
      submissionData.append("type", "update_data");
      submissionData.append("table_name", "users");
      submissionData.append("id", user.user_id);
      submissionData.append("gender", userData?.gender || "");
      submissionData.append("gender_interest", userData?.gender_interest || "");
      submissionData.append(
        "interests",
        JSON.stringify(userData?.interests || [])
      );
      submissionData.append("name", userData?.name || "");
      submissionData.append("dob", userData?.dob || "");

      const finalSelfieFileName = selfieFileName || uploadedSelfieFileName;
      if (finalSelfieFileName) {
        submissionData.append("uploaded_selfie", finalSelfieFileName);
      }

      submissionData.append("images", JSON.stringify(userImages || []));
      submissionData.append(
        "looking_for",
        JSON.stringify(userData?.looking_for || [])
      );
      submissionData.append("radius", (userData?.radius || 50).toString());
      submissionData.append("lat", (userData?.lat || 0).toString());
      submissionData.append("lng", (userData?.lng || 0).toString());

      const response = await apiCall(submissionData);

      if (response.result) {
        // Add small delay before navigation to ensure state is clean
        setTimeout(() => {
          router.push("/(tabs)");
        }, 100);
      } else {
        throw new Error(response.message || "Failed to create profile");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      showToast(
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setVerificationState("idle");
    }
  };

  // Get appropriate button text
  const getButtonText = () => {
    switch (verificationState) {
      case "capturing":
        return "Capturing...";
      case "processing":
        return "Processing...";
      case "uploading":
        return "Uploading...";
      case "submitting":
        return "Creating Profile...";
      default:
        return "Start Scan";
    }
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
            {/* Camera without children */}
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />

            {/* Face guide overlay - positioned absolutely */}
            <View style={styles.faceGuide} />

            {/* Processing overlay - positioned absolutely */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <Text style={styles.processingOverlayText}>
                  {verificationState === "capturing" && "Capturing..."}
                  {verificationState === "processing" && "Processing..."}
                  {verificationState === "uploading" && "Uploading..."}
                  {verificationState === "submitting" && "Submitting..."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={getButtonText()}
          onPress={takePicture}
          isDisabled={isProcessing || !defaultImage}
          isLoading={isProcessing}
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
  buttonContainer: {
    padding: 16,
  },
});
