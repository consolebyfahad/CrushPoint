import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
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
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleStartScan = async () => {
    if (isScanning) return;

    setIsScanning(true);

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
        });

        console.log("Photo captured:", {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          base64: photo.base64 ? "Base64 data available" : "No base64",
        });
        setTimeout(() => {
          router.push("/(tabs)");
          onStartScan?.();
        }, 1000);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
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
          title={isScanning ? "Scanning..." : "Start Scan"}
          onPress={handleStartScan}
          isDisabled={isScanning}
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
