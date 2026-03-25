import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import RestoreButton from './RestoreButton';
import { X, HelpCircle } from 'lucide-react';

const InfectedFilesTable = ({ files, formatDateTime, restoreFile }) => {
  const { t } = useTranslation();
  const [modalContent, setModalContent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalFileName, setModalFileName] = useState('');
  const [modalFileData, setModalFileData] = useState(null);
  const [tooltipState, setTooltipState] = useState({ show: false, text: '', x: 0, y: 0 });

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

  const renderResultCell = (file) => {
    const result = Number(file.scan_result);
    const isMalicious = result === 2;
    const isSuspicious = result === 6;
    const isRestored = result === 7;
    const isNotQuarantined = Number(file.quarantine) === 0;

    return (
      <div className="flex items-center gap-1 justify-center">
        <span
          className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
            isRestored
              ? 'bg-green-600 text-white'
              : isMalicious
                ? 'bg-red-600 text-white'
                : isSuspicious
                  ? 'bg-orange-600 text-white'
                  : 'bg-amber-600 text-white'
          }`}
        >
          {isRestored
            ? t('scanner.restored')
            : isMalicious
              ? t('scanner.malicious')
              : isSuspicious
                ? t('scanner.suspicious')
                : t('scanner.injected')}
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
                y: rect.top - 5,
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
  };

  const renderActionsCell = (file) => {
    const scanResult = Number(file.scan_result);
    const isRestored = scanResult === 7;
    const isSuspicious = scanResult === 6;
    if (isRestored || isSuspicious) {
      return null;
    }
    return <RestoreButton file={file} restoreFile={restoreFile} />;
  };

  const list = Array.isArray(files) ? files : [];

  return (
    <>
      <div className="max-h-[500px] w-full overflow-auto rounded border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('components.infectedFiles.filePath')}</th>
              <th className="px-3 py-2 font-semibold">{t('components.infectedFiles.hash')}</th>
              <th className="w-[120px] px-3 py-2 text-center font-semibold">{t('components.infectedFiles.result')}</th>
              <th className="min-w-[140px] max-w-[170px] px-3 py-2 font-semibold">{t('components.infectedFiles.detected')}</th>
              <th className="w-[110px] px-3 py-2 text-center font-semibold">{t('components.infectedFiles.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('components.infectedFiles.noFiles', { defaultValue: 'No infected files.' })}
                </td>
              </tr>
            ) : (
              list.map((file, index) => {
                const fullPath = (file.dir_path ? file.dir_path + '/' : '/') + (file.file_name || '');
                const truncated = fullPath.length > 60 ? `${fullPath.substring(0, 57)}...` : fullPath;
                const hash = file.file_hash || '';

                return (
                  <tr key={file.file_hash || `${file.file_name}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                    <td className="max-w-[min(40vw,28rem)] px-3 py-2 align-middle">
                      <span
                        role={file.file_hash ? 'button' : undefined}
                        tabIndex={file.file_hash ? 0 : undefined}
                        title={fullPath}
                        onClick={() => handleFileClick(file)}
                        onKeyDown={(e) => {
                          if (file.file_hash && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            handleFileClick(file);
                          }
                        }}
                        className={
                          file.file_hash
                            ? 'cursor-pointer text-indigo-600 hover:underline dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      >
                        {truncated}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <code className="break-all rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                        {hash}
                      </code>
                    </td>
                    <td className="px-3 py-2 align-middle">{renderResultCell(file)}</td>
                    <td className="whitespace-nowrap px-3 py-2 align-middle text-gray-800 dark:text-gray-200">
                      {formatDateTime(file.created_at)}
                    </td>
                    <td className="px-3 py-2 text-center align-middle">{renderActionsCell(file)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {tooltipState.show &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] w-48 whitespace-normal rounded bg-gray-900 p-2 text-xs text-white shadow-lg dark:bg-gray-700"
            style={{
              left: `${tooltipState.x}px`,
              top: `${tooltipState.y}px`,
              transform: 'translateX(-100%)',
              marginTop: '-5px',
            }}
          >
            {tooltipState.text}
          </div>,
          document.body,
        )}

      {(modalContent !== null || modalLoading || modalError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
          <div className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mr-4 flex-1 truncate text-lg font-semibold text-black dark:text-gray-100" title={modalFileName}>
                {modalFileName}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {modalLoading && (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  {t('components.infectedFiles.loading', { defaultValue: 'Loading file content...' })}
                </div>
              )}
              {modalError && (
                <div className="p-8 text-center text-red-600 dark:text-red-400">{modalError}</div>
              )}
              {modalContent && (
                <div className="p-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                  <code>{renderHighlightedContent(modalContent, modalFileData)}</code>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
