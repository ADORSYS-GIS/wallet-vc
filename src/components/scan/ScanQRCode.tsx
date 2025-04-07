import { DidService } from '@adorsys-gis/contact-exchange';
import { SecurityService } from '@adorsys-gis/multiple-did-identities';
import { QrScanner } from '@adorsys-gis/qr-scanner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { EventEmitter } from 'eventemitter3';
import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecryptedPin } from '../../utils/auth';

interface ScanQRCodeProps {
  onScanSuccess?: (data: string) => void;
  onBack?: () => void;
}

const ScanQRCode: React.FC<ScanQRCodeProps> = ({ onScanSuccess, onBack }) => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down('sm'),
  );

  // Authentication states
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [authStatus, setAuthStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [authMessage, setAuthMessage] = useState('Starting authentication...');
  const authInProgress = useRef(false);

  // Application states
  const [error, setError] = useState<string | null>(null);
  const [secretPinNumber, setSecretPinNumber] = useState<number | null>(null);

  // Services
  const eventBus = useMemo(() => new EventEmitter(), []);
  const securityService = useMemo(() => new SecurityService(), []);
  const didService = useMemo(() => {
    if (secretPinNumber === null) return null;
    return new DidService(eventBus, securityService, secretPinNumber);
  }, [eventBus, securityService, secretPinNumber]);

  // Handle authentication cancellation
  const handleAuthCancel = () => {
    setAuthStatus('error');
    setAuthMessage('Authentication canceled');
    setTimeout(() => {
      navigate('/', {
        state: { message: 'Authentication was canceled by user' },
      });
    }, 1000);
  };

  // Handle authentication continuation
  const handleAuthContinue = async () => {
    setShowAuthDialog(false);
    setAuthStatus('pending');
    setAuthMessage('Authenticating with WebAuthn...');
    authInProgress.current = true;

    try {
      const pin = await getDecryptedPin();
      if (!pin) throw new Error('No PIN found');

      const parsedPin = parseInt(pin, 10);
      if (isNaN(parsedPin)) throw new Error('Invalid PIN format');

      setSecretPinNumber(parsedPin);
      setAuthStatus('success');
      setAuthMessage('Authentication successful!');
    } catch (error) {
      setAuthStatus('error');
      setAuthMessage(
        error instanceof Error ? error.message : 'Authentication failed',
      );
      navigate('/', {
        state: {
          message:
            error instanceof Error ? error.message : 'Authentication failed',
        },
      });
    } finally {
      authInProgress.current = false;
    }
  };

  // Handle QR code scanning
  const handleScan = async (data: string) => {
    if (!didService) {
      setError('DID service not initialized');
      return;
    }
    setError(null);
    setAuthStatus('pending'); // Show the loader during QR code processing
    setAuthMessage('Processing QR code...');

    try {
      if (data.includes('_oob=')) {
        const credentialOffer = data;

        const rawResult = await didService.processMediatorOOB(credentialOffer);

        if (rawResult) {
          if (onScanSuccess) {
            onScanSuccess(credentialOffer);
          } else {
            navigate('/success', { state: { result: rawResult } });
          }
        } else {
          throw new Error('Operation failed');
        }
      } else if (data.startsWith('did:peer:')) {
        navigate('/add-contact', { state: { scannedDid: data } });
      } else {
        throw new Error('Unrecognized QR code format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scanning failed');
      setAuthStatus('error');
    } finally {
      setAuthStatus('success'); // Return to success state after processing
      setAuthMessage(''); // Clear the message
    }
  };

  return (
    <>
      {/* Hidden elements needed for WebAuthn */}
      <div id="messageList" style={{ display: 'none' }}></div>
      <div id="error" style={{ display: 'none' }}></div>

      {/* Authentication Confirmation Dialog */}
      <Dialog open={showAuthDialog} onClose={handleAuthCancel}>
        <DialogTitle>Authentication Required</DialogTitle>
        <DialogContent>
          <Typography>
            To access the scanning functionality, you need to authenticate. This
            will use your device's built-in security (like fingerprint or Face
            ID).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuthCancel} color="secondary">
            Cancel (Go Home)
          </Button>
          <Button onClick={handleAuthContinue} color="primary" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading/Authentication States */}
      {authStatus === 'pending' && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{authMessage}</Typography>
        </Box>
      )}

      {/* Main Content (only shown after successful auth) */}
      {authStatus === 'success' && (
        <Box
          display="flex"
          width="100%"
          height="100vh"
          sx={{ paddingTop: '10px' }}
        >
          <Tooltip arrow title="Back">
            <IconButton
              size="small"
              onClick={onBack || (() => navigate('/'))}
              sx={{
                position: 'absolute',
                top: isSmallScreen ? 80 : 130,
                left: 15,
                color: 'primary.main',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <QrScanner
            facingMode="environment"
            scanDelay={500}
            onResult={(result: string) => handleScan(result)}
            onError={(err: unknown) => {
              setAuthStatus('error');
              setError(err instanceof Error ? err.message : 'QR Scanner error');
            }}
          />

          {error && (
            <Typography color="error" sx={{ position: 'absolute', top: 10 }}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default ScanQRCode;
