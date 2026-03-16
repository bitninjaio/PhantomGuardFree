import { useCallback, useEffect, useState } from 'react';
import { adminAjax } from '../utils/api';

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

export const useHardening = () => {
  const [rules, setRules] = useState([]);
  const [preset, setPreset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pending, setPending] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const nonce = window.phguardData?.nonce;

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAjax('phguard_get_hardening_rules', {}, nonce);
      if (response.success && response.data?.rules) {
        setRules(response.data.rules);
        if (response.data?.preset) {
          setPreset(response.data.preset);
        }
      } else {
        setError(response.data?.message || 'Failed to load hardening rules.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load hardening rules.');
    } finally {
      setIsLoading(false);
    }
  }, [nonce]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const updateRule = useCallback(
    async ({ ruleKey, enabled, value, successText }) => {
      setPending((prev) => ({ ...prev, [ruleKey]: true }));
      setError(null);
      setSuccessMessage(null);

      try {
        const payload = { rule_key: ruleKey };

        if (typeof enabled !== 'undefined') {
          payload.enabled = normalizeBoolean(enabled) ? '1' : '0';
        }

        if (typeof value !== 'undefined') {
          payload.value = value;
        }

        const response = await adminAjax('phguard_update_hardening_rule', payload, nonce);

        if (response.success && response.data?.rules) {
          setRules(response.data.rules);
          if (response.data?.preset) {
            setPreset(response.data.preset);
          }
          if (successText) {
            setSuccessMessage(successText);
            setTimeout(() => setSuccessMessage(null), 4000);
          }
          return { success: true };
        }

        const message = response.data?.message || 'Failed to update rule.';
        setError(message);
        return { success: false, message };
      } catch (err) {
        const message = err?.message || 'Failed to update rule.';
        setError(message);
        return { success: false, message };
      } finally {
        setPending((prev) => {
          const next = { ...prev };
          delete next[ruleKey];
          return next;
        });
      }
    },
    [nonce]
  );

  return {
    rules,
    preset,
    isLoading,
    pending,
    error,
    successMessage,
    fetchRules,
    updateRule,
  };
};
