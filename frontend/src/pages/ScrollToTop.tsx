import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Visual scroll to top function with content movement animation
  const scrollToTop = () => {
    const scrollStep = () => {
      const currentPosition = window.pageYOffset;
      if (currentPosition > 0) {
        // Calculate scroll amount - larger steps for faster movement but still visible
        const scrollAmount = Math.max(50, currentPosition * 0.1);
        window.scrollTo(0, currentPosition - scrollAmount);
        requestAnimationFrame(scrollStep);
      }
    };
    requestAnimationFrame(scrollStep);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-110"
          size="lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
