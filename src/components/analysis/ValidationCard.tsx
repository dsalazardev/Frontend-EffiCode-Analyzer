import React from 'react';
import './ValidationCard.css';

interface ValidationCardProps {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export const ValidationCard: React.FC<ValidationCardProps> = ({
  isValid,
  errors = [],
  warnings = []
}) => {
  return (
    <div className={`validation-card ${isValid ? 'validation-card--valid' : 'validation-card--invalid'}`}>
      <div className="validation-card__header">
        <span className="validation-card__icon">
          {isValid ? '✅' : '❌'}
        </span>
        <h3 className="validation-card__title">
          {isValid ? 'Código Válido' : 'Código con Errores'}
        </h3>
      </div>

      <div className="validation-card__status">
        <span className={`validation-card__badge ${isValid ? 'validation-card__badge--success' : 'validation-card__badge--error'}`}>
          {isValid ? 'VÁLIDO' : 'INVÁLIDO'}
        </span>
      </div>

      {errors.length > 0 && (
        <div className="validation-card__section validation-card__section--errors">
          <h4 className="validation-card__section-title">
            <span>⚠️</span> Errores ({errors.length})
          </h4>
          <ul className="validation-card__list">
            {errors.map((error, index) => (
              <li key={index} className="validation-card__item validation-card__item--error">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="validation-card__section validation-card__section--warnings">
          <h4 className="validation-card__section-title">
            <span>💡</span> Advertencias ({warnings.length})
          </h4>
          <ul className="validation-card__list">
            {warnings.map((warning, index) => (
              <li key={index} className="validation-card__item validation-card__item--warning">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isValid && errors.length === 0 && warnings.length === 0 && (
        <p className="validation-card__message">
          El código Python es sintácticamente correcto y está listo para el análisis de complejidad.
        </p>
      )}
    </div>
  );
};

export default ValidationCard;
