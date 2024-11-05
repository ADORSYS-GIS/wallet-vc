import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
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

import { MessageRepository } from "../storage/MessageRepository";
import { v4 as uuidv4 } from "uuid";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface Message {
  id: string;
  text: string;
  sender: string;
  contactId: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [deletedMessage, setDeletedMessage] = useState<string>("");

  const contactService = new ContactService(eventBus);
  const messageRepository = new MessageRepository();

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
          } else {
            console.error(response.payload);
          }
        };

        const getContactChannel = ContactEventChannel.GetContactByID;
        eventBus.on(getContactChannel, handleContactReceived);

        return () => {
          eventBus.off(getContactChannel, handleContactReceived);
        };
      } else {
        console.error("Contact ID is undefined.");
      }
    };

    fetchContactDetails();
  }, [contactId, contactService]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (contactId) {
        const chatMessages = await messageRepository.getAllByContact(contactId);
        setMessages(chatMessages);
      }
    };
    fetchMessages();
  }, [contactId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    if (!contactId) {
      console.error("contactId is undefined. Cannot send message.");
      return;
    }

    const message: Message = {
      id: uuidv4(),
      text: newMessage,
      sender: "user",
      contactId: contactId,
      timestamp: new Date(),
    };

    await messageRepository.create(message);
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    await messageRepository.delete(messageId);
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId)
    );
    setDeletedMessage("Message deleted successfully!");
    setSnackbarOpen(true);
    setDeleteOptionsVisible((prev) => ({ ...prev, [messageId]: false })); // Hide delete options after deleting
  };

  const handleClickDelete = (messageId: string) => {
    setDeleteOptionsVisible((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 2,
          borderBottom: "5px solid #ccc",
        }}
      >
        <IconButton
          onClick={() => navigate("/contacts")}
          aria-label="Back"
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {contactName || "Chat"}
        </Typography>
        <IconButton
          onClick={() => navigate(`/contact-info/${contactId}`)}
          aria-label="Contact Info"
          color="primary"
        >
          <InfoIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          padding: 2,
          overflowY: "auto",
          backgroundColor: "rgba(0, 0, 0, 0.09)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {messages.map((msg) => (
          <Paper
            key={msg.id}
            sx={{
              padding: 1,
              marginBottom: 1,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.sender === "user" ? "lightgrey" : "lightgrey",
              color: msg.sender === "user" ? "black" : "black",
              borderRadius: 3,
              display: "inline-block",
              maxWidth: "50%",
              wordWrap: "break-word",
              position: "relative",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: "left",
              }}
            >
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "10",
                color: "grey",
              }}
            >
              {msg.timestamp.toLocaleString()} {/* Format timestamp */}
            </Typography>

            {/* Three dots for delete option */}
            <IconButton
              sx={{ position: "absolute", top: 5, right: -30}}
              onClick={() => handleClickDelete(msg.id)}
            >
              <MoreVertIcon />
            </IconButton>

            {/* Delete Option */}
            {deleteOptionsVisible[msg.id] && (
              <Box sx={{ position: "absolute", top: 35, right: 5 }}>
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
      <Box sx={{ padding: 2, display: "flex", alignItems: "center" }}>
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
      {/* Snackbar for delete confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={deletedMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "green",
            color: "white",
          },
        }}
      />
    </Box>
  );
};

export default ChatPage;
