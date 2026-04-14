import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children, className }) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
