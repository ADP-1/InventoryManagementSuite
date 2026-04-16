import React from 'react';
import { User, Bell, Shield, Palette, Smartphone, Globe } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const SettingsPage: React.FC = () => {
  const { email, role } = useAuthStore();

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your public profile and personal information',
      items: [
        { label: 'Display Name', value: email?.split('@')[0] || 'User', type: 'text' },
        { label: 'Email Address', value: email || '', type: 'email' },
        { label: 'User Role', value: role || '', type: 'badge' },
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your dashboard',
      items: [
        { label: 'Theme Mode', value: 'Light Mode', type: 'select' },
        { label: 'Accent Color', value: 'Orange (Nusantara)', type: 'color' },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Choose what updates you want to receive',
      items: [
        { label: 'Email Notifications', value: true, type: 'toggle' },
        { label: 'Desktop Alerts', value: false, type: 'toggle' },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences and application configuration"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Local) */}
        <div className="lg:col-span-1 space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.title}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all text-left group"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-orange-500 transition-all shadow-sm">
                <section.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{section.title}</p>
                <p className="text-[10px] text-slate-500 font-medium">{section.description}</p>
              </div>
            </button>
          ))}
          
          <div className="p-6 mt-8 rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
            <Shield className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <h4 className="text-lg font-bold mb-2">Security Score</h4>
            <p className="text-xs opacity-80 mb-4 font-medium leading-relaxed">Your account is 85% secure. Add 2FA to reach 100%.</p>
            <button className="px-4 py-2 bg-white text-orange-500 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors">
              Improve Security
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
              <div className="p-6 space-y-6">
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">Update your {item.label.toLowerCase()} settings</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {item.type === 'badge' ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {item.value}
                        </span>
                      ) : item.type === 'toggle' ? (
                        <div className={cn(
                          "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200",
                          item.value ? "bg-orange-500" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                            item.value ? "translate-x-6" : "translate-x-0"
                          )} />
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 min-w-[120px]">
                          {item.value}
                        </div>
                      )}
                      <button className="text-xs font-bold text-orange-600 hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
