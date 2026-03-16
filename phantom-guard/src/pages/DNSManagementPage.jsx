import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../hooks/useConfirm';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { MoreVertical, Edit, Trash2, CalendarSearch, X, Activity, BarChart3, Settings, AlertCircle, Lock, Cloud, Globe, Shield, Zap, List } from 'lucide-react';
import PremiumFeatureBanner from '../components/PremiumFeatureBanner';
import { Chart } from 'react-google-charts';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

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
  const [isDeleting, setIsDeleting] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0, visible: false });

  // DNS Statistics state
  const [dnsStatistics, setDnsStatistics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Date range state for DNS statistics
  const getLast30DaysRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return {
      startDate: startDate,
      endDate: endDate,
      key: 'selection'
    };
  };

  const [dnsStartDate, setDnsStartDate] = useState('');
  const [dnsEndDate, setDnsEndDate] = useState('');
  const [showDnsDatePicker, setShowDnsDatePicker] = useState(false);
  const [dnsDateRange, setDnsDateRange] = useState([getLast30DaysRange()]);
  const dnsDatePickerRef = useRef(null);

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

  const handleDeleteRecord = useCallback(async (id) => {
    // Premium feature - no action in free version
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return dnsRecords;
    const query = searchQuery.toLowerCase();
    return dnsRecords.filter(record => 
      record.name.toLowerCase().includes(query) ||
      record.value.toLowerCase().includes(query) ||
      record.type.toLowerCase().includes(query)
    );
  }, [dnsRecords, searchQuery]);

  // Get the record for the open action menu
  const actionMenuRecord = useMemo(() => {
    return actionMenuOpen ? filteredRecords.find(r => r.id === actionMenuOpen) : null;
  }, [actionMenuOpen, filteredRecords]);

  const columnDefs = useMemo(() => [
    {
      field: 'type',
      headerName: t('dns.type', { defaultValue: 'TYPE' }),
      width: 100,
      suppressMenu: true,
      sortable: true,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {params.value}
          </span>
        );
      },
    },
    {
      field: 'name',
      headerName: t('dns.name', { defaultValue: 'NAME' }),
      flex: 1,
      minWidth: 150,
      suppressMenu: true,
      sortable: true,
      cellRenderer: (params) => {
        const displayName = params.value && params.value.trim() ? params.value : domainName;
        const truncated = displayName.length > 30 ? displayName.substring(0, 27) + '...' : displayName;
        return (
          <span className="text-sm text-gray-900 dark:text-gray-100" title={displayName}>
            {truncated}
          </span>
        );
      },
    },
    {
      field: 'value',
      headerName: t('dns.value', { defaultValue: 'VALUE' }),
      flex: 1,
      minWidth: 120,
      suppressMenu: true,
      sortable: true,
    },
    {
      field: 'weight',
      headerName: t('dns.weight', { defaultValue: 'WEIGHT' }),
      width: 100,
      suppressMenu: true,
      sortable: true,
      cellRenderer: (params) => {
        return params.value || '-';
      },
    },
    {
      field: 'ttl',
      headerName: t('dns.ttl', { defaultValue: 'TTL' }),
      width: 100,
      suppressMenu: true,
      sortable: true,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
            {params.value}
          </span>
        );
      },
    },
    {
      field: 'cdnAcceleration',
      headerName: t('dns.cdnAcceleration', { defaultValue: 'CDN ACCELERATION' }),
      width: 180,
      suppressMenu: true,
      sortable: true,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        if (!params.value) return '-';
        return (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {t('dns.enabled', { defaultValue: 'Enabled' })}
            </span>
            <button 
              disabled
              className="text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
              title={t('dns.cdnSettings', { defaultValue: 'CDN Settings' })}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      suppressMenu: true,
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px' },
      cellRenderer: (params) => {
        const record = params.data;
        // Check if this is the main A record at root (name is empty or equals domain name AND type is A)
        const isRootDomain = !record.name || record.name.trim() === '' || record.name === domainName;
        const isMainARecord = isRootDomain && record.type === 'A';
        
        // Hide actions menu only for main A record at root
        if (isMainARecord) {
          return null;
        }
        
        const isOpen = actionMenuOpen === record.id;
        const buttonId = `action-btn-${record.id}`;
        
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              id={buttonId}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                
                if (isOpen) {
                  setActionMenuOpen(null);
                  setActionMenuPosition({ x: 0, y: 0, visible: false });
                } else {
                  const button = e.currentTarget;
                  const rect = button.getBoundingClientRect();
                  setActionMenuPosition({
                    x: rect.right,
                    y: rect.bottom + 4,
                    visible: true
                  });
                  setActionMenuOpen(record.id);
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              type="button"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        );
      },
    },
  ], [t, actionMenuOpen, handleDeleteRecord, isDeleting, domainName]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    filter: false,
  }), []);

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


  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dnsDatePickerRef.current && !dnsDatePickerRef.current.contains(event.target)) {
        setShowDnsDatePicker(false);
      }
    };

    if (showDnsDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDnsDatePicker]);

  // Handle date range selection
  const handleDnsDateRangeChange = (item) => {
    setDnsDateRange([item.selection]);
  };

  // Apply date range (called when Apply button is clicked)
  const applyDnsDateRange = () => {
    const start = dnsDateRange[0].startDate;
    const end = dnsDateRange[0].endDate;
    
    // Set start date to beginning of day (00:00:00)
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    
    // Set end date to end of day (23:59:59)
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    
    // Format as ISO 8601 with UTC timezone indicator
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    };
    
    setDnsStartDate(formatDateForAPI(startDate));
    setDnsEndDate(formatDateForAPI(endDate));
    setShowDnsDatePicker(false);
  };

  // Clear date filter (reset to last 30 days - API default)
  const clearDnsDateFilter = () => {
    setDnsStartDate('');
    setDnsEndDate('');
    setDnsDateRange([getLast30DaysRange()]);
    setShowDnsDatePicker(false);
  };

  // Fetch DNS records
  useEffect(() => {
    if (mainTab !== 'dns' || activeTab !== 'records') return;
    fetchDnsRecords();
  }, [mainTab, activeTab, fetchDnsRecords]);

  // No API in free version
  useEffect(() => {
    setDnsServerStatus(false);
  }, []);

  // Fetch DNS statistics - no API in free version (moved to CDN tab)
  useEffect(() => {
    if (mainTab !== 'cdn') return;
    setDnsStatistics(null);
    setIsLoadingStats(false);
  }, [mainTab]);

  // Process chart data
  const queriesServedChartData = useMemo(() => {
    if (!dnsStatistics || !dnsStatistics.QueriesServedChart) return [];
    const chartData = [['Date', 'Queries Served']];
    Object.entries(dnsStatistics.QueriesServedChart).forEach(([date, value]) => {
      const formattedDate = format(new Date(date), 'MMM dd');
      chartData.push([formattedDate, Number(value)]);
    });
    return chartData;
  }, [dnsStatistics]);

  const normalQueriesChartData = useMemo(() => {
    if (!dnsStatistics || !dnsStatistics.NormalQueriesServedChart) return [];
    const chartData = [['Date', 'Normal Queries']];
    Object.entries(dnsStatistics.NormalQueriesServedChart).forEach(([date, value]) => {
      const formattedDate = format(new Date(date), 'MMM dd');
      chartData.push([formattedDate, Number(value)]);
    });
    return chartData;
  }, [dnsStatistics]);

  const queriesByTypeChartData = useMemo(() => {
    if (!dnsStatistics || !dnsStatistics.QueriesByTypeChart) return [];
    
    // DNS record type mapping
    const dnsTypeMap = {
      '1': 'A',
      '2': 'NS',
      '5': 'CNAME',
      '6': 'SOA',
      '12': 'PTR',
      '15': 'MX',
      '16': 'TXT',
      '28': 'AAAA',
      '33': 'SRV',
      '48': 'DNSKEY',
      '65': 'HTTPS',
      '99': 'SPF',
      '255': 'ANY',
      '257': 'CAA'
    };
    
    const chartData = [['Type', 'Queries']];
    Object.entries(dnsStatistics.QueriesByTypeChart).forEach(([type, value]) => {
      const typeName = dnsTypeMap[type] || `Type ${type}`;
      chartData.push([typeName, Number(value)]);
    });
    return chartData;
  }, [dnsStatistics]);

  // Check for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
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

          {/* DNS Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('dns.statistics', { defaultValue: 'DNS Statistics' })}
            </h2>
            <div className="space-y-6">
              {/* Total Queries Card */}
              {dnsStatistics && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('dns.totalQueriesServed', { defaultValue: 'Total Queries Served' })}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                        {dnsStatistics.TotalQueriesServed?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="relative" ref={dnsDatePickerRef}>
                      <button
                        disabled
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDnsDatePicker(!showDnsDatePicker);
                        }}
                        className={`p-2 rounded focus:outline-none transition-colors cursor-not-allowed opacity-60 ${
                          dnsStartDate && dnsEndDate ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'
                        }`}
                        title={t('dns.premiumFeature', { defaultValue: 'Premium Feature' })}
                      >
                        <CalendarSearch size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts */}
              {isLoadingStats ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="mx-auto mb-2 opacity-50 animate-pulse" />
                    <div className="text-gray-500 dark:text-gray-400">{t('dns.loadingStatistics', { defaultValue: 'Loading statistics...' })}</div>
                  </div>
                </div>
              ) : dnsStatistics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Queries Served Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {t('dns.queriesServed', { defaultValue: 'Queries Served Over Time' })}
                    </h3>
                    {queriesServedChartData.length > 1 ? (
                      <Chart
                        chartType="AreaChart"
                        data={queriesServedChartData}
                        options={{
                          chartArea: { left: 60, top: 20, right: 20, bottom: 50, width: '100%', height: '85%' },
                          hAxis: {
                            title: t('dns.date', { defaultValue: 'Date' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true }
                          },
                          vAxis: {
                            title: t('dns.queries', { defaultValue: 'Queries' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true },
                            format: 'short'
                          },
                          legend: { position: 'none' },
                          colors: ['#6366f1'],
                          lineWidth: 2,
                          pointSize: 2,
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          curveType: 'function',
                          areaOpacity: 1,
                          enableInteractivity: true,
                          tooltip: { trigger: 'focus' }
                        }}
                        width="100%"
                        height="300px"
                        loader={<div className="text-gray-500 dark:text-gray-400">{t('dns.loadingChart', { defaultValue: 'Loading chart...' })}</div>}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        {t('dns.noData', { defaultValue: 'No data available' })}
                      </div>
                    )}
                  </div>

                  {/* Normal Queries Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {t('dns.normalQueries', { defaultValue: 'Normal Queries Over Time' })}
                    </h3>
                    {normalQueriesChartData.length > 1 ? (
                      <Chart
                        chartType="AreaChart"
                        data={normalQueriesChartData}
                        options={{
                          chartArea: { left: 60, top: 20, right: 20, bottom: 50, width: '100%', height: '85%' },
                          hAxis: {
                            title: t('dns.date', { defaultValue: 'Date' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true }
                          },
                          vAxis: {
                            title: t('dns.queries', { defaultValue: 'Queries' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true },
                            format: 'short'
                          },
                          legend: { position: 'none' },
                          colors: ['#10b981'],
                          lineWidth: 2,
                          pointSize: 2,
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          curveType: 'function',
                          areaOpacity: 1,
                          enableInteractivity: true,
                          tooltip: { trigger: 'focus' }
                        }}
                        width="100%"
                        height="300px"
                        loader={<div className="text-gray-500 dark:text-gray-400">{t('dns.loadingChart', { defaultValue: 'Loading chart...' })}</div>}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        {t('dns.noData', { defaultValue: 'No data available' })}
                      </div>
                    )}
                  </div>

                  {/* Queries by Type Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {t('dns.queriesByType', { defaultValue: 'Queries by DNS Record Type' })}
                    </h3>
                    {queriesByTypeChartData.length > 1 ? (
                      <Chart
                        chartType="BarChart"
                        data={queriesByTypeChartData}
                        options={{
                          chartArea: { left: 80, top: 20, right: 20, bottom: 50, width: '100%', height: '85%' },
                          hAxis: {
                            title: t('dns.queries', { defaultValue: 'Queries' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true },
                            format: 'short'
                          },
                          vAxis: {
                            title: t('dns.recordType', { defaultValue: 'Record Type' }),
                            textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                            titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true }
                          },
                          legend: { position: 'none' },
                          colors: ['#f59e0b'],
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          enableInteractivity: true,
                          tooltip: { trigger: 'focus' }
                        }}
                        width="100%"
                        height="400px"
                        loader={<div className="text-gray-500 dark:text-gray-400">{t('dns.loadingChart', { defaultValue: 'Loading chart...' })}</div>}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        {t('dns.noData', { defaultValue: 'No data available' })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center h-64">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <BarChart3 className="mx-auto mb-2 opacity-50" />
                    <div>{t('dns.noStatistics', { defaultValue: 'No statistics available' })}</div>
                  </div>
                </div>
              )}
            </div>
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
              <div className="ag-theme-alpine  pointer-events-none" style={{ height: '500px', width: '100%' }}>
                <AgGridReact
                  rowData={filteredRecords}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={false}
                  suppressCellFocus={true}
                  suppressRowClickSelection={true}
                  suppressNoRowsOverlay={true}
                  domLayout="normal"
                  getRowId={(params) => params.data.id}
                  onCellClicked={(params) => {
                    // Close menu if clicking outside action column
                    if (params.column?.getColId() !== 'actions' && actionMenuOpen) {
                      setActionMenuOpen(null);
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80  rounded-lg z-10">
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
