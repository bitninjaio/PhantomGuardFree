import React from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Globe, Bug, LayoutDashboard, ShoppingCart, ArrowRight, ArrowLeft, Check, X as XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OnboardingModal = ({ isOpen, currentStep, onNext, onPrevious, onSkip, onComplete, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const comparisonFeatures = [
    {
      feature: t('onboarding.comparison.basicHardening', { defaultValue: 'Basic Hardening' }),
      free: true,
      pro: true
    },
    {
      feature: t('onboarding.comparison.support', { defaultValue: 'Basic Support' }),
      free: true,
      pro: true
    },
    {
      feature: t('onboarding.comparison.advancedMalwareScanning', { defaultValue: 'Advanced Malware Scanning' }),
      free: false,
      pro: true
    },
    {
      feature: t('onboarding.comparison.webApplicationFirewall', { defaultValue: 'Web Application Firewall' }),
      free: false,
      pro: true
    },
    {
      feature: t('onboarding.comparison.dnsManagement', { defaultValue: 'CDN & DNS Management' }),
      free: false,
      pro: true
    },
    {
      feature: t('onboarding.comparison.realTimeDashboard', { defaultValue: 'Real-time Security Dashboard' }),
      free: false,
      pro: true
    },
    {
      feature: t('onboarding.comparison.automatedScans', { defaultValue: 'Automated Scheduled Scans' }),
      free: false,
      pro: true
    },
    {
      feature: t('onboarding.comparison.prioritySupport', { defaultValue: 'Priority Support' }),
      free: false,
      pro: true
    }
  ];

  const onboardingSteps = [
    {
      page: 'settings',
      title: t('onboarding.settings.title', { defaultValue: 'Welcome to PhantomGuard!' }),
      description: t('onboarding.settings.description', {
        defaultValue: 'PhantomGuard provides essential security hardening for your WordPress site. Upgrade to Pro to unlock advanced protection features and comprehensive security management.'
      }),
      icon: Shield,
      showComparison: true
    },
    {
      page: 'dns',
      title: t('onboarding.dns.title', { defaultValue: 'DNS Management' }),
      description: t('onboarding.dns.description', {
        defaultValue: 'Manage your DNS records with ease. Add, edit, and optimize DNS entries to improve your site\'s performance and security. Monitor DNS statistics and query patterns.'
      }),
      icon: Globe,
      benefits: [
        t('onboarding.dns.benefit1', { defaultValue: 'Faster website loading times' }),
        t('onboarding.dns.benefit2', { defaultValue: 'Better security with DNS filtering' }),
        t('onboarding.dns.benefit3', { defaultValue: 'Detailed analytics and insights' })
      ]
    },
    {
      page: 'scanner',
      title: t('onboarding.scanner.title', { defaultValue: 'Malware Scanner' }),
      description: t('onboarding.scanner.description', {
        defaultValue: 'Protect your WordPress site with advanced malware detection. Scan your files, detect threats, and restore infected files automatically. Keep your site safe from malicious code.'
      }),
      icon: Bug,
      benefits: [
        t('onboarding.scanner.benefit3', { defaultValue: 'Detailed scan history & reports' }),
        t('onboarding.scanner.benefit2', { defaultValue: 'Automatic file restoration' })
      ]
    },
    {
      page: 'dashboard',
      title: t('onboarding.dashboard.title', { defaultValue: 'Security Dashboard' }),
      description: t('onboarding.dashboard.description', {
        defaultValue: 'Get a comprehensive overview of your site\'s security status. View traffic analytics, geographic data, cache performance, and security metrics all in one place.'
      }),
      icon: LayoutDashboard,
      benefits: [
        t('onboarding.dashboard.benefit1', { defaultValue: 'Real-time security metrics' }),
        t('onboarding.dashboard.benefit2', { defaultValue: 'Geographic traffic analysis' }),
        t('onboarding.dashboard.benefit3', { defaultValue: 'Performance insights' })
      ]
    },
    {
      page: 'settings-final',
      title: t('onboarding.final.title', { defaultValue: 'Ready to Upgrade?' }),
      description: t('onboarding.final.description', {
        defaultValue: 'Unlock all these powerful security features and more with PhantomGuard Pro. Get advanced protection, priority support, and regular updates.'
      }),
      icon: ShoppingCart,
      cta: t('onboarding.final.cta', { defaultValue: 'Upgrade to Pro' })
    }
  ];

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const Icon = step?.icon || Shield;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (onPrevious && !isFirstStep) {
      onPrevious();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {step?.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('onboarding.step', { defaultValue: 'Step' })} {currentStep + 1} {t('onboarding.of', { defaultValue: 'of' })} {onboardingSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('common.close', { defaultValue: 'Close' })}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {step?.description}
          </p>

          {/* Comparison Table for first step */}
          {step?.showComparison && (
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t('onboarding.comparison.feature', { defaultValue: 'Feature' })}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t('onboarding.comparison.free', { defaultValue: 'Free' })}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {t('onboarding.comparison.pro', { defaultValue: 'Pro' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {comparisonFeatures.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {item.feature}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.free ? (
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <XIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.pro ? (
                            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                          ) : (
                            <XIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Features/Benefits List */}
          {(step?.features || step?.benefits) && (
            <div className="space-y-3 mb-6">
              {(step.features || step.benefits).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA for final step */}
          {isLastStep && step?.cta && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <button
                onClick={() => {
                  window.open('https://phantomguard.io/activate', '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {step.cta}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('onboarding.back', { defaultValue: 'Back' })}
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {t('onboarding.skip', { defaultValue: 'Skip' })}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : index < currentStep
                      ? 'bg-indigo-300 dark:bg-indigo-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
          >
            {isLastStep ? (
              <>
                {t('onboarding.finish', { defaultValue: 'Finish' })}
              </>
            ) : (
              <>
                {t('onboarding.continue', { defaultValue: 'Continue' })}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingModal;
