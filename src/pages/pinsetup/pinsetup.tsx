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
import { registerUser, storePin } from '../../utils/auth';
import { usePin } from '../../utils/PinContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const { checkPin } = usePin();

  const isPinValid = pin.length === 6;
  const isConfirmValid = confirmPin.length === 6 && pin === confirmPin;
  const isFormValid = isPinValid && isConfirmValid;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setConfirmError('PINs do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting WebAuthn registration...');
      await registerUser();
      console.log('Registration complete. Starting PIN storage...');

      await storePin(pin);
      console.log('PIN stored successfully');

      // Set PIN state in localStorage
      localStorage.setItem('hasSetPin', 'true');
      checkPin();
      onComplete(pin);
    } catch (err) {
      // Handle WebAuthn cancellation specifically
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Registration canceled. Please try again.');
      } else if (
        err instanceof Error &&
        err.message.includes('Credential ID or registration salt not stored')
      ) {
        // Handle the specific case where registration fails due to missing credentialId/registrationSalt
        setError('Registration failed. Please try again.');
      } else {
        // Handle other errors with a generic user-friendly message
        setError('Failed to set up PIN. Please try again.');
      }
      console.error('Pin setup error:', err);
    } finally {
      setIsLoading(false);
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
      setConfirmError(
        value.length === 6 && value !== pin ? 'PINs do not match' : null,
      );
    }
  };

  return (
    <>
      {/* Always render these elements to ensure they're available for WebAuthn library */}
      <div id="messageList" style={{ display: 'none' }}></div>
      <div id="error" style={{ display: 'none' }}></div>

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
            background: 'white',
            padding: { xs: '20px', sm: '40px' },
            borderRadius: '10px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar
            alt="Secure PIN"
            src="/assets/security.png"
            sx={{ width: 80, height: 80, marginBottom: 2 }}
          />
          <Typography variant="h5" fontWeight="bold" marginBottom={1}>
            Secure Your{' '}
            <Box component="span" sx={{ color: '#007BFF' }}>
              Wallet
            </Box>
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            marginBottom={3}
            textAlign="center"
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

          <TextField
            fullWidth
            type={showConfirmPin ? 'text' : 'password'}
            label="Confirm PIN"
            value={confirmPin}
            onChange={handleConfirmPinChange}
            error={!!confirmError}
            helperText={confirmError || ' '}
            sx={{ marginBottom: 2, minWidth: '280px' }}
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
            disabled={!isFormValid || isLoading}
            sx={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: isFormValid && !isLoading ? '#007BFF' : '#ccc',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: isFormValid && !isLoading ? '#0056b3' : '#ccc',
              },
            }}
          >
            {isLoading ? 'Setting Up...' : 'Set PIN'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default PinSetupPage;
