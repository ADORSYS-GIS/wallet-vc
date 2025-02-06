import { Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

const SuccessPage = () => {
  const { state } = useLocation();
  const result = state?.result;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" color="primary">
        Mediation Coordination Success!
      </Typography>
      <Typography variant="body1" mt={2}>
        {result ? JSON.stringify(result, null, 2) : 'No additional data.'}
      </Typography>
    </Box>
  );
};

export default SuccessPage;
