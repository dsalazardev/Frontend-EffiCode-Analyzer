import React from 'react';
import './AIValidation.css';

interface AIValidationProps {
  content: string;
}

/**
 * Componente que renderiza la respuesta de validación de IA
 * Parsea Markdown básico y lo muestra con buen formato
 */
export const AIValidation: React.FC<AIValidationProps> = ({ content }) => {
  // Parsear el contenido Markdown a elementos React
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`list-${elements.length}`} className="ai-validation__list ai-validation__list--ordered">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className="ai-validation__list">
              {listItems}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Línea vacía
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={index} className="ai-validation__heading ai-validation__heading--h4">
            {parseInline(trimmedLine.slice(4))}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={index} className="ai-validation__heading ai-validation__heading--h3">
            {parseInline(trimmedLine.slice(3))}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={index} className="ai-validation__heading ai-validation__heading--h2">
            {parseInline(trimmedLine.slice(2))}
          </h2>
        );
        return;
      }

      // Headers con números (1. **Título**)
      const numberedHeaderMatch = trimmedLine.match(/^(\d+)\.\s+\*\*(.+?)\*\*:?\s*(.*)$/);
      if (numberedHeaderMatch) {
        flushList();
        const [, number, title, rest] = numberedHeaderMatch;
        elements.push(
          <div key={index} className="ai-validation__section">
            <h4 className="ai-validation__section-title">
              <span className="ai-validation__section-number">{number}</span>
              {parseInline(title)}
            </h4>
            {rest && <p className="ai-validation__section-intro">{parseInline(rest)}</p>}
          </div>
        );
        return;
      }

      // Lista con viñetas (* o -)
      const bulletMatch = trimmedLine.match(/^[\*\-]\s+(.+)$/);
      if (bulletMatch) {
        if (!inList) {
          inList = true;
          listType = 'ul';
        }
        listItems.push(
          <li key={`li-${index}`} className="ai-validation__list-item">
            {parseInline(bulletMatch[1])}
          </li>
        );
        return;
      }

      // Lista numerada
      const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch && !trimmedLine.match(/^\d+\.\s+\*\*/)) {
        if (!inList) {
          inList = true;
          listType = 'ol';
        }
        listItems.push(
          <li key={`li-${index}`} className="ai-validation__list-item">
            {parseInline(orderedMatch[2])}
          </li>
        );
        return;
      }

      // Línea de subpunto (empieza con espacios + *)
      const subBulletMatch = line.match(/^\s+[\*\-]\s+\*\*(.+?)\*\*:?\s*(.*)$/);
      if (subBulletMatch) {
        if (!inList) {
          inList = true;
          listType = 'ul';
        }
        const [, label, description] = subBulletMatch;
        listItems.push(
          <li key={`li-${index}`} className="ai-validation__list-item ai-validation__list-item--sub">
            <strong className="ai-validation__label">{label}:</strong>{' '}
            {parseInline(description)}
          </li>
        );
        return;
      }

      // Subpunto simple
      const simpleSubMatch = line.match(/^\s+[\*\-]\s+(.+)$/);
      if (simpleSubMatch) {
        if (!inList) {
          inList = true;
          listType = 'ul';
        }
        listItems.push(
          <li key={`li-${index}`} className="ai-validation__list-item ai-validation__list-item--sub">
            {parseInline(simpleSubMatch[1])}
          </li>
        );
        return;
      }

      // Párrafo normal
      flushList();
      elements.push(
        <p key={index} className="ai-validation__paragraph">
          {parseInline(trimmedLine)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  // Parsear formato inline (bold, italic, code, etc.)
  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Bold con ** **
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
      if (boldMatch) {
        if (boldMatch[1]) {
          parts.push(parseInlineSimple(boldMatch[1], keyIndex++));
        }
        parts.push(
          <strong key={`bold-${keyIndex++}`} className="ai-validation__bold">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      // Código con backticks
      const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/s);
      if (codeMatch) {
        if (codeMatch[1]) {
          parts.push(parseInlineSimple(codeMatch[1], keyIndex++));
        }
        parts.push(
          <code key={`code-${keyIndex++}`} className="ai-validation__code">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // Notación matemática (Θ, Ω, O)
      const mathMatch = remaining.match(/^(.*?)(Θ\([^)]+\)|Ω\([^)]+\)|O\([^)]+\))(.*)/);
      if (mathMatch) {
        if (mathMatch[1]) {
          parts.push(parseInlineSimple(mathMatch[1], keyIndex++));
        }
        parts.push(
          <span key={`math-${keyIndex++}`} className="ai-validation__math">
            {mathMatch[2]}
          </span>
        );
        remaining = mathMatch[3];
        continue;
      }

      // Si no hay más patrones, agregar el resto como texto
      parts.push(<span key={`text-${keyIndex++}`}>{remaining}</span>);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const parseInlineSimple = (text: string, key: number): React.ReactNode => {
    // Buscar notación matemática en texto simple
    const mathPattern = /(Θ\([^)]+\)|Ω\([^)]+\)|O\([^)]+\))/g;
    const parts = text.split(mathPattern);
    
    if (parts.length === 1) {
      return <span key={`simple-${key}`}>{text}</span>;
    }

    return (
      <span key={`compound-${key}`}>
        {parts.map((part, i) => 
          mathPattern.test(part) ? (
            <span key={i} className="ai-validation__math">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Detectar si la respuesta indica éxito o tiene advertencias
  const getValidationType = (): 'success' | 'warning' | 'info' => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('correcto') || lowerContent.includes('válido') || lowerContent.includes('acertado')) {
      return 'success';
    }
    if (lowerContent.includes('error') || lowerContent.includes('incorrecto')) {
      return 'warning';
    }
    return 'info';
  };

  const validationType = getValidationType();

  return (
    <div className={`ai-validation ai-validation--${validationType}`}>
      <div className="ai-validation__header">
        <span className="ai-validation__icon">🤖</span>
        <h3 className="ai-validation__title">Validación con IA</h3>
        <span className={`ai-validation__badge ai-validation__badge--${validationType}`}>
          {validationType === 'success' && '✓ Validado'}
          {validationType === 'warning' && '⚠ Revisar'}
          {validationType === 'info' && 'ℹ Análisis'}
        </span>
      </div>
      
      <div className="ai-validation__content">
        {parseMarkdown(content)}
      </div>

      <div className="ai-validation__footer">
        <span className="ai-validation__source">
          📚 Basado en "Introduction to Algorithms" (Cormen et al.), y demas referencias academicas
        </span>
      </div>
    </div>
  );
};

export default AIValidation;
