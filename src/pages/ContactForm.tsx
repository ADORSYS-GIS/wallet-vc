import { ContactEventChannel, ContactService } from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import { ServiceResponse, ServiceResponseStatus } from '@adorsys-gis/status-service';
import { Box, Button, CircularProgress, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import React, { useEffect, useState } from 'react';

// Initialize the ContactService with eventBus
const contactService = new ContactService(eventBus);

const AddContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [did, setDid] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  useEffect(() => {
    const handleContactCreated = (response: ServiceResponse<void>) => {
      setIsLoading(false);
      if (response.status === ServiceResponseStatus.Success) {
        setMessage('Contact added successfully!');
        setName('');
        setDid('');
      } else {
        setMessage(`Failed to add contact: ${response.payload}`);
      }
    };

    // Listen to the CreateContact event on the eventBus
    eventBus.on(ContactEventChannel.CreateContact, handleContactCreated);

    // Cleanup listener on unmount
    return () => {
      eventBus.off(ContactEventChannel.CreateContact, handleContactCreated);
    };
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    // Call the service to create a new contact
    contactService.createContact({ name, did });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#F4F7FC',
        padding: isSmallScreen ? '16px' : '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
        maxWidth: '400px',
        width: 'auto',
        margin: '20px auto',
      }}
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
        />
        <TextField
          label="Contact DID"
          variant="outlined"
          fullWidth
          value={did}
          onChange={(e) => setDid(e.target.value)}
          sx={{ marginBottom: '16px' }}
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
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Contact'}
        </Button>
      </form>
      {message && (
        <Typography
          sx={{
            marginTop: '16px',
            color: message.startsWith('Failed') ? '#E74C3C' : '#27AE60',
            fontSize: isSmallScreen ? '14px' : '16px',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default AddContactForm;