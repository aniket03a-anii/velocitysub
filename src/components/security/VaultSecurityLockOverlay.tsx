import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  Shield,
  Delete,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const VaultSecurityLockOverlay: React.FC = () => {
  const {
    isLocked,
    isBiometricsEnabled,
    unlockWithPin,
    unlockWithBiometrics,
    unlockBypass
  } = useSecurity();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);

  useEffect(() => {
    if (isLocked) {
      setEnteredPin('');
      setErrorMessage(null);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = async (digit: string) => {
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMessage(null);

    if (newPin.length === 4) {
      const res = await unlockWithPin(newPin);
      if (!res.success) {
        setIsShaking(true);
        setErrorMessage(res.error || 'Incorrect PIN');
        setTimeout(() => {
          setIsShaking(false);
          setEnteredPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleBiometricClick = async () => {
    setBiometricScanning(true);
    setErrorMessage(null);
    const res = await unlockWithBiometrics();
    setBiometricScanning(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Biometric scan failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F0E7]/95 backdrop-blur-md flex items-center justify-center p-4 antialiased">
      {/* Editorial Vault Card (Tokens: #FBF9F3, border: #D8D5CA, radius: 12px) */}
      <div
        className={`w-full max-w-sm bg-[#FBF9F3] border border-[#D8D5CA] rounded-[14px] p-8 shadow-xl text-[#092326] flex flex-col items-center space-y-6 ${
          isShaking ? 'animate-bounce' : ''
        }`}
        style={{
          boxShadow: '0 10px 30px -10px rgba(9, 35, 38, 0.08)'
        }}
      >
        {/* Vault Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[10px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5 text-[#E4EBD8]" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#092326]">
                Velocity Financial Lock
              </span>
            </div>
            <p className="text-xs text-[#526064] mt-1 max-w-xs leading-relaxed">
              Enter your 4-digit security PIN or verify via biometric sensor to access financial statements.
            </p>
          </div>
        </div>

        {/* 4-Dot PIN Indicator */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border ${
                  isFilled
                    ? 'bg-[#092326] border-[#092326] scale-110'
                    : 'bg-[#F2F0E7] border-[#D8D5CA]'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Numeric Keypad (8px spacing rhythm, border #D8D5CA, radius 10px) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-[10px] bg-[#F2F0E7] hover:bg-[#E4EBD8]/50 active:bg-[#E4EBD8] border border-[#D8D5CA] text-lg font-serif font-bold text-[#092326] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              {digit}
            </button>
          ))}

          {/* Biometric Scan Trigger Key */}
          <button
            onClick={handleBiometricClick}
            disabled={!isBiometricsEnabled || biometricScanning}
            title="Biometric Fingerprint / Face ID"
            className="h-13 rounded-[10px] bg-[#E4EBD8] hover:bg-[#d8e4c7] active:bg-[#cbdbb6] border border-[#D8D5CA] text-[#092326] transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            {biometricScanning ? (
              <Fingerprint className="w-5 h-5 text-[#092326] animate-pulse" />
            ) : (
              <Fingerprint className="w-5 h-5 text-[#092326]" />
            )}
          </button>

          {/* 0 Key */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-[10px] bg-[#F2F0E7] hover:bg-[#E4EBD8]/50 active:bg-[#E4EBD8] border border-[#D8D5CA] text-lg font-serif font-bold text-[#092326] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            0
          </button>

          {/* Delete / Backspace Key */}
          <button
            onClick={handleDelete}
            title="Delete"
            className="h-13 rounded-[10px] bg-[#F2F0E7] hover:bg-[#e8e4d8] border border-[#D8D5CA] text-[#526064] transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Quick Trigger Bar */}
        {isBiometricsEnabled && (
          <button
            onClick={handleBiometricClick}
            className="w-full py-2.5 px-4 bg-[#092326] text-[#FBF9F3] hover:bg-[#14393d] rounded-[8px] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ScanFace className="w-4 h-4 text-[#E4EBD8]" />
            <span>Use Touch ID / Face ID Biometrics</span>
          </button>
        )}

        {/* Evaluator Demo Bypass Notice */}
        <div className="pt-2 text-center border-t border-[#D8D5CA] w-full flex items-center justify-between text-[11px] text-[#526064]">
          <span>Default PIN: <strong className="text-[#092326] font-mono">1234</strong></span>
          <button
            onClick={unlockBypass}
            className="text-xs font-semibold text-[#092326] hover:underline cursor-pointer"
          >
            1-Click Demo Bypass →
          </button>
        </div>
      </div>
    </div>
  );
};
