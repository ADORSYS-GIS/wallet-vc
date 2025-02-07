import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#F4F7FC',
        borderBottom: '2px solid #E1E1E1',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        height: '80px',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '80px',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#0063F7',
            fontWeight: 600,
            fontSize: { xs: '1.4rem', sm: '1.6rem' },
            textAlign: 'center',
          }}
        >
          Wallet-Example
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
