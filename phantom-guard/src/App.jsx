import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Settings, LayoutDashboard, ShieldCheck, ShieldQuestion, Globe } from 'lucide-react';
import { Toaster } from 'sonner';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import SettingsPage from './pages/SettingsPage';
import SecurityHardeningPage from './pages/SecurityHardeningPage';
import SupportPage from './pages/SupportPage';
import DNSManagementPage from './pages/DNSManagementPage';
import OnboardingModal from './components/OnboardingModal';
import { useOnboarding } from './hooks/useOnboarding';
import logoColored from './assets/images/pg_logo_layers.svg';

const App = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('settings');
  const {
    isCompleted,
    currentStep,
    isOpen,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    setIsOpen,
  } = useOnboarding();

  const tabs = [
    { id: 'dashboard', label: t('app.dashboard'), icon: LayoutDashboard },
    { id: 'scanner', label: t('app.malwareScan'), icon: Shield },
    { id: 'hardening', label: t('app.securityHardening', { defaultValue: 'Security Hardening' }), icon: ShieldCheck },
    { id: 'dns', label: t('app.dnsManagement', { defaultValue: 'CDN' }), icon: Globe },
    { id: 'settings', label: t('app.settings'), icon: Settings },
    { id: 'support', label: t('app.support', { defaultValue: 'Support' }), icon: ShieldQuestion },
  ];

  // Map onboarding steps to pages
  const stepToPageMap = {
    0: 'settings',  // Step 1: Settings
    1: 'dns',        // Step 2: DNS Management
    2: 'scanner',    // Step 3: Scanner
    3: 'dashboard',  // Step 4: Dashboard
    4: 'settings',   // Step 5: Settings (final)
  };

  // Navigate to the correct page when onboarding step changes
  useEffect(() => {
    if (!isCompleted && isOpen && stepToPageMap[currentStep]) {
      setActiveTab(stepToPageMap[currentStep]);
    }
  }, [currentStep, isOpen, isCompleted]);

  const handleOnboardingNext = () => {
    nextStep();
  };

  const handleOnboardingPrevious = () => {
    previousStep();
  };

  const handleOnboardingSkip = () => {
    skipOnboarding();
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} onboardingStep={currentStep} />;
      case 'scanner':
        return <ScannerPage onboardingStep={currentStep} />;
      case 'hardening':
        return <SecurityHardeningPage />;
      case 'dns':
        return <DNSManagementPage onboardingStep={currentStep} />;
      case 'settings':
        return <SettingsPage onboardingStep={currentStep} />;
      case 'support':
        return <SupportPage />;
      default:
        return <ScannerPage />;
    }
  };

  return (
    <div className="phguard-container">
      <Toaster position="bottom-right" richColors />

      <header className="flex font-bold items-center justify-center mb-12 mt-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="rounded-xl p-2">
              <img src={logoColored} alt="PhantomGuard" className="w-12 h-12"/>
            </div>
            <div>
              <div className="select-none text-start text-base line-height-0.5 text-gray-900 dark:text-gray-100">PhantomGuard</div>
              <div className="select-none text-sm text-gray-500 dark:text-gray-400">{t('app.securityDashboard')}</div>
            </div>
          </div>
          <div className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 flex items-center py-2 text-base border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon && <tab.icon className="w-4 h-4 inline-block mr-2" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="mx-24">
        {renderActivePage()}
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOpen}
        currentStep={currentStep}
        onNext={handleOnboardingNext}
        onPrevious={handleOnboardingPrevious}
        onSkip={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
        onClose={handleOnboardingSkip}
      />
      </div>
  );
};

export default App;