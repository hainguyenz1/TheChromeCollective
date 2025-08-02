# TheChromeCollective

A mobile app built with React Native (Expo), Node.js/Express.js backend, and MongoDB for data storage. The app supports users in listing and browsing Chrome Hearts products in both retail and resale markets, with features like real-time feed updates, photo uploads, keyword filtering, and a built-in marketplace.

## 🚀 Features

- **Product Management**: Create, edit, and manage Chrome Hearts product listings
- **Marketplace**: Buy and sell Chrome Hearts items with built-in marketplace functionality
- **Real-time Updates**: Live feed updates and notifications using WebSocket
- **Image Management**: Photo uploads with MinIO/S3 storage
- **Search & Filtering**: Advanced search with keyword filtering and category-based browsing
- **Price Tracking**: Track price history and changes for products
- **User Profiles**: User management with profiles and preferences
- **Authentication**: Custom authentication system (Auth0 integration planned for future)

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for routing
- **Socket.io Client** for real-time features
- **Axios** for API communication
- **React Native Elements** for UI components

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **MinIO** for object storage
- **JWT** for authentication
- **Multer** for file uploads
- **Sharp** for image processing

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Redis** for caching (future use)

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TheChromeCollective
```

### 2. Start the Application
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Services
- **Backend API**: http://localhost:5000
- **Frontend (Expo)**: http://localhost:19002
- **MongoDB**: localhost:27017
- **MinIO Console**: http://localhost:9001
- **Redis**: localhost:6379

### 4. Health Check
```bash
curl http://localhost:5000/health
```

## 🔧 Development Setup

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Access
```bash
# Connect to MongoDB
docker exec -it chrome_collective_mongodb mongosh -u admin -p password123

# Access MinIO Console
# Open http://localhost:9001 in browser
# Username: minioadmin
# Password: minioadmin123
```

## 📁 Project Structure

```
TheChromeCollective/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database, socket, and other configs
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React Native (Expo) app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # Screen components
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Images, fonts, etc.
│   ├── Dockerfile
│   └── package.json
├── scripts/                # Database scripts
├── docker-compose.yml      # Docker orchestration
├── roadmap.md             # Project roadmap
├── task.md                # Engineering tasks
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/chrome_collective?authSource=admin
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=chrome-collective-images
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📊 Database Schema

### Collections
- **users**: User accounts and profiles
- **products**: Chrome Hearts product catalog
- **listings**: Marketplace listings
- **categories**: Product categories and subcategories

### Key Features
- Text search indexes for products and listings
- Geospatial indexes for location-based queries
- Compound indexes for complex filtering
- Automatic indexing for performance optimization

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get products with filtering
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Listings
- `GET /api/listings` - Get marketplace listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing details
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details

### Images
- `POST /api/images/upload` - Upload image
- `DELETE /api/images/:id` - Delete image

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Mobile Development

### Expo Development
```bash
cd frontend
npm start

# Scan QR code with Expo Go app
# Or run on specific platform
npm run android
npm run ios
```

### Building for Production
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## 🚀 Deployment

### Production Environment
1. Update environment variables for production
2. Build Docker images
3. Deploy to cloud platform (AWS, GCP, Azure)
4. Set up SSL certificates
5. Configure domain and DNS

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
MINIO_ENDPOINT=<production-minio-endpoint>
JWT_SECRET=<production-jwt-secret>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

See [roadmap.md](roadmap.md) for detailed sprint-by-sprint development plan.

## 📋 Tasks

See [task.md](task.md) for detailed engineering tasks and tracking.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the roadmap and task files

## 🔮 Future Enhancements

- LLM Assistant integration
- Auth0 authentication
- Advanced analytics
- Multi-language support
- Advanced payment processing
- AR try-on features
- Social media integration
