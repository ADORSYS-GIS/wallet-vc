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
import { Badge, Box, Paper, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnreadStatusRepository } from '../../utils/UnreadStatusRepository';

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

  // Fetch user PIN
  useEffect(() => {
    const storedPin = localStorage.getItem('userPin');
    if (storedPin) setSecretPinNumber(parseInt(storedPin, 10));
  }, []);

  // Fetch DIDs
  useEffect(() => {
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
  }, []);

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

  const mediatorDid = localStorage.getItem('mediatorDid');
  if (!mediatorDid) throw new Error('mediatorDid is not set in local storage');

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
  }, [contactService]);

  // Initialize unread counts
  useEffect(() => {
    const initializeUnreadCounts = async () => {
      const initialUnread: { [key: string]: number } = {};
      for (const contact of contacts) {
        initialUnread[contact.did] =
          await unreadStatusRepository.getUnreadCount(contact.did);
      }
      setUnreadMessages(initialUnread);
    };
    if (contacts.length > 0) initializeUnreadCounts();
  }, [contacts, unreadStatusRepository]);

  // Sync messages
  useEffect(() => {
    if (
      !messagePickup ||
      !didForMediation ||
      !messagingDID ||
      contacts.length === 0
    )
      return;

    const checkAndSyncMessages = async () => {
      for (const contact of contacts) {
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
            messageService.getAllMessagesByContact(contact.did);
          }
        } catch (error) {
          console.error(`Error syncing messages for ${contact.did}:`, error);
        }
      }
    };

    checkAndSyncMessages();
    const intervalId = setInterval(checkAndSyncMessages, 5000);
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
            console.log(
              `Incremented unread count for ${contactDid} to ${newCount}`,
            );
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
    const handleEvent = (response: ServiceResponse<Message[]>) => {
      handleMessagesReceived(response);
    };

    eventBus.on(MessageEventChannel.GetAllByContactId, handleEvent);
    return () => {
      eventBus.off(MessageEventChannel.GetAllByContactId, handleEvent);
    };
  }, [handleMessagesReceived]);

  // Trigger initial message fetch
  useEffect(() => {
    contacts.forEach((contact) =>
      messageService.getAllMessagesByContact(contact.did),
    );
  }, [contacts, messageService]);

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

            {/*Timestamp and Unread Count on the Same Line*/}
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
      })}
    </Box>
  );
};

export default Messages;
