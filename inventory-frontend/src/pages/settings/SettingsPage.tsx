import React, { useState } from 'react';
import { User, Palette, Shield, Loader2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../lib/utils';
import { authApi } from '../../api/authApi';

const SettingsPage: React.FC = () => {
  const { name, email, role, setAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [displayName, setDisplayName] = useState(name || email?.split('@')[0] || 'User');
  const [emailAddress, setEmailAddress] = useState(email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const res = await authApi.updateProfile({ name: displayName, email: emailAddress });
      if (res.success && res.data) {
        setAuth(res.data);
        alert('Profile updated successfully!');
      } else {
        alert(res.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert(error.response?.data?.message || 'An error occurred while updating the profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your public profile and personal information',
      items: [
        { label: 'Display Name', value: displayName, type: 'text', onChange: setDisplayName },
        { label: 'Email Address', value: emailAddress, type: 'email', onChange: setEmailAddress },
        { label: 'User Role', value: role || '', type: 'badge' },
      ],
      onSave: handleSaveProfile,
      isSaving: isSavingProfile
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your dashboard',
      items: [
        { 
          label: 'Theme Mode', 
          value: theme === 'dark', 
          type: 'theme-toggle',
          description: 'Toggle between Light and Dark mode' 
        },
        { 
          label: 'Accent Color', 
          value: 'Standard Orange', 
          type: 'color',
          description: 'Choose your primary brand color'
        },
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
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-slate-700 transition-all text-left group"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-white dark:bg-slate-800 group-hover:text-orange-500 transition-all shadow-sm">
                <section.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{section.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
              <div className="p-6 space-y-6">
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{('description' in item ? item.description : undefined) || `Update your ${item.label.toLowerCase()} settings`}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {item.type === 'badge' ? (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {item.value}
                        </span>
                      ) : item.type === 'text' || item.type === 'email' ? (
                        <input
                          type={item.type}
                          value={item.value as string}
                          onChange={(e) => { if ('onChange' in item && typeof item.onChange === 'function') item.onChange(e.target.value); }}
                          className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white w-full md:w-[300px] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                      ) : item.type === 'theme-toggle' ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={theme === 'dark'}
                          onClick={toggleTheme}
                          aria-label="Toggle dark mode"
                          className={cn(
                            "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 relative",
                            item.value ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-600"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white dark:bg-slate-800 rounded-full shadow-sm transition-transform duration-200",
                            item.value ? "translate-x-6" : "translate-x-0"
                          )} />
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[120px]">
                          {item.value}
                        </div>
                      )}
                      {item.type !== 'theme-toggle' && item.type !== 'text' && item.type !== 'email' && (
                        <button className="text-xs font-bold text-orange-600 hover:underline">Edit</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {'onSave' in section && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    onClick={section.onSave}
                    disabled={section.isSaving}
                    className="px-6 py-2 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {section.isSaving && <Loader2 size={14} className="animate-spin" />}
                    {section.isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;