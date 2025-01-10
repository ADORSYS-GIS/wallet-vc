import { Box, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const Settings: React.FC = () => {
  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h5" sx={{ marginBottom: '16px', fontWeight: 700 }}>
        Settings
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <NavLink to="/share-identity" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Share Identity
          </Button>
        </NavLink>
        {/* Add other settings links or buttons here */}
      </Box>
    </Box>
  );
};

export default Settings;
