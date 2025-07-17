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
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { compareSimpleFaces } from "../../utils/FaceVerificationService";

export default function FaceVerification() {
  const { userData, user, userImages } = useAppContext();
  console.log("userData,", userData);
  console.log("userImages,", userImages);
  const defaultImage =
    userImages.length > 0
      ? `https://7tracking.com/crushpoint/images/${userImages[0]}`
      : null;
  const { showToast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedSelfieFileName, setUploadedSelfieFileName] = useState<
    string | null
  >(null);
  const cameraRef = useRef<any>(null);

  // Simplified face comparison
  const compareFaces = async (
    capturedImageUri: string,
    referenceImageUri: string
  ) => {
    try {
      setIsProcessing(true);

      if (!referenceImageUri) {
        throw new Error("No reference image available");
      }

      // Use the simple comparison function
      const result = await compareSimpleFaces(
        capturedImageUri,
        referenceImageUri
      );

      return result;
    } catch (error) {
      console.error("Face verification error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    if (!user?.user_id) {
      throw new Error("User ID not found. Please login again.");
    }

    try {
      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", user.user_id);
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "selfie.jpg",
      } as any);

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

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    if (!defaultImage) {
      Alert.alert("Error", "No reference image available for comparison.");
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      // Compare with the simple function
      const verificationResult = await compareFaces(photo.uri, defaultImage);

      // Show result to user
      const title = verificationResult.verified
        ? "✅ Verification Successful!"
        : "❌ Verification Failed!";

      setTimeout(() => {
        Alert.alert(title, verificationResult.message, [
          {
            text: "Try Again",
            onPress: () => {},
          },
          {
            text: verificationResult.verified ? "OK" : "Skip",
            style: "default",
            onPress: async () => {
              if (verificationResult.verified) {
                try {
                  setIsProcessing(true);
                  const fileName = await uploadImageToServer(photo.uri);
                  setUploadedSelfieFileName(fileName);
                  showToast("Selfie uploaded successfully!", "success");
                  submitAllData(fileName);
                } catch (error) {
                  showToast("Failed to upload selfie", "error");
                  submitAllData(null);
                } finally {
                  setIsProcessing(false);
                }
              } else {
                submitAllData(null);
              }
            },
          },
        ]);
      }, 100);
    } catch (error: any) {
      showToast("Error in face verification", "error");
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
            onPress: () => submitAllData(null),
          },
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const submitAllData = async (selfieFileName?: string | null) => {
    if (!user?.user_id) {
      showToast("User session expired. Please login again.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = new FormData();
      submissionData.append("type", "update_data");
      submissionData.append("table_name", "users");
      submissionData.append("id", user.user_id);
      submissionData.append("gender", userData.gender);
      submissionData.append("gender_interest", userData.gender_interest);
      submissionData.append("interests", JSON.stringify(userData.interests));
      submissionData.append("name", userData.name);
      submissionData.append("dob", userData.dob);
      const finalSelfieFileName = selfieFileName || uploadedSelfieFileName;
      if (finalSelfieFileName) {
        submissionData.append("uploaded_selfie", finalSelfieFileName);
      }
      submissionData.append("images", JSON.stringify(userImages));
      submissionData.append(
        "looking_for",
        JSON.stringify(userData.looking_for)
      );
      submissionData.append("radius", userData.radius.toString());
      submissionData.append("lat", userData.lat.toString());
      submissionData.append("lng", userData.lng.toString());
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
          isDisabled={isProcessing || isCapturing || !defaultImage}
          isLoading={isProcessing || isCapturing}
          icon={<Feather name="camera" size={20} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

// Keep your existing styles...
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
