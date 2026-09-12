import React, { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Search, X, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

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
    <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 shrink-0 z-20 gap-2 sm:gap-4">
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-[#111d32] rounded-full border border-[#0B1628]/10 dark:border-white/10 shadow-xs flex items-center justify-center text-[#0B1628] dark:text-white hover:bg-[#F0F2F7] dark:hover:bg-white/5 transition-colors shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      {!isDashboard && (
      <div className="relative flex-1 max-w-xl min-w-0" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 sm:left-4.5 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0B1628]/30 dark:text-white/30 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            placeholder="Search tasks..."
            className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-white dark:bg-[#111d32] rounded-full border border-[#0B1628]/10 dark:border-white/10 shadow-xs text-[#0B1628] dark:text-white placeholder:text-[#0B1628]/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
              className="absolute right-2.5 sm:right-3.5 text-[#0B1628]/30 dark:text-white/30 hover:text-[#0B1628] dark:hover:text-white p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-full mt-2 w-full min-w-[260px] sm:min-w-full bg-white dark:bg-[#111d32] rounded-2xl border border-[#0B1628]/10 dark:border-white/10 shadow-xl py-2 z-50 animate-fade-in">
            {searching ? (
              <p className="text-xs text-[#0B1628]/40 dark:text-white/30 text-center py-4">Searching tasks…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-[#0B1628]/40 dark:text-white/30 text-center py-4">No matching records found.</p>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#0B1628]/30 dark:text-white/20 uppercase tracking-wider">
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
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F0F2F7] dark:hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold text-[#0B1628] dark:text-white truncate">{t.title}</p>
                      <p className="text-xs text-[#0B1628]/40 dark:text-white/30 mt-0.5">ID: #{t.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <TaskStatusBadge status={t.status} size="sm" />
                  </button>
                ))}
                <div className="border-t border-[#0B1628]/5 dark:border-white/5 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1 text-xs text-[#e89b1a] hover:text-[#f4b728] font-semibold py-2"
                  >
                    View all in database <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white dark:bg-[#111d32] rounded-full border border-[#0B1628]/10 dark:border-white/10 shadow-xs flex items-center justify-center text-[#0B1628] dark:text-white hover:bg-[#F0F2F7] dark:hover:bg-white/5 transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white dark:bg-[#111d32] rounded-full border border-[#0B1628]/10 dark:border-white/10 shadow-xs flex items-center justify-center text-[#0B1628] dark:text-white hover:bg-[#F0F2F7] dark:hover:bg-white/5 transition-all"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#e89b1a] rounded-full ring-2 ring-white dark:ring-[#111d32]" />
            ) : (
              <span className="absolute right-2.5 top-2 sm:right-3 sm:top-2.5 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#e89b1a] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm bg-white dark:bg-[#111d32] rounded-2xl border border-[#0B1628]/10 dark:border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0B1628]/5 dark:border-white/5">
                <h3 className="font-bold text-[#0B1628] dark:text-white text-sm">Notifications</h3>
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-[#e89b1a] hover:underline font-semibold"
                >
                  View all
                </Link>
              </div>
              <div className="max-h-80 overflow-y-auto overscroll-contain divide-y divide-[#0B1628]/5 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#0B1628]/30 dark:text-white/20 text-center py-8">All caught up!</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.taskId) navigate(`/tasks/${n.taskId}`);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#F0F2F7] dark:hover:bg-white/5 transition-colors ${
                        !n.isRead ? 'bg-[#e89b1a]/5 dark:bg-[#e89b1a]/5' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#0B1628] dark:text-white">{n.title}</p>
                      <p className="text-xs text-[#0B1628]/50 dark:text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-[#0B1628]/30 dark:text-white/20 mt-1">
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
          className="flex items-center gap-2 bg-white dark:bg-[#111d32] rounded-full border border-[#0B1628]/10 dark:border-white/10 pl-1 sm:pl-1.5 pr-1 sm:pr-4 py-1 sm:py-1.5 shadow-xs hover:bg-[#F0F2F7] dark:hover:bg-white/5 transition-all"
        >
          <Avatar
            src={user?.avatar}
            name={fullName}
            size="sm"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-[#0B1628]/10 dark:ring-white/10"
          />
          <span className="text-xs sm:text-sm font-semibold text-[#0B1628] dark:text-white tracking-tight hidden sm:inline">
            {fullName}
          </span>
          <ChevronDown size={14} className="text-[#0B1628]/30 dark:text-white/30 hidden sm:inline" />
        </Link>
      </div>
    </header>
  );
}
