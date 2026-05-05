/**
 * Production-ready loading state utilities for consistent UX across all dashboards
 * Implements unified loading patterns and states
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Loading state types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Loading state interface
 */
export interface LoadingStates {
  [key: string]: LoadingState;
}

/**
 * Hook for managing multiple loading states
 */
export function useLoadingStates(initialStates: LoadingStates = {}) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialStates);

  const setLoadingState = useCallback((key: string, state: LoadingState) => {
    setLoadingStates(prev => ({ ...prev, [key]: state }));
  }, []);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingState(key, isLoading ? 'loading' : 'idle');
  }, [setLoadingState]);

  const setSuccess = useCallback((key: string) => {
    setLoadingState(key, 'success');
  }, [setLoadingState]);

  const setError = useCallback((key: string) => {
    setLoadingState(key, 'error');
  }, [setLoadingState]);

  const resetState = useCallback((key: string) => {
    setLoadingState(key, 'idle');
  }, [setLoadingState]);

  const resetAllStates = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] === 'loading';
  }, [loadingStates]);

  const isSuccess = useCallback((key: string) => {
    return loadingStates[key] === 'success';
  }, [loadingStates]);

  const hasError = useCallback((key: string) => {
    return loadingStates[key] === 'error';
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state === 'loading');
  }, [loadingStates]);

  const hasAnyError = useCallback(() => {
    return Object.values(loadingStates).some(state => state === 'error');
  }, [loadingStates]);

  return {
    loadingStates,
    setLoadingState,
    setLoading,
    setSuccess,
    setError,
    resetState,
    resetAllStates,
    isLoading,
    isSuccess,
    hasError,
    isAnyLoading,
    hasAnyError,
  };
}

/**
 * Hook for managing async operations with loading states
 */
export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * Loading state configuration
 */
export interface LoadingConfig {
  showSpinner?: boolean;
  showOverlay?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'skeleton';
}

/**
 * Default loading configurations
 */
export const LoadingConfigs = {
  // Page-level loading
  page: {
    showSpinner: true,
    showOverlay: true,
    message: 'Loading...',
    size: 'lg' as const,
    variant: 'default' as const,
  },
  
  // Component-level loading
  component: {
    showSpinner: true,
    showOverlay: false,
    message: 'Loading...',
    size: 'md' as const,
    variant: 'default' as const,
  },
  
  // Button loading
  button: {
    showSpinner: true,
    showOverlay: false,
    message: undefined,
    size: 'sm' as const,
    variant: 'minimal' as const,
  },
  
  // Table loading
  table: {
    showSpinner: false,
    showOverlay: false,
    message: undefined,
    size: 'md' as const,
    variant: 'skeleton' as const,
  },
  
  // Form loading
  form: {
    showSpinner: true,
    showOverlay: true,
    message: 'Saving...',
    size: 'md' as const,
    variant: 'default' as const,
  },
};

/**
 * Hook for debounced loading state
 */
export function useDebouncedLoading(delay: number = 300) {
  const [showLoading, setShowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLoading(false);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    showLoading,
    setLoading,
  };
}

/**
 * Hook for managing sequential loading operations
 */
export function useSequentialLoading() {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const addToQueue = useCallback((key: string) => {
    setQueue(prev => [...prev, key]);
  }, []);

  const removeFromQueue = useCallback((key: string) => {
    setQueue(prev => prev.filter(k => k !== key));
  }, []);

  const startLoading = useCallback((key: string) => {
    setCurrent(key);
    setLoadingStates(prev => ({ ...prev, [key]: 'loading' }));
  }, []);

  const completeLoading = useCallback((key: string, success: boolean = true) => {
    setLoadingStates(prev => ({ ...prev, [key]: success ? 'success' : 'error' }));
    removeFromQueue(key);
    
    // Process next in queue
    if (queue.length > 1) {
      const next = queue.find(k => k !== key);
      if (next) {
        startLoading(next);
      }
    } else {
      setCurrent(null);
    }
  }, [queue, removeFromQueue, startLoading]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] === 'loading';
  }, [loadingStates]);

  const isCurrentlyLoading = useCallback((key: string) => {
    return current === key;
  }, [current]);

  return {
    queue,
    current,
    loadingStates,
    addToQueue,
    removeFromQueue,
    startLoading,
    completeLoading,
    isLoading,
    isCurrentlyLoading,
  };
}

/**
 * Utility to create loading-aware async function
 */
export function withLoading<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  setLoading: (loading: boolean) => void,
  onError?: (error: Error) => void
) {
  return async (...args: T): Promise<R> => {
    setLoading(true);
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
}

/**
 * Utility to create retry mechanism with loading
 */
export function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  setLoading?: (loading: boolean) => void
) {
  return async (): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setLoading?.(true);
        const result = await operation();
        setLoading?.(false);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          setLoading?.(false);
          throw lastError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    setLoading?.(false);
    throw lastError!;
  };
}

/**
 * Loading state utilities
 */
export const LoadingUtils = {
  /**
   * Check if any loading states are active
   */
  isAnyLoading: (states: LoadingStates): boolean => {
    return Object.values(states).some(state => state === 'loading');
  },

  /**
   * Check if all loading states are successful
   */
  areAllSuccessful: (states: LoadingStates): boolean => {
    return Object.values(states).every(state => state === 'success' || state === 'idle');
  },

  /**
   * Get loading progress percentage
   */
  getProgress: (states: LoadingStates): number => {
    const total = Object.keys(states).length;
    const completed = Object.values(states).filter(state => 
      state === 'success' || state === 'error'
    ).length;
    return total > 0 ? (completed / total) * 100 : 0;
  },

  /**
   * Get active loading keys
   */
  getLoadingKeys: (states: LoadingStates): string[] => {
    return Object.entries(states)
      .filter(([, state]) => state === 'loading')
      .map(([key]) => key);
  },

  /**
   * Get failed keys
   */
  getErrorKeys: (states: LoadingStates): string[] => {
    return Object.entries(states)
      .filter(([, state]) => state === 'error')
      .map(([key]) => key);
  },
};
