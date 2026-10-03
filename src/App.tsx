import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';
import { ThemeProvider } from './context/ThemeContext';
import { VaultSecurityLockOverlay } from './components/security/VaultSecurityLockOverlay';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SubscriptionXRayPage } from './pages/SubscriptionXRayPage';
import { SavingsPage } from './pages/SavingsPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { ImportWizardPage } from './pages/ImportWizardPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { DataService } from './services/dataService';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [openAddSubModal, setOpenAddSubModal] = useState(false);

  useEffect(() => {
    DataService.init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F0E7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-serif font-bold text-sm shadow-sm animate-pulse">
            V
          </div>
          <span className="text-xs font-serif text-[#092326]">Opening Velocity...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => setCurrentPath('/dashboard')} />;
  }

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage onNavigate={setCurrentPath} />;
      case '/transactions':
        return <TransactionsPage onNavigate={setCurrentPath} />;
      case '/subscriptions':
        return (
          <SubscriptionsPage
            onNavigate={setCurrentPath}
            initialAddOpen={openAddSubModal}
          />
        );
      case '/discover':
        return <DiscoverPage onNavigate={setCurrentPath} />;
      case '/calendar':
        return <CalendarPage onNavigate={setCurrentPath} />;
      case '/analytics':
        return <AnalyticsPage onNavigate={setCurrentPath} />;
      case '/xray':
        return <SubscriptionXRayPage onNavigate={setCurrentPath} />;
      case '/savings':
        return <SavingsPage onNavigate={setCurrentPath} />;
      case '/insights':
        return <AiInsightsPage onNavigate={setCurrentPath} />;
      case '/import':
        return <ImportWizardPage onNavigate={setCurrentPath} />;
      case '/connections':
        return <ConnectionsPage onNavigate={setCurrentPath} />;
      case '/notifications':
        return <NotificationsPage onNavigate={setCurrentPath} />;
      case '/settings':
        return <SettingsPage onNavigate={setCurrentPath} />;
      default:
        return <DashboardPage onNavigate={setCurrentPath} />;
    }
  };

  return (
    <>
      <VaultSecurityLockOverlay />
      <DashboardLayout
        activePath={currentPath}
        onNavigate={setCurrentPath}
        onOpenAddSubscription={() => {
          setOpenAddSubModal(true);
          setCurrentPath('/subscriptions');
        }}
      >
        {renderCurrentPage()}
      </DashboardLayout>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SecurityProvider>
          <AppContent />
        </SecurityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
