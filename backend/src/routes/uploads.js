const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Initialize S3 client for MinIO
const s3Client = new S3Client({
  endpoint: `http://localhost:9000`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123'
  },
  forcePathStyle: true // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'chrome-collective-images';

// Ensure bucket exists
async function ensureBucketExists() {
  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Bucket '${BUCKET_NAME}' already exists`);
  } catch (error) {
    if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
      try {
        // Create bucket if it doesn't exist
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`✅ Created bucket '${BUCKET_NAME}'`);
      } catch (createError) {
        console.error(`❌ Failed to create bucket '${BUCKET_NAME}':`, createError);
        throw createError;
      }
    } else {
      console.error(`❌ Error checking bucket '${BUCKET_NAME}':`, error);
      throw error;
    }
  }
}

// Generate pre-signed URL for image upload
router.post('/presign', async (req, res) => {
  try {
    // Ensure bucket exists before proceeding
    await ensureBucketExists();
    const { fileName, contentType, prefix = '' } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ 
        error: 'fileName and contentType are required' 
      });
    }

    // Generate unique key for the file with optional prefix
    const fileKey = prefix ? `${prefix}/${crypto.randomUUID()}-${fileName}` : `${crypto.randomUUID()}-${fileName}`;
    
    console.log('Generated file key:', fileKey);
    console.log('Prefix used:', prefix);
    
    // Create command for S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      // Optional: Add metadata
      Metadata: {
        'uploaded-by': 'chrome-collective',
        'upload-date': new Date().toISOString(),
        'prefix': prefix || 'none'
      }
    });

    // Generate pre-signed URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });

    // Generate public URL for the uploaded file
    const publicUrl = `http://localhost:9000/${BUCKET_NAME}/${fileKey}`;
    console.log('Generated public URL:', publicUrl);
    console.log('File key:', fileKey);
    console.log('Bucket name:', BUCKET_NAME);

    res.json({
      presignedUrl,
      fileKey,
      publicUrl,
      expiresIn: 3600
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL' 
    });
  }
});

// Get public URL for an existing file
router.get('/url/:fileKey', async (req, res) => {
  try {
    const { fileKey } = req.params;
    const publicUrl = `http://localhost:9000/${BUCKET_NAME}/${fileKey}`;
    
    res.json({ publicUrl });
  } catch (error) {
    console.error('Error getting file URL:', error);
    res.status(500).json({ 
      error: 'Failed to get file URL' 
    });
  }
});

module.exports = router;
