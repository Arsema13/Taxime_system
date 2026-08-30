import React, { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Search, X, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/contexts';
import { Avatar } from '@/components/ui/Avatar';
import { taskService } from '@/services';
import type { Task } from '@/types';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user }                    = useAuth();
  const { unreadCount, notifications, markRead } = useNotifications();
  const navigate                    = useNavigate();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searching, setSearching]     = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const searchRef  = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setSearchQuery(''); setSearchResults([]);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced global search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await taskService.search(searchQuery);
        setSearchResults(res.tasks.slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 shrink-0 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-base font-semibold text-slate-800 hidden sm:block truncate">{title}</h1>
      )}

      <div className="flex-1" />

      {/* ── Global search ──────────────────────────────────────────────── */}
      <div className="relative" ref={searchRef}>
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks…"
                className="w-64 pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && (searchQuery.trim()) && (
          <div className="absolute right-0 top-full mt-1 w-96 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
            {searching ? (
              <p className="text-sm text-slate-500 text-center py-4">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No results found.</p>
            ) : (
              <>
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { navigate(`/tasks/${t.id}`); setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.category?.replace('_', ' ')}</p>
                    </div>
                    <TaskStatusBadge status={t.status} />
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => { navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium py-2"
                  >
                    See all results <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Notifications bell ─────────────────────────────────────────── */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-teal-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">All caught up!</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      if (n.taskId) navigate(`/tasks/${n.taskId}`);
                      setNotifOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${!n.isRead ? 'bg-teal-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />}
                      <div className={!n.isRead ? '' : 'pl-4'}>
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── User avatar → profile ──────────────────────────────────────── */}
      <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Avatar src={user?.avatar} name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size="sm" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">{user?.firstName}</p>
          <p className="text-xs text-slate-500 leading-tight capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
        </div>
      </Link>
    </header>
  );
}
