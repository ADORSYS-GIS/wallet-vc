import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || null;
  const error = location.state?.error ?? null;
  const routingkey = result?.mediatorRoutingKey;

  const qrLink = `${window.location.origin}/qr?key=${encodeURIComponent(routingkey)}`;
  const [fallbackOpen, setfallbackOpen] = useState(false);

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrLink);
      alert('Routing key copied to clipboard!');
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
          url: qrLink,
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    } else {
      setfallbackOpen(true);
    }
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" color="primary">
        {result ? 'Success!' : 'Failure'}
      </Typography>
      <>
        <Typography variant="body1" mt={2} color="textSecondary">
          {result ? null : error}
        </Typography>
      </>

      {result && routingkey && (
        <>
          <Typography variant="body1">
            Scan your routing key to proceed with messaging
          </Typography>
          <Box mt={2}>
            <QRCode value={routingkey} size={200} />
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
      <Dialog open={fallbackOpen} onClose={() => setfallbackOpen(false)}>
        <DialogTitle>Manual Share</DialogTitle>
        <DialogContent>
          <Typography>
            You can copy the link below and share it manually.
          </Typography>
          <Box mt={2} display="flex" alignItems="center">
            <TextField
              variant="outlined"
              value={qrLink}
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
          <Button onClick={() => setfallbackOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuccessPage;
