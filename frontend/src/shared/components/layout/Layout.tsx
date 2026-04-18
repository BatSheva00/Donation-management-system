import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          py: 3,
          outline: 'none',
          '&:focus': {
            outline: 'none',
          },
        }}
        role="main"
        aria-label="Main content"
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;


