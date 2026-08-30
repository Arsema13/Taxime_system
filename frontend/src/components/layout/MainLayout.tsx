import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/tasks':        'Tasks',
  '/my-tasks':     'My Tasks',
  '/calendar':     'Calendar',
  '/favorites':    'Favorites',
  '/teams':        'Teams',
  '/employees':    'Employees',
  '/departments':  'Departments',
  '/reports':      'Reports',
  '/activity':     'Activity Log',
  '/audit':        'Audit Log',
  '/notifications':'Notifications',
  '/settings':     'Settings',
  '/profile':      'Profile',
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div
        className={[
          'flex flex-col flex-1 min-w-0 transition-all duration-300',
          'lg:ml-0', // offset handled by sidebar flex
        ].join(' ')}
        style={{ marginLeft: undefined }}
      >
        <Header
          onMenuToggle={() => setMobileOpen(true)}
          title={title}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
