// MongoDB initialization script for TheChromeCollective
db = db.getSiblingDB('chrome_collective');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('listings');
db.createCollection('categories');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "profile.location": 1 });
db.users.createIndex({ "createdAt": -1 });

db.products.createIndex({ "name": "text", "description": "text", "tags": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "brand": 1 });
db.products.createIndex({ "specifications.year": -1 });
db.products.createIndex({ "pricing.retailPrice": 1 });
db.products.createIndex({ "condition": 1 });
db.products.createIndex({ "isActive": 1 });
db.products.createIndex({ "isFeatured": 1 });
db.products.createIndex({ "createdAt": -1 });

db.listings.createIndex({ "product": 1 });
db.listings.createIndex({ "seller": 1 });
db.listings.createIndex({ "status": 1 });
db.listings.createIndex({ "price": 1 });
db.listings.createIndex({ "condition": 1 });
db.listings.createIndex({ "location.country": 1 });
db.listings.createIndex({ "location.city": 1 });
db.listings.createIndex({ "createdAt": -1 });
db.listings.createIndex({ "expiresAt": 1 });
db.listings.createIndex({ "isUrgent": 1 });
db.listings.createIndex({ "title": "text", "description": "text", "tags": "text" });

db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "parent": 1 });
db.categories.createIndex({ "isActive": 1 });
db.categories.createIndex({ "isFeatured": 1 });
db.categories.createIndex({ "sortOrder": 1 });

// Insert initial categories
db.categories.insertMany([
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Chrome Hearts jewelry collection",
    parent: null,
    children: [],
    icon: "diamond",
    color: "#FFD700",
    sortOrder: 1,
    isActive: true,
    isFeatured: true,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Chrome Hearts clothing and apparel",
    parent: null,
    children: [],
    icon: "tshirt",
    color: "#000000",
    sortOrder: 2,
    isActive: true,
    isFeatured: true,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Chrome Hearts accessories and small items",
    parent: null,
    children: [],
    icon: "bag",
    color: "#8B4513",
    sortOrder: 3,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Home & Lifestyle",
    slug: "home-lifestyle",
    description: "Chrome Hearts home decor and lifestyle items",
    parent: null,
    children: [],
    icon: "home",
    color: "#4A4A4A",
    sortOrder: 4,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert subcategories for Jewelry
const jewelryCategory = db.categories.findOne({ slug: "jewelry" });
db.categories.insertMany([
  {
    name: "Rings",
    slug: "jewelry-rings",
    description: "Chrome Hearts rings",
    parent: jewelryCategory._id,
    children: [],
    icon: "ring",
    color: "#FFD700",
    sortOrder: 1,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Necklaces",
    slug: "jewelry-necklaces",
    description: "Chrome Hearts necklaces and chains",
    parent: jewelryCategory._id,
    children: [],
    icon: "necklace",
    color: "#FFD700",
    sortOrder: 2,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bracelets",
    slug: "jewelry-bracelets",
    description: "Chrome Hearts bracelets and cuffs",
    parent: jewelryCategory._id,
    children: [],
    icon: "bracelet",
    color: "#FFD700",
    sortOrder: 3,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert subcategories for Clothing
const clothingCategory = db.categories.findOne({ slug: "clothing" });
db.categories.insertMany([
  {
    name: "T-Shirts",
    slug: "clothing-tshirts",
    description: "Chrome Hearts t-shirts and tops",
    parent: clothingCategory._id,
    children: [],
    icon: "tshirt",
    color: "#000000",
    sortOrder: 1,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Hoodies",
    slug: "clothing-hoodies",
    description: "Chrome Hearts hoodies and sweatshirts",
    parent: clothingCategory._id,
    children: [],
    icon: "hoodie",
    color: "#000000",
    sortOrder: 2,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jeans",
    slug: "clothing-jeans",
    description: "Chrome Hearts jeans and pants",
    parent: clothingCategory._id,
    children: [],
    icon: "jeans",
    color: "#000000",
    sortOrder: 3,
    isActive: true,
    isFeatured: false,
    stats: { productCount: 0, listingCount: 0, viewCount: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ MongoDB initialization completed successfully!");
print("📦 Database: chrome_collective");
print("🗂️ Collections created: users, products, listings, categories");
print("📊 Indexes created for optimal performance");
print("🏷️ Initial categories inserted"); 