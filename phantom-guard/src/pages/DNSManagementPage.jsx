import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../hooks/useConfirm';
import { MoreVertical, Edit, Trash2, Activity, BarChart3, Settings, Lock, Cloud, Globe, Shield, Zap } from 'lucide-react';
import PremiumFeatureBanner from '../components/PremiumFeatureBanner';

const DNSManagementPage = ({ onboardingStep }) => {
  const { t } = useTranslation();
  const { ConfirmDialog } = useConfirm();
  
  // DNS Type enum mapping (API returns numbers, we display strings)
  const dnsTypeEnum = {
    0: 'A',
    1: 'AAAA',
    2: 'CNAME',
    3: 'TXT',
    4: 'MX',
    5: 'SPF',
    6: 'Flatten',
    7: 'PullZone',
    8: 'SRV',
    9: 'CAA',
    10: 'PTR',
    11: 'Script',
    12: 'NS'
  };

  // Helper function to convert DNS type (number or string) to display string
  const getDnsTypeString = (type) => {
    // If it's already a string, return it (for backward compatibility)
    if (typeof type === 'string') {
      return type;
    }
    // If it's a number, map it using the enum
    if (typeof type === 'number' && dnsTypeEnum.hasOwnProperty(type)) {
      return dnsTypeEnum[type];
    }
    // Fallback to empty string or original value
    return type !== null && type !== undefined ? String(type) : '';
  };
  
  // Top-level tab state: 'cdn' or 'dns'
  const [mainTab, setMainTab] = useState('cdn');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('records'); // 'records' (DNS tab only shows records now)
  
  // DNS records state
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0, visible: false });

  // Domain from API response (data.response.Domain)
  const [domainName, setDomainName] = useState('');

  // DNS server status (null = loading, true = active, false = inactive)
  const [dnsServerStatus, setDnsServerStatus] = useState(null);

  // No API in free version - premium feature
  const fetchDnsRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    setDnsRecords([]);
    setDomainName('');
    setIsLoadingRecords(false);
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return dnsRecords;
    const query = searchQuery.toLowerCase();
    return dnsRecords.filter((record) => {
      const name = String(record.name ?? '').toLowerCase();
      const value = String(record.value ?? '').toLowerCase();
      const typeStr = getDnsTypeString(record.type).toLowerCase();
      return name.includes(query) || value.includes(query) || typeStr.includes(query);
    });
  }, [dnsRecords, searchQuery]);

  // Get the record for the open action menu
  const actionMenuRecord = useMemo(() => {
    return actionMenuOpen ? filteredRecords.find(r => r.id === actionMenuOpen) : null;
  }, [actionMenuOpen, filteredRecords]);

  const renderDnsActionsCell = (record) => {
    const typeStr = getDnsTypeString(record.type);
    const isRootDomain = !record.name || String(record.name).trim() === '' || record.name === domainName;
    const isMainARecord = isRootDomain && typeStr === 'A';
    if (isMainARecord) {
      return null;
    }
    const isOpen = actionMenuOpen === record.id;
    const buttonId = `action-btn-${record.id}`;
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <button
          id={buttonId}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isOpen) {
              setActionMenuOpen(null);
              setActionMenuPosition({ x: 0, y: 0, visible: false });
            } else {
              const rect = e.currentTarget.getBoundingClientRect();
              setActionMenuPosition({
                x: rect.right,
                y: rect.bottom + 4,
                visible: true,
              });
              setActionMenuOpen(record.id);
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen) {
        const buttonId = `action-btn-${actionMenuOpen}`;
        const button = document.getElementById(buttonId);
        const menu = document.getElementById('action-menu-dropdown');
        
        if (
          button && 
          !button.contains(event.target) && 
          menu && 
          !menu.contains(event.target)
        ) {
          setActionMenuOpen(null);
        }
      }
    };
    
    // Use capture phase to catch events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [actionMenuOpen]);

  // Fetch DNS records
  useEffect(() => {
    if (mainTab !== 'dns' || activeTab !== 'records') return;
    fetchDnsRecords();
  }, [mainTab, activeTab, fetchDnsRecords]);

  // No API in free version
  useEffect(() => {
    setDnsServerStatus(false);
  }, []);

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <PremiumFeatureBanner
        description={t('dns.premiumDescription', { defaultValue: 'DNS Management is available in PhantomGuard Pro.' })}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 p-0 m-0">
            {mainTab === 'cdn' 
              ? t('cdn.title', { defaultValue: 'CDN Management' })
              : t('dns.recordsTitle', { defaultValue: 'DNS Management' })
            }
          </h1>
          {mainTab === 'dns' && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 mt-1 py-0.5 rounded text-xs font-medium ${
                dnsServerStatus === null
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  : dnsServerStatus
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
              title={`${t('dns.serversStatusTooltip', { defaultValue: 'DNS servers status:' })} ${
                dnsServerStatus === null
                  ? t('dns.statusLoading', { defaultValue: 'Loading...' })
                  : dnsServerStatus
                    ? t('dns.statusActive', { defaultValue: 'Active' })
                    : t('dns.statusInactive', { defaultValue: 'Inactive' })
              }`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  dnsServerStatus === null
                    ? 'bg-gray-400 dark:bg-gray-500 animate-pulse'
                    : dnsServerStatus
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-red-500 dark:bg-red-400'
                }`}
              />
              {dnsServerStatus === null
                ? t('dns.statusLoading', { defaultValue: 'Loading...' })
                : dnsServerStatus
                  ? t('dns.statusActive', { defaultValue: 'Active' })
                  : t('dns.statusInactive', { defaultValue: 'Inactive' })}
            </span>
          )}
        </div>
      </div>

      {/* Top-level Tabs: CDN vs DNS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 inline-flex gap-1">
        <button
          onClick={() => setMainTab('cdn')}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
            mainTab === 'cdn'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Cloud className={`w-4 h-4 ${mainTab === 'cdn' ? '' : 'opacity-70'}`} />
          {t('cdn.tab', { defaultValue: 'CDN' })}
        </button>
        <button
          onClick={() => setMainTab('dns')}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
            mainTab === 'dns'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Globe className={`w-4 h-4 ${mainTab === 'dns' ? '' : 'opacity-70'}`} />
          {t('dns.tab', { defaultValue: 'DNS' })}
        </button>
      </div>

      {/* CDN Tab Content */}
      {mainTab === 'cdn' && (
        <div className="space-y-4">
          {/* Top Row: WAF/Purge Cache (Left) and CDN Statistics (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Left Column: WAF Protection and Purge Cache */}
            <div className="space-y-4 flex flex-col h-full">
              {/* WAF Protection Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('cdn.wafProtection', { defaultValue: 'WAF Protection' })}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('cdn.wafDescription', { defaultValue: 'Enable Web Application Firewall to protect your site from attacks' })}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                    />
                  </button>
                </div>
              </div>

              {/* Purge Cache Button */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('cdn.purgeCache', { defaultValue: 'Purge Cache' })}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('cdn.purgeCacheDescription', { defaultValue: 'Clear all cached content from the CDN' })}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg transition-colors cursor-not-allowed opacity-60 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {t('cdn.purgeCache', { defaultValue: 'Purge Cache' })}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: CDN Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('cdn.statistics', { defaultValue: 'CDN Statistics' })}
              </h2>
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart3 className="mx-auto mb-2 opacity-50" />
                  <div>{t('cdn.noStatistics', { defaultValue: 'No statistics available' })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Statistics — free tier: static placeholder (no chart library) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('dns.statistics', { defaultValue: 'DNS Statistics' })}
            </h2>
            <section
              aria-label={t('dns.statistics', { defaultValue: 'DNS Statistics' })}
              className="phguard-placeholder-panel flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center"
            >
              <BarChart3 className="mb-3 h-10 w-10 text-gray-500 opacity-80 dark:text-gray-400" aria-hidden />
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('dns.noStatistics', { defaultValue: 'No statistics available' })}</p>
              <p className="phguard-placeholder-desc mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                {t('dns.dnsStatsPremium', { defaultValue: 'DNS query statistics and charts are available in PhantomGuard Pro.' })}
              </p>
            </section>
          </div>
        </div>
      )}

      {/* DNS Tab Content */}
      {mainTab === 'dns' && (
        <>
          {/* DNS Records Header */}
          <div className="flex items-center justify-between">
            <div></div>
            {activeTab === 'records' && (
              <div className="flex items-center gap-4">
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg transition-colors cursor-not-allowed opacity-60"
                >
                  <Lock className="w-4 h-4" />
                  {t('dns.addRecord', { defaultValue: 'Add Record' })}
                </button>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('dns.searchPlaceholder', { defaultValue: 'Search DNS records' })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DNS Records */}
          {activeTab === 'records' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" data-onboarding="dns-records">
          {isLoadingRecords ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Activity className="mx-auto mb-2 opacity-50 animate-pulse" />
                <div className="text-gray-500 dark:text-gray-400">{t('dns.loadingRecords', { defaultValue: 'Loading DNS records...' })}</div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                className="pointer-events-none max-h-[500px] w-full overflow-auto rounded border border-gray-200 dark:border-gray-700"
                style={{ minHeight: '500px' }}
              >
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                    <tr>
                      <th className="w-[100px] px-3 py-2 text-center font-semibold">{t('dns.type', { defaultValue: 'TYPE' })}</th>
                      <th className="min-w-[150px] px-3 py-2 font-semibold">{t('dns.name', { defaultValue: 'NAME' })}</th>
                      <th className="min-w-[120px] px-3 py-2 font-semibold">{t('dns.value', { defaultValue: 'VALUE' })}</th>
                      <th className="w-[100px] px-3 py-2 font-semibold">{t('dns.weight', { defaultValue: 'WEIGHT' })}</th>
                      <th className="w-[100px] px-3 py-2 text-center font-semibold">{t('dns.ttl', { defaultValue: 'TTL' })}</th>
                      <th className="min-w-[180px] px-3 py-2 text-center font-semibold">
                        {t('dns.cdnAcceleration', { defaultValue: 'CDN ACCELERATION' })}
                      </th>
                      <th className="w-[50px] px-1 py-2" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('dns.noRecords', { defaultValue: 'No DNS records.' })}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => {
                        const typeStr = getDnsTypeString(record.type);
                        const rawName = record.name && String(record.name).trim() ? record.name : '';
                        const displayName = rawName || domainName;
                        const truncatedName = displayName.length > 30 ? `${displayName.substring(0, 27)}...` : displayName;
                        const weightDisplay = record.weight != null && record.weight !== '' ? record.weight : '-';
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                            <td className="px-3 py-2 text-center align-middle">
                              <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                {typeStr}
                              </span>
                            </td>
                            <td className="max-w-[min(40vw,20rem)] px-3 py-2 align-middle">
                              <span className="text-sm text-gray-900 dark:text-gray-100" title={displayName}>
                                {truncatedName}
                              </span>
                            </td>
                            <td className="max-w-[min(40vw,24rem)] break-words px-3 py-2 align-middle text-gray-900 dark:text-gray-100">
                              {record.value != null ? String(record.value) : ''}
                            </td>
                            <td className="px-3 py-2 align-middle text-gray-800 dark:text-gray-200">{weightDisplay}</td>
                            <td className="px-3 py-2 text-center align-middle">
                              <span className="inline-flex rounded-full border border-orange-300 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                {record.ttl != null ? String(record.ttl) : '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center align-middle">
                              {!record.cdnAcceleration ? (
                                '-'
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    <Zap className="h-3 w-3" />
                                    {t('dns.enabled', { defaultValue: 'Enabled' })}
                                  </span>
                                  <button
                                    type="button"
                                    disabled
                                    className="cursor-not-allowed opacity-60 text-gray-400 dark:text-gray-500"
                                    title={t('dns.cdnSettings', { defaultValue: 'CDN Settings' })}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-2 text-center align-middle">{renderDnsActionsCell(record)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-900/80 z-10">
                <div className="text-center p-6" style={{ filter: 'none' }}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('dns.locked.title', { defaultValue: 'Premium Feature' })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    {t('dns.locked.description', { 
                      defaultValue: 'DNS record management is available in PhantomGuard Pro. Upgrade to add, edit, and manage DNS records.' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            )}
            </div>
          )}

          {/* Action Menu Dropdown Portal */}
      {actionMenuOpen && actionMenuRecord && actionMenuPosition.visible && createPortal(
        <div
          id="action-menu-dropdown"
          className="fixed w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[99999]"
          style={{
            left: `${Math.max(8, actionMenuPosition.x - 128)}px`, // 128px = width (w-32), ensure it's not off-screen
            top: `${actionMenuPosition.y}px`,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            disabled
            className="w-full px-4 py-2 text-left text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60 flex items-center gap-2 first:rounded-t-lg"
          >
            <Edit className="w-4 h-4" />
            {t('dns.edit', { defaultValue: 'Edit' })}
          </button>
          <button
            disabled
            className="w-full px-4 py-2 text-left text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60 flex items-center gap-2 disabled:opacity-50 last:rounded-b-lg"
          >
            <Trash2 className="w-4 h-4" />
            {t('dns.delete', { defaultValue: 'Delete' })}
          </button>
        </div>,
        document.body
      )}
        </>
      )}

    </div>
  );
};

export default DNSManagementPage;
