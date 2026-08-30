import React, { useState } from 'react';
import { Save, Camera, Mail, Phone, Building2, Calendar, Shield } from 'lucide-react';
import { userService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast, useAuth } from '@/contexts';
import { format } from 'date-fns';

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Error', 'File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.bio) formData.append('bio', profileData.bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const updated = await userService.updateProfile(formData);
      updateUser(updated);
      success('Updated', 'Profile updated successfully');
      setAvatarFile(null);
      setAvatarPreview(null);
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
      await userService.changePassword({
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
            <div className="relative mb-4">
              <Avatar
                src={avatarPreview || user.avatar}
                name={`${user.firstName} ${user.lastName}`}
                size="xl"
              />
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <Badge variant={
              user.role === 'SUPER_ADMIN' ? 'danger' :
              user.role === 'COMMANDER' ? 'warning' :
              user.role === 'TEAM_LEAD' ? 'primary' : 'default'
            } className="mb-4">
              {user.role.replace(/_/g, ' ')}
            </Badge>

            {user.bio && (
              <p className="text-sm text-slate-600 mb-4">{user.bio}</p>
            )}

            <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-sm">
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
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Account ID</span>
                <span className="font-mono text-slate-700">{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Account Status</span>
                <Badge variant={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Member Since</span>
                <span className="text-slate-700">
                  {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-slate-700">
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
