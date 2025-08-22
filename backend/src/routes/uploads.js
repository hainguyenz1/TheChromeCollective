const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Initialize S3 client for MinIO
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'chrome-hearts';

// Generate pre-signed URL for image upload
router.post('/presign', async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ 
        error: 'fileName and contentType are required' 
      });
    }

    // Generate unique key for the file
    const fileKey = `products/${crypto.randomUUID()}-${fileName}`;
    
    // Create command for S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      // Optional: Add metadata
      Metadata: {
        'uploaded-by': 'chrome-collective',
        'upload-date': new Date().toISOString()
      }
    });

    // Generate pre-signed URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });

    // Generate public URL for the uploaded file
    const publicUrl = `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${BUCKET_NAME}/${fileKey}`;

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
    const publicUrl = `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${BUCKET_NAME}/${fileKey}`;
    
    res.json({ publicUrl });
  } catch (error) {
    console.error('Error getting file URL:', error);
    res.status(500).json({ 
      error: 'Failed to get file URL' 
    });
  }
});

module.exports = router;
