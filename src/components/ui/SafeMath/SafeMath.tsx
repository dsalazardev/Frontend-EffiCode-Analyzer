import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import './SafeMath.css';

interface SafeMathProps {
  math: string;
  fallback?: string;
}

/**
 * Limpia y normaliza expresiones LaTeX para mejor compatibilidad
 */
const cleanLatex = (latex: string): string => {
  if (!latex) return '';
  
  let cleaned = latex
    .replace(/\\Big/g, '')
    .replace(/\\big/g, '')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\\\/g, ' ')
    .replace(/&/g, '')
    .trim();
  
  return cleaned;
};

/**
 * SafeBlockMath - Renderiza ecuaciones en bloque de forma segura
 */
export const SafeBlockMath: React.FC<SafeMathProps> = ({ math, fallback }) => {
  const cleanedMath = cleanLatex(math);
  
  if (!cleanedMath) {
    return fallback ? <div className="math-fallback">{fallback}</div> : null;
  }

  try {
    return (
      <div className="safe-block-math">
        <BlockMath math={cleanedMath} />
      </div>
    );
  } catch (error) {
    console.error('Error renderizando BlockMath:', error, 'Input:', cleanedMath);
    return (
      <div className="math-fallback math-fallback--error">
        <code>{fallback || cleanedMath}</code>
      </div>
    );
  }
};

/**
 * SafeInlineMath - Renderiza ecuaciones en línea de forma segura
 */
export const SafeInlineMath: React.FC<SafeMathProps> = ({ math, fallback }) => {
  const cleanedMath = cleanLatex(math);
  
  if (!cleanedMath) {
    return fallback ? <span className="math-fallback">{fallback}</span> : null;
  }

  try {
    return (
      <span className="safe-inline-math">
        <InlineMath math={cleanedMath} />
      </span>
    );
  } catch (error) {
    console.error('Error renderizando InlineMath:', error, 'Input:', cleanedMath);
    return (
      <span className="math-fallback math-fallback--error">
        <code>{fallback || cleanedMath}</code>
      </span>
    );
  }
};

export default { SafeBlockMath, SafeInlineMath };
