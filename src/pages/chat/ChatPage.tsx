import {
  Contact,
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import { MessageRouter } from '@adorsys-gis/message-exchange';
import { MessagePickup } from '@adorsys-gis/message-pickup';
import {
  Message,
  MessageEventChannel,
  MessageRepository,
  MessageService,
} from '@adorsys-gis/message-service';
import {
  DIDIdentityService,
  DidEventChannel,
  DidRepository,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UnreadStatusRepository } from '../../utils/UnreadStatusRepository';
import { getDecryptedPin } from '../../utils/auth';

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>('');
  const [contactDID, setContactDID] = useState<string>('');
  const [userDID, setUserDID] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [messagingDID, setMessagingDID] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [didForMediation, setDidForMediation] = useState<string | null>(null);
  const [secretPinNumber, setSecretPinNumber] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add unread status repository
  const unreadStatusRepository = useMemo(
    () => new UnreadStatusRepository(),
    [],
  );

  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);
  const messageRouter = useMemo(() => {
    if (secretPinNumber !== null) {
      return new MessageRouter(
        new DidRepository(new SecurityService()),
        new MessageRepository(),
        secretPinNumber,
      );
    }
    return null;
  }, [secretPinNumber]);

  const didRepository = useMemo(
    () => new DidRepository(new SecurityService()),
    [],
  );
  const messageRepository = useMemo(() => new MessageRepository(), []);

  const messagePickup = useMemo(() => {
    if (secretPinNumber !== null) {
      return new MessagePickup(
        didRepository,
        secretPinNumber,
        messageRepository,
      );
    }
    return null;
  }, [didRepository, secretPinNumber, messageRepository]);

  const storedMediatorDid = localStorage.getItem('mediatorDid');
  if (storedMediatorDid === null) {
    throw new Error('mediatorDid is not set in local storage');
  }
  const mediatorDid: string = storedMediatorDid;
  const securityService = new SecurityService();
  const didIdentityService = new DIDIdentityService(eventBus, securityService);

  // Fetch and decrypt PIN on mount, then clear it from state after use
  useEffect(() => {
    const fetchPin = async () => {
      setIsLoading(true);
      try {
        const pin = await getDecryptedPin();
        if (pin !== null) {
          const parsedPin = parseInt(pin, 10);
          if (isNaN(parsedPin)) {
            throw new Error('Decrypted PIN is not a valid number');
          }
          setSecretPinNumber(parsedPin);
        } else {
          setError('No PIN found. Please set up your PIN.');
        }
      } catch (err) {
        setError('Failed to authenticate and retrieve PIN.');
        console.error('PIN fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPin();
    return () => {
      setSecretPinNumber(null);
    };
  }, []);

  useEffect(() => {
    const handleDIDResponse = ({
      status,
      payload,
    }: ServiceResponse<{ did: string }[]>) => {
      if (status === ServiceResponseStatus.Success) {
        if (payload.length > 0) {
          setMessagingDID(payload[0].did);
        }
        setErrorMessage(null);
      } else {
        setErrorMessage('An error occurred while fetching DIDs');
      }
    };

    eventBus.on(DidEventChannel.GetPeerContactDidIdentities, handleDIDResponse);
    didIdentityService.findPeerContactDidIdentities();

    return () => {
      eventBus.off(
        DidEventChannel.GetPeerContactDidIdentities,
        handleDIDResponse,
      );
    };
  }, []);

  useEffect(() => {
    const handleDIDResponse = ({
      status,
      payload,
    }: ServiceResponse<{ did: string }[]>) => {
      if (status === ServiceResponseStatus.Success) {
        if (payload.length > 0) {
          setDidForMediation(payload[0].did);
        }
        setErrorMessage(null);
      } else {
        setErrorMessage('An error occurred while fetching DIDs');
      }
    };

    eventBus.on(DidEventChannel.GetMediatorDidIdentities, handleDIDResponse);
    didIdentityService.findMediatorDidIdentities();

    return () => {
      eventBus.off(DidEventChannel.GetMediatorDidIdentities, handleDIDResponse);
    };
  }, []);

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
            // Reset unread count when entering chat
            unreadStatusRepository.resetUnreadCount(response.payload.did);
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
  }, [contactId, contactService, unreadStatusRepository]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !messageRouter) return;

    if (!messagingDID) {
      setIsModalOpen(true);
      return;
    }

    try {
      await messageRouter.routeForwardMessage(
        newMessage,
        contactDID,
        messagingDID,
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (!messagePickup || !contactDID || !didForMediation || !messagingDID)
      return;

    const checkAndSyncMessages = async () => {
      try {
        const messageCount = await messagePickup.processStatusRequest(
          mediatorDid,
          didForMediation,
        );

        if (messageCount > 0) {
          await messagePickup.processDeliveryRequest(
            mediatorDid,
            didForMediation,
            messagingDID,
          );
          messageService.getAllMessagesByContact(contactDID);
        }
      } catch (error) {
        console.error('Error checking or syncing messages:', error);
        setErrorMessage('Failed to check or sync messages from mediator.');
      }
    };

    checkAndSyncMessages();
    const intervalId = setInterval(checkAndSyncMessages, 5000);
    return () => clearInterval(intervalId);
  }, [
    messagePickup,
    mediatorDid,
    contactDID,
    messageService,
    messagingDID,
    didForMediation,
  ]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (contactId) {
        messageService.getAllMessagesByContact(contactDID);
      } else {
        setErrorMessage('Contact DID is undefined.');
      }
    };

    const handleMessagesReceived = async (
      response: ServiceResponse<Message[]>,
    ) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        const sortedMessages = response.payload.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        // Check for new incoming messages and mark them as read
        const newMessages = sortedMessages.filter(
          (msg) =>
            msg.direction === 'in' && !messages.some((m) => m.id === msg.id),
        );

        if (newMessages.length > 0 && contactDID) {
          // Reset unread count when new messages are viewed
          await unreadStatusRepository.resetUnreadCount(contactDID);
        }

        setMessages(sortedMessages);
        setErrorMessage(null);
      } else {
        setErrorMessage('Failed to fetch messages.');
      }
    };

    const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;
    eventBus.on(getAllByContactIdChannel, handleMessagesReceived);

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 500);

    return () => {
      clearInterval(intervalId);
      eventBus.off(getAllByContactIdChannel, handleMessagesReceived);
    };
  }, [contactDID, contactId, messageService, unreadStatusRepository, messages]);

  useEffect(() => {
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

    eventBus.on(MessageEventChannel.DeleteMessage, handleDeleteMessageEvent);

    return () => {
      eventBus.off(MessageEventChannel.DeleteMessage, handleDeleteMessageEvent);
    };
  }, []);

  const handleModalSubmit = () => {
    if (userDID.trim() !== '') {
      setMessagingDID(userDID);
      localStorage.setItem('selectedDID', userDID);
      setUserDID('');
      setIsModalOpen(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    messageService.deleteMessage(messageId);
  };

  const handleClickDelete = (messageId: string) => {
    setDeleteOptionsVisible((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Show loading state while fetching PIN
  if (isLoading || secretPinNumber === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {secretPinNumber === null ? 'Authenticating...' : 'Loading chat...'}
        </Typography>
      </Box>
    );
  }

  // Render error if PIN retrieval failed
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">{error}</Typography>
        <Typography
          onClick={() => navigate('/login')}
          sx={{ cursor: 'pointer', color: 'primary.main', mt: 1 }}
        >
          Back to Login
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Always render these elements to ensure they're available for WebAuthn library */}
      <div id="messageList" style={{ display: 'none' }}></div>
      <div id="error" style={{ display: 'none' }}></div>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 1,
            borderBottom: '4px solid #ccc',
            position: 'relative',
            marginTop: '-10px',
            '@media (max-width: 600px)': {
              marginTop: '-5px',
            },
          }}
        >
          <IconButton
            onClick={() => navigate('/messages')}
            aria-label="Back"
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>

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

          <Box>
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              aria-label="Contact Info"
              color="primary"
            >
              <InfoIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate(`/contact-info/${contactId}`);
                  setAnchorEl(null);
                }}
              >
                View Contact Info
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setIsModalOpen(true);
                }}
              >
                Set/Change Sending DID
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {errorMessage && (
          <Box sx={{ padding: 2, backgroundColor: 'red', color: 'white' }}>
            <Typography variant="body1">{errorMessage}</Typography>
          </Box>
        )}

        <Box
          sx={{
            flexGrow: 1,
            padding: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflowX: 'hidden',
          }}
        >
          {messages.map((msg) => (
            <Paper
              key={msg.id}
              sx={{
                padding: 1,
                marginBottom: 1,
                alignSelf: msg.direction === 'out' ? 'flex-end' : 'flex-start',
                backgroundColor:
                  msg.direction === 'out' ? '#58a3ff' : 'lightgrey',
                color: msg.direction === 'out' ? '#fff' : '#000',
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
                  color: msg.direction === 'out' ? '#fff' : '#000',
                }}
              >
                {msg.timestamp.toLocaleString()}
              </Typography>

              <IconButton
                sx={{ position: 'absolute', top: 5, right: -30 }}
                onClick={() => handleClickDelete(msg.id)}
              >
                <MoreVertIcon />
              </IconButton>

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

        <Box
          sx={{
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            marginBottom: '20px',
          }}
        >
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

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: { xs: '70%', sm: '40%', md: '35%', lg: '30%' },
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255, 255, 255, 255)',
              boxShadow: 24,
              p: 6,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Set sending DID
            </Typography>
            <TextField
              value={userDID}
              onChange={(e) => setUserDID(e.target.value)}
              fullWidth
              placeholder="Paste your DID here..."
            />
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                sx={{ marginRight: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleModalSubmit}
                disabled={!userDID.trim()}
              >
                OK
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default ChatPage;
