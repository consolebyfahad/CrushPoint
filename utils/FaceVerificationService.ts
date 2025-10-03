// SimpleFaceVerification.ts
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const FACE_API_CONFIG = {
  API_KEY: "wUMEkbH38iXACQKJsN8wZOAHTvtHMZgX",
  API_SECRET: "OOHILkIIpuLWKV8qZAurWirLquB0k8gG",
  BASE_URL: "https://api-us.faceplusplus.com/facepp/v3", // US Region (current)
  // BASE_URL: "https://api-ap.faceplusplus.com/facepp/v3", // Asia-Pacific Region
  // BASE_URL: "https://api-cn.faceplusplus.com/facepp/v3", // China Region
  CONFIDENCE_THRESHOLD: 80, // Increased threshold for better accuracy
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


      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);

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

  // Compare two face tokens with retry logic for concurrency limits
  private async compareFaceTokens(
    token1: string,
    token2: string,
    retryCount: number = 0
  ): Promise<number> {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

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

      const responseText = await response.text();

      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        
        // Handle concurrency limit with retry
        if (errorData.error_message === "CONCURRENCY_LIMIT_EXCEEDED" && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return this.compareFaceTokens(token1, token2, retryCount + 1);
        }
        
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);

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

      // Validate input parameters
      if (!capturedImageUri || !referenceImageUri) {
        throw new Error("Both captured and reference images are required");
      }

      // Get face tokens for both images
      const capturedToken = await this.getFaceToken(capturedImageUri);

      const referenceToken = await this.getFaceToken(referenceImageUri);

      // Compare faces
      const confidence = await this.compareFaceTokens(
        capturedToken,
        referenceToken
      );

      // Validate confidence score
      if (typeof confidence !== 'number' || confidence < 0 || confidence > 100) {
        throw new Error("Invalid confidence score received from Face++ API");
      }

      const verified = confidence >= FACE_API_CONFIG.CONFIDENCE_THRESHOLD;

      let message = "";
      if (verified) {
        message = `✅ Identity verification completed! Confidence: ${confidence.toFixed(1)}%`;
      } else {
        message = `❌ Face verification failed. Confidence: ${confidence.toFixed(
          1
        )}% (Required: ${FACE_API_CONFIG.CONFIDENCE_THRESHOLD}%). Please try again with better lighting and ensure your face is clearly visible.`;
      }


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
          "No face detected. Please ensure your face is clearly visible and centered in the frame.";
      } else if (error.message.includes("INVALID_IMAGE_SIZE")) {
        userMessage = "Image size issue. Please try taking a new photo with better quality.";
      } else if (error.message.includes("CONCURRENCY_LIMIT_EXCEEDED")) {
        userMessage = "Service is busy due to free tier limits. Please wait a moment and try again, or consider upgrading to a paid plan for better performance.";
      } else if (error.message.includes("INVALID_API_KEY") || error.message.includes("AUTHENTICATION_FAILED")) {
        userMessage = "Service configuration error. Please contact support.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        userMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("RATE_LIMIT_EXCEEDED")) {
        userMessage = "Too many requests. Please wait a moment before trying again.";
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
