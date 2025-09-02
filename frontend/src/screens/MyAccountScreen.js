import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList
} from 'react-native';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import UserProfile from '../components/UserProfile';

const MyAccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Selling');
  const { isAuthenticated, isLoading } = useAuth0();

  // Navigation tabs
  const tabs = [
    { key: 'Selling', label: 'Selling', icon: null },
    { key: 'Favorites', label: 'Favorites', icon: null },
    { key: 'Reviews', label: 'Reviews', icon: null }
  ];

  const renderTab = ({ item }) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === item.key && styles.activeTab]}
      onPress={() => setActiveTab(item.key)}
    >
      <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
        {item.icon} {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'Selling' && "You don't have any listings for sale."}
        {activeTab === 'Favorites' && "You haven't favorited any items yet."}
        {activeTab === 'Reviews' && "You haven't received any reviews yet."}
      </Text>
      {activeTab === 'Selling' && (
        <TouchableOpacity style={styles.startListingButton}>
          <Text style={styles.startListingButtonText}>+ START A NEW LISTING</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Welcome to TheChromeCollective</Text>
          <Text style={styles.authSubtitle}>Please log in to access your account</Text>
          <LoginButton style={styles.authButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.logoutContainer}>
          <LogoutButton style={styles.logoutButton} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Header */}
        <View style={styles.profileSection}>
          <UserProfile />
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          />
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          <View style={styles.contentHeader}>
            <Text style={styles.listingsCount}>
              0 listings
            </Text>
            <TouchableOpacity style={styles.sortDropdown}>
              <Text style={styles.sortText}>Sort: Most Relevant</Text>
              <Text style={styles.sortArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Always show empty state since no listings */}
          {renderEmptyState()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editPhotoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginRight: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  transactions: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  joinedInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666666',
  },
  profileStats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  socialStats: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  editProfileButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  editProfileButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 16,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsList: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1a1a1a',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  mainContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listingsCount: {
    fontSize: 16,
    color: '#666666',
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sortText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  sortArrow: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  startListingButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  startListingButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  authButton: {
    minWidth: 200,
  },
  logoutContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

export default MyAccountScreen;
