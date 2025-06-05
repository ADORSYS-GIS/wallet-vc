import {
  Contact,
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
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
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnreadStatusRepository } from '../../utils/UnreadStatusRepository';
import { getDecryptedPin } from '../../utils/auth';

// A set to track processed messages, scoped globally but reset per component lifecycle if needed
const processedMessages = new Set<string>();

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>(
    {},
  );
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});
  const [secretPinNumber, setSecretPinNumber] = useState<number | null>(null);
  const [messagingDID, setMessagingDID] = useState<string | null>(null);
  const [didForMediation, setDidForMediation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check mediatorDid synchronously during component initialization
  const mediatorDid = localStorage.getItem('mediatorDid');
  const [isMediatorDidMissing, setIsMediatorDidMissing] =
    useState<boolean>(!mediatorDid);

  // Update isMediatorDidMissing if mediatorDid changes (e.g., via localStorage updates)
  useEffect(() => {
    setIsMediatorDidMissing(!mediatorDid);
  }, [mediatorDid]);

  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = useMemo(() => new MessageService(eventBus), []);
  const messageRepository = useMemo(() => new MessageRepository(), []);
  const didRepository = useMemo(
    () => new DidRepository(new SecurityService()),
    [],
  );
  const unreadStatusRepository = useMemo(
    () => new UnreadStatusRepository(),
    [],
  );

  // Fetch and decrypt PIN only if mediatorDid is set
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip authentication if mediatorDid is missing

    const fetchPin = async () => {
      setIsLoading(true);
      try {
        const pin = await getDecryptedPin(); // Returns string | null
        if (pin === null) {
          // Treat null as a cancellation
          setError('Authentication canceled by user, redirecting to home...');
          setTimeout(() => {
            navigate('/', {
              state: { message: 'Authentication was canceled by user' },
            });
          }, 1500);
          return; // Exit the function to prevent further processing
        }
        const parsedPin = parseInt(pin, 10);
        if (isNaN(parsedPin)) {
          throw new Error(
            'Oops, something went wrong with authentication. Let’s try again from the home page.',
          );
        }
        setSecretPinNumber(parsedPin);
      } catch (err) {
        // Handle WebAuthn cancellation (NotAllowedError)
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError('Authentication canceled by user, redirecting to home...');
          setTimeout(() => {
            navigate('/', {
              state: { message: 'Authentication was canceled by user' },
            });
          }, 1500);
        } else {
          // Handle other errors
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Oops, something went wrong. Let’s try again from the home page.';
          setError(errorMessage);
          console.error('PIN fetch error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPin();

    // Cleanup: Clear PIN from state when component unmounts
    return () => {
      setSecretPinNumber(null); // Remove PIN from memory
    };
  }, [navigate, isMediatorDidMissing]);

  // Fetch DIDs
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip if mediatorDid is missing

    const securityService = new SecurityService();
    const didIdentityService = new DIDIdentityService(
      eventBus,
      securityService,
    );

    const handlePeerDIDResponse = ({
      status,
      payload,
    }: ServiceResponse<{ did: string }[]>) => {
      if (status === ServiceResponseStatus.Success && payload.length > 0) {
        setMessagingDID(payload[0].did);
      } else {
        // Handle missing messagingDID gracefully
        setError(
          'We couldn’t find your messaging ID. Please ensure you’ve connected to the mediator, and try again from the home page.',
        );
        setTimeout(() => {
          navigate('/', { state: { message: 'Messaging ID not found' } });
        }, 3000);
      }
    };

    const handleMediatorDIDResponse = ({
      status,
      payload,
    }: ServiceResponse<{ did: string }[]>) => {
      if (status === ServiceResponseStatus.Success && payload.length > 0) {
        setDidForMediation(payload[0].did);
      }
    };

    eventBus.on(
      DidEventChannel.GetPeerContactDidIdentities,
      handlePeerDIDResponse,
    );
    eventBus.on(
      DidEventChannel.GetMediatorDidIdentities,
      handleMediatorDIDResponse,
    );

    didIdentityService.findPeerContactDidIdentities();
    didIdentityService.findMediatorDidIdentities();

    return () => {
      eventBus.off(
        DidEventChannel.GetPeerContactDidIdentities,
        handlePeerDIDResponse,
      );
      eventBus.off(
        DidEventChannel.GetMediatorDidIdentities,
        handleMediatorDIDResponse,
      );
    };
  }, [navigate, isMediatorDidMissing]);

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

  const openChat = async (contactId: number | undefined) => {
    if (!contactId) return;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    await unreadStatusRepository.resetUnreadCount(contact.did);
    setUnreadMessages((prev) => ({ ...prev, [contact.did]: 0 }));
    navigate(`/chat/${contactId}`);
  };

  // Fetch contacts
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip if mediatorDid is missing

    const handleContactsReceived = (response: ServiceResponse<Contact[]>) => {
      if (
        response.status === ServiceResponseStatus.Success &&
        response.payload
      ) {
        setContacts(response.payload);
      }
    };
    eventBus.on(ContactEventChannel.GetAllContacts, handleContactsReceived);
    contactService.getAllContacts();
    return () => {
      eventBus.off(ContactEventChannel.GetAllContacts, handleContactsReceived);
    };
  }, [contactService, isMediatorDidMissing]);

  // Initialize unread counts
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip if mediatorDid is missing

    const initializeUnreadCounts = async () => {
      const initialUnread: { [key: string]: number } = {};
      for (const contact of contacts) {
        initialUnread[contact.did] =
          await unreadStatusRepository.getUnreadCount(contact.did);
      }
      setUnreadMessages(initialUnread);
    };
    if (contacts.length > 0) initializeUnreadCounts();
  }, [contacts, unreadStatusRepository, isMediatorDidMissing]);

  // Sync messages
  useEffect(() => {
    if (
      !messagePickup ||
      !didForMediation ||
      !messagingDID ||
      contacts.length === 0
    ) {
      return;
    }

    const checkAndSyncMessages = async () => {
      for (const contact of contacts) {
        try {
          const messageCount = await messagePickup.processStatusRequest(
            mediatorDid!,
            didForMediation!,
          );
          if (messageCount > 0) {
            await messagePickup.processDeliveryRequest(
              mediatorDid!,
              didForMediation!,
              messagingDID,
            );
            messageService.getAllMessagesByContact(contact.did);
          }
        } catch (error) {
          console.error(`Error syncing messages for ${contact.did}:`, error);
        }
      }
    };

    checkAndSyncMessages();
    const interval = 5000;
    const intervalId = setInterval(checkAndSyncMessages, interval);
    return () => clearInterval(intervalId);
  }, [
    messagePickup,
    mediatorDid,
    contacts,
    messageService,
    messagingDID,
    didForMediation,
  ]);

  // Handle incoming messages with deduplication
  const handleMessagesReceived = useCallback(
    async (response: ServiceResponse<Message[]>) => {
      if (
        response.status !== ServiceResponseStatus.Success ||
        !response.payload
      )
        return;

      const updatedMessages = { ...lastMessages };
      const updatedUnread = { ...unreadMessages };

      for (const message of response.payload) {
        const contactDid = message.contactId;
        const messageKey = `${contactDid}-${message.timestamp}-${message.text}`; // unique key

        if (processedMessages.has(messageKey)) {
          continue;
        }

        // Update last message
        if (
          !updatedMessages[contactDid] ||
          new Date(message.timestamp) >
            new Date(updatedMessages[contactDid].timestamp)
        ) {
          updatedMessages[contactDid] = message;
        }

        // Update unread count for incoming messages
        if (message.direction === 'in') {
          const lastResetTimestamp =
            await unreadStatusRepository.getLastResetTimestamp(contactDid);
          const messageTimestamp = new Date(message.timestamp).getTime();

          if (messageTimestamp > lastResetTimestamp) {
            const currentCount =
              await unreadStatusRepository.getUnreadCount(contactDid);
            const newCount = currentCount + 1;
            await unreadStatusRepository.setUnreadCount(
              contactDid,
              newCount,
              lastResetTimestamp,
            );
            updatedUnread[contactDid] = newCount;
            processedMessages.add(messageKey);
          }
        }
      }

      setLastMessages(updatedMessages);
      setUnreadMessages(updatedUnread);
    },
    [lastMessages, unreadMessages, unreadStatusRepository],
  );

  // Register message listener
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip if mediatorDid is missing

    const handleEvent = (response: ServiceResponse<Message[]>) => {
      handleMessagesReceived(response);
    };

    eventBus.on(MessageEventChannel.GetAllByContactId, handleEvent);
    return () => {
      eventBus.off(MessageEventChannel.GetAllByContactId, handleEvent);
    };
  }, [handleMessagesReceived, isMediatorDidMissing]);

  // Trigger initial message fetch
  useEffect(() => {
    if (isMediatorDidMissing) return; // Skip if mediatorDid is missing

    contacts.forEach((contact) =>
      messageService.getAllMessagesByContact(contact.did),
    );
  }, [contacts, messageService, isMediatorDidMissing]);

  const sortedContacts = useMemo(
    () =>
      [...contacts]
        .filter((contact) => lastMessages[contact.did])
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

  // If mediatorDid is missing, render only the modal
  if (isMediatorDidMissing) {
    return (
      <Modal open={isMediatorDidMissing} onClose={() => {}}>
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
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Mediator Connection Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            It looks like you haven’t connected to the mediator yet. Please scan
            the mediator’s invitation to continue.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/scan')}
            sx={{ mt: 2 }}
          >
            Go to Scan Page
          </Button>
        </Box>
      </Modal>
    );
  }

  // If mediatorDid is set, render the normal page content
  return (
    <>
      {/* Always render these elements to ensure they're available for WebAuthn library */}
      <div id="messageList" style={{ display: 'none' }}></div>
      <div id="error" style={{ display: 'none' }}></div>

      {/* Show error message if it exists */}
      {error ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Typography color="error">{error}</Typography>
          {error !==
            'Authentication canceled by user, redirecting to home...' &&
            error !==
              'We couldn’t find your messaging ID. Please ensure you’ve connected to the mediator, and try again from the home page.' && (
              <Typography
                onClick={() => navigate('/')}
                sx={{ cursor: 'pointer', color: 'primary.main', mt: 1 }}
              >
                Back to Home
              </Typography>
            )}
        </Box>
      ) : isLoading ? (
        // Show loading state only if there is no error and isLoading is true
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            {secretPinNumber === null
              ? 'Authenticating...'
              : 'Loading messages...'}
          </Typography>
        </Box>
      ) : (
        // Show main content if there is no error and loading is complete
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

          {sortedContacts.length > 0 ? (
            sortedContacts.map((contact) => {
              const message = lastMessages[contact.did];
              const unreadCount = unreadMessages[contact.did] || 0;

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
                  {/* Contact Name, DID, and Last Message */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      overflow: 'hidden',
                      flex: 1,
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

                  {/* Timestamp and Unread Count on the Same Line */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      minWidth: '170px',
                    }}
                  >
                    {message && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#8A8A8A',
                          marginRight: 2.5,
                        }}
                      >
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    )}
                    {unreadCount > 0 && (
                      <Badge
                        badgeContent={unreadCount}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#1E90FF',
                            color: 'white',
                            fontSize: '0.75rem',
                            height: '20px',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              );
            })
          ) : (
            <Typography variant="body1" sx={{ color: '4A4A4A' }}>
              No messages
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default Messages;
