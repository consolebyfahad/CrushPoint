import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VerifyIdentityScreenProps {
  onBack?: () => void;
  onStartScan?: () => void;
}

const VerifyIdentityScreen: React.FC<VerifyIdentityScreenProps> = ({
  onBack,
  onStartScan,
}) => {
  const { userData, user, userImages } = useAppContext();
  const { showToast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  console.log("userData", userData);
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
      // submissionData.append("latitude", userData.latitude.toString());
      // submissionData.append("longitude", userData.longitude.toString());

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

  const handleStartScan = async () => {
    if (isScanning || isSubmitting) return;

    if (!validateData()) {
      return;
    }

    setIsScanning(true);

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
        });

        console.log("Photo captured for verification");

        await submitAllData();

        onStartScan?.();
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      showToast("Failed to capture photo. Please try again.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required for face verification
        </Text>
        <CustomButton title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.instructionText}>
            <Octicons name="info" size={14} color={color.gray55} /> Position
            your face in the frame and ensure good lighting
          </Text>
        </View>

        {/* Camera Container */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraFrame}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front">
              {/* Face guide overlay */}
              <View style={styles.faceGuide} />
            </CameraView>
          </View>
        </View>
      </View>

      {/* Start Scan Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={
            isSubmitting
              ? "Creating Profile..."
              : isScanning
              ? "Scanning..."
              : "Start Scan"
          }
          onPress={handleStartScan}
          isDisabled={isScanning || isSubmitting}
          isLoading={isScanning || isSubmitting}
          icon={<Feather name="camera" size={20} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  permissionText: {
    fontSize: 16,
    color: color.black,
    textAlign: "center",
    marginBottom: 20,
  },
  titleContainer: {
    paddingTop: 40,
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
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cameraFrame: {
    aspectRatio: 3 / 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 12,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  faceGuide: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 200,
    height: 260,
    marginTop: -200,
    marginLeft: -100,
    borderWidth: 2,
    borderColor: color.primary,
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  buttonContainer: {
    padding: 16,
  },
});

export default VerifyIdentityScreen;
