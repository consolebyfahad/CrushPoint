import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { user, addUserImage, removeUserImage } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const photosParam = params.photos;

  // Convert photos parameter to array
  const photos = React.useMemo(() => {
    if (!photosParam) return [];

    // If it's already an array, return it
    if (Array.isArray(photosParam)) return photosParam;

    // If it's a string, split by comma and filter out empty strings
    if (typeof photosParam === "string") {
      return photosParam.split(",").filter((url) => url.trim().length > 0);
    }

    return [];
  }, [photosParam]);

  const [selectedPhotos, setSelectedPhotos] = useState<UploadedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if coming from profile edit
  const isEditMode = params.fromEdit === "true";
  const maxPhotos = 6;
  const minPhotos = 2;

  // Load existing images when in edit mode
  useEffect(() => {
    if (isEditMode && photos && photos.length > 0) {
      const existingPhotos: UploadedPhoto[] = photos.map((photoUrl, index) => {
        // Extract filename from URL for fileName field
        const urlParts = photoUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];

        return {
          id: `existing_${index}`,
          uri: photoUrl, // Use the full URL directly since it's already provided
          width: 300,
          height: 400,
          fileName: fileName,
          isExisting: true,
          isUploading: false,
        };
      });
      setSelectedPhotos(existingPhotos);
    }
  }, [isEditMode, photos]);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("profile.permissionNeeded"), t("profile.grantPermission"), [
        { text: t("common.ok") },
      ]);
      return false;
    }
    return true;
  };

  const uploadImageToServer = async (imageUri: string, photoId: string) => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("profile.userIdNotFound"));
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
        throw new Error(response.message || t("auth.uploadFailed"));
      }
    } catch (error) {
      setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      showToast(t("profile.failedToUpload"));
      return null;
    }
  };

  const pickImage = async () => {
    if (selectedPhotos.length >= maxPhotos) {
      showToast(t("profile.maximumPhotosReached"), "warning");
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newPhotos: UploadedPhoto[] = result.assets.map(
          (asset, index) => ({
            id: Date.now() + index + Math.random() + "",
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            isUploading: false,
            isExisting: false,
          })
        );

        // Add photos to state first
        setSelectedPhotos((prev) =>
          [...prev, ...newPhotos].slice(0, maxPhotos)
        );

        // Upload each photo to server sequentially to maintain order
        for (const photo of newPhotos) {
          await uploadImageToServer(photo.uri, photo.id);
        }
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("profile.failedToPickImages"));
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
        t("profile.notEnoughPhotos"),
        t("profile.uploadAtLeastContinue", { count: minPhotos })
      );
      return;
    }
    router.push("/auth/verification");
  };

  const savePhotosToServer = async () => {
    const uploadedPhotos = selectedPhotos.filter(
      (photo) => photo.fileName && !photo.isUploading
    );

    if (!user?.user_id) {
      throw new Error(t("profile.userIdNotFound"));
    }

    const imageFileNames = uploadedPhotos.map((photo) => photo.fileName);

    const formData = new FormData();
    formData.append("type", "update_data");
    formData.append("id", user.user_id);
    formData.append("table_name", "users");
    formData.append("images", JSON.stringify(imageFileNames));
    const response = await apiCall(formData);

    if (response.result) {
      // Remove old photos and add new ones to context
      if (photos && Array.isArray(photos)) {
        photos.forEach((photoUrl) => {
          const urlParts = photoUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          removeUserImage(fileName);
        });
      }
      imageFileNames.forEach((fileName) => addUserImage(fileName));
      return true;
    } else {
      throw new Error(response.message || t("profile.failedToUpdatePhotos"));
    }
  };

  const handleSave = async () => {
    const uploadedPhotos = selectedPhotos.filter(
      (photo) => photo.fileName && !photo.isUploading
    );

    // In edit mode, count both existing photos (from params) and new photos
    let totalPhotoCount = uploadedPhotos.length;

    // If in edit mode and we have existing photos in params, ensure we count them
    // This handles cases where state might not be perfectly synced after navigation
    if (isEditMode && photos && Array.isArray(photos) && photos.length > 0) {
      // Get existing photo filenames from params
      const existingPhotoFileNames = photos.map((photoUrl) => {
        const urlParts = photoUrl.split("/");
        return urlParts[urlParts.length - 1];
      });

      // Count unique photos (existing + new)
      const allPhotoFileNames = new Set([
        ...existingPhotoFileNames,
        ...uploadedPhotos.map((p) => p.fileName).filter(Boolean),
      ]);

      totalPhotoCount = allPhotoFileNames.size;
    }

    if (totalPhotoCount < minPhotos) {
      Alert.alert(
        t("profile.notEnoughPhotos"),
        t("profile.uploadAtLeastSave", { count: minPhotos })
      );
      return;
    }

    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("profile.userIdNotFound"));
      return;
    }

    // If in edit mode and user added any new photos, require verification first
    if (isEditMode) {
      const hasNewPhotos = selectedPhotos.some(
        (p) => p.fileName && !p.isExisting
      );
      if (hasNewPhotos) {
        // Don't save photos yet - wait for verification success
        // Prepare photo file names to pass to verification screen
        const newPhotoFileNames = selectedPhotos
          .filter((p) => p.fileName && !p.isExisting)
          .map((p) => p.fileName!);
        
        const existingPhotoFileNames = selectedPhotos
          .filter((p) => p.isExisting && p.fileName)
          .map((p) => p.fileName!);

        // Combine all photo file names (existing + new)
        const allPhotoFileNames = [...existingPhotoFileNames, ...newPhotoFileNames];

        // Prepare refs for verification (use first 3 photos)
        const refs: string[] = selectedPhotos
          .filter((p) => p.fileName)
          .slice(0, 3)
          .map((p) =>
            p.serverUrl
              ? p.serverUrl
              : `https://api.andra-dating.com/images/${p.fileName}`
          );

        const refsParam = encodeURIComponent(refs.join(","));
        const photoFileNamesParam = encodeURIComponent(JSON.stringify(allPhotoFileNames));
        
        router.push({
          pathname: "/auth/verification",
          params: {
            mode: "verify_only",
            returnTo: "add_photos",
            refs: refsParam,
            photoFileNames: photoFileNamesParam,
            oldPhotos: Array.isArray(photos) ? photos.join(",") : photos || "",
          },
        });
        return;
      }
    }

    // Regular save flow
    setIsLoading(true);
    try {
      await savePhotosToServer();
      Alert.alert(t("common.success"), t("profile.photosUpdatedSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(t("common.error"), t("profile.failedToSavePhotos"));
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
              {isEditMode ? t("profile.editPhotos") : t("profile.addPhotos")}
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                <Octicons name="info" size={14} color={color.gray55} />{" "}
                {t("profile.photosSubtitle")}
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
                {t("profile.dragDropPhotos")}
              </Text>
              <Text style={styles.fileSizeText}>
                {t("profile.maxFileSize")}
              </Text>
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
            {t("profile.photosUploaded", {
              count: uploadedCount,
              max: maxPhotos,
            })}
            {uploadingCount > 0 &&
              ` ${t("profile.uploading", { count: uploadingCount })}`}{" "}
            {t("profile.minimumPhotos", { min: minPhotos })}
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={
            isLoading
              ? t("common.saving")
              : isEditMode
              ? t("common.save")
              : t("continue")
          }
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
