# MinIO Setup Guide for TheChromeCollective

## 🚀 Quick Start

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 2. Start MinIO Services
```bash
# Start all services
docker-compose up -d

# Or start just MinIO
docker-compose up -d minio
```

### 3. Access MinIO
- **API Endpoint**: http://localhost:9000
- **Web Console**: http://localhost:9001
- **Login Credentials**:
  - Username: `minioadmin`
  - Password: `minioadmin123`

## 🔧 Configuration

### Environment Variables
```bash
MINIO_ENDPOINT=minio          # Container name
MINIO_PORT=9000               # API port
MINIO_ACCESS_KEY=minioadmin   # Access key
MINIO_SECRET_KEY=minioadmin123 # Secret key
MINIO_BUCKET=chrome-collective-images # Bucket name
```

### Ports
- **9000**: MinIO API (for your app)
- **9001**: MinIO Web Console (for management)

## 📱 How to Use in Your App

### 1. Upload Images
```javascript
// Frontend: Pick image and get presigned URL
const response = await fetch('http://localhost:5001/api/uploads/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName: 'product-image.jpg' })
});

const { presignedUrl, fileKey, publicUrl } = await response.json();

// Upload to MinIO using presigned URL
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  body: imageFile,
  headers: { 'Content-Type': 'image/jpeg' }
});
```

### 2. Display Images
```javascript
// Use the publicUrl returned from the presign endpoint
<Image source={{ uri: publicUrl }} style={styles.image} />
```

## 🧪 Testing MinIO

### Test Connection
```bash
# From project root
node scripts/test-minio.js
```

### Test Upload via API
```bash
# Test the presign endpoint
curl -X POST http://localhost:5001/api/uploads/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.jpg"}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Connection refused" Error
```bash
# Check if MinIO is running
docker ps | grep minio

# Restart MinIO
docker-compose restart minio
```

#### 2. "Bucket not found" Error
```bash
# Check bucket creation
docker-compose logs backend | grep "MinIO initialization"

# Manually create bucket via web console
# Go to http://localhost:9001 and create bucket manually
```

#### 3. "Access denied" Error
```bash
# Verify credentials in docker-compose.yml
# Check if backend can connect to MinIO
docker-compose logs backend
```

### Reset MinIO
```bash
# Stop and remove MinIO data
docker-compose down
docker volume rm thechromecollective_minio_data

# Restart
docker-compose up -d
```

## 📊 MinIO Web Console Features

### Bucket Management
- Create/delete buckets
- Set bucket policies
- Monitor storage usage

### Object Management
- Upload/download files
- Set object metadata
- Manage object lifecycle

### Access Control
- Manage access keys
- Set bucket policies
- Monitor access logs

## 🔒 Security Notes

### Development Environment
- Default credentials are for development only
- Change credentials in production
- Use environment variables for sensitive data

### Production Considerations
- Enable SSL/TLS
- Use strong access keys
- Implement proper IAM policies
- Regular access key rotation

## 📚 API Reference

### Upload Endpoints
- `POST /api/uploads/presign` - Get presigned URL for upload
- `GET /api/uploads/url/:fileKey` - Get public URL for file

### MinIO Client Methods
```javascript
// List buckets
const buckets = await minioClient.listBuckets();

// Check bucket exists
const exists = await minioClient.bucketExists('bucket-name');

// Upload file
await minioClient.putObject('bucket-name', 'file-key', fileStream);

// Get file
const fileStream = await minioClient.getObject('bucket-name', 'file-key');
```

## 🎯 Next Steps

1. **Test MinIO Setup**: Run `node scripts/test-minio.js`
2. **Verify Web Console**: Visit http://localhost:9001
3. **Test Image Upload**: Try uploading an image through your app
4. **Monitor Logs**: Check `docker-compose logs minio` for any errors

## 📞 Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify all containers are up: `docker-compose ps`
3. Check MinIO logs: `docker-compose logs minio`
4. Test connection: `node scripts/test-minio.js`
