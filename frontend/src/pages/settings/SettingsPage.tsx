import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette } from 'lucide-react';
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
  const { setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
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

  const update = (patch: Partial<UserSettings>) =>
    setSettings(s => s ? { ...s, ...patch } : null);

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
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications ?? true}
                  onChange={e => update({ emailNotifications: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Email Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskAssignedNotification ?? true}
                  onChange={e => update({ taskAssignedNotification: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Task Assignments</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Notify when assigned to a task</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskUpdatedNotification ?? true}
                  onChange={e => update({ taskUpdatedNotification: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Task Updates</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Notify when a task is updated</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskDueNotification ?? true}
                  onChange={e => update({ taskDueNotification: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Deadline Reminders</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Notify before task deadlines</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.commentMentionNotification ?? true}
                  onChange={e => update({ commentMentionNotification: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Comments & Mentions</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Notify when someone comments on or mentions you in tasks</p>
                </div>
              </label>
            </div>
          </Card>

          {/* Appearance */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                <Select
                  value={settings.theme ?? 'light'}
                  onChange={e => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'system';
                    update({ theme: newTheme });
                    setTheme(newTheme);
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose your preferred color theme</p>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Format</label>
                <Select
                  value={settings.dateFormat ?? 'MM/DD/YYYY'}
                  onChange={e => update({ dateFormat: e.target.value })}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Format</label>
                <Select
                  value={settings.timeFormat ?? '12h'}
                  onChange={e => update({ timeFormat: e.target.value })}
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Privacy
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Visibility</label>
                <Select
                  value={settings.profileVisibility ?? 'team'}
                  onChange={e => update({ profileVisibility: e.target.value })}
                >
                  <option value="public">Public - Everyone can see your profile</option>
                  <option value="team">Team - Only team members can see your profile</option>
                  <option value="private">Private - Only you can see your profile</option>
                </Select>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showEmail ?? false}
                  onChange={e => update({ showEmail: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Show Email</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow others to see your email address</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPhone ?? false}
                  onChange={e => update({ showPhone: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Show Phone</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow others to see your phone number</p>
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
