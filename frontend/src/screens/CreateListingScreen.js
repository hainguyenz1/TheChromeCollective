import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Modal
} from 'react-native';
const CreateListingScreen = ({ navigation }) => {
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: '',
    condition: 'Used'
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Simple image picker for web
  const pickImages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';

    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      const newImages = files.map(file => ({
        uri: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        file: file // Keep the actual file object for upload
      }));

      setSelectedImages([...selectedImages, ...newImages]);
    };

    input.click();
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Upload images function with progress tracking
  const uploadImages = async () => {
    const uploadedImages = [];
    setUploadProgress({});

    for (let i = 0; i < selectedImages.length; i++) {
      const image = selectedImages[i];
      try {
        setUploadProgress(prev => ({ ...prev, [i]: 'uploading' }));
        
        // Get presigned URL with listings/temp prefix
        const presignResponse = await fetch('http://localhost:5001/api/uploads/presign', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: image.name,
            contentType: image.type,
            prefix: 'listings/temp'
          })
        });

        if (!presignResponse.ok) {
          throw new Error(`Failed to get presigned URL: ${presignResponse.status}`);
        }

        const { presignedUrl, fileKey, publicUrl } = await presignResponse.json();

        // Upload file directly
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: image.file,
          headers: { 'Content-Type': image.type }
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${uploadResponse.status}`);
        }

        uploadedImages.push({ key: fileKey, url: publicUrl });
        setUploadProgress(prev => ({ ...prev, [i]: 'completed' }));
        
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadProgress(prev => ({ ...prev, [i]: 'failed' }));
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }

    return uploadedImages;
  };

  // Create listing function
  const createListing = async (images) => {
    try {
      const response = await fetch('http://localhost:5001/api/listings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          category: formData.category,
          condition: formData.condition, // Add condition to the payload
          images: images
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to create listing');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  };

  // Handle AI description generation
  const handleAIGenerateDescription = async () => {
    // Validate required fields for AI generation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title first to generate an AI description');
      return;
    }

    setIsAIGenerating(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/ai/describe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          condition: formData.condition, // Use condition from formData
          price: formData.price ? parseFloat(formData.price) : undefined,
          currency: formData.currency,
          notes: formData.description // Use current description as notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI description');
      }

      const data = await response.json();
      
      // Replace description if empty, otherwise append with divider
      if (!formData.description.trim()) {
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          description: `${prev.description}\n\n---\n\n${data.description}` 
        }));
      }
      
      // Show success message
      Alert.alert('Success', 'AI description generated and added to your listing!');
      
    } catch (error) {
      console.error('Error generating AI description:', error);
      
      // Show user-friendly error message
      let errorMessage = 'AI is unavailable right now. Please try again.';
      if (error.message.includes('AI is unavailable')) {
        errorMessage = error.message;
      }
      
      Alert.alert('AI Generation Failed', errorMessage);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Handle listing submission
  const handleListingSubmit = async () => {
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.price.trim()) {
      Alert.alert('Error', 'Title, description, and price are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price greater than 0');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImages = await uploadImages();
      const result = await createListing(uploadedImages);
      
      console.log('Listing created successfully:', result);

      // Reset form
      setFormData({ title: '', description: '', price: '', currency: 'USD', category: '', condition: 'Used' });
      setSelectedImages([]);
      setUploadProgress({});

      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation functions
  const goToBrowseListings = () => {
    setShowSuccessModal(false);
    navigation.navigate('BrowseListings');
  };

  const stayHere = () => {
    setShowSuccessModal(false);
  };

  // Success Modal
  const SuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🎉 Success!</Text>
          <Text style={styles.modalMessage}>Your listing has been created successfully.</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={stayHere}>
              <Text style={styles.modalButtonTextSecondary}>Stay Here</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={goToBrowseListings}>
              <Text style={styles.modalButtonTextPrimary}>Go to Browse Listings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>Create New Listing</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Details</Text>

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="Listing Title *"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholderTextColor="#999"
          />

          {/* Description */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={4}
          />



          {/* Price and Currency */}
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Price *"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            
            <View style={styles.currencyContainer}>
              <Text style={styles.currencyLabel}>Currency:</Text>
              <TouchableOpacity
                style={styles.currencyButton}
                onPress={() => {
                  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
                  const currentIndex = currencies.indexOf(formData.currency);
                  const nextIndex = (currentIndex + 1) % currencies.length;
                  setFormData({ ...formData, currency: currencies[nextIndex] });
                }}
              >
                <Text style={styles.currencyButtonText}>{formData.currency}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholderTextColor="#999"
          />

          {/* Condition */}
          <View style={styles.conditionRow}>
            <Text style={styles.conditionLabel}>Condition:</Text>
            <TouchableOpacity
              style={styles.conditionButton}
              onPress={() => {
                const conditions = ['New', 'Used', 'Refurbished'];
                const currentIndex = conditions.indexOf(formData.condition);
                const nextIndex = (currentIndex + 1) % conditions.length;
                setFormData({ ...formData, condition: conditions[nextIndex] });
              }}
            >
              <Text style={styles.conditionButtonText}>{formData.condition}</Text>
            </TouchableOpacity>
          </View>

                  {/* AI Generate Description Button */}
        <TouchableOpacity 
          style={[styles.aiButton, isAIGenerating && styles.aiButtonDisabled]} 
          onPress={handleAIGenerateDescription} 
          disabled={isAIGenerating}
        >
          {isAIGenerating ? (
            <View style={styles.aiButtonLoading}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.aiButtonText}>Generating...</Text>
            </View>
          ) : (
            <Text style={styles.aiButtonText}>✨ AI-Generate Description</Text>
          )}
        </TouchableOpacity>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Images</Text>
          
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
            <Text style={styles.imagePickerButtonText}>📷 Select Images</Text>
          </TouchableOpacity>

          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  
                  {/* Upload Progress Indicator */}
                  {uploadProgress[index] === 'uploading' && (
                    <View style={styles.progressOverlay}>
                      <ActivityIndicator color="#ffffff" />
                      <Text style={styles.progressText}>Uploading...</Text>
                    </View>
                  )}
                  
                  {uploadProgress[index] === 'completed' && (
                    <View style={styles.completedOverlay}>
                      <Text style={styles.completedText}>✓</Text>
                    </View>
                  )}
                  
                  {uploadProgress[index] === 'failed' && (
                    <View style={styles.failedOverlay}>
                      <Text style={styles.failedText}>✗</Text>
                    </View>
                  )}
                  
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleListingSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal />
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
    height: 100,
    textAlignVertical: 'top',
  },
  aiButton: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
  },
  currencyContainer: {
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currencyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  currencyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 12,
    color: '#666',
  },
  conditionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  conditionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 4,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  failedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
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
  submitButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
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
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modalButtonTextSecondary: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreateListingScreen;
