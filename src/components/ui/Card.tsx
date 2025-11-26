import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  icon, 
  variant = 'default',
  className = '' 
}) => {
  return (
    <div className={`card card--${variant} ${className}`}>
      {title && (
        <div className="card__header">
          {icon && <span className="card__icon">{icon}</span>}
          <h3 className="card__title">{title}</h3>
        </div>
      )}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};
