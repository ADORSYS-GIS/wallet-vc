import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Theme,
} from '@mui/material';
import {
  DIDMethodName,
  PeerGenerationMethod,
  DIDIdentityService,
  SecurityService,
  DidEventChannel,
} from '@adorsys-gis/multiple-did-identities';
import { eventBus } from '@adorsys-gis/event-bus';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { useNavigate } from 'react-router-dom';

const securityService = new SecurityService();
const didService = new DIDIdentityService(eventBus, securityService);

const CreateDIDForm: React.FC = () => {
  const [method, setMethod] = useState<DIDMethodName | ''>('');
  const [pin, setPin] = useState<number | string>('');
  // const [routingKey, setRoutingKey] = useState<string>(''); // New state for routing key
  const [methodType, setMethodType] = useState<PeerGenerationMethod | 'none'>(
    'none',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  // Subscribe to DID creation events
  useEffect(() => {
    const handleDidCreated = (response: ServiceResponse<{ did: string }>) => {
      setIsLoading(false);
      if (response.status === ServiceResponseStatus.Success) {
        setMessage(
          `✅ DID identity created successfully! DID: ${response.payload.did}`,
        );
        setOpenSnackbar(true);
        navigate('/settings');
      } else {
        setMessage(`❗ Failed to create DID identity: ${response.payload}`);
        console.log('Error message:', response.payload);
        setOpenSnackbar(true);
      }
    };

    eventBus.on(DidEventChannel.CreateDidIdentity, handleDidCreated);

    // Cleanup on unmount
    return () => {
      eventBus.off(DidEventChannel.CreateDidIdentity, handleDidCreated);
    };
  }, [navigate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Check if all required fields are provided
    if (!method || !pin) {
      setMessage('❗ Please provide all required fields.');
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    // Pass the routingKey as an additional parameter if needed.
    didService.createDidIdentity(
      method,
      Number(pin),
      methodType === 'none' ? undefined : methodType,
      // routingKey,
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      justifyContent="center"
      height="100vh"
      sx={{ textAlign: 'center' }}
    >
      <Typography variant="h5" sx={{ color: '#4A4A4A', marginBottom: '16px' }}>
        Create DID Identity
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <FormControl fullWidth margin="normal">
          <InputLabel htmlFor="method">DID Method</InputLabel>
          <Select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as DIDMethodName)}
            label="DID Method"
            required
          >
            {Object.values(DIDMethodName).map((methodName) => (
              <MenuItem key={methodName} value={methodName}>
                {methodName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="PIN"
          type="number"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* New input for Routing Key */}
        {/* <TextField
          label="Routing Key"
          type="text"
          value={routingKey}
          onChange={(e) => setRoutingKey(e.target.value)}
          fullWidth
          margin="normal"
          // required
        /> */}

        <FormControl fullWidth margin="normal">
          <InputLabel htmlFor="methodType">Method Type</InputLabel>
          <Select
            id="methodType"
            value={methodType}
            onChange={(e) =>
              setMethodType(e.target.value as PeerGenerationMethod)
            }
            label="Method Type"
          >
            <MenuItem value="none">None</MenuItem>
            {Object.values(PeerGenerationMethod).map((methodTypeValue) => (
              <MenuItem key={methodTypeValue} value={methodTypeValue}>
                {methodTypeValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            padding: '12px',
            backgroundColor: '#0063F7',
            color: 'white',
            borderRadius: '8px',
            fontSize: isSmallScreen ? '14px' : '16px',
            '&:disabled': {
              backgroundColor: '#8A8A8A',
            },
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create DID'
          )}
        </Button>
      </form>

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

export default CreateDIDForm;
