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

interface PinSetupPageProps {
  onComplete: (pin: string) => void;
}

const PinSetupPage: React.FC<PinSetupPageProps> = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (pin.length === 6 && pin === confirmPin) {
      localStorage.setItem('userPin', pin);
      onComplete(pin);
      navigate('/login');
    } else {
      setConfirmError('PINs do not match');
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      setError(value.length === 6 ? null : 'PIN must be exactly 6 digits');
    }
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setConfirmPin(value);
      if (value.length === 6 && pin.length === 6 && value !== pin) {
        setConfirmError('PINs do not match');
      } else {
        setConfirmError(null);
      }
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
      sx={{
        backgroundColor: '#F4F7FC',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
          padding: '32px',
        }}
      >
        <Avatar
          alt="Secure PIN"
          src="/assets/security.png"
          sx={{ width: 100, height: 100, marginBottom: 2 }}
        />

        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 5 }}>
          Secure Your Wallet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            maxWidth: '80%',
            lineHeight: 1.5,
            marginBottom: 3,
          }}
        >
          Set a 6-digit PIN to keep your wallet secure.
        </Typography>

        <TextField
          fullWidth
          type={showPin ? 'text' : 'password'}
          label="PIN"
          value={pin}
          onChange={handlePinChange}
          error={!!error}
          helperText={error || ' '}
          sx={{ marginBottom: 2 }}
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

        <TextField
          fullWidth
          type={showConfirmPin ? 'text' : 'password'}
          label="Confirm PIN"
          value={confirmPin}
          onChange={handleConfirmPinChange}
          error={!!confirmError}
          helperText={confirmError || ' '}
          sx={{ marginBottom: 3 }}
          slotProps={{
            input: {
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showConfirmPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            },
          }}
        />

        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={
            pin.length !== 6 || confirmPin.length !== 6 || pin !== confirmPin
          }
          sx={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'none',
            backgroundColor:
              pin.length === 6 && pin === confirmPin ? '#007BFF' : '#ccc',
          }}
        >
          Set PIN
        </Button>
      </Box>
    </Box>
  );
};

export default PinSetupPage;
