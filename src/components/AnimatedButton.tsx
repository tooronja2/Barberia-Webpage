import React, { useState } from 'react';
import { Button } from './ui/button';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  pulse = false,
  glow = false,
  icon,
  type = 'button',
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

  const animationClasses = `
    transform-gpu will-change-transform
    transition-all duration-300 ease-out
    ${pulse ? 'animate-pulseButton' : ''}
    ${glow ? 'hover:animate-glow' : ''}
    ${isPressed ? 'scale-95' : 'hover:scale-105'}
    ${loading ? 'animate-pulse' : ''}
    active:scale-95
    hover:shadow-gold
    ${className}
  `;

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={`${sizeClasses[size]} ${animationClasses}`}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-loading" />
        )}
        {icon && !loading && icon}
        {children}
      </div>
    </Button>
  );
};