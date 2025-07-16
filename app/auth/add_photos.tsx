import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UploadedPhoto = {
  id: string;
  uri: string;
  width: number;
  height: number;
  fileName?: any;
  serverUrl?: string;
  isUploading?: boolean;
  isExisting?: boolean;
};

export default function AddPhotos() {
  const { user, addUserImage, removeUserImage, userImages } = useAppContext();
  const params = useLocalSearchParams();
  const [selectedPhotos, setSelectedPhotos] = useState<UploadedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if coming from profile edit
  const isEditMode = params.fromEdit === "true";
  const maxPhotos = 6;
  const minPhotos = 2;

  // Load existing images when in edit mode
  useEffect(() => {
    if (isEditMode && userImages && userImages.length > 0) {
      const existingPhotos: UploadedPhoto[] = userImages.map(
        (fileName, index) => ({
          id: `existing_${index}`,
          uri: `https://your-server.com/uploads/${fileName}`, // Replace with your actual image URL
          width: 300,
          height: 400,
          fileName: fileName,
          isExisting: true,
          isUploading: false,
        })
      );
      setSelectedPhotos(existingPhotos);
    }
  }, [isEditMode, userImages]);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to upload photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const uploadImageToServer = async (imageUri: string, photoId: string) => {
    if (!user?.user_id) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return null;
    }

    try {
      // Mark photo as uploading
      setSelectedPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId ? { ...photo, isUploading: true } : photo
        )
      );

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", user.user_id);
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "image.jpg",
      } as any);

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        // Only add to context if not in edit mode (edit mode handles this in save)
        if (!isEditMode) {
          addUserImage(response.file_name);
        }

        setSelectedPhotos((prev) =>
          prev.map((photo) =>
            photo.id === photoId
              ? {
                  ...photo,
                  fileName: response.file_name,
                  serverUrl: response.url,
                  isUploading: false,
                }
              : photo
          )
        );

        return response;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);

      setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));

      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      return null;
    }
  };

  const pickImage = async () => {
    if (selectedPhotos.length >= maxPhotos) {
      Alert.alert(
        "Maximum photos reached",
        `You can only upload up to ${maxPhotos} photos.`
      );
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newPhotos: UploadedPhoto[] = result.assets.map((asset) => ({
          id: Date.now() + Math.random() + "",
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          isUploading: false,
          isExisting: false,
        }));

        // Add photos to state first
        setSelectedPhotos((prev) =>
          [...prev, ...newPhotos].slice(0, maxPhotos)
        );

        // Upload each photo to server
        newPhotos.forEach(async (photo) => {
          await uploadImageToServer(photo.uri, photo.id);
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const removePhoto = (photoId: string) => {
    const photoToRemove = selectedPhotos.find((photo) => photo.id === photoId);

    // Remove from server/context if it was uploaded and not in edit mode
    if (photoToRemove?.fileName && !isEditMode) {
      removeUserImage(photoToRemove.fileName);
    }

    // Remove from local state
    setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleContinue = () => {
    const uploadedPhotos = selectedPhotos.filter(
      (photo) => photo.fileName && !photo.isUploading
    );

    if (uploadedPhotos.length < minPhotos) {
      Alert.alert(
        "Not enough photos",
        `Please upload at least ${minPhotos} photos to continue.`
      );
      return;
    }
    router.push("/auth/verification");
  };

  const handleSave = async () => {
    const uploadedPhotos = selectedPhotos.filter(
      (photo) => photo.fileName && !photo.isUploading
    );

    if (uploadedPhotos.length < minPhotos) {
      Alert.alert(
        "Not enough photos",
        `Please upload at least ${minPhotos} photos to save.`
      );
      return;
    }

    if (!user?.user_id) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    setIsLoading(true);
    try {
      const imageFileNames = uploadedPhotos.map((photo) => photo.fileName);

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append("images", JSON.stringify(imageFileNames));

      const response = await apiCall(formData);

      if (response.result) {
        // Update context with new images
        // Clear existing images and add new ones
        userImages.forEach((fileName) => removeUserImage(fileName));
        imageFileNames.forEach((fileName) => addUserImage(fileName));

        Alert.alert("Success", "Photos updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        throw new Error(response.message || "Failed to update photos");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save photos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    selectedPhotos.filter((photo) => photo.fileName && !photo.isUploading)
      .length < minPhotos;

  const renderPhotoSlot = (index: number) => {
    const photo = selectedPhotos[index];

    if (photo) {
      return (
        <View key={index} style={styles.photoSlot}>
          <Image source={{ uri: photo.uri }} style={styles.uploadedPhoto} />

          {/* Loading indicator for uploading photos */}
          {photo.isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={color.white} />
            </View>
          )}

          {/* Success indicator for uploaded photos */}
          {photo.fileName && !photo.isUploading && (
            <View style={styles.successIndicator}>
              <Feather name="check" size={16} color={color.white} />
            </View>
          )}

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removePhoto(photo.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.emptyPhotoSlot}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        <View style={styles.uploadIcon}>
          <Feather name="upload" size={24} color={color.gray900} />
        </View>
      </TouchableOpacity>
    );
  };

  const uploadedCount = selectedPhotos.filter(
    (photo) => photo.fileName && !photo.isUploading
  ).length;
  const uploadingCount = selectedPhotos.filter(
    (photo) => photo.isUploading
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {isEditMode ? "Edit your photos" : "Add your best photos"}
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                <Octicons name="info" size={14} color={color.gray55} /> Photos
                should be clear and show your face. Add at least 2 photos to
                continue.
              </Text>
            </View>
          </View>

          {/* Main Upload Area */}
          <TouchableOpacity
            style={styles.mainUploadArea}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <View style={styles.uploadContent}>
              <Feather name="camera" size={32} color={color.gray900} />
              <Text style={styles.uploadText}>
                Drag & drop photos here, or click to select
              </Text>
              <Text style={styles.fileSizeText}>Maximum file size: 5MB</Text>
            </View>
          </TouchableOpacity>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            <View style={styles.photoRow}>
              {renderPhotoSlot(0)}
              {renderPhotoSlot(1)}
              {renderPhotoSlot(2)}
            </View>
            <View style={styles.photoRow}>
              {renderPhotoSlot(3)}
              {renderPhotoSlot(4)}
              {renderPhotoSlot(5)}
            </View>
          </View>

          {/* Photo Count */}
          <Text style={styles.photoCount}>
            {uploadedCount} of {maxPhotos} photos uploaded
            {uploadingCount > 0 && ` (${uploadingCount} uploading)`}
            (minimum {minPhotos})
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={isLoading ? "Saving..." : isEditMode ? "Save" : "Continue"}
          onPress={isEditMode ? handleSave : handleContinue}
          isDisabled={isButtonDisabled || isLoading}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  titleSection: {
    paddingTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  mainUploadArea: {
    borderWidth: 2,
    borderColor: color.gray87,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  uploadContent: {
    alignItems: "center",
    gap: 12,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: font.regular,
    lineHeight: 24,
    color: color.gray55,
    textAlign: "center",
  },
  fileSizeText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
  },
  photoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  photoRow: {
    flexDirection: "row",
    gap: 16,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    position: "relative",
  },
  emptyPhotoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: color.gray87,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadedPhoto: {
    flex: 1,
    borderRadius: 12,
    width: "100%",
    height: "100%",
  },
  uploadIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: color.white,
    fontSize: 14,
    fontFamily: font.bold,
    lineHeight: 16,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  successIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray87,
  },
});
