import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Package, User, FileText, Loader2, X } from 'lucide-react';
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch';
import { cn } from '../../lib/utils';

const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { results, isLoading } = useGlobalSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('categories')) return 'Categories';
    if (path.includes('products')) return 'Products';
    if (path.includes('customers')) return 'Customers';
    if (path.includes('invoices')) return 'Invoices';
    return 'Home';
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if (result.type === 'PRODUCT') navigate('/inventory/products');
    if (result.type === 'CUSTOMER') navigate('/customers');
    if (result.type === 'INVOICE') navigate('/billing/invoices');
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-12">
        <h2 className="text-xl font-black text-slate-900 tracking-tight shrink-0">
          {getPageTitle(location.pathname)}
        </h2>

        {/* Global Search Bar */}
        <div ref={searchRef} className="max-w-md w-full relative">
          <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 bg-slate-50 border rounded-2xl transition-all duration-200",
            isSearchFocused ? "bg-white border-indigo-600 ring-4 ring-indigo-50 shadow-sm" : "border-slate-100"
          )}>
            <Search size={18} className={cn(isSearchFocused ? "text-indigo-600" : "text-slate-400")} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search products, customers, invoices..."
              className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-indigo-600" />
            ) : searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, idx) => (
                      <button
                        key={`${result.type}-${idx}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={cn(
                            "p-2.5 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all",
                            result.type === 'PRODUCT' ? "bg-blue-50 text-blue-600" :
                            result.type === 'CUSTOMER' ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                          )}>
                            {result.type === 'PRODUCT' && <Package size={18} />}
                            {result.type === 'CUSTOMER' && <User size={18} />}
                            {result.type === 'INVOICE' && <FileText size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {result.type === 'PRODUCT' ? (result.data as any).name :
                               result.type === 'CUSTOMER' ? (result.data as any).name :
                               (result.data as any).invoiceNumber}
                            </p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {result.type} {result.type === 'PRODUCT' ? `• ${(result.data as any).sku}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                          <Search size={14} strokeWidth={3} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="p-8 text-center">
                    <p className="text-sm font-bold text-slate-400">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Placeholder for notifications or user profile */}
      </div>
    </header>
  );
};

export default Topbar;
