import EventSharpIcon from '@mui/icons-material/EventSharp';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Alert,
  Box,
  Button, // Add Button for dialog actions
  Dialog,
  DialogActions, // Add DialogActions for dialog buttons
  DialogContent, // Add DialogContent for dialog text
  DialogContentText, // Add DialogContentText for dialog message
  DialogTitle, // Add DialogTitle for dialog title
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import jsQR from 'jsqr';
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import AddContactForm from '../pages/contact/AddContactForm';
import { useAuth } from '../utils/AuthContext';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [scannedDid, setScannedDid] = useState<string | null>(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false); // State for logout confirmation dialog

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open the logout confirmation dialog
  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
  };

  // Close the logout confirmation dialog
  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  // Handle logout confirmation (Yes button)
  const handleConfirmLogout = () => {
    setOpenLogoutDialog(false); // Close the dialog
    logout(); // Proceed with logout
  };

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setErrorMessage('No file selected. Please choose an image.');
      return;
    }

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
        inversionAttempts: 'attemptBoth',
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
              ref={fileInputRef}
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
            onClick={handleOpenLogoutDialog} // Open the dialog instead of logging out directly
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
        <AddContactForm
          initialScannedDid={scannedDid}
          onClose={handleCloseModal}
        />
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogoutDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
