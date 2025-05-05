import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, getPin } from '../../utils/auth';

interface PinLoginPageProps {
  onLogin: () => void;
}

const PinLoginPage: React.FC<PinLoginPageProps> = ({ onLogin }) => {
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (inputPin.length !== 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const messages = await authenticateUser();

      // Check if messages is valid
      if (!messages || (Array.isArray(messages) && messages.length === 0)) {
        setError('Authentication failed or was canceled. Please try again.');
        return;
      }

      const storedPin = getPin(messages);

      if (!storedPin) {
        setError('No PIN set up or invalid PIN data. Please register.');
        return;
      }

      if (inputPin !== storedPin) {
        setError('Invalid PIN. Please try again.');
        return;
      }

      setError(null);
      onLogin();
      navigate('/');
      setInputPin('');
    } catch (err) {
      if (err instanceof Error) {
        if (
          (err instanceof DOMException && err.name === 'NotAllowedError') ||
          err.name === 'AbortError' ||
          err.message.includes('canceled')
        ) {
          setError('Authentication canceled. Please try again.');
        } else {
          setError(`Login failed: ${err.message}`);
        }
      } else {
        setError('Authentication failed: An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setInputPin(value);
      setError(null);
    }
  };

  // reset the PIN or navigate back
  const handleResetPin = () => {
    // Clear the stored PIN and redirect to the PIN setup page
    localStorage.removeItem('messages');
    localStorage.removeItem('credentialId');
    localStorage.removeItem('registrationSalt');
    localStorage.removeItem('mediatorDid');
    navigate('/setup-pin', { replace: true });
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
          disabled={isLoading || inputPin.length !== 6}
          sx={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'none',
            backgroundColor:
              inputPin.length === 6 && !isLoading ? '#007BFF' : '#ccc',
            transition: '0.3s',
            '&:hover': {
              backgroundColor:
                inputPin.length === 6 && !isLoading ? '#0056b3' : '#ccc',
            },
            marginBottom: 2, // Add some spacing for the reset link
          }}
        >
          {isLoading ? 'Authenticating...' : 'Login'}
        </Button>

        {/* Optional: Add a link to reset the PIN */}
        <Link
          component="button"
          variant="body2"
          onClick={handleResetPin}
          sx={{
            color: '#007BFF',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Forgot PIN? Reset it
        </Link>

        {/* Hidden elements to satisfy library DOM requirements */}
        <div id="messageList" style={{ display: 'none' }}></div>
        <div id="error" style={{ display: 'none' }}></div>
      </Box>
    </Box>
  );
};

export default PinLoginPage;
