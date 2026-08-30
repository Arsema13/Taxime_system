import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Globe, Moon, Sun } from 'lucide-react';
import { settingsService } from '@/services';
import type { UserSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast, useTheme } from '@/contexts';

export default function SettingsPage() {
  const { success, error } = useToast();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      // Sync theme from backend to local theme context
      if (data.theme) {
        setTheme(data.theme as 'light' | 'dark' | 'system');
      }
    } catch {
      error('Error', 'Could not load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      // Apply theme immediately when saved
      if (settings.theme) {
        setTheme(settings.theme as 'light' | 'dark' | 'system');
      }
      success('Updated', 'Settings saved successfully');
    } catch {
      error('Error', 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!settings) return null;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your preferences and configurations"
      />

      <form onSubmit={handleSave}>
        <div className="flex flex-col gap-6">
          {/* Notifications */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={e => setSettings(s => s ? { ...s, emailNotifications: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskAssignedNotification}
                  onChange={e => setSettings(s => s ? { ...s, taskAssignedNotification: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Task Assignments</p>
                  <p className="text-sm text-slate-500">Notify when assigned to a task</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskUpdatedNotification}
                  onChange={e => setSettings(s => s ? { ...s, taskUpdatedNotification: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Task Updates</p>
                  <p className="text-sm text-slate-500">Notify when a task is updated</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deadlineReminderNotification}
                  onChange={e => setSettings(s => s ? { ...s, deadlineReminderNotification: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Deadline Reminders</p>
                  <p className="text-sm text-slate-500">Notify before task deadlines</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.commentNotification}
                  onChange={e => setSettings(s => s ? { ...s, commentNotification: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Comments</p>
                  <p className="text-sm text-slate-500">Notify when someone comments on your tasks</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mentionNotification}
                  onChange={e => setSettings(s => s ? { ...s, mentionNotification: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Mentions</p>
                  <p className="text-sm text-slate-500">Notify when you're mentioned</p>
                </div>
              </label>
            </div>
          </Card>

          {/* Appearance */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-slate-600" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                <Select
                  value={settings.theme}
                  onChange={e => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'system';
                    setSettings(s => s ? { ...s, theme: newTheme } : null);
                    setTheme(newTheme); // Apply theme immediately
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Choose your preferred color theme</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default View</label>
                <Select
                  value={settings.defaultTaskView}
                  onChange={e => setSettings(s => s ? { ...s, defaultTaskView: e.target.value as any } : null)}
                >
                  <option value="list">List View</option>
                  <option value="kanban">Kanban Board</option>
                  <option value="calendar">Calendar View</option>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Your preferred task view layout</p>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600" />
              Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <Select
                  value={settings.language}
                  onChange={e => setSettings(s => s ? { ...s, language: e.target.value } : null)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                <Select
                  value={settings.timezone}
                  onChange={e => setSettings(s => s ? { ...s, timezone: e.target.value } : null)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                <Select
                  value={settings.dateFormat}
                  onChange={e => setSettings(s => s ? { ...s, dateFormat: e.target.value } : null)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Format</label>
                <Select
                  value={settings.timeFormat}
                  onChange={e => setSettings(s => s ? { ...s, timeFormat: e.target.value as any } : null)}
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600" />
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={e => setSettings(s => s ? { ...s, showOnlineStatus: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Show Online Status</p>
                  <p className="text-sm text-slate-500">Let others see when you're online</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowTaskInvitations}
                  onChange={e => setSettings(s => s ? { ...s, allowTaskInvitations: e.target.checked } : null)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700">Allow Task Invitations</p>
                  <p className="text-sm text-slate-500">Allow others to assign tasks to you</p>
                </div>
              </label>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" icon={<Save className="w-4 h-4" />} loading={saving} size="lg">
              Save All Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
