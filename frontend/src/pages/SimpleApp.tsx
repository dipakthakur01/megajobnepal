import React from 'react';

export function SimpleApp() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-4">
            🚀 MegaJobNepal
          </h1>
          <p className="text-gray-600 mb-6">
            Nepal's Premier Job Portal
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              ✅ App loaded successfully!
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
