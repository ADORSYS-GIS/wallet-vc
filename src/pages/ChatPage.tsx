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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Message,
  MessageEventChannel,
  MessageService,
} from '@adorsys-gis/message-service';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { v4 as uuidv4 } from 'uuid';

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>('');
  const [contactDID, setContactDID] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState<{
    [key: string]: boolean;
  }>({});

  // Memoize service creation
  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (contactId) {
        const id = parseInt(contactId);
        contactService.getContact(id);

        const handleContactReceived = (response: ServiceResponse<Contact>) => {
          if (
            response.status === ServiceResponseStatus.Success &&
            response.payload
          ) {
            setContactName(response.payload.name);
            setContactDID(response.payload.did);
            setErrorMessage(null);
          } else {
            setErrorMessage('Failed to fetch contact details.');
          }
        };

        const getContactChannel = ContactEventChannel.GetContactByID;
        eventBus.on(getContactChannel, handleContactReceived);

        return () => {
          eventBus.off(getContactChannel, handleContactReceived);
        };
      } else {
        setErrorMessage('Contact ID is undefined.');
      }
    };

    fetchContactDetails();
  }, [contactId, contactService]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (contactId) {
        messageService.getAllMessagesByContact(contactDID);

        const handleMessagesReceived = (
          response: ServiceResponse<Message[]>,
        ) => {
          if (
            response.status === ServiceResponseStatus.Success &&
            response.payload
          ) {
            setMessages(response.payload);
            setErrorMessage(null);
          } else {
            setErrorMessage('Failed to fetch messages.');
          }
        };

        const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;
        eventBus.on(getAllByContactIdChannel, handleMessagesReceived);
        return () => {
          eventBus.off(getAllByContactIdChannel, handleMessagesReceived);
        };
      } else {
        setErrorMessage('Contact DID is undefined.');
      }
    };

    fetchMessages();
  }, [contactDID, contactId, messageService]);

  useEffect(() => {
    // Event listener for when a message is created
    const handleMessageCreated = (response: ServiceResponse<Message>) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        setMessages((prevMessages) => [...prevMessages, response.payload]);
        setErrorMessage(null);
      } else {
        setErrorMessage('Failed to send message.');
      }
    };

    // Event listener for when a message is deleted
    const handleDeleteMessageEvent = (
      response: ServiceResponse<{ id: string }>,
    ) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== response.payload.id),
        );
        setErrorMessage(null);
      } else {
        setErrorMessage('Failed to delete message.');
      }
    };

    // Add event listeners once when the component mounts
    eventBus.on(MessageEventChannel.CreateMessage, handleMessageCreated);
    eventBus.on(MessageEventChannel.DeleteMessage, handleDeleteMessageEvent);

    // Cleanup event listeners on unmount
    return () => {
      eventBus.off(MessageEventChannel.CreateMessage, handleMessageCreated);
      eventBus.off(MessageEventChannel.DeleteMessage, handleDeleteMessageEvent);
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: uuidv4(),
      text: newMessage,
      sender: 'user',
      contactId: contactDID,
      timestamp: new Date(),
    };

    // Send the message without adding a new event listener
    messageService.createMessage(message);
    setNewMessage(''); // Clear the input after sending
  };

  const handleDeleteMessage = (messageId: string) => {
    // Delete the message without adding a new event listener
    messageService.deleteMessage(messageId);
  };

  const handleClickDelete = (messageId: string) => {
    setDeleteOptionsVisible((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
          borderBottom: '5px solid #ccc',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={() => navigate('/contacts')}
          aria-label="Back"
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Centered Title */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', textAlign: 'center' }}
          >
            {contactName || 'Chat'}
          </Typography>
        </Box>

        {/* Contact Info Button */}
        <IconButton
          onClick={() => navigate(`/contact-info/${contactId}`)}
          aria-label="Contact Info"
          color="primary"
        >
          <InfoIcon />
        </IconButton>
      </Box>

      {/* Display error message */}
      {errorMessage && (
        <Box sx={{ padding: 2, backgroundColor: 'red', color: 'white' }}>
          <Typography variant="body1">{errorMessage}</Typography>
        </Box>
      )}

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          padding: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.09)',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {messages.map((msg) => (
          <Paper
            key={msg.id}
            sx={{
              padding: 1,
              marginBottom: 1,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor:
                msg.sender === 'user' ? 'lightgrey' : 'lightgrey',
              color: msg.sender === 'user' ? 'black' : 'black',
              borderRadius: 3,
              display: 'inline-block',
              maxWidth: '50%',
              wordWrap: 'break-word',
              position: 'relative',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: 'left',
              }}
            >
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontSize: '10',
                color: 'grey',
              }}
            >
              {msg.timestamp.toLocaleString()} {/* Format timestamp */}
            </Typography>

            {/* Three dots for delete option */}
            <IconButton
              sx={{ position: 'absolute', top: 5, right: -30 }}
              onClick={() => handleClickDelete(msg.id)}
            >
              <MoreVertIcon />
            </IconButton>

            {/* Delete Option */}
            {deleteOptionsVisible[msg.id] && (
              <Box sx={{ position: 'absolute', top: 35, right: 5 }}>
                <Button
                  onClick={() => handleDeleteMessage(msg.id)}
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  sx={{
                    width: '90px',
                    height: '25px',
                    fontSize: '11px',
                  }}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      {/* Message Input */}
      <Box sx={{ padding: 2, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          multiline
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          maxRows={5}
          sx={{ flexGrow: 1, marginRight: 1 }}
        />
        <Button onClick={handleSendMessage} variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPage;
