import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Star, Users, Building2,
  BarChart3, Bell, Activity, Settings, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Shield, ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { Avatar } from '@/components/ui/Avatar';
import { useNotifications } from '@/contexts';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    to: '/dashboard',     icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tasks',        to: '/tasks',         icon: <CheckSquare className="w-5 h-5" /> },
  { label: 'My Tasks',     to: '/my-tasks',      icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Calendar',     to: '/calendar',      icon: <Calendar className="w-5 h-5" /> },
  { label: 'Favorites',    to: '/favorites',     icon: <Star className="w-5 h-5" /> },
  { label: 'Teams',        to: '/teams',         icon: <Users className="w-5 h-5" />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Employees',    to: '/employees',     icon: <Users className="w-5 h-5" />, roles: ['COMMANDER'] },
  { label: 'Departments',  to: '/departments',   icon: <Building2 className="w-5 h-5" />, roles: ['COMMANDER'] },
  { label: 'Reports',      to: '/reports',       icon: <BarChart3 className="w-5 h-5" />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Activity Log', to: '/activity',      icon: <Activity className="w-5 h-5" />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Audit Log',    to: '/audit',         icon: <Shield className="w-5 h-5" />, roles: ['COMMANDER'] },
  { label: 'Notifications',to: '/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Settings',     to: '/settings',      icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotifications();
  const location         = useLocation();

  const allowed = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? ''),
  ).map((item) =>
    item.to === '/notifications' ? { ...item, badge: unreadCount } : item,
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-teal-700 font-black text-lg leading-none">T</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-lg leading-tight tracking-tight">Taxime</p>
            <p className="text-teal-200 text-xs leading-tight">Task Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {allowed.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={[
                'sidebar-link relative',
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                collapsed ? 'justify-center px-2' : '',
              ].join(' ')}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.badge != null && item.badge > 0 && (
                <span className={[
                  'absolute top-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none',
                  collapsed ? 'right-1.5 w-4 h-4 text-[9px]' : 'right-2 min-w-[18px] h-[18px] px-1',
                ].join(' ')}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`border-t border-white/10 px-2 py-3 shrink-0 flex flex-col gap-1`}>
        <NavLink
          to="/profile"
          onClick={onMobileClose}
          className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Avatar src={user?.avatar} name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-teal-300 text-xs truncate leading-tight capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          )}
        </NavLink>
        <button
          onClick={logout}
          title="Logout"
          className={`sidebar-link sidebar-link-inactive text-red-300 hover:bg-red-900/30 hover:text-red-200 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-teal-600"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={[
          'hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300 relative',
          'bg-gradient-to-b from-teal-800 to-teal-900',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-64 h-full bg-gradient-to-b from-teal-800 to-teal-900 flex flex-col shadow-2xl">
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-3 text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
