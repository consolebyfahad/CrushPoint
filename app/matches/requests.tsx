import CustomSearchBar from '@/components/custom_search';
import { color, font } from '@/utils/constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IncomingMeetup from './incoming_meetup';
import OutgoingMeetup from './outgoing_meetup';

export default function Requests() {
  const [activeTab, setActiveTab] = useState('incoming');
  const [searchText, setSearchText] = useState('');

  // Mock data - replace with your API calls
  const incomingRequests = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Alex',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face'
      },
      status: 'pending',
      timestamp: '2 hrs ago',
      date: 'Thu, Feb 15',
      time: '7:00 PM',
      location: 'Central Park Cafe',
      message: 'Would love to meet for coffee and get to know each other better!',
      hasChanges: false
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Julia',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face'
      },
      status: 'change',
      timestamp: '3 days ago',
      date: 'Tue, Feb 20',
      time: '6:30 PM',
      location: 'Times Square',
      message: 'How about we meet at a quieter place?',
      hasChanges: true
    }
  ];

  const outgoingRequests = [
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Sam',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'
      },
      status: 'accepted',
      timestamp: '1 day ago',
      date: 'Sun, Feb 18',
      time: '2:00 PM',
      location: 'Brooklyn Bridge Park',
      message: 'Perfect weather for a walk in the park!',
      responseMessage: 'Your request was accepted!'
    }
  ];

  const totalRequests = incomingRequests.length + outgoingRequests.length;
  const incomingCount = incomingRequests.length;
  const outgoingCount = outgoingRequests.length;

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder="Search requests..."
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'incoming' && styles.activeTab
          ]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'incoming' && styles.activeTabText
          ]}>
            Incoming ({incomingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'outgoing' && styles.activeTab
          ]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'outgoing' && styles.activeTabText
          ]}>
            Outgoing ({outgoingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'incoming' ? (
          <IncomingMeetup 
            requests={incomingRequests}
            searchText={searchText}
          />
        ) : (
          <OutgoingMeetup 
            requests={outgoingRequests}
            searchText={searchText}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  searchContainer: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
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