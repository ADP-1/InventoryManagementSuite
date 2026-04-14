import React from 'react';
import { useLocation } from 'react-router-dom';

const Topbar: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('categories')) return 'Categories';
    if (path.includes('products')) return 'Products';
    if (path.includes('customers')) return 'Customers';
    if (path.includes('invoices')) return 'Invoices';
    return 'Home';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-slate-800">
        {getPageTitle(location.pathname)}
      </h2>
      <div className="ml-auto flex items-center space-x-4">
        {/* Placeholder for notifications or user profile */}
      </div>
    </header>
  );
};

export default Topbar;
