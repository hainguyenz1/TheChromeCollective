import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const ListingDetailScreen = ({ route, navigation }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Fetch listing details
  useEffect(() => {
    fetchListingDetails();
  }, [listingId]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/listings/${listingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing details');
      }
      
      const data = await response.json();
      setListing(data.listing);
    } catch (error) {
      console.error('Error fetching listing details:', error);
      Alert.alert('Error', 'Failed to fetch listing details');
    } finally {
      setLoading(false);
    }
  };

  // Image navigation functions
  const nextImage = () => {
    if (listing && listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const previousImage = () => {
    if (listing && listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Handle purchase button
  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  // Handle purchase confirmation
  const handlePurchaseConfirm = () => {
    setShowPurchaseModal(false);
    Alert.alert(
      'Purchase Initiated',
      'Your purchase request has been submitted. You will receive a confirmation email shortly.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasMultipleImages = listing.images && listing.images.length > 1;
  const currentImage = listing.images && listing.images[currentImageIndex];

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Image Gallery Section */}
        <View style={styles.imageSection}>
          {/* Desktop Layout: Vertical Thumbnails Left + Main Image Right */}
          {screenWidth > 768 && hasMultipleImages && (
            <View style={styles.thumbnailGallery}>
              <ScrollView 
                vertical 
                showsVerticalScrollIndicator={false}
                style={styles.thumbnailScrollView}
              >
                {listing.images.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbnailItem,
                      index === currentImageIndex && styles.activeThumbnailItem
                    ]}
                    onPress={() => setCurrentImageIndex(index)}
                  >
                    <Image 
                      source={{ uri: image.url }} 
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                    {index === currentImageIndex && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main Image Display */}
          <View style={styles.mainImageContainer}>
            {currentImage ? (
              <Image 
                source={{ uri: currentImage.url }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Text style={styles.noImageText}>No Image Available</Text>
              </View>
            )}

            {/* Image Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <TouchableOpacity style={styles.navArrowLeft} onPress={previousImage}>
                  <Text style={styles.navArrowText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navArrowRight} onPress={nextImage}>
                  <Text style={styles.navArrowText}>›</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {listing.images.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mobile Layout: Horizontal Thumbnails Below Main Image */}
        {screenWidth <= 768 && hasMultipleImages && (
          <View style={styles.mobileThumbnailContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.mobileThumbnailScroll}
            >
              {listing.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.mobileThumbnail,
                    index === currentImageIndex && styles.mobileActiveThumbnail
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                >
                  <Image 
                    source={{ uri: image.url }} 
                    style={styles.mobileThumbnailImage}
                    resizeMode="cover"
                  />
                  {index === currentImageIndex && (
                    <View style={styles.mobileActiveIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Product Information */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{listing.title}</Text>
          
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              {listing.currency} {listing.price}
            </Text>
            {listing.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{listing.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Listed:</Text>
              <Text style={styles.detailValue}>
                {new Date(listing.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition:</Text>
              <Text style={styles.detailValue}>Used - Good</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>United States</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
            <Text style={styles.purchaseButtonText}>Purchase</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Purchase</Text>
            
            <View style={styles.purchaseSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item:</Text>
                <Text style={styles.summaryValue}>{listing.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price:</Text>
                <Text style={styles.summaryValue}>{listing.currency} {listing.price}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>+ $15.00</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {listing.currency} {listing.price + 15}
                </Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>Payment Information</Text>
              <Text style={styles.paymentNote}>
                Please add your credit card information to complete the purchase.
              </Text>
              
              <View style={styles.cardInputContainer}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.cardInput}>
                  <Text style={styles.cardInputText}>•••• •••• •••• ••••</Text>
                </View>
              </View>
              
              <View style={styles.cardRow}>
                <View style={styles.cardInputContainer}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.cardInput}>
                    <Text style={styles.cardInputText}>MM/YY</Text>
                  </View>
                </View>
                
                <View style={styles.cardInputContainer}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <View style={styles.cardInput}>
                    <Text style={styles.cardInputText}>•••</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowPurchaseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handlePurchaseConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  
  // Image Gallery Styles
  imageSection: {
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    flexDirection: 'row', // Added for horizontal layout
    alignItems: 'flex-start', // Align items to the start
    paddingTop: 20, // Add top padding for better spacing
    borderBottomWidth: 1, // Subtle border separation
    borderBottomColor: '#f0f0f0',
  },
  thumbnailGallery: {
    width: 100, // Fixed width for thumbnail gallery
    paddingRight: 15, // Space between thumbnail and main image
    paddingLeft: 20, // Left padding for thumbnails
    paddingTop: 10, // Top padding for better spacing
    backgroundColor: '#fafafa', // Subtle background
    borderRadius: 8, // Rounded corners
    marginRight: 15, // Space between gallery and main image
  },
  thumbnailScrollView: {
    maxHeight: 400, // Limit height to prevent excessive scrolling
  },
  thumbnailItem: {
    width: '100%',
    height: 80, // Fixed height for thumbnails
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative', // Needed for active indicator positioning
    overflow: 'hidden', // Ensure rounded corners work properly
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    // Add subtle transition effect
    transform: [{ scale: 1 }],
  },
  activeThumbnailItem: {
    borderColor: '#007AFF',
    borderWidth: 3,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    // Slight scale effect for active state
    transform: [{ scale: 1.02 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 5,
    left: '50%',
    transform: [{ translateX: -10 }], // Center the indicator
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainImageContainer: {
    flex: 1, // Takes remaining space
    position: 'relative',
    height: 400, // Increased height for better image display
    marginRight: 20, // Right margin for spacing
    borderRadius: 12, // Rounded corners
    overflow: 'hidden', // Ensure rounded corners work
    backgroundColor: '#f8f9fa', // Light background for placeholder
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Match container border radius
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
    fontSize: 16,
    color: '#999',
  },
  navArrowLeft: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowRight: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Mobile Thumbnail Styles
  mobileThumbnailContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fafafa', // Subtle background
    borderTopWidth: 1, // Top border separation
    borderTopColor: '#f0f0f0',
  },
  mobileThumbnailScroll: {
    // No specific styles needed for ScrollView, it handles its own content
  },
  mobileThumbnail: {
    width: 80, // Fixed width for mobile thumbnails
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mobileActiveThumbnail: {
    borderColor: '#007AFF',
    borderWidth: 3,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  mobileThumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  mobileActiveIndicator: {
    position: 'absolute',
    bottom: 5,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Product Information Styles
  productInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    lineHeight: 30,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 10,
    gap: 15,
  },
  purchaseButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  purchaseSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  paymentNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  cardInputText: {
    fontSize: 16,
    color: '#999',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading and Error States
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ListingDetailScreen;
