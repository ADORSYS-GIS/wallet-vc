import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface ProcessMediatorOOBResult {
  status: string;
  message: string;
}

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const result = (
    location.state as { result?: ProcessMediatorOOBResult } | null
  )?.result;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" color="primary">
        Mediation Coordination Success!
      </Typography>

      {result ? (
        <>
          <Typography variant="body1" mt={2} color="textSecondary">
            Status:{' '}
            <strong>{result.status === 'true' ? 'Success' : 'Failure'}</strong>
          </Typography>
          <Typography variant="body1" mt={1}>
            {result.message}
          </Typography>
        </>
      ) : (
        <Typography variant="body1" mt={2} color="error">
          No result data available.
        </Typography>
      )}
    </Box>
  );
};

export default SuccessPage;
