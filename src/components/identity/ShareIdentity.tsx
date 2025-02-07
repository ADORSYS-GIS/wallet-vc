import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Identity } from '../../types/Identity';
import QRCodeDisplay from './IdentityQRCodeDisplay';
import IdentitySelector from './IdentitySelector';

interface ShareIdentityProps {
  identities: Identity[];
  onDidSelect: (did: string) => void;
  selectedDid: string | null;
}

const ShareIdentity: React.FC<ShareIdentityProps> = ({
  identities,
  onDidSelect,
  selectedDid,
}) => {
  const [localSelectedDid, setLocalSelectedDid] = useState<string | null>(
    selectedDid,
  );

  const handleSelectChange = (did: string) => {
    setLocalSelectedDid(did);
    onDidSelect(did);
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
        selectedDid={localSelectedDid}
        onChange={handleSelectChange}
      />
      {localSelectedDid && <QRCodeDisplay qrCode={localSelectedDid} />}
    </Box>
  );
};

export default ShareIdentity;
