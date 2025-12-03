import React, { useRef, useEffect, useCallback, type KeyboardEvent, useState } from 'react';
import './CodeEditor.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
}

// Palabras clave de pseudocódigo estilo Cormen
const CORMEN_KEYWORDS = [
  'if', 'then', 'else', 'elseif', 'for', 'to', 'downto', 'do', 'while', 
  'repeat', 'until', 'return', 'and', 'or', 'not', 'true', 'false', 'nil',
  'error', 'exchange', 'let', 'mod', 'div'
];

// Funciones comunes en pseudocódigo
const CORMEN_FUNCTIONS = [
  'length', 'floor', 'ceiling', 'min', 'max', 'abs', 'sqrt', 'log', 'print'
];

/**
 * Formatea/Indenta código pseudocódigo automáticamente
 * Basado en la gramática Cormen del backend
 * 
 * Este formateador PRESERVA la estructura de bloques del usuario,
 * normalizando la indentación a múltiplos consistentes.
 * 
 * El pseudocódigo estilo Cormen usa indentación semántica (como Python),
 * por lo que no podemos reconstruir la estructura sin palabras clave de cierre.
 * 
 * @param code - El código a formatear
 * @param indentSize - Tamaño de la indentación (espacios)
 * @returns Código formateado con indentación normalizada
 */
const formatPseudocode = (code: string, indentSize: number = 4): string => {
  const lines = code.split('\n');
  const result: string[] = [];
  const indent = ' '.repeat(indentSize);
  
  // Primero, detectar el tamaño de indentación actual del código
  let detectedIndent = 0;
  for (const line of lines) {
    const match = line.match(/^(\s+)/);
    if (match && match[1].length > 0) {
      const spaces = match[1].replace(/\t/g, '    ').length;  // tabs → 4 espacios
      if (detectedIndent === 0 || (spaces > 0 && spaces < detectedIndent)) {
        detectedIndent = spaces;
      }
    }
  }
  // Si no detectamos indentación, asumir 4 espacios
  if (detectedIndent === 0) detectedIndent = 4;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const trimmedLine = originalLine.trim();
    
    // Líneas vacías: mantener vacías
    if (trimmedLine === '') {
      result.push('');
      continue;
    }

    // Calcular el nivel de indentación actual de esta línea
    const leadingSpaces = originalLine.match(/^(\s*)/)?.[1] || '';
    const currentSpaces = leadingSpaces.replace(/\t/g, '    ').length;
    const level = Math.round(currentSpaces / detectedIndent);

    // Escribir con indentación normalizada
    result.push(indent.repeat(level) + trimmedLine);
  }

  return result.join('\n');
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = '// Escribe tu pseudocódigo aquí...',
  readOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Sincronizar scroll entre elementos
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Calcular números de línea
  const lineNumbers = value.split('\n').map((_, i) => i + 1);

  // Escape HTML para evitar inyección
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  // Aplicar syntax highlighting para pseudocódigo Cormen
  const highlightCode = (code: string): string => {
    let html = escapeHtml(code);

    // Comentarios (// estilo)
    html = html.replace(/(\/\/.*)$/gm, '<span class="token comment">$1</span>');

    // Operador de asignación especial ←
    html = html.replace(/←/g, '<span class="token operator">←</span>');

    // Operadores relacionales especiales ≤ ≥ ≠
    html = html.replace(/[≤≥≠]/g, '<span class="token operator">$&</span>');

    // Números
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

    // Definición de funciones/procedimientos (NOMBRE-EN-MAYUSCULAS)
    html = html.replace(/^([A-Z][A-Z0-9-]*)\s*\(/gm, '<span class="token function">$1</span>(');

    // Funciones comunes
    const funcPattern = new RegExp(`\\b(${CORMEN_FUNCTIONS.join('|')})\\b(?=\\[|\\()`, 'gi');
    html = html.replace(funcPattern, '<span class="token builtin">$1</span>');

    // Palabras clave
    const keywordPattern = new RegExp(`\\b(${CORMEN_KEYWORDS.join('|')})\\b`, 'gi');
    html = html.replace(keywordPattern, '<span class="token keyword">$1</span>');

    // Arrays con índices A[i], A[j], etc.
    html = html.replace(/([A-Za-z_][A-Za-z0-9_]*)\[/g, '<span class="token variable">$1</span>[');

    return html;
  };

  // Manejar tab para indentación
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      if (e.shiftKey) {
        // Shift+Tab: Reducir indentación
        const beforeCursor = value.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const lineContent = value.substring(lineStart, start);
        
        if (lineContent.startsWith(spaces)) {
          const newValue = value.substring(0, lineStart) + 
                          value.substring(lineStart + 4);
          onChange(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 4;
          }, 0);
        }
      } else {
        // Tab: Agregar indentación
        const newValue = value.substring(0, start) + spaces + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }

    // Auto-cerrar brackets
    if (['(', '[', '{'].includes(e.key)) {
      const pairs: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}'
      };
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        e.preventDefault();
        const newValue = value.substring(0, start) + e.key + pairs[e.key] + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }

    // Enter con auto-indentación
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const beforeCursor = value.substring(0, start);
      const currentLine = beforeCursor.split('\n').pop() || '';
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      
      // Agregar indentación extra después de 'do' o 'then'
      const extraIndent = /\b(do|then)\s*$/i.test(currentLine.trim()) ? '    ' : '';
      
      e.preventDefault();
      const newValue = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extraIndent.length;
      }, 0);
    }
  };

  // Sincronizar scroll cuando cambia el valor
  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  return (
    <div className={`code-editor ${focused ? 'code-editor--focused' : ''}`}>
      <div className="code-editor__header">
        <div className="code-editor__dots">
          <span className="code-editor__dot code-editor__dot--red"></span>
          <span className="code-editor__dot code-editor__dot--yellow"></span>
          <span className="code-editor__dot code-editor__dot--green"></span>
        </div>
        <span className="code-editor__title">pseudocode.txt</span>
        <div className="code-editor__actions">
          <button
            className="code-editor__format-btn"
            onClick={() => onChange(formatPseudocode(value))}
            disabled={readOnly || !value.trim()}
            title="Formatear código (Auto-indentar)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
            </svg>
            Identar
          </button>
          <span className="code-editor__lines">{lineNumbers.length} líneas</span>
        </div>
      </div>
      
      <div className="code-editor__body">
        <div className="code-editor__line-numbers" ref={lineNumbersRef}>
          {lineNumbers.map(num => (
            <span key={num} className="code-editor__line-number">{num}</span>
          ))}
        </div>
        
        <div className="code-editor__content">
          <pre 
            ref={highlightRef}
            className="code-editor__highlight"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightCode(value) + '\n' }}
          />
          <textarea
            ref={textareaRef}
            className="code-editor__textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
