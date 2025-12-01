import React, { useState } from 'react';
import './DownloadReport.css';

interface DownloadReportProps {
  pseudocode: string;
  analysisData: {
    complexity: {
      bigO: string;
      bigOmega: string;
      bigTheta: string;
      averageCase?: string;
    };
    justification: Record<string, unknown>;
    validation?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const DownloadReport: React.FC<DownloadReportProps> = ({
  pseudocode,
  analysisData
}) => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (format: 'pdf' | 'json') => {
    const setLoading = format === 'pdf' ? setLoadingPdf : setLoadingJson;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/analysis/report/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pseudocode,
          analysis_data: analysisData,
          format
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_complejidad.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err instanceof Error ? err.message : 'Error al descargar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="download-section">
      <h3 className="download-section__title">
        <span>📥</span>
        Descargar Reporte
      </h3>
      <p className="download-section__description">
        Descarga el análisis completo en el formato de tu preferencia.
      </p>
      
      <div className="download-buttons">
        <button
          className={`download-btn download-btn--pdf ${loadingPdf ? 'download-btn--loading' : ''}`}
          onClick={() => downloadFile('pdf')}
          disabled={loadingPdf || loadingJson}
        >
          <span className="download-btn__icon">📄</span>
          <span className="download-btn__text">
            <span className="download-btn__label">Descargar</span>
            <span className="download-btn__format">PDF</span>
          </span>
        </button>

        <button
          className={`download-btn download-btn--json ${loadingJson ? 'download-btn--loading' : ''}`}
          onClick={() => downloadFile('json')}
          disabled={loadingPdf || loadingJson}
        >
          <span className="download-btn__icon">📋</span>
          <span className="download-btn__text">
            <span className="download-btn__label">Descargar</span>
            <span className="download-btn__format">JSON</span>
          </span>
        </button>
      </div>

      {error && (
        <div className="download-error" style={{
          marginTop: '12px',
          padding: '10px',
          background: '#fee2e2',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default DownloadReport;
