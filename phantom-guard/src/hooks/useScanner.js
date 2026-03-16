import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Placeholder hook for malware scanner - no API in free version.
 * Returns idle state to show premium feature UI.
 */
export const useScanner = () => {
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesScanned, setFilesScanned] = useState(0);
  const [maliciousFound, setMaliciousFound] = useState(0);
  const [injectedFound, setInjectedFound] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalFiles, setTotalFiles] = useState(null);
  const [scanPhase, setScanPhase] = useState(null);

  const startScan = useCallback(async () => {
    toast.info('Malware scanning is available in PhantomGuard Pro.');
  }, []);

  const stopScan = useCallback(async () => {
    setScanStatus('idle');
  }, []);

  const getLastScanResults = useCallback(async () => {
    setScanResults(null);
  }, []);

  return {
    scanStatus,
    scanProgress,
    scanResults,
    filesScanned,
    maliciousFound,
    injectedFound,
    startedAt,
    elapsedSeconds,
    totalFiles,
    scanPhase,
    isLoading,
    startScan,
    stopScan,
    getLastScanResults
  };
};
