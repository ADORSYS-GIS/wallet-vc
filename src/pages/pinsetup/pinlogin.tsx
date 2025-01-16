import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';

interface PinLoginPageProps {
  onLogin: () => void;
  requiredPin: string;
}

const PinLoginPage: React.FC<PinLoginPageProps> = ({
  onLogin,
  requiredPin,
}) => {
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (inputPin === requiredPin) {
      setError(null);
      onLogin(); // Call the login handler
    } else {
      setError('Invalid PIN. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputPin(value); // Only allow numeric input
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
        Enter Your PIN
      </Typography>

      {/* PIN Input */}
      <TextField
        type="password"
        value={inputPin}
        onChange={handleInputChange}
        placeholder="Enter PIN"
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
        Login
      </Button>
    </Container>
  );
};

export default PinLoginPage;
