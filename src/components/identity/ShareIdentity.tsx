import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Identity } from '../../types/Identity';
import QRCodeDisplay from './IdentityQRCodeDisplay';
import IdentitySelector from './IdentitySelector';

interface ShareIdentityProps {
  identities: Identity[];
}

const ShareIdentity: React.FC<ShareIdentityProps> = ({ identities }) => {
  const [selectedDid, setSelectedDid] = useState<string>('');

  const handleSelectChange = (did: string) => {
    setSelectedDid(did);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        justifyContent: 'center',
        alignContent: 'center',
        padding: '24px',
        bgcolor: '#F1F1F1',
        borderRadius: '10px',
        maxWidth: '400px',
        margin: '32px auto',
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
        Share Your Identity via QR Code
      </Typography>
      <IdentitySelector
        identities={identities}
        selectedDid={selectedDid}
        onChange={handleSelectChange}
      />
      {selectedDid && <QRCodeDisplay qrCode={selectedDid} />}
    </Box>
  );
};

export default ShareIdentity;
