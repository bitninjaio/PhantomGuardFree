import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Table } from 'lucide-react';

const ViewModeToggle = ({ currentMode, onModeChange, className = "" }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <button
        onClick={() => onModeChange('card')}
        className={`p-1.5 rounded ${currentMode === 'card'
          ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        title={t('components.viewModeToggle.cardView')}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onModeChange('table')}
        className={`p-1.5 rounded ${currentMode === 'table'
          ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        title={t('components.viewModeToggle.tableView')}
      >
        <Table size={16} />
      </button>
    </div>
  );
};

export default ViewModeToggle;

