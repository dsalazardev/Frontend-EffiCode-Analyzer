import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text,
  fullScreen = false 
}) => {
  const content = (
    <div className={`loader loader--${size}`}>
      <div className="loader__spinner">
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
        <div className="loader__code">&lt;/&gt;</div>
      </div>
      {text && <p className="loader__text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader__overlay">{content}</div>;
  }

  return content;
};

export default Loader;
