import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// MinIO S3 Client configuration
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://s3.ucentric.id',
  region: 'us-east-1', // MinIO doesn't use region, but SDK requires it
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'oXIbZJQ9bJQHnvu0',
    secretAccessKey: process.env.S3_SECRET_KEY || 'r204fGZT9SEqqNzAYOSCM0GriNPrjaTh',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'leheradventure';

/**
 * Upload file to MinIO S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - File key/path in bucket
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadToS3(buffer, key, contentType = 'image/webp') {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  
  // Upload dengan PutObjectCommand
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  
  // Return public URL
  return `${process.env.S3_ENDPOINT || 'https://s3.ucentric.id'}/${BUCKET_NAME}/${key}`;
}

/**
 * Delete file from MinIO S3
 * @param {string} key - File key/path in bucket
 */
export async function deleteFromS3(key) {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}

/**
 * Extract key from S3 URL
 * @param {string} url - S3 URL
 * @returns {string} - Key
 */
export function getKeyFromUrl(url) {
  if (!url) return null;
  const baseUrl = `${process.env.S3_ENDPOINT || 'https://s3.ucentric.id'}/${BUCKET_NAME}/`;
  return url.replace(baseUrl, '');
}

/**
 * Get presigned URL for viewing (if bucket is private)
 * @param {string} key - File key
 * @param {number} expiresIn - Expiration in seconds (default 1 hour)
 * @returns {Promise<string>} - Presigned URL
 */
export async function getPresignedUrl(key, expiresIn = 3600) {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
}

export { s3Client, BUCKET_NAME };
