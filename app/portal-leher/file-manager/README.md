# File Manager - Google Drive Integration

## Files Structure

```
file-manager/
├── page.js                    # Server component (entry point)
└── FileManagerClient.js       # Client component (UI)

../api/portal-leher/file-manager/
└── route.js                   # API route for Google Drive operations
```

## What Was Added

1. **Menu Item**: Added "File Manager" to the sidebar navigation with a folder icon
2. **Page**: Created `/portal-leher/file-manager` page
3. **API Route**: Created `/api/portal-leher/file-manager` endpoint
4. **Package**: Installed `googleapis` package

## Features

✅ Browse files and folders from Google Drive
✅ Navigate through folders with back button
✅ View file metadata (name, size, type, modified date)
✅ Open files in Google Drive (new tab)
✅ Support for all file types (images, videos, PDFs, documents, etc.)
✅ Responsive UI with hover effects
✅ Admin authentication required

## Setup Required

Before using this feature, you need to configure Google Drive API credentials.

See [GOOGLE_DRIVE_SETUP.md](../../../GOOGLE_DRIVE_SETUP.md) for detailed setup instructions.

## Quick Start

1. Follow the setup guide in `GOOGLE_DRIVE_SETUP.md`
2. Add environment variables to `.env` file
3. Restart the server: `npm run dev`
4. Login to admin portal and click "File Manager"

## Security

- Read-only access to Google Drive
- Protected by admin authentication
- Service account credentials stored in environment variables
- No file upload/delete functionality (view only)
