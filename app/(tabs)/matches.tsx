import CustomButton from "@/components/custom_button";
import { MatchesTabsHeader } from "@/components/tabs_header";
import { color, font } from "@/utils/constants";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Matches from "../matches/matches";
import Requests from "../matches/requests";

export default function MatchesMain() {
  const [activeTab, setActiveTab] = useState("matches");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <MatchesTabsHeader
        title={activeTab === "matches" ? "Your Matches" : "Meetup Requests"}
        matches={activeTab === "matches" ? "3 matches" : "3 requests"}
      />
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === "matches" ? "Your Matches" : "Meetup Requests"}
        </Text>
        <Text style={styles.matchCount}>{`${
          activeTab === "matches" ? "3 matches" : "3 requests"
        }`}</Text>
      </View> */}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {/* <TouchableOpacity
          style={[styles.tab, activeTab === "matches" && styles.activeTab]}
          onPress={() => setActiveTab("matches")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "matches" && styles.activeTabText,
            ]}
          >
            Matches
          </Text>
        </TouchableOpacity> */}
        <CustomButton
          title=" Matches"
          style={[styles.tab, activeTab === "matches" && styles.activeTab]}
          fontstyle={[
            styles.tabText,
            activeTab === "matches" && styles.activeTabText,
          ]}
          onPress={() => setActiveTab("matches")}
        />
        <CustomButton
          title=" Meetup Requests"
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          fontstyle={[
            styles.tabText,
            activeTab === "requests" && styles.activeTabText,
          ]}
          onPress={() => setActiveTab("requests")}
        />

        {/* <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Meetup Requests
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "matches" ? <Matches /> : <Requests />}
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
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    width: "50%",
    paddingVertical: 12,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  activeTab: {
    backgroundColor: color.primary,
    borderColor: color.white,
  },
  tabText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
  },
  activeTabText: {
    color: color.white,
    fontFamily: font.semiBold,
  },
  tabContent: {
    flex: 1,
  },
});
