import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Package, User, FileText, Loader2, X, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, clearAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { results, isLoading } = useGlobalSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if (result.type === 'PRODUCT') navigate('/inventory/products');
    if (result.type === 'CUSTOMER') navigate('/customers');
    if (result.type === 'INVOICE') navigate('/billing/invoices');
  };

  return (
    <header className="h-24 bg-slate-50 flex items-center px-8 sticky top-0 z-30">
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome Back!</p>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {email?.split('@')[0] || 'User'} <span className="inline-block animate-bounce-slow">👋</span>
          </h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Global Search Bar */}
          <div ref={searchRef} className="w-80 relative">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 bg-white border rounded-2xl transition-all duration-200",
              isSearchFocused ? "border-orange-500 ring-4 ring-orange-50 shadow-sm" : "border-slate-100"
            )}>
              <Search size={18} className={cn(isSearchFocused ? "text-orange-500" : "text-slate-400")} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search.."
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-orange-500" />
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
                              result.type === 'PRODUCT' ? "bg-orange-50 text-orange-600" :
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

          {/* User Menu Flyout */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center overflow-hidden shrink-0 transition-transform group-hover:scale-95">
                <img 
                  src={`https://ui-avatars.com/api/?name=${email}&background=6366f1&color=fff`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate w-24">
                  {email}
                </p>
              </div>
              <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
                </div>
                
                <button 
                  onClick={() => { setIsUserMenuOpen(false); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                >
                  <UserCircle size={18} />
                  Switch Account
                </button>
                
                <div className="h-px bg-slate-50 my-1 mx-2" />
                
                <button 
                  onClick={() => { setIsUserMenuOpen(false); clearAuth(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
