import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import {
  calculateAge,
  convertNationalityValuesToLabels,
  parseInterestsWithNames,
  parseJsonString,
  parseLookingForWithLabels,
  parseNationalityWithLabels,
} from "@/utils/helper";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Verify() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, loginUser, updateUserData, checkVerificationStatus } =
    useAppContext();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const rawContactType = params.type || "phone";
  const contactType = t(`auth.${rawContactType}`);
  const contactInfo = params.contact || "+155 (500) 000-00";
  const [isVerifying, setIsVerifying] = useState(false);

  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchUserProfile = async () => {
    if (!user?.user_id) return;

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "users");
      formData.append("id", user.user_id);

      const response = await apiCall(formData);
      if (response.data && response.data.length > 0) {
        const userData = response.data[0];
        let photos: string[] = [];

        // Parse images
        if (userData.images) {
          try {
            const cleanedImagesString = userData.images
              .replace(/\\\\/g, "\\")
              .replace(/\\\"/g, '"');
            const imageFilenames = JSON.parse(cleanedImagesString);
            const baseImageUrl = userData.image_url || "";

            if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
              photos = imageFilenames.map((filename: string) => {
                const cleanFilename = filename.replace(/\\/g, "");
                return `${baseImageUrl}${cleanFilename}`;
              });
            } else {
              photos = [defaultPhoto];
            }
          } catch (error) {
            console.error("Error parsing images:", error);
            photos = [defaultPhoto];
          }
        } else {
          photos = [defaultPhoto];
        }

        const age = calculateAge(userData.dob);

        // Parse interests
        let parsedInterests: string[] = [];
        let originalInterestIds: string[] = [];
        if (userData.interests) {
          try {
            parsedInterests = parseInterestsWithNames(userData.interests);
            originalInterestIds = parseJsonString(userData.interests);
          } catch (error) {
            console.warn("Error parsing interests:", error);
          }
        }

        // Parse looking_for
        let parsedLookingFor: string[] = [];
        let originalLookingForIds: string[] = [];
        if (userData.looking_for) {
          try {
            parsedLookingFor = parseLookingForWithLabels(userData.looking_for);
            originalLookingForIds = parseJsonString(userData.looking_for);
          } catch (error) {
            console.warn("Error parsing looking_for:", error);
          }
        }

        // Parse nationality
        let parsedNationality: string[] = [];
        let originalNationalityValues: string[] = [];
        if (userData.nationality) {
          if (
            userData.nationality.startsWith("[") &&
            userData.nationality.endsWith("]")
          ) {
            try {
              const parsed = parseJsonString(userData.nationality);
              if (Array.isArray(parsed) && parsed.length > 0) {
                originalNationalityValues = parsed;
                parsedNationality = parseNationalityWithLabels(
                  userData.nationality
                );
              }
            } catch (error) {
              console.warn("Error parsing nationality:", error);
            }
          } else if (
            userData.nationality !== "Not Specified" &&
            userData.nationality.trim() !== ""
          ) {
            originalNationalityValues = [userData.nationality];
            parsedNationality = convertNationalityValuesToLabels([
              userData.nationality,
            ]);
          }
        }

        // Update context with fetched profile data
        const contextUserData = {
          ...userData,
          images: userData.images ? [userData.images] : [],
          looking_for: userData.looking_for
            ? parseJsonString(userData.looking_for)
            : [],
          radius: parseInt(userData.radius) || 100,
          lat: parseFloat(userData.lat) || 0,
          lng: parseFloat(userData.lng) || 0,
          age,
          photos,
          parsedInterests,
          parsedLookingFor,
          originalLookingForIds,
          originalInterestIds,
          parsedNationality,
          originalNationalityValues,
          email: userData.email || "",
          gender: userData.gender || "",
          gender_interest: userData.gender_interest || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          languages: userData.languages || "",
          height: userData.height !== "0" ? userData.height : "",
          nationality: userData.nationality || "",
          religion: userData.religion || "",
          zodiac: userData.zodiac || "",
          about: userData.about || "",
          phone: userData.phone || "",
          name: userData.name || "",
          dob: userData.dob || "",
          interests: userData.interests
            ? parseJsonString(userData.interests)
            : [],
        };

        updateUserData(contextUserData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleVerifyCode = async (fullCode: string) => {
    if (!user?.user_id) {
      showToast(t("common.userSessionExpired"), "error");
      router.push("/welcome");
      return;
    }

    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append("type", "verify_otp");
      formData.append("user_id", user?.user_id);
      formData.append("code", fullCode);
      console.log("formData", formData);
      const response = await apiCall(formData);

      if (response.result) {
        await loginUser(user);
        setCode("");

        if (user?.new) {
          router.replace("/auth/gender");
        } else {
          await fetchUserProfile();
          const isVerified = await checkVerificationStatus();
          if (isVerified) {
            router.replace("/(tabs)");
          } else {
            router.replace("/auth/gender");
          }
        }
      } else {
        showToast(response.message || t("auth.invalidCode"), "error");
        console.error("Verification Error:", response.message);
        setCode("");
      }
    } catch (error) {
      showToast(t("api.errors.somethingWentWrong"), "error");
      console.error("Verification Error:", error);
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !user?.user_id) return;

    try {
      const formData = new FormData();
      formData.append("type", "resend_otp");
      formData.append("user_id", user.user_id);

      // formData.append("contact_type", contactType);
      console.log("formData", formData);
      const response = await apiCall(formData);

      if (response.success) {
        // Reset countdown and state
        setResendCountdown(59);
        setCanResend(false);
        setCode("");

        // Start new countdown timer
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToast(response.message || t("auth.failedToResendCode"), "error");
      }
    } catch (error) {
      showToast(t("auth.failedToResendCode"), "error");
      console.error("Resend Error:", error);
    }
  };
console.log("contactType", contactType)
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {isVerifying ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {t("auth.verifyYour", { contactType })}
            </Text>
            <Text style={styles.subtitle}>
              {t("auth.enterCodeSent", { contactInfo })}
            </Text>
          </View>
{(contactType === "E-Mail" || contactType === "email") && (
  <Text style={styles.subtitle}>{t("auth.enterCodeSent2")}</Text>
)}

          {/* PIN Input Boxes */}
          <View style={styles.pinWrapper}>
            <OtpInput
              numberOfDigits={6}
              onTextChange={(text) => setCode(text)}
              onFilled={(text) => handleVerifyCode(text)}
              theme={{
                containerStyle: styles.pinContainer,
                pinCodeContainerStyle: styles.pinBox,
                pinCodeTextStyle: styles.pinBoxText,
                focusedPinCodeContainerStyle: styles.pinBoxFilled,
                focusStickStyle: styles.focusStick,
              }}
              autoFocus
              disabled={isVerifying}
              textInputProps={{
                textContentType: "oneTimeCode",
                autoComplete: "sms-otp",
              }}
            />
          </View>

          {/* Resend Code Button */}
          <CustomButton
            title={
              canResend
                ? t("auth.resendCode")
                : t("auth.resendCodeIn", { count: resendCountdown })
            }
            onPress={handleResendCode}
            isDisabled={!canResend || isVerifying}
            isLoading={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 42,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
  },
  pinWrapper: {
    marginBottom: 60,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  pinBox: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    backgroundColor: color.white,
    justifyContent: "center",
    alignItems: "center",
  },
  pinBoxText: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  pinBoxFilled: {
    borderColor: color.primary,
    backgroundColor: color.white,
  },
  focusStick: {
    width: 2,
    height: 30,
    backgroundColor: color.primary,
  },
});
