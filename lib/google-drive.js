import { google } from 'googleapis';

// Alternative: Load credentials from JSON string
export function getDriveClientFromJson() {
  try {
    // Try to get full JSON credentials from env
    const jsonCredentials = process.env.GOOGLE_CREDENTIALS_JSON;
    
    if (jsonCredentials) {
      // Parse JSON directly
      const credentials = JSON.parse(jsonCredentials);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      return google.drive({ version: 'v3', auth });
    }
    
    return null;
  } catch (error) {
    console.error('Error loading Google credentials from JSON:', error);
    return null;
  }
}

// Helper function to properly format private key (fallback method)
export function formatPrivateKey(key) {
  if (!key) return null;
  
  console.log('DEBUG - Original key length:', key.length);
  console.log('DEBUG - Key starts with:', key.substring(0, 50));
  
  let formatted = key;
  
  // Remove all types of quotes if present
  formatted = formatted.replace(/^['"]|['"]$/g, '');
  
  // Handle different newline formats
  if (formatted.includes('\\n')) {
    console.log('DEBUG - Found escaped newlines, replacing...');
    formatted = formatted.replace(/\\n/g, '\n');
  }
  
  // Trim whitespace
  formatted = formatted.trim();
  
  // Remove existing headers
  formatted = formatted.replace(/-----BEGIN PRIVATE KEY-----/g, '');
  formatted = formatted.replace(/-----END PRIVATE KEY-----/g, '');
  formatted = formatted.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '');
  formatted = formatted.replace(/-----END RSA PRIVATE KEY-----/g, '');
  formatted = formatted.trim();
  
  // Remove all newlines and spaces to get clean base64
  formatted = formatted.replace(/\s+/g, '');
  
  console.log('DEBUG - Clean base64 length:', formatted.length);
  
  // Reconstruct with proper PEM format
  // Add newline every 64 characters (standard PEM format)
  const lines = [];
  for (let i = 0; i < formatted.length; i += 64) {
    lines.push(formatted.substring(i, i + 64));
  }
  
  formatted = '-----BEGIN PRIVATE KEY-----\n' + 
              lines.join('\n') + 
              '\n-----END PRIVATE KEY-----\n';
  
  console.log('DEBUG - Final formatted key length:', formatted.length);
  console.log('DEBUG - Final key starts with:', formatted.substring(0, 50));
  
  return formatted;
}

export function getDriveClientFromEnv() {
  const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  
  if (!privateKey) {
    console.error('No private key available');
    return null;
  }
  
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
  });

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

// Main export - try JSON first, fallback to individual env vars
export function getDriveClient() {
  // Try JSON method first (more reliable)
  const clientFromJson = getDriveClientFromJson();
  if (clientFromJson) {
    console.log('Using Google Drive client from JSON credentials');
    return clientFromJson;
  }
  
  // Fallback to individual env vars
  console.log('Using Google Drive client from individual environment variables');
  return getDriveClientFromEnv();
}
