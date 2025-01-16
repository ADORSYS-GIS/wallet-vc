import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar: React.FC = () => {
  const [logoutMessage, setLogoutMessage] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    setLogoutMessage(true);

    // Redirect to login page after logout
    setTimeout(() => {
      window.location.href = '/wallet';
    }, 1000); // 1000ms = 1s
  };

  return (
    <>
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
          {/* Left Side: Title */}
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

          {/* Right Side: Logout Button */}
          <Button
            variant="text"
            color="primary"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: '#0063F7',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Snackbar for logout success message */}
      <Snackbar
        open={logoutMessage}
        autoHideDuration={3000}
        onClose={() => setLogoutMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLogoutMessage(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Logout successful!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
