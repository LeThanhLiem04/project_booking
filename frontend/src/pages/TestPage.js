import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const TestPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Trang Test của bạn đã hiển thị!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Nếu bạn thấy trang này, điều đó có nghĩa là các thay đổi frontend của bạn đang hoạt động.
        </Typography>
      </Box>
    </Container>
  );
};

export default TestPage; 