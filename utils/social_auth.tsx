import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { AppleIcon, GoogleIcon } from "@/utils/SvgIcons";
import { apiCall } from "@/utils/api";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

// Complete the authentication session for web browsers
WebBrowser.maybeCompleteAuthSession();

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

GoogleSignin.configure({
  webClientId:
    "247710361352-tpf24aqbsl6cldmat3m6377hh27mv8mo.apps.googleusercontent.com",
  iosClientId:
    "247710361352-7dkl9r2vu65cclb0rq7s8g273kq7iobm.apps.googleusercontent.com",
  googleServicePlistPath: "../GoogleService-Info.plist",
});

export default function SocialAuth({
  onAuthSuccess,
  onAuthError,
  isDisabled = false,
}: SocialAuthProps) {
  const { showToast } = useToast();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "247710361352-7dkl9r2vu65cclb0rq7s8g273kq7iobm.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com", // You need to add this
    webClientId:
      "247710361352-tpf24aqbsl6cldmat3m6377hh27mv8mo.apps.googleusercontent.com",
  });

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleAuthSuccess(response.authentication?.accessToken);
    } else if (response?.type === "error") {
      setGoogleLoading(false);
      onAuthError("Google Sign-In failed");
    } else if (response?.type === "cancel") {
      setGoogleLoading(false);
      onAuthError("Google Sign-In was canceled");
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (accessToken?: string) => {
    if (!accessToken) {
      setGoogleLoading(false);
      onAuthError("Google Sign-In failed: No access token received");
      return;
    }

    try {
      // Fetch user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      const userInfo = await userInfoResponse.json();
      if (!userInfo.email) {
        onAuthError("Google Sign-In failed: No email received");
        return;
      }

      // Prepare data for your API
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", accessToken);
      formData.append("email", userInfo.email);
      formData.append("name", userInfo.name);
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
        onAuthError(apiResponse.message || "Google Sign-In failed");
        console.error("Google Sign-In API Error:", apiResponse.message);
      }
    } catch (error) {
      console.error("Google Auth Success Error:", error);
      onAuthError("Failed to process Google Sign-In");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!request) {
      onAuthError("Google Sign-In is not ready. Please try again.");
      return;
    }

    setGoogleLoading(true);
    if (Platform.OS === "ios") {
      try {
        await promptAsync();
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        onAuthError("Google Sign-In failed. Please try again.");
        setGoogleLoading(false);
      }
    } else {
      try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (isSuccessResponse(response)) {
          const { user } = response.data;
          console.log(user);
          console.log("user", response.data.idToken);
          const formData = new FormData();
          formData.append("type", "social_login");
          formData.append("token", response.data.idToken || "");
          formData.append("email", user?.email);
          formData.append("name", user?.name);

          const apiResponse = await apiCall(formData);
          if (apiResponse.success) {
            const userData = {
              user_id: apiResponse.user_id,
              email: apiResponse.email,
              name: apiResponse.name,
              image: apiResponse.image,
              created: apiResponse.created,
              new: apiResponse?.new,
            };

            onAuthSuccess(userData, "google");
          } else {
            showToast(apiResponse.message || "Google Sign-In failed", "error");
            console.error("Google Sign-In API Error:", apiResponse.message);
          }
        } else {
          showToast("Google sign in was cancelled", "error");
        }
      } catch (error) {
        if (isErrorWithCode(error)) {
          switch (error.code) {
            case statusCodes.IN_PROGRESS:
              showToast("Sign in already in progress", "error");
              break;
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              showToast("Google Play Services not available", "error");
              break;
            default:
              showToast("Google sign in failed", "error");
          }
        } else {
          showToast("Something went wrong with Google Sign-In", "error");
          console.error("Google Sign-In Error:", error);
        }
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        onAuthError("Apple Sign-In is not available on this device");
        return;
      }

      // Perform Apple Sign-In
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

      // Prepare user data for API
      const userData = {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName,
              familyName: credential.fullName.familyName,
            }
          : null,
        authorizationCode: credential.authorizationCode,
      };

      // API call to your backend
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("provider", "apple");
      formData.append("token", credential.identityToken);
      formData.append("user_data", JSON.stringify(userData));

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
        // User canceled the sign-in, don't show an error
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

  const isLoading = appleLoading || googleLoading;

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
        isDisabled={isDisabled || appleLoading || !request}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
