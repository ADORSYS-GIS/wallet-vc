import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Contact,
  ContactService,
  ContactEventChannel,
} from '@adorsys-gis/contact-service';
import {
  Message,
  MessageService,
  MessageEventChannel,
} from '@adorsys-gis/message-service';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [, setErrorMessage] = useState<string | null>(null);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>(
    {},
  );

  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);

  const openChat = (contactId: number | undefined) => {
    if (contactId) {
      navigate(`/chat/${contactId}`);
      setErrorMessage(null);
    } else {
      setErrorMessage('Contact ID is undefined.');
    }
  };

  // Fetch contacts on component mount
  useEffect(() => {
    const handleContactsReceived = (response: ServiceResponse<Contact[]>) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        setContacts(response.payload);
      }
    };

    const getAllContactsChannel = ContactEventChannel.GetAllContacts;
    eventBus.on(getAllContactsChannel, handleContactsReceived);

    contactService.getAllContacts();

    return () => {
      eventBus.off(getAllContactsChannel, handleContactsReceived);
    };
  }, [contactService]);

  // Fetch last messages for contacts and update dynamically
  useEffect(() => {
    const handleMessagesReceived = (response: ServiceResponse<Message[]>) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        response.payload.forEach((message) => {
          const contactDid = message.contactId;
          setLastMessages((prev) => ({
            ...prev,
            [contactDid]: message, // Update last message for the contact
          }));
        });
      }
    };

    const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;
    eventBus.on(getAllByContactIdChannel, handleMessagesReceived);

    contacts.forEach((contact) => {
      messageService.getAllMessagesByContact(contact.did); // Fetch messages for each contact
    });

    return () => {
      eventBus.off(getAllByContactIdChannel, handleMessagesReceived);
    };
  }, [contacts, messageService]);

  // Sort contacts by the timestamp of the most recent message
  const sortedContacts = [...contacts]
    .filter((contact) => lastMessages[contact.did]) // Only show contacts with messages
    .sort((a, b) => {
      const messageA = lastMessages[a.did];
      const messageB = lastMessages[b.did];
      if (!messageA || !messageB) return 0;
      return (
        new Date(messageB.timestamp).getTime() -
        new Date(messageA.timestamp).getTime()
      );
    });

  // Polling mechanism to update the last messages every second
  useEffect(() => {
    const interval = setInterval(() => {
      contacts.forEach((contact) => {
        messageService.getAllMessagesByContact(contact.did); // Trigger update for each contact
      });
    }, 1000); // 1 second interval

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [contacts, messageService]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        width: '100%',
        overflow: 'auto',
      }}
    >
      {sortedContacts.map((contact) => {
        const message = lastMessages[contact.did]; // Get the most recent message for the contact

        return (
          <Paper
            key={contact.id}
            onClick={() => openChat(contact.id)}
            sx={{
              padding: 2,
              marginBottom: 2,
              width: '90%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: 2,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f1f1f1' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#4A4A4A', fontWeight: 'bold' }}
              >
                {contact.name}
              </Typography>
              <Tooltip title={contact.did} arrow>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#8A8A8A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '250px',
                  }}
                >
                  {contact.did}
                </Typography>
              </Tooltip>
              {message && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#4A4A4A',
                    marginTop: '4px',
                  }}
                >
                  {message.text}
                </Typography>
              )}
            </Box>
            {message && (
              <Typography
                variant="body2"
                sx={{
                  color: '#8A8A8A',
                  marginLeft: '16px',
                }}
              >
                {new Date(message.timestamp).toLocaleString()}
              </Typography>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default Messages;
