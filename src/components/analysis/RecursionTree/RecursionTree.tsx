import React, { useState, useCallback, useRef, useEffect } from 'react';
import { type RecursionTreeData, type RecursionTreeNode } from '../../../types';
import './RecursionTree.css';

interface RecursionTreeProps {
  data?: RecursionTreeData;
  methodUsed?: string;
  recurrenceEquation?: string;
}

// Componente de nodo del árbol con animación
const TreeNode: React.FC<{ 
  node: RecursionTreeNode; 
  isRoot?: boolean;
  isExpanded?: boolean;
  animationDelay?: number;
}> = ({ node, isRoot = false, isExpanded = true, animationDelay = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);
  
  return (
    <div 
      className={`tree-node-container ${isRoot ? 'tree-node-root' : ''} ${isVisible ? 'tree-node--visible' : ''}`}
      style={{ '--animation-delay': `${animationDelay}ms` } as React.CSSProperties}
    >
      <div className={`tree-node level-${Math.min(node.level, 4)}`}>
        <span className="tree-node-label">{node.label}</span>
        <span className="tree-node-cost">{node.cost}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <>
          <div className="tree-connector">
            <div className="tree-line-vertical"></div>
            <div className="tree-line-horizontal"></div>
          </div>
          <div className="tree-children">
            {node.children!.map((child, index) => (
              <TreeNode 
                key={child.id || index} 
                node={child} 
                isExpanded={isExpanded}
                animationDelay={animationDelay + 100 * (index + 1)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Helper para determinar si es recursión lineal
const isLinearRecursion = (params?: RecursionTreeData['parameters']): boolean => {
  if (!params) return false;
  return typeof params.b === 'string' || params.type === 'lineal' || params.type === 'fibonacci';
};

// Helper para calcular nodos por nivel
const getNodesAtLevel = (a: number, level: number, isLinear: boolean, type?: string): string => {
  if (type === 'fibonacci') {
    return level === 0 ? '1' : `≈φ^${level}`;
  }
  if (isLinear && a === 1) {
    return '1';
  }
  return String(Math.pow(a, level));
};

// Modal Component
const TreeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tree-modal-overlay" onClick={onClose}>
      <div className="tree-modal" onClick={e => e.stopPropagation()}>
        <div className="tree-modal__header">
          <h2>{title}</h2>
          <div className="tree-modal__controls">
            <button className="zoom-btn" onClick={handleZoomOut} title="Alejar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={handleZoomIn} title="Acercar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button className="zoom-btn" onClick={handleReset} title="Restablecer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
            <button className="close-btn" onClick={onClose} title="Cerrar (Esc)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
        <div 
          ref={containerRef}
          className={`tree-modal__content ${isDragging ? 'tree-modal__content--dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="tree-modal__tree"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {children}
          </div>
        </div>
        <div className="tree-modal__footer">
          <span className="tree-modal__hint">
            🖱️ Arrastrar para mover • Scroll para zoom • Esc para cerrar
          </span>
        </div>
      </div>
    </div>
  );
};

export const RecursionTree: React.FC<RecursionTreeProps> = ({ 
  data, 
  methodUsed,
  recurrenceEquation 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!data || !data.root) {
    return (
      <div className="recursion-tree recursion-tree--empty">
        <div className="empty-state">
          <div className="empty-state__icon">🌲</div>
          <p className="empty-state__title">Árbol de Recursión</p>
          <p className="empty-state__description">
            No hay datos del árbol disponibles para este análisis.
          </p>
        </div>
      </div>
    );
  }

  const isLinear = isLinearRecursion(data.parameters);

  return (
    <>
      <div className="recursion-tree">
        {/* Header compacto */}
        <div className="recursion-tree__header">
          <div className="recursion-tree__title-row">
            <div className="recursion-tree__title">
              <span className="recursion-tree__icon">🌳</span>
              <h3>Árbol de Recursión</h3>
              {methodUsed && (
                <span className="recursion-tree__badge">{methodUsed}</span>
              )}
            </div>
            <button 
              className="recursion-tree__expand-btn"
              onClick={() => setIsModalOpen(true)}
              title="Ver en pantalla completa"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              <span>Expandir</span>
            </button>
          </div>
          
          {recurrenceEquation && (
            <div className="recursion-tree__equation">
              <code>{recurrenceEquation}</code>
            </div>
          )}
        </div>

        {/* Vista previa compacta del árbol */}
        <div 
          className="recursion-tree__preview"
          onClick={() => setIsModalOpen(true)}
          title="Click para expandir"
        >
          <div className="tree-container tree-container--preview">
            <TreeNode node={data.root} isRoot={true} />
          </div>
          <div className="recursion-tree__preview-overlay">
            <span>Click para vista completa</span>
          </div>
        </div>

        {/* Info compacta */}
        <div className="recursion-tree__info">
          <div className="recursion-tree__stats">
            <div className="stat-item">
              <span className="stat-label">Niveles</span>
              <span className="stat-value">{data.levelCosts.length}</span>
            </div>
            <div className="stat-item stat-item--highlight">
              <span className="stat-label">Complejidad</span>
              <span className="stat-value">{data.complexity}</span>
            </div>
            {data.parameters && (
              <>
                <div className="stat-item">
                  <span className="stat-label">a</span>
                  <span className="stat-value">{data.parameters.a}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{isLinear ? 'dec' : 'b'}</span>
                  <span className="stat-value">{data.parameters.b}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal con vista completa */}
      <TreeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Árbol de Recursión"
      >
        <div className="modal-tree-wrapper">
          <TreeNode node={data.root} isRoot={true} />
          
          {/* Tabla de costos en el modal */}
          <div className="modal-costs-panel">
            <h4>📊 Costos por Nivel</h4>
            <div className="modal-costs-table">
              {data.levelCosts.map((cost, index) => (
                <div key={index} className="modal-cost-row">
                  <span className="modal-level">
                    {index === data.levelCosts.length - 1 ? '...' : index}
                  </span>
                  <span className="modal-nodes">
                    {index === data.levelCosts.length - 1 
                      ? (isLinear ? 'n niveles' : <>n<sup>log<sub>b</sub>a</sup></>)
                      : data.parameters?.a 
                        ? getNodesAtLevel(data.parameters.a, index, isLinear, data.parameters.type)
                        : '-'
                    }
                  </span>
                  <span className="modal-cost">{cost}</span>
                </div>
              ))}
            </div>
            <div className="modal-result">
              <strong>Total:</strong> {data.complexity}
            </div>
          </div>
        </div>
      </TreeModal>
    </>
  );
};

export default RecursionTree;
