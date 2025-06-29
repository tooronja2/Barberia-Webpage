import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        transform-gpu will-change-transform
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const FadeTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        transform-gpu will-change-transform
        transition-opacity duration-500 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const SlideTransition: React.FC<PageTransitionProps & { direction?: 'up' | 'down' | 'left' | 'right' }> = ({
  children,
  className = '',
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const directionClasses = {
    up: isVisible ? 'translate-y-0' : 'translate-y-12',
    down: isVisible ? 'translate-y-0' : '-translate-y-12',
    left: isVisible ? 'translate-x-0' : 'translate-x-12',
    right: isVisible ? 'translate-x-0' : '-translate-x-12',
  };

  return (
    <div
      className={`
        transform-gpu will-change-transform
        transition-all duration-600 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${directionClasses[direction]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};