const { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

// Initialize S3 client for MinIO
const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123'
  },
  forcePathStyle: true
});

const BUCKET_NAME = 'chrome-collective-images';

async function testMinIO() {
  try {
    console.log('🧪 Testing MinIO connection and bucket creation...');
    
    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists`);
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        // Create bucket if it doesn't exist
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`✅ Created bucket '${BUCKET_NAME}'`);
      } else {
        throw error;
      }
    }
    
    // Test upload a simple file
    const testContent = 'Hello MinIO! This is a test file.';
    const testKey = 'test/hello.txt';
    
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    }));
    
    console.log(`✅ Successfully uploaded test file to '${BUCKET_NAME}/${testKey}'`);
    console.log(`🌐 You can view it at: http://localhost:9000/${BUCKET_NAME}/${testKey}`);
    console.log('🎉 MinIO is working perfectly!');
    
  } catch (error) {
    console.error('❌ MinIO test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure MinIO is running: docker-compose ps');
    console.log('2. Check MinIO logs: docker-compose logs minio');
    console.log('3. Verify MinIO console: http://localhost:9001');
  }
}

testMinIO();
