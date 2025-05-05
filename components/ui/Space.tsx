import React from 'react';

interface SpaceProps {
  size?: number | string;
  className?: string;
  axis?: 'vertical' | 'horizontal';
}

const Space: React.FC<SpaceProps> = ({
  size = 4,
  className = '',
  axis = 'vertical'
}) => {
  // Convert number to pixels, or use string directly
  const sizeValue = typeof size === 'number' ? `${size * 4}px` : size;
  
  const style = {
    ...(axis === 'vertical' ? { height: sizeValue } : { width: sizeValue })
  };

  return <div style={style} className={`flex-shrink-0 ${className}`} />;
};

export default Space;