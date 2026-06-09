import { Settings as SettingsIcon, Globe, Bell, Shield } from 'lucide-react';
import { getDictionary } from "@/lib/dictionary";

export default async function SettingsPage() {
  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage system preferences and configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Globe className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Language</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Change the display language for the system interface.</p>
          <p className="text-sm text-slate-700 font-medium">Use the language switcher at the bottom-right of the screen.</p>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Bell className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
          </div>
          <p className="text-sm text-slate-500">Notification settings will be available in a future update.</p>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Shield className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Security</h2>
          </div>
          <p className="text-sm text-slate-500">Password change and two-factor authentication will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
