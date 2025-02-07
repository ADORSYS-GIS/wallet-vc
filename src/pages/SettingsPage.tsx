import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const Settings: React.FC = () => {
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        maxWidth: { xs: '100%', sm: 600, md: 800 },
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          marginTop: '20px',
        }}
      >
        Settings
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <NavLink to="/share-identity" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Share Identity
          </Button>
        </NavLink>
      </Box>

      {/* Logout Button */}
      <Box
        sx={{
          marginTop: 'auto',
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        <Button
          variant="text"
          color="primary"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            color: '#0063F7',
            fontWeight: 600,
            textTransform: 'none',
            marginTop: '-15px',
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Snackbar for logout success message */}
      <Snackbar
        open={logoutMessage}
        autoHideDuration={3000}
        onClose={() => setLogoutMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLogoutMessage(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Logout successful!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
