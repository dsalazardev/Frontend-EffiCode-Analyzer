import React from 'react';
import { SafeInlineMath } from '../../ui/SafeMath/SafeMath';
import './ComplexityCards.css';

interface ComplexityCardsProps {
  bigO: string;
  bigOmega: string;
  bigTheta?: string;
}

const complexityInfo: Record<string, { name: string; desc: string; color: string }> = {
  'O(1)': { name: 'Constante', desc: 'Tiempo fijo independiente del tamaño', color: '#10b981' },
  'O(log n)': { name: 'Logarítmica', desc: 'Crece muy lentamente', color: '#22c55e' },
  'O(n)': { name: 'Lineal', desc: 'Proporcional al tamaño de entrada', color: '#84cc16' },
  'O(n log n)': { name: 'Lineal-Log', desc: 'Eficiente para ordenamiento', color: '#eab308' },
  'O(n²)': { name: 'Cuadrática', desc: 'Bucles anidados, crece rápido', color: '#f97316' },
  'O(n³)': { name: 'Cúbica', desc: 'Tres bucles anidados', color: '#ef4444' },
  'O(2^n)': { name: 'Exponencial', desc: 'Muy ineficiente', color: '#dc2626' },
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
  if (normalized.includes('logn') || normalized.includes('log n')) {
    return complexityInfo['O(log n)'];
  }
  if (normalized.includes('n') && !normalized.includes('²') && !normalized.includes('³')) {
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
  bigTheta
}) => {
  const bigOMeta = getComplexityMeta(bigO);
  const bigOmegaMeta = getComplexityMeta(bigOmega);
  const bigThetaMeta = bigTheta ? getComplexityMeta(bigTheta) : null;

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

      {bigTheta && bigThetaMeta && (
        <div className="complexity-card complexity-card--big-theta" style={{ borderColor: bigThetaMeta.color }}>
          <div className="complexity-card__header">
            <span className="complexity-card__icon" style={{ color: bigThetaMeta.color }}>⚖️</span>
            <span className="complexity-card__label">Big Θ (Caso Promedio)</span>
          </div>
          <div className="complexity-card__value">
            <SafeInlineMath math={toLatex(bigTheta)} fallback={bigTheta} />
          </div>
          <div className="complexity-card__meta">
            <span className="complexity-card__name" style={{ color: bigThetaMeta.color }}>
              {bigThetaMeta.name}
            </span>
            <span className="complexity-card__desc">{bigThetaMeta.desc}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexityCards;
