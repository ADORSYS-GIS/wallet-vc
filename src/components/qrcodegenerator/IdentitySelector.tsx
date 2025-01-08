import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { Identity } from '../../types/Identity';

interface IdentitySelectorProps {
  identities: Identity[];
  selectedDid: string;
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
        value={selectedDid}
        onChange={(event) => onChange(event.target.value)}
        displayEmpty
        sx={{
          bgcolor: '#FAFAFA',
          borderRadius: '8px',
          '& .MuiSelect-select': {
            padding: '12px',
          },
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {identities.map((identity, index) => (
          <MenuItem key={index} value={identity.did}>
            {identity.did}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default IdentitySelector;
