import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { Identity } from '../../types/Identity';

interface IdentitySelectorProps {
  identities: Identity[];
  selectedDid: string | null;
  onChange: (did: string) => void;
}

const IdentitySelector: React.FC<IdentitySelectorProps> = ({
  identities,
  selectedDid,
  onChange,
}) => {
  return (
    <FormControl
      fullWidth
      sx={{
        bgcolor: '#FAFAFA',
        borderRadius: '8px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#CCCCCC',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#888888',
        },
        '& .MuiInputLabel-root': {
          background: '#FAFAFA',
          padding: '0 4px',
        },
      }}
    >
      <InputLabel>Select DID</InputLabel>
      <Select
        value={selectedDid || ''} // Fallback to empty string when null
        onChange={(event) => onChange(event.target.value)}
        displayEmpty
        sx={{
          bgcolor: '#FAFAFA',
          borderRadius: '8px',
          '& .MuiSelect-select': {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
          },
        }}
      >
        <MenuItem>
          <em>None</em>
        </MenuItem>
        {identities.map((identity, index) => (
          <MenuItem
            key={index}
            value={identity.did}
            sx={{
              bgcolor: '#FAFAFA',
              borderRadius: '8px',
              marginBottom: 1,
              maxWidth: '700px',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
            }}
          >
            {/* Truncate the DID to fit within available space */}
            <span
              style={{
                display: 'block',
                width: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {identity.did}
            </span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default IdentitySelector;
