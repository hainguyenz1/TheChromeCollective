import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = ({ navigation }) => {
  const handleTrackingRetailPrices = () => {
    navigation.navigate('TrackingRetailPrices');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/Chrome-Hearts-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.headerTitle}>TheChromeCollective</Text>
        <Text style={styles.headerSubtitle}>Chrome Hearts Marketplace</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to The Chrome Collective</Text>
          <Text style={styles.welcomeText}>
            Discover, buy, and sell authentic Chrome Hearts products in our exclusive marketplace.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Browse Product Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Create Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleTrackingRetailPrices}
            >
              <Text style={styles.actionButtonText}>Tracking Retail Prices</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>My Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Jewelry</Text>
              <Text style={styles.categoryCount}>150+ items</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Clothing</Text>
              <Text style={styles.categoryCount}>89+ items</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Accessories</Text>
              <Text style={styles.categoryCount}>67+ items</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Home & Lifestyle</Text>
              <Text style={styles.categoryCount}>34+ items</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Backend API:</Text>
            <Text style={styles.statusValue}>Connected</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Database:</Text>
            <Text style={styles.statusValue}>MongoDB Atlas</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Storage:</Text>
            <Text style={styles.statusValue}>MinIO Ready</Text>
          </View>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
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
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666666',
  },
  statusSection: {
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
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statusValue: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default HomeScreen;
