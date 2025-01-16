import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container } from '@mui/material';

interface PinSetupPageProps {
  onComplete: (pin: string) => void;
}

const PinSetupPage: React.FC<PinSetupPageProps> = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Tempory function on pin storage. Will be changed in the future
  const handleSubmit = () => {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      localStorage.setItem('userPin', pin); // Save PIN to localStorage
      onComplete(pin); // Pass the PIN to onComplete
      navigate('/wallet'); // Navigate to the wallet page
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
    <Container
      maxWidth="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <img src="/assets/logo.png" alt="Logo" style={{ marginBottom: '10px' }} />

      {/* Header */}
      <Typography
        variant="h5"
        style={{ marginBottom: '20px', fontWeight: 'bold' }}
      >
        Set Your PIN for Registration
      </Typography>

      {/* PIN Input */}
      <TextField
        type="password"
        value={pin}
        onChange={handleInputChange}
        placeholder="Enter 6-digit PIN"
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error}
        style={{
          marginBottom: '20px',
        }}
        slotProps={{
          htmlInput: {
            maxLength: 6,
            style: {
              textAlign: 'center',
            },
          },
        }}
      />

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        fullWidth
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '5px',
        }}
      >
        Submit
      </Button>
    </Container>
  );
};

export default PinSetupPage;
