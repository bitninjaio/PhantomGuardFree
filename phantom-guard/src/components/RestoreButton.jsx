import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { RotateCcw, X, AlertCircle, CheckCircle } from 'lucide-react';

const RestoreButton = ({ file, restoreFile }) => {
  const { t } = useTranslation();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({ success: false, message: '' });

  const handleRestoreClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setIsRestoring(true);
    try {
      const result = await restoreFile(file.file_hash);
      setResultData({
        success: result.success,
        message: result.message || (result.success 
          ? t('components.restoreButton.restoreSuccess')
          : t('components.restoreButton.restoreFailed'))
      });
      setShowResultModal(true);
    } catch (error) {
      setResultData({
        success: false,
        message: t('components.restoreButton.restoreError')
      });
      setShowResultModal(true);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
  };

  return (
    <>
      <button
        onClick={handleRestoreClick}
        disabled={isRestoring}
        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{isRestoring ? t('components.restoreButton.restoring') : t('components.restoreButton.restore')}</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('components.restoreButton.confirmTitle', { defaultValue: 'Confirm Restore' })}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('components.restoreButton.restoreConfirm')}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {t('components.restoreButton.confirm', { defaultValue: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Result Modal */}
      {showResultModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {resultData.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {resultData.success 
                    ? t('components.restoreButton.successTitle', { defaultValue: 'Success' })
                    : t('components.restoreButton.errorTitle', { defaultValue: 'Error' })}
                </h3>
              </div>
              <button
                onClick={handleCloseResult}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-6 ${
              resultData.success 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {resultData.message}
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseResult}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default RestoreButton;