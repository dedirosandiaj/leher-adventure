import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { verifyToken } from '@/lib/auth';

// Helper function to properly format private key
function formatPrivateKey(key) {
  if (!key) return null;
  
  // Replace escaped newlines with actual newlines
  let formatted = key.replace(/\\n/g, '\n');
  
  // Ensure proper PEM format
  if (!formatted.startsWith('-----BEGIN PRIVATE KEY-----')) {
    formatted = '-----BEGIN PRIVATE KEY-----\n' + formatted;
  }
  if (!formatted.endsWith('-----END PRIVATE KEY-----\n')) {
    formatted = formatted + '\n-----END PRIVATE KEY-----\n';
  }
  
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

  console.log('Google Drive credentials loaded:', {
    project_id: credentials.project_id,
    client_email: credentials.client_email,
    private_key_exists: !!credentials.private_key,
    private_key_length: credentials.private_key?.length || 0,
    private_key_starts_correctly: credentials.private_key?.startsWith('-----BEGIN PRIVATE KEY-----'),
    private_key_ends_correctly: credentials.private_key?.endsWith('-----END PRIVATE KEY-----\n'),
  });

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
    const folderId = searchParams.get('folderId');
    const pageToken = searchParams.get('pageToken');
    const parentId = searchParams.get('parentId') || process.env.GOOGLE_DRIVE_ROOT_FOLDER;
    const pageSize = 50; // Number of files per page

    const drive = getDriveClient();

    // If no folderId provided, list root folder or specified parent
    if (!folderId) {
      const response = await drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink)',
        orderBy: 'folder,name',
        pageSize: pageSize,
        pageToken: pageToken || undefined,
      });

      // Add thumbnail URL for images - use our proxy endpoint
      const filesWithThumbnails = (response.data.files || []).map(file => {
        if (file.mimeType?.startsWith('image/') && file.id) {
          return {
            ...file,
            thumbnailUrl: `/api/portal-leher/file-manager/image/${file.id}`,
          };
        }
        return file;
      });

      return NextResponse.json({
        files: filesWithThumbnails,
        currentFolder: { id: parentId, name: 'Root' },
        nextPageToken: response.data.nextPageToken || null,
      });
    }

    // Get folder info and its contents
    const [folderInfo, filesResponse] = await Promise.all([
      drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType',
      }),
      drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink), nextPageToken',
        orderBy: 'folder,name',
        pageSize: pageSize,
        pageToken: pageToken || undefined,
      }),
    ]);

    // Add thumbnail URL for images - use our proxy endpoint
    const filesWithThumbnails = (filesResponse.data.files || []).map(file => {
      if (file.mimeType?.startsWith('image/') && file.id) {
        return {
          ...file,
          thumbnailUrl: `/api/portal-leher/file-manager/image/${file.id}`,
        };
      }
      return file;
    });

    return NextResponse.json({
      files: filesWithThumbnails,
      currentFolder: {
        id: folderInfo.data.id,
        name: folderInfo.data.name,
        parents: folderInfo.data.parents,
      },
      nextPageToken: filesResponse.data.nextPageToken || null,
    });
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files from Google Drive' },
      { status: 500 }
    );
  }
}
