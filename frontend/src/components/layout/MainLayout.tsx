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
  '/reports/review':     'Review Reports',
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
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const location = useLocation();
  const title    = usePageTitle(location.pathname);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 via-slate-100 to-green-100 overflow-hidden font-sans text-slate-800">
      <Header
        onMenuToggle={() => setMobileOpen(true)}
        title={title}
      />

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
