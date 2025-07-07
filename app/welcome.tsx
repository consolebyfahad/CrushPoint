import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { AnimatedLogo } from "@/utils//animations";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { AppleIcon, EmailIcon, GoogleIcon, PhoneIcon } from "@/utils/SvgIcons";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "247710361352-tpf24aqbsl6cldmat3m6377hh27mv8mo.apps.googleusercontent.com",
  iosClientId:
    "247710361352-7dkl9r2vu65cclb0rq7s8g273kq7iobm.apps.googleusercontent.com",
  googleServicePlistPath: "../GoogleService-Info.plist",
});

export default function Welcome() {
  const { setUser } = useAppContext();
  const { showToast } = useToast();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const handleAppleSignIn = async () => {
    // Check if Apple Sign-In is available (iOS 13+)
    if (!appleAuth.isSupported) {
      showToast("Apple Sign-In is not supported on this device", "error");
      return;
    }

    setAppleLoading(true);
    try {
      // Perform the Apple Sign-In request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce, user, email, fullName } =
        appleAuthRequestResponse;

      // Check if we have the required data
      if (!identityToken) {
        showToast("Apple Sign-In failed: No identity token received", "error");
        return;
      }

      // Construct user data for API
      const userData = {
        id: user,
        email: email,
        name: fullName
          ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
          : "",
        identityToken,
        nonce,
      };

      // Send to your backend
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("provider", "apple");
      formData.append("token", identityToken);
      formData.append("user_data", JSON.stringify(userData));

      const apiResponse = await apiCall(formData);

      if (apiResponse.success) {
        const userInfo = {
          user_id: apiResponse.user_id,
          email: apiResponse.email,
          name: apiResponse.name,
          image: apiResponse.image,
          created: apiResponse.created,
          new: apiResponse?.new,
        };

        setUser(userInfo);

        router.push({
          pathname: "/auth/verify",
          params: {
            type: "apple account",
            contact: "apple account",
          },
        });
      } else {
        showToast(apiResponse.message || "Apple Sign-In failed", "error");
        console.error("Apple Sign-In API Error:", apiResponse.message);
      }
    } catch (error: any) {
      console.error("Apple Sign-In Error:", error);

      if (error.code === appleAuth.Error.CANCELED) {
        showToast("Apple Sign-In was cancelled", "error");
      } else if (error.code === appleAuth.Error.FAILED) {
        showToast("Apple Sign-In failed", "error");
      } else if (error.code === appleAuth.Error.INVALID_RESPONSE) {
        showToast("Invalid response from Apple", "error");
      } else if (error.code === appleAuth.Error.NOT_HANDLED) {
        showToast("Apple Sign-In not handled", "error");
      } else if (error.code === appleAuth.Error.UNKNOWN) {
        showToast("Unknown Apple Sign-In error", "error");
      } else {
        showToast("Something went wrong with Apple Sign-In", "error");
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("first");

      if (isSuccessResponse(response)) {
        const { user } = response.data;

        // Send the actual Google ID token to your backend
        const formData = new FormData();
        formData.append("type", "social_login");
        // formData.append("provider", "google");
        formData.append("token", response.data.idToken || "");
        formData.append("user_data", user.email);

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

          setUser(userData);

          router.push({
            pathname: "/auth/verify",
            params: {
              type: "google account",
              contact: "google account",
            },
          });
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
  };

  const handlePhoneSignUp = () => {
    router.push({
      pathname: "/auth/login",
      params: { tab: "phone" },
    });
  };

  const handleEmailSignUp = () => {
    router.push({
      pathname: "/auth/login",
      params: { tab: "email" },
    });
  };

  const handleLogin = () => {
    router.push("/auth/login?tab=phone");
  };

  const isLoading = appleLoading || googleLoading;

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logo}>
            <AnimatedLogo />
          </View>
          <Text style={styles.appName}>CrushPoint</Text>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Choose your preferred sign up method
            </Text>

            <View style={styles.buttonContainer}>
              {/* Show Apple Sign-In only on iOS */}
              {Platform.OS === "ios" && appleAuth.isSupported && (
                <CustomButton
                  title="Continue with Apple"
                  onPress={handleAppleSignIn}
                  icon={<AppleIcon />}
                  variant="secondary"
                  isLoading={appleLoading}
                  isDisabled={googleLoading}
                />
              )}

              <CustomButton
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                icon={<GoogleIcon />}
                variant="secondary"
                isLoading={googleLoading}
                isDisabled={appleLoading}
              />

              <CustomButton
                title="Continue with Phone"
                onPress={handlePhoneSignUp}
                icon={<PhoneIcon />}
                variant="secondary"
                isDisabled={isLoading}
              />

              <CustomButton
                title="Continue with Email"
                onPress={handleEmailSignUp}
                icon={<EmailIcon />}
                variant="secondary"
                isDisabled={isLoading}
              />
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.termsText}>
            By signing up, you agree to our{" "}
            <Text style={styles.linkText}>Terms</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: color.white,
    justifyContent: "space-between",
  },
  topSection: {
    marginTop: 80,
  },
  logo: {
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: font.semiBold,
    color: color.black,
    textAlign: "center",
    marginTop: 4,
  },
  contentContainer: {
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.gray14,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 16,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  termsText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray69,
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: 0.9,
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
