import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { verifyToken } from '@/lib/auth';

// Initialize Google Drive API
function getDriveClient() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken');
    const pageSize = 50; // Number of images per page

    const drive = getDriveClient();

    // Search for all images in Google Drive (excluding trash)
    // Use 'mimeType contains "image/"' to get all image types
    const response = await drive.files.list({
      q: 'mimeType contains "image/" and trashed = false',
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink), nextPageToken',
      orderBy: 'modifiedTime desc',
      pageSize: pageSize,
      pageToken: pageToken || undefined,
    });

    // Add thumbnail URL for images - use our proxy endpoint
    const filesWithThumbnails = (response.data.files || []).map(file => {
      if (file.id) {
        return {
          ...file,
          thumbnailUrl: `/api/portal-leher/file-manager/image/${file.id}`,
        };
      }
      return file;
    });

    return NextResponse.json({
      files: filesWithThumbnails,
      total: filesWithThumbnails.length,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Google Drive' },
      { status: 500 }
    );
  }
}
