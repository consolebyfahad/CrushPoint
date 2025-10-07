import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfService() {
  const handleBack = () => {
    router.back();
  };

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By downloading, accessing, or using the Andra mobile application ('App'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, please do not use our App.",
    },
    {
      title: "2. Description of Service",
      content:
        "Andra is a location-based social networking application that facilitates connections between users based on proximity, interests, and preferences. The App includes features such as user profiles, matching, messaging, event discovery, and location-based services.",
    },
    {
      title: "3. User Eligibility",
      content:
        "You must be at least 18 years old to use Andra. By using the App, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.",
    },
    {
      title: "4. User Accounts and Registration",
      content:
        "To use certain features of the App, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.",
    },
    {
      title: "5. User Conduct and Prohibited Activities",
      content:
        "You agree not to engage in any of the following prohibited activities: harassment, abuse, or threatening behavior towards other users; posting false, misleading, or fraudulent information; using the App for commercial purposes without authorization; sharing personal information of other users without consent; violating any applicable laws or regulations; or attempting to gain unauthorized access to the App or other users' accounts.",
    },
    {
      title: "6. Privacy and Data Protection",
      content:
        "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the App, you consent to the collection, use, and sharing of your information as described in our Privacy Policy.",
    },
    {
      title: "7. Location Services",
      content:
        "Andra uses location services to provide proximity-based features. By enabling location services, you consent to the collection and use of your location data. You can disable location services at any time through your device settings, though this may limit certain App functionality.",
    },
    {
      title: "8. Content and Intellectual Property",
      content:
        "You retain ownership of content you post to the App, but grant us a license to use, display, and distribute such content in connection with the App. The App and its original content, features, and functionality are owned by Andra and are protected by international copyright, trademark, and other intellectual property laws.",
    },
    {
      title: "9. Prohibited Content",
      content:
        "You may not post content that is illegal, harmful, threatening, abusive, defamatory, vulgar, obscene, or otherwise objectionable. Content that violates others' intellectual property rights, contains viruses or malicious code, or is designed to disrupt the App's operation is prohibited.",
    },
    {
      title: "10. Safety and Security",
      content:
        "While we strive to provide a safe environment, you use the App at your own risk. We are not responsible for the conduct of other users. Always exercise caution when meeting people in person and follow our safety guidelines. Report any suspicious or inappropriate behavior immediately.",
    },
    {
      title: "11. Third-Party Services",
      content:
        "The App may integrate with third-party services, including social media platforms and payment processors. Your use of such services is subject to their respective terms of service and privacy policies. We are not responsible for third-party services or their content.",
    },
    {
      title: "12. Disclaimers and Limitations of Liability",
      content:
        "THE APP IS PROVIDED 'AS IS' WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES AND SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.",
    },
    {
      title: "13. Termination",
      content:
        "We may terminate or suspend your account at any time for violations of these Terms or for any other reason at our discretion. You may terminate your account at any time through the App settings. Upon termination, your right to use the App will cease immediately.",
    },
    {
      title: "14. Modifications to Terms",
      content:
        "We reserve the right to modify these Terms at any time. We will notify users of material changes through the App or via email. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.",
    },
    {
      title: "15. Governing Law and Dispute Resolution",
      content:
        "These Terms are governed by the laws of the jurisdiction where Andra is incorporated. Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.",
    },
    {
      title: "16. Contact Information",
      content:
        "If you have any questions about these Terms, please contact us through the App's support feature or at our designated contact address. We will respond to your inquiries in a timely manner.",
    },
  ];

  const renderSection = (section: any, index: number) => (
    <View key={index} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Ionicons name="document-text" size={32} color={color.primary} />
            <Text style={styles.introTitle}>Terms of Service</Text>
          </View>
          <Text style={styles.lastUpdated}>Last updated: December 2023</Text>
          <Text style={styles.introText}>
            These Terms of Service govern your use of the Andra mobile
            application. Please read these terms carefully before using our
            service.
          </Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          {sections.map((section, index) => renderSection(section, index))}
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={color.primary}
            />
            <Text style={styles.noticeTitle}>Important Notice</Text>
          </View>
          <Text style={styles.noticeText}>
            By continuing to use Andra, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service. If you
            do not agree with any part of these terms, please discontinue use of
            the App.
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={24} color={color.primary} />
            <Text style={styles.contactTitle}>Questions?</Text>
          </View>
          <Text style={styles.contactText}>
            If you have any questions about these Terms of Service, please
            contact our support team through the app settings or reach out to us
            directly.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray87,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  introSection: {
    backgroundColor: color.primary + "10",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: color.primary + "20",
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.primary,
    marginLeft: 12,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
    marginBottom: 12,
    marginLeft: 44,
  },
  introText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 24,
  },
  termsContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
  },
  noticeSection: {
    backgroundColor: color.primary + "08",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.primary,
    marginLeft: 12,
  },
  noticeText: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: color.gray95,
    borderRadius: 16,
    padding: 20,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.primary,
    marginLeft: 12,
  },
  contactText: {
    fontSize: 15,
    fontFamily: font.regular,
    color: color.gray14,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});
