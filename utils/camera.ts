// camera.ts
import { useCameraPermissions as useExpoCameraPermissions } from "expo-camera";
import {
  useCameraPermissions as useImagePickerCameraPermissions,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import { Alert, Linking } from "react-native";

// Hook to wrap both camera and gallery permissions
export function useCombinedPermissions() {
  const [camPerm, requestCamPerm] = useExpoCameraPermissions();
  const [pickerCamPerm, requestPickerCam] = useImagePickerCameraPermissions();
  const [mediaPerm, requestMediaPerm] = useMediaLibraryPermissions();

  const ensurePermissions = async () => {
    // Ask if not determined
    if (camPerm?.status !== "granted") {
      await requestCamPerm();
    }
    if (pickerCamPerm?.status !== "granted") {
      await requestPickerCam();
    }
    if (mediaPerm?.status !== "granted") {
      await requestMediaPerm();
    }

    // Re-check statuses
    const camStatus = camPerm?.status ?? (await requestCamPerm()).status;
    const pickerCamStatus =
      pickerCamPerm?.status ?? (await requestPickerCam()).status;
    const mediaStatus = mediaPerm?.status ?? (await requestMediaPerm()).status;

    if (
      camStatus === "granted" &&
      pickerCamStatus === "granted" &&
      mediaStatus === "granted"
    ) {
      return true;
    }

    Alert.alert(
      "Permissions needed",
      "Camera and gallery access are required to proceed.",
      [
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
    return false;
  };

  return { ensurePermissions, camPerm, pickerCamPerm, mediaPerm };
}
