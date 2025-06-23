import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

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

        // Here you would typically send the photo to a face detection service
        // For example: AWS Rekognition, Google Cloud Vision, or Azure Face API

        // Simulate face detection processing
        setTimeout(() => {
          // Navigate to next screen
          // router.push('/next-screen'); // Replace with your actual route

          // Or call the onStartScan prop if provided
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
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Verify Your Identity</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
        <Text style={styles.instructionText}>
          Position your face in the frame and ensure good lighting
        </Text>
      </View>

      {/* Camera Container */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <CameraView ref={cameraRef} style={styles.camera} facing="front">
            {/* Face guide overlay */}
            <View style={styles.faceGuide} />

            {/* Instructions overlay */}
            <View style={styles.instructionsOverlay}>
              <Text style={styles.overlayText}>
                Align your face with the oval
              </Text>
            </View>
          </CameraView>
        </View>
      </View>

      {/* Start Scan Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.startScanButton, isScanning && styles.disabledButton]}
          onPress={handleStartScan}
          disabled={isScanning}
        >
          <Ionicons
            name={isScanning ? "scan" : "camera"}
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.startScanText}>
            {isScanning ? "Scanning..." : "Start Scan"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  cameraContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cameraFrame: {
    aspectRatio: 3 / 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  camera: {
    flex: 1,
  },
  faceGuide: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 200,
    height: 240,
    marginTop: -120,
    marginLeft: -100,
    borderWidth: 3,
    borderColor: "#4ECDC4",
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  instructionsOverlay: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  startScanButton: {
    backgroundColor: "#4ECDC4",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#4ECDC4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
    shadowColor: "#C7C7CC",
  },
  buttonIcon: {
    marginRight: 8,
  },
  startScanText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    letterSpacing: 0.5,
  },
});

export default VerifyIdentityScreen;
