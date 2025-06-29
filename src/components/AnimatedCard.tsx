import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideUpFadeIn' | 'bounceIn';
  delay?: number;
  hover?: 'lift' | 'glow' | 'expand';
  glass?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  animation = 'fadeInUp',
  delay = 0,
  hover = 'lift',
  glass = false,
}) => {
  const { ref, isVisible } = useScrollAnimation();

  const animationClasses = {
    fadeInUp: 'animate-fadeInUp',
    fadeInLeft: 'animate-fadeInLeft',
    fadeInRight: 'animate-fadeInRight',
    scaleIn: 'animate-scaleIn',
    slideUpFadeIn: 'animate-slideUpFadeIn',
    bounceIn: 'animate-bounceIn',
  };

  const hoverClasses = {
    lift: 'hover-lift',
    glow: 'hover-glow',
    expand: 'hover-expand',
  };

  const baseClasses = `
    transform-gpu will-change-transform
    ${glass ? 'glass-card' : 'bg-card border border-border'}
    ${hoverClasses[hover]}
    ${isVisible ? animationClasses[animation] : 'opacity-0'}
    ${className}
  `;

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={baseClasses}
      style={style}
    >
      {children}
    </div>
  );
};