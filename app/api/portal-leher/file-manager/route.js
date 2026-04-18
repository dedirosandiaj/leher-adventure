import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDriveClient } from '@/lib/google-drive';

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
