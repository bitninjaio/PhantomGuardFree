import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RestoreButton from './RestoreButton';
import { X, HelpCircle } from 'lucide-react';
import pako from 'pako';

const InfectedFilesCard = ({ files, formatDateTime, restoreFile }) => {
  const { t } = useTranslation();
  const [modalContent, setModalContent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalFileName, setModalFileName] = useState('');
  const [modalFileData, setModalFileData] = useState(null);

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

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((f, i) => {
          const fullPath = (f.dir_path ? f.dir_path + '/' : '/') + (f.file_name || '');
          const scanResult = Number(f.scan_result);
          const isMalicious = scanResult === 2;
          const isSuspicious = scanResult === 6;
          const isRestored = scanResult === 7;
          const hash = f.file_hash || '';
          const isNotQuarantined = Number(f.quarantine) === 0;

          return (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">

              <div className="space-y-2 mb-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline" 
                      title={fullPath}
                      onClick={() => handleFileClick(f)}
                    >
                      {fullPath.length > 60 ? fullPath.substring(0, 57) + '...' : fullPath}
                    </p>
                  </div>
                <div className="ml-2 flex-shrink-0 flex flex-row items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
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

                  {!isRestored && !isSuspicious && <RestoreButton file={f} restoreFile={restoreFile} />}

                  {isNotQuarantined && (
                    <div className="relative group">
                      <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {t('components.infectedFiles.notQuarantined', { defaultValue: 'File was not quarantined successfully' })}
                      </div>
                    </div>
                  )}
                 
                </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">{t('components.infectedFiles.hashLabel')}</span>{' '}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-900 dark:text-gray-100">{hash}</code>
                </div>
                <div className="text-end">
                  <span className="font-medium">{t('components.infectedFiles.detectedLabel')}</span> {formatDateTime(f.created_at)}
                </div>
              </div>
            </div>
        );
      })} 
      </div>

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

export default InfectedFilesCard;

