'use client';

import React from 'react';
import { FooterEnhanced } from './FooterEnhanced';
import { ScrollToTop } from './ScrollToTop';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <FooterEnhanced />
      <ScrollToTop />
    </div>
  );
}