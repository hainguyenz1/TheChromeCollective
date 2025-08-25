import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const TrackingRetailPricesScreen = ({ navigation }) => {
  const [trackedItems, setTrackedItems] = useState([
    {
      id: '1',
      name: 'Chrome Hearts Cemetery Cross Ring',
      retailPrice: 1265,
      image: require('../../assets/Chrome-Hearts-Cemetery-Ring.jpeg'),
      lastUpdated: 'Just now'
    },
    {
      id: '2',
      name: 'Chrome Hearts Forever Ring',
      retailPrice: 420,
      image: require('../../assets/Forever-Ring.jpeg'),
      lastUpdated: 'Just now'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  // Add Product form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    retailPrice: '',
    category: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/products');
      if (response.ok) {
        const products = await response.json();
        // Transform database products to match the trackedItems format
        const transformedProducts = products.map(product => ({
          id: product._id || product.id,
          name: product.name,
          retailPrice: product.retailPrice,
          image: product.images && product.images.length > 0 
            ? { uri: product.images[0].url } 
            : require('../../assets/Chrome-Hearts-Cemetery-Ring.jpeg'), // fallback image
          lastUpdated: 'Just now'
        }));
        
        // Combine hardcoded items with database products
        const allProducts = [
          ...trackedItems.filter(item => item.id === '1' || item.id === '2'), // Keep hardcoded items
          ...transformedProducts
        ];
        setTrackedItems(allProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(trackedItems);
    } else {
      const filtered = trackedItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, trackedItems]);

  // Image picker function
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
        }));
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Upload images function
  const uploadImages = async () => {
    const uploadedImages = [];
    
    for (const image of selectedImages) {
      try {
        // Get presigned URL
        const presignResponse = await fetch('http://localhost:5002/api/uploads/presign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: image.name,
            contentType: image.type
          })
        });

        if (!presignResponse.ok) {
          throw new Error('Failed to get presigned URL');
        }

        const { presignedUrl, fileKey, publicUrl } = await presignResponse.json();

        // For React Native, let's try the most basic approach
        // Just fetch the image and send it directly
        const imageResponse = await fetch(image.uri);
        
        // Upload the raw response to MinIO/S3
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: imageResponse,
          headers: {
            'Content-Type': image.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        uploadedImages.push({ key: fileKey, url: publicUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }
    
    return uploadedImages;
  };

  // Create product function
  const createProduct = async (images) => {
          const response = await fetch('http://localhost:5002/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        retailPrice: parseFloat(formData.retailPrice),
        currency: 'USD', // Always USD
        category: formData.category,
        images: images
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    return response.json();
  };

  // Handle product submission
  const handleProductSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Product description is required');
      return;
    }
    
    if (!formData.category.trim()) {
      Alert.alert('Error', 'Product category is required');
      return;
    }
    
    if (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) {
      Alert.alert('Error', 'Valid retail price is required');
      return;
    }
    
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const uploadedImages = await uploadImages();
      
      // Create product
      await createProduct(uploadedImages);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        retailPrice: '',
        category: ''
      });
      setSelectedImages([]);
      
      // Refresh the products list to show the new product
      await fetchProducts();
      
      Alert.alert('Success', 'Product created successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = (id) => {
    console.log('Attempting to remove item with id:', id);
    console.log('Current trackedItems:', trackedItems);
    
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            console.log('Removing item with id:', id);
            setTrackedItems(prevItems => {
              const newItems = prevItems.filter(item => item.id !== id);
              console.log('New items after removal:', newItems);
              return newItems;
            });
          }
        }
      ]
    );
  };

  const renderTrackedItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        <Image 
          source={item.image} 
          style={styles.itemImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.retailPrice}>${item.retailPrice.toLocaleString()}</Text>
        <Text style={styles.lastUpdated}>Updated: {item.lastUpdated}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Retail Prices</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Add Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Product to Database</Text>
          
          {/* Product Images */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
              <Text style={styles.imagePickerButtonText}>Select Product Images</Text>
            </TouchableOpacity>
            
            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Product Details Form */}
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Product Description"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Category (e.g., Rings, Necklaces, Bracelets)"
            value={formData.category}
            onChangeText={(text) => setFormData({...formData, category: text})}
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Retail Price (USD)"
            value={formData.retailPrice}
            onChangeText={(text) => setFormData({...formData, retailPrice: text})}
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleProductSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Product to Database</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Product's Retail Price */}
        <View style={styles.trackedSection}>
          <Text style={styles.sectionTitle}>
            Product's Retail Price ({trackedItems.length})
          </Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          
          <FlatList
            data={filteredItems}
            renderItem={renderTrackedItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            extraData={filteredItems.length}
          />
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  imageSection: {
    marginBottom: 15,
  },
  imagePickerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackedSection: {
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  retailPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#666666',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
  },
});

export default TrackingRetailPricesScreen;
