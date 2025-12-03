import React from 'react';
import { SafeInlineMath } from '../../ui/SafeMath/SafeMath';
import './ComplexityCards.css';

interface ComplexityCardsProps {
  bigO: string;
  bigOmega: string;
  bigTheta?: string;
  averageCase?: {
    complexity: string;
    description?: string;
  };
}

const complexityInfo: Record<string, { name: string; desc: string; color: string }> = {
  'O(1)': { name: 'Constante', desc: 'Tiempo fijo independiente del tamaño', color: '#10b981' },
  'O(log n)': { name: 'Logarítmica', desc: 'Crece muy lentamente', color: '#22c55e' },
  'O(n)': { name: 'Lineal', desc: 'Proporcional al tamaño de entrada', color: '#84cc16' },
  'O(n log n)': { name: 'Lineal-Log', desc: 'Eficiente para ordenamiento', color: '#eab308' },
  'O(n²)': { name: 'Cuadrática', desc: 'Bucles anidados, crece rápido', color: '#f97316' },
  'O(n³)': { name: 'Cúbica', desc: 'Tres bucles anidados', color: '#ef4444' },
  'O(2^n)': { name: 'Exponencial', desc: 'Torres de Hanoi, muy ineficiente', color: '#dc2626' },
  'O(φ^n)': { name: 'Exponencial (φ)', desc: 'Fibonacci recursivo naive', color: '#dc2626' },
  'O(1.618^n)': { name: 'Exponencial (φ)', desc: 'Fibonacci recursivo naive', color: '#dc2626' },
  'O(n!)': { name: 'Factorial', desc: 'Permutaciones, extremadamente lento', color: '#991b1b' },
};

const getComplexityMeta = (complexity: string) => {
  // Normalizar la notación para buscar
  const normalized = complexity
    .replace(/\\Omega|\\Theta|O/g, 'O')
    .replace(/\s+/g, '')
    .replace('**2', '²')
    .replace('**3', '³')
    .replace('^2', '²')
    .replace('^3', '³');
  
  for (const [key, value] of Object.entries(complexityInfo)) {
    const normalizedKey = key.replace(/\s+/g, '');
    if (normalized.includes(normalizedKey) || normalized.includes(key)) {
      return value;
    }
  }
  
  // Detectar por patrones
  if (normalized.includes('n²') || normalized.includes('n^2')) {
    return complexityInfo['O(n²)'];
  }
  if (normalized.includes('n³') || normalized.includes('n^3')) {
    return complexityInfo['O(n³)'];
  }
  // Detectar exponenciales (2^n, φ^n, 1.618^n, etc.)
  if (normalized.includes('2^n') || normalized.includes('2ⁿ')) {
    return complexityInfo['O(2^n)'];
  }
  if (normalized.includes('φ^n') || normalized.includes('1.618') || normalized.includes('1.6180')) {
    return complexityInfo['O(φ^n)'];
  }
  // Detectar cualquier exponencial a^n
  if (/\d+(\.\d+)?\^n/.test(normalized) || /\d+(\.\d+)?ⁿ/.test(normalized)) {
    return { name: 'Exponencial', desc: 'Crecimiento muy rápido', color: '#dc2626' };
  }
  if (normalized.includes('logn') || normalized.includes('lgn') || normalized.includes('log n') || normalized.includes('lg n')) {
    return complexityInfo['O(log n)'];
  }
  if (normalized.includes('nlogn') || normalized.includes('nlgn')) {
    return complexityInfo['O(n log n)'];
  }
  if (normalized.includes('n') && !normalized.includes('²') && !normalized.includes('³') && !normalized.includes('^')) {
    return complexityInfo['O(n)'];
  }
  if (normalized === 'O(1)' || normalized.includes('(1)')) {
    return complexityInfo['O(1)'];
  }
  
  return { name: 'Personalizada', desc: 'Complejidad específica', color: '#6366f1' };
};

