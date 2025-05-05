import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Separator: React.FC<SeparatorProps> = ({
  className = '',
  orientation = 'horizontal'
}) => {
  const baseStyles = "bg-neutral-800";
  const orientationStyles = orientation === 'horizontal' 
    ? 'w-full h-px' 
    : 'h-full w-px';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`${baseStyles} ${orientationStyles} ${className}`}
    />
  );
};

export default Separator;