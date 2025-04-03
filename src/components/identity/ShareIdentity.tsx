import { Box, Button, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
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

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleSelectChange = (did: string) => {
    setLocalSelectedDid(did);
    onDidSelect(did);
  };

  const handleDownloadQR = () => {
    if (localSelectedDid && qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg');
      if (svg) {
        try {
          // Get SVG data
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Define QR code size and frame width
          const qrSize = 256;
          const frameWidth = 50;
          const totalSize = qrSize + frameWidth * 2;

          // Set canvas size with frame
          canvas.width = totalSize;
          canvas.height = totalSize;

          if (ctx) {
            // Fill entire canvas with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const img = new Image();
          const svgBlob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
          });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
            if (ctx) {
              // Draw the QR code in the center of the canvas
              ctx.drawImage(img, frameWidth, frameWidth, qrSize, qrSize);
              const image = canvas.toDataURL('image/png');

              // Create download link
              const link = document.createElement('a');
              link.href = image;
              link.download = `QRCode-${localSelectedDid.substring(0, 8)}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Clean up
              URL.revokeObjectURL(url);
            }
          };

          img.src = url;
        } catch (error) {
          console.error('Error downloading QR code:', error);
        }
      } else {
        console.error('No SVG found in QRCodeDisplay');
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        justifyContent: 'center',
        alignContent: 'center',
        padding: '24px',
        bgcolor: 'f4f7fc',
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
      {localSelectedDid && (
        <>
          <div ref={qrCodeRef}>
            <QRCodeDisplay qrCode={localSelectedDid} />
          </div>
          <Button
            variant="contained"
            onClick={handleDownloadQR}
            sx={{
              marginTop: '16px',
              backgroundColor: '#6C6C6C',
              '&:hover': {
                backgroundColor: '#5A5A5A',
              },
            }}
          >
            Download QR Code
          </Button>
        </>
      )}
    </Box>
  );
};

export default ShareIdentity;
