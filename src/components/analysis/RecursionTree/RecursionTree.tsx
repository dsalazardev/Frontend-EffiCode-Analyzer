import React from 'react';
import { type RecursionTreeData, type RecursionTreeNode } from '../../../types';
import './RecursionTree.css';

interface RecursionTreeProps {
  data?: RecursionTreeData;
  methodUsed?: string;
  recurrenceEquation?: string;
}

const TreeNode: React.FC<{ node: RecursionTreeNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className={`tree-node-container ${isRoot ? 'tree-node-root' : ''}`}>
      <div className={`tree-node level-${Math.min(node.level, 4)}`}>
        <span className="tree-node-label">{node.label}</span>
        <span className="tree-node-cost">{node.cost}</span>
      </div>
      
      {hasChildren && (
        <>
          <div className="tree-connector">
            <div className="tree-line-vertical"></div>
            <div className="tree-line-horizontal"></div>
          </div>
          <div className="tree-children">
            {node.children!.map((child, index) => (
              <TreeNode key={child.id || index} node={child} />
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
    // Fibonacci: aproximadamente φ^nivel nodos
    return level === 0 ? '1' : `≈φ^${level}`;
  }
  if (isLinear && a === 1) {
    return '1';
  }
  return String(Math.pow(a, level));
};

// Helper para obtener la descripción de hojas
const getLeavesDescription = (params?: RecursionTreeData['parameters']): string => {
  if (!params) return '-';
  
  if (params.type === 'fibonacci') {
    return 'φ^n hojas';
  }
  
  if (isLinearRecursion(params)) {
    if (params.a === 1) {
      return 'n niveles';
    }
    return `${params.a}^n hojas`;
  }
  
  // Divide y vencerás
  if (params.log_b_a !== undefined) {
    return (
      <>
        n<sup>log<sub>{params.b}</sub>{params.a}</sup>
      </> as unknown as string
    );
  }
  return '-';
};

export const RecursionTree: React.FC<RecursionTreeProps> = ({ 
  data, 
  methodUsed,
  recurrenceEquation 
}) => {
  if (!data || !data.root) {
    return (
      <div className="recursion-tree recursion-tree--empty">
        <p>No hay datos del árbol de recursión disponibles.</p>
        <p className="recursion-tree__hint">
          El árbol de recursión se genera cuando el método de resolución lo permite.
        </p>
      </div>
    );
  }

  const isLinear = isLinearRecursion(data.parameters);

  return (
    <div className="recursion-tree">
      {/* Header con información del método */}
      <div className="recursion-tree__header">
        <div className="recursion-tree__method">
          <span className="recursion-tree__method-icon">🌳</span>
          <div className="recursion-tree__method-info">
            <h3>Árbol de Recursión</h3>
            {methodUsed && (
              <span className="recursion-tree__method-badge">
                Método: {methodUsed}
              </span>
            )}
          </div>
        </div>
        
        {recurrenceEquation && (
          <div className="recursion-tree__equation">
            <span className="equation-label">Recurrencia:</span>
            <code>{recurrenceEquation}</code>
          </div>
        )}
      </div>

      {/* Visualización del árbol */}
      <div className="recursion-tree__visualization">
        <div className="tree-container">
          <TreeNode node={data.root} isRoot={true} />
        </div>
      </div>

      {/* Tabla de costos por nivel */}
      <div className="recursion-tree__costs">
        <h4>📊 Costo por Nivel</h4>
        <div className="costs-table">
          <div className="costs-header">
            <span>Nivel</span>
            <span>Nodos</span>
            <span>Costo Total</span>
          </div>
          {data.levelCosts.slice(0, -1).map((cost, index) => (
            <div key={index} className="costs-row">
              <span className="level-badge">{index}</span>
              <span className="nodes-count">
                {data.parameters?.a 
                  ? getNodesAtLevel(data.parameters.a, index, isLinear, data.parameters.type)
                  : '-'}
              </span>
              <span className="level-cost">{cost}</span>
            </div>
          ))}
          <div className="costs-row costs-row--leaves">
            <span className="level-badge">...</span>
            <span className="nodes-count">
              {isLinear ? (
                data.parameters?.type === 'fibonacci' ? 'φ^n' :
                data.parameters?.a === 1 ? 'n niveles' : 
                <>{data.parameters?.a}<sup>n</sup></>
              ) : (
                <>n<sup>log<sub>b</sub>a</sup></>
              )}
            </span>
            <span className="level-cost">{data.levelCosts[data.levelCosts.length - 1]}</span>
          </div>
        </div>
      </div>

      {/* Resultado final */}
      <div className="recursion-tree__result">
        <div className="result-card">
          <span className="result-icon">🎯</span>
          <div className="result-content">
            <span className="result-label">Complejidad Total:</span>
            <span className="result-complexity">{data.complexity}</span>
          </div>
        </div>
        
        {data.parameters && (
          <div className="parameters-info">
            <span>a = {data.parameters.a}</span>
            <span>
              {isLinear 
                ? `Decremento: ${data.parameters.b}` 
                : `b = ${data.parameters.b}`}
            </span>
            <span>f(n) = {data.parameters.f_n}</span>
            {!isLinear && data.parameters.log_b_a !== undefined && (
              <span>log<sub>b</sub>a = {data.parameters.log_b_a}</span>
            )}
            {data.parameters.type && (
              <span className="recursion-type-badge">
                {data.parameters.type === 'fibonacci' ? '🔄 Fibonacci' :
                 data.parameters.type === 'lineal' ? '📏 Lineal' : 
                 '🔀 Divide y Vencerás'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecursionTree;
