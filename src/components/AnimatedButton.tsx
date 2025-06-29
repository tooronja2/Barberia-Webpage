import React, { useState } from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
  glow?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  pulse = false,
  glow = false,
  type = 'button',
  size = 'md',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium
    transition-all duration-300 transform-gpu
    ${sizeClasses[size]}
    ${pulse ? 'animate-pulse' : ''}
    ${glow ? 'hover:shadow-lg hover:shadow-primary/20' : ''}
    ${isPressed ? 'scale-95' : 'hover:scale-105'}
    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    active:scale-95
    ${className}
  `;

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </div>
    </button>
  );
};