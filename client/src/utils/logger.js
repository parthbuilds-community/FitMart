/**
 * Global Error Logger
 * 
 * Captures unhandled exceptions and promise rejections across the application.
 * In a production environment, this could be connected to Sentry, Datadog, or a custom backend endpoint.
 */

export function initGlobalLogger() {
  if (typeof window === 'undefined') return;

  // Catch synchronous runtime errors
  window.addEventListener('error', (event) => {
    console.error('[Global Error Logger] Caught unhandled error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
    
    // Future: Send to remote logging service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(...) });
  });

  // Catch unhandled asynchronous promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global Error Logger] Caught unhandled promise rejection:', {
      reason: event.reason,
    });
    
    // Future: Send to remote logging service
  });

  console.log('[Global Error Logger] Initialized.');
}
