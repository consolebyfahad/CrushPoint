import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddPhotos() {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const maxPhotos = 6;
  const minPhotos = 2;

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
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - selectedPhotos.length,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map((asset) => ({
          id: Date.now() + Math.random(),
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }));

        setSelectedPhotos((prev) =>
          [...prev, ...newPhotos].slice(0, maxPhotos)
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const removePhoto = (photoId: any) => {
    setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleContinue = () => {
    console.log("Selected photos:", selectedPhotos);
    router.push("/auth/verification"); // Update with your next route
  };

  const isButtonDisabled = selectedPhotos.length < minPhotos;

  const renderPhotoSlot = (index: any) => {
    const photo = selectedPhotos[index];

    if (photo) {
      return (
        <View key={index} style={styles.photoSlot}>
          <Image source={{ uri: photo.uri }} style={styles.uploadedPhoto} />
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* Title and Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Add your best photos</Text>
            <View style={styles.subtitleContainer}>
              <View style={styles.infoIcon}>
                <Feather name="info" size={16} color={color.gray300} />
              </View>
              <Text style={styles.subtitle}>
                Photos should be clear and show your face. Add at least 2 photos
                to continue.
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
            {selectedPhotos.length} of {maxPhotos} photos uploaded (minimum{" "}
            {minPhotos})
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <CustomButton
        title="Continue"
        onPress={handleContinue}
        isDisabled={isButtonDisabled}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  titleSection: {
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
  infoIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray300,
    lineHeight: 22,
    flex: 1,
  },
  mainUploadArea: {
    borderWidth: 2,
    borderColor: color.gray100,
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
    color: color.gray300,
    textAlign: "center",
  },
  fileSizeText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray200,
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
    borderColor: color.gray100,
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
  uploadIconText: {
    fontSize: 24,
    color: color.gray300,
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
  photoCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    textAlign: "center",
    marginBottom: 16,
  },
});
