import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles';

interface PinSetupPageProps {
  onComplete: () => void;
}

const PinSetupPage: React.FC<PinSetupPageProps> = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      localStorage.setItem('userPin', pin);
      onComplete();
      navigate('/wallet');
    } else {
      setError('PIN must be exactly 6 digits');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPin(value); // Allow only numeric input
      setError(null); // Clear error on valid input
    }
  };

  return (
    <div style={styles.container}>
      {/* Logo */}
      <img
        src="/assets/logo.png" // Update the path to your logo image
        alt="Logo"
        style={styles.logo}
      />

      {/* Header */}
      <h2 style={styles.header}>Set Your PIN for Registration</h2>

      {/* PIN Input */}
      <input
        type="password"
        maxLength={6}
        value={pin}
        onChange={handleInputChange}
        placeholder="Enter 6-digit PIN"
        aria-label="Enter your 6-digit PIN"
        style={styles.input}
        autoFocus
      />

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={handleSubmit} style={styles.submitButton}>
        Submit
      </button>
    </div>
  );
};

export default PinSetupPage;
