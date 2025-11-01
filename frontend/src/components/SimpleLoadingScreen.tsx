import React, { useState, useEffect } from 'react';

interface SimpleLoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  maxDuration?: number; // Maximum time to show loading screen
  onTimeout?: () => void; // Callback when timeout is reached
}

export function SimpleLoadingScreen({ 
  message = "Loading MegaJobNepal...", 
  showLogo = true,
  maxDuration = 5000, // 5 seconds default
  onTimeout
}: SimpleLoadingScreenProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, maxDuration);

    return () => clearTimeout(timeoutId);
  }, [maxDuration, onTimeout]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {showLogo && (
          <div className="mb-6">
            <div className="h-20 w-auto mx-auto flex items-center justify-center">
              <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">MJ</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        
        <p className="text-muted-foreground">
          {message}
        </p>
        
        <div className="mt-2 text-xs text-muted-foreground/70">
          {showTimeout ? 
            "Taking longer than expected... Please refresh if this continues." :
            "Please wait while we prepare your experience"
          }
        </div>

        {showTimeout && (
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
}
