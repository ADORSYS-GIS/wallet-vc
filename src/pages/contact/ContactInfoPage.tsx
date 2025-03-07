import {
  Contact,
  ContactEventChannel,
  ContactService,
} from '@adorsys-gis/contact-service';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  MessageEventChannel,
  MessageService,
} from '@adorsys-gis/message-service';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ContactInfoPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>('');
  const [contactDID, setContactDID] = useState<string>('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Memoize service creation
  const contactService = useMemo(() => new ContactService(eventBus), []);
  const messageService = new MessageService(eventBus);

  // Helper function to get initials from the contact's name
  const getInitials = (name?: string): string => {
    if (!name || typeof name !== 'string') {
      return '?'; // Return a default value for invalid or missing names
    }

    const words = name.trim().split(' ');
    if (words.length > 1) {
      return `${words[0][0]?.toUpperCase() || ''}${words[1][0]?.toUpperCase() || ''}`;
    }

    return words[0][0]?.toUpperCase() || '?'; // Fallback to '?' if even the first letter is missing
  };

  useEffect(() => {
    if (contactId) {
      const id = parseInt(contactId);
      contactService.getContact(id);

      const handleContactReceived = (response: ServiceResponse<Contact>) => {
        if (
          response.status === ServiceResponseStatus.Success &&
          response.payload
        ) {
          setContactName(response.payload.name);
          setContactDID(response.payload.did || '');
          setContactError(null);
        } else {
          setContactError('Failed to fetch contact details.');
        }
      };

      const getContactChannel = ContactEventChannel.GetContactByID;
      eventBus.on(getContactChannel, handleContactReceived);

      return () => {
        eventBus.off(getContactChannel, handleContactReceived);
      };
    } else {
      setContactError('Contact ID is undefined.');
    }
  }, [contactId, contactService]);

  // Opens delete confirmation dialog
  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  // Closes the delete confirmation dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handles deletion of contact
  const handleConfirmDelete = () => {
    if (contactId) {
      const id = parseInt(contactId);
      contactService.deleteContact(id);

      const handleDeleteResponse = (
        response: ServiceResponse<{ id: number }>,
      ) => {
        if (response.status === ServiceResponseStatus.Success) {
          // Delete all messages associated with this contact
          messageService.deleteAllMessagesByContact(contactDID);

          // Emit success notification event
          eventBus.emit(
            MessageEventChannel.DeleteAllByContactId,
            'Contact and messages removed successfully.',
          );

          // Update deleteSuccess to show the success message
          setDeleteSuccess('Contact and messages removed successfully.');

          setTimeout(() => {
            navigate('/contacts');
          }, 2000);
        } else {
          setDeleteError('Failed to delete contact.');
        }
      };

      const deleteContactChannel = ContactEventChannel.DeleteContact;
      eventBus.on(deleteContactChannel, handleDeleteResponse);

      return () => {
        eventBus.off(deleteContactChannel, handleDeleteResponse);
      };
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '98vh',
        maxWidth: { xs: '100%', sm: 600, md: 800 },
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* Header with Back Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: 1,
          width: '100%',
        }}
      >
        <IconButton
          onClick={() => navigate(`/chat/${contactId}`)}
          aria-label="Back"
          color="primary"
          sx={{
            padding: '8px',
            color: 'primary.main',
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Circle Avatar with Initials */}
      <Avatar
        sx={{
          fontWeight: 'bold',
          width: 100,
          height: 100,
          bgcolor: 'primary.main',
          marginBottom: 1,
          fontSize: '2rem',
        }}
      >
        {contactName ? getInitials(contactName) : '?'}
      </Avatar>

      {/* Contact Name */}
      <Typography variant="h5" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
        {contactName}
      </Typography>

      {/* Contact DID */}
      <Tooltip title={contactDID} arrow>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
            maxWidth: '80%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          DID: {contactDID}
        </Typography>
      </Tooltip>

      {/* Display contact fetch error */}
      {contactError && (
        <Typography variant="body2" color="error.main" sx={{ marginBottom: 2 }}>
          {contactError}
        </Typography>
      )}

      {/* Clickable Delete Text at the bottom */}
      <Typography
        variant="body2"
        color="error.main"
        sx={{
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: 'auto',
          marginBottom: '37px',
        }}
        onClick={handleDeleteClick}
      >
        Remove from Wallet
      </Typography>

      {/* Display delete error */}
      {deleteError && (
        <Typography variant="body2" color="error.main" sx={{ marginBottom: 2 }}>
          {deleteError}
        </Typography>
      )}

      {/* Display delete success message */}
      {deleteSuccess && (
        <Typography
          variant="body2"
          color="success.main"
          sx={{ marginBottom: 10 }}
        >
          {deleteSuccess}
        </Typography>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Remove this contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add credentials, the issuing organisation needs to be a contact.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              border: '1px solid red',
              backgroundColor: 'red',
              color: 'white',
              padding: '6px 12px',
              fontSize: '10px',
            }}
          >
            Remove from Wallet
          </Button>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              border: '1px solid black',
              color: 'black',
              padding: '6px 12px',
              fontSize: '10px',
            }}
          >
            Go Back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactInfoPage;
