import { Avatar, Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

interface MainSectionProps {
  children?: ReactNode;
}

const MainSection: React.FC<MainSectionProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#F4F7FC',
        textAlign: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        flexGrow: 1,
        height: 'calc(100vh - 190px)',
        marginTop: '0',
        marginBottom: '0',
      }}
    >
      {children || (
        <>
          <Avatar
            alt="QR Code"
            src="/assets/qr-placeholder.webp"
            sx={{
              width: { xs: 140, sm: 180 },
              height: { xs: 140, sm: 180 },
              backgroundColor: '#FFFFFF',
              padding: '20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              marginBottom: '15px',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: '#4A4A4A',
              fontWeight: 500,
              marginTop: '10px',
              maxWidth: '400px',
              lineHeight: 1.5,
              letterSpacing: '0.5px',
              marginX: 'auto',
            }}
          >
            Scan the QR code to complete your Wallet setup.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default MainSection;
