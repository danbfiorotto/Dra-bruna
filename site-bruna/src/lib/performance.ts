// Performance optimization utilities

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      imageElement.src = imageElement.dataset.src || '';
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Optimize third-party scripts loading
 */
export function optimizeThirdPartyScripts() {
  if (typeof window === 'undefined') return;

  // Load non-critical scripts after page load
  window.addEventListener('load', () => {
    // Load analytics or other non-critical scripts here
    console.log('Page loaded, ready for non-critical scripts');
  });
}

/**
 * Initialize performance optimizations
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Initialize lazy loading
  lazyLoadImages();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Optimize third-party scripts
  optimizeThirdPartyScripts();
}
