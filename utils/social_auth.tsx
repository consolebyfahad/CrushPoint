import CustomButton from "@/components/custom_button";
import { AppleIcon, GoogleIcon } from "@/utils/SvgIcons";
import { apiCall } from "@/utils/api";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

interface SocialAuthProps {
  onAuthSuccess: (userData: any, provider: "apple" | "google") => void;
  onAuthError: (message: string) => void;
  isDisabled?: boolean;
}

interface UserData {
  user_id: string;
  email: string;
  name: string;
  image?: string;
  created: string;
  new?: boolean;
}

// Configure Google Sign-In once
GoogleSignin.configure({
  webClientId:
    "247710361352-tpf24aqbsl6cldmat3m6377hh27mv8mo.apps.googleusercontent.com",
  iosClientId:
    "247710361352-4783hk46dnrgqqj6rtqel6nl8q5i3rhp.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function SocialAuth({
  onAuthSuccess,
  onAuthError,
  isDisabled = false,
}: SocialAuthProps) {
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      console.log("Starting Google Sign-In process...");

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      console.log("Google Play Services available");

      // Sign out any existing user before signing in
      try {
        await GoogleSignin.signOut();
        console.log("Signed out existing user");
      } catch (signOutError) {
        // Ignore sign out errors (user might not be signed in)
        console.log("No existing session to sign out");
      }

      console.log("Attempting Google Sign-In...");
      const response = await GoogleSignin.signIn();
      console.log("Google Sign-In response:", response);

      if (isSuccessResponse(response)) {
        const { user } = response.data;
        console.log("Google Sign-In successful, user data:", user);

        // Prepare data for your API
        const formData = new FormData();
        formData.append("type", "social_login");
        formData.append("token", response.data.idToken || "");
        formData.append("email", user?.email ?? "");
        formData.append("name", user?.name ?? "");

        // Optional: add user photo
        if (user?.photo) {
          formData.append("image", user.photo);
        }

        console.log("Sending data to API...");
        const apiResponse = await apiCall(formData);
        console.log("API Response:", apiResponse);

        if (apiResponse.success) {
          const userData: UserData = {
            user_id: apiResponse.user_id,
            email: apiResponse.email,
            name: apiResponse.name,
            image: apiResponse.image,
            created: apiResponse.created,
            new: apiResponse?.new,
          };

          console.log("Google Sign-In completed successfully");
          onAuthSuccess(userData, "google");
        } else {
          onAuthError(apiResponse.message || "Google Sign-In failed");
          console.error("Google Sign-In API Error:", apiResponse.message);
        }
      } else {
        console.log("Google Sign-In was cancelled or failed");
        onAuthError("Google sign in was cancelled");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            onAuthError("Google sign in was cancelled");
            break;
          case statusCodes.IN_PROGRESS:
            onAuthError("Sign in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            onAuthError("Google Play Services not available");
            break;
          case "DEVELOPER_ERROR":
            onAuthError(
              "Configuration error. Please check Google Sign-In setup."
            );
            console.error(
              "DEVELOPER_ERROR - Check configuration files and client IDs"
            );
            break;
          default:
            onAuthError(
              `Google sign in failed: ${error.message || error.code}`
            );
        }
      } else {
        onAuthError("Something went wrong with Google Sign-In");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        onAuthError("Apple Sign-In is not available on this device");
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        onAuthError("Apple Sign-In failed: No identity token received");
        return;
      }
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(" ")
        : "";
      // API call to your backend
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", credential.identityToken);
      formData.append("email", credential.email ?? "");
      formData.append("name", name);

      const apiResponse = await apiCall(formData);

      if (apiResponse.success) {
        const userInfo: UserData = {
          user_id: apiResponse.user_id,
          email: apiResponse.email,
          name: apiResponse.name,
          image: apiResponse.image,
          created: apiResponse.created,
          new: apiResponse?.new,
        };

        onAuthSuccess(userInfo, "apple");
      } else {
        onAuthError(apiResponse.message || "Apple Sign-In failed");
        console.error("Apple Sign-In API Error:", apiResponse.message);
      }
    } catch (error: any) {
      console.error("Apple Sign-In Error:", error);

      if (error.code === "ERR_CANCELED") {
        onAuthError("Apple Sign-In was canceled");
      } else if (error.code === "ERR_INVALID_RESPONSE") {
        onAuthError("Apple Sign-In failed: Invalid response");
      } else if (error.code === "ERR_NOT_AVAILABLE") {
        onAuthError("Apple Sign-In is not available");
      } else {
        onAuthError("Apple Sign-In failed. Please try again.");
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title="Continue with Apple"
        onPress={handleAppleSignIn}
        icon={<AppleIcon />}
        variant="secondary"
        isLoading={appleLoading}
        isDisabled={isDisabled || googleLoading || Platform.OS !== "ios"}
      />

      <CustomButton
        title="Continue with Google"
        onPress={handleGoogleSignIn}
        icon={<GoogleIcon />}
        variant="secondary"
        isLoading={googleLoading}
        isDisabled={isDisabled || appleLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
