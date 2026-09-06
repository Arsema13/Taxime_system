import React, { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Search, X, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/contexts';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { user } = useAuth();
  const { unreadCount, notifications, markRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await taskService.search(searchQuery);
        setSearchResults(res.tasks.slice(0, 6));
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Wade Warren';

  return (
    <header className="flex items-center justify-between px-6 py-4 shrink-0 z-20 gap-4">
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-10 h-10 bg-white dark:bg-slate-700 rounded-full border border-slate-200/80 dark:border-slate-600/80 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shrink-0"
      >
        <Menu size={18} />
      </button>

      <div className="relative flex-1 max-w-xl" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-4.5 w-4.5 h-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            placeholder="Search by Tracking Number or task..."
            className="w-full pl-12 pr-10 py-2.5 text-sm bg-white dark:bg-slate-700 rounded-full border border-slate-200/80 dark:border-slate-600/80 shadow-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-xl py-2 z-50 animate-fade-in">
            {searching ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">Searching tasks…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No matching records found.</p>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tracking Matches
                </div>
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      navigate(`/tasks/${t.id}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-left transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ID: #{t.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <TaskStatusBadge status={t.status} size="sm" />
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1 text-xs text-[#FF4D67] hover:text-[#E83D58] font-semibold py-2"
                  >
                    View all in database <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-11 h-11 bg-white dark:bg-slate-700 rounded-full border border-slate-200/80 dark:border-slate-600/80 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative w-11 h-11 bg-white dark:bg-slate-700 rounded-full border border-slate-200/80 dark:border-slate-600/80 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute 2.5 top-2.5 w-2.5 h-2.5 bg-[#FF4D67] rounded-full ring-2 ring-white dark:ring-slate-700" />
            ) : (
              <span className="absolute right-3 top-2.5 w-2 h-2 bg-[#FF4D67] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notifications</h3>
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-[#FF4D67] hover:underline font-semibold"
                >
                  View all
                </Link>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">All caught up!</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.taskId) navigate(`/tasks/${n.taskId}`);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors ${
                        !n.isRead ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-2.5 bg-white dark:bg-slate-700 rounded-full border border-slate-200/80 dark:border-slate-600/80 pl-1.5 pr-4 py-1.5 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
        >
          <Avatar
            src={user?.avatar}
            name={fullName}
            size="sm"
            className="w-8 h-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-600"
          />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight hidden sm:inline">
            {fullName}
          </span>
          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden sm:inline" />
        </Link>
      </div>
    </header>
  );
}
