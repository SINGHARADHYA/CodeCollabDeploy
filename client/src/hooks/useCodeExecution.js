import { useState, useCallback } from 'react';
import { API_BASE } from '@/lib/constants';

export function useCodeExecution() {
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const runCode = useCallback(async (code, language, stdin = '') => {
    setIsRunning(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch(`${API_BASE}/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute code');
      }

      setOutput(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput(null);
    setError(null);
  }, []);

  return { runCode, output, isRunning, error, clearOutput };
}
