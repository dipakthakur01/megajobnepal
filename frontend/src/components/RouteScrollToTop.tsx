import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../utils/scrollUtils';

/**
 * RouteScrollToTop component that automatically scrolls to top on route changes
 * This component should be placed inside the Router but outside of Routes
 */
export function RouteScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    scrollToTop();
  }, [pathname]);

  return null;
}

export default RouteScrollToTop;