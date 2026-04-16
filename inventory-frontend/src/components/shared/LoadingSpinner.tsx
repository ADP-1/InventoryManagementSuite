import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 24 }) => {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Loader2 className="animate-spin text-orange-500" size={size} />
    </div>
  );
};

export default LoadingSpinner;
