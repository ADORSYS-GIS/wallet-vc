import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
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

interface Message {
  id: string;
  text: string;
  sender: string;
}

const ChatPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);

  const contactService = new ContactService(eventBus);

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
  }, [contactId, contactService, eventBus]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: String(messages.length + 1),
      text: newMessage,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
    setSelectedMedia(null);
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
        <Typography variant="h5">{contactName || "Chat"}</Typography>
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
        }}
      >
        {messages.map((msg) => (
          <Paper
            key={msg.id}
            sx={{
              padding: 1,
              marginBottom: 1,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", 
              backgroundColor: msg.sender === "user" ? "black" : "lightgrey",
              color: msg.sender === "user" ? "white" : "black",
              borderRadius: 1,
              maxWidth: "70%",
              wordWrap: "break-word",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: msg.sender === "user" ? "right" : "left",
              }}
            >
              {msg.text}
            </Typography>
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
    </Box>
  );
};

export default ChatPage;
