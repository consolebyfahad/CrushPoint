import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceData, setFaceData] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (faces.length > 0) {
      setFaceDetected(true);
      setFaceData(faces[0]);
    } else {
      setFaceDetected(false);
      setFaceData(null);
    }
  };

  const getFaceOverlayStyle = () => {
    if (!faceData) return { display: "none" };

    const { bounds } = faceData;
    const faceX = bounds.origin.x;
    const faceY = bounds.origin.y;
    const faceWidth = bounds.size.width;
    const faceHeight = bounds.size.height;

    // Calculate center point and radius for circular overlay
    const centerX = faceX + faceWidth / 2;
    const centerY = faceY + faceHeight / 2;
    const radius = Math.max(faceWidth, faceHeight) / 2 + 20;

    return {
      position: "absolute" as const,
      left: centerX - radius,
      top: centerY - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      borderWidth: 3,
      borderColor: "#4ECDC4",
      backgroundColor: "transparent",
    };
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required for face verification
        </Text>
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
          {/* <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onFacesDetected={handleFacesDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 100,
              tracking: true,
            }}
          >
            {faceDetected && faceData && <View style={getFaceOverlayStyle()} />}
          </CameraView> */}
        </View>
      </View>

      {/* Start Scan Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startScanButton} onPress={onStartScan}>
          <Ionicons
            name="camera"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.startScanText}>Start Scan</Text>
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
