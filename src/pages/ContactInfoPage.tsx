import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Contact,
  ContactEventChannel,
  ContactService,
} from "@adorsys-gis/contact-service";
import { eventBus } from "@adorsys-gis/event-bus";
import {
  ServiceResponse,
  ServiceResponseStatus,
} from "@adorsys-gis/status-service";
import {
  MessageService,
  MessageEventChannel,
} from "@awambeng/message-service";

const ContactInfoPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>("");
  const [contactDID, setContactDID] = useState<string>("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const contactService = new ContactService(eventBus);
  const messageService = new MessageService(eventBus);

  // Helper function to get initials from the contact's name
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    return words.length > 1
      ? `${words[0][0].toUpperCase()}${words[1][0].toUpperCase()}`
      : words[0][0].toUpperCase();
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
          setContactDID(response.payload.did || "");
          setContactError(null);
        } else {
          setContactError("Failed to fetch contact details.");
        }
      };

      const getContactChannel = ContactEventChannel.GetContactByID;
      eventBus.on(getContactChannel, handleContactReceived);

      return () => {
        eventBus.off(getContactChannel, handleContactReceived);
      };
    } else {
      setContactError("Contact ID is undefined.");
    }
  }, [contactId, contactService, eventBus]);

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
        response: ServiceResponse<{ id: number }>
      ) => {
        if (response.status === ServiceResponseStatus.Success) {
          // Delete all messages associated with this contact
          messageService.deleteAllMessagesByContact(contactDID);

          // Emit success notification event
          eventBus.emit(
            MessageEventChannel.DeleteAllByContactId,
            "Contact and messages removed successfully."
          );

          setTimeout(() => {
            navigate("/contacts");
          }, 2000);
        } else {
          setDeleteError("Failed to delete contact.");
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100vh",
        maxWidth: { xs: "100%", sm: 600, md: 800 },
        margin: "0 auto",
        backgroundColor: "rgba(0, 0, 0, 0.09)",
      }}
    >
      {/* Header with Back Button */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 2,
        }}
      >
        <IconButton
          onClick={() => navigate(`/chat/${contactId}`)}
          aria-label="Back"
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Circle Avatar with Initials */}
      <Avatar
        sx={{
          fontWeight: "bold",
          width: 100,
          height: 100,
          bgcolor: "primary.main",
          marginBottom: 2,
          fontSize: "2rem",
        }}
      >
        {contactName ? getInitials(contactName) : "?"}
      </Avatar>

      {/* Contact Name */}
      <Typography variant="h5" sx={{ marginBottom: 1, fontWeight: "bold" }}>
        {contactName}
      </Typography>

      {/* Contact DID */}
      <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        DID: {contactDID}
      </Typography>

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
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "auto",
          marginBottom: "16px",
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
              border: "1px solid red",
              backgroundColor: "red",
              color: "white",
              padding: "6px 12px",
              fontSize: "10px",
            }}
          >
            Remove from Wallet
          </Button>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              border: "1px solid black",
              color: "black",
              padding: "6px 12px",
              fontSize: "10px",
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
