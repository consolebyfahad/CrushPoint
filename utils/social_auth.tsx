import CustomButton from "@/components/custom_button";
import { apiCall } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  onAuthSuccess: (
    userData: any,
    provider: "apple" | "google"
  ) => void | Promise<void>;
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
    "323137189211-jqjki7ji9ap6hc4puj1ielaqjei9odut.apps.googleusercontent.com", 
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
console.log("response for google sign in", JSON.stringify(response));
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

          await onAuthSuccess(userData, "google");
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

  // Helper function to decode JWT and extract email
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
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
      console.log("credential for apple sign in", JSON.stringify(credential));
      
      if (!credential.identityToken) {
        onAuthError(t("auth.appleSignInNoToken"));
        return;
      }

      // Extract email from JWT token if credential.email is null
      // Apple only provides email in credential on first sign-in, but it's always in the JWT
      let email = credential.email ?? "";
      if (!email && credential.identityToken) {
        const decodedToken = decodeJWT(credential.identityToken);
        if (decodedToken?.email) {
          email = decodedToken.email;
          console.log("Extracted email from JWT:", email);
        }
      }

      // Get name from credential (only available on first sign-in)
      let name = "";
      if (credential.fullName) {
        name = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(" ");
      }

      // If name is not available, try to get it from AsyncStorage (stored from first login)
      if (!name && credential.user) {
        const storedName = await AsyncStorage.getItem(`apple_name_${credential.user}`);
        if (storedName) {
          name = storedName;
          console.log("Retrieved name from storage:", name);
        }
      }

      // API call to your backend
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", credential.user);
      formData.append("email", email);
      formData.append("name", name);
      console.log("formData for apple sign in", formData);
      
      const apiResponse = await apiCall(formData);
      console.log("apiResponse for apple sign in", JSON.stringify(apiResponse));

      if (apiResponse.success) {
        // Store name in AsyncStorage if we got it (for future logins)
        // This persists even after logout since it uses a different key than @AppContext
        const finalName = apiResponse.name || name;
        if (finalName && credential.user) {
          await AsyncStorage.setItem(`apple_name_${credential.user}`, finalName);
          console.log("Stored name for future logins:", finalName);
        }

        const userInfo: UserData = {
          user_id: apiResponse.user_id,
          email: apiResponse.email,
          name: apiResponse.name,
          image: apiResponse.image,
          created: apiResponse.created,
          new: apiResponse?.new,
        };

        await onAuthSuccess(userInfo, "apple");
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
