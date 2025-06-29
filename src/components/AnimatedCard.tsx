import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideUpFadeIn' | 'bounceIn';
  delay?: number;
  hover?: 'lift' | 'glow' | 'expand';
  glass?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  animation = 'fadeInUp',
  delay = 0,
  hover = 'lift',
  glass = false,
  onClick,
}) => {
  const animationClasses = {
    fadeInUp: 'animate-fadeInUp',
    fadeInLeft: 'animate-fadeInLeft',
    fadeInRight: 'animate-fadeInRight',
    scaleIn: 'animate-scaleIn',
    slideUpFadeIn: 'animate-slideUpFadeIn',
    bounceIn: 'animate-bounceIn',
  };

  const hoverClasses = {
    lift: 'hover:transform hover:-translate-y-2 hover:shadow-lg',
    glow: 'hover:shadow-primary/20',
    expand: 'hover:scale-105',
  };

  const baseClasses = `
    transition-all duration-300 transform-gpu
    ${glass ? 'bg-card/80 backdrop-blur-sm border border-border/50' : 'bg-card border border-border'}
    ${hoverClasses[hover]}
    ${animationClasses[animation]}
    ${className}
  `;

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      className={baseClasses}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};