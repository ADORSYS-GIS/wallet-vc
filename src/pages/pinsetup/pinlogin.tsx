import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
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
  const [showPin, setShowPin] = useState(false);
  const navigate = useNavigate();

  const isConfirmValid = inputPin === requiredPin;

  const handleSubmit = () => {
    if (isConfirmValid) {
      setError(null);
      onLogin();
      navigate('/');
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
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
      padding={3}
      sx={{ backgroundColor: '#F4F7FC', textAlign: 'center' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
          padding: { xs: '20px', sm: '40px' },
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo Image */}
        <Avatar
          alt="Secure Login"
          src="/assets/security.png"
          sx={{ width: 80, height: 80, marginBottom: 2 }}
        />

        {/* Title */}
        <Typography variant="h5" fontWeight="bold" marginBottom={2}>
          Unlock Your{' '}
          <Box component="span" sx={{ color: '#007BFF' }}>
            Wallet
          </Box>
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            maxWidth: '80%',
            lineHeight: 1.5,
            marginBottom: 3,
          }}
        >
          Enter your 6-digit PIN to access your wallet securely.
        </Typography>

        {/* PIN Input Field */}
        <TextField
          fullWidth
          type={showPin ? 'text' : 'password'}
          label="Enter PIN"
          value={inputPin}
          onChange={handleInputChange}
          error={!!error}
          helperText={error || ' '}
          sx={{ marginBottom: 2, minWidth: '280px' }}
          slotProps={{
            input: {
              endAdornment: (
                <IconButton
                  onClick={() => setShowPin(!showPin)}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            },
          }}
        />

        {/* Login Button */}
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={inputPin.length !== 6}
          sx={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'none',
            backgroundColor: inputPin.length === 6 ? '#007BFF' : '#ccc',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: inputPin.length === 6 ? '#0056b3' : '#ccc',
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default PinLoginPage;
