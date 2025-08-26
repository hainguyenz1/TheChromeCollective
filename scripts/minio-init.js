const { Client } = require('minio');

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

async function initializeMinIO() {
  try {
    console.log('🔄 Initializing MinIO...');
    
    // Check if bucket exists, create if it doesn't
    const bucketName = process.env.MINIO_BUCKET || 'chrome-collective-images';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      
      // Set bucket policy to allow public read access for images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Bucket ${bucketName} created successfully with public read access`);
      
      // Set CORS policy to allow cross-origin requests from frontend
      const corsPolicy = [
        {
          AllowedOrigin: ['*'],
          AllowedMethod: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedHeader: ['*'],
          ExposeHeader: ['ETag', 'Content-Length', 'Content-Type'],
          MaxAgeSeconds: 3000
        }
      ];
      
      await minioClient.setBucketCors(bucketName, corsPolicy);
      console.log(`✅ CORS policy set for bucket ${bucketName}`);
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
      
      // Update CORS policy even if bucket exists
      try {
        const corsPolicy = [
          {
            AllowedOrigin: ['*'],
            AllowedMethod: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedHeader: ['*'],
            ExposeHeader: ['ETag', 'Content-Length', 'Content-Type'],
            MaxAgeSeconds: 3000
          }
        ];
        
        await minioClient.setBucketCors(bucketName, corsPolicy);
        console.log(`✅ CORS policy updated for bucket ${bucketName}`);
      } catch (corsError) {
        console.log(`⚠️ Could not update CORS policy: ${corsError.message}`);
      }
    }
    
    console.log('🎉 MinIO initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing MinIO:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeMinIO();
}

module.exports = { initializeMinIO };
