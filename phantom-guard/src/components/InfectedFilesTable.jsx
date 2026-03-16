import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import RestoreButton from './RestoreButton';
import { RotateCcw, X, HelpCircle } from 'lucide-react';
import pako from 'pako';

const InfectedFilesTable = ({ files, formatDateTime, restoreFile }) => {
  const { t } = useTranslation();
  const [modalContent, setModalContent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalFileName, setModalFileName] = useState('');
  const [modalFileData, setModalFileData] = useState(null);
  const [tooltipState, setTooltipState] = useState({ show: false, text: '', x: 0, y: 0 });
  const tooltipRef = useRef(null);

  const renderHighlightedContent = (content, fileData) => {
    if (!content || !fileData) {
      return content;
    }

    const scanResult = Number(fileData.scan_result);
    const isInjected = scanResult === 4;

    if (!isInjected) {
      return content;
    }

    const startPos = fileData.infection_start_pos_at ? Number(fileData.infection_start_pos_at) : null;
    const endPos = fileData.infection_end_pos_at ? Number(fileData.infection_end_pos_at) : null;

    if (startPos === null || endPos === null || startPos < 0 || endPos <= startPos || endPos > content.length) {
      return content;
    }

    const before = content.substring(0, startPos);
    const infected = content.substring(startPos, endPos);
    const after = content.substring(endPos);

    return (
      <>
        {before}
        <span className="bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100 font-semibold">
          {infected}
        </span>
        {after}
      </>
    );
  };

  const decodeBase64Content = (base64Content) => {
    if (!base64Content) {
      return '';
    }

    const binary = window.atob(base64Content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return pako.ungzip(bytes, { to: 'string' });
  };

  const handleFileClick = async (file) => {
    if (!file.file_hash) {
      return;
    }

    setModalFileName((file.dir_path ? file.dir_path + '/' : '/') + (file.file_name || ''));
    setModalContent(null);
    setModalError(t('components.infectedFiles.premiumFeature', { defaultValue: 'File content preview is available in PhantomGuard Pro.' }));
    setModalFileData(file);
    setModalLoading(false);
  };

  const closeModal = () => {
    setModalContent(null);
    setModalError(null);
    setModalFileName('');
    setModalFileData(null);
  };
  
  const columnDefs = useMemo(() => [
    {
      field: 'file_name',
      headerName: t('components.infectedFiles.filePath'),
      flex: 1,
      minWidth: 150,
      suppressMenu: true,
      sortable: true,
      cellRenderer: (params) => {
        const file = params.data;
        const fullPath = (file.dir_path ? file.dir_path + '/' : '/') + (file.file_name || '');
        const truncated = fullPath.length > 60 ? fullPath.substring(0, 57) + '...' : fullPath;
        return (
          <span 
            title={fullPath}
            onClick={() => handleFileClick(file)}
            className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {truncated}
          </span>
        );
      },
    },
    {
      field: 'file_hash',
      headerName: t('components.infectedFiles.hash'),
      minWidth: 120,
      maxWidth: 180,
      suppressMenu: true,
      sortable: true,
      cellRenderer: (params) => {
        const hash = params.value || '';
        return <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded break-all text-gray-900 dark:text-gray-100">{hash}</code>;
      },
    },
    {
      field: 'scan_result',
      headerName: t('components.infectedFiles.result'),
      width: 120,
      suppressMenu: true,
      sortable: true,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        const result = Number(params.value);
        const isMalicious = result === 2;
        const isSuspicious = result === 6;
        const isRestored = result === 7;
        const isNotQuarantined = Number(params.data.quarantine) === 0;
        return (
          <div className="flex items-center gap-1 justify-center">
            <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
              isRestored
                ? 'bg-green-600 text-white'
                : isMalicious
                ? 'bg-red-600 text-white'
                : isSuspicious
                ? 'bg-orange-600 text-white'
                : 'bg-amber-600 text-white'
              }`}>
              {isRestored ? t('scanner.restored') : isMalicious ? t('scanner.malicious') : isSuspicious ? t('scanner.suspicious') : t('scanner.injected')}
            </span>
            {isNotQuarantined && (
              <div 
                className="relative inline-block flex-shrink-0"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipState({
                    show: true,
                    text: t('components.infectedFiles.notQuarantined', { defaultValue: 'File was not quarantined successfully' }),
                    x: rect.right,
                    y: rect.top - 5
                  });
                }}
                onMouseLeave={() => {
                  setTooltipState({ show: false, text: '', x: 0, y: 0 });
                }}
              >
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 cursor-help" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'created_at',
      headerName: t('components.infectedFiles.detected'),
      minWidth: 140,
      maxWidth: 170,
      suppressMenu: true,
      sortable: true,
      valueFormatter: (params) => formatDateTime(params.value),
    },
    {
      field: 'actions',
      headerName: t('components.infectedFiles.actions'),
      width: 110,
      suppressMenu: true,
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        const scanResult = Number(params.data.scan_result);
        const isRestored = scanResult === 7;
        const isSuspicious = scanResult === 6;
        if (isRestored || isSuspicious) {
          return null;
        }
        return <RestoreButton file={params.data} restoreFile={restoreFile} />;
      },
    },
  ], [formatDateTime, restoreFile, t]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    filter: true,
  }), []);


  return (
    <>
      <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
        <AgGridReact
          rowData={files}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          suppressCellFocus={true}
          domLayout="normal"
        />
      </div>

      {/* Tooltip Portal */}
      {tooltipState.show && createPortal(
        <div
          ref={tooltipRef}
          className="fixed w-48 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg z-[9999] pointer-events-none whitespace-normal"
          style={{
            left: `${tooltipState.x}px`,
            top: `${tooltipState.y}px`,
            transform: 'translateX(-100%)',
            marginTop: '-5px',
          }}
        >
          {tooltipState.text}
        </div>,
        document.body
      )}

      {/* File Content Modal */}
      {(modalContent !== null || modalLoading || modalError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-gray-100 truncate flex-1 mr-4" title={modalFileName}>
                {modalFileName}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
              {modalLoading && (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  {t('components.infectedFiles.loading', { defaultValue: 'Loading file content...' })}
                </div>
              )}
              {modalError && (
                <div className="p-8 text-center text-red-600 dark:text-red-400">
                  {modalError}
                </div>
              )}
              {modalContent && (
                <div className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200">
                  <code>
                    {renderHighlightedContent(modalContent, modalFileData)}
                  </code>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t('common.close', { defaultValue: 'Close' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfectedFilesTable;

