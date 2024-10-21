import { Avatar } from '@mui/material';
import React from 'react';

const Wallet: React.FC = () => {
  return (
    <Avatar
    alt="QR Code"
    src="/wallet.png"
    sx={{
      width: { xs: 500, sm: 540 },
      height: { xs: 500, sm: 540 },
      padding: '20px',
      marginBottom: '15px',
    }}
  />
  );
};

export default Wallet;
