import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Calendar,
  BarChart3,
  Sparkles,
  Compass,
  PiggyBank,
  UploadCloud,
  Layers,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  Fingerprint,
  Menu,
  X,
  ChevronRight,
  Shield,
  Clock,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { NotificationItem, DetectionCandidate } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
  onOpenAddSubscription?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activePath,
  onNavigate,
  onOpenAddSubscription
}) => {
  const { user, logout, refreshPersona } = useAuth();
  const { lockNow, isLockEnabled } = useSecurity();
  const { theme, toggleTheme, isEditorial } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCandidates, setPendingCandidates] = useState<DetectionCandidate[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaNotice, setPersonaNotice] = useState(false);
  const [themeToast, setThemeToast] = useState<string | null>(null);

  const refreshData = () => {
    setNotifications(DataService.getNotifications());
    setPendingCandidates(DataService.getCandidates().filter((c) => c.status === 'pending'));
  };

  useEffect(() => {
    refreshData();
    return subscribeDataChanges(refreshData);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read_at);

  const handleCyclePersona = () => {
    refreshPersona();
    setPersonaNotice(true);
    setTimeout(() => setPersonaNotice(false), 3000);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setThemeToast(isEditorial ? 'Restored Classic SubMate Theme' : 'Switched to Velocity Editorial Theme');
    setTimeout(() => setThemeToast(null), 3000);
  };

  // Vault Sidebar Navigation Items (Matching PDF 02 / Layout Architecture)
  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/subscriptions', label: 'Subscription', icon: CreditCard },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        {
          path: '/notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotifications.length > 0 ? unreadNotifications.length : undefined
        }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          path: '/discover',
          label: 'Discovery Queue',
          icon: Compass,
          badge: pendingCandidates.length > 0 ? pendingCandidates.length : undefined
        },
        { path: '/xray', label: 'Subscription X-Ray', icon: Sparkles },
        { path: '/savings', label: 'Savings Simulator', icon: PiggyBank },
        { path: '/calendar', label: 'Renewal Calendar', icon: Calendar }
      ]
    },
    {
      title: 'FINANCIAL DATA',
      items: [
        { path: '/transactions', label: 'Transactions', icon: Receipt },
        { path: '/import', label: 'Statement Import', icon: UploadCloud },
        { path: '/connections', label: 'Adapters & AA', icon: Layers },
        { path: '/settings', label: 'Settings & Security', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F0E7] text-[#092326] flex flex-col md:flex-row antialiased selection:bg-[#E4EBD8]">
      {/* Persona Notice Toast */}
      {personaNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#092326] text-[#FBF9F3] px-4 py-2 rounded-[8px] text-xs font-medium shadow-lg flex items-center gap-2 border border-[#D8D5CA]">
          <Sparkles className="w-3.5 h-3.5 text-[#E4EBD8]" />
          <span>New spending persona and distinct statement dataset loaded!</span>
        </div>
      )}

      {/* Theme Switch / Restore Toast */}
      {themeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#092326] text-[#FBF9F3] px-4 py-2 rounded-[8px] text-xs font-medium shadow-lg flex items-center gap-2 border border-[#D8D5CA] animate-in fade-in">
          <RotateCcw className="w-3.5 h-3.5 text-[#E4EBD8]" />
          <span>{themeToast}</span>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FBF9F3] border-b border-[#D8D5CA] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-[6px] text-[#092326] hover:bg-[#F2F0E7] transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('/dashboard')}
          >
            <div className="w-6 h-6 rounded-[4px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#092326]">
              Velocity
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Restore UI Button on Mobile */}
          <button
            onClick={handleThemeToggle}
            className="px-2 py-1 bg-[#F2F0E7] text-[#092326] rounded-[6px] text-[10px] font-semibold flex items-center gap-1 border border-[#D8D5CA]"
            title="Restore or switch UI style"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isEditorial ? 'Restore UI' : 'Editorial'}</span>
          </button>

          {/* Quick Lock Trigger on Mobile */}
          {isLockEnabled && (
            <button
              onClick={lockNow}
              title="Lock Vault"
              className="p-1.5 rounded-[6px] text-[#526064] hover:text-[#092326] hover:bg-[#F2F0E7]"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCyclePersona}
            className="px-2 py-1 bg-[#E4EBD8] text-[#092326] rounded-[6px] text-[10px] font-semibold flex items-center gap-1 border border-[#D8D5CA]"
          >
            <Sparkles className="w-3 h-3" />
            <span>Data</span>
          </button>
        </div>
      </header>

      {/* PERSISTENT COMMAND SIDEBAR (240px desktop rail as in Page 3 & 4) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-[240px] shrink-0 bg-[#FBF9F3] border-r border-[#D8D5CA] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Logo Header */}
          <div className="px-5 py-4.5 border-b border-[#D8D5CA] flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                onNavigate('/dashboard');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-5 h-5 rounded-[4px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold text-xs shadow-2xs">
                V
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#092326]">
                Velocity
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-[#526064] hover:text-[#092326]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sections (Low-noise, spacious rhythm) */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto flex-1">
            {navSections.map((sec) => (
              <div key={sec.title}>
                <div className="px-2 pb-1.5 text-[10px] font-bold text-[#526064] tracking-[0.14em] uppercase font-mono">
                  {sec.title}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isActive = activePath === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          onNavigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#E4EBD8] text-[#092326] font-semibold border border-[#D8D5CA]'
                            : 'text-[#526064] hover:bg-[#F2F0E7] hover:text-[#092326]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#092326]' : 'text-[#526064]'}`} />
                          <span className="tracking-tight">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#092326] text-[#FBF9F3]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Theme & Restore Option in Sidebar */}
          <div className="mx-3 mb-2 p-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sliders className="w-3.5 h-3.5 text-[#526064] shrink-0" />
              <span className="font-semibold text-[#092326] text-[10px] truncate">
                {isEditorial ? 'Editorial UI' : 'Classic UI'}
              </span>
            </div>
            <button
              onClick={handleThemeToggle}
              title="Restore previous theme or toggle style"
              className="px-2 py-0.5 rounded-[4px] bg-[#092326] text-[#FBF9F3] text-[10px] font-bold hover:bg-[#14393d] cursor-pointer shrink-0"
            >
              {isEditorial ? '↺ Restore' : '✦ Editorial'}
            </button>
          </div>

          {/* Account Footer (Page 1 & 3: Avatar + Name + "Studio plan") */}
          <div className="p-3 border-t border-[#D8D5CA] bg-[#FBF9F3] space-y-2">
            <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[#F2F0E7] transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#092326] text-[#FBF9F3] font-serif font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.full_name ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'AS'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#092326] truncate">
                    {user?.full_name || 'Anaghraj S. Thakur'}
                  </p>
                  <p className="text-[10px] text-[#526064] truncate">Studio plan</p>
                </div>
              </div>

              {/* Lock Button */}
              {isLockEnabled && (
                <button
                  onClick={lockNow}
                  title="Lock Vault with PIN / Biometrics"
                  className="p-1 text-[#526064] hover:text-[#092326] hover:bg-[#E4EBD8] rounded-[6px] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={handleCyclePersona}
                className="flex-1 py-1.5 px-2 text-[10px] font-semibold text-[#092326] bg-[#E4EBD8] hover:bg-[#d8e4c7] border border-[#D8D5CA] rounded-[6px] transition-all text-center flex items-center justify-center gap-1"
                title="Loads unique spending data and candidate profiles"
              >
                <Sparkles className="w-3 h-3" />
                <span>Switch Persona</span>
              </button>
              <button
                onClick={() => logout()}
                title="Log Out"
                className="p-1.5 text-[#526064] hover:text-rose-700 hover:bg-rose-50 rounded-[6px] border border-[#D8D5CA]"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS (Fluid area with 32-40px outer padding as specified in Page 3) */}
      <div className={`flex-1 flex flex-col min-w-0 ${isEditorial ? 'bg-[#F2F0E7]' : 'bg-[#f8fafc]'}`}>
        <main className="px-4 md:px-10 py-6 md:py-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Bar Restore Option Banner */}
          <div className="flex items-center justify-between border-b border-[#D8D5CA]/60 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#092326]" />
              <span className="font-mono text-[11px] text-[#526064]">
                {isEditorial ? 'Velocity Editorial Command Center' : 'Classic SubMate Dashboard'}
              </span>
            </div>
            <button
              onClick={handleThemeToggle}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-[6px] border border-[#D8D5CA] bg-[#FBF9F3] hover:bg-[#E4EBD8] text-[#092326] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Switch or restore dashboard style"
            >
              <RotateCcw className="w-3 h-3 text-[#526064]" />
              <span>{isEditorial ? 'Restore Previous UI' : 'Apply Velocity Editorial UI'}</span>
            </button>
          </div>

          {children}
        </main>
      </div>

      {/* Floating Action Quick Access (Mobile) */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => {
            if (onOpenAddSubscription) onOpenAddSubscription();
            else onNavigate('/subscriptions?action=add');
          }}
          className="w-12 h-12 rounded-full bg-[#092326] text-[#FBF9F3] flex items-center justify-center shadow-lg border border-[#D8D5CA] active:scale-95 transition-transform"
          aria-label="Add Subscription"
        >
          <Plus className="w-5 h-5 text-[#E4EBD8]" />
        </button>
      </div>
    </div>
  );
};
