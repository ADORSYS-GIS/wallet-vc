import {
  Contact,
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const contactService = new ContactService(eventBus);

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openChat = (contactId: number | undefined) => {
    if (contactId) {
      navigate(`/chat/${contactId}`);
      setErrorMessage(null);
    } else {
      setErrorMessage('Contact ID is undefined.');
    }
  };

  useEffect(() => {
    const handleContactsFetched = (response: ServiceResponse<Contact[]>) => {
      if (response.status === ServiceResponseStatus.Success) {
        setContacts(response.payload);
        setErrorMessage(null);
      } else {
        setErrorMessage('Failed to fetch contacts.');
      }
    };

    eventBus.on(ContactEventChannel.GetAllContacts, handleContactsFetched);
    contactService.getAllContacts();

    return () => {
      eventBus.off(ContactEventChannel.GetAllContacts, handleContactsFetched);
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', color: '#075E54', marginBottom: 2 }}
      >
        Contact List
      </Typography>
      {errorMessage && (
        <Typography color="error" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          {errorMessage}
        </Typography>
      )}
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Paper
            key={contact.id}
            sx={{
              padding: 2,
              marginBottom: 2,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f1f1f1' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#4A4A4A', fontWeight: 'bold' }}
              >
                {contact.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8A8A8A' }}>
                {contact.did}
              </Typography>
            </Box>
            <Box>
              <IconButton
                aria-label="more-info"
                size="small"
                sx={{ color: '#0063F7' }}
                onClick={() => openChat(contact.id)}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Paper>
        ))
      ) : (
        <Typography>No contacts found</Typography>
      )}
    </Box>
  );
};

export default ContactPage;
