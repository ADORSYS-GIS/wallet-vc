import { QrScanner } from '@adorsys-gis/qr-scanner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  CircularProgress,
  IconButton,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityService } from '@adorsys-gis/multiple-did-identities';
import { DidService } from '@adorsys-gis/contact-exchange';
import { EventEmitter } from 'eventemitter3';

interface ScanQRCodeProps {
  onScanSuccess?: (data: string) => void;
  onBack?: () => void;
}

interface ProcessMediatorOOBResult {
  status: string; // "true" for success or "false" for error
  message: string;
}

const ScanQRCode: React.FC<ScanQRCodeProps> = ({ onScanSuccess, onBack }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const push = useNavigate();
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const handleScan = async (data: string) => {
    setError(null);
    setIsLoading(true);

    try {
      if (data.includes('_oob=')) {
        const url = new URL(data);
        const oobEncoded = url.searchParams.get('_oob');
        if (!oobEncoded) {
          throw new Error('Invalid OOB invitation. Missing encoded payload.');
        }

        const credentialOffer = data;
        const eventBus = new EventEmitter();
        const securityService = new SecurityService();
        const didService = new DidService(eventBus, securityService);

        const rawResult = await didService.processMediatorOOB(credentialOffer);
        const result = rawResult as ProcessMediatorOOBResult;

        if (result.status === 'true') {
          if (onScanSuccess) {
            onScanSuccess(credentialOffer);
          } else {
            push('/success', { state: { result } });
          }
        } else {
          setError(result.message || 'Unknown error from backend');
        }
      } else if (data.startsWith('did:peer:')) {
        push('/add-contact', { state: { scannedDid: data } });
      } else {
        setError('Unrecognized QR code format.');
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'An error occurred while processing the scanned data.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" width="100%" height="100vh" sx={{ paddingTop: '10px' }}>
      <Tooltip arrow title="Back">
        <IconButton
          size="small"
          onClick={onBack || (() => push('/'))}
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

      {isLoading && (
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      <QrScanner
        facingMode="environment"
        scanDelay={500}
        onResult={(result: string) => {
          handleScan(result);
        }}
        onError={(err: unknown) => {
          console.error('QR Scanner encountered an error:', err);
          setIsLoading(false);
          setError(
            err instanceof Error ? err.message : 'An unknown error occurred.',
          );
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

export default ScanQRCode;
