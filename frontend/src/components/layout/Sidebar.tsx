import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Users, Building2,
  BarChart3, Bell, Activity, Settings, LogOut,
  X, AlertTriangle, Plus, Flame, ClipboardList,
  FileText, Send, ClipboardCheck, Star, Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/contexts';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
  excludeRoles?: string[];
  badge?: number;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      to: '/dashboard',          icon: <LayoutDashboard size={20} /> },
  { label: 'Tasks',          to: '/tasks',              icon: <CheckSquare size={20} /> },
  { label: 'My Tasks',       to: '/my-tasks',           icon: <ClipboardList size={20} /> },
  { label: 'Favorites',      to: '/favorites',          icon: <Star size={20} /> },
  { label: 'Calendar',       to: '/calendar',           icon: <Calendar size={20} /> },
  { label: 'Submit Report',  to: '/reports/submit',     icon: <Send size={20} />, excludeRoles: ['ADMIN'] },
  { label: 'My Reports',     to: '/reports/my-reports', icon: <FileText size={20} />, excludeRoles: ['ADMIN'] },
  { label: 'Reports',        to: '/reports/review',     icon: <ClipboardCheck size={20} />, roles: ['ADMIN'] },
  { label: 'Review Reports', to: '/reports/review',     icon: <ClipboardCheck size={20} />, roles: ['TEAM_LEAD'] },
  { label: 'Analytics',      to: '/reports',            icon: <BarChart3 size={20} />, roles: ['ADMIN', 'TEAM_LEAD'] },
  { label: 'Employees',      to: '/employees',          icon: <Users size={20} />, roles: ['ADMIN'] },
  { label: 'Teams',          to: '/teams',              icon: <Users size={20} />, roles: ['ADMIN', 'TEAM_LEAD'] },
  { label: 'Departments',    to: '/departments',        icon: <Building2 size={20} />, roles: ['ADMIN'] },
  { label: 'Activity',       to: '/activity',           icon: <Activity size={20} />, roles: ['ADMIN', 'TEAM_LEAD'] },
  { label: 'Audit Log',      to: '/audit',              icon: <Shield size={20} />, roles: ['ADMIN'] },
  { label: 'Notifications',  to: '/notifications',      icon: <Bell size={20} /> },
  { label: 'Settings',       to: '/settings',           icon: <Settings size={20} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed: _collapsed, onToggle: _onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotifications();
  const location         = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const allowedNav = PRIMARY_NAV_ITEMS.filter(
    (item) => {
      const userRole = user?.role ?? '';
      if (item.roles && !item.roles.includes(userRole)) return false;
      if (item.excludeRoles && item.excludeRoles.includes(userRole)) return false;
      return true;
    },
  ).map((item) =>
    item.to === '/notifications' ? { ...item, badge: unreadCount } : item,
  );

  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    expandTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      setHoveredItem(null);
    }, 200);
  };

  const SidebarNav = () => (
    <>
      <div className="flex items-center justify-center py-4 shrink-0">
        <NavLink
          to="/dashboard"
          className="w-11 h-11 rounded-full bg-[#FF4D67] text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 transition-all duration-200"
          title="Taxime Operations"
        >
          <Flame size={22} className="fill-white/20 stroke-white" />
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 min-h-0">
        <div className="flex flex-col items-center gap-1.5">
          {allowedNav.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <div key={item.to} className="relative w-full flex justify-center">
                <NavLink
                  to={item.to}
                  onClick={onMobileClose}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative flex items-center transition-all duration-200 ${
                    isExpanded
                      ? 'w-full px-3 py-2.5 rounded-xl gap-3 justify-start'
                      : 'w-11 h-11 rounded-full justify-center'
                  } ${
                    isActive
                      ? 'bg-[#FF4D67] text-white shadow-md shadow-red-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {isExpanded && (
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[17px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-white dark:border-slate-800 ${
                      isActive ? 'bg-slate-900' : 'bg-[#FF4D67]'
                    }`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </NavLink>

                {!isExpanded && hoveredItem === item.label && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );

  const SidebarFooter = () => {
    const canCreateTask = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';
    return (
    <div className="flex flex-col items-center gap-2 px-2 py-3 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
      {canCreateTask && (
        <NavLink
          to="/tasks/new"
          onClick={onMobileClose}
          onMouseEnter={() => setHoveredItem('Create Task')}
          onMouseLeave={() => setHoveredItem(null)}
          title="Create New Task"
          className={`flex items-center transition-all duration-200 ${
            isExpanded
              ? 'w-full px-3 py-2.5 rounded-xl gap-3 justify-start bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
              : 'w-10 h-10 rounded-full justify-center bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 hover:scale-105'
          }`}
        >
          <Plus size={18} />
          {isExpanded && (
            <span className="text-sm font-semibold">Create Task</span>
          )}
        </NavLink>
      )}

      <button
        onClick={() => setShowLogoutConfirm(true)}
        onMouseEnter={() => setHoveredItem('Sign Out')}
        onMouseLeave={() => setHoveredItem(null)}
        title="Sign out"
        className={`flex items-center transition-all duration-200 ${
          isExpanded
            ? 'w-full px-3 py-2.5 rounded-xl gap-3 justify-start text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            : 'w-10 h-10 rounded-full justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
        }`}
      >
        <LogOut size={19} />
        {isExpanded && (
          <span className="text-sm font-semibold">Sign Out</span>
        )}
      </button>
    </div>
    );
  };

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-[26px] shadow-2xl w-full max-w-sm mx-auto p-6 text-center animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/30 text-[#FF4D67] flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-800/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Sign Out</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to sign out of your Taxime account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#FF4D67] text-white font-semibold hover:bg-[#E83D58] transition-colors shadow-md shadow-red-500/20 text-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`hidden lg:flex flex-col h-[calc(100vh-2rem)] my-auto ml-4 bg-white dark:bg-slate-800 rounded-[28px] border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isExpanded ? 'w-56' : 'w-[72px]'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="relative w-64 h-full bg-white dark:bg-slate-800 flex flex-col shadow-2xl py-4 z-10 border-r border-slate-200/80 dark:border-slate-700/70 overflow-hidden">
            <button
              onClick={onMobileClose}
              className="absolute right-2 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarNav />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}
