import { useState } from 'react';
import './App.css';

// UI Components
import { Button, Card, Tabs, Loader, type TabItem } from './components/ui';

// Editor Components
import { CodeEditor } from './components/editor';

// Analysis Components
import { 
  ComplexityCards, 
  ResolutionSteps, 
  LineCostsTable, 
  ValidationCard, 
  ASTViewer,
  AIValidation,
  DownloadReport
} from './components/analysis';

// Services & Types
import { useAnalysis } from './hooks';

const EXAMPLE_CODE = `// Algoritmo de ordenamiento por inserción
INSERTION-SORT(A, n)
    for j ← 2 to n do
        key ← A[j]
        i ← j - 1
        while i > 0 and A[i] > key do
            A[i + 1] ← A[i]
            i ← i - 1
        A[i + 1] ← key
    return A`;

function App() {
  const [code, setCode] = useState<string>(EXAMPLE_CODE);
  const { result, loading, error, analyze, reset } = useAnalysis();
  const [, setActiveResultTab] = useState<string>('complexity');

  const handleAnalyze = () => {
    analyze(code);
  };

  const handleReset = () => {
    reset();
    setCode(EXAMPLE_CODE);
  };

  // Preparar tabs de resultados
  const getResultTabs = (): TabItem[] => {
    if (!result) return [];

    // Extraer información del caso promedio
    const averageCaseData = result.justification_data?.conclusion?.average_case;

    const tabs: TabItem[] = [
      {
        id: 'complexity',
        label: 'Complejidad',
        icon: <span>📊</span>,
        content: (
          <div className="tab-content">
            <ComplexityCards 
              bigO={result.complexity_o || 'N/A'}
              bigOmega={result.complexity_omega || 'N/A'}
              bigTheta={result.complexity_theta}
              averageCase={averageCaseData ? {
                complexity: averageCaseData.complexity,
                description: averageCaseData.description
              } : undefined}
            />
          </div>
        )
      },
      {
        id: 'resolution-worst',
        label: 'Peor Caso',
        icon: <span>📈</span>,
        content: (
          <div className="tab-content">
            <ResolutionSteps 
              steps={result.justification_data?.resolution_steps?.worst_case || []}
              caseType="worst"
            />
          </div>
        )
      },
      {
        id: 'resolution-best',
        label: 'Mejor Caso',
        icon: <span>📉</span>,
        content: (
          <div className="tab-content">
            <ResolutionSteps 
              steps={result.justification_data?.resolution_steps?.best_case || []}
              caseType="best"
            />
          </div>
        )
      },
      {
        id: 'resolution-average',
        label: 'Caso Promedio',
        icon: <span>📊</span>,
        content: (
          <div className="tab-content">
            <ResolutionSteps 
              steps={result.justification_data?.resolution_steps?.average_case || []}
              caseType="average"
            />
          </div>
        )
      },
      {
        id: 'line-costs',
        label: 'Costos',
        icon: <span>📋</span>,
        content: (
          <div className="tab-content">
            <LineCostsTable 
              costs={result.justification_data?.line_costs || []}
            />
          </div>
        )
      },
      {
        id: 'validation',
        label: 'Validación',
        icon: <span>✅</span>,
        content: (
          <div className="tab-content">
            <ValidationCard 
              isValid={result.is_valid !== false}
              errors={result.errors}
              warnings={result.warnings}
            />
            {result.validation && (
              <div className="mt-20">
                <AIValidation content={result.validation} />
              </div>
            )}
          </div>
        )
      },
      {
        id: 'download',
        label: 'Descargar',
        icon: <span>📥</span>,
        content: (
          <div className="tab-content">
            <DownloadReport
              pseudocode={code}
              analysisData={{
                complexity: {
                  bigO: result.complexity_o || 'N/A',
                  bigOmega: result.complexity_omega || 'N/A',
                  bigTheta: result.complexity_theta || 'No aplicable',
                  averageCase: averageCaseData?.complexity
                },
                justification: result.justification_data || {},
                validation: result.validation
              }}
            />
          </div>
        )
      }
    ];

    // Solo agregar AST si existe
    if (result.ast_image) {
      tabs.push({
        id: 'ast',
        label: 'AST',
        icon: <span>🌳</span>,
        content: (
          <div className="tab-content">
            <ASTViewer ast={result.ast_image} />
          </div>
        )
      });
    }

    return tabs;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="header-logo">⚡</span>
            <div className="header-titles">
              <h1 className="header-title">EffiCode Analyzer</h1>
              <p className="header-subtitle">Análisis de Complejidad Algorítmica</p>
            </div>
          </div>
          <div className="header-actions">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleReset}
              icon={<span>🔄</span>}
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Editor Section - TOP */}
        <section className="editor-section">
          <Card 
            title="Editor de Pseudocódigo (Estilo Cormen)" 
            icon="📝"
            className="editor-card"
          >
            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder="// Escribe tu pseudocódigo estilo Cormen aquí...
// Ejemplo: for i ← 1 to n do"
            />
            
            <div className="editor-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAnalyze}
                loading={loading}
                icon={<span>🚀</span>}
                fullWidth
              >
                {loading ? 'Analizando...' : 'Analizar Complejidad'}
              </Button>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}
          </Card>
        </section>

        {/* Results Section - BOTTOM */}
        <section className="results-section">
          {loading && (
            <Loader 
              size="lg" 
              text="Analizando complejidad algorítmica..." 
            />
          )}

          {!loading && !result && (
            <Card className="placeholder-card">
              <div className="placeholder-content">
                <span className="placeholder-icon">📊</span>
                <h3 className="placeholder-title">Sin resultados aún</h3>
                <p className="placeholder-text">
                  Escribe o pega tu código Python en el editor de arriba y haz clic en 
                  "Analizar Complejidad" para ver el análisis detallado.
                </p>
                <div className="placeholder-features">
                  <div className="feature-item">
                    <span>📈</span>
                    <span>Análisis Big O, Ω y Θ</span>
                  </div>
                  <div className="feature-item">
                    <span>📐</span>
                    <span>Resolución matemática paso a paso</span>
                  </div>
                  <div className="feature-item">
                    <span>📋</span>
                    <span>Costos por línea de código</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!loading && result && (
            <div className="results-container">
              <Tabs 
                tabs={getResultTabs()}
                defaultActiveId="complexity"
                onChange={setActiveResultTab}
                variant="pills"
              />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>EffiCode Analyzer © 2025 - Análisis y Diseño de Algoritmos</p>
      </footer>
    </div>
  );
}

export default App;

