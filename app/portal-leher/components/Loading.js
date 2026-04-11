'use client';
import styles from './Loading.module.css';

// Spinner Component
export function Spinner({ size = 'medium', className = '' }) {
  const sizeClass = styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`];
  
  return (
    <span className={`${styles.spinner} ${sizeClass} ${className}`}>
      <svg 
        className={styles.spinnerSvg}
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24"
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="10"
        />
      </svg>
    </span>
  );
}

// Button Loading Component
export function ButtonLoading({ children, isLoading, ...props }) {
  return (
    <button 
      {...props} 
      disabled={isLoading || props.disabled}
      className={`${props.className || ''} ${isLoading ? styles.buttonLoading : ''}`}
    >
      {children}
    </button>
  );
}

// Skeleton Components
export function Skeleton({ className = '', style = {} }) {
  return (
    <div className={`${styles.skeleton} ${className}`} style={style} />
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles.skeletonText}`} />
      ))}
    </div>
  );
}

export function SkeletonTitle({ className = '' }) {
  return (
    <div className={`${styles.skeleton} ${styles.skeletonTitle} ${className}`} />
  );
}

export function SkeletonAvatar({ className = '' }) {
  return (
    <div className={`${styles.skeleton} ${styles.skeletonAvatar} ${className}`} />
  );
}

export function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      {children || (
        <>
          <div className={styles.contentLoaderItem}>
            <SkeletonAvatar />
            <div style={{ flex: 1 }}>
              <SkeletonTitle />
              <SkeletonText lines={2} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = '' }) {
  return (
    <div className={`${styles.skeletonTable} ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={`${styles.skeleton} ${styles.skeletonCell}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCell}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCell}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCell}`} />
        </div>
      ))}
    </div>
  );
}

// Page Loader Component
export function PageLoader({ text = 'Memuat...', className = '' }) {
  return (
    <div className={`${styles.pageLoader} ${className}`}>
      <Spinner size="large" />
      <span className={styles.pageLoaderText}>{text}</span>
    </div>
  );
}

// Progress Bar Component
export function ProgressBar({ progress, animated = false, className = '' }) {
  return (
    <div className={`${styles.progressContainer} ${className}`}>
      <div 
        className={`${styles.progressBar} ${animated ? styles.progressBarAnimated : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Empty State Component
export function EmptyState({ 
  icon, 
  title = 'Tidak ada data', 
  message = 'Belum ada data yang tersedia.',
  className = '' 
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && (
        <div className={styles.emptyStateIcon}>
          {icon}
        </div>
      )}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateMessage}>{message}</p>
    </div>
  );
}

// Overlay Loading Component
export function OverlayLoading({ className = '' }) {
  return (
    <div className={`${styles.overlayLoading} ${className}`}>
      <Spinner size="large" />
    </div>
  );
}

// Inline Loading Component
export function InlineLoading({ text = 'Memuat...', className = '' }) {
  return (
    <span className={`${styles.inlineLoading} ${className}`}>
      <Spinner size="small" />
      <span>{text}</span>
    </span>
  );
}

// Dots Loading Component
export function DotsLoading({ className = '' }) {
  return (
    <span className={`${styles.dotsLoading} ${className}`}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}

// Content Loader Component
export function ContentLoader({ items = 3, className = '' }) {
  return (
    <div className={`${styles.contentLoader} ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className={styles.contentLoaderItem}>
          <SkeletonAvatar />
          <div style={{ flex: 1 }}>
            <SkeletonTitle />
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  Spinner,
  ButtonLoading,
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  PageLoader,
  ProgressBar,
  EmptyState,
  OverlayLoading,
  InlineLoading,
  DotsLoading,
  ContentLoader,
};
