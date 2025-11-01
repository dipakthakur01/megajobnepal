import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging for debugging
    console.group('🔴 ErrorBoundary caught an error');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    
    // Store error details for display
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-xl">⚠</span>
              </div>
              <h2 className="text-red-600 text-lg font-medium mb-4">Something went wrong</h2>
              <p className="text-gray-600 text-sm mb-6">
                An unexpected error occurred while loading the application.
              </p>
              {this.state.error && (
                <details className="text-xs bg-gray-100 p-3 rounded-md mb-4">
                  <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-all text-left">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={this.resetError} 
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component version for simple error handling
export function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
