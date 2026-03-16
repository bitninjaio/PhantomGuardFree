import { useState, useCallback } from 'react';

/**
 * Placeholder hook for scan history - no API in free version.
 * Returns empty data to show premium feature UI.
 */
export const useHistory = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [scanTotal, setScanTotal] = useState(0);
  const [infectedTotal, setInfectedTotal] = useState(0);
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [isLoadingInfected, setIsLoadingInfected] = useState(false);
  const [infectedFiles, setInfectedFiles] = useState([]);
  const [scanMeta, setScanMeta] = useState({ page: 1, perPage: 5, total: 0, totalPages: 0 });
  const [infectedMeta, setInfectedMeta] = useState({ page: 1, perPage: 5, total: 0, totalPages: 0 });

  const loadHistory = useCallback(async () => {
    setScanHistory([]);
    setScanTotal(0);
    setScanMeta({ page: 1, perPage: 5, total: 0, totalPages: 0 });
  }, []);

  const loadInfectedFiles = useCallback(async () => {
    setInfectedFiles([]);
    setInfectedTotal(0);
    setInfectedMeta({ page: 1, perPage: 5, total: 0, totalPages: 0 });
  }, []);

  const getScanDetails = useCallback(async () => null, []);

  const deleteScan = useCallback(async () => ({ success: false }), []);

  const exportHistory = useCallback(async () => ({ success: false, error: 'Available in Pro' }), []);

  const clearHistory = useCallback(async () => ({ success: false }), []);

  const restoreFile = useCallback(async () => ({ success: false, message: 'Available in Pro' }), []);

  return {
    scanHistory,
    scanTotal,
    infectedTotal,
    infectedFiles,
    isLoadingScans,
    isLoadingInfected,
    scanMeta,
    infectedMeta,
    loadHistory,
    loadInfectedFiles,
    getScanDetails,
    deleteScan,
    exportHistory,
    clearHistory,
    restoreFile
  };
};
