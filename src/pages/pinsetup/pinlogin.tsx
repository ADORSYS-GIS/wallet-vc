import { Avatar, Box, Button, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (inputPin === requiredPin) {
      setError(null);
      onLogin();
      navigate('/wallet');
    } else {
      setError('Invalid PIN. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setInputPin(value);
      setError(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F4F7FC',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo Image */}
      <Avatar
        alt="Secure Login"
        src="/assets/security.png"
        sx={{
          width: { xs: 250, sm: 300, md: 350 },
          height: { xs: 250, sm: 300, md: 350 },
          marginTop: '-40px',
        }}
      />

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
        Unlock Your Wallet
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          color: '#555',
          maxWidth: '80%',
          lineHeight: 1.5,
          marginBottom: '15px',
        }}
      >
        Enter your 6-digit PIN to access your wallet securely.
      </Typography>

      {/* PIN Input Field */}
      <TextField
        type="password"
        value={inputPin}
        onChange={handleInputChange}
        placeholder="Enter PIN"
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error || ' '}
        slotProps={{
          htmlInput: {
            maxLength: 6,
            style: {
              textAlign: 'center',
              fontSize: '20px',
              letterSpacing: '3px',
            },
          },
        }}
        sx={{
          maxWidth: '280px',
          mb: 3,
        }}
      />

      {/* Login Button */}
      <Button
        onClick={handleSubmit}
        variant="contained"
        fullWidth
        disabled={inputPin.length !== 6}
        sx={{
          padding: '14px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px',
          textTransform: 'none',
          maxWidth: '280px',
          backgroundColor: inputPin.length === 6 ? '#007BFF' : '#ccc',
        }}
      >
        Login
      </Button>
    </Box>
  );
};

export default PinLoginPage;
