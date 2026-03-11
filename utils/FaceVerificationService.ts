
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import i18n from "i18next";

const FACE_API_CONFIG = {
  API_KEY: "wUMEkbH38iXACQKJsN8wZOAHTvtHMZgX",
  API_SECRET: "OOHILkIIpuLWKV8qZAurWirLquB0k8gG",
  BASE_URL: "https://api-us.faceplusplus.com/facepp/v3",  

  CONFIDENCE_THRESHOLD: 80,  
};

interface SimpleVerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
}

class SimpleFaceVerification {
  
  private async resizeImage(imageUri: string): Promise<string> {
    try {

      const manipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 600 } }],  
        {
          compress: 0.7,  
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileInfo = await FileSystem.getInfoAsync(manipulatorResult.uri);
      if (!fileInfo.exists || typeof fileInfo.size !== "number") {
        throw new Error("Resized image file not found or size unknown");
      }
      const fileSizeInMB = fileInfo.size / (1024 * 1024);

      return manipulatorResult.uri;
    } catch (error: any) {

      throw new Error(`Failed to resize image: ${error.message}`);
    }
  }

  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      
      const resizedUri = await this.resizeImage(imageUri);

      const base64 = await FileSystem.readAsStringAsync(resizedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (base64.length > 10485760) {
        
        throw new Error("Image too large even after compression");
      }

      return base64;
    } catch (error: any) {

      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  private async downloadRemoteImage(url: string): Promise<string> {
    try {
      if (!url.startsWith("http")) {
        return url;  
      }

      const filename = `temp_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri);

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed: HTTP ${downloadResult.status}`);
      }

      return localUri;
    } catch (error: any) {

      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  private async getFaceToken(imageUri: string): Promise<string> {
    try {
      
      const localUri = await this.downloadRemoteImage(imageUri);

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

      throw error;
    }
  }

  private async compareFaceTokens(
    token1: string,
    token2: string,
    retryCount: number = 0
  ): Promise<number> {
    const maxRetries = 3;
    const retryDelay = 2000;  

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

      throw error;
    }
  }

  async verifyFaces(
    capturedImageUri: string,
    referenceImageUri: string
  ): Promise<SimpleVerificationResult> {
    try {

      if (!capturedImageUri || !referenceImageUri) {
        throw new Error("Both captured and reference images are required");
      }

      const capturedToken = await this.getFaceToken(capturedImageUri);

      const referenceToken = await this.getFaceToken(referenceImageUri);

      const confidence = await this.compareFaceTokens(
        capturedToken,
        referenceToken
      );

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

      let userMessage = "Verification failed. Please try again.";

      if (error.message.includes("No face detected")) {
        userMessage = i18n.t("faceVerification.noFaceDetected");
          
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

export const simpleFaceVerification = new SimpleFaceVerification();

export const compareSimpleFaces = async (
  capturedImageUri: string,
  referenceImageUri: string
): Promise<SimpleVerificationResult> => {
  return await simpleFaceVerification.verifyFaces(
    capturedImageUri,
    referenceImageUri
  );
};
