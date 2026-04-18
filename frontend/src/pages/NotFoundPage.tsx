import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h1" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large">
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;






