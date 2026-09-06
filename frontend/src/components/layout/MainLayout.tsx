import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/tasks':              'Tasks',
  '/my-tasks':           'My Tasks',
  '/calendar':           'Calendar',
  '/favorites':          'Favorites',
  '/teams':              'Teams',
  '/employees':          'Employees',
  '/departments':        'Departments',
  '/reports':            'Reports',
  '/reports/submit':     'Submit Report',
  '/reports/my-reports': 'My Reports',
  '/reports/review':     'Reports',
  '/activity':           'Activity Log',
  '/audit':              'Audit Log',
  '/notifications':      'Notifications',
  '/settings':           'Settings',
  '/profile':            'Profile',
};

function usePageTitle(pathname: string) {
  const base = '/' + pathname.split('/')[1];
  return ROUTE_TITLES[base] ?? 'Taxime';
}

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = usePageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-[#F4F5F9] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setMobileOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-1">
          <div className="max-w-[1700px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
