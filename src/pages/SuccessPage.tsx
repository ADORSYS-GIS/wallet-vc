import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" color="primary">
        {result ? 'Success!' : 'Failure'}
      </Typography>

      {result ? (
        <>
          <Typography variant="body1" mt={2} color="textSecondary">
            Acknowledgment received from the mediator.
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
