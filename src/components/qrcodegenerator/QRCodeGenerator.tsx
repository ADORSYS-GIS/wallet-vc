import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Identity } from '../../types/Identity';
import IdentitySelector from './IdentitySelector';
import QRCodeDisplay from './QRCodeDisplay';

interface QRCodeGeneratorProps {
  identities: Identity[];
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ identities }) => {
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
        Generate QR Code
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

export default QRCodeGenerator;
