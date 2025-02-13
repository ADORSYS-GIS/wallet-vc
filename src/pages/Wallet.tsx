import { Avatar, Typography, Box } from '@mui/material';
import React from 'react';

const Wallet: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
    >
      {/* Avatar */}
      <Avatar
        alt="QR Code"
        src="/assets/wallet.png"
        sx={{
          width: { xs: 300, sm: 340 },
          height: { xs: 300, sm: 340 },
        }}
      />

      {/* Welcome Message */}
      <Typography variant="body1" sx={{ marginTop: -3, fontSize: '1rem' }}>
        Welcome to your{' '}
        <Box component="span" sx={{ color: '#007BFF', fontWeight: 'bold' }}>
          Wallet
        </Box>
      </Typography>
    </Box>
  );
};

export default Wallet;
