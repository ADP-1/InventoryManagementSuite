import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Tags, 
  Users, 
  FileText, 
  BarChart2, 
  LogOut, 
  ChevronDown, 
  HelpCircle, 
  MessageSquare,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Analytics', icon: BarChart2, path: '/analytics', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Categories', icon: Tags, path: '/inventory/categories' },
  { name: 'Products', icon: Box, path: '/inventory/products' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Invoices', icon: FileText, path: '/billing/invoices' },
];

const Sidebar: React.FC = () => {
  const { email, role, clearAuth } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 w-72 transition-colors duration-200">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
            <Box size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Inventory<span className="text-orange-500">Pro</span></h1>
        </div>
      </div>

      {/* Main Menu */}
      <div className="px-4 mb-4">
        <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
        <nav className="space-y-1">
          {navItems
            .filter(item => !item.roles || (role && item.roles.includes(role)))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive 
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 shadow-sm shadow-orange-100/50 dark:shadow-none' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white dark:hover:text-slate-200'
                  )
                }
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  "group-hover:text-orange-500"
                )} />
                <span className="text-sm font-bold">{item.name}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      {/* Other Menu */}
      <div className="px-4 flex-1">
        <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 mt-6">Other Menu</p>
        <nav className="space-y-1">
          <NavLink 
            to="/settings" 
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 shadow-sm shadow-orange-100/50 dark:shadow-none' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white dark:hover:text-slate-200'
              )
            }
          >
            <Settings size={20} className="mr-3 group-hover:text-orange-500" />
            <span className="text-sm font-bold">Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => clearAuth()}
          className="flex items-center w-full px-4 py-3 text-sm font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
