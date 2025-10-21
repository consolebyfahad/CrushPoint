import CustomButton from "@/components/custom_button";
import { apiCall } from "@/utils/api";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { svgIcon } from "./SvgIcons";

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
    "323137189211-bsva08l18ig45dvalqhcbs08mqrgsi4j.apps.googleusercontent.com",
  iosClientId:
    "323137189211-bsva08l18ig45dvalqhcbs08mqrgsi4j.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function SocialAuth({
  onAuthSuccess,
  onAuthError,
  isDisabled = false,
}: SocialAuthProps) {
  const { t } = useTranslation();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign out any existing user before signing in
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        // Ignore sign out errors (user might not be signed in)
      }

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { user } = response.data;

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

        const apiResponse = await apiCall(formData);

        if (apiResponse.success) {
          const userData: UserData = {
            user_id: apiResponse.user_id,
            email: apiResponse.email,
            name: apiResponse.name,
            image: apiResponse.image,
            created: apiResponse.created,
            new: apiResponse?.new,
          };

          onAuthSuccess(userData, "google");
        } else {
          onAuthError(apiResponse.message || t("auth.googleSignInFailed"));
          console.error("Google Sign-In API Error:", apiResponse.message);
        }
      } else {
        onAuthError(t("auth.googleSignInCancelled"));
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            onAuthError(t("auth.googleSignInCancelled"));
            break;
          case statusCodes.IN_PROGRESS:
            onAuthError(t("auth.googleSignInInProgress"));
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            onAuthError(t("auth.googlePlayServicesNotAvailable"));
            break;
          case "DEVELOPER_ERROR":
            onAuthError(t("auth.googleSignInConfigError"));
            console.error(
              "DEVELOPER_ERROR - Check configuration files and client IDs"
            );
            break;
          default:
            onAuthError(
              `${t("auth.googleSignInFailed")}: ${error.message || error.code}`
            );
        }
      } else {
        onAuthError(t("auth.googleSignInError"));
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
        onAuthError(t("auth.appleSignInNotAvailable"));
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        onAuthError(t("auth.appleSignInNoToken"));
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
        onAuthError(apiResponse.message || t("auth.appleSignInFailed"));
        console.error("Apple Sign-In API Error:", apiResponse.message);
      }
    } catch (error: any) {
      console.error("Apple Sign-In Error:", error);

      if (error.code === "ERR_CANCELED") {
        onAuthError(t("auth.appleSignInCancelled"));
      } else if (error.code === "ERR_INVALID_RESPONSE") {
        onAuthError(t("auth.appleSignInInvalidResponse"));
      } else if (error.code === "ERR_NOT_AVAILABLE") {
        onAuthError(t("auth.appleSignInNotAvailableDevice"));
      } else {
        onAuthError(t("auth.appleSignInTryAgain"));
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title={t("auth.continueWithApple")}
        onPress={handleAppleSignIn}
        icon={svgIcon.AppleIcon}
        variant="apple"
        isLoading={appleLoading}
        isDisabled={isDisabled || googleLoading || Platform.OS !== "ios"}
      />

      <CustomButton
        title={t("auth.continueWithGoogle")}
        onPress={handleGoogleSignIn}
        icon={svgIcon.GoogleIcon}
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
