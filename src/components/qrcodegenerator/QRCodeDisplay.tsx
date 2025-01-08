import { Box, Typography } from '@mui/material';
import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        padding: '16px',
        alignContent: 'center',
        rowGap: 2,
        justifyContent: 'center',
        justifyItems: 'center',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        '& svg': {
          bgcolor: '#FAFAFA',
          '& path': {
            bgcolor: '#FAFAFA',
          },
        },
      }}
    >
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'center',
          color: '#6C6C6C',
        }}
      >
        Open your wallet and Scan the QR code to add a Contact
      </Typography>
      <Box>
        <QRCode
          size={256}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={qrCode}
          viewBox={`0 0 256 256`}
          fgColor="#000000"
        />
      </Box>
      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#CCCCCC' }}>
        Waiting For Wallet...
      </Typography>
    </Box>
  );
};

export default QRCodeDisplay;
