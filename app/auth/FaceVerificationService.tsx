// services/FaceVerificationService.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
// Interface definitions
interface FaceVerificationOptions {
  confidenceThreshold?: number;
  cacheEnabled?: boolean;
  maxRetries?: number;
}

interface VerificationOptions {
  cacheKey?: string;
  skipQualityCheck?: boolean;
  requireHighConfidence?: boolean;
}

interface FaceQuality {
  overall: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface FaceTokenData {
  token: string;
  attributes: any;
  quality: FaceQuality;
  landmarks: any;
  rectangle: any;
}

interface ComparisonResult {
  confidence: number;
  thresholds: any;
  isMatch: boolean;
  matchLevel: string;
  analysis: ConfidenceAnalysis;
}

interface ConfidenceAnalysis {
  level: string;
  description: string;
  recommendation: string;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  matchLevel: string;
  analysis: ConfidenceAnalysis;
  capturedFaceQuality: FaceQuality;
  processingTime: number;
  thresholds: any;
  timestamp: string;
}

interface CachedToken {
  token: string;
  timestamp: number;
}

interface CustomError extends Error {
  processingTime?: number;
  userFriendlyMessage?: string;
}

export class FaceVerificationService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private confidenceThreshold: number;
  private cacheEnabled: boolean;
  private maxRetries: number;

  constructor(
    apiKey: string,
    apiSecret: string,
    options: FaceVerificationOptions = {}
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = "https://api-us.faceplusplus.com/facepp/v3";
    this.confidenceThreshold = options.confidenceThreshold || 75;
    this.cacheEnabled = options.cacheEnabled !== false;
    this.maxRetries = options.maxRetries || 2;
  }

