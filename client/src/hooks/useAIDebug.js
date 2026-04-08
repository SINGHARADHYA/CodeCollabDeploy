import { useState, useCallback } from 'react';
import { API_BASE } from '@/lib/constants';

export function useAIDebug() {
  const [result, setResult] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [error, setError] = useState(null);

  const debugCode = useCallback(async (code, language, errorMessage = '') => {
    setIsDebugging(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/debug-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, error: errorMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to debug code');
      }

      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsDebugging(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { debugCode, result, isDebugging, error, clearResult };
}
