import * as Camera from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const { status } = await requestPermission();

    if (status === "granted") {
      // console.log("📷 Camera permission granted");
      return true;
    } else {
      console.warn("❌ Camera permission denied");
      return false;
    }
  } catch (error) {
    console.error("❌ Camera permission request failed:", error);
    return false;
  }
};

export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const [permission] = Camera.useCameraPermissions();
    const status = permission?.status;
    return status === "granted";
  } catch (error) {
    console.error("❌ Camera permission check failed:", error);
    return false;
  }
};

// ImagePicker permissions (recommended for most apps)
export const requestImagePickerPermissions = async (): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> => {
  try {
    // Request camera permission
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const cameraGranted = cameraResult.status === "granted";

    // Request media library permission
    const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const mediaGranted = mediaResult.status === "granted";

    // console.log(
    //   `📷 Camera permission: ${cameraGranted ? "✅ granted" : "❌ denied"}`
    // );
    // console.log(
    //   `📱 Media library permission: ${
    //     mediaGranted ? "✅ granted" : "❌ denied"
    //   }`
    // );

    return {
      camera: cameraGranted,
      mediaLibrary: mediaGranted,
    };
  } catch (error) {
    console.error("❌ ImagePicker permissions request failed:", error);
    return {
      camera: false,
      mediaLibrary: false,
    };
  }
};

export const checkImagePickerPermissions = async (): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> => {
  try {
    const cameraResult = await ImagePicker.getCameraPermissionsAsync();
    const mediaResult = await ImagePicker.getMediaLibraryPermissionsAsync();

    return {
      camera: cameraResult.status === "granted",
      mediaLibrary: mediaResult.status === "granted",
    };
  } catch (error) {
    console.error("❌ ImagePicker permissions check failed:", error);
    return {
      camera: false,
      mediaLibrary: false,
    };
  }
};

// Comprehensive camera access function (recommended)
export const requestFullCameraAccess = async (): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> => {
  try {
    const permissions = await requestImagePickerPermissions();

    if (permissions.camera && permissions.mediaLibrary) {
      // console.log("🎉 All camera permissions granted!");
    } else if (permissions.camera) {
      console.log(
        "📷 Camera permission granted, but media library access denied"
      );
    } else if (permissions.mediaLibrary) {
      console.log(
        "📱 Media library permission granted, but camera access denied"
      );
    } else {
      console.log("❌ All camera permissions denied");
    }

    return permissions;
  } catch (error) {
    console.error("❌ Full camera access request failed:", error);
    return {
      camera: false,
      mediaLibrary: false,
    };
  }
};

// Utility functions for taking photos and picking images
export const takePhoto =
  async (): Promise<ImagePicker.ImagePickerResult | null> => {
    try {
      const permissions = await checkImagePickerPermissions();

      if (!permissions.camera) {
        console.warn("📷 Camera permission not granted");
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log("📷 Photo taken successfully");
        return result;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to take photo:", error);
      return null;
    }
  };

export const pickImageFromLibrary =
  async (): Promise<ImagePicker.ImagePickerResult | null> => {
    try {
      const permissions = await checkImagePickerPermissions();

      if (!permissions.mediaLibrary) {
        console.warn("📱 Media library permission not granted");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log("📱 Image selected from library");
        return result;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to pick image from library:", error);
      return null;
    }
  };

// Multiple image picker (for dating app galleries)
export const pickMultipleImages = async (
  maxImages: number = 6
): Promise<ImagePicker.ImagePickerResult | null> => {
  try {
    const permissions = await checkImagePickerPermissions();

    if (!permissions.mediaLibrary) {
      console.warn("📱 Media library permission not granted");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log(`📱 ${result.assets.length} images selected from library`);
      return result;
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to pick multiple images:", error);
    return null;
  }
};

// Show action sheet for camera options
export const showImagePickerOptions =
  async (): Promise<ImagePicker.ImagePickerResult | null> => {
    try {
      // This would typically be used with a custom action sheet component
      // For now, we'll just return the camera option
      return await takePhoto();
    } catch (error) {
      console.error("❌ Failed to show image picker options:", error);
      return null;
    }
  };

// Utility to check if device has camera
export const hasCamera = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const [permission] = Camera.useCameraPermissions();
    const status = permission?.status;
    return status === "granted";
  } catch (error) {
    console.error("❌ Failed to check camera availability:", error);
    return false;
  }
};
