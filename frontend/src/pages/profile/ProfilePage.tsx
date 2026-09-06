import React, { useState } from 'react';
import { Save, Mail, Phone, Building2, Calendar, Shield, Check } from 'lucide-react';
import { userService, authService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast, useAuth } from '@/contexts';
import { format } from 'date-fns';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/personas/svg?seed=Felix&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=Mia&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=Luna&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=Max&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/personas/svg?seed=Sophie&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/personas/svg?seed=Charlie&backgroundColor=c1f4c5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Bella&backgroundColor=f9d5c5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Liam&backgroundColor=f5e6cc',
  'https://api.dicebear.com/7.x/personas/svg?seed=Aria&backgroundColor=e8d5f5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Noah&backgroundColor=d5eef5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Zoe&backgroundColor=f5f0d5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Ethan&backgroundColor=d5f5e8',
  'https://api.dicebear.com/7.x/personas/svg?seed=Chloe&backgroundColor=f5d5e8',
  'https://api.dicebear.com/7.x/personas/svg?seed=Oliver&backgroundColor=d5f5f0',
  'https://api.dicebear.com/7.x/personas/svg?seed=Lily&backgroundColor=f0d5f5',
  'https://api.dicebear.com/7.x/personas/svg?seed=James&backgroundColor=d5f0f5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Maya&backgroundColor=f5f5d5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Lucas&backgroundColor=d5f5d5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Emma&backgroundColor=f5d5d5',
  'https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=d5d5f5',
];

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.avatar ?? null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const payload: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      };
      if (profileData.phone) payload.phone = profileData.phone;
      if (profileData.bio) payload.bio = profileData.bio;
      if (selectedAvatar) payload.avatar = selectedAvatar;

      const updated = await userService.updateProfile(payload);
      updateUser(updated);
      success('Updated', 'Profile updated successfully');
    } catch {
      error('Error', 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Error', 'Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      error('Error', 'Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      success('Updated', 'Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      error('Error', 'Could not change password. Check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your personal information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card padding="lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Avatar
                src={selectedAvatar || user.avatar}
                name={`${user.firstName} ${user.lastName}`}
                size="xl"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <Badge variant={
              user.role === 'SUPER_ADMIN' ? 'danger' :
              user.role === 'ADMIN' ? 'warning' :
              user.role === 'TEAM_LEAD' ? 'primary' : 'default'
            } className="mb-4">
              {user.role.replace(/_/g, ' ')}
            </Badge>

            {user.bio && (
              <p className="text-sm text-slate-600 mb-4">{user.bio}</p>
            )}

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-2 text-sm">
              {user.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{user.department.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Avatar Picker */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {AVATAR_OPTIONS.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                    selectedAvatar === avatarUrl
                      ? 'border-teal-500 ring-2 ring-teal-200'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 bg-teal-500/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Select an avatar from the options above</p>
          </Card>

          {/* Profile Information */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h3>
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  required
                  value={profileData.firstName}
                  onChange={e => setProfileData(d => ({ ...d, firstName: e.target.value }))}
                />
                <Input
                  label="Last Name"
                  required
                  value={profileData.lastName}
                  onChange={e => setProfileData(d => ({ ...d, lastName: e.target.value }))}
                />
              </div>

              <Input
                type="email"
                label="Email"
                required
                value={profileData.email}
                onChange={e => setProfileData(d => ({ ...d, email: e.target.value }))}
              />

              <Input
                type="tel"
                label="Phone"
                value={profileData.phone}
                onChange={e => setProfileData(d => ({ ...d, phone: e.target.value }))}
              />

              <Textarea
                label="Bio"
                value={profileData.bio}
                onChange={e => setProfileData(d => ({ ...d, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />

              <Button type="submit" icon={<Save className="w-4 h-4" />} loading={saving}>
                Save Changes
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <Input
                type="password"
                label="Current Password"
                required
                value={passwordData.currentPassword}
                onChange={e => setPasswordData(d => ({ ...d, currentPassword: e.target.value }))}
                autoComplete="current-password"
              />

              <Input
                type="password"
                label="New Password"
                required
                value={passwordData.newPassword}
                onChange={e => setPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                autoComplete="new-password"
              />

              <Input
                type="password"
                label="Confirm New Password"
                required
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData(d => ({ ...d, confirmPassword: e.target.value }))}
                autoComplete="new-password"
              />

              <Button type="submit" icon={<Shield className="w-4 h-4" />} loading={changingPassword}>
                Change Password
              </Button>
            </form>
          </Card>

          {/* Account Information */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-600">Account ID</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-600">Account Status</span>
                <Badge variant={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-600">Member Since</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
