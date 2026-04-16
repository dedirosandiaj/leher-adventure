'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../crud.module.css';
import { PageLoader } from '../components/Loading';
import { useToast } from '../components/Toast';

// Icon components
const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const FileIcon = ({ type }) => {
  const isImage = type?.startsWith('image/');
  const isVideo = type?.startsWith('video/');
  const isPDF = type === 'application/pdf';
  
  if (isImage) {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    );
  }
  
  if (isVideo) {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    );
  }
  
  if (isPDF) {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    );
  }
  
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  );
};

export default function FileManagerClient() {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({ id: null, name: 'Google Drive' });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { toast } = useToast();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchFiles = async (folderId = null, pageToken = null, append = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (folderId) {
        params.append('folderId', folderId);
      }
      if (pageToken) {
        params.append('pageToken', pageToken);
      }
      
      const response = await fetch(`/api/portal-leher/file-manager?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch files (${response.status})`);
      }
      
      const data = await response.json();
      
      if (append) {
        // Filter out duplicates based on file ID
        setFiles(prev => {
          const existingIds = new Set(prev.map(f => f.id));
          const newFiles = (data.files || []).filter(f => !existingIds.has(f.id));
          return [...prev, ...newFiles];
        });
      } else {
        setFiles(data.files || []);
      }
      
      setCurrentFolder(data.currentFolder || { id: null, name: 'Google Drive' });
      setPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Gagal memuat file dari Google Drive. Pastikan konfigurasi API sudah benar.');
      toast.error('Gagal memuat file');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFolderClick = (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      setFolderHistory([...folderHistory, { id: currentFolder.id, name: currentFolder.name }]);
      fetchFiles(file.id, null, false);
    }
  };

  const handleBack = () => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setFolderHistory(folderHistory.slice(0, -1));
      fetchFiles(previousFolder.id, null, false);
    } else {
      fetchFiles(null, null, false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchFiles(currentFolder.id, pageToken, true);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, pageToken, currentFolder.id]);

  const handleFileClick = (file) => {
    console.log('File clicked:', file);
    // Check if file is an image
    const isImage = file.mimeType?.startsWith('image/');
    console.log('Is image:', isImage, 'Thumbnail URL:', file.thumbnailUrl);
    if (isImage && file.thumbnailUrl) {
      console.log('Opening modal with:', file.thumbnailUrl);
      setPreviewImage(file);
    } else if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileType = (mimeType) => {
    if (!mimeType) return 'File';
    if (mimeType === 'application/vnd.google-apps.folder') return 'Folder';
    if (mimeType.startsWith('image/')) return 'Gambar';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
    if (mimeType.includes('document')) return 'Dokumen';
    if (mimeType.includes('presentation')) return 'Presentasi';
    return 'File';
  };

  if (loading) {
    return <PageLoader text="Memuat file dari Google Drive..." />;
  }

  return (
    <div>
      <header className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          {folderHistory.length > 0 && (
            <button
              onClick={handleBack}
              style={{
                background: 'var(--primary, #2b4d59)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Kembali
            </button>
          )}
          <h1 className={styles.pageTitle}>
            File Manager - {currentFolder.name}
          </h1>
        </div>
        <p className={styles.pageSubtitle}>
          Kelola dan akses file dari Google Drive
        </p>
      </header>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: '#c33',
        }}>
          <p style={{ margin: 0, fontWeight: 500 }}>⚠️ {error}</p>
        </div>
      )}

      <div className={styles.sectionCard}>
        {files.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Folder ini kosong</p>
            <p style={{ fontSize: '0.9rem' }}>Upload file ke Google Drive untuk melihatnya di sini</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1.5rem',
            }}>
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                const isImage = file.mimeType?.startsWith('image/') && !file.mimeType?.includes('heic');
                const isVideo = file.mimeType?.startsWith('video/');
                const isPDF = file.mimeType === 'application/pdf';
                const isHEIC = file.mimeType?.includes('heic') || file.name?.toLowerCase().endsWith('.heic') || file.name?.toLowerCase().endsWith('.heif');
                
                return (
                  <div
                    key={file.id}
                    onClick={() => isFolder ? handleFolderClick(file) : handleFileClick(file)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '180px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                      e.currentTarget.style.borderColor = 'var(--primary, #2b4d59)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  >
                    {/* File Icon/Thumbnail */}
                    <div style={{
                      width: '100%',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      background: isFolder ? 'linear-gradient(135deg, #f2bb50 0%, #e6a840 100%)' : isHEIC ? 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)' : '#f8f9fa',
                      borderRadius: '8px',
                      color: isFolder ? 'white' : isHEIC ? 'white' : (isImage ? '#3498db' : isVideo ? '#e74c3c' : isPDF ? '#e74c3c' : '#666'),
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {isImage && file.thumbnailUrl ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            // Fallback to icon if thumbnail fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Icon fallback (hidden if image loads) */}
                      <div style={{ display: isImage && file.thumbnailUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        {isFolder ? (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
                          </svg>
                        ) : isHEIC ? (
                          <>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '-4px' }}>HEIC</span>
                          </>
                        ) : isImage ? (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        ) : isVideo ? (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        ) : isPDF ? (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* File Name */}
                    <div style={{
                      width: '100%',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#2b4d59',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.3',
                      minHeight: '2.2em',
                    }}>
                      {file.name}
                    </div>

                    {/* File Meta */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#999',
                      width: '100%',
                    }}>
                      {!isFolder && file.size && (
                        <div style={{ marginBottom: '0.25rem' }}>{formatFileSize(file.size)}</div>
                      )}
                      <div>{formatDate(file.modifiedTime)}</div>
                    </div>

                    {/* Hover overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(43, 77, 89, 0.05)',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      pointerEvents: 'none',
                    }} className="hover-overlay" />
                  </div>
                );
              })}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} style={{ 
                textAlign: 'center', 
                padding: '2rem',
                marginTop: '1rem',
              }}>
                {loadingMore && (
                  <div style={{ color: '#666' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.416" strokeDashoffset="10" />
                    </svg>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Memuat lebih banyak...</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.sectionCard} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>Informasi</h2>
        <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
          <li>Klik folder untuk membuka dan melihat isinya</li>
          <li>Klik file untuk membuka di Google Drive (tab baru)</li>
          <li>Gunakan tombol "Kembali" untuk navigasi ke folder sebelumnya</li>
          <li>File yang ditampilkan hanya bisa dilihat, tidak bisa diupload/dihapus dari sini</li>
        </ul>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className={styles.imageModalOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className={styles.imageModalContent}
            onClick={e => e.stopPropagation()}
          >
            <button 
              className={styles.imageModalCloseBtn} 
              onClick={() => setPreviewImage(null)}
              title="Tutup"
            >
              ✕
            </button>
            <div className={styles.imageModalImageWrapper}>
              <img 
                src={previewImage.thumbnailUrl} 
                alt={previewImage.name}
                className={styles.imageModalImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
