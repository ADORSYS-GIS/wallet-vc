import { Avatar, Box, Typography } from '@mui/material';
import React from 'react';

const Wallet: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      sx={{
        marginTop: -15,
      }}
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
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '0.9rem', sm: '1rem' },
          wordBreak: 'break-word',
          width: '90%',
          margin: '0 auto',
          color: '#333',
        }}
      >
        Welcome to your{' '}
        <Box component="span" sx={{ fontWeight: 'bold', color: '#007BFF' }}>
          Wallet
        </Box>
        . Here you can{' '}
        <Box component="span" sx={{ fontWeight: 'bold', color: '#007BFF' }}>
          securely manage
        </Box>{' '}
        your{' '}
        <Box component="span" sx={{ fontWeight: 'bold', color: '#007BFF' }}>
          digital assets
        </Box>{' '}
        and transactions, track your activities, and make secure payments.
      </Typography>
    </Box>
  );
};

export default Wallet;
