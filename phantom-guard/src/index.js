import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import './index.css';
import './i18n/config'; // Initialize i18n

// Apply dark mode immediately on page load to prevent flash
// Default to dark mode unless explicitly disabled
(function() {
  const darkModeSetting = localStorage.getItem('phguard-dark-mode');
  // Default to dark mode if not set, or if explicitly set to 'true'
  const darkMode = darkModeSetting === null || darkModeSetting === 'true';
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

// Initialize the React app
const container = document.getElementById('phguard-react-app');
if (container) {
  const root = createRoot(container);
  root.render(
    <SettingsProvider>
      <App />
    </SettingsProvider>
  );
}



