import React, { createContext, useContext, useEffect, useState } from 'react';

interface PinContextType {
  hasSetPin: boolean;
  setHasSetPin: (value: boolean) => void;
  checkPin: () => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getInitialPinState = () => {
    // Check both WebAuthn storage and localStorage
    const pinObj = localStorage.getItem('web-auth:pin');
    const hasPin = localStorage.getItem('hasSetPin') === 'true';
    return hasPin || pinObj !== null;
  };

  const [hasSetPin, setHasSetPin] = useState(getInitialPinState);

  // Function to check if PIN is set
  const checkPin = () => {
    const pinObj = localStorage.getItem('web-auth:pin');
    const hasPin = localStorage.getItem('hasSetPin') === 'true';
    const newState = hasPin || pinObj !== null;
    setHasSetPin(newState);
    localStorage.setItem('hasSetPin', newState.toString());
  };

  // Update localStorage when hasSetPin changes
  useEffect(() => {
    localStorage.setItem('hasSetPin', hasSetPin.toString());
  }, [hasSetPin]);

  useEffect(() => {
    checkPin();
    // Listen for storage changes (multi-tab support)
    const handler = () => checkPin();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <PinContext.Provider value={{ hasSetPin, setHasSetPin, checkPin }}>
      {children}
    </PinContext.Provider>
  );
};

export const usePin = () => {
  const context = useContext(PinContext);
  if (!context) throw new Error('usePin must be used within a PinProvider');
  return context;
};
