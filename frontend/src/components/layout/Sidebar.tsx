import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Star, Users, Building2,
  BarChart3, Bell, Activity, Settings, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Shield, ClipboardList, AlertTriangle,
  Plus, Send, Triangle,
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/contexts';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    to: '/dashboard',     icon: <LayoutDashboard size={18} /> },
  { label: 'Tasks',        to: '/tasks',         icon: <CheckSquare size={18} /> },
  { label: 'My Tasks',     to: '/my-tasks',      icon: <ClipboardList size={18} /> },
  { label: 'Calendar',     to: '/calendar',      icon: <Calendar size={18} /> },
  { label: 'Favorites',    to: '/favorites',     icon: <Star size={18} /> },
  { label: 'Teams',        to: '/teams',         icon: <Users size={18} />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Employees',    to: '/employees',     icon: <Users size={18} />, roles: ['COMMANDER'] },
  { label: 'Departments',  to: '/departments',   icon: <Building2 size={18} />, roles: ['COMMANDER'] },
  { label: 'Reports',      to: '/reports',       icon: <BarChart3 size={18} />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Activity Log', to: '/activity',      icon: <Activity size={18} />, roles: ['COMMANDER', 'TEAM_LEAD'] },
  { label: 'Audit Log',    to: '/audit',         icon: <Shield size={18} />, roles: ['COMMANDER'] },
  { label: 'Notifications',to: '/notifications', icon: <Bell size={18} /> },
  { label: 'Settings',     to: '/settings',      icon: <Settings size={18} /> },
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const allowed = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? ''),
  ).map((item) =>
    item.to === '/notifications' ? { ...item, badge: unreadCount } : item,
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-6 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center space-y-5">
          {allowed.slice(0, 8).map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                title={item.label}
                className={[
                  'relative p-2 rounded-full transition-all duration-200',
                  isActive ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex flex-col items-center space-y-5">
          {allowed.slice(8).map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                title={item.label}
                className={[
                  'relative p-2 rounded-full transition-all duration-200',
                  isActive ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          <NavLink
            to="/tasks/create"
            onClick={onMobileClose}
            title="Create Task"
            className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200"
          >
            <Plus size={16} />
          </NavLink>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Logout</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside
        className={[
          'hidden lg:flex flex-col bg-black/80 backdrop-blur-md text-slate-300 rounded-full py-6 shadow-xl transition-all duration-300 shrink-0',
          collapsed ? 'w-14' : 'w-14',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-16 h-full bg-black/80 backdrop-blur-md flex flex-col shadow-2xl rounded-r-full py-6">
            <button
              onClick={onMobileClose}
              className="absolute right-2 top-4 text-white/70 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <button
        onClick={onToggle}
        className="hidden lg:flex absolute left-[4.5rem] top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-teal-600 z-30"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </>
  );
}
