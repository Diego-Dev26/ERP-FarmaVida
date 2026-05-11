import React from 'react';
import '../../styles/components/com-loading.css';

const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'com-loading-spinner--sm',
    md: 'com-loading-spinner--md',
    lg: 'com-loading-spinner--lg'
  };
  
  const spinner = <div className={`com-loading-spinner ${sizes[size]}`}></div>;
  
  if (fullScreen) {
    return (
      <div className="com-loading-fullscreen">
        {spinner}
        <p className="com-loading-text">Cargando...</p>
      </div>
    );
  }
  
  return (
    <div className="com-loading-container">
      {spinner}
    </div>
  );
};

export default Loading;