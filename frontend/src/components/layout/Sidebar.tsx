import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, Users, Building2,
  BarChart3, Bell, Activity, Settings, LogOut,
  X, AlertTriangle, Plus, ClipboardList,
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
          className="flex items-center gap-2 group"
          title="Taxime Operations"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#e89b1a] flex items-center justify-center shadow-lg shadow-[#e89b1a]/30 group-hover:scale-105 transition-all duration-200">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M10 12h4.5l5.5 12 5.5-12H30l-8.5 20h-3L10 12z" fill="white"/>
              <circle cx="33" cy="8" r="2.5" fill="white" opacity="0.5"/>
            </svg>
          </div>
          {isExpanded && (
            <span className="text-base font-black text-white tracking-tight">Taxime</span>
          )}
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 min-h-0 overscroll-contain">
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
                      ? 'bg-[#e89b1a] text-[#0B1628] shadow-md shadow-[#e89b1a]/30 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {isExpanded && (
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[17px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-[#0B1628] ${
                      isActive ? 'bg-[#0B1628]' : 'bg-[#e89b1a]'
                    }`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </NavLink>

                {!isExpanded && hoveredItem === item.label && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0B1628] dark:bg-white text-white dark:text-[#0B1628] text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#0B1628] dark:bg-white rotate-45" />
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
    <div className="flex flex-col items-center gap-2 px-2 py-3 border-t border-white/10 shrink-0">
      {canCreateTask && (
        <NavLink
          to="/tasks/new"
          onClick={onMobileClose}
          onMouseEnter={() => setHoveredItem('Create Task')}
          onMouseLeave={() => setHoveredItem(null)}
          title="Create New Task"
          className={`flex items-center transition-all duration-200 ${
            isExpanded
              ? 'w-full px-3 py-2.5 rounded-xl gap-3 justify-start bg-[#e89b1a] text-[#0B1628] hover:bg-[#f4b728] font-bold'
              : 'w-10 h-10 rounded-full justify-center bg-[#e89b1a] text-[#0B1628] hover:bg-[#f4b728] hover:scale-105'
          }`}
        >
          <Plus size={18} />
          {isExpanded && (
            <span className="text-sm font-bold">Create Task</span>
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
            ? 'w-full px-3 py-2.5 rounded-xl gap-3 justify-start text-white/50 hover:text-white hover:bg-white/10'
            : 'w-10 h-10 rounded-full justify-center text-white/50 hover:text-white hover:bg-white/10'
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
            className="absolute inset-0 bg-[#0B1628]/40 dark:bg-black/60 backdrop-blur-xs"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white dark:bg-[#111d32] rounded-[26px] shadow-2xl w-full max-w-sm mx-auto p-6 text-center animate-fade-in border border-slate-200/70 dark:border-white/5">
            <div className="w-14 h-14 rounded-full bg-[#e89b1a]/10 text-[#e89b1a] flex items-center justify-center mx-auto mb-4 border border-[#e89b1a]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1628] dark:text-white mb-1">Sign Out</h3>
            <p className="text-slate-500 dark:text-white/40 text-sm mb-6">
              Are you sure you want to sign out of your Taxime account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#e89b1a] text-[#0B1628] font-bold hover:bg-[#f4b728] transition-colors shadow-md shadow-[#e89b1a]/20 text-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`hidden lg:flex flex-col h-[calc(100vh-2rem)] my-auto ml-4 bg-[#0B1628] rounded-[28px] border border-white/5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
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
          <div className="absolute inset-0 bg-[#0B1628]/40 dark:bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="relative w-64 h-full bg-[#0B1628] flex flex-col shadow-2xl py-4 z-10 border-r border-white/5 overflow-hidden overscroll-contain">
            <button
              onClick={onMobileClose}
              className="absolute right-2 top-3 text-white/50 hover:text-white p-1 z-10"
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
