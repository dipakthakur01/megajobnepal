import React from 'react';

export function EmergencyApp({ error }: { error?: Error; resetError?: () => void }) {
  // Log the error details if provided
  React.useEffect(() => {
    if (error) {
      console.group('🔴 Emergency Mode Activated');
      console.error('Error:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }
  }, [error]);

  const handleReload = () => {
    try {
      console.log('🔄 Attempting to reload application...');
      
      // Clear any problematic localStorage
      const keysToCheck = [
        'postgresql_megajob_db_users',
        'postgresql_megajob_db_jobs',
        'postgresql_megajob_db_companies'
      ];
      
      keysToCheck.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data || data === 'undefined' || data === 'null') {
            console.log(`Removing invalid key: ${key}`);
            localStorage.removeItem(key);
          }
        } catch (e) {
          console.log(`Error checking key ${key}:`, e);
          localStorage.removeItem(key);
        }
      });
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error during reload:', error);
      window.location.reload();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '2rem'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>🚀</div>
        
        <h1 style={{
          fontSize: '2rem',
          color: '#FF6600',
          marginBottom: '1rem',
          fontWeight: '700'
        }}>
          MegaJobNepal
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Nepal's Premier Job Portal
        </p>
        
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <p style={{
            color: '#92400e',
            fontSize: '0.9rem',
            margin: 0,
            marginBottom: error ? '0.5rem' : 0
          }}>
            ⚡ Emergency mode - App loading optimized
          </p>
          {error && (
            <details style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              textAlign: 'left',
              color: '#92400e'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#fffbeb',
                borderRadius: '0.25rem',
                overflow: 'auto',
                fontSize: '0.75rem'
              }}>
                {error.message || 'Unknown error'}
              </pre>
            </details>
          )}
        </div>
        
        <button 
          onClick={handleReload}
          style={{
            backgroundColor: '#FF6600',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e55d00';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6600';
          }}
        >
          Initialize App
        </button>
        
        <div style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#9ca3af'
        }}>
          <p>If you continue to see this screen, try:</p>
          <ul style={{
            textAlign: 'left',
            marginTop: '0.5rem',
            paddingLeft: '1rem'
          }}>
            <li>Clear browser cache</li>
            <li>Disable browser extensions</li>
            <li>Try incognito/private mode</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
