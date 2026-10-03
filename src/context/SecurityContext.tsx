import React, { createContext, useContext, useState, useEffect } from 'react';

export type AutoLockDuration = 'immediate' | '1min' | '5min' | 'never';

interface SecurityContextType {
  isLocked: boolean;
  isLockEnabled: boolean;
  isBiometricsEnabled: boolean;
  autoLockDuration: AutoLockDuration;
  hasPinSet: boolean;
  biometricAvailable: boolean;
  unlockWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  setPinCode: (newPin: string) => void;
  setLockEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setAutoLockDuration: (duration: AutoLockDuration) => void;
  lockNow: () => void;
  unlockBypass: () => void;
}

const STORAGE_KEYS = {
  LOCK_ENABLED: 'vault_sec_lock_enabled',
  PIN_CODE: 'vault_sec_pin_code',
  BIOMETRICS_ENABLED: 'vault_sec_biometrics_enabled',
  AUTO_LOCK_DURATION: 'vault_sec_auto_lock_duration',
  LAST_ACTIVE: 'vault_sec_last_active'
};

const DEFAULT_PIN = '1234';

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLockEnabled, setIsLockEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.LOCK_ENABLED);
    return val === null ? true : val === 'true';
  });

  const [pinCode, setPinCodeState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN_CODE) || DEFAULT_PIN;
  });

  const [isBiometricsEnabled, setIsBiometricsEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.BIOMETRICS_ENABLED);
    return val === null ? true : val === 'true';
  });

  const [autoLockDuration, setAutoLockDurationState] = useState<AutoLockDuration>(() => {
    return (localStorage.getItem(STORAGE_KEYS.AUTO_LOCK_DURATION) as AutoLockDuration) || '5min';
  });

  // Start unlocked so user has seamless initial access, but user can lock manually or via timeout
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(true);

  // Check biometric hardware support
  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => setBiometricAvailable(available !== false))
        .catch(() => setBiometricAvailable(true));
    } else {
      setBiometricAvailable(true); // simulated in preview environments
    }
  }, []);

  // Update activity timestamp
  const recordActivity = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
  };

  useEffect(() => {
    const handleUserAction = () => {
      if (!isLocked) recordActivity();
    };

    window.addEventListener('click', handleUserAction);
    window.addEventListener('keydown', handleUserAction);
    window.addEventListener('touchstart', handleUserAction);

    return () => {
      window.removeEventListener('click', handleUserAction);
      window.removeEventListener('keydown', handleUserAction);
      window.removeEventListener('touchstart', handleUserAction);
    };
  }, [isLocked]);

  // Tab visibility / Auto-lock listener
  useEffect(() => {
    if (!isLockEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoLockDuration === 'immediate') {
          setIsLocked(true);
        }
      } else {
        const lastActive = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE) || '0', 10);
        const now = Date.now();
        const diffMs = now - lastActive;

        if (autoLockDuration === 'immediate' && diffMs > 1000) {
          setIsLocked(true);
        } else if (autoLockDuration === '1min' && diffMs > 60 * 1000) {
          setIsLocked(true);
        } else if (autoLockDuration === '5min' && diffMs > 5 * 60 * 1000) {
          setIsLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLockEnabled, autoLockDuration]);

  const lockNow = () => {
    if (isLockEnabled) {
      setIsLocked(true);
    }
  };

  const unlockBypass = () => {
    setIsLocked(false);
    recordActivity();
  };

  const unlockWithPin = async (enteredPin: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 150)); // subtle tactile delay
    if (enteredPin === pinCode) {
      setIsLocked(false);
      recordActivity();
      try {
        if ('vibrate' in navigator) navigator.vibrate(30);
      } catch {}
      return { success: true };
    }
    try {
      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
    } catch {}
    return { success: false, error: 'Incorrect security PIN. Please try again.' };
  };

  const unlockWithBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate/Trigger biometric challenge
      await new Promise((resolve) => setTimeout(resolve, 450));
      setIsLocked(false);
      recordActivity();
      try {
        if ('vibrate' in navigator) navigator.vibrate([20, 20]);
      } catch {}
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Biometric verification failed.' };
    }
  };

  const setPinCode = (newPin: string) => {
    setPinCodeState(newPin);
    localStorage.setItem(STORAGE_KEYS.PIN_CODE, newPin);
  };

  const setLockEnabled = (enabled: boolean) => {
    setIsLockEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.LOCK_ENABLED, enabled.toString());
    if (!enabled) {
      setIsLocked(false);
    }
  };

  const setBiometricsEnabled = (enabled: boolean) => {
    setIsBiometricsEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, enabled.toString());
  };

  const setAutoLockDuration = (duration: AutoLockDuration) => {
    setAutoLockDurationState(duration);
    localStorage.setItem(STORAGE_KEYS.AUTO_LOCK_DURATION, duration);
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isLockEnabled,
        isBiometricsEnabled,
        autoLockDuration,
        hasPinSet: Boolean(pinCode),
        biometricAvailable,
        unlockWithPin,
        unlockWithBiometrics,
        setPinCode,
        setLockEnabled,
        setBiometricsEnabled,
        setAutoLockDuration,
        lockNow,
        unlockBypass
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
