import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  Image
} from 'react-native';

const TrackingRetailPricesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retailPriceQuery, setRetailPriceQuery] = useState('');
  const [trackedItems, setTrackedItems] = useState([
    {
      id: '1',
      name: 'Chrome Hearts Cemetery Cross Ring',
      retailPrice: 1265,
      image: require('../../assets/Chrome-Hearts-Cemetery-Ring.jpeg'),
    },
    {
      id: '2',
      name: 'Chrome Hearts Forever Ring',
      retailPrice: 420,
      image: require('../../assets/Forever-Ring.jpeg'),
    },
  ]);

  const addNewItem = () => {
    if (searchQuery.trim() && retailPriceQuery.trim()) {
      const price = parseFloat(retailPriceQuery);
      if (isNaN(price) || price < 0) {
        Alert.alert('Invalid Price', 'Please enter a valid retail price (number greater than 0)');
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        name: searchQuery.trim(),
        retailPrice: price,
        image: require('../../assets/Chrome-Hearts-Cemetery-Ring.jpeg'),
        lastUpdated: 'Just now'
      };
      
      setTrackedItems([newItem, ...trackedItems]);
      setSearchQuery('');
      setRetailPriceQuery('');
      Alert.alert('Success', 'Item added to tracking list!');
    } else {
      Alert.alert('Missing Information', 'Please enter both product name and retail price');
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
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Add New Item to Track</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter product name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter retail price in USD before tax (e.g., 1000)"
              value={retailPriceQuery}
              onChangeText={setRetailPriceQuery}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNewItem}
          >
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Tracked Items */}
        <View style={styles.trackedSection}>
          <Text style={styles.sectionTitle}>
            Tracked Items ({trackedItems.length})
          </Text>
          
          <FlatList
            data={trackedItems}
            renderItem={renderTrackedItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            extraData={trackedItems.length}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  searchSection: {
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
  inputContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackedSection: {
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 22,
  },
  retailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666666',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrackingRetailPricesScreen;
