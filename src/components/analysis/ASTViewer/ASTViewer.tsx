import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ASTViewer.css';

interface ASTViewerProps {
  ast: string; // Base64 encoded PNG image from backend
}

export const ASTViewer: React.FC<ASTViewerProps> = ({ ast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position and zoom when opening fullscreen
  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.1, 5));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 0.25));
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'Escape':
          closeFullscreen();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y + 50 }));
          break;
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y - 50 }));
          break;
        case 'ArrowLeft':
          setPosition(prev => ({ ...prev, x: prev.x + 50 }));
          break;
        case 'ArrowRight':
          setPosition(prev => ({ ...prev, x: prev.x - 50 }));
          break;
      }
    };

    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen, closeFullscreen, zoomIn, zoomOut, resetZoom]);

  if (!ast) {
    return (
      <div className="ast-viewer ast-viewer--empty">
        <p>No hay AST disponible.</p>
      </div>
    );
  }

  const isBase64Image = typeof ast === 'string' && ast.startsWith('data:image');

  return (
    <>
      <div className="ast-viewer">
        <button 
          className="ast-viewer__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="ast-viewer__icon">🌳</span>
          <span className="ast-viewer__label">
            {isExpanded ? 'Ocultar' : 'Mostrar'} Árbol de Sintaxis Abstracta (AST)
          </span>
          <span className={`ast-viewer__arrow ${isExpanded ? 'ast-viewer__arrow--expanded' : ''}`}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="ast-viewer__content">
            {isBase64Image ? (
              <div className="ast-viewer__image-container">
                <img 
                  src={ast} 
                  alt="Árbol de Sintaxis Abstracta" 
                  className="ast-viewer__image"
                />
                <button 
                  className="ast-viewer__fullscreen-btn"
                  onClick={openFullscreen}
                  title="Ver en pantalla completa"
                >
                  <span>🔍</span>
                  <span>Ver en pantalla completa</span>
                </button>
              </div>
            ) : (
              <pre className="ast-viewer__code">
                {typeof ast === 'string' ? ast : JSON.stringify(ast, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="ast-fullscreen-overlay" onClick={closeFullscreen}>
          <div 
            className="ast-fullscreen-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="ast-fullscreen-header">
              <h3 className="ast-fullscreen-title">
                <span>🌳</span> Árbol de Sintaxis Abstracta (AST)
              </h3>
              <div className="ast-fullscreen-controls">
                <button onClick={zoomOut} title="Alejar (-)">
                  <span>➖</span>
                </button>
                <span className="ast-fullscreen-zoom">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} title="Acercar (+)">
                  <span>➕</span>
                </button>
                <button onClick={resetZoom} title="Restablecer (0)">
                  <span>🔄</span>
                </button>
                <div className="ast-fullscreen-divider"></div>
                <button onClick={closeFullscreen} className="ast-fullscreen-close" title="Cerrar (Esc)">
                  <span>✕</span>
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div 
              ref={containerRef}
              className={`ast-fullscreen-viewer ${isDragging ? 'ast-fullscreen-viewer--dragging' : ''} ${zoom > 1 ? 'ast-fullscreen-viewer--zoomable' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <img 
                src={ast} 
                alt="Árbol de Sintaxis Abstracta"
                className="ast-fullscreen-image"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
                draggable={false}
              />
            </div>

            {/* Footer hints */}
            <div className="ast-fullscreen-footer">
              <span>🖱️ Scroll para zoom</span>
              <span>✋ Arrastrar para mover (cuando hay zoom)</span>
              <span>⌨️ Flechas para navegar</span>
              <span>Esc para cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ASTViewer;
