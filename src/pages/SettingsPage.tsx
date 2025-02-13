import EventSharpIcon from '@mui/icons-material/EventSharp';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import { Alert, Box, IconButton, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Settings: React.FC = () => {
  const [logoutMessage, setLogoutMessage] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    setLogoutMessage(true);

    // Redirect to login page after logout
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
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
        padding: 2,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          marginBottom: 5,
          textAlign: 'center',
          color: '#333',
        }}
      >
        Settings
      </Typography>

      {/* Grid Layout for Icons */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {/* Share Identity Icon */}
        <NavLink to="/share-identity" style={{ textDecoration: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton sx={{ fontSize: 40, color: '#0063F7' }}>
              <ShareSharpIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Share Identity
            </Typography>
          </Box>
        </NavLink>

        {/* Activities Icon */}
        <NavLink to="/activities" style={{ textDecoration: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton sx={{ fontSize: 40, color: '#0063F7' }}>
              <EventSharpIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Activities
            </Typography>
          </Box>
        </NavLink>

        {/* Logout Icon */}
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            color="primary"
            onClick={handleLogout}
            sx={{
              fontSize: 40,
              color: '#0063F7',
              '&:hover': {
                backgroundColor: 'rgba(0, 99, 247, 0.1)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: '#333' }}>
            Logout
          </Typography>
        </Box>
      </Box>

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
          sx={{
            width: '100%',
            backgroundColor: '#0063F7',
            color: 'white',
            fontWeight: 600,
            padding: '10px',
            borderRadius: '5px',
            boxShadow: 2,
          }}
        >
          Logout successful!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
