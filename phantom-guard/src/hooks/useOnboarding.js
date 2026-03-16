import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'phguard-onboarding-completed';
const ONBOARDING_CURRENT_STEP_KEY = 'phguard-onboarding-step';

export const useOnboarding = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if onboarding was completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    const savedStep = parseInt(localStorage.getItem(ONBOARDING_CURRENT_STEP_KEY) || '0', 10);
    
    setIsCompleted(completed);
    setCurrentStep(savedStep);
    
    // Only show onboarding if not completed and we're on the first visit
    if (!completed && savedStep === 0) {
      setIsOpen(true);
    }
  }, []);

  const startOnboarding = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    setIsOpen(true);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.setItem(ONBOARDING_CURRENT_STEP_KEY, '0');
  };

  const nextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    localStorage.setItem(ONBOARDING_CURRENT_STEP_KEY, next.toString());
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const previous = currentStep - 1;
      setCurrentStep(previous);
      localStorage.setItem(ONBOARDING_CURRENT_STEP_KEY, previous.toString());
    }
  };

  const skipOnboarding = () => {
    setIsCompleted(true);
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
  };

  const completeOnboarding = () => {
    setIsCompleted(true);
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isCompleted,
    currentStep,
    isOpen,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    closeModal,
    setIsOpen,
  };
};
