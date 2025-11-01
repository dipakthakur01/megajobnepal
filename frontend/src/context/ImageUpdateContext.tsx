import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ImageUpdateContextType {
  imageUpdateTrigger: number;
  triggerImageUpdate: () => void;
  forceRefreshImages: () => void;
}

const ImageUpdateContext = createContext<ImageUpdateContextType | undefined>(undefined);

export const useImageUpdate = () => {
  const context = useContext(ImageUpdateContext);
  if (!context) {
    throw new Error('useImageUpdate must be used within an ImageUpdateProvider');
  }
  return context;
};

interface ImageUpdateProviderProps {
  children: ReactNode;
}

export const ImageUpdateProvider: React.FC<ImageUpdateProviderProps> = ({ children }) => {
  const [imageUpdateTrigger, setImageUpdateTrigger] = useState(0);

  const triggerImageUpdate = useCallback(() => {
    setImageUpdateTrigger(prev => prev + 1);
  }, []);

  const forceRefreshImages = useCallback(() => {
    // Force a complete refresh by updating the trigger
    setImageUpdateTrigger(Date.now());
  }, []);

  const value = {
    imageUpdateTrigger,
    triggerImageUpdate,
    forceRefreshImages
  };

  return (
    <ImageUpdateContext.Provider value={value}>
      {children}
    </ImageUpdateContext.Provider>
  );
};