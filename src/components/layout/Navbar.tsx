import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#F4F7FC',
        borderBottom: '2px solid #E1E1E1',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#0063F7',
              fontWeight: 600,
              fontSize: { xs: '1.4rem', sm: '1.6rem' },
            }}
          >
            Wallet-Example
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
