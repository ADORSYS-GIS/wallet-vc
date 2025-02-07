import { Box, Typography } from '@mui/material';

const SuccessPage = () => {
  const resultString = sessionStorage.getItem('result');
  const result = resultString ? JSON.parse(resultString) : null;

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
          No additional data available.
        </Typography>
      )}
    </Box>
  );
};

export default SuccessPage;
