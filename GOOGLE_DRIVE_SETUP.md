# File Manager - Google Drive Integration Setup

## Overview
The File Manager feature allows you to browse and access files from Google Drive directly in the admin portal.

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Service account name: `leher-adventure-file-manager`
   - Service account ID: will be auto-generated
   - Description: `Service account for accessing Google Drive files`
4. Click "Create and Continue"
5. Skip the roles assignment (we'll use domain-wide delegation later)
6. Click "Done"

### 3. Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select **JSON** format
5. Click "Create" - the JSON file will be downloaded

### 4. Share Google Drive Folder

1. Open Google Drive in your browser
2. Create a folder (or use an existing one) that you want to share with the admin portal
3. Right-click the folder > "Share"
4. Copy the **client_email** from your service account JSON file
5. Paste the email address and share the folder with **Viewer** or **Editor** access
6. **Important**: Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy everything after `/folders/`

### 5. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Google Drive Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project-id.iam.gserviceaccount.com
GOOGLE_DRIVE_ROOT_FOLDER=your-folder-id-from-step-4
```

#### How to get these values from the JSON file:

Open the downloaded JSON file and map the values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",                    → GOOGLE_PROJECT_ID
  "private_key_id": "your-private-key-id",            → GOOGLE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  → GOOGLE_PRIVATE_KEY (keep \n as is)
  "client_email": "your-sa@project.iam.gserviceaccount.com", → GOOGLE_CLIENT_EMAIL
  "client_id": "123456789",                           → GOOGLE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...", → GOOGLE_CLIENT_X509_CERT_URL
  "universe_domain": "googleapis.com"
}
```

### 6. Test the Integration

1. Restart your development server: `npm run dev`
2. Login to the admin portal: `/login-leher`
3. Click on "File Manager" in the sidebar
4. You should see the files and folders from your Google Drive

## Features

- ✅ Browse files and folders from Google Drive
- ✅ Navigate through folders with breadcrumb history
- ✅ View file information (name, size, modified date, type)
- ✅ Open files in Google Drive (new tab)
- ✅ Support for various file types (images, videos, PDFs, documents, etc.)
- ✅ Responsive design with hover effects

## Security Notes

- The service account has **read-only** access to Google Drive
- Only shared folders will be accessible
- Never commit the JSON key file to version control
- Use environment variables to store sensitive credentials
- The API route is protected with admin authentication

## Troubleshooting

### Error: "Failed to fetch files from Google Drive"

1. Check if all environment variables are set correctly
2. Verify the service account has access to the shared folder
3. Ensure the Google Drive API is enabled in your Google Cloud project
4. Check the server console for detailed error messages

### Error: "Permission denied"

1. Make sure you shared the folder with the service account's email
2. Verify the folder ID is correct
3. Check if the service account has at least "Viewer" access

### Files not showing up

1. Verify the `GOOGLE_DRIVE_ROOT_FOLDER` is set to the correct folder ID
2. Ensure the folder contains files
3. Check if files are not in the trash

## API Endpoint

- **GET** `/api/portal-leher/file-manager`
  - Query parameters:
    - `folderId` (optional): ID of the folder to browse
    - `parentId` (optional): Parent folder ID (defaults to `GOOGLE_DRIVE_ROOT_FOLDER`)
  - Returns: List of files and folders with metadata

## Need Help?

If you encounter any issues:
1. Check the server logs for error messages
2. Verify all environment variables are correctly set
3. Ensure the Google Drive API is properly configured
4. Contact support for assistance
