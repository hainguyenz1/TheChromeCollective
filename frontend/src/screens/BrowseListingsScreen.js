import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';

const BrowseListingsScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch listings from API
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/listings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      console.log('Fetched listings data:', data);
      console.log('Listings array:', data.listings);
      
      if (data.listings && data.listings.length > 0) {
        console.log('First listing images:', data.listings[0].images);
        console.log('First listing image URL:', data.listings[0].images?.[0]?.url);
      }
      
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  // Refresh listings
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  // Load listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Filter listings based on search query
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual listing card
  const renderListingCard = (listing) => {
    // Debug logging for image data
    console.log('Rendering listing:', listing.title);
    console.log('Images array:', listing.images);
    if (listing.images && listing.images.length > 0) {
      console.log('First image object:', listing.images[0]);
      console.log('First image URL:', listing.images[0].url);
      console.log('First image key:', listing.images[0].key);
    }
    
    // Generate fallback URL for images
    const getImageUrl = (image) => {
      if (image && image.url) {
        return image.url;
      }
      if (image && image.key) {
        return `http://localhost:5001/api/uploads/image/${image.key}`;
      }
      return null;
    };
    
    const imageUrl = getImageUrl(listing.images?.[0]);
    
    return (
      <TouchableOpacity 
        key={listing._id} 
        style={styles.listingCard}
        onPress={() => navigation.navigate('ListingDetail', { listingId: listing._id })}
        activeOpacity={0.7}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.listingImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error for listing:', listing.title);
                  console.log('Image URL:', imageUrl);
                  console.log('Error:', error);
                  // Try fallback URL if MinIO direct access fails
                  if (listing.images?.[0]?.key) {
                    const fallbackUrl = `http://localhost:5001/api/uploads/image/${listing.images[0].key}`;
                    console.log('Trying fallback URL:', fallbackUrl);
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully for listing:', listing.title);
                  console.log('Image URL:', imageUrl);
                }}
              />
              {listing.images && listing.images.length > 1 && (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>+{listing.images.length - 1}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={styles.noImageText}>No Image</Text>
              {listing.images && listing.images.length > 0 ? (
                <Text style={styles.debugText}>Has {listing.images.length} image(s)</Text>
              ) : (
                <Text style={styles.debugText}>No images array</Text>
              )}
              {listing.images && listing.images.length > 0 && !listing.images[0].url && (
                <Text style={styles.debugText}>Missing URL for first image</Text>
              )}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.listingContent}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            {listing.title}
          </Text>
          
          <Text style={styles.listingDescription} numberOfLines={3}>
            {listing.description}
          </Text>
          
          <View style={styles.listingMeta}>
            <Text style={styles.listingPrice}>
              {listing.currency} {listing.price}
            </Text>
            
            {listing.category && (
              <Text style={styles.listingCategory}>
                {listing.category}
              </Text>
            )}
          </View>
          
          <Text style={styles.listingDate}>
            Listed {new Date(listing.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Listings</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Listings */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No listings found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a listing!'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={styles.createFirstButtonText}>Create Your First Listing</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.listingsContainer}>
            {filteredListings.map(renderListingCard)}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listingsContainer: {
    gap: 15,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Add subtle border to indicate clickability
    borderWidth: 1,
    borderColor: 'transparent',
    // Add subtle transform for better UX
    transform: [{ scale: 1 }],
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  listingContent: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  listingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  listingCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listingDate: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BrowseListingsScreen;
