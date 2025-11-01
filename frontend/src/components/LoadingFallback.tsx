import React, { useEffect, useState } from 'react';

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full"></div>
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Loading MegaJobNepal</h2>
          <p className="text-sm text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}

// Ultra-minimal loading for critical components
export function FastLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  );
}

export function ComponentError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center text-red-600">
        <h2 className="text-lg font-semibold mb-2">Component Error</h2>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2 text-gray-500">Check the console for more details</p>
      </div>
    </div>
  );
}