export const ComplexityCards: React.FC<ComplexityCardsProps> = ({
  bigO,
  bigOmega,
  bigTheta,
  averageCase
}) => {
  const bigOMeta = getComplexityMeta(bigO);
  const bigOmegaMeta = getComplexityMeta(bigOmega);
  
  // Big Θ solo se muestra si es una complejidad válida (no "No aplicable")
  const isThetaValid = bigTheta && 
    !bigTheta.toLowerCase().includes('no aplicable') && 
    !bigTheta.toLowerCase().includes('n/a') &&
    bigTheta.trim() !== '';
  const bigThetaMeta = isThetaValid ? getComplexityMeta(bigTheta) : null;
  
  const averageMeta = averageCase?.complexity ? getComplexityMeta(averageCase.complexity) : null;

  // Convertir notación a LaTeX
  const toLatex = (notation: string) => {
    return notation
      .replace('O(', 'O(')
      .replace('Ω(', '\\Omega(')
      .replace('Θ(', '\\Theta(')
      .replace('**2', '^2')
      .replace('**3', '^3');
  };

  return (
    <div className="complexity-cards">
      <div className="complexity-card complexity-card--big-o" style={{ borderColor: bigOMeta.color }}>
        <div className="complexity-card__header">
          <span className="complexity-card__icon" style={{ color: bigOMeta.color }}>📈</span>
          <span className="complexity-card__label">Big O (Peor Caso)</span>
        </div>
        <div className="complexity-card__value">
          <SafeInlineMath math={toLatex(bigO)} fallback={bigO} />
        </div>
        <div className="complexity-card__meta">
          <span className="complexity-card__name" style={{ color: bigOMeta.color }}>
            {bigOMeta.name}
          </span>
          <span className="complexity-card__desc">{bigOMeta.desc}</span>
        </div>
      </div>

      <div className="complexity-card complexity-card--big-omega" style={{ borderColor: bigOmegaMeta.color }}>
        <div className="complexity-card__header">
          <span className="complexity-card__icon" style={{ color: bigOmegaMeta.color }}>📉</span>
          <span className="complexity-card__label">Big Ω (Mejor Caso)</span>
        </div>
        <div className="complexity-card__value">
          <SafeInlineMath math={toLatex(bigOmega)} fallback={bigOmega} />
        </div>
        <div className="complexity-card__meta">
          <span className="complexity-card__name" style={{ color: bigOmegaMeta.color }}>
            {bigOmegaMeta.name}
          </span>
          <span className="complexity-card__desc">{bigOmegaMeta.desc}</span>
        </div>
      </div>

      {isThetaValid && bigThetaMeta && (
        <div className="complexity-card complexity-card--big-theta" style={{ borderColor: bigThetaMeta.color }}>
          <div className="complexity-card__header">
            <span className="complexity-card__icon" style={{ color: bigThetaMeta.color }}>⚖️</span>
            <span className="complexity-card__label">Big Θ (Cota Ajustada)</span>
          </div>
          <div className="complexity-card__value">
            <SafeInlineMath math={toLatex(bigTheta!)} fallback={bigTheta!} />
          </div>
          <div className="complexity-card__meta">
            <span className="complexity-card__name" style={{ color: bigThetaMeta.color }}>
              {bigThetaMeta.name}
            </span>
            <span className="complexity-card__desc">Peor = Mejor caso (cota ajustada)</span>
          </div>
        </div>
      )}

      {averageCase && averageMeta && (
        <div className="complexity-card complexity-card--average" style={{ borderColor: '#8b5cf6' }}>
          <div className="complexity-card__header">
            <span className="complexity-card__icon" style={{ color: '#8b5cf6' }}>📊</span>
            <span className="complexity-card__label">E[T(n)] (Caso Promedio)</span>
          </div>
          <div className="complexity-card__value">
            <SafeInlineMath math={toLatex(averageCase.complexity)} fallback={averageCase.complexity} />
          </div>
          <div className="complexity-card__meta">
            <span className="complexity-card__name" style={{ color: '#8b5cf6' }}>
              {averageMeta.name}
            </span>
            <span className="complexity-card__desc">
              {averageCase.description || 'Análisis probabilístico (Cormen Cap. 5)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexityCards;
