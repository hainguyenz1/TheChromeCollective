import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

const UserProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create a simple profile from Auth0 user data without backend call
    setLoading(true);
    
    // Simulate a brief loading time
    setTimeout(() => {
      setUserProfile({
        username: user.nickname || user.email.split('@')[0],
        profile: {
          firstName: user.given_name,
          lastName: user.family_name,
        },
        stats: {
          listingsCount: 0,
          followersCount: 0,
          totalSales: 0
        }
      });
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, user]);



  if (isLoading || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.notAuthenticatedText}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {user.picture && (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {userProfile?.profile?.firstName && userProfile?.profile?.lastName
              ? `${userProfile.profile.firstName} ${userProfile.profile.lastName}`
              : user.name || user.email
            }
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.username}>@{userProfile?.username || user.nickname}</Text>
        </View>
      </View>

      {userProfile && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.stats?.listingsCount || 0}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.stats?.followersCount || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.stats?.totalSales || 0}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  notAuthenticatedText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default UserProfile;
