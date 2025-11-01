/**
 * Scroll utilities for consistent navigation behavior
 */

/**
 * Smoothly scrolls to the top of the page
 * Works across different browsers and handles edge cases
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  try {
    // Primary method - modern browsers
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: behavior
    });
  } catch (error) {
    // Fallback for older browsers
    console.warn('Smooth scroll not supported, using instant scroll:', error);
    window.scrollTo(0, 0);
  }
};

/**
 * Scrolls to top instantly (no animation)
 */
export const scrollToTopInstant = (): void => {
  scrollToTop('auto');
};

/**
 * Scrolls to a specific element by ID
 */
export const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth'): void => {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: behavior,
        block: 'start',
        inline: 'nearest'
      });
    } else {
      console.warn(`Element with ID "${elementId}" not found`);
    }
  } catch (error) {
    console.error('Error scrolling to element:', error);
  }
};

/**
 * Custom hook for scroll restoration on route changes
 */
export const useScrollRestoration = () => {
  const restoreScroll = () => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToTop();
    }, 0);
  };

  return { restoreScroll };
};

/**
 * Debounced scroll to top function
 * Useful for preventing multiple rapid scroll calls
 */
export const debouncedScrollToTop = (() => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (delay: number = 100) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      scrollToTop();
      timeoutId = null;
    }, delay);
  };
})();

/**
 * Force scroll to top for navigation
 * This ensures scroll happens even if the page is the same
 */
export const forceScrollToTop = (): void => {
  // Force immediate scroll
  window.scrollTo(0, 0);
  
  // Then apply smooth scroll for better UX
  requestAnimationFrame(() => {
    scrollToTop();
  });
};