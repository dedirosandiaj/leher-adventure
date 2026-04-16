import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { verifyToken } from '@/lib/auth';

// Helper function to properly format private key
function formatPrivateKey(key) {
  if (!key) return null;
  
  let formatted = key;
  
  // Method 1: If key contains literal \n (backslash-n), replace with actual newlines
  if (formatted.includes('\\n')) {
    formatted = formatted.replace(/\\n/g, '\n');
  }
  
  // Method 2: Trim whitespace
  formatted = formatted.trim();
  
  // Method 3: Ensure proper PEM format
  // Remove existing headers if they exist without proper newlines
  formatted = formatted.replace(/-----BEGIN PRIVATE KEY-----/g, '');
  formatted = formatted.replace(/-----END PRIVATE KEY-----/g, '');
  formatted = formatted.trim();
  
  // Add proper headers
  formatted = '-----BEGIN PRIVATE KEY-----\n' + formatted + '\n-----END PRIVATE KEY-----\n';
  
  return formatted;
}

// Initialize Google Drive API
function getDriveClient() {
  const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_session')?.value;
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(adminToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id: fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const drive = getDriveClient();

    // Get file metadata to get download URL
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    // Download the file (thumbnail)
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const mimeType = file.data.mimeType || 'image/jpeg';
    
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
