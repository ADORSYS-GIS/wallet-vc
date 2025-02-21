import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation, useNavigate } from 'react-router-dom';
import { SnackbarCloseReason } from '@mui/material/Snackbar';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || null;
  const error = location.state?.error ?? null;
  const routingkey = result?.mediatorRoutingKey;

  const validRoutingKey =
    typeof routingkey === 'string' && routingkey.length > 0 ? routingkey : null;

  const qrLink = validRoutingKey
    ? `${window.location.origin}/qr?key=${encodeURIComponent(routingkey)}`
    : null;

  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCloseSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrLink ?? '');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Routing Key',
          text:
            'Scan your routing key to proceed with messaging. Routing Key: ' +
            routingkey,
          url: qrLink ?? undefined,
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    } else {
      setFallbackOpen(true);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" color="primary">
        {result ? 'Success!' : 'Failure'}
      </Typography>

      {!result && error && (
        <Typography variant="body1" mt={2} color="textSecondary">
          {error}
        </Typography>
      )}

      {result && validRoutingKey && (
        <>
          <Typography variant="body1">
            Scan your routing key to proceed with messaging
          </Typography>
          <Box mt={2}>
            <QRCode value={validRoutingKey} size={200} />
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={shareQRCode}
          >
            Share QR Code
          </Button>
        </>
      )}

      {!result && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/scan')}
        >
          Go Back
        </Button>
      )}
      <Dialog open={fallbackOpen} onClose={() => setFallbackOpen(false)}>
        <DialogTitle>Manual Share</DialogTitle>
        <DialogContent>
          <Typography>
            You can copy the link below and share it manually.
          </Typography>
          <Box mt={2} display="flex" alignItems="center">
            <TextField
              variant="outlined"
              value={qrLink ?? ''}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={copyLinkToClipboard}
              sx={{ ml: 1 }}
            >
              Copy Link
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFallbackOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Routing Key copied to clipboard"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SuccessPage;
