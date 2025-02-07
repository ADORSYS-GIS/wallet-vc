import { Avatar, Box, Button, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PinSetupPageProps {
  onComplete: (pin: string) => void;
}

const PinSetupPage: React.FC<PinSetupPageProps> = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      localStorage.setItem('userPin', pin);
      onComplete(pin);
      navigate('/wallet');
    } else {
      setError('PIN must be exactly 6 digits');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      if (value.length === 6) setError(null);
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
      {/* Image (Same style as Onboarding Page) */}
      <Avatar
        alt="Secure PIN"
        src="/assets/security.png"
        sx={{
          width: { xs: 250, sm: 300, md: 350 },
          height: { xs: 250, sm: 300, md: 350 },
          marginTop: '-40px',
        }}
      />

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
        Secure Your Wallet
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
        Set a 6-digit PIN to keep your wallet secure.
      </Typography>

      {/* PIN Input Field */}
      <TextField
        type="password"
        value={pin}
        onChange={handleInputChange}
        placeholder="Enter 6-digit PIN"
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

      {/* Submit Button (Styled like Onboarding Page) */}
      <Button
        onClick={handleSubmit}
        variant="contained"
        fullWidth
        disabled={pin.length !== 6}
        sx={{
          padding: '14px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px',
          textTransform: 'none',
          maxWidth: '280px',
          backgroundColor: pin.length === 6 ? '#007BFF' : '#ccc',
        }}
      >
        Set PIN
      </Button>
    </Box>
  );
};

export default PinSetupPage;
