import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { CameraView } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { userData, user, userImages, updateUserData } = useAppContext();
  const routeParams = useLocalSearchParams();
  // Optional refs passed in as comma-separated URLs
  const refsParam =
    typeof routeParams.refs === "string" ? routeParams.refs : undefined;
  const mode =
    typeof routeParams.mode === "string" ? routeParams.mode : undefined;
  const returnTo =
    typeof routeParams.returnTo === "string" ? routeParams.returnTo : undefined;
  const photosParam =
    typeof routeParams.photos === "string" ? routeParams.photos : undefined;

  const referenceImages: string[] = (
    refsParam
      ? refsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : (userImages || [])
          .slice(0, 3)
          .map((img) => `https://api.andra-dating.com/images/${img}`)
  ).filter(Boolean);
  const { showToast } = useToast();

  const [verificationState, setVerificationState] =
    useState<VerificationState>("idle");
  const [uploadedSelfieFileName, setUploadedSelfieFileName] = useState<
    string | null
  >(null);
  const cameraRef = useRef<any>(null);

  // Centralized state check
  const isProcessing = verificationState !== "idle";

  // Process verified photo upload
  const processVerifiedPhoto = useCallback(async (photoUri: string) => {
    try {
      setVerificationState("uploading");
      const fileName = await uploadImageToServer(photoUri);
      setUploadedSelfieFileName(fileName);

      // Small delay to ensure state is updated
      setTimeout(() => {
        submitAllData(fileName);
      }, 100);
    } catch (error) {
      console.error("Upload error:", error);
      showToast(t("common.failedToUploadSelfie"), "error");
      // Continue with submission without selfie
      setTimeout(() => {
        submitAllData(null);
      }, 100);
    }
  }, []);

  // Handle verification result separately from UI
  const handleVerificationResult = useCallback(
    async (isVerified: boolean, message: string, photoUri: string) => {
      const title = isVerified
        ? `${t("auth.verificationSuccessful")}`
        : `${t("auth.verificationFailed")}`;

      return new Promise<void>((resolve) => {
        Alert.alert(title, message, [
          {
            text: isVerified ? t("continue") : t("auth.tryAgain"),
            style: isVerified ? "default" : "destructive",
            onPress: () => {
              if (isVerified) {
                if (mode === "verify_only" && returnTo === "add_photos") {
                  router.replace("/(tabs)/profile");
                } else {
                  processVerifiedPhoto(photoUri);
                }
              }
              resolve();
            },
          },
        ]);
      });
    },
    [t, processVerifiedPhoto, mode, returnTo, photosParam, referenceImages]
  );

  // Remove skip verification function - verification is now mandatory

  // Simplified face comparison
  const compareAgainstAllReferences = async (
    capturedImageUri: string,
    references: string[]
  ) => {
    if (!references || references.length === 0) {
      throw new Error(t("common.noReferenceImage"));
    }

    const results: Array<{
      index: number;
      verified: boolean;
      message: string;
    }> = [];
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      try {
        const result = await compareSimpleFaces(capturedImageUri, ref);
        results.push({
          index: i,
          verified: result.verified,
          message: result.message,
        });
      } catch (err: any) {
        results.push({
          index: i,
          verified: false,
          message: err?.message || "Comparison failed",
        });
      }
    }

    const anyFailed = results.some((r) => !r.verified);
    return {
      verified: !anyFailed,
      results,
      message: anyFailed
        ? `${t("auth.verificationFailedmessage")} (${
            results.filter((r) => !r.verified).length
          }/${results.length} failed)`
        : t("auth.verificationSuccessfulmessage"),
    };
  };

  // Fixed image upload for iOS
  const uploadImageToServer = async (imageUri: string): Promise<string> => {
    if (!user?.user_id) {
      throw new Error(t("common.userIdNotFound"));
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
        throw new Error(response.message || t("common.uploadFailed"));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // Main photo capture function
  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    if (!referenceImages || referenceImages.length === 0) {
      Alert.alert(t("error"), t("auth.noReferenceImage"));
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

      // Perform verification against all reference images
      verificationResult = await compareAgainstAllReferences(
        photo.uri,
        referenceImages
      );

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

      showToast(t("common.errorInFaceVerification"), "error");

      setTimeout(() => {
        Alert.alert(
          t("auth.verificationError"),
          error.message || t("auth.verificationFailed ❌" ),
          [
            {
              text: t("auth.tryAgain"),
              onPress: () => {},
            },
          ]
        );
      }, 100);
    }
  };

  // Improved data submission with better error handling
  const submitAllData = async (selfieFileName?: string | null) => {
    if (!user?.user_id) {
      showToast(t("common.userSessionExpired"), "error");
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
      submissionData.append("about", userData?.about || "");

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
      submissionData.append("status", "1");
      const response = await apiCall(submissionData);

      if (response.result) {
        updateUserData({ status: "1" });

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        throw new Error(response.message || t("common.failedToCreateProfile"));
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      showToast(error.message || t("auth.somethingWentWrong"), "error");
    } finally {
      setVerificationState("idle");
    }
  };

  // Get appropriate button text
  const getButtonText = () => {
    switch (verificationState) {
      case "capturing":
        return t("auth.capturing");
      case "processing":
        return t("auth.processing");
      case "uploading":
        return t("auth.uploading");
      case "submitting":
        return t("auth.creatingProfile");
      default:
        return t("auth.startScan");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("auth.verifyIdentity")}</Text>
        <Text style={styles.instructionText}>
          <Octicons name="info" size={14} color={color.gray55} />{" "}
          {t("auth.faceVerificationInstruction")}
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
                  {verificationState === "capturing" && t("auth.capturing")}
                  {verificationState === "processing" && t("auth.processing")}
                  {verificationState === "uploading" && t("auth.uploading")}
                  {verificationState === "submitting" && t("auth.submitting")}
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
          isDisabled={isProcessing || referenceImages.length === 0}
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
