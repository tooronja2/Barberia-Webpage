import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 rounded-full animate-loading
        ${colorClasses[color]}
        ${className}
      `}
    />
  );
};

export const LoadingOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeInUp">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        {children && (
          <p className="text-foreground/70 animate-pulse">{children}</p>
        )}
      </div>
    </div>
  );
};

export const LoadingCard: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-xl animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-shimmer"></div>
        <div className="h-4 bg-muted rounded w-3/4 animate-shimmer"></div>
        <div className="h-20 bg-muted rounded animate-shimmer"></div>
        <div className="flex space-x-4">
          <div className="h-8 bg-muted rounded w-20 animate-shimmer"></div>
          <div className="h-8 bg-muted rounded w-20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};