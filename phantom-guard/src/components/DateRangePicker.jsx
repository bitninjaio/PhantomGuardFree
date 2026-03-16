import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRangePicker as ReactDateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  onClear,
  placeholder = "Select date range...",
  showClearButton = true,
  className = ""
}) => {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      key: 'selection'
    }
  ]);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange([{
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: 'selection'
      }]);
    }
  }, [startDate, endDate]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  // Apply dark mode styles to react-date-range components
  useEffect(() => {
    if (!showPicker) return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    if (!isDarkMode) return;

    const applyDarkStyles = () => {
      const wrapper = pickerRef.current?.querySelector('.rdrDateRangePickerWrapper');
      if (!wrapper) return;

      // Override inline styles on day elements
      const dayElements = wrapper.querySelectorAll('.rdrDay');
      dayElements.forEach((day) => {
        if (day.classList.contains('rdrDayPassive')) {
          day.style.color = '#6b7280';
        } else {
          day.style.color = '#f3f4f6';
        }
      });

      // Override inline styles on range elements
      const rangeElements = wrapper.querySelectorAll('.rdrInRange');
      rangeElements.forEach((el) => {
        el.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
      });

      const edgeElements = wrapper.querySelectorAll('.rdrStartEdge, .rdrEndEdge');
      edgeElements.forEach((el) => {
        el.style.backgroundColor = '#6366f1';
      });
    };

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(applyDarkStyles, 10);

    // Watch for DOM changes and reapply styles
    const observer = new MutationObserver(() => {
      applyDarkStyles();
    });

    const wrapper = pickerRef.current?.querySelector('.rdrDateRangePickerWrapper');
    if (wrapper) {
      observer.observe(wrapper, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [showPicker, dateRange]);

  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
  };

  const handleApply = () => {
    const start = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const end = format(dateRange[0].endDate, 'yyyy-MM-dd');
    onDateChange(start, end);
    setShowPicker(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-500 dark:text-gray-400" />
          {startDate && endDate ? (
            <span className="text-gray-900 dark:text-gray-100 truncate">
              {format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </div>
        {showClearButton && (startDate || endDate) && (
          <button
            onClick={handleClear}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            title={t('components.dateRangePicker.clearDates')}
          >
            <X size={16} />
          </button>
        )}
      </button>

      {showPicker && (
        <div className="absolute top-full right-0 mt-2 z-50 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ReactDateRangePicker
            ranges={dateRange}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            showDateDisplay={false}
            rangeColors={['#6366f1']}
          />
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
            <button
              onClick={() => setShowPicker(false)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {t('components.dateRangePicker.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

