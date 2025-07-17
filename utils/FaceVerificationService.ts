// SimpleFaceVerification.ts
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const FACE_API_CONFIG = {
  API_KEY: "p-kmeDYiAJfe2K3vOoShCPQ4LNmAbVvB",
  API_SECRET: "1MRi6hRagROVPEG9r7wYyu9bLJBZEMgl",
  BASE_URL: "https://api-us.faceplusplus.com/facepp/v3",
  CONFIDENCE_THRESHOLD: 75,
};

interface SimpleVerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
}

class SimpleFaceVerification {
  // Resize image to meet Face++ requirements (max 1MB, 800px width)
  private async resizeImage(imageUri: string): Promise<string> {
    try {
      console.log("📦 Resizing image:", imageUri);

      const manipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 600 } }], // Smaller size to ensure it fits
        {
          compress: 0.7, // 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(manipulatorResult.uri);
      if (!fileInfo.exists || typeof fileInfo.size !== "number") {
        throw new Error("Resized image file not found or size unknown");
      }
      const fileSizeInMB = fileInfo.size / (1024 * 1024);
      console.log(`✅ Resized image size: ${fileSizeInMB.toFixed(2)}MB`);

      return manipulatorResult.uri;
    } catch (error: any) {
      console.error("Error resizing image:", error);
      throw new Error(`Failed to resize image: ${error.message}`);
    }
  }

  // Convert image to base64
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      // First resize the image
      const resizedUri = await this.resizeImage(imageUri);

      const base64 = await FileSystem.readAsStringAsync(resizedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`📏 Base64 length: ${base64.length} characters`);

      if (base64.length > 10485760) {
        // 10MB limit
        throw new Error("Image too large even after compression");
      }

      return base64;
    } catch (error: any) {
      console.error("Error converting to base64:", error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  // Download remote image if needed
  private async downloadRemoteImage(url: string): Promise<string> {
    try {
      if (!url.startsWith("http")) {
        return url; // Already local
      }

      console.log("📥 Downloading image:", url);
      const filename = `temp_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri);

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed: HTTP ${downloadResult.status}`);
      }

      return localUri;
    } catch (error: any) {
      console.error("Error downloading image:", error);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  // Get face token from Face++ API
  private async getFaceToken(imageUri: string): Promise<string> {
    try {
      // Download if remote URL
      const localUri = await this.downloadRemoteImage(imageUri);

      // Convert to base64
      const base64Image = await this.imageToBase64(localUri);

      const formData = new FormData();
      formData.append("api_key", FACE_API_CONFIG.API_KEY);
      formData.append("api_secret", FACE_API_CONFIG.API_SECRET);
      formData.append("image_base64", base64Image);

      const response = await fetch(`${FACE_API_CONFIG.BASE_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error_message) {
        throw new Error(result.error_message);
      }

      if (!result.faces || result.faces.length === 0) {
        throw new Error("No face detected in the image");
      }

      return result.faces[0].face_token;
    } catch (error: any) {
      console.error("Face detection error:", error);
      throw error;
    }
  }

  // Compare two face tokens
  private async compareFaceTokens(
    token1: string,
    token2: string
  ): Promise<number> {
    try {
      const formData = new FormData();
      formData.append("api_key", FACE_API_CONFIG.API_KEY);
      formData.append("api_secret", FACE_API_CONFIG.API_SECRET);
      formData.append("face_token1", token1);
      formData.append("face_token2", token2);

      const response = await fetch(`${FACE_API_CONFIG.BASE_URL}/compare`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error_message) {
        throw new Error(result.error_message);
      }

      return result.confidence;
    } catch (error: any) {
      console.error("Face comparison error:", error);
      throw error;
    }
  }

  // Main verification function
  async verifyFaces(
    capturedImageUri: string,
    referenceImageUri: string
  ): Promise<SimpleVerificationResult> {
    try {
      console.log("🔍 Starting simple face verification...");
      console.log("📸 Captured image:", capturedImageUri);
      console.log("🖼️ Reference image:", referenceImageUri);

      // Get face tokens for both images
      console.log("🔍 Detecting face in captured image...");
      const capturedToken = await this.getFaceToken(capturedImageUri);

      console.log("🔍 Detecting face in reference image...");
      const referenceToken = await this.getFaceToken(referenceImageUri);

      // Compare faces
      console.log("⚖️ Comparing faces...");
      const confidence = await this.compareFaceTokens(
        capturedToken,
        referenceToken
      );

      const verified = confidence >= FACE_API_CONFIG.CONFIDENCE_THRESHOLD;

      let message = "";
      if (verified) {
        message = `✅ Face verified with ${confidence.toFixed(1)}% confidence`;
      } else {
        message = `❌ Face verification failed. Confidence: ${confidence.toFixed(
          1
        )}%`;
      }

      console.log("🎯 Verification result:", { verified, confidence, message });

      return {
        verified,
        confidence,
        message,
      };
    } catch (error: any) {
      console.error("❌ Verification failed:", error);

      let userMessage = "Verification failed. Please try again.";

      if (error.message.includes("No face detected")) {
        userMessage =
          "No face detected. Please ensure your face is clearly visible.";
      } else if (error.message.includes("INVALID_IMAGE_SIZE")) {
        userMessage = "Image size issue. Please try taking a new photo.";
      } else if (error.message.includes("CONCURRENCY_LIMIT_EXCEEDED")) {
        userMessage = "Service is busy. Please try again in a moment.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        userMessage =
          "Network error. Please check your connection and try again.";
      }

      return {
        verified: false,
        confidence: 0,
        message: userMessage,
      };
    }
  }
}

// Export a singleton instance
export const simpleFaceVerification = new SimpleFaceVerification();

// Export the main function for easy use
export const compareSimpleFaces = async (
  capturedImageUri: string,
  referenceImageUri: string
): Promise<SimpleVerificationResult> => {
  return await simpleFaceVerification.verifyFaces(
    capturedImageUri,
    referenceImageUri
  );
};
