import { NavLink } from 'react-router-dom';
import { BarChart3, CalendarDays, Home, LogOut, MessageSquare, Moon, Settings, Sun, FolderOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useFeature, useFeatures } from '../context/FeatureContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', label: 'Today', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/reports', label: 'Insights', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const hasReports = useFeature('ai_reports');
  const { sharedBabyOnly } = useFeatures();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-blue-100/80 bg-[#f7d6d0]/90 px-3 py-6 backdrop-blur-xl dark:border-navy-700/70 dark:bg-navy-950/90 md:flex">
        <div className="mb-12 flex items-center gap-3 px-3">
          <div className="font-display text-xl font-semibold text-[var(--color-ink)]">Bloomwell</div>
        </div>
        <nav aria-label="Primary navigation" className="space-y-2">
          {navItems.filter(({ path }) => (path !== '/reports' || hasReports) && (!sharedBabyOnly || ['/','/settings','/feedback'].includes(path))).map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-blue-500 text-[#fff5f5] shadow-soft' : 'text-[var(--color-muted)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-navy-900'}`}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="mt-auto">
          <div ref={profileRef} className="relative">
            <div className="flex items-center gap-3 border-t border-blue-100 px-3 pt-4 dark:border-navy-700">
              <Avatar user={user} name={user?.name} avatarUrl={user?.avatarUrl} size={36} onClick={() => setProfileOpen((value) => !value)} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user?.name || 'Your profile'}</p><p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p></div>
              <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" className="focus-ring text-[var(--color-muted)] hover:text-blue-600"><LogOut size={17} /></button>
            </div>
            {profileOpen && (
              <div className="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 z-40 rounded-2xl border border-[#f1d4cf] bg-[#fff9f8] p-4 shadow-[0_20px_45px_rgba(128,0,32,0.12)]">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar user={user} name={user?.name} avatarUrl={user?.avatarUrl} size={54} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">{user?.name || 'Your profile'}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl bg-[#fff2ef] p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Phone</p>
                    <p className="mt-1">{user?.phone || 'Not added yet'}</p>
                  </div>
                  <div className="rounded-xl bg-[#fff2ef] p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Email</p>
                    <p className="mt-1 break-all">{user?.email || 'Not added yet'}</p>
                  </div>
                  <div className="rounded-xl bg-[#fff2ef] p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Birth date</p>
                    <p className="mt-1">{user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not added yet'}</p>
                  </div>
                  <div className="rounded-xl bg-[#fff2ef] p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Bio</p>
                    <p className="mt-1 leading-5">{user?.bio || 'No bio added yet.'}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setProfileOpen(false)} className="mt-4 w-full rounded-xl bg-[#800020] px-4 py-2.5 text-sm font-semibold text-[#fff5f5] shadow-soft transition hover:bg-[#660018]">Edit profile</button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-blue-100/80 bg-[#f7d6d0]/95 p-2 shadow-soft backdrop-blur-xl dark:border-navy-700 dark:bg-navy-950/95 md:hidden">
        {navItems.filter(({ path }) => (path !== '/reports' || hasReports) && (!sharedBabyOnly || ['/','/settings','/feedback'].includes(path))).map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `focus-ring flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${isActive ? 'bg-blue-500 text-[#fff5f5]' : 'text-[var(--color-muted)]'}`}><Icon size={18} /><span>{label}</span></NavLink>)}
      </nav>
    </>
  );
};

export default Navbar;
