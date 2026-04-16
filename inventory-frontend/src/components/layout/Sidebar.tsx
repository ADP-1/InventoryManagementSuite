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
    <div className="flex flex-col h-full bg-white border-r border-slate-100 text-slate-600 w-72">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Box size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Inventory<span className="text-orange-500">Pro</span></h1>
        </div>
      </div>

      {/* Main Menu */}
      <div className="px-4 mb-4">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
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
                      ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100/50' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-6">Other Menu</p>
        <nav className="space-y-1">
          <a href="#" className="flex items-center px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
            <HelpCircle size={20} className="mr-3 group-hover:text-orange-500" />
            <span className="text-sm font-bold">Helps & Support</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
            <MessageSquare size={20} className="mr-3 group-hover:text-orange-500" />
            <span className="text-sm font-bold">Report</span>
          </a>
          <NavLink 
            to="/settings" 
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
          className="flex items-center w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
