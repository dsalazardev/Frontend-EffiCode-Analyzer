import React from 'react';
import { SafeBlockMath } from '../../ui/SafeMath/SafeMath';
import { type ResolutionStep, type CaseType } from '../../../types';
import './ResolutionSteps.css';

interface ResolutionStepsProps {
  steps: ResolutionStep[];
  caseType: CaseType;
}

export const ResolutionSteps: React.FC<ResolutionStepsProps> = ({ steps, caseType }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="resolution-steps resolution-steps--empty">
        <p>No hay pasos de resolución disponibles.</p>
      </div>
    );
  }

  const caseConfig = {
    worst: { label: 'Peor Caso (Big O)', icon: '📈' },
    best: { label: 'Mejor Caso (Big Ω)', icon: '📉' },
    average: { label: 'Caso Promedio E[T(n)]', icon: '📊' }
  };

  const { label: caseLabel, icon: caseIcon } = caseConfig[caseType];

  return (
    <div className={`resolution-steps resolution-steps--${caseType}`}>
      <div className="resolution-steps__header">
        <span className="resolution-steps__icon">{caseIcon}</span>
        <h3 className="resolution-steps__title">Resolución Matemática - {caseLabel}</h3>
      </div>

      <div className="resolution-steps__timeline">
        {steps.map((step, index) => (
          <div key={index} className="resolution-step">
            <div className="resolution-step__marker">
              <span className="resolution-step__number">{step.step || index + 1}</span>
            </div>
            
            <div className="resolution-step__content">
              <h4 className="resolution-step__title">{step.title}</h4>
              
              {step.description && (
                <p className="resolution-step__description">{step.description}</p>
              )}
              
              {step.latex && (
                <div className="resolution-step__formula">
                  <SafeBlockMath math={step.latex} fallback={step.latex} />
                </div>
              )}
              
              {step.explanation && (
                <div className="resolution-step__explanation">
                  <span className="resolution-step__explanation-icon">💡</span>
                  <span>{step.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolutionSteps;
