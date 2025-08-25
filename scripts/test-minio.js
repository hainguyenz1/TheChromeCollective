const { Client } = require('minio');

// Test MinIO connection and bucket access
async function testMinIO() {
  console.log('🧪 Testing MinIO connection...');
  
  const minioClient = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin123'
  });

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ MinIO connection successful!');
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    // Test bucket access
    const bucketName = 'chrome-collective-images';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' exists and is accessible`);
      
      // List objects in bucket
      const objects = await minioClient.listObjects(bucketName, '', true);
      console.log(`📁 Objects in bucket: ${objects.length}`);
      
    } else {
      console.log(`❌ Bucket '${bucketName}' does not exist`);
    }
    
  } catch (error) {
    console.error('❌ MinIO test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure Docker Desktop is running');
    console.log('2. Run: docker-compose up -d');
    console.log('3. Check if MinIO container is running: docker ps');
    console.log('4. Wait a few seconds for MinIO to fully start');
  }
}

testMinIO();
