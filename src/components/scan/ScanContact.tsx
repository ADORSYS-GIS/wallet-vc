import {
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import { QrScanner } from '@adorsys-gis/qr-scanner';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Initialize the ContactService
const contactService = new ContactService(eventBus);

const ScanContact: React.FC = () => {
  const [did, setDid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [scanning, setScanning] = useState(true);
  const push = useNavigate();

  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  // Handle success or error responses
  useEffect(() => {
    const handleContactCreated = (response: ServiceResponse<void>) => {
      setIsLoading(false);
      if (response.status === ServiceResponseStatus.Success) {
        setMessage('Contact added successfully!');
        setDid(null);
        setName('');
        setOpenSnackbar(true);
        setScanning(false); // Stop scanning after contact is added

        // Wait for Snackbar to show before navigating
        setTimeout(() => {
          push('/contacts');
        }, 2000);
      } else {
        setMessage(`Failed to add contact: ${response.payload}`);
        setOpenSnackbar(true);
      }
    };

    // Listen to CreateContact events
    eventBus.on(ContactEventChannel.CreateContact, handleContactCreated);

    // Cleanup event listener on unmount
    return () => {
      eventBus.off(ContactEventChannel.CreateContact, handleContactCreated);
    };
  }, []);

  const handleScan = (data: string) => {
    if (!data.startsWith('did:peer:')) {
      setError('Invalid DID format.');
      return;
    }
    setDid(data);
    setScanning(false); // Stop scanning after a valid scan
    setError(null);
  };

  const handleAddContact = () => {
    if (!did || !name) {
      setMessage('Both DID and name are required.');
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    contactService.createContact({ did, name });
  };

  return (
    <Box
      display="flex"
      width="100%"
      height="100vh"
      sx={{
        paddingTop: {
          xs: '10px',
          sm: '10px',
        },
      }}
    >
      {scanning ? (
        <>
          {/* Back Arrow Button */}
          <Tooltip arrow title="Back">
            <IconButton
              size="small"
              onClick={() => push('/')}
              sx={{
                position: 'absolute',
                top: isSmallScreen ? 70 : 110,
                left: 15,
                color: 'primary.main',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {/* QR Scanner */}
          <QrScanner
            key={did} // Force reinitialization when DID changes
            onResult={handleScan}
            onError={(err: unknown) => {
              if (err instanceof Error) {
                setError(err.message);
              } else {
                setError('An unknown error occurred.');
              }
            }}
          />

          {error && (
            <Typography color="error" sx={{ position: 'absolute', top: 10 }}>
              {error}
            </Typography>
          )}
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddContact();
          }}
          style={{ width: '100%' }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            height="100vh"
            sx={{ textAlign: 'center' }}
          >
            {/* Scanned DID in an Input field */}
            <TextField
              label="Scanned DID"
              variant="outlined"
              value={did || ''}
              disabled
              fullWidth
              sx={{ marginBottom: '16px' }}
            />
            <TextField
              label="Contact Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!name && isLoading}
              helperText={!name && isLoading ? 'Name is required' : ''}
              fullWidth
              sx={{ marginBottom: '16px' }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                padding: '12px',
                backgroundColor: '#0063F7',
                color: 'white',
                borderRadius: '8px',
                fontSize: isSmallScreen ? '14px' : '16px',
                '&:disabled': {
                  backgroundColor: '#8A8A8A',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Add Contact'
              )}
            </Button>
          </Box>
        </form>
      )}

      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={message}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: '10%' }}
      />
    </Box>
  );
};

export default ScanContact;
