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
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>(
    {},
  );

  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);

  useEffect(() => {
    const fetchContacts = async () => {
      contactService.getAllContacts();

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

      return () => {
        eventBus.off(getAllContactsChannel, handleContactsReceived);
      };
    };

    fetchContacts();
  }, [contactService]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      contacts.forEach((contact) => {
        messageService.getAllMessagesByContact(contact.did);

        const handleMessagesReceived = (
          response: ServiceResponse<Message[]>,
        ) => {
          if (
            response.status === ServiceResponseStatus.Success &&
            response.payload
          ) {
            const lastMessage = response.payload.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )[0];
            setLastMessages((prev) => ({
              ...prev,
              [contact.did]: lastMessage,
            }));
          }
        };

        const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;
        eventBus.on(getAllByContactIdChannel, handleMessagesReceived);

        return () => {
          eventBus.off(getAllByContactIdChannel, handleMessagesReceived);
        };
      });
    };

    if (contacts.length > 0) {
      fetchLastMessages();
    }
  }, [contacts, messageService]);

  const handleChatOpen = (contactId: number) => {
    navigate(`/chat/${contactId}`);
  };

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
      {contacts.map((contact) => (
        <Paper
          key={contact.id}
          onClick={() => handleChatOpen(contact.id!)}
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
            {lastMessages[contact.did] && (
              <Typography
                variant="body2"
                sx={{
                  color: '#4A4A4A',
                  marginTop: '4px',
                }}
              >
                {lastMessages[contact.did].text}
              </Typography>
            )}
          </Box>
          {lastMessages[contact.did] && (
            <Typography
              variant="body2"
              sx={{
                color: '#8A8A8A',
                marginLeft: '16px',
              }}
            >
              {new Date(lastMessages[contact.did].timestamp).toLocaleString()}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default Messages;
