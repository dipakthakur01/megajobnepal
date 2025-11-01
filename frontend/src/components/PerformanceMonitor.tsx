import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  name: string;
  children: React.ReactNode;
  warnThresholdMs?: number;
}

export function PerformanceMonitor({ 
  name, 
  children, 
  warnThresholdMs = 1000 
}: PerformanceMonitorProps) {
  const startTimeRef = useRef<number>();
  const unmountStartRef = useRef<number>();
  const mountedRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = performance.now();
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      unmountStartRef.current = performance.now();
      
      // Use requestAnimationFrame to measure unmount time more accurately
      requestAnimationFrame(() => {
        if (unmountStartRef.current) {
          const unmountDuration = performance.now() - unmountStartRef.current;
          if (unmountDuration > 50) { // Only warn if unmount takes more than 50ms
            console.warn(`Component "${name}" took ${unmountDuration.toFixed(2)}ms to unmount`);
          }
        }
      });
    };
  }, [name]);

  useEffect(() => {
    if (startTimeRef.current && mountedRef.current) {
      const duration = performance.now() - startTimeRef.current;
      
      if (duration > warnThresholdMs) {
        console.warn(`Component "${name}" took ${duration.toFixed(2)}ms to render`);
      } else if (duration > 100) {
        console.log(`Component "${name}" rendered in ${duration.toFixed(2)}ms`);
      }
    }
  });

  return <>{children}</>;
}

// Hook for measuring async operations
export function usePerformanceTimer(name: string) {
  const activeTimersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    return () => {
      // Clear any active timers on unmount
      activeTimersRef.current.clear();
    };
  }, []);

  const startTimer = () => {
    const startTime = performance.now();
    const timerId = Math.random(); // Simple unique identifier
    activeTimersRef.current.add(timerId);
    
    return {
      end: () => {
        if (activeTimersRef.current.has(timerId)) {
          activeTimersRef.current.delete(timerId);
          const duration = performance.now() - startTime;
          if (duration < 10000) { // Only log if reasonable duration (less than 10 seconds)
            console.log(`Operation "${name}" completed in ${duration.toFixed(2)}ms`);
          }
          return duration;
        }
        return 0;
      }
    };
  };

  return { startTimer };
}
