import {
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const contactService = new ContactService(eventBus);

interface AddContactFormProps {
  initialScannedDid?: string | null;
  onClose?: () => void;
}

const AddContactForm: React.FC<AddContactFormProps> = ({
  initialScannedDid,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Use initialScannedDid if provided, otherwise fall back to location.state
  const scannedDid = initialScannedDid || location.state?.scannedDid || '';

  const [name, setName] = useState('');
  const [did, setDid] = useState(scannedDid);
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  useEffect(() => {
    const handleContactCreated = (response: ServiceResponse<void>) => {
      setIsLoading(false);
      if (response.status === ServiceResponseStatus.Success) {
        setMessage('✅ Contact added successfully!');
        setDid('');
        setName('');
        setOpenSnackbar(true);

        // If onClose is provided (modal context), close the modal; otherwise, navigate
        setTimeout(() => {
          if (onClose) {
            onClose();
          } else {
            navigate('/contacts');
          }
        }, 3000);
      } else {
        setMessage(`❗ Failed to add contact: ${response.payload}`);
        setOpenSnackbar(true);
      }
    };

    eventBus.on(ContactEventChannel.CreateContact, handleContactCreated);

    return () => {
      eventBus.off(ContactEventChannel.CreateContact, handleContactCreated);
    };
  }, [navigate, onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    contactService.createContact({ name, did });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      justifyContent="center"
      sx={{ textAlign: 'center', padding: 3 }}
    >
      <Typography variant="h5" sx={{ color: '#4A4A4A', marginBottom: '16px' }}>
        Add Contact
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          label="Contact Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: '16px' }}
          required
        />
        <TextField
          label="Contact DID"
          variant="outlined"
          fullWidth
          value={did}
          onChange={(e) => setDid(e.target.value)}
          disabled={!!scannedDid}
          sx={{ marginBottom: '16px' }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
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
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Add Contact'
          )}
        </Button>
      </form>

      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={message}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{
          sx: {
            backgroundColor: message?.startsWith('✅') ? '#0063F7' : '#FF4D4F',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '8px 16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </Box>
  );
};

export default AddContactForm;
