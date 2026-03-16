import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Clock, Bug, Shield, Lock } from 'lucide-react';
import { useScanner } from '../hooks/useScanner';
import { useHistory } from '../hooks/useHistory';
import Pagination from '../components/Pagination';
import DateRangePicker from '../components/DateRangePicker';
import ViewModeToggle from '../components/ViewModeToggle';
import ScanControls from '../components/ScanControls';
import ScanProgress from '../components/ScanProgress';
import ScanResults from '../components/ScanResults';
import InfectedFilesCard from '../components/InfectedFilesCard';
import InfectedFilesTable from '../components/InfectedFilesTable';
import RecentScans from '../components/RecentScans';
import PremiumFeatureBanner from '../components/PremiumFeatureBanner';

const ScannerPage = ({ onboardingStep }) => {
  const { t } = useTranslation();
  const [scanTarget, setScanTarget] = useState('wordpress');
  const [scansPage, setScansPage] = useState(1);
  const [scansPerPage] = useState(5);
  const [displayedScansCount, setDisplayedScansCount] = useState(5);
  const [allLoadedScans, setAllLoadedScans] = useState([]);
  const [isLoadingMoreScans, setIsLoadingMoreScans] = useState(false);
  const [infectedPage, setInfectedPage] = useState(1);
  const [infectedPerPage, setInfectedPerPage] = useState(5);
  const [infectedStartDate, setInfectedStartDate] = useState('');
  const [infectedEndDate, setInfectedEndDate] = useState('');
  const [viewMode, setViewMode] = useState({ infected: 'table' }); // 'card' or 'table'
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const {
    scanStatus,
    scanProgress,
    scanResults,
    startScan,
    stopScan,
    isLoading,
    filesScanned,
    maliciousFound,
    injectedFound,
    elapsedSeconds,
    totalFiles,
    scanPhase
  } = useScanner();

  const { scanHistory, infectedFiles, isLoadingScans, isLoadingInfected, loadHistory, loadInfectedFiles, scanMeta, infectedMeta, restoreFile } = useHistory();

  // Handle infected files date range selection
  const handleInfectedDateRangeChange = (start, end) => {
    setInfectedStartDate(start);
    setInfectedEndDate(end);
  };

  // Clear infected date filter
  const clearInfectedDateFilter = () => {
    setInfectedStartDate('');
    setInfectedEndDate('');
  };

  useEffect(() => {
    if (scansPage === 1) {
      // First page load - replace all scans
      loadHistory(1, scansPerPage, '', '');
    } else {
      // Loading more - append to existing scans
      setIsLoadingMoreScans(true);
      loadHistory(scansPage, scansPerPage, '', '');
    }
  }, [loadHistory, scansPage, scansPerPage]);

  // Update allLoadedScans when scanHistory changes
  useEffect(() => {
    if (scansPage === 1) {
      // First page - replace all
      setAllLoadedScans(scanHistory);
      setDisplayedScansCount(5);
    } else {
      // Append new scans
      setAllLoadedScans(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newScans = scanHistory.filter(s => !existingIds.has(s.id));
        return [...prev, ...newScans];
      });
      setIsLoadingMoreScans(false);
    }
  }, [scanHistory, scansPage]);

  useEffect(() => {
    loadInfectedFiles(infectedPage, infectedPerPage, '', infectedStartDate, infectedEndDate);
  }, [loadInfectedFiles, infectedPage, infectedPerPage, infectedStartDate, infectedEndDate]);

  // Reset to page 1 when infected dates change
  useEffect(() => {
    if (infectedStartDate !== infectedMeta?.startDate || infectedEndDate !== infectedMeta?.endDate) {
      setInfectedPage(1);
    }
  }, [infectedStartDate, infectedEndDate, infectedMeta?.startDate, infectedMeta?.endDate]);

  useEffect(() => {
    if (viewMode.infected === 'table' && infectedPerPage !== 10) {
      setInfectedPerPage(10);
      setInfectedPage(1); // Reset to first page
    } else if (viewMode.infected === 'card' && infectedPerPage !== 5) {
      setInfectedPerPage(5);
      setInfectedPage(1); // Reset to first page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode.infected]);

  // Refresh history after scan completes
  useEffect(() => {
    if (scanStatus === 'completed') {
      setScansPage(1);
      setDisplayedScansCount(5);
      setAllLoadedScans([]);
      loadHistory(1, scansPerPage, '', '');
    }
  }, [scanStatus, loadHistory, scansPerPage]);

  // Handle "Show more" for scans
  const handleShowMoreScans = () => {
    const nextPage = scansPage + 1;
    setScansPage(nextPage);
    setDisplayedScansCount(prev => prev + scansPerPage);
  };

  // Get displayed scans (first displayedScansCount items)
  const displayedScans = allLoadedScans.slice(0, displayedScansCount);
  const hasMoreScans = scanMeta?.totalPages
    ? scansPage < scanMeta.totalPages
    : allLoadedScans.length > displayedScansCount || scanHistory.length === scansPerPage;

  const handleInfectedPageChange = (newPage) => {
    setInfectedPage(newPage);
  };

  const handleInfectedPerPageChange = (newPerPage) => {
    setInfectedPerPage(newPerPage);
    setInfectedPage(1); // Reset to first page when changing items per page
  };

  const getStatusIcon = (type) => {
    if (type === 'infected') {
      return <Bug className="w-5 h-5 text-indigo-600" />;
    }
    switch (scanStatus) {
      case 'scanning':
        return <Clock className="w-5 h-5 text-purple-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getStatusText = () => {
    switch (scanStatus) {
      case 'scanning':
        return t('scanner.scanningInProgress');
      case 'completed':
        return t('scanner.scanCompleted');
      case 'error':
        return t('scanner.scanFailed');
      default:
        return t('scanner.readyToScan');
    }
  };

  const formatDate = (dateString) => new Date(dateString || Date.now()).toLocaleString();

  // Format date/time like PHP version: "10/29/2025, 2:08:45 PM"
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };


  return (
    <div className="space-y-6">
      <PremiumFeatureBanner
        description={t('scanner.premiumDescription', { defaultValue: 'Malware Scanner is available in PhantomGuard Pro.' })}
      />

      {/* Scan Results - Show when completed */}
      {scanStatus === 'completed' && scanResults && (
        <ScanResults 
          scanResults={scanResults} 
          maliciousFound={maliciousFound} 
          injectedFound={injectedFound} 
        />
      )}

      {/* Two Column Layout: Infected Files (left) and Recent Scans (right) */}
      <div className="flex flex-wrap">
        {/* Left Column: Infected Files */}
        <div className="flex-[0.60] min-w-[300px] pr-6 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
          <div className="phguard-card flex flex-col relative h-full">
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-1">
                {getStatusIcon('infected')}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('scanner.infectedFiles')}
                </h3>
              </div>
              <ViewModeToggle
                currentMode={viewMode.infected}
                onModeChange={(mode) => setViewMode({ ...viewMode, infected: mode })}
                className="ml-auto"
              />
            </div>

            {/* Date Filter */}
            <div className="mb-4">
              <DateRangePicker
                startDate={infectedStartDate}
                endDate={infectedEndDate}
                onDateChange={handleInfectedDateRangeChange}
                onClear={clearInfectedDateFilter}
                placeholder={t('scanner.selectDateRange')}
              />
            </div>

            <div className="flex-1 relative min-h-80">
              <div className="blur-sm opacity-75 pointer-events-none">
                {isLoadingInfected ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">{t('scanner.loadingInfectedFiles')}</p>
                  </div>
                ) : (infectedFiles || []).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    {infectedStartDate || infectedEndDate
                      ? t('scanner.noFilesInDateRange')
                      : t('scanner.noInfectedFiles')}
                  </p>
                ) : viewMode.infected === 'table' ? (
                  <>
                    <InfectedFilesTable 
                      files={infectedFiles} 
                      formatDateTime={formatDateTime} 
                      restoreFile={restoreFile} 
                    />
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                    <Pagination
                      currentPage={infectedMeta?.page || infectedPage}
                      totalPages={infectedMeta?.totalPages || 1}
                      onPageChange={handleInfectedPageChange}
                      perPage={infectedPerPage}
                      onPerPageChange={handleInfectedPerPageChange}
                    />
                  </>
                ) : (
                  <>
                    <InfectedFilesCard 
                      files={infectedFiles} 
                      formatDateTime={formatDateTime} 
                      restoreFile={restoreFile} 
                    />
                  </>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
                <div className="text-center p-6" style={{ filter: 'none' }}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('scanner.locked.title', { defaultValue: 'Premium Feature' })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    {t('scanner.locked.description', { 
                      defaultValue: 'Infected files management is available in PhantomGuard Pro. Upgrade to view and manage infected files.' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            {viewMode.infected === 'card' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                <Pagination
                  currentPage={infectedMeta?.page || infectedPage}
                  totalPages={infectedMeta?.totalPages || 1}
                  onPageChange={handleInfectedPageChange}
                  perPage={infectedPerPage}
                  onPerPageChange={handleInfectedPerPageChange}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Column: Recent Scans with Scan Controls */}
        <div className="flex-[0.40] min-w-[300px] pl-6">
          <div className="phguard-card flex flex-col relative h-full">
            {/* Scan Status Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('scanner.recentScans')}
                    </h3>
                    {scanStatus === 'scanning' && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {getStatusText()}
                      </p>
                    )}
                  </div>
                </div>
                <ScanControls
                  scanTarget={scanTarget}
                  onTargetChange={setScanTarget}
                  onStartScan={startScan}
                  onStopScan={stopScan}
                  isLoading={isLoading}
                  scanStatus={scanStatus}
                  isLicenseActive={true}
                />
              </div>

              {/* Scan Progress Details */}
              {scanStatus === 'scanning' && (
                <ScanProgress
                  progress={scanProgress}
                  filesScanned={filesScanned}
                  totalFiles={totalFiles}
                  maliciousFound={maliciousFound}
                  injectedFound={injectedFound}
                  elapsedSeconds={elapsedSeconds}
                  phase={scanPhase}
                />
              )}
            </div>

            {/* Spacer to match left column date filter height */}
            <div className="mb-4 h-[42px]"></div>

            <div className="flex-1 relative min-h-80">
              <div className="blur-sm opacity-75 pointer-events-none">
                <RecentScans
                  scans={displayedScans}
                  formatDate={formatDate}
                  isLoading={isLoadingScans && scansPage === 1}
                  onShowMore={handleShowMoreScans}
                  hasMore={hasMoreScans}
                  isLoadingMore={isLoadingMoreScans}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
                <div className="text-center p-6" style={{ filter: 'none' }}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('scanner.locked.title', { defaultValue: 'Premium Feature' })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    {t('scanner.locked.scansDescription', { 
                      defaultValue: 'Recent scans history is available in PhantomGuard Pro. Upgrade to view scan history.' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;


