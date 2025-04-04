import EventSharpIcon from '@mui/icons-material/EventSharp';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Alert,
  Box,
  Dialog,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import jsQR from 'jsqr';
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import AddContactForm from '../pages/contact/AddContactForm';

const Settings: React.FC = () => {
  const [logoutMessage, setLogoutMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [scannedDid, setScannedDid] = useState<string | null>(null);

  // Ref to access the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    sessionStorage.clear();
    setLogoutMessage(true);
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setErrorMessage('No file selected. Please choose an image.');
      return;
    }

    // Create a new Image object for each upload to avoid caching issues
    const img = new Image();
    let objectUrl: string | null = null;

    img.onload = () => {
      console.log('Image loaded successfully:', img.width, 'x', img.height);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        console.log('Failed to create canvas context');
        setErrorMessage(
          'Failed to create canvas context for QR code scanning.',
        );
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth', // Try both normal and inverted colors
      });

      if (!qrCode) {
        setErrorMessage(
          'Unable to scan QR code. Please try a different image.',
        );
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      const qrData = qrCode.data;

      if (!qrData) {
        setErrorMessage('No data found in QR code.');
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      if (!qrData.startsWith('did:peer:')) {
        setErrorMessage(
          'Invalid QR code format. Please upload a valid identity QR code.',
        );
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      setScannedDid(qrData);
      setOpenModal(true);

      if (objectUrl) URL.revokeObjectURL(objectUrl);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.onerror = () => {
      setErrorMessage(
        'Error loading image. Please try again with a different image.',
      );
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      // Reset the file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setScannedDid(null);

    // Reset the file input when the modal closes
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        maxWidth: { xs: '100%', sm: 600, md: 800 },
        margin: '0 auto',
        padding: 2,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          marginBottom: 5,
          textAlign: 'center',
          color: '#333',
        }}
      >
        Settings
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        <NavLink to="/share-identity" style={{ textDecoration: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton sx={{ fontSize: 40, color: '#0063F7' }}>
              <ShareSharpIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Share Identity
            </Typography>
          </Box>
        </NavLink>

        <NavLink to="/activities" style={{ textDecoration: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton sx={{ fontSize: 40, color: '#0063F7' }}>
              <EventSharpIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Activities
            </Typography>
          </Box>
        </NavLink>

        <Box sx={{ textAlign: 'center' }}>
          <label htmlFor="qr-upload">
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="qr-upload"
              type="file"
              onChange={handleQRUpload}
              ref={fileInputRef} // Attach the ref to the input
            />
            <IconButton
              component="span"
              sx={{ fontSize: 40, color: '#0063F7' }}
            >
              <UploadIcon />
            </IconButton>
          </label>
          <Typography variant="body2" sx={{ color: '#333' }}>
            Upload QR
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            color="primary"
            onClick={handleLogout}
            sx={{
              fontSize: 40,
              color: '#0063F7',
              '&:hover': {
                backgroundColor: 'rgba(0, 99, 247, 0.1)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: '#333' }}>
            Logout
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={logoutMessage}
        autoHideDuration={3000}
        onClose={() => setLogoutMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLogoutMessage(false)}
          severity="success"
          sx={{
            width: '100%',
            backgroundColor: '#0063F7',
            color: 'white',
            fontWeight: 600,
            padding: '10px',
            borderRadius: '5px',
            boxShadow: 2,
          }}
        >
          Logout successful!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{
            width: '100%',
            backgroundColor: '#f44336',
            color: 'white',
            fontWeight: 600,
            padding: '10px',
            borderRadius: '5px',
            boxShadow: 2,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Modal for AddContactForm */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        {/* Rendering modal */}
        <AddContactForm
          initialScannedDid={scannedDid}
          onClose={handleCloseModal}
        />
      </Dialog>
    </Box>
  );
};

export default Settings;
