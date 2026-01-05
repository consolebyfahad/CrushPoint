import { MatchesTabsHeader } from "@/components/tabs_header";
import useGetMatches from "@/hooks/useGetMatches";
import { color, font } from "@/utils/constants";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Matches from "../matches/matches";

export default function MatchesMain() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { matches } = useGetMatches();
  const matchesCount = matches.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <MatchesTabsHeader
        title={t("matches.matches")}
        matches="matches"
        matchesCount={matchesCount}
        totalRequestsCount={0}
        activeTab="matches"
      />

      {/* Matches Content */}
      <View style={styles.tabContent}>
        <Matches />
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
  },
  matchCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  tabContent: {
    flex: 1,
  },
});
