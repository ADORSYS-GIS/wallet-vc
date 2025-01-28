import {
  Contact,
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  Message,
  MessageEventChannel,
  MessageService,
} from '@adorsys-gis/message-service';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>(
    {},
  );

  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);

  const openChat = (contactId: number | undefined) => {
    if (contactId) {
      navigate(`/chat/${contactId}`);
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

  // Fetch and update messages dynamically
  const fetchMessages = useCallback(() => {
    contacts.forEach((contact) => {
      messageService.getAllMessagesByContact(contact.did);
    });
  }, [contacts, messageService]);

  useEffect(() => {
    const handleMessagesReceived = (response: ServiceResponse<Message[]>) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        setLastMessages((prev) => {
          const updatedMessages = { ...prev };
          response.payload.forEach((message) => {
            const contactDid = message.contactId;
            if (
              !updatedMessages[contactDid] ||
              new Date(message.timestamp) >
                new Date(updatedMessages[contactDid]?.timestamp)
            ) {
              updatedMessages[contactDid] = message; // Update to the latest message
            }
          });
          return updatedMessages;
        });
      }
    };

    const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;
    eventBus.on(getAllByContactIdChannel, handleMessagesReceived);

    fetchMessages();

    return () => {
      eventBus.off(getAllByContactIdChannel, handleMessagesReceived);
    };
  }, [contacts, fetchMessages]);

  // Polling mechanism with debounce
  useEffect(() => {
    const interval = setInterval(fetchMessages, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Sort contacts by most recent message
  const sortedContacts = useMemo(
    () =>
      [...contacts]
        .filter((contact) => lastMessages[contact.did]) // Only show contacts with messages
        .sort((a, b) => {
          const messageA = lastMessages[a.did];
          const messageB = lastMessages[b.did];
          return (
            new Date(messageB.timestamp).getTime() -
            new Date(messageA.timestamp).getTime()
          );
        }),
    [contacts, lastMessages],
  );

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
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', color: '#075E54', marginBottom: 2 }}
      >
        Messages
      </Typography>

      {sortedContacts.map((contact) => {
        const message = lastMessages[contact.did];

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
