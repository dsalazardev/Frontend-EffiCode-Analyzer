import { useState, useCallback } from 'react';
import { analyzePseudocode } from '../services/api';
import type { AnalysisResult } from '../types';

interface UseAnalysisReturn {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  analyze: (code: string) => Promise<void>;
  reset: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzePseudocode(code);
      console.log('📊 Análisis completado:', data);
      setResult(data as AnalysisResult);
    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError('Error al analizar. Verifica que el backend esté corriendo en http://localhost:8000');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, analyze, reset };
};
