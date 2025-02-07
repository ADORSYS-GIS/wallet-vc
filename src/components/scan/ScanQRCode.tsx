import { DidService } from '@adorsys-gis/contact-exchange';
import { SecurityService } from '@adorsys-gis/multiple-did-identities';
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
import { EventEmitter } from 'eventemitter3';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScanQRCodeProps {
  onScanSuccess?: (data: string) => void;
  onBack?: () => void;
}

interface ProcessMediatorOOBResult {
  status: string; // "true" for success or "false" for error
  message: string;
}

const base64UrlToBase64 = (base64Url: string): string => {
  return base64Url.replace(/-/g, '+').replace(/_/g, '/');
};

const ScanQRCode: React.FC<ScanQRCodeProps> = ({ onScanSuccess, onBack }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const push = useNavigate();
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const handleScan = async (data: string) => {
    console.log('Scanned data:', data);
    setError(null);
    setIsLoading(true);

    try {
      if (data.includes('_oob=')) {
        const credentialOffer = data;
        const base64UrlPart = data.split('_oob=')[1];

        const base64Data = base64UrlToBase64(base64UrlPart);

        const decodedCredencialOffer = Buffer.from(
          base64Data,
          'base64',
        ).toString();

        const eventBus = new EventEmitter();
        const securityService = new SecurityService();
        const didService = new DidService(eventBus, securityService);

        const rawResult = await didService.processMediatorOOB(
          decodedCredencialOffer,
        );

        const result = rawResult as ProcessMediatorOOBResult;

        if (result.status === 'true') {
          if (onScanSuccess) {
            onScanSuccess(credentialOffer);
          } else {
            sessionStorage.setItem('result', JSON.stringify(result));
            push('/success');
          }
        } else {
          setError(result.message);
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
