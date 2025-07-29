import { color, font } from '@/utils/constants';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Matches from '../matches/matches';
import Requests from '../matches/requests';

export default function MatchesMain() {
  const [activeTab, setActiveTab] = useState('matches');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activeTab === "matches" ? "Your Matches" : "Meetup Requests"}</Text>
        <Text style={styles.matchCount}>{`${activeTab === "matches" ? "3 matches" : "3 requests"}`}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'matches' && styles.activeTab
          ]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'matches' && styles.activeTabText
          ]}>
            Matches 
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'requests' && styles.activeTab
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'requests' && styles.activeTabText
          ]}>
            Meetup Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'matches' ? <Matches /> : <Requests />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: color.gray94,
  },
  activeTab: {
    backgroundColor: color.primary,
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