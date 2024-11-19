import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import { FaCog, FaListAlt, FaQrcode, FaUser, FaWallet } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #E1E1E1',
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        bottom: 0,
        width: '100%',
      }}
    >
      <NavLink to="/wallet" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <FaWallet
              size={24}
              style={{
                color: isActive ? '#0063F7' : '#808080',
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                marginTop: '5px',
                fontWeight: 500,
                color: '#808080',
              }}
            >
              Wallet
            </Typography>
          </IconButton>
        )}
      </NavLink>

      <NavLink to="/contacts" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <FaUser
              size={24}
              style={{
                color: isActive ? '#0063F7' : '#808080',
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                marginTop: '5px',
                fontWeight: 500,
                color: '#808080',
              }}
            >
              Contacts
            </Typography>
          </IconButton>
        )}
      </NavLink>

      <NavLink to="/" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <FaQrcode
              size={24}
              style={{
                color: isActive ? '#0063F7' : '#808080',
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                marginTop: '5px',
                fontWeight: 500,
                color: '#808080',
              }}
            >
              QR Code
            </Typography>
          </IconButton>
        )}
      </NavLink>

      <NavLink to="/activities" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <FaListAlt
              size={24}
              style={{
                color: isActive ? '#0063F7' : '#808080',
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                marginTop: '5px',
                fontWeight: 500,
                color: '#808080',
              }}
            >
              Activities
            </Typography>
          </IconButton>
        )}
      </NavLink>

      <NavLink to="/settings" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <FaCog
              size={24}
              style={{
                color: isActive ? '#0063F7' : '#808080',
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                marginTop: '5px',
                fontWeight: 500,
                color: '#808080',
              }}
            >
              Settings
            </Typography>
          </IconButton>
        )}
      </NavLink>
    </Box>
  );
};

export default BottomNav;
