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
import { authenticateUser, encryption, storage } from '../../utils/auth';

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
      // 1. Authenticate with WebAuthn using the helper
      const messages = await authenticateUser();
      if (!messages || messages.length === 0) {
        setError('WebAuthn authentication failed.');
        return;
      }

      // 2. Derive key using stored userHandle and salt
      const saltObj = await storage.get<string>('pin_salt');
      if (!saltObj || !saltObj.data) {
        setError('No salt found. Please register again.');
        return;
      }
      const salt = Uint8Array.from(atob(saltObj.data), c => c.charCodeAt(0));

      // Use the stored userHandle for key derivation
      const userHandleObj = await storage.get<string>('user_handle');
      if (!userHandleObj || !userHandleObj.data) {
        setError('No user handle found. Please register again.');
        return;
      }
      const userHandle = Uint8Array.from(atob(userHandleObj.data), c => c.charCodeAt(0)).buffer;
      const key = await encryption.generateKeyFromUserId(userHandle, salt);

      // 3. Get encrypted PIN
      const encryptedPinObj = await storage.get<ArrayBuffer>('pin');
      if (!encryptedPinObj || !encryptedPinObj.data) {
        setError('No PIN set up or invalid PIN data. Please register.');
        return;
      }

      // 4. Decrypt PIN
      const decryptedPin = await encryption.decryptData(encryptedPinObj.data, key);

      // 5. Compare
      if (inputPin !== decryptedPin) {
        setError('Invalid PIN. Please try again.');
        return;
      }

      setError(null);
      onLogin();
      // Wait for auth state to be updated before navigating
      setTimeout(() => {
        navigate('/wallet', { replace: true });
      }, 100);
      setInputPin('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Login failed: ${err.message}`);
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
            transition: '0.3s',
            '&:hover': {
              backgroundColor:
                inputPin.length === 6 && !isLoading ? '#0056b3' : '#ccc',
            },
          }}
        >
          {isLoading ? 'Authenticating...' : 'Login'}
        </Button>

        {/* Hidden elements to satisfy library DOM requirements */}
        <div id="messageList" style={{ display: 'none' }}></div>
        <div id="error" style={{ display: 'none' }}></div>
      </Box>
    </Box>
  );
};

export default PinLoginPage;
