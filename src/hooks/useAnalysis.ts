import { useState, useCallback } from 'react';
import { analyzePseudocode, validateWithAI } from '../services/api';
import type { AnalysisResult } from '../types';

interface UseAnalysisReturn {
  result: AnalysisResult | null;
  loading: boolean;
  validationLoading: boolean;
  error: string | null;
  analyze: (code: string) => Promise<void>;
  reset: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (code: string) => {
    setLoading(true);
    setValidationLoading(true);
    setError(null);
    setResult(null);

    try {
      // Paso 1: Obtener análisis principal (rápido)
      const data = await analyzePseudocode(code);
      console.log('📊 Análisis completado:', data);
      
      // Mostrar resultados inmediatamente (sin validación IA)
      setResult(data as AnalysisResult);
      setLoading(false);
      
      // Paso 2: Validar con IA de forma asíncrona (en segundo plano)
      console.log('🤖 Iniciando validación IA...');
      
      validateWithAI({
        pseudocode: code,
        complexity_o: data.complexity_o,
        complexity_omega: data.complexity_omega,
        complexity_theta: data.complexity_theta,
        justification: data.justification
      }).then(validationResult => {
        console.log('✅ Validación IA completada:', validationResult.status);
        
        // Actualizar solo el campo de validación
        setResult(prev => prev ? {
          ...prev,
          validation: validationResult.validation
        } : null);
        
        setValidationLoading(false);
      }).catch(err => {
        console.error('⚠️ Error en validación IA:', err);
        setResult(prev => prev ? {
          ...prev,
          validation: 'Error al obtener validación IA'
        } : null);
        setValidationLoading(false);
      });
      
    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError('Error al analizar. Verifica que el backend esté corriendo en http://localhost:8000');
      setLoading(false);
      setValidationLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setValidationLoading(false);
  }, []);

  return { result, loading, validationLoading, error, analyze, reset };
};
