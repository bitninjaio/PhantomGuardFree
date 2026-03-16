import React from 'react';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';

const PREMIUM_FEATURE_LABEL = 'Available in PhantomGuard Pro';

const PremiumFeatureBanner = ({ description, onBuyNow, buyNowUrl }) => {
  const { t } = useTranslation();

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow();
    } else if (buyNowUrl) {
      window.open(buyNowUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://phantomguard.io/activate', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center gap-3 flex-1">
        <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <div>
          <p className="font-medium text-indigo-900 dark:text-indigo-100">{PREMIUM_FEATURE_LABEL}</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{description}</p>
        </div>
      </div>
      <button
        onClick={handleBuyNow}
        className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        {t('settings.buyLicense.buyNow', { defaultValue: 'Buy Now' })}
      </button>
    </div>
  );
};

export default PremiumFeatureBanner;
