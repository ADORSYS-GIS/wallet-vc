import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  Theme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { QrScanner } from '@adorsys-gis/qr-scanner';

const ScanContact: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const push = useNavigate();

  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const handleScan = (data: string) => {
    if (!data.startsWith('did:peer:')) {
      setError('Invalid DID format.');
      return;
    }
    setError(null);

    // Navigate to AddContactForm with scanned DID
    push('/add-contact', { state: { scannedDid: data } });
  };

  return (
    <Box
      display="flex"
      width="100%"
      height="100vh"
      sx={{ paddingTop: { xs: '10px', sm: '10px' } }}
    >
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

      <QrScanner
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
    </Box>
  );
};

export default ScanContact;