  // Rate limiting
  static rateLimiter = {
    lastRequest: 0,
    minInterval: 1000, // 1 second between requests

    async throttle(): Promise<void> {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }

      this.lastRequest = Date.now();
    },
  };

  // Check if a string is an HTTPS URL
  private isHttpsUrl(url: string): boolean {
    return url.startsWith("https://") || url.startsWith("http://");
  }

  // Download remote image to local file
  async downloadImageToLocal(remoteUrl: string): Promise<string> {
    try {
      console.log("📥 Downloading remote image:", remoteUrl);

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `remote_image_${timestamp}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      // Check cache first
      if (this.cacheEnabled) {
        const cachedUri = await AsyncStorage.getItem(
          `remote_image_${remoteUrl}`
        );
        if (cachedUri) {
          const fileInfo = await FileSystem.getInfoAsync(cachedUri);
          if (fileInfo.exists) {
            console.log("⚡ Using cached remote image");
            return cachedUri;
          }
        }
      }

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(
        remoteUrl,
        localUri
      );

      if (downloadResult.status !== 200) {
        throw new Error(
          `Failed to download image: HTTP ${downloadResult.status}`
        );
      }

      // Verify the file was downloaded
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        throw new Error("Downloaded file not found");
      }

      // Cache the local URI
      if (this.cacheEnabled) {
        await AsyncStorage.setItem(`remote_image_${remoteUrl}`, localUri);
      }

      console.log("✅ Image downloaded successfully to:", localUri);
      return localUri;
    } catch (error: any) {
      console.error("Error downloading remote image:", error);
      throw new Error(`Failed to download remote image: ${error.message}`);
    }
  }

  // Convert image to base64 with validation and compression
  async imageToBase64(imageUri: string): Promise<string> {
    try {
      // If it's a remote URL, download it first
      let localUri = imageUri;
      if (this.isHttpsUrl(imageUri)) {
        localUri = await this.downloadImageToLocal(imageUri);
      }

      // Validate file exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        throw new Error("Image file not found");
      }

      let processedUri = localUri;
      const fileSizeInMB = fileInfo.size / (1024 * 1024);

      // If image is too large, compress it
      if (fileSizeInMB > 2) {
        console.log(
          `📦 Compressing image from ${fileSizeInMB.toFixed(2)}MB...`
        );

        const manipulatorResult = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: 1024 } }], // Resize to max width of 1024px
          {
            compress: 0.7, // 70% quality
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        processedUri = manipulatorResult.uri;

        // Check new size
        const newFileInfo = await FileSystem.getInfoAsync(processedUri);
        if (!newFileInfo.exists) {
          throw new Error("Compressed file not found");
        }
        const newSizeInMB = newFileInfo.size / (1024 * 1024);
        console.log(`✅ Image compressed to ${newSizeInMB.toFixed(2)}MB`);
      }

      const base64 = await FileSystem.readAsStringAsync(processedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return base64;
    } catch (error: any) {
      console.error("Error converting image to base64:", error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  // Prepare asset-based reference image
  async prepareAssetImage(assetModule: any): Promise<string> {
    try {
      const cacheKey = `asset_${Date.now()}`;
      const filename = `${cacheKey}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Check if we have a cached version
      if (this.cacheEnabled) {
        const cachedUri = await AsyncStorage.getItem(
          `asset_uri_${assetModule}`
        );
        if (cachedUri) {
          const fileInfo = await FileSystem.getInfoAsync(cachedUri);
          if (fileInfo.exists) {
            return cachedUri;
          }
        }
      }

      // Load and copy asset
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();

      await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: fileUri,
      });

      // Cache the URI
      if (this.cacheEnabled) {
        await AsyncStorage.setItem(`asset_uri_${assetModule}`, fileUri);
      }

      return fileUri;
    } catch (error: any) {
      console.error("Error preparing asset image:", error);
      throw new Error(`Failed to prepare reference image: ${error.message}`);
    }
  }

  // Get face token with retry logic
  async getFaceToken(
    imageUri: string,
    retries: number = this.maxRetries
  ): Promise<FaceTokenData> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await FaceVerificationService.rateLimiter.throttle();

        const base64Image = await this.imageToBase64(imageUri);

        const formData = new FormData();
        formData.append("api_key", this.apiKey);
        formData.append("api_secret", this.apiSecret);
        formData.append("image_base64", base64Image);
        formData.append("return_landmark", "1");
        formData.append(
          "return_attributes",
          "age,gender,emotion,facequality,eyestatus"
        );

        const response = await fetch(`${this.baseUrl}/detect`, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        const result = await response.json();

        if (result.error_message) {
          throw new Error(result.error_message);
        }

        if (!result.faces || result.faces.length === 0) {
          throw new Error("No face detected in the image");
        }

        const face = result.faces[0];

        return {
          token: face.face_token,
          attributes: face.attributes,
          quality: this.assessFaceQuality(face),
          landmarks: face.landmark,
          rectangle: face.face_rectangle,
        };
      } catch (error: any) {
        console.log(`Face detection attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          throw new Error(
            `Face detection failed after ${retries} attempts: ${error.message}`
          );
        }

        // Wait before retry (exponential backoff)
        await new Promise<void>((resolve) =>
          setTimeout(resolve, attempt * 1000)
        );
      }
    }

    // This should never be reached due to the throw in the catch block
    throw new Error("Unexpected error in face detection");
  }

  // Assess face quality and provide recommendations
  assessFaceQuality(faceData: any): FaceQuality {
    const quality: FaceQuality = {
      overall: "Good",
      score: 100,
      issues: [],
      recommendations: [],
    };

    if (faceData.attributes) {
      const { facequality, eyestatus, emotion } = faceData.attributes;

      // Check face quality score
      if (facequality && facequality.value < 70) {
        quality.score = facequality.value;
        quality.overall = facequality.value < 50 ? "Poor" : "Fair";
        quality.issues.push("Low image quality detected");
        quality.recommendations.push("Use better lighting and camera quality");
      }

      // Check eye status
      if (eyestatus) {
        const leftEyeOpen = eyestatus.left_eye_status?.no_glass_eye_open || 0;
        const rightEyeOpen = eyestatus.right_eye_status?.no_glass_eye_open || 0;

        if (leftEyeOpen < 0.8 || rightEyeOpen < 0.8) {
          quality.issues.push("Eyes not clearly visible");
          quality.recommendations.push("Ensure both eyes are open and visible");
          quality.score = Math.min(quality.score, 70);
        }
      }

      // Check if person is smiling (might affect recognition)
      if (emotion && emotion.happiness > 90) {
        quality.recommendations.push(
          "Try a neutral expression for better recognition"
        );
      }
    }

    return quality;
  }

  // Compare face tokens with detailed analysis
  async compareFaceTokens(
    token1: string,
    token2: string
  ): Promise<ComparisonResult> {
    try {
      await FaceVerificationService.rateLimiter.throttle();

      const formData = new FormData();
      formData.append("api_key", this.apiKey);
      formData.append("api_secret", this.apiSecret);
      formData.append("face_token1", token1);
      formData.append("face_token2", token2);

      const response = await fetch(`${this.baseUrl}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();

      if (result.error_message) {
        throw new Error(result.error_message);
      }

      return {
        confidence: result.confidence,
        thresholds: result.thresholds,
        isMatch: result.confidence >= this.confidenceThreshold,
        matchLevel: this.getMatchLevel(result.confidence),
        analysis: this.analyzeConfidence(result.confidence),
      };
    } catch (error: any) {
      console.error("Face comparison error:", error);
      throw new Error(`Face comparison failed: ${error.message}`);
    }
  }

  // Get match level description
  getMatchLevel(confidence: number): string {
    if (confidence >= 90) return "Very Strong Match";
    if (confidence >= 80) return "Strong Match";
    if (confidence >= 70) return "Good Match";
    if (confidence >= 60) return "Weak Match";
    return "No Match";
  }

  // Analyze confidence score
  analyzeConfidence(confidence: number): ConfidenceAnalysis {
    if (confidence >= 90) {
      return {
        level: "Excellent",
        description: "Extremely likely to be the same person",
        recommendation: "High confidence verification",
      };
    } else if (confidence >= 80) {
      return {
        level: "Very Good",
        description: "Very likely to be the same person",
        recommendation: "Reliable verification",
      };
    } else if (confidence >= 70) {
      return {
        level: "Good",
        description: "Likely to be the same person",
        recommendation: "Acceptable verification",
      };
    } else if (confidence >= 60) {
      return {
        level: "Fair",
        description: "Possibly the same person",
        recommendation: "Consider retaking photo",
      };
    } else {
      return {
        level: "Poor",
        description: "Unlikely to be the same person",
        recommendation: "Verification failed - retake required",
      };
    }
  }

  // Cache management
  async cacheReferenceToken(key: string, token: string): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      await AsyncStorage.setItem(
        `face_token_${key}`,
        JSON.stringify({
          token,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error caching face token:", error);
    }
  }

  async getCachedReferenceToken(
    key: string,
    maxAge: number = 24 * 60 * 60 * 1000
  ): Promise<string | null> {
    // 24 hours
    if (!this.cacheEnabled) return null;

    try {
      const cached = await AsyncStorage.getItem(`face_token_${key}`);
      if (!cached) return null;

      const { token, timestamp }: CachedToken = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(`face_token_${key}`);
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error retrieving cached face token:", error);
      return null;
    }
  }

  // Complete verification workflow
  async verifyFaces(
    capturedImageUri: string,
    referenceImageSource: string | any,
    options: VerificationOptions = {}
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    const {
      cacheKey = "default_reference",
      skipQualityCheck = false,
      requireHighConfidence = false,
    } = options;

    try {
      console.log("🔍 Starting face verification workflow...");

      // Step 1: Get captured face token
      console.log("📸 Analyzing captured image...");
      const capturedFaceData = await this.getFaceToken(capturedImageUri);

      if (!skipQualityCheck && capturedFaceData.quality.overall === "Poor") {
        throw new Error(
          `Poor image quality: ${capturedFaceData.quality.issues.join(", ")}`
        );
      }

      // Step 2: Get reference face token (with caching)
      let referenceFaceToken = await this.getCachedReferenceToken(cacheKey);

      if (!referenceFaceToken) {
        console.log("🔄 Processing reference image...");

        let referenceImageUri: string;
        if (typeof referenceImageSource === "string") {
          // Could be a local file URI or HTTPS URL
          referenceImageUri = referenceImageSource;
        } else {
          // Asset module - need to prepare it
          referenceImageUri = await this.prepareAssetImage(
            referenceImageSource
          );
        }

        const referenceFaceData = await this.getFaceToken(referenceImageUri);
        referenceFaceToken = referenceFaceData.token;

        // Cache for future use
        await this.cacheReferenceToken(cacheKey, referenceFaceToken);
      } else {
        console.log("⚡ Using cached reference token");
      }

      // Step 3: Compare faces
      console.log("🔀 Comparing faces...");
      const comparisonResult = await this.compareFaceTokens(
        capturedFaceData.token,
        referenceFaceToken
      );

      // Step 4: Apply additional validation if required
      if (requireHighConfidence && comparisonResult.confidence < 85) {
        comparisonResult.isMatch = false;
        comparisonResult.analysis.recommendation =
          "High confidence required - verification failed";
      }

      const processingTime = Date.now() - startTime;

      const result: VerificationResult = {
        verified: comparisonResult.isMatch,
        confidence: comparisonResult.confidence,
        matchLevel: comparisonResult.matchLevel,
        analysis: comparisonResult.analysis,
        capturedFaceQuality: capturedFaceData.quality,
        processingTime,
        thresholds: comparisonResult.thresholds,
        timestamp: new Date().toISOString(),
      };

      console.log("✅ Verification completed:", {
        verified: result.verified,
        confidence: result.confidence,
        processingTime: `${processingTime}ms`,
      });

      return result;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error("❌ Verification failed:", error.message);

      const customError: CustomError = new Error(error.message);
      customError.processingTime = processingTime;
      customError.userFriendlyMessage = this.getUserFriendlyErrorMessage(
        error.message
      );

      throw customError;
    }
  }

  // Convert technical errors to user-friendly messages
  getUserFriendlyErrorMessage(errorMessage: string): string {
    const errorMappings: Record<string, string> = {
      "No face detected":
        "Please ensure your face is clearly visible in the image.",
      INVALID_API_KEY: "Service configuration error. Please contact support.",
      CONCURRENCY_LIMIT_EXCEEDED:
        "Service is busy. Please try again in a moment.",
      "Poor image quality":
        "Image quality is too low. Please take a clearer photo.",
      "Image too large": "Image file is too large. Please use a smaller image.",
      "Failed to download":
        "Unable to access reference image. Please try again.",
      network: "Network connection error. Please check your internet.",
      timeout: "Request timed out. Please try again.",
    };

    for (const [key, message] of Object.entries(errorMappings)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    return "Verification failed. Please try again.";
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const faceKeys = keys.filter(
        (key) =>
          key.startsWith("face_token_") ||
          key.startsWith("asset_uri_") ||
          key.startsWith("remote_image_")
      );

      if (faceKeys.length > 0) {
        await AsyncStorage.multiRemove(faceKeys);
        console.log(`Cleared ${faceKeys.length} cached items`);
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}

// Singleton instance for easy usage
let globalFaceService: FaceVerificationService | null = null;

export const createFaceVerificationService = (
  apiKey: string,
  apiSecret: string,
  options: FaceVerificationOptions = {}
): FaceVerificationService => {
  return new FaceVerificationService(apiKey, apiSecret, options);
};

export const getGlobalFaceService = (): FaceVerificationService => {
  if (!globalFaceService) {
    throw new Error(
      "Face verification service not initialized. Call initGlobalFaceService first."
    );
  }
  return globalFaceService;
};

export const initGlobalFaceService = (
  apiKey: string,
  apiSecret: string,
  options: FaceVerificationOptions = {}
): FaceVerificationService => {
  globalFaceService = new FaceVerificationService(apiKey, apiSecret, options);
  return globalFaceService;
};

// Quick verification function
export const quickVerify = async (
  capturedImageUri: string,
  referenceImageSource: string | any,
  apiKey: string,
  apiSecret: string
): Promise<VerificationResult> => {
  const service = createFaceVerificationService(apiKey, apiSecret);
  return await service.verifyFaces(capturedImageUri, referenceImageSource);
};

export default FaceVerificationService;
