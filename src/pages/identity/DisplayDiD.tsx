import React, { useState, useEffect } from 'react';
import { eventBus } from '@adorsys-gis/event-bus';
import DidService from '@adorsys-gis/contact-exchange';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import { Box, CircularProgress, Snackbar, Typography } from '@mui/material';

interface DisplayDIDProps {
  onDidRetrieved: (did: string) => void;
}

const DisplayDID: React.FC<DisplayDIDProps> = ({ onDidRetrieved }) => {
  const [newDid, setNewDid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Initialize DidService
  const didService = new DidService(eventBus);

  useEffect(() => {
    const handleDIDResponse = (eventData: any) => {
      const { status, payload } = eventData;
      if (status === ServiceResponseStatus.Success) {
        const retrievedDid = payload.did_for_mediation;
        setNewDid(retrievedDid);
        onDidRetrieved(retrievedDid);
        setMessage('✅ DID retrieved successfully!');
      } else {
        setMessage(`❗ Error: ${payload.message}`);
      }
      setOpenSnackbar(true);
      setIsLoading(false);
    };

    // Listen for the RetrieveDIDWithMediator event
    eventBus.on('RetrieveDIDWithMediator', handleDIDResponse);

    // Call RetrieveDIDWithMediator
    setIsLoading(true);
    didService.retrieveDIDWithMediator();

    // Cleanup the event listener when the component unmounts
    return () => {
      eventBus.off('RetrieveDIDWithMediator', handleDIDResponse);
    };
  }, [eventBus, onDidRetrieved]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      padding={{ xs: 2, sm: 3 }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Retrieve DID for Mediation
      </Typography>
      <Box sx={{ textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              textAlign: 'center',
            }}
          >
            Your new DID is: {newDid || 'Waiting for DID...'}
          </Typography>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={message}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{
          sx: {
            backgroundColor: message?.startsWith('✅') ? '#0063F7' : '#FF4D4F',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '8px 16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </Box>
  );
};

export default DisplayDID;
