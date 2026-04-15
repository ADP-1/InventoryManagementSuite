import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Tags, Users, FileText, BarChart2, LogOut } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-wider">Inventory Pro</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems
          .filter(item => !item.roles || (role && item.roles.includes(role)))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4 px-4">
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{email}</p>
            <p className="text-xs text-slate-500 uppercase tracking-tight">{role}</p>
          </div>
          <span className={cn(
            "ml-2 px-1.5 py-0.5 text-[10px] rounded border uppercase font-semibold",
            role === 'ADMIN' ? "border-red-500 text-red-500" : 
            role === 'MANAGER' ? "border-blue-500 text-blue-500" : "border-green-500 text-green-500"
          )}>
            {role}
          </span>
        </div>
        <button
          onClick={() => clearAuth()}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
